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

export type ReviewEvent = {
  id: string;
  verificationType: string;
  outcome: string;
  checkedAt: string;
  evidence: Record<string, unknown>;
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
    isCurrentConfirmed: boolean;
    facilityId: string | null;
    facilityName: string | null;
    facilityType: string | null;
    facilityAddress: string | null;
    facilityPhone: string | null;
    facilityProvince: string | null;
    facilityDistrict: string | null;
    facilityTehsil: string | null;
    facilityVerificationStatus: FacilityVerificationStatus | null;
    facilitySourceUrl: string | null;
    facilityLastVerifiedAt: string | null;
    sourceName: string | null;
    sourceUrl: string | null;
    sourceDocumentDate: string | null;
    sourceRecordKey: string | null;
    sourceEvidence: Record<string, unknown>;
  } | null;
  candidates: PmdcCandidate[];
  decisions: PmdcReviewDecision[];
  verificationEvents: ReviewEvent[];
};

export const GOVERNMENT_REVIEW_ACTIONS = [
  "government_current_verified",
  "government_record_historical",
  "needs_current_verification",
] as const;

export type GovernmentReviewAction = (typeof GOVERNMENT_REVIEW_ACTIONS)[number];

export const FACILITY_REVIEW_ACTIONS = [
  "verified",
  "needs_review",
  "unverified",
] as const;

export type FacilityReviewAction = (typeof FACILITY_REVIEW_ACTIONS)[number];

export const HAJJ_REVIEW_ACTIONS = [
  "verified",
  "needs_confirmation",
  "not_verified",
] as const;

export type HajjReviewAction = (typeof HAJJ_REVIEW_ACTIONS)[number];

export type ApplyGovernmentDecisionInput = {
  doctorId: string;
  status: GovernmentReviewAction;
  reviewerLabel: string;
  notes: string;
};

export type ApplyFacilityDecisionInput = {
  doctorId: string;
  status: FacilityReviewAction;
  reviewerLabel: string;
  notes: string;
  address?: string | null;
  officialPhone?: string | null;
  sourceUrl?: string | null;
};

export type ApplyHajjDecisionInput = {
  doctorId: string;
  status: HajjReviewAction;
  reviewerLabel: string;
  notes: string;
  sourceUrl?: string | null;
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

export const isGovernmentReviewAction = (
  value: string,
): value is GovernmentReviewAction =>
  GOVERNMENT_REVIEW_ACTIONS.includes(value as GovernmentReviewAction);

export const isFacilityReviewAction = (
  value: string,
): value is FacilityReviewAction =>
  FACILITY_REVIEW_ACTIONS.includes(value as FacilityReviewAction);

export const isHajjReviewAction = (
  value: string,
): value is HajjReviewAction =>
  HAJJ_REVIEW_ACTIONS.includes(value as HajjReviewAction);

export const mapDecisionToEventOutcome = (
  decision: PmdcReviewDecisionName,
): PmdcReviewDecisionName => decision;
