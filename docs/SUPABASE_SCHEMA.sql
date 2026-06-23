-- GENIUS MVP Supabase schema.
-- Run this in the Supabase SQL Editor for the first database-backed MVP cut.
-- Tables stay server-only: the Next.js API uses SUPABASE_SERVICE_ROLE_KEY, never a browser key.

create table if not exists public.genius_workspaces (
  id text primary key,
  version integer not null default 1,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.genius_workspaces is
  'One row per GENIUS workspace. The data column keeps a full snapshot while normalized MVP tables mature.';

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

comment on table public.genius_evidence_records is
  'Uploaded files, URL evidence, extracted fields, and reviewed business data.';

create index if not exists genius_evidence_workspace_created_idx
  on public.genius_evidence_records (workspace_id, created_at desc);

create table if not exists public.genius_vendors (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  name text not null,
  owner text,
  source_evidence_ids jsonb not null default '[]'::jsonb,
  total_exposure integer not null default 0,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.genius_vendors is
  'Reviewed vendor records derived from confirmed evidence.';

create index if not exists genius_vendors_workspace_updated_idx
  on public.genius_vendors (workspace_id, updated_at desc);

create table if not exists public.genius_contracts (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  vendor_id text,
  vendor_name text not null,
  evidence_id text references public.genius_evidence_records(id) on delete set null,
  value integer not null default 0,
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

comment on table public.genius_contracts is
  'Reviewed contract records derived from confirmed evidence.';

create index if not exists genius_contracts_workspace_updated_idx
  on public.genius_contracts (workspace_id, updated_at desc);

create table if not exists public.genius_invoices (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  vendor_id text,
  vendor_name text not null,
  evidence_id text references public.genius_evidence_records(id) on delete set null,
  invoice_number text,
  total integer not null default 0,
  currency text not null default 'USD',
  status text not null default 'Reviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.genius_invoices is
  'Reviewed invoice records derived from confirmed evidence.';

create index if not exists genius_invoices_workspace_updated_idx
  on public.genius_invoices (workspace_id, updated_at desc);

create table if not exists public.genius_spend_rows (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  vendor_id text,
  vendor_name text not null,
  evidence_id text references public.genius_evidence_records(id) on delete set null,
  amount integer not null default 0,
  currency text not null default 'USD',
  source text,
  status text not null default 'Reviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.genius_spend_rows is
  'Reviewed spend records derived from confirmed CSV or spreadsheet evidence.';

create index if not exists genius_spend_rows_workspace_updated_idx
  on public.genius_spend_rows (workspace_id, updated_at desc);

create table if not exists public.genius_action_states (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  finding_id text not null,
  title text,
  description text,
  impact integer not null default 0,
  owner text,
  status text not null default 'Needs review',
  approval_channel text not null default 'web',
  mobile_ready boolean not null default false,
  external_execution jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint genius_action_states_status_check check (
    status in ('Needs review', 'Ready', 'Approved', 'Rejected', 'Edited', 'Snoozed', 'Done')
  )
);

comment on table public.genius_action_states is
  'Human decisions for AI-prepared actions. External execution remains disabled in V1.';

create index if not exists genius_action_workspace_updated_idx
  on public.genius_action_states (workspace_id, updated_at desc);

create table if not exists public.genius_audit_log (
  id text primary key,
  workspace_id text not null references public.genius_workspaces(id) on delete cascade,
  type text not null,
  actor text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.genius_audit_log is
  'Append-only product audit trail for uploads, reviews, approvals, deletes, and agent refreshes.';

create index if not exists genius_audit_workspace_created_idx
  on public.genius_audit_log (workspace_id, created_at desc);

-- Defense-in-depth for Data API exposure. Server code uses the service role only.
alter table public.genius_workspaces enable row level security;
alter table public.genius_evidence_records enable row level security;
alter table public.genius_vendors enable row level security;
alter table public.genius_contracts enable row level security;
alter table public.genius_invoices enable row level security;
alter table public.genius_spend_rows enable row level security;
alter table public.genius_action_states enable row level security;
alter table public.genius_audit_log enable row level security;

revoke all on table public.genius_workspaces from anon, authenticated;
revoke all on table public.genius_evidence_records from anon, authenticated;
revoke all on table public.genius_vendors from anon, authenticated;
revoke all on table public.genius_contracts from anon, authenticated;
revoke all on table public.genius_invoices from anon, authenticated;
revoke all on table public.genius_spend_rows from anon, authenticated;
revoke all on table public.genius_action_states from anon, authenticated;
revoke all on table public.genius_audit_log from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.genius_workspaces to service_role;
grant select, insert, update, delete on table public.genius_evidence_records to service_role;
grant select, insert, update, delete on table public.genius_vendors to service_role;
grant select, insert, update, delete on table public.genius_contracts to service_role;
grant select, insert, update, delete on table public.genius_invoices to service_role;
grant select, insert, update, delete on table public.genius_spend_rows to service_role;
grant select, insert, update, delete on table public.genius_action_states to service_role;
grant select, insert, update, delete on table public.genius_audit_log to service_role;

create policy "service_role_full_access" on public.genius_workspaces
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_evidence_records
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_vendors
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_contracts
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_invoices
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_spend_rows
  for all to service_role
  using (true)
  with check (true);

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

create policy "service_role_full_access" on public.genius_action_states
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_audit_log
  for all to service_role
  using (true)
  with check (true);
