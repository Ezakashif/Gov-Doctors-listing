export type RawDoctorRecord = {
  sourceRecordKey: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: "government_api" | "government_page" | "government_pdf" | "fixture";
  fullName: string;
  designation: string;
  specialty: string;
  pmdcRegistrationNumber: string;
  pmdcStatus: "valid" | "expired" | "suspended" | "unknown";
  facilityName: string;
  facilityType: string;
  facilityAddress: string;
  officialPhone: string;
  city: string;
  province: string;
  governmentEmploymentVerified: boolean;
  governmentVerifiedAt: string;
  pmdcVerifiedAt: string;
  facilityVerifiedAt: string;
  availabilityNote?: string;
};

export type NormalizedDoctorRecord = RawDoctorRecord & {
  normalizedName: string;
  citySlug: string;
  facilitySlug: string;
  publishable: boolean;
  rejectionReasons: string[];
  staleAfter: string;
};

export interface SourceAdapter {
  readonly name: string;
  fetch(): Promise<RawDoctorRecord[]>;
}

export type IngestionSummary = {
  adapter: string;
  recordsSeen: number;
  recordsPublishable: number;
  recordsRejected: number;
  cities: string[];
};
