import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { FixtureSourceAdapter } from "./fixture-adapter";
import { normalizeRecord } from "./normalize";
import { upsertVerifiedRecord } from "./repository";
import type { IngestionSummary, NormalizedDoctorRecord } from "./types";

const nodeWebSocket = WebSocket as unknown as WebSocketLikeConstructor;
const commit = process.argv.includes("--commit");
const adapter = new FixtureSourceAdapter();

async function run() {
  const rawRecords = await adapter.fetch();
  const deduplicated = new Map<string, NormalizedDoctorRecord>();

  for (const rawRecord of rawRecords) {
    const normalized = normalizeRecord(rawRecord);
    deduplicated.set(rawRecord.pmdcRegistrationNumber, normalized);
  }

  const records = [...deduplicated.values()];
  const publishable = records.filter((record) => record.publishable);
  const rejected = records.filter((record) => !record.publishable);

  const summary: IngestionSummary = {
    adapter: adapter.name,
    recordsSeen: records.length,
    recordsPublishable: publishable.length,
    recordsRejected: rejected.length,
    cities: [...new Set(publishable.map((record) => record.city))].sort(),
  };

  if (!commit) {
    console.log("Ingestion dry run completed.");
    console.log(JSON.stringify(summary, null, 2));
    for (const record of rejected) {
      console.log(`Rejected ${record.sourceRecordKey}: ${record.rejectionReasons.join(", ")}`);
    }
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before using --commit.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: nodeWebSocket },
  });

  const { data: runData, error: runError } = await supabase
    .from("ingestion_runs")
    .insert({
      adapter_name: adapter.name,
      status: "running",
      records_seen: records.length,
      records_rejected: rejected.length,
    })
    .select("id")
    .single();
  if (runError) throw runError;

  try {
    for (const record of publishable) {
      await upsertVerifiedRecord(supabase, record);
    }

    await supabase
      .from("doctor_postings")
      .update({ active: false, updated_at: new Date().toISOString() })
      .lt("stale_after", new Date().toISOString())
      .eq("active", true);

    const { error } = await supabase
      .from("ingestion_runs")
      .update({
        status: "succeeded",
        records_published: publishable.length,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runData.id);
    if (error) throw error;

    console.log("Ingestion commit completed.");
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    await supabase
      .from("ingestion_runs")
      .update({
        status: "failed",
        error_summary: error instanceof Error ? error.message.slice(0, 500) : "Unknown ingestion error",
        finished_at: new Date().toISOString(),
      })
      .eq("id", runData.id);
    throw error;
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
