import { createHash } from "node:crypto";
import type { OfficialFacilityRecord } from "./official-facilities-types";

export const IMPORT_BATCH = "official-facility-registry-2026";
export const RETRIEVED_AT = "2026-09-24";

const LOCATION_TOKEN =
  /\b(road|rd\.?|street|st\.|chowk|near|sector|phase[- ]?\d|gate|colony|town|bazaar|bazar|bypass|cantt|markaz|block|avenue|lane|mohallah|muhalla|house|plot|opposite|adjacent|adjecnt|plaza|darbar|ghar)\b/i;

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const collapse = (value: string) =>
  value.normalize("NFKC").replace(/\s+/g, " ").trim();

export const normalizeKey = (value: string) => collapse(value).toLowerCase();

export const cleanPhone = (value: string | null | undefined) => {
  const phone = collapse(value ?? "");
  if (!phone || /^n\/?a$/i.test(phone) || phone === "-") return null;
  return phone;
};

export const isUsableAddress = (name: string, address: string | null) => {
  if (!address) return false;
  const cleaned = collapse(address);
  const facilityName = collapse(name);
  if (cleaned.length < 12) return false;
  if (normalizeKey(cleaned) === normalizeKey(facilityName)) return false;
  if (normalizeKey(facilityName).includes(normalizeKey(cleaned))) return false;
  if (LOCATION_TOKEN.test(cleaned)) return true;
  return cleaned.includes(",") && cleaned.length >= 24;
};

export const sourceRecordKey = (parts: string[]) =>
  createHash("sha1").update(parts.join("|").toLowerCase()).digest("hex").slice(0, 20);

export const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<br\s*\/?>/gi, " ");

export const parseOfficialTable = (html: string) => {
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((match) =>
    [...match[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
      collapse(decodeHtml(cell[1].replace(/<[^>]+>/g, " "))),
    ),
  );
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => normalizeKey(header).replace(/\s+/g, ""));
  return rows.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    return record;
  });
};

export const toOfficialFacility = (input: {
  name: string;
  facilityType: string;
  province: string;
  district: string;
  tehsil?: string | null;
  city?: string | null;
  address?: string | null;
  officialPhone?: string | null;
  sourceName: string;
  sourceUrl: string;
  sourceType: OfficialFacilityRecord["sourceType"];
  authority: string;
  sourceDocumentDate?: string | null;
  notes: string;
}): OfficialFacilityRecord | null => {
  const name = collapse(input.name);
  const district = collapse(input.district);
  if (!name || !district) return null;
  const address = collapse(input.address ?? "") || null;
  const verificationStatus = isUsableAddress(name, address) ? "verified" : "needs_review";
  return {
    sourceRecordKey: sourceRecordKey([
      input.province,
      district,
      name,
      input.facilityType,
      input.sourceUrl,
    ]),
    name,
    facilityType: input.facilityType,
    province: input.province,
    district,
    tehsil: collapse(input.tehsil ?? "") || null,
    city: collapse(input.city ?? "") || district,
    address: verificationStatus === "verified" ? address : address,
    officialPhone: cleanPhone(input.officialPhone),
    verificationStatus,
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    sourceType: input.sourceType,
    authority: input.authority,
    sourceDocumentDate: input.sourceDocumentDate ?? null,
    retrievedAt: RETRIEVED_AT,
    notes: input.notes,
  };
};
