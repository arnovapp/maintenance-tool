-- v1 schema for The Maintenance Tool.
-- Defines the four entities described in docs/prd.md section 5:
--   equipment, vendor, part_search, email_draft.
--
-- Conventions
--   - UUID primary keys (gen_random_uuid via pgcrypto)
--   - TIMESTAMPTZ for all timestamps
--   - updated_at maintained by a trigger; part_search has none
--     because searches are immutable historical records
--   - CHECK constraints (not PG ENUMs) for constrained string columns;
--     easier to extend without migration pain later
--   - RLS enabled on every table; v1 policies are permissive (anon and
--     authenticated allowed everything) since access is gated by Vercel
--     password protection. The v2 auth migration tightens these to per-user
--     policies and is a policy rewrite, not a 'enable RLS + policy'
--     two-step.

create extension if not exists "pgcrypto";

-- Generic updated_at trigger function reused across tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =====================================================================
-- equipment
-- =====================================================================

create table public.equipment (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text,
  manufacturer  text,
  model         text,
  serial        text,
  install_date  date,
  location      text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.equipment is
  'Major pieces of gear at the facility. Created incidentally from part searches in v1.';

create index equipment_name_search_idx
  on public.equipment using gin (to_tsvector('simple', coalesce(name, '')));
create index equipment_manufacturer_model_idx
  on public.equipment (manufacturer, model);

create trigger equipment_set_updated_at
  before update on public.equipment
  for each row
  execute function public.set_updated_at();


-- =====================================================================
-- vendor
-- =====================================================================

create table public.vendor (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('supplier', 'contractor', 'service')),
  email       text,
  phone       text,
  website     text,
  specialty   text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.vendor is
  'Suppliers, contractors, and service providers. Created from sourcing or contractor-finding flows.';

create index vendor_type_idx on public.vendor (type);
create index vendor_name_search_idx
  on public.vendor using gin (to_tsvector('simple', coalesce(name, '')));

create trigger vendor_set_updated_at
  before update on public.vendor
  for each row
  execute function public.set_updated_at();


-- =====================================================================
-- part_search
-- =====================================================================

create table public.part_search (
  id                uuid primary key default gen_random_uuid(),
  input_text        text,
  input_image_url   text,
  results           jsonb not null default '[]'::jsonb,
  chosen_result_id  text,
  equipment_id      uuid references public.equipment(id) on delete set null,
  created_at        timestamptz not null default now(),
  -- A row must capture *some* input — text, image, or both.
  constraint part_search_has_input
    check (input_text is not null or input_image_url is not null)
);

comment on table public.part_search is
  'Saved part-sourcing searches. Immutable history — no updated_at.';

create index part_search_equipment_id_idx
  on public.part_search (equipment_id);
create index part_search_created_at_idx
  on public.part_search (created_at desc);


-- =====================================================================
-- email_draft
-- =====================================================================

create table public.email_draft (
  id               uuid primary key default gen_random_uuid(),
  recipient_email  text not null,
  subject          text not null,
  body             text not null,
  attachments      jsonb not null default '[]'::jsonb,
  vendor_id        uuid references public.vendor(id) on delete set null,
  context_type     text check (context_type in ('part_search', 'vendor', 'equipment')),
  context_id       uuid,
  status           text not null default 'draft' check (status in ('draft', 'sent', 'ignored')),
  gmail_draft_id   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.email_draft is
  'Tool-side index of email drafts. Drafts live in Gmail; gmail_draft_id is the link.';

create index email_draft_vendor_id_idx on public.email_draft (vendor_id);
create index email_draft_status_idx on public.email_draft (status);
create index email_draft_created_at_idx
  on public.email_draft (created_at desc);

create trigger email_draft_set_updated_at
  before update on public.email_draft
  for each row
  execute function public.set_updated_at();


-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.equipment    enable row level security;
alter table public.vendor       enable row level security;
alter table public.part_search  enable row level security;
alter table public.email_draft  enable row level security;

create policy "v1: full access for anon and authenticated on equipment"
  on public.equipment
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "v1: full access for anon and authenticated on vendor"
  on public.vendor
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "v1: full access for anon and authenticated on part_search"
  on public.part_search
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "v1: full access for anon and authenticated on email_draft"
  on public.email_draft
  for all
  to anon, authenticated
  using (true)
  with check (true);
