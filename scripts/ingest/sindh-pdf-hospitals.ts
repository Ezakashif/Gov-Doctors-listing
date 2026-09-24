import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { normalizeKey, slugify } from "./official-facilities-lib";

loadEnvConfig(process.cwd());

const commit = process.argv.includes("--commit");

type PdfHospital = {
  district: string;
  name: string;
  phone: string | null;
  address: string;
  facilityType: string;
};

type PdfDataset = {
  sourceName: string;
  sourceUrl: string;
  authority: string;
  retrievedAt: string;
  hospitals: PdfHospital[];
};

type FacilityRow = {
  id: string;
  name: string;
  district: string | null;
  province: string | null;
  verification_status: string;
};

const foldName = (value: string) =>
  normalizeKey(value.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim());

const sameHospital = (left: string, right: string) => {
  const a = foldName(left);
  const b = foldName(right);
  return a === b || a.includes(b) || b.includes(a);
};

const count = async (supabase: SupabaseClient, table: string) => {
  const { count: total, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return total ?? 0;
};

async function loadExisting(supabase: SupabaseClient) {
  const rows: FacilityRow[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("facilities")
      .select("id,name,district,province,verification_status")
      .eq("province", "Sindh")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as FacilityRow[]));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function ensureSource(supabase: SupabaseClient, dataset: PdfDataset) {
  const { data: existing, error: lookupError } = await supabase
    .from("sources")
    .select("id")
    .eq("name", dataset.sourceName)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("sources")
    .insert({
      name: dataset.sourceName,
      source_type: "government_pdf",
      url: dataset.sourceUrl,
      authority: dataset.authority,
      permission_status: "public_record",
      retrieved_at: `${dataset.retrievedAt}T00:00:00.000Z`,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function ensureCity(
  supabase: SupabaseClient,
  district: string,
  cache: Map<string, string>,
) {
  const cacheKey = `${normalizeKey("Sindh")}|${normalizeKey(district)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data: existing, error: lookupError } = await supabase
    .from("cities")
    .select("id")
    .eq("name", district)
    .eq("province", "Sindh")
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) {
    cache.set(cacheKey, existing.id as string);
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("cities")
    .insert({
      name: district,
      province: "Sindh",
      slug: `sindh-${slugify(district)}`,
      is_pilot: false,
    })
    .select("id")
    .single();
  if (error) throw error;
  cache.set(cacheKey, data.id as string);
  return data.id as string;
}

async function run() {
  const dataset = JSON.parse(
    await readFile(
      path.join(process.cwd(), "data", "imports", "sindh-pdf-hospitals-2026.json"),
      "utf8",
    ),
  ) as PdfDataset;

  if (!commit) {
    console.log(
      JSON.stringify(
        { mode: "dry-run", hospitals: dataset.hospitals.length },
        null,
        2,
      ),
    );
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

  const beforeDoctors = await count(supabase, "doctors");
  const beforePublicDoctors = await count(supabase, "public_doctor_directory");
  const existing = await loadExisting(supabase);
  const sourceId = await ensureSource(supabase, dataset);
  const cityCache = new Map<string, string>();
  const decidedAt = new Date().toISOString();

  let inserted = 0;
  let updated = 0;
  let alreadyPublic = 0;

  for (const hospital of dataset.hospitals) {
    const match = existing.find(
      (row) =>
        normalizeKey(row.district ?? "") === normalizeKey(hospital.district) &&
        sameHospital(row.name, hospital.name),
    );

    if (match?.verification_status === "verified") {
      alreadyPublic += 1;
      continue;
    }

    if (match) {
      const { error } = await supabase
        .from("facilities")
        .update({
          address: hospital.address,
          official_phone: hospital.phone,
          verification_status: "verified",
          address_source_url: dataset.sourceUrl,
          last_verified_at: decidedAt,
          source_id: sourceId,
          updated_at: decidedAt,
        })
        .eq("id", match.id);
      if (error) throw error;
      updated += 1;
      continue;
    }

    const cityId = await ensureCity(supabase, hospital.district, cityCache);
    const { data: insertedRow, error } = await supabase
      .from("facilities")
      .insert({
        city_id: cityId,
        source_id: sourceId,
        name: hospital.name,
        slug: `pdf-sindh-${slugify(hospital.district)}-${slugify(hospital.name)}`,
        facility_type: hospital.facilityType,
        address: hospital.address,
        official_phone: hospital.phone,
        is_government: true,
        province: "Sindh",
        district: hospital.district,
        tehsil: hospital.district,
        verification_status: "verified",
        address_source_url: dataset.sourceUrl,
        last_verified_at: decidedAt,
      })
      .select("id")
      .single();
    if (error) throw error;

    const { error: eventError } = await supabase.from("verification_events").insert({
      doctor_id: null,
      posting_id: null,
      facility_id: insertedRow.id,
      source_id: sourceId,
      verification_type: "facility_address",
      outcome: "verified",
      checked_at: decidedAt,
      evidence: {
        importBatch: "sindh-pdf-hospitals-2026",
        sourceName: dataset.sourceName,
        notes: "Imported from the provided Sindh hospital PDF as instructed.",
        doctorPublicationUnchanged: true,
        hajjStatusUnchanged: true,
      },
    });
    if (eventError) throw eventError;
    inserted += 1;
  }

  const afterDoctors = await count(supabase, "doctors");
  const afterPublicDoctors = await count(supabase, "public_doctor_directory");
  const publicFacilities = await count(supabase, "public_facility_directory");

  const safety = {
    doctorsAdded: afterDoctors - beforeDoctors,
    publicDoctorsChanged: afterPublicDoctors - beforePublicDoctors,
  };

  console.log(
    JSON.stringify(
      {
        hospitalsInPdf: dataset.hospitals.length,
        inserted,
        updated,
        alreadyPublic,
        publicFacilities,
        safety,
      },
      null,
      2,
    ),
  );

  if (safety.doctorsAdded !== 0 || safety.publicDoctorsChanged !== 0) {
    throw new Error("Safety check failed: doctor data changed.");
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
