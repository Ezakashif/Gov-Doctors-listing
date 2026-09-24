-- Public government-facility discovery and facility-scoped verification
-- events. Doctor publication rules stay unchanged.

alter table public.verification_events
  alter column doctor_id drop not null,
  add column if not exists facility_id uuid references public.facilities(id) on delete cascade;

alter table public.verification_events
  drop constraint if exists verification_events_subject_check,
  add constraint verification_events_subject_check
    check (doctor_id is not null or facility_id is not null);

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
      'needs_more_information',
      'needs_confirmation',
      'not_verified'
    ));

create index if not exists verification_events_facility_idx
  on public.verification_events(facility_id, verification_type, checked_at desc);

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
  f.id as facility_id,
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

drop view if exists public.public_facility_directory;

create view public.public_facility_directory
with (security_invoker = false)
as
select
  f.id,
  f.name,
  f.facility_type,
  f.province,
  f.district,
  f.tehsil,
  coalesce(c.name, f.tehsil, f.district) as city,
  f.address,
  f.official_phone,
  f.latitude,
  f.longitude,
  f.verification_status,
  f.last_verified_at,
  s.name as source_name,
  coalesce(f.address_source_url, s.url, '') as source_url,
  s.source_document_date
from public.facilities f
left join public.cities c on c.id = f.city_id
left join public.sources s on s.id = f.source_id
where f.is_government = true
  and f.verification_status = 'verified'
  and f.address is not null;

revoke all on public.public_facility_directory from public;
grant select on public.public_facility_directory to anon, authenticated, service_role;
