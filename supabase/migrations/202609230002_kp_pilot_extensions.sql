alter table public.sources
  add column if not exists source_document_date date,
  add column if not exists retrieved_at timestamptz;

alter table public.doctors
  add column if not exists father_name text,
  add column if not exists qualification text,
  add column if not exists government_employment_status text not null default 'needs_current_verification',
  add column if not exists verification_status text not null default 'needs_review',
  add column if not exists hajj_attestation_status text not null default 'not_verified';

alter table public.doctors
  drop constraint if exists doctors_government_employment_status_check,
  add constraint doctors_government_employment_status_check
    check (government_employment_status in (
      'government_record_historical',
      'government_current_verified',
      'needs_current_verification',
      'not_government'
    )),
  drop constraint if exists doctors_verification_status_check,
  add constraint doctors_verification_status_check
    check (verification_status in ('verified', 'needs_review', 'unverified', 'ambiguous')),
  drop constraint if exists doctors_hajj_attestation_status_check,
  add constraint doctors_hajj_attestation_status_check
    check (hajj_attestation_status in ('verified', 'likely', 'needs_confirmation', 'not_verified'));

alter table public.doctor_credentials
  add column if not exists pmdc_valid_until date,
  add column if not exists match_status text not null default 'not_checked',
  add column if not exists qualification text;

alter table public.doctor_credentials
  drop constraint if exists doctor_credentials_match_status_check,
  add constraint doctor_credentials_match_status_check
    check (match_status in ('matched', 'unmatched', 'ambiguous', 'not_checked'));

alter table public.facilities
  alter column city_id drop not null,
  alter column address drop not null,
  alter column official_phone drop not null,
  add column if not exists province text,
  add column if not exists district text,
  add column if not exists tehsil text,
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  add column if not exists verification_status text not null default 'needs_review',
  add column if not exists address_source_url text;

alter table public.facilities
  drop constraint if exists facilities_verification_status_check,
  add constraint facilities_verification_status_check
    check (verification_status in ('verified', 'needs_review', 'unverified'));

alter table public.doctor_postings
  drop constraint if exists doctor_postings_government_employment_status_check,
  add constraint doctor_postings_government_employment_status_check
    check (government_employment_status in (
      'government_record_historical',
      'government_current_verified',
      'needs_current_verification',
      'unverified',
      'ended',
      'disputed'
    )),
  add column if not exists source_document_date date,
  add column if not exists posting_as_of_date date,
  add column if not exists designation text,
  add column if not exists government_service_entry_date date,
  add column if not exists recruitment_method text,
  add column if not exists remarks text,
  add column if not exists is_current_confirmed boolean not null default false;

alter table public.doctor_postings
  drop constraint if exists doctor_postings_doctor_id_facility_id_key;

create unique index if not exists doctor_postings_source_record_unique
  on public.doctor_postings(source_id, source_record_key);

alter table public.verification_events
  drop constraint if exists verification_events_verification_type_check,
  add constraint verification_events_verification_type_check
    check (verification_type in (
      'pmdc',
      'government_employment',
      'facility_contact',
      'facility_address',
      'hajj_attestation'
    )),
  drop constraint if exists verification_events_outcome_check,
  add constraint verification_events_outcome_check
    check (outcome in ('verified', 'failed', 'inconclusive', 'ambiguous', 'needs_review'));

create unique index if not exists verification_events_idempotency_unique
  on public.verification_events(doctor_id, source_id, verification_type, checked_at);

drop view if exists public.public_doctor_directory;

create view public.public_doctor_directory
with (security_invoker = false)
as
select
  d.id,
  d.full_name,
  d.designation,
  d.specialty,
  d.qualification,
  dc.pmdc_registration_number,
  dc.pmdc_status,
  dc.pmdc_valid_until,
  d.government_employment_status,
  d.hajj_attestation_status,
  f.name as facility_name,
  f.facility_type,
  f.address,
  coalesce(c.name, f.tehsil, f.district) as city,
  coalesce(f.province, c.province) as province,
  f.district,
  f.tehsil,
  f.latitude,
  f.longitude,
  f.official_phone,
  p.availability_note,
  s.name as source_name,
  coalesce(s.url, '') as source_url,
  s.source_document_date,
  least(dc.verified_at, p.verified_at, f.last_verified_at) as last_verified_at
from public.doctors d
join public.doctor_credentials dc on dc.doctor_id = d.id
join public.doctor_postings p on p.doctor_id = d.id
join public.facilities f on f.id = p.facility_id
left join public.cities c on c.id = f.city_id
join public.sources s on s.id = p.source_id
where d.publication_status = 'published'
  and d.verification_status = 'verified'
  and d.government_employment_status = 'government_current_verified'
  and d.hajj_attestation_status = 'verified'
  and dc.pmdc_status = 'valid'
  and dc.match_status = 'matched'
  and dc.verified_at is not null
  and p.government_employment_status = 'government_current_verified'
  and p.is_current_confirmed = true
  and p.active = true
  and f.is_government = true
  and f.verification_status = 'verified'
  and (p.stale_after is null or p.stale_after > now());

revoke all on public.public_doctor_directory from public;
grant select on public.public_doctor_directory to anon, authenticated, service_role;

create or replace view public.doctor_review_queue
with (security_invoker = true)
as
select
  d.id as doctor_id,
  d.full_name,
  d.father_name,
  d.verification_status,
  d.government_employment_status,
  d.hajj_attestation_status,
  dc.match_status as pmdc_match_status,
  dc.pmdc_status,
  p.id as posting_id,
  p.source_record_key,
  p.government_employment_status as posting_status,
  p.posting_as_of_date,
  f.id as facility_id,
  f.name as facility_name,
  f.verification_status as facility_verification_status,
  f.address is null as facility_address_missing,
  s.name as source_name,
  s.source_document_date
from public.doctors d
left join public.doctor_credentials dc on dc.doctor_id = d.id
left join public.doctor_postings p on p.doctor_id = d.id and p.active = true
left join public.facilities f on f.id = p.facility_id
left join public.sources s on s.id = p.source_id
where d.verification_status <> 'verified'
   or d.government_employment_status <> 'government_current_verified'
   or d.hajj_attestation_status <> 'verified'
   or dc.doctor_id is null
   or dc.match_status <> 'matched'
   or f.verification_status <> 'verified'
   or f.address is null;

revoke all on public.doctor_review_queue from public, anon, authenticated;
grant select on public.doctor_review_queue to service_role;
