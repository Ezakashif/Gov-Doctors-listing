import { NextResponse } from "next/server";
import type { AddPmdcCandidateInput } from "@/lib/pmdc-review";
import { addPmdcCandidate } from "@/lib/pmdc-review-repository";
import { requireReviewAccess } from "@/lib/review-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = requireReviewAccess(request);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as AddPmdcCandidateInput;
    const supabase = createServiceSupabaseClient();
    const candidate = await addPmdcCandidate(supabase, id, body);
    return NextResponse.json(
      { candidate },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Candidate recording failed.",
      },
      { status: 400 },
    );
  }
}
