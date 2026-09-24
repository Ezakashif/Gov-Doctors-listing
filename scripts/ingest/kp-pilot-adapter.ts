import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  FacilityEvidence,
  KpPilotDataset,
  KpPilotRecord,
  KpPilotSource,
} from "./kp-pilot-types";

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeName = (value: string) =>
  value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();

const needsReview = (
  facilityType = "Government health facility",
  tehsil: string | null = null,
): FacilityEvidence => ({
  address: null,
  officialPhone: null,
  addressSourceUrl: null,
  verificationStatus: "needs_review",
  facilityType,
  tehsil,
});

const facilityEvidence: Record<string, FacilityEvidence> = {
  "Khyber Teaching Hospital": {
    address: "University Road, University Town, Peshawar, Khyber Pakhtunkhwa",
    officialPhone: "+92 91 9224400",
    addressSourceUrl: "https://kth.edu.pk/contact-us/",
    verificationStatus: "verified",
    facilityType: "Government teaching hospital",
    tehsil: "Peshawar",
  },
  "Lady Reading Hospital": {
    address: "Behind Qila Balahisar, Peshawar City, Khyber Pakhtunkhwa",
    officialPhone: "091-9211430",
    addressSourceUrl: "https://lady.reading.lrh.edu.pk/",
    verificationStatus: "verified",
    facilityType: "Government teaching hospital",
    tehsil: "Peshawar",
  },
  "Hayatabad Medical Complex": {
    address: "Phase 4, Hayatabad, Peshawar, Khyber Pakhtunkhwa",
    officialPhone: "091-9217140-47",
    addressSourceUrl: "https://www.hmckp.gov.pk/Contact",
    verificationStatus: "verified",
    facilityType: "Government teaching hospital",
    tehsil: "Peshawar",
  },
  "Khyber Medical College": {
    address: "University of Peshawar Campus, University Road, Peshawar, Khyber Pakhtunkhwa",
    officialPhone: "+92 91 9221384-88",
    addressSourceUrl: "https://kmc.edu.pk/contact-us-2/",
    verificationStatus: "verified",
    facilityType: "Government medical college",
    tehsil: "Peshawar",
  },
  "Saidu Group of Teaching Hospitals": {
    address: "Saidu Sharif, Swat, Khyber Pakhtunkhwa",
    officialPhone: null,
    addressSourceUrl: "https://www.healthkp.gov.pk/public/uploads/downloads-470.pdf",
    verificationStatus: "verified",
    facilityType: "Government teaching hospital",
    tehsil: "Babuzai",
  },
  "Gomal Medical College": {
    address: "Dera Ismail Khan, Khyber Pakhtunkhwa",
    officialPhone: "0966-747373",
    addressSourceUrl: "https://www.gmcdikhan.edu.pk/",
    verificationStatus: "verified",
    facilityType: "Government medical college",
    tehsil: "Dera Ismail Khan",
  },
  "DHQ Hospital Abbottabad": needsReview(
    "Government district headquarters hospital",
    "Abbottabad",
  ),
  "District Health Office Mardan": needsReview("District health office", "Mardan"),
  "District Health Office Peshawar": needsReview("District health office", "Peshawar"),
  "District Health Office Karak": needsReview("District health office", "Karak"),
  "District Health Office Wana": needsReview("District health office", "Wana"),
  "Type-D Hospital Sarai Niamat Khan": needsReview("Government Type-D hospital", "Haripur"),
  "DHQ Hospital Haripur": needsReview("Government district headquarters hospital", "Haripur"),
  "Mufti Mehmood Memorial Teaching Hospital": {
    address: "Opposite New Dera Township, Draban Road, Dera Ismail Khan, Khyber Pakhtunkhwa",
    officialPhone: "0966-747152",
    addressSourceUrl: "https://phsa.edu.pk/son-d-i-khan/",
    verificationStatus: "verified",
    facilityType: "Government teaching hospital",
    tehsil: "Dera Ismail Khan",
  },
  "BHU Jail Kohistan": needsReview("Basic health unit"),
  "DHQ Hospital Ghallanai": needsReview("Government district headquarters hospital", "Ghallanai"),
  "RHC Ekka Ghund": needsReview("Rural health centre", "Ekka Ghund"),
  "QATHA Nowshera": needsReview("Unresolved facility name", "Nowshera"),
  "Swat Medical College": needsReview("Government medical college"),
  "Koklian Piran": needsReview("Unresolved facility name"),
  "DHQ Hospital Batkhela": needsReview("Government district headquarters hospital", "Batkhela"),
  "BHU Jando Khel": {
    address: "Jhando Khel, Bannu, Khyber Pakhtunkhwa",
    officialPhone: null,
    addressSourceUrl: "https://bannu.kp.gov.pk/page/basic_health_unit_bhus",
    verificationStatus: "verified",
    facilityType: "Basic health unit",
    tehsil: "Bannu",
  },
};

export class KpSeniorityPilotAdapter {
  readonly name = "kp-mo-bs17-2024-pilot";
  private dataset: KpPilotDataset | null = null;

  private async load() {
    if (this.dataset) return this.dataset;
    const filePath = path.join(
      process.cwd(),
      "data",
      "imports",
      "kp-mo-bs17-2024-pilot.json",
    );
    this.dataset = JSON.parse(await readFile(filePath, "utf8")) as KpPilotDataset;
    return this.dataset;
  }

  async source(): Promise<KpPilotSource> {
    return (await this.load()).source;
  }

  async fetch(): Promise<KpPilotRecord[]> {
    const dataset = await this.load();
    return dataset.records.map((record) => ({
      ...record,
      sourceRecordKey: `kp-mo-bs17-2024-${String(record.serialNumber).padStart(4, "0")}`,
      normalizedName: normalizeName(record.name),
      facilitySlug: `${slugify(record.facilityName)}-${slugify(record.district)}`,
      citySlug: slugify(record.district),
      facility:
        facilityEvidence[record.facilityName] ??
        needsReview("Government health facility"),
    }));
  }
}
