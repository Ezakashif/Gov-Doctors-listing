import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedDoctorRecord } from "./types";

type IdRow = { id: string };
type CredentialRow = { doctor_id: string };

const requireData = <T>(data: T | null, message: string): T => {
  if (!data) throw new Error(message);
  return data;
};

export async function upsertVerifiedRecord(
  supabase: SupabaseClient,
  record: NormalizedDoctorRecord,
) {
  if (!record.publishable) {
    throw new Error("Rejected records cannot be persisted as published.");
  }

  const { data: sourceData, error: sourceError } = await supabase
    .from("sources")
    .upsert(
      {
        name: record.sourceName,
        source_type: record.sourceType,
        url: record.sourceUrl,
        authority: "Public pilot source",
        permission_status: record.sourceType === "fixture" ? "approved" : "public_record",
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "name" },
    )
    .select("id")
    .single();
  if (sourceError) throw sourceError;
  const source = requireData(sourceData as IdRow | null, "Source upsert returned no record.");

  const { data: cityData, error: cityError } = await supabase
    .from("cities")
    .upsert(
      {
        name: record.city,
        province: record.province,
        slug: record.citySlug,
        is_pilot: true,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (cityError) throw cityError;
  const city = requireData(cityData as IdRow | null, "City upsert returned no record.");

  const { data: facilityData, error: facilityError } = await supabase
    .from("facilities")
    .upsert(
      {
        city_id: city.id,
        source_id: source.id,
        name: record.facilityName,
        slug: record.facilitySlug,
        facility_type: record.facilityType,
        address: record.facilityAddress,
        official_phone: record.officialPhone,
        is_government: true,
        last_verified_at: record.facilityVerifiedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (facilityError) throw facilityError;
  const facility = requireData(facilityData as IdRow | null, "Facility upsert returned no record.");

  const { data: existingCredential, error: credentialLookupError } = await supabase
    .from("doctor_credentials")
    .select("doctor_id")
    .eq("pmdc_registration_number", record.pmdcRegistrationNumber)
    .maybeSingle();
  if (credentialLookupError) throw credentialLookupError;

  let doctorId = (existingCredential as CredentialRow | null)?.doctor_id;
  if (doctorId) {
    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: record.fullName,
        normalized_name: record.normalizedName,
        designation: record.designation,
        specialty: record.specialty,
        publication_status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", doctorId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("doctors")
      .insert({
        full_name: record.fullName,
        normalized_name: record.normalizedName,
        designation: record.designation,
        specialty: record.specialty,
        publication_status: "published",
      })
      .select("id")
      .single();
    if (error) throw error;
    doctorId = requireData((data as IdRow | null)?.id ?? null, "Doctor insert returned no record.");
  }

  const { error: credentialError } = await supabase
    .from("doctor_credentials")
    .upsert(
      {
        doctor_id: doctorId,
        pmdc_registration_number: record.pmdcRegistrationNumber,
        pmdc_status: record.pmdcStatus,
        verified_at: record.pmdcVerifiedAt,
        source_id: source.id,
        source_evidence: { adapter: "automated-ingestion", checkedAt: record.pmdcVerifiedAt },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "doctor_id" },
    );
  if (credentialError) throw credentialError;

  const { data: postingData, error: postingError } = await supabase
    .from("doctor_postings")
    .upsert(
      {
        doctor_id: doctorId,
        facility_id: facility.id,
        source_id: source.id,
        government_employment_status: "verified",
        availability_note: record.availabilityNote ?? "Please call the hospital to confirm clinic hours.",
        source_record_key: record.sourceRecordKey,
        source_evidence: { sourceUrl: record.sourceUrl, checkedAt: record.governmentVerifiedAt },
        verified_at: record.governmentVerifiedAt,
        stale_after: record.staleAfter,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "doctor_id,facility_id" },
    )
    .select("id")
    .single();
  if (postingError) throw postingError;
  const posting = requireData(postingData as IdRow | null, "Posting upsert returned no record.");

  const { error: eventError } = await supabase.from("verification_events").insert([
    {
      doctor_id: doctorId,
      posting_id: posting.id,
      source_id: source.id,
      verification_type: "government_employment",
      outcome: "verified",
      checked_at: record.governmentVerifiedAt,
    },
    {
      doctor_id: doctorId,
      posting_id: posting.id,
      source_id: source.id,
      verification_type: "pmdc",
      outcome: "verified",
      checked_at: record.pmdcVerifiedAt,
    },
  ]);
  if (eventError) throw eventError;
}
