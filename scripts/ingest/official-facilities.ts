import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { IMPORT_BATCH, RETRIEVED_AT, normalizeKey, slugify } from "./official-facilities-lib";
import type {
  OfficialFacilityDataset,
  OfficialFacilityRecord,
} from "./official-facilities-types";

loadEnvConfig(process.cwd());

const commit = process.argv.includes("--commit");

const count = async (
  supabase: SupabaseClient,
  table: string,
  column?: string,
  value?: string,
) => {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (column && value) query = query.eq(column, value);
  const { count: total, error } = await query;
  if (error) throw error;
  return total ?? 0;
};

const identityKey = (name: string, district: string | null, province: string | null) =>
  `${normalizeKey(province ?? "")}|${normalizeKey(district ?? "")}|${normalizeKey(name)}`;

async function loadDataset() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "imports",
    "official-facility-registry-2026.json",
  );
  return JSON.parse(await readFile(filePath, "utf8")) as OfficialFacilityDataset;
}

async function ensureSource(
  supabase: SupabaseClient,
  record: OfficialFacilityRecord,
) {
  const { data: existing, error: lookupError } = await supabase
    .from("sources")
    .select("id")
    .eq("name", record.sourceName)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("sources")
    .insert({
      name: record.sourceName,
      source_type: record.sourceType,
      url: record.sourceUrl,
      authority: record.authority,
      permission_status: "public_record",
      source_document_date: record.sourceDocumentDate,
      retrieved_at: `${RETRIEVED_AT}T00:00:00.000Z`,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function ensureCity(
  supabase: SupabaseClient,
  record: OfficialFacilityRecord,
  cache: Map<string, string>,
) {
  const cityName = record.city || record.district;
  const cacheKey = `${normalizeKey(record.province)}|${normalizeKey(cityName)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data: existing, error: lookupError } = await supabase
    .from("cities")
    .select("id")
    .eq("name", cityName)
    .eq("province", record.province)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) {
    cache.set(cacheKey, existing.id as string);
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("cities")
    .insert({
      name: cityName,
      province: record.province,
      slug: `${slugify(record.province)}-${slugify(cityName)}`,
      is_pilot: false,
    })
    .select("id")
    .single();
  if (error) throw error;
  cache.set(cacheKey, data.id as string);
  return data.id as string;
}

async function run() {
  const dataset = await loadDataset();
  const summary = {
    adapter: IMPORT_BATCH,
    retrievedAt: dataset.retrievedAt,
    recordsSeen: dataset.records.length,
    verifiedInSource: dataset.records.filter((row) => row.verificationStatus === "verified")
      .length,
    needsReviewInSource: dataset.records.filter(
      (row) => row.verificationStatus === "needs_review",
    ).length,
  };

  if (!commit) {
    console.log("Official facility registry dry run completed.");
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase credentials are not configured.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket as unknown as WebSocketLikeConstructor },
  });

  const before = {
    doctors: await count(supabase, "doctors"),
    facilities: await count(supabase, "facilities"),
    publicDoctors: await count(supabase, "public_doctor_directory"),
    trustedPmdc: await count(supabase, "doctor_credentials", "match_status", "matched"),
    hajjVerified: await count(supabase, "doctors", "hajj_attestation_status", "verified"),
  };

  const { data: existingFacilities, error: existingError } = await supabase
    .from("facilities")
    .select("id,name,district,province,slug,verification_status");
  if (existingError) throw existingError;

  const existingByIdentity = new Map(
    (existingFacilities ?? []).map((row) => [
      identityKey(row.name, row.district, row.province),
      row,
    ]),
  );

  const { data: runData, error: runError } = await supabase
    .from("ingestion_runs")
    .insert({
      adapter_name: IMPORT_BATCH,
      status: "running",
      records_seen: dataset.records.length,
    })
    .select("id")
    .single();
  if (runError) throw runError;

  let inserted = 0;
  let skippedExisting = 0;
  const errors: Array<{ key: string; message: string }> = [];
  const sourceCache = new Map<string, string>();
  const cityCache = new Map<string, string>();
  const pending: OfficialFacilityRecord[] = [];

  for (const record of dataset.records) {
    if (existingByIdentity.has(identityKey(record.name, record.district, record.province))) {
      skippedExisting += 1;
      continue;
    }
    pending.push(record);
  }

  const chunkSize = 40;
  for (let index = 0; index < pending.length; index += chunkSize) {
    const chunk = pending.slice(index, index + chunkSize);
    try {
      const decidedAt = new Date().toISOString();
      const rows: Array<{
        city_id: string;
        source_id: string;
        name: string;
        slug: string;
        facility_type: string;
        address: string | null;
        official_phone: string | null;
        is_government: true;
        province: string;
        district: string;
        tehsil: string | null;
        verification_status: OfficialFacilityRecord["verificationStatus"];
        address_source_url: string | null;
        last_verified_at: string | null;
        _record: OfficialFacilityRecord;
      }> = [];
      for (const record of chunk) {
        const cachedSource = sourceCache.get(record.sourceName);
        const sourceId = cachedSource ?? (await ensureSource(supabase, record));
        sourceCache.set(record.sourceName, sourceId);
        const cityId = await ensureCity(supabase, record, cityCache);
        rows.push({
          city_id: cityId,
          source_id: sourceId,
          name: record.name,
          slug: `reg-${slugify(record.province)}-${slugify(record.district)}-${slugify(record.name)}-${record.sourceRecordKey}`,
          facility_type: record.facilityType,
          address: record.address,
          official_phone: record.officialPhone,
          is_government: true,
          province: record.province,
          district: record.district,
          tehsil: record.tehsil,
          verification_status: record.verificationStatus,
          address_source_url:
            record.verificationStatus === "verified" ? record.sourceUrl : null,
          last_verified_at:
            record.verificationStatus === "verified" ? decidedAt : null,
          _record: record,
        });
      }

      const { data: insertedRows, error: facilityError } = await supabase
        .from("facilities")
        .insert(
          rows.map(({ _record, ...row }) => {
            void _record;
            return row;
          }),
        )
        .select("id,name,district,province,slug,verification_status");
      if (facilityError) throw facilityError;

      const events = (insertedRows ?? []).map((facility, rowIndex) => {
        const record = rows[rowIndex]._record;
        existingByIdentity.set(identityKey(facility.name, facility.district, facility.province), facility);
        return {
          doctor_id: null,
          posting_id: null,
          facility_id: facility.id,
          source_id: rows[rowIndex].source_id,
          verification_type: "facility_address",
          outcome: record.verificationStatus,
          checked_at: new Date(Date.parse(decidedAt) + rowIndex).toISOString(),
          evidence: {
            importBatch: IMPORT_BATCH,
            sourceRecordKey: record.sourceRecordKey,
            sourceName: record.sourceName,
            sourceUrl: record.sourceUrl,
            sourceDocumentDate: record.sourceDocumentDate,
            notes: record.notes,
            doctorPublicationUnchanged: true,
            hajjStatusUnchanged: true,
          },
        };
      });

      const { error: eventError } = await supabase.from("verification_events").insert(events);
      if (eventError) throw eventError;
      inserted += insertedRows?.length ?? 0;
    } catch (error) {
      for (const record of chunk) {
        errors.push({
          key: record.sourceRecordKey,
          message: error instanceof Error ? error.message : "Unknown import error",
        });
      }
    }
  }

  const after = {
    doctors: await count(supabase, "doctors"),
    facilities: await count(supabase, "facilities"),
    publicDoctors: await count(supabase, "public_doctor_directory"),
    publicFacilities: await count(supabase, "public_facility_directory"),
    trustedPmdc: await count(supabase, "doctor_credentials", "match_status", "matched"),
    hajjVerified: await count(supabase, "doctors", "hajj_attestation_status", "verified"),
    verifiedFacilities: await count(supabase, "facilities", "verification_status", "verified"),
    needsReviewFacilities: await count(
      supabase,
      "facilities",
      "verification_status",
      "needs_review",
    ),
  };

  const { error: finishError } = await supabase
    .from("ingestion_runs")
    .update({
      status: errors.length ? "failed" : "succeeded",
      records_published: inserted,
      records_rejected: errors.length,
      error_summary: errors.length ? JSON.stringify(errors).slice(0, 800) : null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runData.id);
  if (finishError) throw finishError;

  const safety = {
    doctorsAdded: after.doctors - before.doctors,
    facilitiesAdded: after.facilities - before.facilities,
    publicDoctorsChanged: after.publicDoctors - before.publicDoctors,
    pmdcMatchesChanged: after.trustedPmdc - before.trustedPmdc,
    hajjVerifiedChanged: after.hajjVerified - before.hajjVerified,
  };

  console.log(
    JSON.stringify(
      {
        ...summary,
        inserted,
        skippedExisting,
        importErrors: errors.length,
        after,
        safety,
      },
      null,
      2,
    ),
  );

  if (
    safety.doctorsAdded !== 0 ||
    safety.publicDoctorsChanged !== 0 ||
    safety.pmdcMatchesChanged !== 0 ||
    safety.hajjVerifiedChanged !== 0
  ) {
    throw new Error("Safety check failed: doctor, PMDC, or Hajj data changed.");
  }

  if (errors.length) {
    for (const error of errors.slice(0, 20)) {
      console.error(`${error.key}: ${error.message}`);
    }
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
