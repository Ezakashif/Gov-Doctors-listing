import { NextResponse } from "next/server";
import { loadPublicFacilities } from "@/lib/load-facilities";

export async function GET() {
  const response = await loadPublicFacilities();
  return NextResponse.json(response, {
    headers: {
      "Cache-Control":
        response.mode === "database"
          ? "public, s-maxage=300, stale-while-revalidate=900"
          : "no-store",
    },
  });
}
