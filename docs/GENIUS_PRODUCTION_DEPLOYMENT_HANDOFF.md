# GENIUS Production Deployment Handoff

Last updated: 2026-07-16

This is the exact handoff for the next agent or operator who receives real production inputs. Do not rewrite product logic first. Configure the target environment, apply the database schema, deploy, and run the release gate.

## Current Gate Status

Current local release gate status:

- `route_security`: passing
- `dependency_audit`: passing
- `live_idempotency`: passing
- `recovery_runbook`: passing
- `observability_contract`: passing
- `deployment_handoff`: should pass locally after this file is present
- `schema_contract`: passing

Latest local investor candidate smoke:

- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` investor smoke passed with `62` checks using an isolated local store.
- Covered local flows now include guest auth, demo reset, preferences, session privacy, Workbench chat tags, CSV row parsing, Excel saved views, Langflow demo artifact, connector filters, support, Team CRM, B2B, Gateway notes, and audit coverage.
- This does not replace `qa:release`; production Supabase/env/deploy checks below are still required.

Expected blockers until real inputs are supplied:

- `production_env`
- `supabase_rest`
- `production_url`
- `cross_tenant`
- `live_ingest`

## Required Production Inputs

Configure these outside the repository, in the deployment provider and local operator shell only when running smoke tests:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_AUTH_KEY=
SUPABASE_EVIDENCE_BUCKET=evidence-files
GENIUS_FORCE_LOCAL_STORE=
GENIUS_SESSION_SECRET=
GENIUS_ALLOW_LOCAL_AUTH=0
GENIUS_LIVE_INGEST_SECRET=
GENIUS_PRODUCTION_BASE_URL=
GENIUS_TENANT_AUTH_FLOW=signin
GENIUS_TENANT_A_EMAIL=
GENIUS_TENANT_A_PASSWORD=
GENIUS_TENANT_B_EMAIL=
GENIUS_TENANT_B_PASSWORD=
GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID=
GENIUS_EXPECT_SUPABASE=1

# Optional Langflow demo agent. Keep server-side only.
LANGFLOW_DEMO_ENABLED=0
LANGFLOW_SERVER_URL=
LANGFLOW_FLOW_ID=genius-investor-demo-agent
LANGFLOW_API_KEY=
LANGFLOW_TIMEOUT_MS=12000
```

Production rules:

- `GENIUS_SESSION_SECRET` must be at least 32 characters.
- `GENIUS_LIVE_INGEST_SECRET` must be at least 32 characters.
- `GENIUS_FORCE_LOCAL_STORE` must be empty or unset.
- `GENIUS_ALLOW_LOCAL_AUTH` must be `0` in production.
- Tenant A and Tenant B must be two disposable account-level users with different emails.
- `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID` should be a disposable workspace id from a test tenant.
- Never commit real values to `.env.example`, docs, source files, or QA reports.
- Do not add `NEXT_PUBLIC_LANGFLOW_*`. Langflow API keys stay server-side only.
- If `LANGFLOW_DEMO_ENABLED=0` or Langflow env is incomplete, GENIUS intentionally uses the local supervised fallback and still blocks external execution.

## Supabase Setup

1. Create or select the target Supabase project.
2. Confirm `SUPABASE_URL` resolves from the deployment environment.
3. Apply `supabase/schema.sql` in Supabase SQL Editor or through your migration process.
4. Run `supabase/r27_rls_verification.sql` in Supabase SQL Editor.
5. Confirm all `genius_%` tables exist.
6. Confirm RLS is enabled and forced for all GENIUS tables.
7. Confirm policy count is non-zero where expected.
8. Confirm `genius_reports` includes `type`, `detail`, `summary`, `metrics`, `sections`, `generated_at`, and `updated_at`.
9. Run:

```powershell
npm.cmd run qa:schema
npm.cmd run qa:supabase
```

If `qa:supabase` fails with `ENOTFOUND`, fix `SUPABASE_URL` before deploying.
If `qa:env` fails, open `qa-artifacts/r29-release/r29-production-env-doctor.json` and follow the redacted `nextActions` list. Do not paste secrets into docs or source files.

## Deployment Steps

1. Run local baseline:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run qa:security
npm.cmd run qa:deps
npm.cmd run qa:live-idempotency
npm.cmd run qa:recovery
npm.cmd run qa:observability
npm.cmd run qa:deployment
```

2. Configure deployment provider environment variables.
3. Deploy the exact tested commit.
4. Set `GENIUS_PRODUCTION_BASE_URL` to the deployed URL.
5. Run production smoke:

```powershell
npm.cmd run qa:env
npm.cmd run qa:supabase
npm.cmd run qa:production
npm.cmd run qa:cross-tenant
npm.cmd run qa:live-ingest
npm.cmd run qa:release
```

6. Preserve all JSON reports under `qa-artifacts/`.

## Release Acceptance

Production candidate can be claimed only when:

- `npm.cmd run qa:release` returns `ok: true`.
- `requiredPassed` equals `requiredTotal`.
- readiness score is at least `85` on the demo/test workspace.
- cross-tenant smoke proves separate workspace ids.
- live-ingest smoke accepts valid HMAC token and rejects invalid/missing-token cases.
- portable export/import does not leak sessions, raw emails, tokens, secrets, or storage paths.
- dependency audit reports zero high/critical vulnerabilities.
- rollback and observability runbooks are present.

## Failure Handling

- If `production_env` fails, fix missing/invalid env before touching product code.
- If `supabase_rest` fails, fix Supabase URL/key/schema/RLS before deployment claims.
- If `production_url` fails, fix deploy URL or auth/session behavior.
- If `cross_tenant` fails, treat as P0 security issue.
- If `live_ingest` fails, rotate/check `GENIUS_LIVE_INGEST_SECRET` and verify the test workspace id.
- If any public API leaks raw emails, sessions, tokens, secrets, or authorization headers, stop release and follow `docs/GENIUS_PRODUCTION_RECOVERY_RUNBOOK.md`.

## Handoff To Gemini / Claude / Antigravity

Start by reading:

- `AGENTS.md`
- `docs/CURRENT_CHECKPOINT.md`
- `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`
- `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`
- `docs/GENIUS_PRODUCTION_RECOVERY_RUNBOOK.md`
- `docs/GENIUS_PRODUCTION_OBSERVABILITY_RUNBOOK.md`

Then run:

```powershell
git status --short
npm.cmd run lint
npm.cmd run build
npm.cmd run qa:release
```

Do not edit shared product logic unless one release-gate failure identifies a real product bug. Most remaining failures should be solved by supplying production env, Supabase, and deploy inputs.
