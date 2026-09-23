import { loadEnvConfig } from "@next/env";
import { spawnSync } from "node:child_process";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  throw new Error("SUPABASE_DB_URL is not configured in .env.local.");
}

const isWindows = process.platform === "win32";
const command = isWindows ? "npx.cmd" : "npx";
const args = ["--yes", "supabase@latest", "db", "push", "--db-url", databaseUrl];

const result = spawnSync(command, args, {
  env: process.env,
  shell: isWindows,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
