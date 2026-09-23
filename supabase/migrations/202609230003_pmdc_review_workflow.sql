-- PMDC review workflow: keep trusted credentials separate from candidate
-- results and append-only reviewer decisions. Public publication rules
-- are unchanged.

alter table public.doctor_credentials
  drop constraint if exists doctor_credentials_match_status_check,
  add constraint doctor_credentials_match_status_check
    check (match_status in (
      'matched',
      'unmatched',
      'ambiguous',
      'not_checked',
      'needs_more_information',
      'rejected'
    ));

alter table public.verification_events
  drop constraint if exists verification_events_outcome_check,
  add constraint verification_events_outcome_check
    check (outcome in (
      'verified',
      'failed',
      'inconclusive',
      'ambiguous',
      'needs_review',
      'unmatched',
      'rejected',
      'needs_more_information'
    ));

create table if not exists public.pmdc_review_cases (
  doctor_id uuid primary key references public.doctors(id) on delete cascade,
  status text not null default 'pending_review'
    check (status in (
      'pending_review',
      'verified',
      'unmatched',
      'ambiguous',
      'needs_more_information',
      'rejected'
    )),
  latest_decision_id uuid,
  opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pmdc_candidates (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  source_id uuid references public.sources(id),
  registration_number text,
  practitioner_name text,
  father_name text,
  qualification text,
  medical_college text,
  pmdc_status text
    check (pmdc_status is null or pmdc_status in ('valid', 'expired', 'suspended', 'unknown')),
  valid_until date,
  match_evidence jsonb not null default '{}'::jsonb,
  search_criteria jsonb not null default '{}'::jsonb,
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.pmdc_review_decisions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  candidate_id uuid references public.pmdc_candidates(id) on delete set null,
  decision text not null
    check (decision in (
      'verified',
      'unmatched',
      'ambiguous',
      'needs_more_information',
      'rejected'
    )),
  reviewer_label text not null,
  notes text,
  decided_at timestamptz not null default now(),
  verification_method text not null,
  source_id uuid references public.sources(id),
  source_name text not null,
  source_url text not null,
  source_document_date date,
  evidence jsonb not null default '{}'::jsonb
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pmdc_review_cases_latest_decision_id_fkey'
  ) then
    alter table public.pmdc_review_cases
      add constraint pmdc_review_cases_latest_decision_id_fkey
      foreign key (latest_decision_id) references public.pmdc_review_decisions(id);
  end if;
end $$;

create index if not exists pmdc_candidates_doctor_idx
  on public.pmdc_candidates(doctor_id, created_at desc);

create index if not exists pmdc_review_decisions_doctor_idx
  on public.pmdc_review_decisions(doctor_id, decided_at desc);

create index if not exists pmdc_review_cases_status_idx
  on public.pmdc_review_cases(status, updated_at desc);

alter table public.pmdc_review_cases enable row level security;
alter table public.pmdc_candidates enable row level security;
alter table public.pmdc_review_decisions enable row level security;

revoke all on table public.pmdc_review_cases from public, anon, authenticated;
revoke all on table public.pmdc_candidates from public, anon, authenticated;
revoke all on table public.pmdc_review_decisions from public, anon, authenticated;

grant all on table public.pmdc_review_cases to service_role;
grant all on table public.pmdc_candidates to service_role;
grant all on table public.pmdc_review_decisions to service_role;

drop view if exists public.doctor_review_queue;

create view public.doctor_review_queue
with (security_invoker = true)
as
select
  d.id as doctor_id,
  d.full_name,
  d.father_name,
  d.qualification,
  d.designation,
  d.specialty,
  d.verification_status,
  d.government_employment_status,
  d.hajj_attestation_status,
  coalesce(prc.status, 'pending_review') as pmdc_review_status,
  dc.match_status as pmdc_match_status,
  dc.pmdc_status,
  dc.pmdc_registration_number,
  dc.pmdc_valid_until,
  dc.verified_at as pmdc_verified_at,
  p.id as posting_id,
  p.source_record_key,
  p.government_employment_status as posting_status,
  p.posting_as_of_date,
  p.designation as posting_designation,
  f.id as facility_id,
  f.name as facility_name,
  f.verification_status as facility_verification_status,
  f.address is null as facility_address_missing,
  f.address as facility_address,
  s.name as source_name,
  coalesce(s.url, '') as source_url,
  s.source_document_date,
  prc.updated_at as pmdc_review_updated_at
from public.doctors d
left join public.doctor_credentials dc on dc.doctor_id = d.id
left join public.doctor_postings p on p.doctor_id = d.id and p.active = true
left join public.facilities f on f.id = p.facility_id
left join public.sources s on s.id = p.source_id
left join public.pmdc_review_cases prc on prc.doctor_id = d.id
where d.verification_status <> 'verified'
   or d.government_employment_status <> 'government_current_verified'
   or d.hajj_attestation_status <> 'verified'
   or dc.doctor_id is null
   or dc.match_status <> 'matched'
   or coalesce(prc.status, 'pending_review') <> 'verified'
   or f.verification_status <> 'verified'
   or f.address is null;

revoke all on public.doctor_review_queue from public, anon, authenticated;
grant select on public.doctor_review_queue to service_role;

insert into public.sources (
  name,
  source_type,
  url,
  authority,
  permission_status,
  source_document_date,
  retrieved_at,
  active,
  updated_at
) values (
  'PM&DC Practitioner Register — public search',
  'pmdc',
  'https://pmdc.pk/',
  'Pakistan Medical and Dental Council',
  'public_record',
  null,
  now(),
  true,
  now()
)
on conflict (name) do update
set
  url = excluded.url,
  authority = excluded.authority,
  permission_status = excluded.permission_status,
  retrieved_at = now(),
  active = true,
  updated_at = now();
