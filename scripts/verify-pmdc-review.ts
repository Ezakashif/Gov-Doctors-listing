import { loadEnvConfig } from "@next/env";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { summarizePmdcReview } from "../src/lib/pmdc-review-repository";

loadEnvConfig(process.cwd());

async function count(
  supabase: SupabaseClient,
  table: string,
  column?: string,
  value?: string,
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (column && value) query = query.eq(column, value);
  const { count: result, error } = await query;
  if (error) throw error;
  return result ?? 0;
}

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase credentials are not configured.");
  }

  const nodeWebSocket = WebSocket as unknown as WebSocketLikeConstructor;
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: nodeWebSocket },
  });

  const summary = await summarizePmdcReview(supabase);
  const [
    doctors,
    cases,
    candidates,
    decisions,
    credentials,
    publicRecords,
    historicalGovernment,
    currentGovernment,
    pmdcEvents,
  ] = await Promise.all([
    count(supabase, "doctors"),
    count(supabase, "pmdc_review_cases"),
    count(supabase, "pmdc_candidates"),
    count(supabase, "pmdc_review_decisions"),
    count(supabase, "doctor_credentials"),
    count(supabase, "public_doctor_directory"),
    count(supabase, "doctors", "government_employment_status", "government_record_historical"),
    count(supabase, "doctors", "government_employment_status", "government_current_verified"),
    count(supabase, "verification_events", "verification_type", "pmdc"),
  ]);

  console.log(
    JSON.stringify(
      {
        doctors,
        pmdcReviewCases: cases,
        pmdcCandidates: candidates,
        pmdcReviewDecisions: decisions,
        trustedPmdcCredentials: credentials,
        trustedPmdcMatches: summary.trustedPmdcMatches,
        publicRecords,
        historicalGovernment,
        currentGovernment,
        pmdcVerificationEvents: pmdcEvents,
        pmdcStatusCounts: summary.pmdcStatusCounts,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
