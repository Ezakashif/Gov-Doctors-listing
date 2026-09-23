# Sehat Directory Pakistan

An independent, unofficial directory that helps Pakistani pilgrims locate government doctors for Hajj medical fitness forms.

The initial pilot covers Islamabad, Lahore, Karachi, and Peshawar. A doctor is publishable only when:

1. Their government employment/posting is supported by an attributable source.
2. Their PMDC registration is valid when checked.

PMDC registration numbers are private matching keys. They are never returned by the public API or rendered in the website.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase credentials, the interface clearly displays demonstration records.

## Supabase setup

1. Create a Supabase project.
2. Apply [`supabase/migrations/202609230001_hajj_directory.sql`](supabase/migrations/202609230001_hajj_directory.sql) in the SQL editor or with the Supabase CLI.
3. Copy `.env.example` to `.env.local` and add the project values.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_` or expose it to client code.

The public interface reads only `public_doctor_directory`. The view contains no PMDC registration number and includes only records that pass both verification checks.

## Automated ingestion

The ingestion framework lives in `scripts/ingest/` and separates:

- source adapters that retrieve records;
- normalization and rejection rules;
- internal PMDC-number matching;
- idempotent Supabase upserts;
- stale-record deactivation and run logging.

Test the fixture adapter without writing to the database:

```bash
npm run ingest:dry
```

After configuring Supabase, fixture commits can be tested with:

```bash
npm run ingest:commit
```

The included fixtures are not real public records. Future API, HTML, or PDF adapters must be backed by attributable public government sources and comply with source terms and permissions. Do not automate PMDC queries without approved access.

## Publication and privacy rules

- Publish only verified government medical doctors with a valid PMDC status.
- Display a “PMDC verified” badge, never the PMDC number.
- Publish official facility addresses and switchboards, not private contact details.
- Retain source URLs, evidence timestamps, and verification history internally.
- Hide expired, disputed, stale, or unverifiable records.
- Provide correction and removal channels.
- Do not use government or PMDC branding or imply official endorsement without permission.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run ingest:dry
npm run build
```

This directory is not an emergency service and does not replace current Ministry of Religious Affairs guidance. Users should call the government facility before travelling and use the latest official Hajj medical form.
