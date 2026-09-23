import { NextResponse } from "next/server";
import {
  type DirectoryResponse,
  type PublicDoctor,
  sampleDoctors,
} from "@/lib/directory";
import { createPublicSupabaseClient } from "@/lib/supabase/client";

type DirectoryRow = {
  id: string;
  full_name: string;
  designation: string;
  specialty: string;
  qualification: string | null;
  pmdc_registration_number: string;
  pmdc_status: "valid";
  pmdc_valid_until: string | null;
  government_employment_status: "government_current_verified";
  hajj_attestation_status: "verified";
  facility_name: string;
  facility_type: string;
  address: string | null;
  city: string | null;
  province: string;
  district: string | null;
  tehsil: string | null;
  official_phone: string | null;
  availability_note: string;
  source_name: string;
  source_url: string;
  source_document_date: string | null;
  last_verified_at: string;
};

const toPublicDoctor = (row: DirectoryRow): PublicDoctor => ({
  id: row.id,
  name: row.full_name,
  designation: row.designation,
  specialty: row.specialty,
  pmdcRegistrationNumber: row.pmdc_registration_number,
  pmdcStatus: row.pmdc_status,
  pmdcValidUntil: row.pmdc_valid_until,
  facilityName: row.facility_name,
  facilityType: row.facility_type,
  address: row.address ?? "Address pending verification",
  city: row.city ?? row.district ?? "Location pending verification",
  province: row.province,
  district: row.district,
  tehsil: row.tehsil,
  officialPhone: row.official_phone ?? "Not available",
  availabilityNote: row.availability_note,
  pmdcVerified: true,
  governmentEmploymentVerified: true,
  governmentStatus: row.government_employment_status,
  hajjAttestationStatus: row.hajj_attestation_status,
  sourceName: row.source_name,
  sourceUrl: row.source_url,
  sourceDocumentDate: row.source_document_date,
  lastVerifiedAt: row.last_verified_at,
});

export async function GET() {
  const supabase = createPublicSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("public_doctor_directory")
      .select(
        "id,full_name,designation,specialty,qualification,pmdc_registration_number,pmdc_status,pmdc_valid_until,government_employment_status,hajj_attestation_status,facility_name,facility_type,address,city,province,district,tehsil,official_phone,availability_note,source_name,source_url,source_document_date,last_verified_at",
      )
      .order("city")
      .order("full_name");

    if (!error && data) {
      const response: DirectoryResponse = {
        doctors: (data as DirectoryRow[]).map(toPublicDoctor),
        mode: "database",
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(response, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
      });
    }

    console.error("Public directory query failed:", error?.message);
  }

  const fallback: DirectoryResponse = {
    doctors: sampleDoctors,
    mode: "sample",
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(fallback, {
    headers: { "Cache-Control": "no-store" },
  });
}
