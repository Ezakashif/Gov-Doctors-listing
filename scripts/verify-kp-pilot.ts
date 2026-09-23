import { loadEnvConfig } from "@next/env";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

loadEnvConfig(process.cwd());

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

async function count(
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
  const [
    doctors,
    historicalDoctors,
    facilities,
    verifiedFacilities,
    postings,
    credentials,
    matchedCredentials,
    reviewQueue,
    publicRecords,
    verificationEvents,
  ] = await Promise.all([
    count("doctors"),
    count(
      "doctors",
      "government_employment_status",
      "government_record_historical",
    ),
    count("facilities"),
    count("facilities", "verification_status", "verified"),
    count("doctor_postings"),
    count("doctor_credentials"),
    count("doctor_credentials", "match_status", "matched"),
    count("doctor_review_queue"),
    count("public_doctor_directory"),
    count("verification_events"),
  ]);

  console.log(
    JSON.stringify(
      {
        doctors,
        historicalDoctors,
        currentGovernmentDoctors: doctors - historicalDoctors,
        facilities,
        verifiedFacilities,
        postings,
        pmdcCredentials: credentials,
        pmdcMatches: matchedCredentials,
        reviewQueue,
        publicRecords,
        verificationEvents,
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
