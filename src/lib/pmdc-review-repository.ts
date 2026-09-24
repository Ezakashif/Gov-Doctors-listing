import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type AddPmdcCandidateInput,
  type ApplyFacilityDecisionInput,
  type ApplyGovernmentDecisionInput,
  type ApplyHajjDecisionInput,
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
  type ReviewEvent,
  MANUAL_REVIEW_METHOD,
  OFFICIAL_PMDC_SOURCE_NAME,
  OFFICIAL_PMDC_SOURCE_URL,
  isFacilityReviewAction,
  isGovernmentReviewAction,
  isHajjReviewAction,
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
  id: string;
  name: string;
  facility_type: string;
  address: string | null;
  official_phone: string | null;
  province: string | null;
  district: string | null;
  tehsil: string | null;
  verification_status: PmdcReviewQueueItem["facilityVerificationStatus"];
  address_source_url: string | null;
  last_verified_at: string | null;
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
  is_current_confirmed: boolean;
  source_record_key: string | null;
  source_evidence: Record<string, unknown> | null;
  facilities: FacilityEmbed | FacilityEmbed[] | null;
  sources: SourceEmbed | SourceEmbed[] | null;
};

type EventRow = {
  id: string;
  verification_type: string;
  outcome: string;
  checked_at: string;
  evidence: Record<string, unknown> | null;
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
    { data: eventData, error: eventError },
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
        "id,designation,government_employment_status,posting_as_of_date,is_current_confirmed,source_record_key,source_evidence,facilities(id,name,facility_type,address,official_phone,province,district,tehsil,verification_status,address_source_url,last_verified_at),sources(name,url,source_document_date)",
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
    supabase
      .from("verification_events")
      .select("id,verification_type,outcome,checked_at,evidence")
      .eq("doctor_id", doctorId)
      .order("checked_at", { ascending: false })
      .limit(20),
  ]);

  if (doctorError) throw doctorError;
  if (postingError) throw postingError;
  if (credentialError) throw credentialError;
  if (caseError) throw caseError;
  if (candidateError) throw candidateError;
  if (decisionError) throw decisionError;
  if (eventError) throw eventError;

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
          isCurrentConfirmed: posting.is_current_confirmed,
          facilityId: asOne(posting.facilities)?.id ?? null,
          facilityName: asOne(posting.facilities)?.name ?? null,
          facilityType: asOne(posting.facilities)?.facility_type ?? null,
          facilityAddress: asOne(posting.facilities)?.address ?? null,
          facilityPhone: asOne(posting.facilities)?.official_phone ?? null,
          facilityProvince: asOne(posting.facilities)?.province ?? null,
          facilityDistrict: asOne(posting.facilities)?.district ?? null,
          facilityTehsil: asOne(posting.facilities)?.tehsil ?? null,
          facilityVerificationStatus:
            asOne(posting.facilities)?.verification_status ?? null,
          facilitySourceUrl: asOne(posting.facilities)?.address_source_url ?? null,
          facilityLastVerifiedAt: asOne(posting.facilities)?.last_verified_at ?? null,
          sourceName: asOne(posting.sources)?.name ?? null,
          sourceUrl: asOne(posting.sources)?.url ?? null,
          sourceDocumentDate: asOne(posting.sources)?.source_document_date ?? null,
          sourceRecordKey: posting.source_record_key,
          sourceEvidence: posting.source_evidence ?? {},
        }
      : null,
    candidates: ((candidateData ?? []) as CandidateRow[]).map(toCandidate),
    decisions: ((decisionData ?? []) as DecisionRow[]).map(toDecision),
    verificationEvents: ((eventData ?? []) as EventRow[]).map((row) => ({
      id: row.id,
      verificationType: row.verification_type,
      outcome: row.outcome,
      checkedAt: row.checked_at,
      evidence: row.evidence ?? {},
    } satisfies ReviewEvent)),
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

const getPostingSourceId = async (
  supabase: SupabaseClient,
  postingId: string,
) => {
  const { data, error } = await supabase
    .from("doctor_postings")
    .select("source_id")
    .eq("id", postingId)
    .single();
  if (error) throw error;
  return requireData(
    (data as { source_id: string } | null)?.source_id ?? null,
    "Posting source is missing.",
  );
};

const requireReviewer = (label: string, notes: string) => {
  const reviewerLabel = label.trim();
  const trimmedNotes = notes.trim();
  if (!reviewerLabel) throw new Error("A reviewer label is required.");
  if (!trimmedNotes) throw new Error("Review notes are required.");
  return { reviewerLabel, notes: trimmedNotes };
};

export async function applyGovernmentDecision(
  supabase: SupabaseClient,
  input: ApplyGovernmentDecisionInput,
): Promise<PmdcReviewCaseDetail> {
  if (!isGovernmentReviewAction(input.status)) {
    throw new Error("Unsupported government review action.");
  }
  const { reviewerLabel, notes } = requireReviewer(
    input.reviewerLabel,
    input.notes,
  );
  const detail = await getPmdcReviewCase(supabase, input.doctorId);
  if (!detail.posting) {
    throw new Error("This doctor has no active government posting to review.");
  }

  const decidedAt = new Date().toISOString();
  const isCurrent = input.status === "government_current_verified";
  const { error: doctorError } = await supabase
    .from("doctors")
    .update({
      government_employment_status: input.status,
      updated_at: decidedAt,
    })
    .eq("id", input.doctorId);
  if (doctorError) throw doctorError;

  const { error: postingError } = await supabase
    .from("doctor_postings")
    .update({
      government_employment_status: input.status,
      is_current_confirmed: isCurrent,
      updated_at: decidedAt,
    })
    .eq("id", detail.posting.id);
  if (postingError) throw postingError;

  const { error: eventError } = await supabase.from("verification_events").insert({
    doctor_id: input.doctorId,
    posting_id: detail.posting.id,
    facility_id: detail.posting.facilityId,
    source_id: await getPostingSourceId(supabase, detail.posting.id),
    verification_type: "government_employment",
    outcome: isCurrent || input.status === "government_record_historical"
      ? "verified"
      : "needs_review",
    checked_at: decidedAt,
    evidence: {
      reviewerLabel,
      notes,
      status: input.status,
      publicationUnchanged: true,
      warning:
        "Does not publish the doctor or confirm Hajj attestation eligibility.",
    },
  });
  if (eventError) throw eventError;
  return getPmdcReviewCase(supabase, input.doctorId);
}

export async function applyFacilityDecision(
  supabase: SupabaseClient,
  input: ApplyFacilityDecisionInput,
): Promise<PmdcReviewCaseDetail> {
  if (!isFacilityReviewAction(input.status)) {
    throw new Error("Unsupported facility review action.");
  }
  const { reviewerLabel, notes } = requireReviewer(
    input.reviewerLabel,
    input.notes,
  );
  const detail = await getPmdcReviewCase(supabase, input.doctorId);
  if (!detail.posting?.facilityId) {
    throw new Error("This doctor has no facility to review.");
  }

  const address = blankToNull(input.address) ?? detail.posting.facilityAddress;
  const officialPhone =
    blankToNull(input.officialPhone) ?? detail.posting.facilityPhone;
  const sourceUrl =
    blankToNull(input.sourceUrl) ?? detail.posting.facilitySourceUrl;
  if (input.status === "verified" && !address) {
    throw new Error(
      "A facility cannot be marked verified without a sourced address.",
    );
  }
  if (input.status === "verified" && !sourceUrl) {
    throw new Error(
      "A facility cannot be marked verified without a source URL.",
    );
  }

  const decidedAt = new Date().toISOString();
  const { error: facilityError } = await supabase
    .from("facilities")
    .update({
      address,
      official_phone: officialPhone,
      address_source_url: sourceUrl,
      verification_status: input.status,
      last_verified_at: input.status === "verified" ? decidedAt : null,
      updated_at: decidedAt,
    })
    .eq("id", detail.posting.facilityId);
  if (facilityError) throw facilityError;

  const { error: eventError } = await supabase.from("verification_events").insert({
    doctor_id: input.doctorId,
    posting_id: detail.posting.id,
    facility_id: detail.posting.facilityId,
    source_id: await getPostingSourceId(supabase, detail.posting.id),
    verification_type: "facility_address",
    outcome: input.status === "verified" ? "verified" : "needs_review",
    checked_at: decidedAt,
    evidence: {
      reviewerLabel,
      notes,
      status: input.status,
      address,
      officialPhone,
      sourceUrl,
    },
  });
  if (eventError) throw eventError;
  return getPmdcReviewCase(supabase, input.doctorId);
}

export async function applyHajjDecision(
  supabase: SupabaseClient,
  input: ApplyHajjDecisionInput,
): Promise<PmdcReviewCaseDetail> {
  if (!isHajjReviewAction(input.status)) {
    throw new Error("Unsupported Hajj review action.");
  }
  const { reviewerLabel, notes } = requireReviewer(
    input.reviewerLabel,
    input.notes,
  );
  const detail = await getPmdcReviewCase(supabase, input.doctorId);
  const decidedAt = new Date().toISOString();
  const { error: doctorError } = await supabase
    .from("doctors")
    .update({
      hajj_attestation_status: input.status,
      updated_at: decidedAt,
    })
    .eq("id", input.doctorId);
  if (doctorError) throw doctorError;

  const sourceId = detail.posting
    ? await getPostingSourceId(supabase, detail.posting.id)
    : (await getOfficialPmdcSource(supabase)).id;
  const { error: eventError } = await supabase.from("verification_events").insert({
    doctor_id: input.doctorId,
    posting_id: detail.posting?.id ?? null,
    facility_id: detail.posting?.facilityId ?? null,
    source_id: sourceId,
    verification_type: "hajj_attestation",
    outcome: input.status,
    checked_at: decidedAt,
    evidence: {
      reviewerLabel,
      notes,
      sourceUrl: blankToNull(input.sourceUrl),
      publicationUnchanged: true,
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
