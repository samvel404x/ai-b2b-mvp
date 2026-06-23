-- Backend-generated reports stored as first-class workspace records.

create table if not exists public.genius_reports (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  type text not null,
  title text not null,
  detail text,
  status text not null default 'Draft',
  summary jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.genius_reports is
  'Backend-generated reports built from reviewed evidence, findings, approvals, and audit history.';

create index if not exists genius_reports_workspace_updated_idx
  on public.genius_reports (workspace_id, updated_at desc);

alter table public.genius_reports enable row level security;
revoke all on table public.genius_reports from anon, authenticated;
grant select, insert, update, delete on table public.genius_reports to service_role;

create policy "service_role_full_access" on public.genius_reports
  for all to service_role
  using (true)
  with check (true);
