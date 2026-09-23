import { NextResponse } from "next/server";
import {
  listPmdcReviewQueue,
  openPendingPmdcReviewCases,
} from "@/lib/pmdc-review-repository";
import { requireReviewAccess } from "@/lib/review-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireReviewAccess(request);
  if (denied) return denied;

  try {
    const supabase = createServiceSupabaseClient();
    await openPendingPmdcReviewCases(supabase);
    const queue = await listPmdcReviewQueue(supabase);
    return NextResponse.json(
      { queue },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review queue failed." },
      { status: 500 },
    );
  }
}
