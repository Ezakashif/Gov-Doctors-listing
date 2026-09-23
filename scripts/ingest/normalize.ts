import { pilotCities } from "../../src/lib/directory";
import type { NormalizedDoctorRecord, RawDoctorRecord } from "./types";

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeName = (value: string) =>
  value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

export function normalizeRecord(record: RawDoctorRecord): NormalizedDoctorRecord {
  const rejectionReasons: string[] = [];
  const governmentDate = new Date(record.governmentVerifiedAt);
  const pmdcDate = new Date(record.pmdcVerifiedAt);

  if (!record.fullName.trim()) rejectionReasons.push("missing doctor name");
  if (!record.pmdcRegistrationNumber.trim()) rejectionReasons.push("missing internal PMDC key");
  if (record.pmdcStatus !== "valid") rejectionReasons.push("PMDC registration is not valid");
  if (!record.governmentEmploymentVerified) rejectionReasons.push("government employment is not verified");
  if (!record.officialPhone.trim()) rejectionReasons.push("missing official facility phone");
  if (!pilotCities.includes(record.city as (typeof pilotCities)[number])) rejectionReasons.push("outside pilot coverage");
  if (Number.isNaN(governmentDate.valueOf())) rejectionReasons.push("invalid government verification date");
  if (Number.isNaN(pmdcDate.valueOf())) rejectionReasons.push("invalid PMDC verification date");

  const baseDate = Number.isNaN(governmentDate.valueOf()) ? new Date() : governmentDate;
  const staleAfter = new Date(baseDate);
  staleAfter.setUTCDate(staleAfter.getUTCDate() + 90);

  return {
    ...record,
    fullName: record.fullName.trim().replace(/\s+/g, " "),
    facilityName: record.facilityName.trim().replace(/\s+/g, " "),
    officialPhone: record.officialPhone.trim(),
    normalizedName: normalizeName(record.fullName),
    citySlug: slugify(record.city),
    facilitySlug: `${slugify(record.facilityName)}-${slugify(record.city)}`,
    publishable: rejectionReasons.length === 0,
    rejectionReasons,
    staleAfter: staleAfter.toISOString(),
  };
}
