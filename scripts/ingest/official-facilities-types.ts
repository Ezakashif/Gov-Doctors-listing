export type OfficialFacilityRecord = {
  sourceRecordKey: string;
  name: string;
  facilityType: string;
  province: string;
  district: string;
  tehsil: string | null;
  city: string | null;
  address: string | null;
  officialPhone: string | null;
  verificationStatus: "verified" | "needs_review";
  sourceName: string;
  sourceUrl: string;
  sourceType: "government_page" | "government_pdf";
  authority: string;
  sourceDocumentDate: string | null;
  retrievedAt: string;
  notes: string;
};

export type OfficialFacilityDataset = {
  importBatch: string;
  retrievedAt: string;
  records: OfficialFacilityRecord[];
};
