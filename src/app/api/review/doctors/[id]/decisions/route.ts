import { NextResponse } from "next/server";
import type { PmdcReviewDecisionName } from "@/lib/pmdc-review";
import { applyPmdcDecision } from "@/lib/pmdc-review-repository";
import { requireReviewAccess } from "@/lib/review-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DecisionBody = {
  decision?: PmdcReviewDecisionName;
  reviewerLabel?: string;
  notes?: string | null;
  candidateId?: string | null;
  verificationMethod?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = requireReviewAccess(request);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as DecisionBody;
    if (!body.decision || !body.reviewerLabel) {
      return NextResponse.json(
        { error: "Decision and reviewer label are required." },
        { status: 400 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const detail = await applyPmdcDecision(supabase, {
      doctorId: id,
      decision: body.decision,
      reviewerLabel: body.reviewerLabel,
      notes: body.notes,
      candidateId: body.candidateId,
      verificationMethod: body.verificationMethod,
    });
    return NextResponse.json(
      { detail },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Review decision failed.",
      },
      { status: 400 },
    );
  }
}
