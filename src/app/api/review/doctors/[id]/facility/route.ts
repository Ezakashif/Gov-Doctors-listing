import { NextResponse } from "next/server";
import type { FacilityReviewAction } from "@/lib/pmdc-review";
import { applyFacilityDecision } from "@/lib/pmdc-review-repository";
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
      status?: FacilityReviewAction;
      reviewerLabel?: string;
      notes?: string;
      address?: string | null;
      officialPhone?: string | null;
      sourceUrl?: string | null;
    };
    if (!body.status || !body.reviewerLabel || !body.notes) {
      return NextResponse.json(
        { error: "Status, reviewer label, and notes are required." },
        { status: 400 },
      );
    }
    const supabase = createServiceSupabaseClient();
    const detail = await applyFacilityDecision(supabase, {
      doctorId: id,
      status: body.status,
      reviewerLabel: body.reviewerLabel,
      notes: body.notes,
      address: body.address,
      officialPhone: body.officialPhone,
      sourceUrl: body.sourceUrl,
    });
    return NextResponse.json(
      { detail },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Facility review failed.",
      },
      { status: 400 },
    );
  }
}
