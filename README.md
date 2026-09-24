# Sehat Directory Pakistan

An independent, unofficial directory that helps Pakistani pilgrims locate government doctors for Hajj medical fitness forms.

The initial pilot covers Islamabad, Lahore, Karachi, and Peshawar. A doctor is publishable only when:

1. Their government employment/posting is supported by an attributable source.
2. Their PMDC registration is valid when checked.

PMDC registration numbers are used as authoritative professional identifiers.
They are returned publicly only for records with an unambiguous official PMDC
match, valid registration, verified current government posting, and verified
Hajj-attestation status.

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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=your-session-pooler-uri
```

The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_` or expose it to client code.

The public interface reads `public_facility_directory` for government
facilities and `public_doctor_directory` for doctors. Doctors appear only after
an unambiguous official PMDC match plus current government-employment, facility,
and Hajj-attestation checks. Unresolved PMDC candidates are never public.

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

## KP historical pilot

The first real-data pilot contains 25 records extracted from the official
**KP Health Department — Tentative Seniority List Medical Officers BS-17**,
as stood on 1 May 2024.

```bash
npm run ingest:kp-pilot:dry
npm run ingest:kp-pilot
npm run verify:kp-pilot
```

The importer is idempotent and matches repeat runs using the source ID and
source record key. These records prove historical appearance in a government
service document only. They are imported with:

- `government_record_historical`;
- `needs_review`;
- `not_verified` Hajj-attestation status;
- no guessed PMDC registration number;
- no public visibility.

The private `doctor_review_queue` view contains records requiring PMDC matching,
current-posting confirmation, or facility-address review. The internal review
console at `/review` is token-gated by `REVIEW_ACCESS_TOKEN` and uses
service-role APIs only.

```bash
npm run db:push
npm run review:pmdc:seed
npm run review:pmdc:demo
npm run verify:pmdc-review
```

PMDC matching is a manual review against the official public register at
[pmdc.pk](https://pmdc.pk/). There is no officially documented bulk API, and
the previously observed search endpoint does not reliably apply combined
full-name + father-name filters. Trusted PMDC fields are written only after an
explicit `verified` decision. Unmatched, ambiguous, needs-more-information, and
rejected decisions keep candidate numbers untrusted and do not publish the
doctor.

Verified facility addresses are published independently of doctor verification.
The remaining pilot facilities stay `needs_review` until an official source
supports an address. Unconfirmed addresses and phone numbers remain `NULL`.

```bash
npm run review:facilities
```

Official public facility directories can be compiled and imported without touching doctors or Hajj statuses:

```bash
npm run ingest:facilities:build
npm run ingest:facilities:dry
npm run ingest:facilities
```

The builder reads official Punjab Health Department Excel exports plus curated official ICT, Balochistan, and Punjab tertiary name lists. A facility is marked `verified` only when the same official source prints a usable address. Existing KP pilot records are left unchanged. See `docs/data-source-research.md` and `docs/data-access-requests.md`.

The internal review console at `/review` can update government, facility, PMDC,
and Hajj statuses separately. None of those actions alone publishes a doctor.

## Publication and privacy rules

- Publish only verified government medical doctors with a valid PMDC status.
- Display the PMDC number only after an unambiguous official match.
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
