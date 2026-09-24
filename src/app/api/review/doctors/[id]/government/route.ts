import { NextResponse } from "next/server";
import type { GovernmentReviewAction } from "@/lib/pmdc-review";
import { applyGovernmentDecision } from "@/lib/pmdc-review-repository";
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
    const body = (await request.json()) as {
      status?: GovernmentReviewAction;
      reviewerLabel?: string;
      notes?: string;
    };
    if (!body.status || !body.reviewerLabel || !body.notes) {
      return NextResponse.json(
        { error: "Status, reviewer label, and notes are required." },
        { status: 400 },
      );
    }
    const supabase = createServiceSupabaseClient();
    const detail = await applyGovernmentDecision(supabase, {
      doctorId: id,
      status: body.status,
      reviewerLabel: body.reviewerLabel,
      notes: body.notes,
    });
    return NextResponse.json(
      { detail },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Government review failed.",
      },
      { status: 400 },
    );
  }
}
