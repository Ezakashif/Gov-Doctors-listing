import { NextResponse } from "next/server";
import { requireReviewAccess } from "@/lib/review-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = requireReviewAccess(request);
  if (denied) return denied;
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
