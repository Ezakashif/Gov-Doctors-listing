create extension if not exists "pgcrypto";

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  slug text not null unique,
  is_pilot boolean not null default false,
  created_at timestamptz not null default now(),
  unique (name, province)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null check (source_type in ('government_api', 'government_page', 'government_pdf', 'pmdc', 'fixture')),
  url text,
  authority text,
  permission_status text not null default 'public_record' check (permission_status in ('approved', 'public_record', 'pending', 'prohibited')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id),
  source_id uuid references public.sources(id),
  name text not null,
  slug text not null unique,
  facility_type text not null,
  address text not null,
  official_phone text not null,
  is_government boolean not null default false,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  normalized_name text not null,
  designation text not null,
  specialty text not null,
  publication_status text not null default 'pending' check (publication_status in ('pending', 'published', 'hidden', 'disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- This table is intentionally not part of the public directory view.
-- PMDC registration numbers are used only as internal matching keys.
create table public.doctor_credentials (
  doctor_id uuid primary key references public.doctors(id) on delete cascade,
  pmdc_registration_number text not null unique,
  pmdc_status text not null check (pmdc_status in ('valid', 'expired', 'suspended', 'unknown')),
  verified_at timestamptz,
  source_id uuid references public.sources(id),
  source_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doctor_postings (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  facility_id uuid not null references public.facilities(id),
  source_id uuid not null references public.sources(id),
  government_employment_status text not null check (government_employment_status in ('verified', 'unverified', 'ended', 'disputed')),
  availability_note text not null default 'Please call the hospital to confirm clinic hours.',
  source_record_key text,
  source_evidence jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  stale_after timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (doctor_id, facility_id)
);

create table public.verification_events (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  posting_id uuid references public.doctor_postings(id) on delete cascade,
  source_id uuid not null references public.sources(id),
  verification_type text not null check (verification_type in ('pmdc', 'government_employment', 'facility_contact')),
  outcome text not null check (outcome in ('verified', 'failed', 'inconclusive')),
  checked_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb
);

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id),
  adapter_name text not null,
  status text not null check (status in ('running', 'succeeded', 'failed', 'dry_run')),
  records_seen integer not null default 0,
  records_published integer not null default 0,
  records_rejected integer not null default 0,
  error_summary text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index doctors_normalized_name_idx on public.doctors(normalized_name);
create index facilities_city_idx on public.facilities(city_id);
create index postings_publishable_idx on public.doctor_postings(active, government_employment_status, stale_after);
create index credentials_status_idx on public.doctor_credentials(pmdc_status, verified_at);

alter table public.cities enable row level security;
alter table public.sources enable row level security;
alter table public.facilities enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_credentials enable row level security;
alter table public.doctor_postings enable row level security;
alter table public.verification_events enable row level security;
alter table public.ingestion_runs enable row level security;

revoke all on table public.cities from anon, authenticated;
revoke all on table public.sources from anon, authenticated;
revoke all on table public.facilities from anon, authenticated;
revoke all on table public.doctors from anon, authenticated;
revoke all on table public.doctor_credentials from anon, authenticated;
revoke all on table public.doctor_postings from anon, authenticated;
revoke all on table public.verification_events from anon, authenticated;
revoke all on table public.ingestion_runs from anon, authenticated;

grant all on table public.cities to service_role;
grant all on table public.sources to service_role;
grant all on table public.facilities to service_role;
grant all on table public.doctors to service_role;
grant all on table public.doctor_credentials to service_role;
grant all on table public.doctor_postings to service_role;
grant all on table public.verification_events to service_role;
grant all on table public.ingestion_runs to service_role;

create or replace view public.public_doctor_directory
with (security_invoker = false)
as
select
  d.id,
  d.full_name,
  d.designation,
  d.specialty,
  f.name as facility_name,
  f.facility_type,
  f.address,
  c.name as city,
  c.province,
  f.official_phone,
  p.availability_note,
  true as pmdc_verified,
  true as government_employment_verified,
  s.name as source_name,
  coalesce(s.url, '') as source_url,
  least(dc.verified_at, p.verified_at, f.last_verified_at) as last_verified_at
from public.doctors d
join public.doctor_credentials dc on dc.doctor_id = d.id
join public.doctor_postings p on p.doctor_id = d.id
join public.facilities f on f.id = p.facility_id
join public.cities c on c.id = f.city_id
join public.sources s on s.id = p.source_id
where d.publication_status = 'published'
  and dc.pmdc_status = 'valid'
  and dc.verified_at is not null
  and p.government_employment_status = 'verified'
  and p.active = true
  and f.is_government = true
  and (p.stale_after is null or p.stale_after > now());

revoke all on public.public_doctor_directory from public;
grant select on public.public_doctor_directory to anon, authenticated, service_role;

insert into public.cities (name, province, slug, is_pilot) values
  ('Islamabad', 'Islamabad Capital Territory', 'islamabad', true),
  ('Lahore', 'Punjab', 'lahore', true),
  ('Karachi', 'Sindh', 'karachi', true),
  ('Peshawar', 'Khyber Pakhtunkhwa', 'peshawar', true)
on conflict (slug) do update set is_pilot = excluded.is_pilot;
