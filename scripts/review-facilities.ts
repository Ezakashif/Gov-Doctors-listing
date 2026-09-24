import { loadEnvConfig } from "@next/env";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

loadEnvConfig(process.cwd());

const REVIEW_BATCH = "kp-facility-review-2026-15";
const REVIEW_METHOD = "manual_official_source_review";
const TARGET_NAMES = [
  "DHQ Hospital Abbottabad",
  "DHQ Hospital Haripur",
  "DHQ Hospital Batkhela",
  "DHQ Hospital Ghallanai",
  "Type-D Hospital Sarai Niamat Khan",
  "District Health Office Peshawar",
  "District Health Office Mardan",
  "District Health Office Karak",
  "District Health Office Wana",
  "BHU Jail Kohistan",
  "BHU Jando Khel",
  "RHC Ekka Ghund",
  "Swat Medical College",
  "QATHA Nowshera",
  "Koklian Piran",
] as const;

type ReviewStatus = "verified" | "needs_review";

type FacilityDecision = {
  name: (typeof TARGET_NAMES)[number];
  status: ReviewStatus;
  currentOfficialName: string;
  district: string;
  tehsil: string | null;
  address: string | null;
  officialPhone: string | null;
  sourceName: string;
  sourceUrl: string;
  sourceType: "government_page" | "government_pdf";
  authority: string;
  sourceDocumentDate: string | null;
  reason: string;
};

const decisions: FacilityDecision[] = [
  {
    name: "DHQ Hospital Abbottabad",
    status: "needs_review",
    currentOfficialName:
      "Possibly Benazir Bhutto Shaheed / DHQ Teaching Hospital Abbottabad",
    district: "Abbottabad",
    tehsil: "Abbottabad",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department notifications",
    sourceUrl: "https://www.healthkp.gov.pk/public/uploads/downloads-6.pdf",
    sourceType: "government_pdf",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: "2018-08-06",
    reason:
      "Official records confirm a government DHQ/BBS teaching hospital in Abbottabad and later style it BBS/DHQ Teaching Hospital. No official street address was found. Ayub Teaching Hospital is a separate MTI and was not used.",
  },
  {
    name: "DHQ Hospital Haripur",
    status: "needs_review",
    currentOfficialName: "DHQ Hospital Haripur",
    district: "Haripur",
    tehsil: "Haripur",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department notification — DHQ Haripur posting",
    sourceUrl: "https://www.healthkp.gov.pk/public/uploads/downloads-469.pdf",
    sourceType: "government_pdf",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: "2021-07-19",
    reason:
      "Official notifications confirm the hospital and its Medical Superintendent, but no official street address or hospital switchboard was published. The provincial Health Department Peshawar address was not used.",
  },
  {
    name: "DHQ Hospital Batkhela",
    status: "needs_review",
    currentOfficialName: "Cat-A DHQ Hospital Malakand at Batkhela",
    district: "Malakand",
    tehsil: "Batkhela",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department — Cat-A DHQ Malakand at Batakhela",
    sourceUrl: "https://healthkp.gov.pk/news/view/300",
    sourceType: "government_page",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: "2021-09-06",
    reason:
      "Official Health Department news confirms Cat-A DHQ Hospital Malakand at Batakhela. No official hospital street address was found. A Population Welfare office address on Totakan Road was not treated as the hospital address.",
  },
  {
    name: "DHQ Hospital Ghallanai",
    status: "needs_review",
    currentOfficialName: "DHQ Hospital, Ghallanai Mohmand",
    district: "Mohmand",
    tehsil: "Ghallanai",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department facility-wise position list",
    sourceUrl: "https://healthkp.gov.pk/c_data/facility_wise_position_list.pdf",
    sourceType: "government_pdf",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: null,
    reason:
      "Official facility list records DHQ Hospital, Ghallanai Mohmand. No official street address or switchboard was found.",
  },
  {
    name: "Type-D Hospital Sarai Niamat Khan",
    status: "needs_review",
    currentOfficialName: "Cat-D Hospital Sarai Niamat Khan Haripur",
    district: "Haripur",
    tehsil: "Haripur",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department facility-wise position list",
    sourceUrl: "https://healthkp.gov.pk/c_data/facility_wise_position_list.pdf",
    sourceType: "government_pdf",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: null,
    reason:
      "Official facility list confirms Cat-D Hospital Sarai Niamat Khan, Haripur. No official street address or phone was found. Facility type was left as Type-D.",
  },
  {
    name: "District Health Office Peshawar",
    status: "needs_review",
    currentOfficialName: "District Health Officer Peshawar",
    district: "Peshawar",
    tehsil: "Peshawar",
    address: null,
    officialPhone: null,
    sourceName: "Khyber Pakhtunkhwa official web portal contacts",
    sourceUrl: "https://kp.gov.pk/page/contactus/page_no/2",
    sourceType: "government_page",
    authority: "Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: null,
    reason:
      "Official provincial contact directory lists DHO Peshawar with telephone 9212911 but no office address. A phone without a sourced address is not enough to mark the facility verified.",
  },
  {
    name: "District Health Office Mardan",
    status: "needs_review",
    currentOfficialName: "District Health Office Mardan",
    district: "Mardan",
    tehsil: "Mardan",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department posting/transfer index",
    sourceUrl: "https://www.healthkp.gov.pk/downloads/view/2/3",
    sourceType: "government_page",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: null,
    reason:
      "Official Health Department records confirm a District Health Office in Mardan. No official DHO office address was found. The MS DHQ Mardan telephone was not treated as the DHO address or phone.",
  },
  {
    name: "District Health Office Karak",
    status: "needs_review",
    currentOfficialName: "District Health Officer Karak",
    district: "Karak",
    tehsil: "Karak",
    address: null,
    officialPhone: null,
    sourceName: "Khyber Pakhtunkhwa official web portal contacts",
    sourceUrl: "https://kp.gov.pk/page/contactus/page_no/2",
    sourceType: "government_page",
    authority: "Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: null,
    reason:
      "Official provincial contact directory lists District Health Officer Karak with telephone 0927-290537 but no office address. Phone without a sourced address does not meet the verification standard.",
  },
  {
    name: "District Health Office Wana",
    status: "needs_review",
    currentOfficialName: "District Health Office Wana / South Waziristan",
    district: "South Waziristan",
    tehsil: "Wana",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department facility-wise position list",
    sourceUrl: "https://healthkp.gov.pk/c_data/facility_wise_position_list.pdf",
    sourceType: "government_pdf",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: null,
    reason:
      "Official lists distinguish South Waziristan health administration and DHQ Wana. No official DHO Wana office address or phone was found.",
  },
  {
    name: "BHU Jail Kohistan",
    status: "needs_review",
    currentOfficialName: "BHU Jail Kohistan",
    district: "Kohistan",
    tehsil: null,
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department — Tentative Seniority List Medical Officers BS-17",
    sourceUrl:
      "https://www.healthkp.gov.pk/public/uploads/news-Tentative%20Seniority%20BPS-17%2C%202024%20%281%29.pdf",
    sourceType: "government_pdf",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: "2024-05-01",
    reason:
      "The 2024 seniority list is the only official mention found. Current Kohistan districts have been reorganised, and no official facility list or address for a BHU named Jail Kohistan was located.",
  },
  {
    name: "BHU Jando Khel",
    status: "verified",
    currentOfficialName: "BHU Jhando Khel",
    district: "Bannu",
    tehsil: "Bannu",
    address: "Jhando Khel, Bannu, Khyber Pakhtunkhwa",
    officialPhone: null,
    sourceName: "Bannu District Government — Basic Health Units",
    sourceUrl: "https://bannu.kp.gov.pk/page/basic_health_unit_bhus",
    sourceType: "government_page",
    authority: "District Government Bannu, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: null,
    reason:
      "Official Bannu district portal lists BHU Jhando Khel with address Jhando Khel. Historical seniority-list spelling Jando Khel was retained on the existing record. No official phone was published.",
  },
  {
    name: "RHC Ekka Ghund",
    status: "needs_review",
    currentOfficialName: "RHC Ekkagund / Ekka Ghund, Mohmand",
    district: "Mohmand",
    tehsil: "Ekka Ghund",
    address: null,
    officialPhone: null,
    sourceName: "KP Population Welfare address book / Health Department list",
    sourceUrl: "https://pwdkp.gov.pk/assets/files/addressbook.pdf",
    sourceType: "government_pdf",
    authority: "Population Welfare Department / Health Department, Government of KP",
    sourceDocumentDate: null,
    reason:
      "Official documents confirm RHC Ekkagund in Mohmand. The Population Welfare book locates an FWC at RHC Ekkagund but does not give a street address for the RHC itself.",
  },
  {
    name: "Swat Medical College",
    status: "needs_review",
    currentOfficialName: "Swat Medical College (private college; not Saidu Medical College)",
    district: "Swat",
    tehsil: null,
    address: null,
    officialPhone: null,
    sourceName: "PMDC public/private college registers and Saidu Medical College",
    sourceUrl: "https://online.pmdc.pk/Colleges/PublicMedicalColleges",
    sourceType: "government_page",
    authority: "Pakistan Medical and Dental Council / Saidu Medical College MTI Swat",
    sourceDocumentDate: null,
    reason:
      "The seniority posting is 'Demonstrator SMC Swat'. Saidu Medical College is the public SMC (smcswat.edu.pk). Swat Medical College (swatmedicalcollege.edu.pk) is a separate private college. The record was not verified as a government facility and its private-college address was not stored.",
  },
  {
    name: "QATHA Nowshera",
    status: "needs_review",
    currentOfficialName: "Unresolved — QATHA is not expanded in the source document",
    district: "Nowshera",
    tehsil: "Nowshera",
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department — Tentative Seniority List Medical Officers BS-17",
    sourceUrl:
      "https://www.healthkp.gov.pk/public/uploads/news-Tentative%20Seniority%20BPS-17%2C%202024%20%281%29.pdf",
    sourceType: "government_pdf",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: "2024-05-01",
    reason:
      "The seniority list writes only 'QATHA Nowshera'. Qazi Hussain Ahmad Medical Complex MTI Nowshera (qhamc.gov.pk) is a government hospital at Kabul River, Mardan Road, Nowshera Kalan, but QATHA was not officially expanded to QHAMC. Identity left unresolved.",
  },
  {
    name: "Koklian Piran",
    status: "needs_review",
    currentOfficialName: "Unresolved — Koklian Piran / BHU Koklian Peeran",
    district: "Abbottabad",
    tehsil: null,
    address: null,
    officialPhone: null,
    sourceName: "KP Health Department posting/transfer index",
    sourceUrl: "https://www.healthkp.gov.pk/downloads/view/2/3",
    sourceType: "government_page",
    authority: "Health Department, Government of Khyber Pakhtunkhwa",
    sourceDocumentDate: "2021-10-04",
    reason:
      "The 2024 seniority list says 'MO Koklian Piran Abbottabad'. A 2021 Health Department transfer lists 'BHU Koklian Peeran, District Haripur'. Official Abbottabad BHU lists do not include this name. District and facility type remain conflicting, so the record was not verified or merged.",
  },
];

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

const ensureSource = async (
  supabase: SupabaseClient,
  decision: FacilityDecision,
) => {
  const { data: existing, error: lookupError } = await supabase
    .from("sources")
    .select("id")
    .eq("name", decision.sourceName)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("sources")
    .insert({
      name: decision.sourceName,
      source_type: decision.sourceType,
      url: decision.sourceUrl,
      authority: decision.authority,
      permission_status: "public_record",
      source_document_date: decision.sourceDocumentDate,
      retrieved_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
};

async function run() {
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
    trustedPmdc: await count(supabase, "doctor_credentials", "match_status", "matched"),
    publicDoctors: await count(supabase, "public_doctor_directory"),
  };

  const { data: facilities, error } = await supabase
    .from("facilities")
    .select(
      "id,name,facility_type,province,district,tehsil,address,official_phone,verification_status,address_source_url,source_id,latitude,longitude",
    )
    .in("name", [...TARGET_NAMES]);
  if (error) throw error;

  if ((facilities ?? []).length !== TARGET_NAMES.length) {
    throw new Error(
      `Expected ${TARGET_NAMES.length} existing target facilities, found ${(facilities ?? []).length}.`,
    );
  }

  const { data: existingEvents, error: eventLookupError } = await supabase
    .from("verification_events")
    .select("id,facility_id,evidence")
    .eq("verification_type", "facility_address");
  if (eventLookupError) throw eventLookupError;

  const alreadyRecorded = new Set(
    (existingEvents ?? [])
      .filter((row) => {
        const evidence = (row.evidence ?? {}) as { reviewBatch?: string };
        return evidence.reviewBatch === REVIEW_BATCH;
      })
      .map((row) => row.facility_id),
  );

  const reportRows = [];

  for (const decision of decisions) {
    const facility = (facilities ?? []).find((row) => row.name === decision.name);
    if (!facility) throw new Error(`Missing facility record: ${decision.name}`);

    const sourceId = await ensureSource(supabase, decision);
    const decidedAt = new Date().toISOString();

    if (decision.status === "verified") {
      if (!decision.address || !decision.sourceUrl) {
        throw new Error(`${decision.name} cannot be verified without address and source URL.`);
      }
      const { error: updateError } = await supabase
        .from("facilities")
        .update({
          address: decision.address,
          official_phone: decision.officialPhone,
          address_source_url: decision.sourceUrl,
          verification_status: "verified",
          last_verified_at: decidedAt,
          updated_at: decidedAt,
        })
        .eq("id", facility.id);
      if (updateError) throw updateError;
    }

    if (!alreadyRecorded.has(facility.id)) {
      const { data: posting } = await supabase
        .from("doctor_postings")
        .select("id,doctor_id,source_id")
        .eq("facility_id", facility.id)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      const { error: eventError } = await supabase.from("verification_events").insert({
        doctor_id: posting?.doctor_id ?? null,
        posting_id: posting?.id ?? null,
        facility_id: facility.id,
        source_id: sourceId,
        verification_type: "facility_address",
        outcome: decision.status === "verified" ? "verified" : "needs_review",
        checked_at: decidedAt,
        evidence: {
          reviewBatch: REVIEW_BATCH,
          reviewerLabel: "facility-review",
          verificationMethod: REVIEW_METHOD,
          historicalName: facility.name,
          historicalSourceId: facility.source_id,
          currentOfficialName: decision.currentOfficialName,
          status: decision.status,
          address: decision.address,
          officialPhone: decision.officialPhone,
          sourceName: decision.sourceName,
          sourceUrl: decision.sourceUrl,
          sourceDocumentDate: decision.sourceDocumentDate,
          notes: decision.reason,
          doctorPublicationUnchanged: true,
        },
      });
      if (eventError) throw eventError;
    }

    reportRows.push({
      facility: decision.name,
      result: decision.status,
      currentOfficialName: decision.currentOfficialName,
      district: decision.district,
      tehsil: decision.tehsil,
      address: decision.address,
      phone: decision.officialPhone,
      source: decision.sourceName,
      sourceUrl: decision.sourceUrl,
      sourceDocumentDate: decision.sourceDocumentDate,
      reason: decision.reason,
    });
  }

  const after = {
    doctors: await count(supabase, "doctors"),
    facilities: await count(supabase, "facilities"),
    trustedPmdc: await count(supabase, "doctor_credentials", "match_status", "matched"),
    publicDoctors: await count(supabase, "public_doctor_directory"),
    publicFacilities: await count(supabase, "public_facility_directory"),
    verifiedFacilities: await count(supabase, "facilities", "verification_status", "verified"),
    needsReviewFacilities: await count(
      supabase,
      "facilities",
      "verification_status",
      "needs_review",
    ),
  };

  console.log(
    JSON.stringify(
      {
        investigated: reportRows.length,
        newlyVerified: reportRows.filter((row) => row.result === "verified").length,
        stillNeedsReview: reportRows.filter((row) => row.result === "needs_review").length,
        leftUnverified: 0,
        safety: {
          additionalDoctorsImported: after.doctors - before.doctors,
          additionalFacilitiesImported: after.facilities - before.facilities,
          pmdcNumbersAdded: after.trustedPmdc - before.trustedPmdc,
          publicDoctorsBefore: before.publicDoctors,
          publicDoctorsAfter: after.publicDoctors,
          publicFacilities: after.publicFacilities,
          verifiedFacilities: after.verifiedFacilities,
          needsReviewFacilities: after.needsReviewFacilities,
        },
        facilities: reportRows,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
