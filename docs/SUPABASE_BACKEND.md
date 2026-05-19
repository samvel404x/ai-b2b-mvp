# GENIUS Supabase Backend

This is the first database-backed MVP cut. The app keeps the existing local JSON fallback, but switches to Supabase when the server env vars are present.

## Why Supabase

- Postgres is a stable fit for evidence, approvals, audit logs, reports, and future agents.
- Free tier is enough for early manual onboarding.
- We can add Auth, Storage, and Realtime later without changing the product direction.

## Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor or use Supabase CLI/MCP migrations.
3. Apply the SQL files in `supabase/migrations/` in filename order.
4. `docs/SUPABASE_SCHEMA.sql` is a combined reference copy, not the migration source of truth.
5. Add these values to `.env.local`:

```bash
SUPABASE_URL=https://fdscrwloptchpozyotiv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GENIUS_WORKSPACE_ID=default
```

Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`. It must stay server-only.
The service role key is available in Supabase Dashboard under project API settings; the connector does not expose that secret.

## Storage Mode

- If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist, `lib/server/evidence-store.js` uses Supabase.
- If either value is missing, it uses `.data/genius-workspace.json`.

This keeps local development safe while we migrate the backend in steps.

## Current Tables

- `genius_workspaces`: one workspace row plus a JSON snapshot backup.
- `genius_evidence_records`: uploaded files, URL evidence, extracted fields, and review state.
- `genius_vendors`, `genius_contracts`, `genius_invoices`, `genius_spend_rows`: reviewed business entities derived from confirmed evidence.
- `genius_action_states`: human decisions for AI-prepared actions.
- `genius_reports`: backend-generated board reports built from reviewed evidence, findings, approvals, and audit history.
- `genius_audit_log`: audit events for uploads, reviews, approvals, deletes, and agent refreshes.

## Migration Files

- `supabase/migrations/20260518075215_create_genius_mvp_backend_schema.sql`
- `supabase/migrations/20260518075347_add_service_role_rls_policies.sql`
- `supabase/migrations/20260518080547_add_reviewed_business_entity_tables.sql`
- `supabase/migrations/20260519090000_add_backend_reports_table.sql`

## Security Rules

- Frontend never calls Supabase directly in this cut.
- Next.js API routes use the service role from server env only.
- RLS is enabled on every table.
- `anon` and `authenticated` table grants are revoked for now.
- Agents still cannot execute external changes without explicit approval.

## Next Backend Step

After this layer is stable, add user auth and tenant-scoped RLS so each customer can safely access only their own workspace. Then build Support/FAQ and connector permission screens on top of the same approval-first backend.
