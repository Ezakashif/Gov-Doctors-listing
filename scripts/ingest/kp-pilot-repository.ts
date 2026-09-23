import type { SupabaseClient } from "@supabase/supabase-js";
import type { KpPilotRecord, KpPilotSource } from "./kp-pilot-types";

type IdRow = { id: string };
type ExistingPosting = { id: string; doctor_id: string };

const requireData = <T>(data: T | null, message: string): T => {
  if (!data) throw new Error(message);
  return data;
};

export async function upsertKpPilotSource(
  supabase: SupabaseClient,
  source: KpPilotSource,
) {
  const { data, error } = await supabase
    .from("sources")
    .upsert(
      {
        name: source.name,
        source_type: "government_pdf",
        url: source.url,
        authority: source.authority,
        permission_status: "public_record",
        source_document_date: source.documentDate,
        retrieved_at: new Date().toISOString(),
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "name" },
    )
    .select("id")
    .single();
  if (error) throw error;
  return requireData(data as IdRow | null, "Source upsert returned no record.");
}

export async function upsertKpPilotRecord(
  supabase: SupabaseClient,
  source: KpPilotSource,
  sourceId: string,
  record: KpPilotRecord,
) {
  const { data: cityData, error: cityError } = await supabase
    .from("cities")
    .upsert(
      {
        name: record.district,
        province: "Khyber Pakhtunkhwa",
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
        source_id: sourceId,
        name: record.facilityName,
        slug: record.facilitySlug,
        facility_type: record.facility.facilityType,
        address: record.facility.address,
        official_phone: record.facility.officialPhone,
        is_government: true,
        province: "Khyber Pakhtunkhwa",
        district: record.district,
        tehsil: record.facility.tehsil,
        verification_status: record.facility.verificationStatus,
        address_source_url: record.facility.addressSourceUrl,
        last_verified_at:
          record.facility.verificationStatus === "verified"
            ? new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (facilityError) throw facilityError;
  const facility = requireData(
    facilityData as IdRow | null,
    "Facility upsert returned no record.",
  );

  const { data: existingPostingData, error: existingPostingError } =
    await supabase
      .from("doctor_postings")
      .select("id,doctor_id")
      .eq("source_id", sourceId)
      .eq("source_record_key", record.sourceRecordKey)
      .maybeSingle();
  if (existingPostingError) throw existingPostingError;

  const existingPosting = existingPostingData as ExistingPosting | null;
  let doctorId = existingPosting?.doctor_id;

  if (doctorId) {
    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: record.name,
        normalized_name: record.normalizedName,
        father_name: record.fatherName,
        designation: "Medical Officer (BS-17)",
        specialty: "General Cadre",
        qualification: null,
        government_employment_status: "government_record_historical",
        verification_status: "needs_review",
        hajj_attestation_status: "not_verified",
        publication_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", doctorId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("doctors")
      .insert({
        full_name: record.name,
        normalized_name: record.normalizedName,
        father_name: record.fatherName,
        designation: "Medical Officer (BS-17)",
        specialty: "General Cadre",
        qualification: null,
        government_employment_status: "government_record_historical",
        verification_status: "needs_review",
        hajj_attestation_status: "not_verified",
        publication_status: "pending",
      })
      .select("id")
      .single();
    if (error) throw error;
    doctorId = requireData(
      (data as IdRow | null)?.id ?? null,
      "Doctor insert returned no record.",
    );
  }

  const postingPayload = {
    doctor_id: doctorId,
    facility_id: facility.id,
    source_id: sourceId,
    government_employment_status: "government_record_historical",
    availability_note:
      "Historical posting from the 2024 seniority list; current posting and Hajj attestation availability are not verified.",
    source_record_key: record.sourceRecordKey,
    source_evidence: {
      serialNumber: record.serialNumber,
      relationship: record.relationship,
      dateOfBirth: record.dateOfBirth,
      domicile: record.domicile,
      rawPosting: record.rawPosting,
      sourceUrl: source.url,
    },
    verified_at: `${source.documentDate}T00:00:00.000Z`,
    source_document_date: source.documentDate,
    posting_as_of_date: source.documentDate,
    designation: "Medical Officer (BS-17)",
    government_service_entry_date: record.governmentServiceEntryDate,
    recruitment_method: record.recruitmentMethod,
    remarks: record.remarks,
    is_current_confirmed: false,
    stale_after: null,
    active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: postingData, error: postingError } = await supabase
    .from("doctor_postings")
    .upsert(postingPayload, { onConflict: "source_id,source_record_key" })
    .select("id")
    .single();
  if (postingError) throw postingError;
  const posting = requireData(
    postingData as IdRow | null,
    "Posting upsert returned no record.",
  );

  const checkedAt = `${source.documentDate}T00:00:00.000Z`;
  const events = [
    {
      doctor_id: doctorId,
      posting_id: posting.id,
      source_id: sourceId,
      verification_type: "government_employment",
      outcome: "verified",
      checked_at: checkedAt,
      evidence: {
        scope: "historical",
        sourceRecordKey: record.sourceRecordKey,
        warning: "Does not prove current government employment.",
      },
    },
    {
      doctor_id: doctorId,
      posting_id: posting.id,
      source_id: sourceId,
      verification_type: "pmdc",
      outcome: "needs_review",
      checked_at: checkedAt,
      evidence: {
        authority: "https://pmdc.pk/",
        endpoint: "https://hospitals-inspections.pmdc.pk/api/DRC/GetData",
        reason:
          "The public endpoint does not reliably enforce full-name AND father-name matching. No unambiguous row-level match was established and no registration number was guessed.",
      },
    },
  ];

  const { error: eventError } = await supabase
    .from("verification_events")
    .upsert(events, {
      onConflict: "doctor_id,source_id,verification_type,checked_at",
    });
  if (eventError) throw eventError;

  return {
    doctorId,
    facilityId: facility.id,
    facilityVerified: record.facility.verificationStatus === "verified",
  };
}
