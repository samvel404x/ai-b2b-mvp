# GENIUS Production Recovery Runbook

Last updated: 2026-07-16

This runbook is the release-candidate operating guide for backup, restore, rollback, and incident response. It must be kept current with `docs/CURRENT_CHECKPOINT.md` and `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`.

## Release Gate

Run before calling any deployment production-ready:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run qa:security
npm.cmd run qa:deps
npm.cmd run qa:live-idempotency
npm.cmd run qa:recovery
npm.cmd run qa:release
```

`npm.cmd run qa:release` is the final gate. It is expected to fail until production env, Supabase, deployment URL, tenant smoke accounts, and live-ingest test workspace id are configured.

## Ownership

- Product owner: owns release decision, customer messaging, and investor/demo truthfulness.
- Engineering owner: owns deployment, rollback, Supabase schema, and release gate results.
- Security owner: owns session secret, live-ingest secret, RLS verification, dependency audit, and incident triage.
- Support owner: owns customer impact notes, support tickets, and post-incident follow-up.

## Recovery Targets

- RPO: 24 hours for production Supabase backups, plus latest portable workspace export for critical demo/customer workspaces.
- RTO: 60 minutes for rollback to the last known-good deployment after a failed release.
- Restore drill frequency: before production candidate and after any schema change that affects `supabase/schema.sql`.
- Incident response start target: 15 minutes after detection of data leak, auth failure, or cross-tenant access suspicion.

## Backup Sources

- Supabase managed database backup for production tenant data.
- Private Supabase storage bucket for evidence files, scoped by workspace path.
- Portable workspace JSON export through `/api/workspace/portable` for workspace-level restore drills and demos.
- Git commit and deployment artifact for exact code rollback.

## Portable Workspace Backup Drill

Use this for demo/customer workspace recovery verification, not as the only production database backup.

1. Sign in as an Owner or use guest mode for local drills.
2. Load or create representative workspace data.
3. Export from Settings, or call `GET /api/workspace/portable`.
4. Confirm the export schema is `genius.workspace.portable.v1`.
5. Confirm the export does not include sessions, cookies, authorization headers, passwords, secrets, raw member emails, invite token hashes, storage paths, or API keys.
6. Import the portable file into a disposable workspace with `POST /api/workspace/portable`.
7. Confirm current workspace membership/session remains unchanged after import.
8. Run `npm.cmd run qa:security` and `npm.cmd run qa:release` after the drill.

## Supabase Restore Drill

1. Confirm `SUPABASE_URL` resolves and points to the intended project.
2. Confirm `SUPABASE_SERVICE_ROLE_KEY` is configured only in server/deployment env and never exposed to the browser.
3. Apply `supabase/schema.sql` to a disposable or staging project.
4. Run `supabase/r27_rls_verification.sql` in Supabase SQL Editor.
5. Run `npm.cmd run qa:supabase`.
6. Deploy to a preview URL and set `GENIUS_PRODUCTION_BASE_URL`.
7. Configure two disposable tenant smoke accounts.
8. Run `npm.cmd run qa:release`.
9. Preserve the JSON reports under `qa-artifacts/` as release evidence.

## Rollback

Rollback when any P0 occurs: data leak, auth/session failure, cross-workspace access, destructive action without confirmation, build failure, or critical workflow data loss.

1. Freeze new feature work.
2. Record failing command, deployment URL, commit, time, affected workspace ids, and visible user impact.
3. Revert or redeploy the last known-good deployment commit.
4. Rotate `GENIUS_SESSION_SECRET` and `GENIUS_LIVE_INGEST_SECRET` if token/session compromise is possible.
5. Re-run `npm.cmd run qa:release` against the rollback deployment.
6. If Supabase data was affected, restore from managed backup or import the latest validated portable workspace export into a disposable workspace first.
7. Update `docs/CURRENT_CHECKPOINT.md` with the rollback result and remaining risks.

## Incident Response

Security incident checklist:

- Disable affected external live-event tokens by rotating `GENIUS_LIVE_INGEST_SECRET`.
- Rotate compromised secrets immediately; do not wait for the full postmortem if a token, session, or cross-tenant data leak is suspected.
- Disable affected workspace members or sessions from Settings/Admin where possible.
- Preserve `qa-artifacts/`, deployment logs, audit exports, and relevant support tickets.
- Check `/api/auth/session`, `/api/workspace`, `/api/workspace/portable`, and export endpoints for raw email/session/token leakage.
- Run `npm.cmd run qa:security`, `npm.cmd run qa:deps`, and `npm.cmd run qa:release`.
- Do not claim production readiness until the root cause, fix, regression test, and customer impact are documented.

## Known Current Blockers

These are expected until production inputs are supplied:

- `GENIUS_SESSION_SECRET`
- `GENIUS_LIVE_INGEST_SECRET`
- `GENIUS_PRODUCTION_BASE_URL`
- `GENIUS_TENANT_A_EMAIL`
- `GENIUS_TENANT_A_PASSWORD`
- `GENIUS_TENANT_B_EMAIL`
- `GENIUS_TENANT_B_PASSWORD`
- `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID`
- reachable `SUPABASE_URL` and matching service role key

## Evidence To Keep

- `qa-artifacts/r28-release/r28-release-gate.json`
- `qa-artifacts/r31-security/r31-route-security-contract-smoke.json`
- `qa-artifacts/r32-security/r32-dependency-audit.json`
- `qa-artifacts/r33-security/r33-live-event-idempotency-smoke.json`
- `qa-artifacts/r34-recovery/r34-recovery-runbook-smoke.json`
- Supabase SQL Editor result for `supabase/r27_rls_verification.sql`
