import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { curatedOfficialFacilities } from "./official-facilities-extras";
import {
  IMPORT_BATCH,
  RETRIEVED_AT,
  normalizeKey,
  parseOfficialTable,
  toOfficialFacility,
} from "./official-facilities-lib";
import type { OfficialFacilityDataset, OfficialFacilityRecord } from "./official-facilities-types";

const PUNJAB_FILES = [
  {
    file: "punjab-dhq.xls",
    facilityType: "Government district headquarters hospital",
    sourceUrl: "https://pshealthpunjab.gov.pk/Home/ExportToExcelDHQ",
    pageUrl: "https://pshealthpunjab.gov.pk/Home/DHQ",
  },
  {
    file: "punjab-thq.xls",
    facilityType: "Government tehsil headquarters hospital",
    sourceUrl: "https://pshealthpunjab.gov.pk/Home/ExportToExcelTHQ",
    pageUrl: "https://pshealthpunjab.gov.pk/Home/THQ",
  },
  {
    file: "punjab-rhc.xls",
    facilityType: "Rural health centre",
    sourceUrl: "https://pshealthpunjab.gov.pk/Home/ExportToExcelRHC",
    pageUrl: "https://pshealthpunjab.gov.pk/Home/RHC",
  },
  {
    file: "punjab-bhu.xls",
    facilityType: "Basic health unit",
    sourceUrl: "https://pshealthpunjab.gov.pk/Home/ExportToExcelBHU",
    pageUrl: "https://pshealthpunjab.gov.pk/Home/BHU",
  },
  {
    file: "punjab-mnh.xls",
    facilityType: "Maryam Nawaz Hospital",
    sourceUrl: "https://pshealthpunjab.gov.pk/Home/ExportToExcelMNH",
    pageUrl: "https://pshealthpunjab.gov.pk/Home/MNH",
  },
  {
    file: "punjab-mnhc.xls",
    facilityType: "Maryam Nawaz Health Clinic",
    sourceUrl: "https://pshealthpunjab.gov.pk/Home/ExportToExcelMNHC",
    pageUrl: "https://pshealthpunjab.gov.pk/Home/MNHC",
  },
] as const;

const identityKey = (record: OfficialFacilityRecord) =>
  `${normalizeKey(record.province)}|${normalizeKey(record.district)}|${normalizeKey(record.name)}`;

async function run() {
  const rawDir = path.join(process.cwd(), "data", "imports", "official-raw");
  const records: OfficialFacilityRecord[] = [];

  for (const source of PUNJAB_FILES) {
    const html = await readFile(path.join(rawDir, source.file), "utf8");
    if (html.includes("Page Not Found")) {
      throw new Error(`Official export missing or 404: ${source.file}`);
    }
    const rows = parseOfficialTable(html);
    for (const row of rows) {
      const record = toOfficialFacility({
        name: row.fullname ?? row.name ?? "",
        facilityType: source.facilityType,
        province: "Punjab",
        district: row.districtname ?? row.district ?? "",
        tehsil: row.tehsilname ?? null,
        city: row.tehsilname || row.districtname || null,
        address: row.address || null,
        officialPhone: row.phoneno || null,
        sourceName: "Punjab Health and Population Department facility directory",
        sourceUrl: source.sourceUrl,
        sourceType: "government_page",
        authority: "Health and Population Department, Government of the Punjab",
        notes: recordNote(row.address ?? "", source.pageUrl),
      });
      if (record) records.push(record);
    }
  }

  records.push(...curatedOfficialFacilities());

  const unique = new Map<string, OfficialFacilityRecord>();
  for (const record of records) {
    const key = identityKey(record);
    const existing = unique.get(key);
    if (!existing) {
      unique.set(key, record);
      continue;
    }
    if (
      existing.verificationStatus !== "verified" &&
      record.verificationStatus === "verified"
    ) {
      unique.set(key, record);
    }
  }

  const dataset: OfficialFacilityDataset = {
    importBatch: IMPORT_BATCH,
    retrievedAt: RETRIEVED_AT,
    records: [...unique.values()].sort((left, right) =>
      `${left.province}${left.district}${left.name}`.localeCompare(
        `${right.province}${right.district}${right.name}`,
      ),
    ),
  };

  const outputPath = path.join(
    process.cwd(),
    "data",
    "imports",
    "official-facility-registry-2026.json",
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`);

  const verified = dataset.records.filter((row) => row.verificationStatus === "verified").length;
  const byProvince = dataset.records.reduce<Record<string, number>>((counts, row) => {
    counts[row.province] = (counts[row.province] ?? 0) + 1;
    return counts;
  }, {});

  console.log(
    JSON.stringify(
      {
        records: dataset.records.length,
        verified,
        needsReview: dataset.records.length - verified,
        byProvince,
        outputPath,
      },
      null,
      2,
    ),
  );
}

function recordNote(address: string, pageUrl: string) {
  if (!address.trim()) {
    return `Official directory export from ${pageUrl}. No address field was populated.`;
  }
  return `Official directory export from ${pageUrl}. Address stored only as printed by the Health Department.`;
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
