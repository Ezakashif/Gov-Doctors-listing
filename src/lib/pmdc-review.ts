export const OFFICIAL_PMDC_SOURCE_NAME =
  "PM&DC Practitioner Register — public search";

export const OFFICIAL_PMDC_SOURCE_URL = "https://pmdc.pk/";

export const OFFICIAL_PMDC_AUTHORITY = "Pakistan Medical and Dental Council";

export const MANUAL_REVIEW_METHOD = "manual_official_register_review";

export const PMDC_REVIEW_DECISIONS = [
  "verified",
  "unmatched",
  "ambiguous",
  "needs_more_information",
  "rejected",
] as const;

export type PmdcReviewDecisionName = (typeof PMDC_REVIEW_DECISIONS)[number];

export type PmdcReviewCaseStatus = "pending_review" | PmdcReviewDecisionName;

export type PmdcLicenseStatus = "valid" | "expired" | "suspended" | "unknown";

export type GovernmentEmploymentStatus =
  | "government_record_historical"
  | "government_current_verified"
  | "needs_current_verification"
  | "not_government";

export type FacilityVerificationStatus =
  | "verified"
  | "needs_review"
  | "unverified";

export type HajjAttestationStatus =
  | "verified"
  | "likely"
  | "needs_confirmation"
  | "not_verified";

export type PmdcReviewQueueItem = {
  doctorId: string;
  fullName: string;
  fatherName: string | null;
  qualification: string | null;
  designation: string;
  specialty: string;
  governmentEmploymentStatus: GovernmentEmploymentStatus;
  hajjAttestationStatus: HajjAttestationStatus;
  pmdcReviewStatus: PmdcReviewCaseStatus;
  pmdcMatchStatus: string | null;
  pmdcStatus: string | null;
  trustedPmdcRegistrationNumber: string | null;
  facilityName: string | null;
  facilityVerificationStatus: FacilityVerificationStatus | null;
  sourceName: string | null;
  sourceDocumentDate: string | null;
};

export type PmdcCandidate = {
  id: string;
  doctorId: string;
  sourceId: string | null;
  registrationNumber: string | null;
  practitionerName: string | null;
  fatherName: string | null;
  qualification: string | null;
  medicalCollege: string | null;
  pmdcStatus: PmdcLicenseStatus | null;
  validUntil: string | null;
  matchEvidence: Record<string, unknown>;
  searchCriteria: Record<string, unknown>;
  retrievedAt: string;
  trusted: false;
};

export type PmdcReviewDecision = {
  id: string;
  doctorId: string;
  candidateId: string | null;
  decision: PmdcReviewDecisionName;
  reviewerLabel: string;
  notes: string | null;
  decidedAt: string;
  verificationMethod: string;
  sourceId: string | null;
  sourceName: string;
  sourceUrl: string;
  sourceDocumentDate: string | null;
};

export type PmdcReviewCaseDetail = {
  doctorId: string;
  fullName: string;
  fatherName: string | null;
  qualification: string | null;
  designation: string;
  specialty: string;
  governmentEmploymentStatus: GovernmentEmploymentStatus;
  hajjAttestationStatus: HajjAttestationStatus;
  overallVerificationStatus: string;
  publicationStatus: string;
  pmdcReviewStatus: PmdcReviewCaseStatus;
  trustedCredential: {
    registrationNumber: string;
    status: PmdcLicenseStatus;
    validUntil: string | null;
    matchStatus: string;
    verifiedAt: string | null;
  } | null;
  posting: {
    id: string;
    designation: string | null;
    status: string;
    asOfDate: string | null;
    facilityName: string | null;
    facilityAddress: string | null;
    facilityVerificationStatus: FacilityVerificationStatus | null;
    sourceName: string | null;
    sourceUrl: string | null;
    sourceDocumentDate: string | null;
    sourceRecordKey: string | null;
    sourceEvidence: Record<string, unknown>;
  } | null;
  candidates: PmdcCandidate[];
  decisions: PmdcReviewDecision[];
};

export type AddPmdcCandidateInput = {
  registrationNumber?: string | null;
  practitionerName?: string | null;
  fatherName?: string | null;
  qualification?: string | null;
  medicalCollege?: string | null;
  pmdcStatus?: PmdcLicenseStatus | null;
  validUntil?: string | null;
  matchEvidence?: Record<string, unknown>;
  searchCriteria?: Record<string, unknown>;
  sourceUrl?: string | null;
};

export type ApplyPmdcDecisionInput = {
  doctorId: string;
  decision: PmdcReviewDecisionName;
  reviewerLabel: string;
  notes?: string | null;
  candidateId?: string | null;
  verificationMethod?: string;
};

export const isPmdcReviewDecision = (
  value: string,
): value is PmdcReviewDecisionName =>
  PMDC_REVIEW_DECISIONS.includes(value as PmdcReviewDecisionName);

export const mapDecisionToEventOutcome = (
  decision: PmdcReviewDecisionName,
): PmdcReviewDecisionName => decision;
