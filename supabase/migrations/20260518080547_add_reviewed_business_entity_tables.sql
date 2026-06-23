-- Normalized business entities derived from human-confirmed evidence.

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

alter table public.genius_vendors enable row level security;
alter table public.genius_contracts enable row level security;
alter table public.genius_invoices enable row level security;
alter table public.genius_spend_rows enable row level security;

revoke all on table public.genius_vendors from anon, authenticated;
revoke all on table public.genius_contracts from anon, authenticated;
revoke all on table public.genius_invoices from anon, authenticated;
revoke all on table public.genius_spend_rows from anon, authenticated;

grant select, insert, update, delete on table public.genius_vendors to service_role;
grant select, insert, update, delete on table public.genius_contracts to service_role;
grant select, insert, update, delete on table public.genius_invoices to service_role;
grant select, insert, update, delete on table public.genius_spend_rows to service_role;

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
