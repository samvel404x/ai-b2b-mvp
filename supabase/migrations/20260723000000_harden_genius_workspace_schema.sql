-- GENIUS production hardening migration.
-- Idempotent: safe to run after the earlier MVP migrations or on a fresh project.
-- Runtime access remains server-only through SUPABASE_SERVICE_ROLE_KEY.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.genius_workspaces (
  id text primary key,
  version integer not null default 1,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_evidence_records (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  name text not null,
  url text,
  size_label text,
  bytes bigint not null default 0,
  mime_type text,
  kind text,
  source text,
  status text not null default 'Needs review',
  provider text,
  provider_status text,
  model text,
  fields jsonb not null default '{}'::jsonb,
  extracted jsonb not null default '{}'::jsonb,
  evidence_snippets jsonb not null default '[]'::jsonb,
  confidence integer,
  error text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_vendors (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  name text not null,
  owner text,
  source_evidence_ids jsonb not null default '[]'::jsonb,
  total_exposure numeric(15, 2) not null default 0,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_contracts (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  vendor_id text references public.genius_vendors(id) on delete cascade,
  vendor_name text not null,
  evidence_id text references public.genius_evidence_records(id) on delete set null,
  value numeric(15, 2) not null default 0,
  currency text not null default 'USD',
  start_date text,
  end_date text,
  renewal_date text,
  notice_period_days integer,
  auto_renewal boolean,
  status text not null default 'Reviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_invoices (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  vendor_id text references public.genius_vendors(id) on delete cascade,
  vendor_name text not null,
  evidence_id text references public.genius_evidence_records(id) on delete set null,
  invoice_number text,
  total numeric(15, 2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'Reviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_spend_rows (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  vendor_id text references public.genius_vendors(id) on delete cascade,
  vendor_name text not null,
  evidence_id text references public.genius_evidence_records(id) on delete set null,
  amount numeric(15, 2) not null default 0,
  currency text not null default 'USD',
  source text,
  status text not null default 'Reviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_action_states (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  finding_id text,
  title text not null,
  description text,
  impact numeric(15, 2) not null default 0,
  owner text,
  status text not null default 'Needs review',
  approval_channel text not null default 'web',
  mobile_ready boolean not null default false,
  external_execution jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_reports (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  type text,
  title text not null,
  detail text,
  description text,
  status text not null default 'Draft',
  owner text,
  summary jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genius_audit_log (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  type text not null,
  actor text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.genius_evidence_records add column if not exists bytes bigint not null default 0;
alter table public.genius_action_states add column if not exists finding_id text;
alter table public.genius_reports add column if not exists description text;
alter table public.genius_reports add column if not exists status text not null default 'Draft';
alter table public.genius_reports add column if not exists owner text;
alter table public.genius_reports add column if not exists published_at timestamptz;
alter table public.genius_reports add column if not exists created_at timestamptz not null default now();

alter table public.genius_vendors alter column total_exposure type numeric(15, 2) using total_exposure::numeric;
alter table public.genius_contracts alter column value type numeric(15, 2) using value::numeric;
alter table public.genius_invoices alter column total type numeric(15, 2) using total::numeric;
alter table public.genius_spend_rows alter column amount type numeric(15, 2) using amount::numeric;
alter table public.genius_action_states alter column impact type numeric(15, 2) using impact::numeric;

create index if not exists genius_workspaces_updated_idx on public.genius_workspaces(updated_at desc);
create index if not exists genius_evidence_workspace_created_idx on public.genius_evidence_records(workspace_id, created_at desc);
create index if not exists genius_vendors_workspace_updated_idx on public.genius_vendors(workspace_id, updated_at desc);
create index if not exists genius_contracts_workspace_updated_idx on public.genius_contracts(workspace_id, updated_at desc);
create index if not exists genius_invoices_workspace_updated_idx on public.genius_invoices(workspace_id, updated_at desc);
create index if not exists genius_spend_rows_workspace_updated_idx on public.genius_spend_rows(workspace_id, updated_at desc);
create index if not exists genius_action_workspace_updated_idx on public.genius_action_states(workspace_id, updated_at desc);
create index if not exists genius_reports_workspace_updated_idx on public.genius_reports(workspace_id, updated_at desc);
create index if not exists genius_audit_workspace_created_idx on public.genius_audit_log(workspace_id, created_at desc);

create or replace function public.genius_current_workspace_id()
returns text
language sql
stable
as $$
  select case
    when auth.uid() is null then null
    else 'workspace-' || substring(encode(digest(auth.uid()::text, 'sha1'), 'hex') from 1 for 18)
  end
$$;

create or replace function public.genius_can_access_workspace(target_workspace_id text)
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated'
    and target_workspace_id is not null
    and target_workspace_id = public.genius_current_workspace_id()
$$;

alter table public.genius_workspaces enable row level security;
alter table public.genius_evidence_records enable row level security;
alter table public.genius_vendors enable row level security;
alter table public.genius_contracts enable row level security;
alter table public.genius_invoices enable row level security;
alter table public.genius_spend_rows enable row level security;
alter table public.genius_action_states enable row level security;
alter table public.genius_reports enable row level security;
alter table public.genius_audit_log enable row level security;

alter table public.genius_workspaces force row level security;
alter table public.genius_evidence_records force row level security;
alter table public.genius_vendors force row level security;
alter table public.genius_contracts force row level security;
alter table public.genius_invoices force row level security;
alter table public.genius_spend_rows force row level security;
alter table public.genius_action_states force row level security;
alter table public.genius_reports force row level security;
alter table public.genius_audit_log force row level security;

revoke all on table public.genius_workspaces from anon, authenticated;
revoke all on table public.genius_evidence_records from anon, authenticated;
revoke all on table public.genius_vendors from anon, authenticated;
revoke all on table public.genius_contracts from anon, authenticated;
revoke all on table public.genius_invoices from anon, authenticated;
revoke all on table public.genius_spend_rows from anon, authenticated;
revoke all on table public.genius_action_states from anon, authenticated;
revoke all on table public.genius_reports from anon, authenticated;
revoke all on table public.genius_audit_log from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.genius_workspaces to service_role;
grant select, insert, update, delete on table public.genius_evidence_records to service_role;
grant select, insert, update, delete on table public.genius_vendors to service_role;
grant select, insert, update, delete on table public.genius_contracts to service_role;
grant select, insert, update, delete on table public.genius_invoices to service_role;
grant select, insert, update, delete on table public.genius_spend_rows to service_role;
grant select, insert, update, delete on table public.genius_action_states to service_role;
grant select, insert, update, delete on table public.genius_reports to service_role;
grant select, insert, update, delete on table public.genius_audit_log to service_role;

drop policy if exists "service_role_full_access" on public.genius_workspaces;
drop policy if exists "service_role_full_access" on public.genius_evidence_records;
drop policy if exists "service_role_full_access" on public.genius_vendors;
drop policy if exists "service_role_full_access" on public.genius_contracts;
drop policy if exists "service_role_full_access" on public.genius_invoices;
drop policy if exists "service_role_full_access" on public.genius_spend_rows;
drop policy if exists "service_role_full_access" on public.genius_action_states;
drop policy if exists "service_role_full_access" on public.genius_reports;
drop policy if exists "service_role_full_access" on public.genius_audit_log;

create policy "service_role_full_access" on public.genius_workspaces for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_evidence_records for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_vendors for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_contracts for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_invoices for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_spend_rows for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_action_states for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_reports for all to service_role using (true) with check (true);
create policy "service_role_full_access" on public.genius_audit_log for all to service_role using (true) with check (true);

drop policy if exists "Users can access their workspaces" on public.genius_workspaces;
drop policy if exists "Users can access their workspace evidence" on public.genius_evidence_records;
drop policy if exists "Users can access their workspace vendors" on public.genius_vendors;
drop policy if exists "Users can access their workspace contracts" on public.genius_contracts;
drop policy if exists "Users can access their workspace invoices" on public.genius_invoices;
drop policy if exists "Users can access their workspace spend rows" on public.genius_spend_rows;
drop policy if exists "Users can access their workspace actions" on public.genius_action_states;
drop policy if exists "Users can access their workspace reports" on public.genius_reports;
drop policy if exists "Users can access their workspace audit log" on public.genius_audit_log;

create policy "Users can access their workspaces" on public.genius_workspaces
  for all to authenticated
  using (public.genius_can_access_workspace(id))
  with check (public.genius_can_access_workspace(id));

create policy "Users can access their workspace evidence" on public.genius_evidence_records
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

create policy "Users can access their workspace vendors" on public.genius_vendors
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

create policy "Users can access their workspace contracts" on public.genius_contracts
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

create policy "Users can access their workspace invoices" on public.genius_invoices
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

create policy "Users can access their workspace spend rows" on public.genius_spend_rows
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

create policy "Users can access their workspace actions" on public.genius_action_states
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

create policy "Users can access their workspace reports" on public.genius_reports
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

create policy "Users can access their workspace audit log" on public.genius_audit_log
  for all to authenticated
  using (public.genius_can_access_workspace(workspace_id))
  with check (public.genius_can_access_workspace(workspace_id));

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'buckets'
  ) then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('evidence-files', 'evidence-files', false, 52428800)
    on conflict (id) do update
      set public = false,
          file_size_limit = excluded.file_size_limit;
  end if;
end
$$;
