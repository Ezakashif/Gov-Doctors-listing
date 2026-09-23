export type KpPilotSource = {
  name: string;
  url: string;
  documentDate: string;
  authority: string;
};

export type KpPilotRawRecord = {
  serialNumber: number;
  name: string;
  fatherName: string;
  relationship: "S/O" | "D/O";
  dateOfBirth: string;
  domicile: string;
  governmentServiceEntryDate: string;
  recruitmentMethod: string;
  rawPosting: string;
  facilityName: string;
  district: string;
  remarks: string;
};

export type FacilityEvidence = {
  address: string | null;
  officialPhone: string | null;
  addressSourceUrl: string | null;
  verificationStatus: "verified" | "needs_review";
  facilityType: string;
  tehsil: string | null;
};

export type KpPilotRecord = KpPilotRawRecord & {
  sourceRecordKey: string;
  normalizedName: string;
  facilitySlug: string;
  citySlug: string;
  facility: FacilityEvidence;
};

export type KpPilotDataset = {
  source: KpPilotSource;
  records: KpPilotRawRecord[];
};
