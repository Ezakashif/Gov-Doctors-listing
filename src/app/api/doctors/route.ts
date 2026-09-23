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
  facility_name: string;
  facility_type: string;
  address: string;
  city: string;
  province: string;
  official_phone: string;
  availability_note: string;
  pmdc_verified: true;
  government_employment_verified: true;
  source_name: string;
  source_url: string;
  last_verified_at: string;
};

const toPublicDoctor = (row: DirectoryRow): PublicDoctor => ({
  id: row.id,
  name: row.full_name,
  designation: row.designation,
  specialty: row.specialty,
  facilityName: row.facility_name,
  facilityType: row.facility_type,
  address: row.address,
  city: row.city,
  province: row.province,
  officialPhone: row.official_phone,
  availabilityNote: row.availability_note,
  pmdcVerified: row.pmdc_verified,
  governmentEmploymentVerified: row.government_employment_verified,
  sourceName: row.source_name,
  sourceUrl: row.source_url,
  lastVerifiedAt: row.last_verified_at,
});

export async function GET() {
  const supabase = createPublicSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("public_doctor_directory")
      .select(
        "id,full_name,designation,specialty,facility_name,facility_type,address,city,province,official_phone,availability_note,pmdc_verified,government_employment_verified,source_name,source_url,last_verified_at",
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
