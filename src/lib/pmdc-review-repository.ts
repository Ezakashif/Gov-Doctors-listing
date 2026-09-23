import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type AddPmdcCandidateInput,
  type ApplyPmdcDecisionInput,
  type GovernmentEmploymentStatus,
  type HajjAttestationStatus,
  type PmdcCandidate,
  type PmdcLicenseStatus,
  type PmdcReviewCaseDetail,
  type PmdcReviewCaseStatus,
  type PmdcReviewDecision,
  type PmdcReviewDecisionName,
  type PmdcReviewQueueItem,
  MANUAL_REVIEW_METHOD,
  OFFICIAL_PMDC_SOURCE_NAME,
  OFFICIAL_PMDC_SOURCE_URL,
  isPmdcReviewDecision,
  mapDecisionToEventOutcome,
} from "./pmdc-review";

type IdRow = { id: string };

type QueueRow = {
  doctor_id: string;
  full_name: string;
  father_name: string | null;
  qualification: string | null;
  designation: string;
  specialty: string;
  government_employment_status: GovernmentEmploymentStatus;
  hajj_attestation_status: HajjAttestationStatus;
  pmdc_review_status: PmdcReviewCaseStatus;
  pmdc_match_status: string | null;
  pmdc_status: string | null;
  pmdc_registration_number: string | null;
  facility_name: string | null;
  facility_verification_status: PmdcReviewQueueItem["facilityVerificationStatus"];
  source_name: string | null;
  source_document_date: string | null;
};

type DoctorRow = {
  id: string;
  full_name: string;
  father_name: string | null;
  qualification: string | null;
  designation: string;
  specialty: string;
  government_employment_status: GovernmentEmploymentStatus;
  hajj_attestation_status: HajjAttestationStatus;
  verification_status: string;
  publication_status: string;
};

type FacilityEmbed = {
  name: string;
  address: string | null;
  verification_status: PmdcReviewQueueItem["facilityVerificationStatus"];
};

type SourceEmbed = {
  name: string;
  url: string | null;
  source_document_date: string | null;
};

type PostingRow = {
  id: string;
  designation: string | null;
  government_employment_status: string;
  posting_as_of_date: string | null;
  source_record_key: string | null;
  source_evidence: Record<string, unknown> | null;
  facilities: FacilityEmbed | FacilityEmbed[] | null;
  sources: SourceEmbed | SourceEmbed[] | null;
};

const asOne = <T>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

type CredentialRow = {
  pmdc_registration_number: string;
  pmdc_status: PmdcLicenseStatus;
  pmdc_valid_until: string | null;
  match_status: string;
  verified_at: string | null;
};

type CaseRow = {
  doctor_id: string;
  status: PmdcReviewCaseStatus;
  latest_decision_id: string | null;
};

type CandidateRow = {
  id: string;
  doctor_id: string;
  source_id: string | null;
  registration_number: string | null;
  practitioner_name: string | null;
  father_name: string | null;
  qualification: string | null;
  medical_college: string | null;
  pmdc_status: PmdcLicenseStatus | null;
  valid_until: string | null;
  match_evidence: Record<string, unknown> | null;
  search_criteria: Record<string, unknown> | null;
  retrieved_at: string;
};

type DecisionRow = {
  id: string;
  doctor_id: string;
  candidate_id: string | null;
  decision: PmdcReviewDecisionName;
  reviewer_label: string;
  notes: string | null;
  decided_at: string;
  verification_method: string;
  source_id: string | null;
  source_name: string;
  source_url: string;
  source_document_date: string | null;
};

const requireData = <T>(data: T | null, message: string): T => {
  if (!data) throw new Error(message);
  return data;
};

const blankToNull = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const toCandidate = (row: CandidateRow): PmdcCandidate => ({
  id: row.id,
  doctorId: row.doctor_id,
  sourceId: row.source_id,
  registrationNumber: row.registration_number,
  practitionerName: row.practitioner_name,
  fatherName: row.father_name,
  qualification: row.qualification,
  medicalCollege: row.medical_college,
  pmdcStatus: row.pmdc_status,
  validUntil: row.valid_until,
  matchEvidence: row.match_evidence ?? {},
  searchCriteria: row.search_criteria ?? {},
  retrievedAt: row.retrieved_at,
  trusted: false,
});

const toDecision = (row: DecisionRow): PmdcReviewDecision => ({
  id: row.id,
  doctorId: row.doctor_id,
  candidateId: row.candidate_id,
  decision: row.decision,
  reviewerLabel: row.reviewer_label,
  notes: row.notes,
  decidedAt: row.decided_at,
  verificationMethod: row.verification_method,
  sourceId: row.source_id,
  sourceName: row.source_name,
  sourceUrl: row.source_url,
  sourceDocumentDate: row.source_document_date,
});

export async function getOfficialPmdcSource(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("sources")
    .select("id,name,url,source_document_date")
    .eq("name", OFFICIAL_PMDC_SOURCE_NAME)
    .single();
  if (error) throw error;
  return requireData(
    data as {
      id: string;
      name: string;
      url: string | null;
      source_document_date: string | null;
    } | null,
    "Official PMDC source is missing. Apply the PMDC review migration.",
  );
}

export async function openPendingPmdcReviewCases(supabase: SupabaseClient) {
  const [{ data: doctors, error: doctorError }, { data: cases, error: caseError }] =
    await Promise.all([
      supabase.from("doctors").select("id"),
      supabase.from("pmdc_review_cases").select("doctor_id"),
    ]);
  if (doctorError) throw doctorError;
  if (caseError) throw caseError;

  const existing = new Set(
    ((cases ?? []) as Array<{ doctor_id: string }>).map((row) => row.doctor_id),
  );
  const missing = ((doctors ?? []) as IdRow[])
    .filter((row) => !existing.has(row.id))
    .map((row) => ({
      doctor_id: row.id,
      status: "pending_review" as const,
    }));

  if (missing.length) {
    const { error } = await supabase.from("pmdc_review_cases").insert(missing);
    if (error) throw error;
  }

  return {
    doctorsSeen: (doctors ?? []).length,
    casesOpened: missing.length,
    casesExisting: existing.size,
  };
}

export async function listPmdcReviewQueue(
  supabase: SupabaseClient,
): Promise<PmdcReviewQueueItem[]> {
  const { data, error } = await supabase
    .from("doctor_review_queue")
    .select(
      "doctor_id,full_name,father_name,qualification,designation,specialty,government_employment_status,hajj_attestation_status,pmdc_review_status,pmdc_match_status,pmdc_status,pmdc_registration_number,facility_name,facility_verification_status,source_name,source_document_date",
    )
    .order("full_name");
  if (error) throw error;

  const deduped = new Map<string, PmdcReviewQueueItem>();
  for (const row of (data ?? []) as QueueRow[]) {
    if (deduped.has(row.doctor_id)) continue;
    deduped.set(row.doctor_id, {
      doctorId: row.doctor_id,
      fullName: row.full_name,
      fatherName: row.father_name,
      qualification: row.qualification,
      designation: row.designation,
      specialty: row.specialty,
      governmentEmploymentStatus: row.government_employment_status,
      hajjAttestationStatus: row.hajj_attestation_status,
      pmdcReviewStatus: row.pmdc_review_status,
      pmdcMatchStatus: row.pmdc_match_status,
      pmdcStatus: row.pmdc_status,
      trustedPmdcRegistrationNumber: row.pmdc_registration_number,
      facilityName: row.facility_name,
      facilityVerificationStatus: row.facility_verification_status,
      sourceName: row.source_name,
      sourceDocumentDate: row.source_document_date,
    });
  }

  return [...deduped.values()];
}

export async function getPmdcReviewCase(
  supabase: SupabaseClient,
  doctorId: string,
): Promise<PmdcReviewCaseDetail> {
  const [
    { data: doctorData, error: doctorError },
    { data: postingData, error: postingError },
    { data: credentialData, error: credentialError },
    { data: caseData, error: caseError },
    { data: candidateData, error: candidateError },
    { data: decisionData, error: decisionError },
  ] = await Promise.all([
    supabase
      .from("doctors")
      .select(
        "id,full_name,father_name,qualification,designation,specialty,government_employment_status,hajj_attestation_status,verification_status,publication_status",
      )
      .eq("id", doctorId)
      .maybeSingle(),
    supabase
      .from("doctor_postings")
      .select(
        "id,designation,government_employment_status,posting_as_of_date,source_record_key,source_evidence,facilities(name,address,verification_status),sources(name,url,source_document_date)",
      )
      .eq("doctor_id", doctorId)
      .eq("active", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("doctor_credentials")
      .select(
        "pmdc_registration_number,pmdc_status,pmdc_valid_until,match_status,verified_at",
      )
      .eq("doctor_id", doctorId)
      .maybeSingle(),
    supabase
      .from("pmdc_review_cases")
      .select("doctor_id,status,latest_decision_id")
      .eq("doctor_id", doctorId)
      .maybeSingle(),
    supabase
      .from("pmdc_candidates")
      .select(
        "id,doctor_id,source_id,registration_number,practitioner_name,father_name,qualification,medical_college,pmdc_status,valid_until,match_evidence,search_criteria,retrieved_at",
      )
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false }),
    supabase
      .from("pmdc_review_decisions")
      .select(
        "id,doctor_id,candidate_id,decision,reviewer_label,notes,decided_at,verification_method,source_id,source_name,source_url,source_document_date",
      )
      .eq("doctor_id", doctorId)
      .order("decided_at", { ascending: false }),
  ]);

  if (doctorError) throw doctorError;
  if (postingError) throw postingError;
  if (credentialError) throw credentialError;
  if (caseError) throw caseError;
  if (candidateError) throw candidateError;
  if (decisionError) throw decisionError;

  const doctor = requireData(
    doctorData as DoctorRow | null,
    "Doctor was not found.",
  );
  const posting = postingData as PostingRow | null;
  const credential = credentialData as CredentialRow | null;
  const reviewCase = caseData as CaseRow | null;

  return {
    doctorId: doctor.id,
    fullName: doctor.full_name,
    fatherName: doctor.father_name,
    qualification: doctor.qualification,
    designation: doctor.designation,
    specialty: doctor.specialty,
    governmentEmploymentStatus: doctor.government_employment_status,
    hajjAttestationStatus: doctor.hajj_attestation_status,
    overallVerificationStatus: doctor.verification_status,
    publicationStatus: doctor.publication_status,
    pmdcReviewStatus: reviewCase?.status ?? "pending_review",
    trustedCredential: credential
      ? {
          registrationNumber: credential.pmdc_registration_number,
          status: credential.pmdc_status,
          validUntil: credential.pmdc_valid_until,
          matchStatus: credential.match_status,
          verifiedAt: credential.verified_at,
        }
      : null,
    posting: posting
      ? {
          id: posting.id,
          designation: posting.designation,
          status: posting.government_employment_status,
          asOfDate: posting.posting_as_of_date,
          facilityName: asOne(posting.facilities)?.name ?? null,
          facilityAddress: asOne(posting.facilities)?.address ?? null,
          facilityVerificationStatus:
            asOne(posting.facilities)?.verification_status ?? null,
          sourceName: asOne(posting.sources)?.name ?? null,
          sourceUrl: asOne(posting.sources)?.url ?? null,
          sourceDocumentDate: asOne(posting.sources)?.source_document_date ?? null,
          sourceRecordKey: posting.source_record_key,
          sourceEvidence: posting.source_evidence ?? {},
        }
      : null,
    candidates: ((candidateData ?? []) as CandidateRow[]).map(toCandidate),
    decisions: ((decisionData ?? []) as DecisionRow[]).map(toDecision),
  };
}

export async function addPmdcCandidate(
  supabase: SupabaseClient,
  doctorId: string,
  input: AddPmdcCandidateInput,
): Promise<PmdcCandidate> {
  const source = await getOfficialPmdcSource(supabase);
  const registrationNumber = blankToNull(input.registrationNumber);

  const { data, error } = await supabase
    .from("pmdc_candidates")
    .insert({
      doctor_id: doctorId,
      source_id: source.id,
      registration_number: registrationNumber,
      practitioner_name: blankToNull(input.practitionerName),
      father_name: blankToNull(input.fatherName),
      qualification: blankToNull(input.qualification),
      medical_college: blankToNull(input.medicalCollege),
      pmdc_status: input.pmdcStatus ?? null,
      valid_until: blankToNull(input.validUntil),
      match_evidence: input.matchEvidence ?? {},
      search_criteria: {
        ...(input.searchCriteria ?? {}),
        recordedFrom: blankToNull(input.sourceUrl) ?? OFFICIAL_PMDC_SOURCE_URL,
      },
      retrieved_at: new Date().toISOString(),
    })
    .select(
      "id,doctor_id,source_id,registration_number,practitioner_name,father_name,qualification,medical_college,pmdc_status,valid_until,match_evidence,search_criteria,retrieved_at",
    )
    .single();
  if (error) throw error;

  return toCandidate(
    requireData(data as CandidateRow | null, "Candidate insert returned no row."),
  );
}

export async function applyPmdcDecision(
  supabase: SupabaseClient,
  input: ApplyPmdcDecisionInput,
): Promise<PmdcReviewCaseDetail> {
  if (!isPmdcReviewDecision(input.decision)) {
    throw new Error("Unsupported PMDC review decision.");
  }

  const reviewerLabel = input.reviewerLabel.trim();
  if (!reviewerLabel) {
    throw new Error("A reviewer label is required.");
  }

  const source = await getOfficialPmdcSource(supabase);
  const detail = await getPmdcReviewCase(supabase, input.doctorId);
  const candidate = input.candidateId
    ? detail.candidates.find((item) => item.id === input.candidateId) ?? null
    : null;

  if (input.candidateId && !candidate) {
    throw new Error("The selected PMDC candidate was not found for this doctor.");
  }

  if (input.decision === "verified") {
    if (!candidate) {
      throw new Error(
        "A verified decision requires an explicitly selected candidate result.",
      );
    }
    if (!candidate.registrationNumber) {
      throw new Error(
        "A verified decision requires a candidate with an official PMDC registration number.",
      );
    }
    if (!candidate.pmdcStatus) {
      throw new Error(
        "A verified decision requires the official PMDC license status from the candidate result.",
      );
    }
  }

  const decidedAt = new Date().toISOString();
  const { data: decisionData, error: decisionError } = await supabase
    .from("pmdc_review_decisions")
    .insert({
      doctor_id: input.doctorId,
      candidate_id: candidate?.id ?? null,
      decision: input.decision,
      reviewer_label: reviewerLabel,
      notes: blankToNull(input.notes),
      decided_at: decidedAt,
      verification_method: input.verificationMethod?.trim() || MANUAL_REVIEW_METHOD,
      source_id: source.id,
      source_name: source.name,
      source_url: source.url ?? OFFICIAL_PMDC_SOURCE_URL,
      source_document_date: source.source_document_date,
      evidence: {
        governmentEmploymentStatus: detail.governmentEmploymentStatus,
        hajjAttestationStatus: detail.hajjAttestationStatus,
        facilityVerificationStatus:
          detail.posting?.facilityVerificationStatus ?? null,
        candidateSnapshot: candidate,
        trustedFieldsWritten: input.decision === "verified",
      },
    })
    .select(
      "id,doctor_id,candidate_id,decision,reviewer_label,notes,decided_at,verification_method,source_id,source_name,source_url,source_document_date",
    )
    .single();
  if (decisionError) throw decisionError;
  const decision = requireData(
    decisionData as DecisionRow | null,
    "Decision insert returned no row.",
  );

  const { error: caseError } = await supabase.from("pmdc_review_cases").upsert(
    {
      doctor_id: input.doctorId,
      status: input.decision,
      latest_decision_id: decision.id,
      updated_at: decidedAt,
    },
    { onConflict: "doctor_id" },
  );
  if (caseError) throw caseError;

  if (input.decision === "verified" && candidate?.registrationNumber) {
    const { error: credentialError } = await supabase
      .from("doctor_credentials")
      .upsert(
        {
          doctor_id: input.doctorId,
          pmdc_registration_number: candidate.registrationNumber,
          pmdc_status: candidate.pmdcStatus,
          pmdc_valid_until: candidate.validUntil,
          match_status: "matched",
          qualification: candidate.qualification,
          verified_at: decidedAt,
          source_id: source.id,
          source_evidence: {
            decisionId: decision.id,
            candidateId: candidate.id,
            reviewerLabel,
            verificationMethod:
              input.verificationMethod?.trim() || MANUAL_REVIEW_METHOD,
            sourceName: source.name,
            sourceUrl: source.url ?? OFFICIAL_PMDC_SOURCE_URL,
          },
          updated_at: decidedAt,
        },
        { onConflict: "doctor_id" },
      );
    if (credentialError) throw credentialError;
  } else if (detail.trustedCredential) {
    const { error: credentialError } = await supabase
      .from("doctor_credentials")
      .update({
        match_status: input.decision,
        updated_at: decidedAt,
      })
      .eq("doctor_id", input.doctorId);
    if (credentialError) throw credentialError;
  }

  const { data: posting } = await supabase
    .from("doctor_postings")
    .select("id")
    .eq("doctor_id", input.doctorId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  const { error: eventError } = await supabase.from("verification_events").insert({
    doctor_id: input.doctorId,
    posting_id: (posting as IdRow | null)?.id ?? null,
    source_id: source.id,
    verification_type: "pmdc",
    outcome: mapDecisionToEventOutcome(input.decision),
    checked_at: decidedAt,
    evidence: {
      decisionId: decision.id,
      reviewerLabel,
      verificationMethod: input.verificationMethod?.trim() || MANUAL_REVIEW_METHOD,
      candidateId: candidate?.id ?? null,
      notes: blankToNull(input.notes),
    },
  });
  if (eventError) throw eventError;

  return getPmdcReviewCase(supabase, input.doctorId);
}

export async function summarizePmdcReview(supabase: SupabaseClient) {
  const queue = await listPmdcReviewQueue(supabase);
  const { count: publicRecords, error: publicError } = await supabase
    .from("public_doctor_directory")
    .select("*", { count: "exact", head: true });
  if (publicError) throw publicError;

  const { count: trustedCredentials, error: credentialError } = await supabase
    .from("doctor_credentials")
    .select("*", { count: "exact", head: true })
    .eq("match_status", "matched");
  if (credentialError) throw credentialError;

  const counts = queue.reduce(
    (summary, item) => {
      summary[item.pmdcReviewStatus] += 1;
      return summary;
    },
    {
      pending_review: 0,
      verified: 0,
      unmatched: 0,
      ambiguous: 0,
      needs_more_information: 0,
      rejected: 0,
    } as Record<PmdcReviewCaseStatus, number>,
  );

  return {
    doctorsInReview: queue.length,
    pmdcStatusCounts: counts,
    trustedPmdcMatches: trustedCredentials ?? 0,
    publicRecords: publicRecords ?? 0,
    governmentCurrentVerified: queue.filter(
      (item) => item.governmentEmploymentStatus === "government_current_verified",
    ).length,
    governmentHistorical: queue.filter(
      (item) => item.governmentEmploymentStatus === "government_record_historical",
    ).length,
  };
}
