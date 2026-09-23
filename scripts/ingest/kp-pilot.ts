import { loadEnvConfig } from "@next/env";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { KpSeniorityPilotAdapter } from "./kp-pilot-adapter";
import {
  upsertKpPilotRecord,
  upsertKpPilotSource,
} from "./kp-pilot-repository";

loadEnvConfig(process.cwd());

const nodeWebSocket = WebSocket as unknown as WebSocketLikeConstructor;
const commit = process.argv.includes("--commit");
const adapter = new KpSeniorityPilotAdapter();

async function run() {
  const source = await adapter.source();
  const records = await adapter.fetch();
  const uniqueFacilities = new Set(
    records.map((record) => record.facilitySlug),
  );
  const verifiedFacilities = new Set(
    records
      .filter((record) => record.facility.verificationStatus === "verified")
      .map((record) => record.facilitySlug),
  );

  const baseSummary = {
    adapter: adapter.name,
    source: source.name,
    sourceDocumentDate: source.documentDate,
    recordsExtracted: records.length,
    uniqueFacilities: uniqueFacilities.size,
    facilitiesWithVerifiedAddresses: verifiedFacilities.size,
    pmdcMatches: 0,
    pmdcUnmatched: records.length,
    governmentCurrentVerified: 0,
    governmentHistorical: records.length,
    requiresReview: records.length,
  };

  if (!commit) {
    console.log("KP pilot dry run completed.");
    console.log(JSON.stringify(baseSummary, null, 2));
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before using --commit.",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: nodeWebSocket },
  });

  const sourceRow = await upsertKpPilotSource(supabase, source);
  const { data: runData, error: runError } = await supabase
    .from("ingestion_runs")
    .insert({
      source_id: sourceRow.id,
      adapter_name: adapter.name,
      status: "running",
      records_seen: records.length,
    })
    .select("id")
    .single();
  if (runError) throw runError;

  let imported = 0;
  const errors: Array<{ sourceRecordKey: string; message: string }> = [];

  for (const record of records) {
    try {
      await upsertKpPilotRecord(supabase, source, sourceRow.id, record);
      imported += 1;
    } catch (error) {
      errors.push({
        sourceRecordKey: record.sourceRecordKey,
        message: error instanceof Error ? error.message : "Unknown import error",
      });
    }
  }

  const errorSummary = errors.length
    ? JSON.stringify(errors).slice(0, 500)
    : null;
  const { error: finishError } = await supabase
    .from("ingestion_runs")
    .update({
      status: errors.length ? "failed" : "succeeded",
      records_published: 0,
      records_rejected: errors.length,
      error_summary: errorSummary,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runData.id);
  if (finishError) throw finishError;

  const summary = {
    ...baseSummary,
    recordsImported: imported,
    importErrors: errors.length,
  };
  console.log("KP pilot import completed.");
  console.log(JSON.stringify(summary, null, 2));

  if (errors.length) {
    for (const error of errors) {
      console.error(`${error.sourceRecordKey}: ${error.message}`);
    }
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
