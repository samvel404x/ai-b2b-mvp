-- GENIUS MVP backend schema, initial persistence cut.
-- Server-only access: Next.js API routes use SUPABASE_SERVICE_ROLE_KEY.

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

alter table public.genius_workspaces enable row level security;
alter table public.genius_evidence_records enable row level security;
alter table public.genius_action_states enable row level security;
alter table public.genius_audit_log enable row level security;

revoke all on table public.genius_workspaces from anon, authenticated;
revoke all on table public.genius_evidence_records from anon, authenticated;
revoke all on table public.genius_action_states from anon, authenticated;
revoke all on table public.genius_audit_log from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.genius_workspaces to service_role;
grant select, insert, update, delete on table public.genius_evidence_records to service_role;
grant select, insert, update, delete on table public.genius_action_states to service_role;
grant select, insert, update, delete on table public.genius_audit_log to service_role;
