export type PublicFacility = {
  id: string;
  name: string;
  facilityType: string;
  province: string;
  district: string | null;
  tehsil: string | null;
  city: string;
  address: string;
  officialPhone: string | null;
  verificationStatus: "verified";
  lastVerifiedAt: string | null;
  sourceName: string | null;
  sourceUrl: string;
  sourceDocumentDate: string | null;
};

export type PublicFacilityDoctor = {
  id: string;
  name: string;
  designation: string;
  specialty: string;
  pmdcRegistrationNumber?: string;
  pmdcStatus?: "valid";
  lastVerifiedAt: string;
};

export type FacilityDirectoryResponse = {
  facilities: PublicFacility[];
  mode: "database" | "sample";
  updatedAt: string;
};

export type FacilityDetailResponse = {
  facility: PublicFacility;
  doctors: PublicFacilityDoctor[];
  mode: "database" | "sample";
};

export type PublicFacilityRow = {
  id: string;
  name: string;
  facility_type: string;
  province: string | null;
  district: string | null;
  tehsil: string | null;
  city: string | null;
  address: string;
  official_phone: string | null;
  verification_status: "verified";
  last_verified_at: string | null;
  source_name: string | null;
  source_url: string;
  source_document_date: string | null;
};

export const toPublicFacility = (row: PublicFacilityRow): PublicFacility => ({
  id: row.id,
  name: row.name,
  facilityType: row.facility_type,
  province: row.province ?? "Unknown",
  district: row.district,
  tehsil: row.tehsil,
  city: row.city ?? row.district ?? row.tehsil ?? "Location pending",
  address: row.address,
  officialPhone: row.official_phone,
  verificationStatus: "verified",
  lastVerifiedAt: row.last_verified_at,
  sourceName: row.source_name,
  sourceUrl: row.source_url,
  sourceDocumentDate: row.source_document_date,
});

export const sampleFacilities: PublicFacility[] = [
  {
    id: "sample-facility-islamabad",
    name: "Pakistan Institute of Medical Sciences",
    facilityType: "Federal government hospital",
    province: "Islamabad Capital Territory",
    district: "Islamabad",
    tehsil: "Islamabad",
    city: "Islamabad",
    address: "Ibn-e-Sina Road, G-8/3, Islamabad",
    officialPhone: "051 9261170",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-09-20T10:00:00.000Z",
    sourceName: "Demonstration record",
    sourceUrl: "",
    sourceDocumentDate: null,
  },
  {
    id: "sample-facility-peshawar",
    name: "Lady Reading Hospital",
    facilityType: "Government teaching hospital",
    province: "Khyber Pakhtunkhwa",
    district: "Peshawar",
    tehsil: "Peshawar",
    city: "Peshawar",
    address: "Behind Qila Balahisar, Peshawar City, Khyber Pakhtunkhwa",
    officialPhone: "091 9211430",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-09-17T13:45:00.000Z",
    sourceName: "Demonstration record",
    sourceUrl: "",
    sourceDocumentDate: null,
  },
];
