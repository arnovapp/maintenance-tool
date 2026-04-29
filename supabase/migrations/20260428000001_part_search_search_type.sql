-- Adds a discriminator to part_search so contractor-finding searches
-- can share the table per docs/task-breakdown.md T2.2.
--
-- Existing rows are backfilled to 'part' (the only thing the table
-- has stored to date). Going forward, contractor searches insert
-- with search_type = 'contractor' and use a different result shape
-- in the `results` JSONB column.

alter table public.part_search
  add column search_type text not null default 'part'
  check (search_type in ('part', 'contractor'));

create index part_search_search_type_idx on public.part_search (search_type);

-- The composite index is what /searches and /contractors use to list
-- recent results in their respective tabs.
create index part_search_search_type_created_at_idx
  on public.part_search (search_type, created_at desc);
