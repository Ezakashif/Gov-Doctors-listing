import {
  type FacilityDirectoryResponse,
  type PublicFacilityRow,
  sampleFacilities,
  toPublicFacility,
} from "@/lib/facilities";
import { createPublicSupabaseClient } from "@/lib/supabase/client";

export async function loadPublicFacilities(): Promise<FacilityDirectoryResponse> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return {
      facilities: sampleFacilities,
      mode: "sample",
      updatedAt: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("public_facility_directory")
    .select(
      "id,name,facility_type,province,district,tehsil,city,address,official_phone,verification_status,last_verified_at,source_name,source_url,source_document_date",
    )
    .order("province")
    .order("city")
    .order("name");

  if (error || !data) {
    console.error("Public facility query failed:", error?.message);
    return {
      facilities: sampleFacilities,
      mode: "sample",
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    facilities: (data as PublicFacilityRow[]).map(toPublicFacility),
    mode: "database",
    updatedAt: new Date().toISOString(),
  };
}
