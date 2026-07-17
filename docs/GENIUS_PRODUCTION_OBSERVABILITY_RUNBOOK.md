# GENIUS Production Observability Runbook

Last updated: 2026-07-16

This runbook defines what must be watched before and after the production candidate deployment. It complements `docs/GENIUS_PRODUCTION_RECOVERY_RUNBOOK.md`.

## Required Checks

Before production-ready sign-off:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run qa:observability
npm.cmd run qa:release
```

`npm.cmd run qa:release` remains the final source of truth.

## Primary Health Surfaces

- `/api/readiness`: investor/product readiness score, backend storage mode, AI provider status, live-ingest configuration, core metrics, readiness items, section states, and markdown export.
- `/api/diagnostics`: diagnostic categories, workspace metrics, top findings, open actions, proof trail, and live business metrics.
- `qa-artifacts/r28-release/r28-release-gate.json`: aggregate release gate evidence.
- `qa-artifacts/r27-production/r27-production-url-smoke.json`: production URL smoke evidence after deploy.
- Supabase SQL Editor output from `supabase/r27_rls_verification.sql`.

## Monitor Signals

Track these signals during preview and production candidate testing:

- Auth/session errors: `/api/auth/session`, `/api/auth/email`, `/api/auth/guest`.
- Workspace read/write failures: `/api/workspace`, `/api/workspace/portable`, `/api/evidence`, `/api/actions/[id]`.
- Readiness status changes: `investor_ready`, `qa_ready`, `needs_setup`.
- Backend storage mode: `supabase` is required for production tenant smoke; `local` is acceptable only for local/guest demos.
- AI provider state: Gemini configured vs fallback.
- Live ingest token state and live-event write failures.
- Export/privacy checks: portable export, audit export, evidence export.
- Cross-tenant smoke result and raw email leak checks.
- Dependency audit high/critical count.

## Alert Thresholds

Treat these as P0/P1 release blockers:

- P0: any raw session, token, password, authorization header, service role key, or raw member email appears in public API payloads or portable exports.
- P0: `npm.cmd run qa:release` fails after production env is supposedly complete.
- P0: cross-tenant smoke shows matching workspace ids or data from Tenant A visible to Tenant B.
- P0: production uses local storage for account tenants.
- P0: Supabase REST smoke cannot reach required GENIUS tables after deploy.
- P1: `/api/readiness` score drops below `85` on the demo workspace.
- P1: `/api/diagnostics` omits metrics, categories, open actions, proof trail, or live metrics.
- P1: dependency audit reports a high or critical vulnerability.

## Post-Deploy Smoke

After setting `GENIUS_PRODUCTION_BASE_URL`, run:

```powershell
npm.cmd run qa:env
npm.cmd run qa:supabase
npm.cmd run qa:production
npm.cmd run qa:cross-tenant
npm.cmd run qa:live-ingest
npm.cmd run qa:release
```

Record the generated JSON reports before changing the deployment again.

## Incident Triage

1. Capture failing command, deployment URL, commit, timestamp, and affected workspace id.
2. Read `/api/readiness` and `/api/diagnostics` for the affected workspace.
3. Export audit trail with `/api/audit/export`.
4. Check `qa-artifacts/r28-release/r28-release-gate.json` for the first failed gate.
5. If privacy, auth, or cross-tenant risk is suspected, follow `docs/GENIUS_PRODUCTION_RECOVERY_RUNBOOK.md`.

## Known Current Limitations

- There is no external APM vendor wired in this local repository.
- Platform logs and metrics must come from the deployment provider until a dedicated observability integration is added.
- Production smoke cannot be green until Supabase URL/key, deployment URL, tenant test users, and live-ingest test workspace are configured.
