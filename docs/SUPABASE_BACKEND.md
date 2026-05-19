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
SUPABASE_AUTH_KEY=your-server-side-publishable-or-anon-key
SUPABASE_EVIDENCE_BUCKET=evidence-files
GENIUS_SESSION_SECRET=long-random-cookie-signing-secret
GENIUS_WORKSPACE_ID=default
```

Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`. It must stay server-only.
`SUPABASE_AUTH_KEY` is optional in local MVP mode because the server can fall back to the service role for server-only Auth calls, but production should use a server-side publishable/anon key for password sign-in and keep the service role for admin-only calls.
`GENIUS_SESSION_SECRET` signs the app cookie. If it is missing, the server falls back to the service role key for local development.
The service role key is available in Supabase Dashboard under project API settings; the connector does not expose that secret.

## Storage Mode

- If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist, `lib/server/evidence-store.js` uses Supabase.
- If either value is missing, it uses `.data/genius-workspace.json`.
- Signed-in users are routed to `workspace-<hash-of-user-id>`. Signed-out usage stays on `GENIUS_WORKSPACE_ID` or `default`.
- Uploaded raw files are stored in the private Supabase Storage bucket from `SUPABASE_EVIDENCE_BUCKET` or `evidence-files`.

This keeps local development safe while we migrate the backend in steps.

## Evidence File Storage

- `app/api/evidence` receives multipart uploads through the server.
- `lib/server/evidence-analysis.js` validates file type and size, analyzes the file, then stores the raw file through `lib/server/supabase-file-store.js`.
- Storage paths are scoped by workspace: `workspace-id/YYYY-MM-DD/evidence-id/file-name`.
- Storage metadata is persisted in `genius_evidence_records.extracted.storage_file` so the current schema remains stable.
- The bucket is private. Frontend never receives the service key and does not upload directly to Supabase in this cut.
- Deleting or clearing evidence also attempts to remove the corresponding Storage objects.

## Auth Mode

- `app/api/auth/email` performs email/password sign-in or signup through Supabase Auth from the server.
- Supabase Auth access and refresh tokens are not sent to the browser in this cut.
- The browser receives only public session metadata and an httpOnly signed `genius_session` cookie.
- Google/OAuth is intentionally still disabled until the provider is configured in Supabase Auth settings.
- This is a BFF-style MVP auth layer. Later we should move to full Supabase SSR Auth with refresh-token rotation and tenant RLS policies once publishable keys, redirect URLs, and production domain are finalized.

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
- Auth routes set `Cache-Control: private, no-store` with signed httpOnly cookies.
- RLS is enabled on every table.
- `anon` and `authenticated` table grants are revoked for now.
- Agents still cannot execute external changes without explicit approval.

## Next Backend Step

After this layer is stable, add tenant-scoped RLS policies and membership tables so direct Supabase access can be safely enabled later. Then build Support/FAQ and connector permission screens on top of the same approval-first backend.
