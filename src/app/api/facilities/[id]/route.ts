import { NextResponse } from "next/server";
import {
  type FacilityDetailResponse,
  type PublicFacilityDoctor,
  type PublicFacilityRow,
  sampleFacilities,
  toPublicFacility,
} from "@/lib/facilities";
import { createPublicSupabaseClient } from "@/lib/supabase/client";

type DoctorRow = {
  id: string;
  full_name: string;
  designation: string;
  specialty: string;
  pmdc_registration_number: string | null;
  pmdc_status: "valid" | null;
  last_verified_at: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = createPublicSupabaseClient();

  if (supabase) {
    const { data: facility, error: facilityError } = await supabase
      .from("public_facility_directory")
      .select(
        "id,name,facility_type,province,district,tehsil,city,address,official_phone,verification_status,last_verified_at,source_name,source_url,source_document_date",
      )
      .eq("id", id)
      .maybeSingle();

    if (!facilityError && facility) {
      const { data: doctors } = await supabase
        .from("public_doctor_directory")
        .select(
          "id,full_name,designation,specialty,pmdc_registration_number,pmdc_status,last_verified_at",
        )
        .eq("facility_id", id)
        .order("full_name");

      const response: FacilityDetailResponse = {
        facility: toPublicFacility(facility as PublicFacilityRow),
        doctors: ((doctors ?? []) as DoctorRow[]).map(
          (row): PublicFacilityDoctor => ({
            id: row.id,
            name: row.full_name,
            designation: row.designation,
            specialty: row.specialty,
            pmdcRegistrationNumber: row.pmdc_registration_number ?? undefined,
            pmdcStatus: row.pmdc_status ?? undefined,
            lastVerifiedAt: row.last_verified_at,
          }),
        ),
        mode: "database",
      };
      return NextResponse.json(response, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
      });
    }
  }

  const sample = sampleFacilities.find((item) => item.id === id);
  if (!sample) {
    return NextResponse.json({ error: "Facility not found." }, { status: 404 });
  }

  return NextResponse.json(
    { facility: sample, doctors: [], mode: "sample" } satisfies FacilityDetailResponse,
    { headers: { "Cache-Control": "no-store" } },
  );
}
