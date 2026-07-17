# GENIUS Investor Demo And Binding Map

Status: R-54 Profile/Workbench/Settings persistence passed locally; production blockers are env/Supabase/deploy inputs  
Last updated: 2026-07-16  
Primary readers: Product Owner, Antigravity, Gemini, Claude Sonnet/Opus

## 1. Current Verified Baseline

Use this file together with:

- `AGENTS.md`
- `docs/CURRENT_CHECKPOINT.md`
- `docs/GENIUS_FULL_PRODUCT_EXECUTION_PLAN_2026-07-18_25.md`
- `docs/GENIUS_FULL_PRODUCT_PLAN.md`

Latest verified checks:

- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production API smoke passed for guest auth, investor demo reset, approval lifecycle decisions, workspace metrics, and report metrics.
- Browser smoke passed through system Chrome/CDP for guest login, Settings `Load demo`, all main workspace sections, and Settings viewport checks at `1536x864`, `1366x768`, and `1920x1080`.
- Investor-critical API interaction smoke passed for guest/demo, CSV upload/review, Excel saved view, approval delegation, report export/schedule activation, connector request/status/filter, support ticket lifecycle, portable export/import, and readiness.
- Support status PATCH now accepts `ticketId` as well as `id`; focused lint, full production build, and production support smoke passed.
- AppShell global search now uses real workspace data for screens, findings, actions, evidence, Excel rows, reports, support tickets, and connector requests.
- Team Operations CRM now reads persisted `operations.crmTasks`, supports local board task creation/drag/drop, and submits tasks to CEO AI Gateway through `/api/operations/team-report`.
- CEO AI Gateway utility controls are wired for validation, report-id copy, evidence routing to Data Intake, local note saving, audit filtering, and CSV export.
- B2B Bridge primary invoice thread is backend-backed; secondary/local channels now persist discussion metadata, messages, internal notes, invite logs, acknowledgements, and workflow decisions in workspace state. External partner delivery remains locked until the production partner model is assigned.
- R-42/R-43/R-44/R-45/R-46 investor click-path smoke passed with `33` checks across guest auth, investor demo reset, Diagnostics workflow/archive persistence, Data Intake CSV upload and row-level spreadsheet parsing, Excel Workspace saved-view persistence, Support ticket comment/attachment persistence, Team CRM task create/update/list persistence, B2B secondary scoped threads, Workbench artifact persistence, Team CRM report creation, Gateway note persistence, workspace snapshot consistency, and audit-log coverage.
- R-47 Reports `Add to backlog` now creates a real Team CRM backlog task through the existing CRM task API, opens Team CRM with `taskId` focus context, and preserves the same `33`-check investor smoke baseline.
- R-48 Support `Choose file` now records bounded PNG/JPG/PDF metadata as an attachment reference, auto-attaches it to newly created tickets, and extends `qa:investor` to `35` checks.
- R-49 Connectors Event Stream filters now affect the visible stream, Pause/Resume freezes the local stream view, `View all events` clears active filters, and `qa:investor` now passes with `38` checks including connector filter persistence/audit coverage.
- R-50 Reports `Duplicate report` now creates a persisted one-time report schedule draft through `/api/reports/schedules`; `qa:investor` now passes with `42` checks including report draft persistence and audit coverage.
- R-51 Excel Workspace `Columns` now controls visible table columns, persists `visibleColumnIds` in saved views, and `qa:investor` now passes with `44` checks including column visibility persistence.
- R-52 Excel Workspace proof-trail row expansion now opens a local lineage panel with evidence/finding/action context and quick routing; `qa:investor` remains green with `44` checks.
- R-53 Langflow-ready Agent 1 now appears as `Langflow Demo Agent`, can be run from Command Center, saves an approval-safe Workbench artifact through `/api/agents/run`, records `langflow_demo_agent_run`, and uses a server-only Langflow HTTP adapter or local supervised fallback. `qa:investor` now passes with `49` checks covering the Langflow artifact, runtime guardrail, metadata persistence, and audit event.
- R-54 Profile, Workbench, and Settings now persist workspace preferences, session projections, Workbench file attachments, and conversation tags. Public redaction was fixed so boolean notification channel settings are not blanked as emails. `qa:investor` now passes with `62` checks covering preferences, sessions privacy, notification/security policy persistence, Workbench chat tags, Langflow, and audit coverage.
- New optional local verification command: `npm.cmd run qa:investor`. When running it against `next start`, the server must have `GENIUS_SESSION_SECRET` set.
- R-22 B2B browser smoke passed for local discussion creation, external/internal messages, pin, invite, approve, export, archive/restore, settings, Data Intake, and Diagnostics links.
- R-23 cross-section browser click smoke passed on a managed dev server at `1920x1080`:
  - guest login and investor demo reset;
  - Team CRM task creation and submit to CEO Gateway;
  - CEO Gateway validation, report ID copy, and Audit Log filtering;
  - Data Intake review confirmation and extracted-data CSV export;
  - Excel Workspace row selection, saved view, and CSV export;
  - Approvals detail delegation;
  - Reports JSON export and schedule draft;
  - Connectors request creation and move to reviewing;
  - Support ticket creation/comment;
  - Settings portable workspace export.
- R-23 artifacts: `qa-artifacts/r23-cross-section/r23-cross-section-click-smoke.json`, 10 screenshots, 4 downloads. No console errors, page errors, 500 responses, or horizontal overflow were detected; one aborted workspace GET during navigation was ignored as safe.
- Post R-23 full `npm.cmd run lint` passed after excluding generated Chrome QA profile folders from ESLint, while keeping QA scripts lintable.
- Post R-23 full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.
- R-24 security projection smoke passed: public session hides raw auth/login emails and generated guest emails; public workspace strips sessions, member emails, sensitive unknown fields, and dirty portable import/export leak seeds.
- R-24 artifacts: `qa-artifacts/r24-security/r24-security-smoke.json`.
- Post R-24 full `npm.cmd run lint` passed.
- Post R-24 full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.
- R-25 final zoom/design regression smoke passed: all main workspace sections at `1920x1080`; dense screens at zoom-equivalent `80%`, `100%`, `125%`, and `150%`; no clipped visible controls, horizontal overflow, console errors, page errors, request failures, or `5xx` responses.
- R-25 Team Operations CRM task panel clipping was fixed before the passing run.
- R-25 artifacts: `qa-artifacts/r25-zoom-readiness/r25-zoom-smoke.json`, `38` screenshots.
- Post R-25 full `npm.cmd run lint` passed.
- Post R-25 full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.
- R-26 local production-readiness smoke passed: production `next start` fails safely without `GENIUS_SESSION_SECRET`, and works with a temporary child-process-only session secret for guest/demo/readiness.
- R-26 local env audit found `.env.local` has `GEMINI_API_KEY`, `GEMINI_MODEL`, `GENIUS_WORKSPACE_ID`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL`, but is missing `GENIUS_SESSION_SECRET` and `GENIUS_LIVE_INGEST_SECRET`.
- R-26 artifacts: `qa-artifacts/r26-production-readiness/r26-production-readiness-smoke.json`.
- R-27 fixed the Supabase production schema contract before deploy: `genius_reports` now includes the columns written by `lib/server/supabase-workspace-store.js` (`type`, `detail`, `summary`, `generated_at`).
- R-27 hardened `supabase/schema.sql` with idempotent table creation, report-column migrations, forced RLS, and workspace indexes.
- R-27 added executable production verification tooling:
  - `qa-artifacts/r27-production/r27-supabase-schema-contract-smoke.mjs`
  - `qa-artifacts/r27-production/r27-supabase-rest-smoke.mjs`
  - `qa-artifacts/r27-production/r27-production-url-smoke.mjs`
  - `supabase/r27_rls_verification.sql`
- R-27 local schema contract smoke passed, full lint passed, and full build passed.
- R-27 real Supabase REST smoke is blocked: configured target `https://fdscrwloptchpozyotiv.supabase.co` returns DNS `ENOTFOUND`, so real Supabase table/RLS/cross-tenant verification is not complete.
- R-28 added the aggregate release gate and cross-tenant production smoke:
  - `qa-artifacts/r28-release/r28-release-gate.mjs`
  - `qa-artifacts/r28-release/r28-cross-tenant-production-smoke.mjs`
- R-28 gate currently fails by design because required production inputs are missing/invalid:
  - Supabase REST still fails `ENOTFOUND`.
  - `GENIUS_PRODUCTION_BASE_URL` is not set.
  - two disposable tenant smoke accounts are not set.
- R-29 added production env doctor and live-ingest production smoke to the aggregate release gate.
- Current aggregate release gate result is `requiredPassed: 7`, `requiredTotal: 12`; `route_security`, `dependency_audit`, `live_idempotency`, `recovery_runbook`, `observability_contract`, `deployment_handoff`, and `schema_contract` pass until production env, Supabase DNS, deploy URL, tenant credentials, and live-ingest test workspace are configured.
- R-30 added npm QA shortcuts. Use `npm.cmd run qa:release` as the main production readiness command.
- R-31 added read-rate-limits to chat/live-event/export GET endpoints and a required `route_security` contract smoke.
- R-32 added dependency audit to the release gate. High/critical vulnerabilities are `0`; two moderate `next -> postcss` findings are recorded for review and currently have no fix available.
- R-33 added explicit live-event idempotency support for `x-idempotency-key` / `idempotencyKey` and added it to the release gate.
- R-34 added production recovery runbook and backup/restore contract smoke to the release gate.
- R-35 added production observability runbook and readiness/diagnostics contract smoke to the release gate.
- R-36 added the production deployment handoff document and deployment handoff smoke to the release gate.
- R-37 hardened `qa:env` so it matches the deployment handoff, validates production-only env values, and prints redacted `nextActions`.

Important current state:

- The product has a public landing screen before registration.
- Guest mode exists for local evaluation.
- Settings now exposes an Owner-only `Load demo` control that calls the existing investor demo reset endpoint.
- The core investor path is functional with local workspace persistence.
- External writes to CRM, finance, email, banking, Slack, accounting, and partner systems remain intentionally blocked unless production credentials and policies are added.

## 2. Investor Demo Path

Recommended path for a live investor walkthrough:

1. Open `/`.
   - Show that GENIUS is an AI-powered B2B operating system, not a single-purpose dashboard.
   - Explain that GENIUS combines evidence intake, risk detection, supervised AI agents, approvals, and reporting.

2. Open `/login` and use `Continue as guest`.
   - Guest mode creates a local workspace without exposing Supabase auth tokens.
   - Registered users still use email/password and workspace roles.

3. Go to `Settings -> Workspace` and click `Load demo`.
   - This loads deterministic investor demo evidence, findings, approvals, reports, live events, and audit entries.
   - It replaces current MVP workspace data, but keeps the current session and role.

4. Open `Command Center`.
   - Show the executive overview and drilldowns.
   - Explain that metrics come from workspace evidence, actions, reports, live events, and diagnostics.

5. Open `Data Intake`.
   - Show uploaded evidence, extracted fields, review states, and proof links.
   - If needed, upload a CSV/XLSX file and confirm rows to show the local parser.

6. Open `Excel Workspace`.
   - Show row-level spend data from parsed spreadsheet evidence.
   - Use filters/export to prove the spreadsheet workspace is connected to uploaded data.

7. Open `Diagnostics`.
   - Show risk/data-quality categories and workflow status updates.
   - Explain this is the system health layer for the business workspace.

8. Open `Savings Radar`.
   - Show detected savings/risk opportunities.
   - Open a detail panel, switch tabs, route to evidence/proof/approvals.

9. Open `Approvals`.
   - Approve one action.
   - Delegate one action.
   - Reject one action.
   - Show that decision history, lifecycle metadata, workspace metrics, and report metrics update.
   - Explain: AI prepares actions; humans decide; external execution stays blocked until production connector permissions exist.

10. Open `Reports`.
   - Show generated reports from real workspace data.
   - Export JSON/CSV/Markdown.
   - Show included approvals, proof coverage, rejected/delegated counts, and proof trail links.

11. Open `AI Chat`.
   - Ask a workspace-specific question such as: `What are the top risks and what evidence supports them?`
   - Wait until the response finishes before switching sections.

12. Open `Connectors`.
   - Show Business Live events, connector request backlog, schema/health panels, and locked native connectors.
   - Explain that real external write credentials are not simulated.

13. Open `CEO AI Gateway`, `Team Operations CRM`, and `Multi-Business OS / B2B Bridge`.
   - Show operations escalation, CEO decisions, team report submission, B2B messaging, workflow approval, and transcript export.

14. Open `Support`.
   - Create a support ticket if needed.
   - Show help/search/support flow as a persisted workspace workflow.

15. Return to `Settings`.
   - Export portable workspace JSON.
   - Show Auth & Login members/roles if needed.
   - Sign out to prove session cleanup.

## 3. Antigravity Binding Map

Antigravity should bind visual controls to the existing section IDs and context/API behavior below. Do not invent new backend contracts unless Codex assigns that shared-core work.

| Section | Section ID | Primary Controls To Bind | Existing Behavior / Contract | Notes |
| --- | --- | --- | --- | --- |
| Landing | `/` | CTA buttons, product sections | Static/public route with auth CTAs | Keep first screen product-focused. |
| Login | `/login` | Email auth, guest mode | `/api/auth/email`, `/api/auth/guest` | Do not expose member emails in guest UI. |
| Profile | `profile` | Personal info, AI preferences, notification preferences, active sessions | `/api/workspace/preferences`, `/api/workspace/sessions`, `saveWorkspacePreferences`, `listWorkspaceSessions`, `revokeWorkspaceSession` | Password/MFA management remains delegated to production auth provider. Raw session IP/location stays hidden. |
| Command Center | `command` | KPI cards, graph links, activity actions, Langflow Demo Agent run control | Navigation into `data`, `diagnostics`, `savings`, `approvals`, `reports`, `chat`; Langflow demo uses `/api/agents/run` with `agentId: "langflow-demo"` | Drilldowns should pass IDs only. Langflow output is artifact-only and routes to AI Workbench. |
| AI Chat | `chat` | Send, saved conversations, evidence shortcuts, composer attachments, chat options, conversation tags, Langflow demo artifact review | `/api/chat`, `/api/evidence`, `sendChatMessage`, `updateChatConversation`, `deleteChatConversation`, `uploadEvidence`, `workspaceArtifacts` | Attachments become workspace evidence. Tags persist on chat conversations. Wait for streaming completion before moving in demo. Langflow demo briefs appear as Workbench artifacts. |
| Data Intake | `data` | Upload, URL analysis, confirm/reject, export, proof links | `/api/evidence`, `/api/sources/url`, `/api/evidence/review`, `/api/evidence/export` | This is the correct section ID. Do not use `data-intake` for navigation. |
| Diagnostics | `diagnostics` | Status/owner workflow, archive, filters, evidence links | `/api/diagnostics`, `updateDiagnosticWorkflow` | Archive is persisted as workflow status `Closed`; server authorization is required. |
| Savings Radar | `savings` | Filters, detail tabs, action routing, status updates | `updateAction`, `exportEvidence`, navigation to `approvals`, `data`, `reports` | Delegated actions appear as in-progress. |
| Approvals | `approvals` | Approve, reject, edit, request evidence, delegate, snooze, reopen, done, bulk actions | `/api/actions/[id]`, `updateAction` | Lifecycle metadata and decision history persist. External execution remains blocked. |
| Excel Workspace | `excel` | Filters, column visibility, row selection, CSV export, saved view, proof-row lineage expansion | `/api/excel-workspace`, `saveExcelWorkspaceView`, navigation to `data`/`reports`/`approvals` | Real rows come from parsed CSV/XLSX evidence. Saved views persist selected visible columns through `visibleColumnIds`. Proof rows expand locally with evidence/finding/action context. |
| Reports | `reports` | Report tabs, exports, schedule draft, duplicate draft, proof links, finding backlog creation | `/api/reports`, `/api/reports/[id]`, `/api/reports/schedules`, `/api/operations/crm-tasks`, export helpers | Rejected/delegated metrics are now real. `Add to backlog` creates a Team CRM task and navigates with `taskId` context. `Duplicate report` creates a local one-time schedule draft; external board/email delivery remains locked. |
| Connectors | `connectors` | Request connector, filter preset, request status, event filters, pause/resume stream view, clear live events | `/api/connectors`, `/api/live-events` | Native credential flows stay locked until production secrets exist. Event filters affect the visible local stream and persist as workspace preferences; they do not change external webhook ingestion. |
| CEO AI Gateway | `ai-gateway` | Approve, configure, reject/revision, validate data, copy report ID, evidence raw links, notes, audit CSV | `/api/operations/reports/[id]`, `updateGatewayReport`; utility actions are client-side where no persistence contract exists | Decisions persist in operations state. Notes are local until a persisted notes API is added. |
| Team Operations CRM | `team-crm` | Header create/filter/automation, board drag/drop, column add, task panel, checklist, submit to CEO, task focus context | `/api/operations/crm-tasks`, `/api/operations/team-report`, `createCrmTask`, `updateCrmTask`, `submitTeamReport` | Board creation, drag/drop, and checklist summary persist to `operations.crmTasks`. Submitted reports appear in CEO Gateway. Accepts `taskId` / `crmTaskId` context from Reports. |
| B2B Bridge | `b2b-bridge` | Send message, internal note, approve/reject/reopen workflow, transcript export, pin/unpin, archive/restore, invite logging, attachment, settings, SLA details | `/api/operations/b2b`, `sendB2bMessage`, `updateB2bWorkflowStatus`, `updateB2bDiscussion` | Primary invoice discussion persists to backend. Secondary/demo discussion metadata and scoped messages/workflow decisions persist to workspace `discussionThreads`; external partner delivery remains locked until a multi-thread partner schema/API is assigned. Evidence links navigate to `data`; SLA details navigate to `diagnostics`. |
| Support | `support` | Ticket creation/status/comment/file metadata attachment references | `/api/support/tickets` and workspace-context support methods | External live chat remains locked. `Choose file` stores bounded PNG/JPG/PDF metadata only, not binary content. Status/comment/attachment PATCH can use `ticketId`; status also keeps `id` compatibility. |
| Settings | `settings` | Load demo, import/export, reset, members, auth, security policy toggles, sign out | `/api/demo/reset`, `/api/workspace/portable`, `/api/workspace`, `/api/workspace/members`, `/api/workspace/preferences`, `/api/auth/session` | `Load demo` is Owner-only and replaces MVP data after confirmation. Security policy toggles require `manage_workspace` and persist as workspace preferences. |

## 4. What Gemini Should Do Next

Recommended next Gemini task:

```text
You are continuing GENIUS in C:\Users\only\Downloads\ai-b2b-mvp.
Read AGENTS.md, docs/CURRENT_CHECKPOINT.md, docs/GENIUS_FULL_PRODUCT_EXECUTION_PLAN_2026-07-18_25.md, and docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md.

Phase: R-30 supply working production env/deploy inputs and run R28 release gate to green.

Do not reset the working tree. Do not revert unrelated changes. Do not edit shared-core files unless explicitly assigned.

First run:
- git status --short
- npm.cmd run lint
- npm.cmd run build

R-18 browser-smoked the main section path. R-19 API-smoked investor-critical backend contracts. R-22 deeply smoked B2B Bridge actions. R-23 browser-smoked the cross-section investor workflow. R-24 security-smoked public session/workspace projection and portable import/export redaction. R-25 zoom-smoked the current design baseline at 80/100/125/150-equivalent desktop viewports. R-26 locally production-smoked fail-safe auth behavior and `next start` with a temporary child-process-only session secret. R-27 fixed Supabase schema contract drift and added production verification tooling. R-28 added the aggregate release gate and cross-tenant production smoke. R-29 added production env doctor and live-ingest production smoke. R-42/R-43/R-44/R-45/R-46 added and extended `npm.cmd run qa:investor` for the investor-critical local API click path. R-47 bound Reports findings into Team CRM backlog tasks through the existing CRM API. R-48 wired Support file metadata references. R-49 wired Connectors stream filter/pause behavior. R-50 wired Reports duplicate drafts through the existing report schedule API. R-51 wired Excel column visibility through saved views. R-52 wired Excel row lineage expansion. R-53 added the Langflow-ready demo agent and artifact-only runtime guardrails; the production gate is blocked only by missing/invalid production inputs.

Continue only with the remaining release-candidate items:
- Run full lint/build on the current dirty baseline.
- After UI/Antigravity binding changes, run `npm.cmd run qa:investor` against the local or deployed base URL. If using `next start`, set `GENIUS_SESSION_SECRET` on the server process first.
- Fix or replace `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`; the current target `https://fdscrwloptchpozyotiv.supabase.co` returns `ENOTFOUND`.
- Add real production env values outside the repo: `GENIUS_SESSION_SECRET`, `GENIUS_LIVE_INGEST_SECRET`, Supabase URL/service role key, Gemini key/model, and Vercel/project envs.
- Apply and verify `supabase/schema.sql` in the target Supabase project, including RLS policies. Then run `supabase/r27_rls_verification.sql` in Supabase SQL Editor.
- Set `GENIUS_PRODUCTION_BASE_URL` after deployment.
- Configure two disposable tenant smoke accounts:
  - `GENIUS_TENANT_A_EMAIL`
  - `GENIUS_TENANT_A_PASSWORD`
  - `GENIUS_TENANT_B_EMAIL`
  - `GENIUS_TENANT_B_PASSWORD`
- Set `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID` to a disposable workspace id for the production live-ingest smoke.
- Run `npm.cmd run qa:release` and require `ok: true` before claiming production readiness.
- Re-run R-25 browser QA only if Antigravity or the user changes final design layouts again.
- Verify Antigravity visual buttons call the existing section IDs/API contracts from this file.
- Do not rewrite backend contracts that already passed R-19/R-22/R-23/R-24 unless a real bug is found.
- Do not claim production complete until deployment env checks, production smoke, and checkpoint update are done.

```

## 5. R-18 Browser QA Result

R-18 was completed with a production `next start` server and system Chrome controlled through Chrome DevTools Protocol.

Passed:

- `/login -> Continue as guest -> /workspace`.
- Settings `Load demo` with confirmation.
- Section render pass for Command Center, Data Intake, Excel Workspace, Diagnostics, Savings Radar, Approvals, Reports, AI Chat, Connectors, Multi-Business OS / B2B Bridge, Support, and Settings.
- Automated checks found no Next.js overlay, no horizontal page overflow, no console events, and no request failures.
- Settings viewport checks passed at `1536x864`, `1366x768`, and `1920x1080`.

Artifacts:

- Screenshots are in `qa-artifacts/r18-browser-qa/`.
- These are local QA artifacts and should not be committed unless the team explicitly wants to version evidence.

Notes:

- The clipped-element detector flagged dense small elements such as the notification `9+` badge and one top status chip. They did not block the demo path, but should be reviewed visually during final polish.
- Browser zoom checks around `80%`, `125%`, and `150%` still need a dedicated pass.

## 6. Remaining Browser QA Matrix

The API/build checks and R-18/R-22/R-23 browser smokes are strong. Remaining QA is now final zoom/design regression plus security/readiness, not first-pass functional wiring.

R-19 backend/API interaction smoke already passed:

- Guest Owner workspace creation.
- Investor demo load.
- CSV upload with `3` parsed spreadsheet rows.
- Evidence review confirmation.
- Workspace derivation into spend rows, invoices, and vendors.
- Excel saved view persistence.
- Approval delegation with decision history.
- Report detail/export and schedule activation.
- Connector request/status/filter persistence.
- Support ticket create/comment/resolve.
- Portable workspace export/import.
- Readiness `investor_ready` score `100`.

Minimum desktop checks:

- Browser zoom around 80%, 100%, 125%, and 150%.

Check specifically:

- B2B Bridge three-column layout.
- Approvals detail panel after delegated/rejected/approved decisions.
- Reports right summary panel with five included-approval rows.
- Settings Workspace tab with `Load demo`, import/export, and delete controls.
- Connectors dense right sidebar and request backlog.
- Data Intake upload/review table after confirmed evidence.
- Any newly edited final design screens after Antigravity changes.

Known browser-runner note:

- R-19 headless zoom automation was blocked by local Windows Chrome/Edge launch instability. If automation is unavailable, perform this zoom pass manually and only change UI for real P0/P1 layout defects.

## 7. Known Limits To Say Truthfully

- Real external connector writes are intentionally blocked.
- Email delivery, billing, SSO, native CRM/accounting/banking integrations, and mobile push are not production-enabled in this cut.
- Guest mode is local evaluation mode.
- Supabase schema/RLS has been hardened at the app/schema level, but production deployment still needs environment verification and cross-tenant testing with real Supabase projects.
- Public session/workspace projection and portable workspace import/export redaction passed R-24, but this does not replace production Supabase RLS verification.
- Local production `next start` passed R-26 with a temporary child-process-only session secret and local store forced; real remote deployment and Supabase cross-tenant smoke are still required.
- Browser/pixel QA has passed R-18 main section smoke, R-22 B2B deep smoke, R-23 cross-section click smoke, and R-25 final zoom/design-regression smoke for the current local design baseline.

## 8. R-23 Cross-Section Browser QA Result

R-23 passed on 2026-07-15 against a managed local Next dev server at `http://localhost:3011`.

Passed:

- `/login -> Continue as guest -> /workspace`.
- Investor demo reset through `/api/demo/reset`.
- Team CRM `Create Task` and `Submit to AI / CEO Review`.
- CEO Gateway `Validate Data`, copy report ID, and Audit Log filter.
- Data Intake `Review`, `Confirm Selected`, and `Export Extracted Data`.
- Excel Workspace row selection, `Save view`, and `Export CSV`.
- Approvals detail `Delegate`.
- Reports JSON export and `Save schedule draft`.
- Connectors `Request a connector` and backlog `Review`.
- Support ticket create and comment.
- Settings Workspace portable `Export`.

Artifacts:

- Report: `qa-artifacts/r23-cross-section/r23-cross-section-click-smoke.json`
- Screenshots: `qa-artifacts/r23-cross-section/01-command-center-demo-loaded.png` through `10-settings-export.png`
- Downloads: extracted data CSV, Excel CSV, weekly report JSON, portable workspace JSON.

Result:

- `ok: true`, `failedCount: 0`, `steps: 11`, `screenshots: 10`, `downloads: 4`.
- No console errors, page errors, bad `5xx` responses, Next.js overlay, horizontal overflow, or clipped visible controls were detected.
- One `GET /api/workspace net::ERR_ABORTED` during navigation was recorded and safely ignored by the smoke script.

## 9. R-24 Security Projection Result

R-24 passed on 2026-07-15 against a managed local Next dev server at `http://localhost:3012`.

Passed:

- Guest auth returned `200`.
- Public session returned empty `email` and empty guest `emailMasked`.
- Public workspace did not expose `sessions`.
- Public workspace members did not expose raw email.
- Dirty portable workspace import returned `200`.
- Public workspace after dirty import had `0` matches for seeded secret/token/session/email values.
- Portable workspace export returned `exportedBy: workspace-user` and `0` leak matches.

Artifacts:

- Report: `qa-artifacts/r24-security/r24-security-smoke.json`

Result:

- `ok: true`, `checks: 6`.
- Focused ESLint passed for the touched server projection files and the R-24 QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

## 10. R-25 Final Zoom And Design Regression Result

R-25 passed on 2026-07-15 against a managed local Next dev server at `http://localhost:3017`.

Fixed before the passing run:

- Team Operations CRM selected-task slide-over no longer clips the close button or task tabs at `1920x1080`.
- The task panel remains a bounded overlay and no longer expands the workspace layout past the viewport.

Passed:

- Guest login and investor demo reset.
- Main workspace section render pass at `1920x1080`.
- Dense screen zoom-equivalent checks:
  - `80%`: `2400x1350`
  - `100%`: `1920x1080`
  - `125%`: `1536x864`
  - `150%`: `1280x720`
- Dense screens checked: Data Intake, Approvals, Reports, Connectors, B2B Bridge, and Settings.

Artifacts:

- Report: `qa-artifacts/r25-zoom-readiness/r25-zoom-smoke.json`
- Screenshots: `qa-artifacts/r25-zoom-readiness/`, `38` screenshots.

Result:

- `ok: true`, `failedCount: 0`.
- No console errors, page errors, request failures, bad `5xx` responses, horizontal overflow, or clipped visible controls were detected.
- Focused ESLint passed for the Team CRM task panel and reusable browser smoke script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

## 11. R-26 Local Production Readiness Result

R-26 passed on 2026-07-15 with local production `next start` smoke.

Passed:

- Local `.env.local` key-name audit, with no secret values printed.
- Production fail-safe without `GENIUS_SESSION_SECRET`:
  - `/login` returned `200`.
  - `/api/auth/guest` returned `500` with `GENIUS_SESSION_SECRET is required in production.`
- Local configured production smoke with temporary child-process-only `GENIUS_SESSION_SECRET` and `GENIUS_FORCE_LOCAL_STORE=1`:
  - `/login` returned `200`.
  - `/api/auth/guest` returned `200`.
  - `/api/auth/session` returned guest session with empty `email` and empty `emailMasked`.
  - `/api/demo/reset` returned `200`.
  - `/api/readiness` returned `200`, `status: investor_ready`, `score: 97`, `backend.storage: local`.

Artifacts:

- Report: `qa-artifacts/r26-production-readiness/r26-production-readiness-smoke.json`

Production blockers still remaining:

- Add real `GENIUS_SESSION_SECRET` and `GENIUS_LIVE_INGEST_SECRET` outside the repo.
- Verify Supabase schema/RLS in the real project.
- Run cross-tenant Supabase smoke.
- Deploy remotely and run production URL smoke.

## 12. R-27 Supabase Production Contract Result

R-27 prepared the production verification layer and fixed a Supabase schema drift issue before deployment.

Fixed:

- `supabase/schema.sql` now matches the report fields used by `lib/server/supabase-workspace-store.js`.
- Table creation is idempotent.
- Existing report tables can be migrated with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- RLS is enabled and forced in the schema.
- Workspace-scoped indexes are present.

Added:

- Local schema/code contract smoke: `qa-artifacts/r27-production/r27-supabase-schema-contract-smoke.mjs`
- Remote Supabase REST smoke: `qa-artifacts/r27-production/r27-supabase-rest-smoke.mjs`
- Remote production URL smoke: `qa-artifacts/r27-production/r27-production-url-smoke.mjs`
- Supabase SQL Editor verification: `supabase/r27_rls_verification.sql`

Verified:

- `node qa-artifacts/r27-production/r27-supabase-schema-contract-smoke.mjs` passed.
- Focused ESLint for R27 QA scripts passed.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked:

- `node qa-artifacts/r27-production/r27-supabase-rest-smoke.mjs` failed with `ENOTFOUND` for `https://fdscrwloptchpozyotiv.supabase.co`.
- Real Supabase table/column verification, RLS verification, cross-tenant smoke, remote deploy, and production URL smoke are still pending until the Supabase project URL/env is corrected.

## 13. R-28 Release Gate Result

R-28 added the final aggregate release gate and cross-tenant production smoke.

Added:

- `qa-artifacts/r28-release/r28-release-gate.mjs`
- `qa-artifacts/r28-release/r28-cross-tenant-production-smoke.mjs`

The release gate runs four required checks:

- local Supabase schema/code contract smoke
- remote Supabase REST schema smoke
- remote production URL smoke
- two-account cross-tenant isolation smoke

Verified:

- Focused ESLint for R27/R28 QA scripts passed.
- `node qa-artifacts/r28-release/r28-release-gate.mjs` produced a structured report.
- Report: `qa-artifacts/r28-release/r28-release-gate.json`
- Current result: `requiredPassed: 1`, `requiredTotal: 4`.

Current blockers:

- `schema_contract`: passed.
- `supabase_rest`: blocked by `ENOTFOUND` for `https://fdscrwloptchpozyotiv.supabase.co`.
- `production_url`: blocked because `GENIUS_PRODUCTION_BASE_URL` is not set.
- `cross_tenant`: blocked because `GENIUS_PRODUCTION_BASE_URL` and two disposable tenant account credentials are not set.

Final release condition:

- `npm.cmd run qa:release` must return `ok: true`.

## 14. R-29 Production Env And Live-Ingest Gate Result

R-29 hardened the final release gate so Gemini/Claude/Antigravity can run one command and see exactly what is blocking production readiness.

Added:

- `qa-artifacts/r29-release/r29-production-env-doctor.mjs`
- `qa-artifacts/r29-release/r29-live-ingest-production-smoke.mjs`
- `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID` in `.env.example`
- `production_env` and `live_ingest` steps in `qa-artifacts/r28-release/r28-release-gate.mjs`

The release gate now runs six required checks:

- production env doctor
- local Supabase schema/code contract smoke
- remote Supabase REST schema smoke
- remote production URL smoke
- two-account cross-tenant isolation smoke
- production live-ingest security smoke

Verified:

- Focused ESLint passed for the R-29 QA scripts and aggregate gate.
- `node qa-artifacts/r29-release/r29-production-env-doctor.mjs` produced `qa-artifacts/r29-release/r29-production-env-doctor.json`.
- `node qa-artifacts/r28-release/r28-release-gate.mjs` produced `qa-artifacts/r28-release/r28-release-gate.json`.
- Current result: `requiredPassed: 1`, `requiredTotal: 6`.

Current blockers:

- `schema_contract`: passed.
- `production_env`: blocked by missing `GENIUS_SESSION_SECRET`, `GENIUS_LIVE_INGEST_SECRET`, `GENIUS_PRODUCTION_BASE_URL`, two tenant account credentials, and Supabase DNS `ENOTFOUND`.
- `supabase_rest`: blocked by `ENOTFOUND` for `https://fdscrwloptchpozyotiv.supabase.co`.
- `production_url`: blocked because `GENIUS_PRODUCTION_BASE_URL` is not set.
- `cross_tenant`: blocked because production URL and two disposable tenant account credentials are not set.
- `live_ingest`: blocked because production URL, `GENIUS_LIVE_INGEST_SECRET`, and `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID` are not set.

Next handoff for Gemini/Claude:

- Do not rewrite product logic first. Configure a real reachable Supabase project, apply `supabase/schema.sql`, run `supabase/r27_rls_verification.sql`, set production env in the deployment target, deploy, create/use two disposable tenant accounts, set `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID`, then run `npm.cmd run qa:release` until it returns `ok: true`.

## 15. R-30 Release QA Command Shortcuts

R-30 added npm shortcuts for all production readiness checks.

Commands:

- `npm.cmd run qa:env`
- `npm.cmd run qa:schema`
- `npm.cmd run qa:supabase`
- `npm.cmd run qa:production`
- `npm.cmd run qa:cross-tenant`
- `npm.cmd run qa:live-ingest`
- `npm.cmd run qa:release`

## 16. R-31 Route Security Contract Result

R-31 added a local API security contract gate.

Added:

- GET rate limits:
  - `app/api/chat/route.js`
  - `app/api/live-events/route.js`
  - `app/api/evidence/export/route.js`
  - `app/api/audit/export/route.js`
- `qa-artifacts/r31-security/r31-route-security-contract-smoke.mjs`
- `npm.cmd run qa:security`
- `route_security` required step inside `npm.cmd run qa:release`

Verified:

- Focused ESLint passed.
- `npm.cmd run qa:security` passed with `44` checks across `33` route files.
- `npm.cmd run qa:release` now reports `requiredPassed: 2`, `requiredTotal: 7`.
- Passing release-gate steps now:
  - `route_security`
  - `schema_contract`
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.

Remaining blockers:

- Production env values are still missing.
- Supabase host `fdscrwloptchpozyotiv.supabase.co` still fails DNS.
- Production URL and two tenant smoke accounts are still not set.
- Live-ingest test workspace id is still not set.

## 17. R-32 Dependency Audit Gate Result

R-32 added dependency audit to the production release gate.

Added:

- `qa-artifacts/r32-security/r32-dependency-audit.mjs`
- `npm.cmd run qa:deps`
- `dependency_audit` required step inside `npm.cmd run qa:release`

Verified:

- `npm.cmd audit --audit-level=high` passed.
- `npm.cmd run qa:deps` passed and wrote `qa-artifacts/r32-security/r32-dependency-audit.json`.
- High vulnerabilities: `0`.
- Critical vulnerabilities: `0`.
- Review findings: `2` moderate findings through `next -> postcss`.
- Current aggregate release gate result: `requiredPassed: 3`, `requiredTotal: 8`.
- Passing release-gate steps now:
  - `route_security`
  - `dependency_audit`
  - `schema_contract`
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.

Remaining blockers:

- Same production blockers remain: reachable Supabase, production env, deployment URL, two tenant accounts, and live-ingest test workspace id.

## 25. R-38 AI Workbench Artifact Binding Result

R-38 closed the highest-risk remaining Workbench fake-action path.

Added:

- `POST /api/workbench/artifacts` for authenticated Workbench artifact persistence.
- `workspaceArtifacts` in normalized workspace state.
- Executive summary save projects into Reports.
- Negotiation plan and approval workflow saves project into approval-safe Approvals actions.
- Alternative selection saves as a Workbench artifact without creating an action.
- Workbench context panel now shows saved artifacts and navigates by artifact type.
- Analytical chat prompts now render the structured Workbench response so these actions are reachable from the normal AI Chat path.

Investor demo path now available:

- Enter guest workspace.
- Open `AI Chat / Workbench`.
- Send or choose an analytical prompt such as `Analyze Renewals`.
- Use `Draft summary` then `Save to Artifacts`; verify Reports contains the generated executive summary.
- Use `Create negotiation plan` then `Create & Request Approval`; verify Approvals contains the approval-safe action.

Verified:

- Focused ESLint passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 36 routes.
- Production smoke passed on temporary `next start`: guest `200`, workspace loaded, Workbench summary save `200`, Workbench plan save `200`, report projection true, approval action projection true, artifact count `2`, console errors `[]`.

Remaining blockers:

- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 26. R-39 AI Gateway Notes Binding Result

R-39 removed a local-only state gap from the CEO / AI Gateway.

Added:

- Gateway report note-only PATCH support.
- Persisted `note_added` entries in each gateway report `auditTrail`.
- Workspace `gateway_report_note_added` audit event.
- Notes tab reads saved notes from workspace state.
- Audit Log tab shows persisted gateway report events.

Investor demo path now available:

- Create or open a Gateway report.
- Open `Notes`.
- Add a human note and save.
- Open `Audit Log`.
- The note appears as a persisted gateway event and the report status is unchanged.

Verified:

- Focused ESLint passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production smoke passed: guest `200`, Team CRM report `200`, note-only Gateway PATCH `200`, status stayed `Pending AI Review`, report `auditTrail` contained `note_added`, workspace `auditLog` contained `gateway_report_note_added`.

## 27. R-40 B2B Bridge Discussion Metadata Binding Result

R-40 removed the visible local-only gap from B2B discussion creation and channel metadata controls.

Added:

- Persisted B2B discussion metadata under `operations.b2bThread.discussions`.
- `PATCH /api/operations/b2b` support for `action: "update_discussion"` and `operation: upsert|pin|unpin|archive|restore`.
- Workspace audit events for B2B discussion create/update actions.
- B2B Bridge now reads pinned/unpinned/archived/restored state from workspace state.
- ChannelList now renders persisted custom discussions instead of local component-only discussions.

Investor demo path now available:

- Enter guest workspace.
- Open `Multi-Business OS / B2B Bridge`.
- Click `New`; the discussion is saved to workspace state.
- Pin/unpin the channel; the state survives workspace refresh/import/export.
- Archive/restore the channel; the state is audit-logged and restored in the workspace snapshot.
- Export transcript still works for the currently selected discussion.

Verified:

- Focused ESLint passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production API smoke passed on temporary `next start`: page loaded, guest created, session validated, discussion upsert `200`, pin `200`, archive `200`, restore `200`, final persisted state `local=true`, `pinned=true`, `archived=false`, audit events `4`.

Remaining blockers:

- Secondary-channel message persistence is completed in R-41 below.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 28. R-41 B2B Bridge Secondary Thread Persistence Result

R-41 removed the remaining local-only secondary thread state from B2B Bridge.

Added:

- Persisted secondary thread records under `operations.b2bThread.discussionThreads`.
- Normalized B2B thread messages and scoped discussion threads.
- `POST /api/operations/b2b` now writes non-primary `discussionId` messages into the scoped secondary thread.
- `PATCH /api/operations/b2b` workflow status now updates the scoped secondary thread when `discussionId` is provided.
- B2B Bridge reads secondary messages and workflow status from workspace state instead of local React state.
- Transcript export now includes persisted secondary thread messages.

Investor demo path now available:

- Enter guest workspace.
- Open `Multi-Business OS / B2B Bridge`.
- Click `New` or select a non-primary discussion.
- Send an external message and an internal note.
- Approve the secondary workflow.
- Refresh workspace or export transcript; the scoped channel messages and approval state remain in workspace state.

Verified:

- Focused ESLint passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production API smoke passed on temporary `next start`: page loaded, guest created, session validated, secondary external message persisted, secondary internal note persisted, scoped workflow `Approved`, scoped thread message count `3`, no primary-thread leak, scoped audit events `3`.

Remaining blockers:

- Real external partner delivery, partner accounts, participant access rules, and cross-company data sharing are still intentionally locked until the production partner model is designed.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 29. R-42 Investor Click-Path QA Result

R-42 added a repeatable investor-critical API smoke for the local/product demo path.

Added:

- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`
- `npm.cmd run qa:investor`
- Redacted report output at `qa-artifacts/r42-investor/r42-investor-click-path-smoke.json`

The smoke validates:

- main screen response;
- guest workspace creation and signed-session validation;
- investor demo reset;
- Diagnostics workflow update, archive, and persistence;
- Data Intake CSV evidence upload and row-level spreadsheet parsing;
- Excel Workspace saved-view creation and final workspace persistence;
- Support ticket creation, comment persistence, and attachment-reference persistence;
- Team CRM task creation, update, list readback, workspace persistence, and audit events;
- B2B secondary discussion metadata, scoped external message, scoped internal note, and scoped workflow approval;
- Workbench executive-summary artifact persistence;
- Team CRM report creation into CEO Gateway;
- Gateway note-only audit persistence;
- final `/api/workspace` snapshot consistency;
- audit-log coverage for all investor-demo write events.

Verified:

- Focused ESLint passed for the new QA script.
- Production `next start` without `GENIUS_SESSION_SECRET` failed safely, confirming production auth guard behavior.
- Production `next start` with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `33` checks after the R-46 Data Intake to Excel Workspace extension.

How Gemini/Claude should use it:

- Run it after any Antigravity/UI binding changes that touch guest onboarding, Settings demo reset, Diagnostics, Support, B2B Bridge, Workbench, Team CRM, or CEO Gateway.
- For local dev server, set `GENIUS_INVESTOR_BASE_URL` only if the server is not on `http://127.0.0.1:3000`.
- For `next start`, set `GENIUS_SESSION_SECRET` on the server process before running the smoke.
- Do not store cookies, tokens, or real customer data in the generated JSON report.

Remaining blockers:

- This is not a replacement for visual QA after final design edits.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 30. R-43 Team CRM Checklist Persistence Result

R-43 connected Team Operations CRM checklist progress to the existing CRM task persistence layer.

Changed:

- `TaskPanel` checklist state now initializes from the selected task's `checklist/progress` summary.
- Checklist toggles persist through `updateCrmTask` and `/api/operations/crm-tasks`.
- Checklist save failures roll back the optimistic checkbox change and show an error toast.
- Team CRM board state now merges normalized task updates returned by the API.
- Drag/drop status changes now apply the saved task returned by the server.
- Task panel remounts by selected `task.id`, avoiding React 19 effect-state lint violations.
- `qa:investor` now verifies CRM task create/update/list/final workspace persistence and `crm_task_created` / `crm_task_updated` audit events.

Investor demo path now available:

- Open `Team Operations CRM`.
- Create a task from the header or a column.
- Open the task panel.
- Toggle checklist items.
- Move the task to another column.
- Refresh workspace or inspect `/api/workspace`; the task summary, progress, and status remain in `operations.crmTasks`.
- Submit to CEO Gateway; the gateway report is created as before.

Verified:

- Focused ESLint passed for Team CRM files and `/api/operations/crm-tasks`.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `22` checks.

Remaining blockers:

- Per-item checklist persistence and real binary task attachments are not implemented; the current product persists the operational checklist summary supported by the CRM task API.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 31. R-44 Investor Demo Reset And Diagnostics Workflow Smoke Result

R-44 aligned `qa:investor` with the actual investor walkthrough by loading deterministic demo data before testing Diagnostics.

Changed:

- `qa:investor` now calls `/api/demo/reset` with `confirm: "load-investor-demo"` after guest session validation.
- The smoke verifies that demo Diagnostics categories exist.
- The smoke updates a Diagnostics category through `PATCH /api/diagnostics`.
- The final workspace snapshot must retain `workflowStatus: Review` and `owner: QA Diagnostics`.
- The audit log must contain `diagnostic_workflow_updated`.

Investor demo path now covered:

- Landing responds.
- Guest workspace is created.
- Settings-style investor demo reset loads deterministic data.
- Diagnostics workflow status and owner assignment persist.
- The rest of the investor path continues through Support, Team CRM, B2B Bridge, Workbench, CEO Gateway, and audit log checks.

Verified:

- Focused ESLint passed for the investor QA script.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `26` checks.

Remaining blockers:

- This is API-level verification; visual/zoom QA is still required after final Antigravity design changes.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 32. R-45 Diagnostics Archive Binding Result

R-45 connected the Diagnostics detail-menu Archive control to the existing Diagnostics workflow persistence.

Changed:

- Diagnostics `Archive` now calls `updateDiagnosticWorkflow` with `status: "Closed"`.
- Archive respects the same `decide_approvals` capability and loading state as other Diagnostics workflow updates.
- The selected Diagnostics row updates to `Closed` after the server confirms the change.
- `qa:investor` now verifies Diagnostics archive persistence after the Review/owner assignment step.

Investor demo path now available:

- Open `Diagnostics`.
- Select a diagnostic category.
- Use the status dropdown to move it through workflow states.
- Use `Archive` from the detail menu.
- Refresh workspace or inspect `/api/workspace`; the diagnostic remains assigned and closed.

Verified:

- Focused ESLint passed for Diagnostics and the investor QA script.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `27` checks.

Remaining blockers:

- Archive is represented as workflow `Closed`; there is no separate deleted/hidden archive collection.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 33. R-46 Data Intake To Excel Workspace Smoke Result

R-46 extended the investor smoke so uploaded CSV spreadsheet evidence is parsed into real row-level data and then saved into the Excel Workspace view layer.

Changed:

- `qa:investor` uploads a generated CSV through `/api/evidence`.
- The smoke verifies that the bounded spreadsheet parser extracts `3` rows from the uploaded evidence.
- The smoke saves an Excel Workspace view through `/api/excel-workspace` with selected parsed row IDs, filters, and metrics.
- The final workspace snapshot must retain both parsed spreadsheet rows and the saved Excel Workspace view.
- Audit validation now includes `evidence_uploaded` and `excel_workspace_view_saved`.

Investor demo path now covered:

- Open `Data Intake`.
- Upload a CSV/XLSX spend file with supported headers.
- Confirm that row-level spreadsheet data is extracted.
- Open `Excel Workspace`.
- Save a filtered view using uploaded rows.
- Refresh workspace or inspect `/api/workspace`; uploaded rows and saved view metrics remain present.

Verified:

- Focused ESLint passed for the investor QA script.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `33` checks.

Remaining blockers:

- This is API-level verification; browser/zoom QA is still required after final design changes.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 34. R-47 Reports To Team CRM Backlog Binding Result

R-47 connected a visible Reports finding action to the existing Team Operations CRM persistence layer.

Changed:

- Reports `Add to backlog` now calls `createCrmTask` instead of a locked placeholder.
- The task id is deterministic from report and finding context, preventing duplicate backlog spam.
- The created task uses backlog status, severity-derived priority, report ID, and linked finding/action/evidence/proof context.
- After save, Reports opens Team Operations CRM with `taskId` focus context.
- Team Operations CRM accepts `taskId` / `crmTaskId` as initial selected task context.

Investor demo path now available:

- Open `Reports`.
- Open a report with findings.
- Click `Add to backlog` on a finding.
- Team Operations CRM opens with the created backlog task selected.
- Refresh workspace or inspect `/api/workspace`; the task remains in `operations.crmTasks`.

Verified:

- Focused ESLint passed for Reports and Team CRM.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `33` checks.
- `git diff --check` passed; CRLF warnings are informational.

Remaining blockers:

- Exact browser-click QA for this button should be rerun after final design changes.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 35. R-48 Support Attachment File Metadata Binding Result

R-48 connected the Support `Choose file` control to the existing support ticket attachment-reference workflow.

Changed:

- Support now uses a hidden file picker for PNG, JPG/JPEG, and PDF files up to `10MB`.
- Selected file metadata fills the attachment reference draft with file name, MIME type, size, and a support note.
- Creating a new support ticket with selected file metadata automatically saves the attachment reference to that ticket.
- Existing ticket attachment saves now preserve `type` and `size`.
- `qa:investor` verifies attachment metadata in `/api/support/tickets` and final `/api/workspace`.

Investor demo path now available:

- Open `Support`.
- Choose a PNG/JPG/PDF in the support ticket form.
- Create the ticket.
- The new ticket contains the attachment reference metadata in workspace state.

Verified:

- Focused ESLint passed for Support and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `35` checks.
- `git diff --check` passed; CRLF warnings are informational.

Remaining blockers:

- This is safe metadata persistence only; real binary support-file storage is still a later security/storage slice.
- Exact browser-click QA for the file picker should be rerun after final design changes.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 36. R-49 Connectors Event Stream Filter And Pause Binding Result

R-49 connected visible Connectors Event Stream controls to real local behavior.

Changed:

- Active Connectors filter rules now filter the visible Event Stream table.
- `Pause` freezes the current loaded stream rows and switches to `Resume`.
- `View all events` disables active filters for the current view.
- Empty filter results show a clear table state.
- `qa:investor` now saves connector filters through `/api/connectors`, verifies readback, verifies final workspace persistence, and requires `connector_filters_saved` in the audit log.

Investor demo path now available:

- Open `Connectors`.
- Save Event Stream filters.
- Show that the Event Stream count/table reflects active filters.
- Pause and resume the local stream view.
- Use `View all events` to clear active filters in the view.

Verified:

- Focused ESLint passed for Connectors and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `38` checks.
- `git diff --check` passed; CRLF warnings are informational.

Remaining blockers:

- Event filters are local workspace/UI preferences; they do not change external webhook ingestion.
- Historical backfill, credential manager, retry queue execution, and secret rotation remain production credential/security work.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 37. R-50 Reports Duplicate Draft Binding Result

R-50 connected the visible Reports `Duplicate report` action to real workspace persistence.

Changed:

- `Duplicate report` now creates a one-time markdown report schedule draft through the existing `/api/reports/schedules` contract.
- The action uses the same `export_data` permission gate as publish, schedule, and export.
- The button shows a saving state and the resulting draft appears in the Latest schedule panel.
- `qa:investor` now loads reports, creates a duplicate draft, verifies schedule readback, verifies final workspace persistence, and requires `report_schedule_draft_created` in the audit log.

Investor demo path now available:

- Open `Reports`.
- Select an active board report.
- Use `Duplicate report`.
- Show the new draft in Latest schedule.
- Explain that this is a local board-pack draft; external board/email publishing remains locked until production delivery credentials exist.

Verified:

- Focused ESLint passed for Reports and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `42` checks.
- `git diff --check` passed; CRLF warnings are informational.

Remaining blockers:

- External board/email delivery is intentionally not enabled without production provider credentials.
- Exact browser-click QA for this button should be rerun after final Antigravity design changes.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 38. R-51 Excel Workspace Column Visibility Binding Result

R-51 connected Excel Workspace `Columns` to real local behavior and saved-view persistence.

Changed:

- The `Columns` control is now a dropdown with toggleable table columns.
- Excel table header/body rendering now follows the visible-column model.
- The UI prevents hiding every data column.
- Saved views persist `visibleColumnIds`; the latest saved view restores them when loaded.
- `/api/excel-workspace` returns `visibleColumnIds` in view summaries.
- `qa:investor` saves a view with a reduced visible column set, verifies list readback, and verifies final workspace persistence.

Investor demo path now available:

- Open `Excel Workspace`.
- Use `Columns` to hide/show fields.
- Save the view.
- Reload or continue the demo and show that the saved view carries the column selection.

Verified:

- Focused ESLint passed for Excel Workspace, `/api/excel-workspace`, workspace-state, and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `44` checks.
- `git diff --check` passed; CRLF warnings are informational.

Remaining blockers:

- Workbook/sheet switching remains intentionally locked until a multi-workbook model exists.
- Exact browser-click QA for this dropdown should be rerun after final Antigravity design changes.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 39. R-52 Excel Workspace Row Lineage Expansion Result

R-52 connected Excel Workspace proof-row expansion to real local context.

Changed:

- Proof Trail expand/collapse buttons now maintain local expanded-row state.
- Expanded lineage rows show source evidence name/status, row description, category, owner, impact, confidence, and action status.
- Expanded rows provide quick routing to Evidence, Report, and Approval context.
- Workspace-backed proof rows now carry evidence/finding/action ids into the lineage panel.

Investor demo path now available:

- Open `Excel Workspace`.
- Scroll to `Proof Trail`.
- Expand a source row.
- Show evidence, finding, and approval context.
- Use the `Evidence`, `Report`, or `Approval` buttons to navigate to the connected section.

Verified:

- Focused ESLint passed for Excel Workspace.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `44` checks.
- `git diff --check` passed; CRLF warnings are informational.

Remaining blockers:

- This is a local UI expansion. It does not add new persistence because lineage is derived from existing workspace evidence/findings/actions.
- Exact browser-click QA for this control should be rerun after final Antigravity design changes.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 40. R-53 Langflow Demo Agent Result

R-53 added the first Langflow-ready agent without making the Next.js app depend on a local Python subprocess.

Changed:

- `Langflow Demo Agent` now appears in `workspace.agentRuns` with runtime metadata and artifact-only guardrails.
- `/api/agents/run` accepts `POST { "agentId": "langflow-demo" }`.
- If Langflow env is configured, the server calls `POST {LANGFLOW_SERVER_URL}/api/v1/run/{LANGFLOW_FLOW_ID}?stream=false`.
- If Langflow env is not configured, GENIUS uses a local supervised fallback that still saves a Workbench artifact.
- The result is saved as a Workbench artifact with `source: "langflow-demo-agent"`.
- The audit log records `langflow_demo_agent_run`.
- Command Center `Run` on `Langflow Demo Agent` triggers the demo agent and routes to AI Workbench with the saved artifact context.
- `langflow/genius-demo-agent.blueprint.json` defines the Agent 1 flow contract for Langflow/Gemini/Claude handoff.

Investor demo path now available:

- Open `Command Center`.
- In `Live Agent Operations`, find `Langflow Demo Agent`.
- Click its run control.
- Show that GENIUS saved a Workbench brief and did not execute external actions.
- Explain that real Langflow is enabled by server env only: `LANGFLOW_DEMO_ENABLED=1`, `LANGFLOW_SERVER_URL`, `LANGFLOW_FLOW_ID`, `LANGFLOW_API_KEY`.

Verified:

- Focused ESLint passed for the touched Langflow/server/UI/QA files.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `49` checks, including Langflow artifact creation, runtime guardrail, metadata persistence, and audit coverage.

Remaining blockers:

- `uv` / `langflow` is not available in the current PowerShell PATH, so no local Langflow process was started in this session.
- Real Langflow output requires a running Langflow server or Langflow Cloud endpoint and server-side env values.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 41. R-54 Profile Workbench Settings Persistence Result

R-54 connected the remaining local Profile, Workbench, and Settings controls to persisted workspace state.

Changed:

- Profile Personal Info and AI Preferences now save through `/api/workspace/preferences`.
- Profile Notifications now persist delivery channels, event categories, and quiet hours as workspace preferences.
- Profile Security now reads active workspace sessions from `/api/workspace/sessions`, hides raw network identity, and can revoke other sessions.
- AI Workbench composer attachments upload through `/api/evidence` using source `AI Workbench attachment`.
- AI Workbench options now route to settings, shortcuts, and clear/delete conversation behavior.
- AI Workbench conversation tags now persist through `/api/chat` and are retained in workspace snapshots.
- Settings Security & Data policy toggles now persist through `/api/workspace/preferences` and require `manage_workspace`.
- Public workspace redaction no longer blanks boolean notification `email` settings while still hiding real string emails.

Investor demo path now available:

- Open `Profile`.
- Edit personal info, AI communication style, notification channels/categories, and quiet hours.
- Open `Security & Sessions`; show that sessions are listed without raw IP/location.
- Open `AI Chat`; attach a file, tag a saved conversation, and use composer options.
- Open `Settings -> Security & Data`; toggle a policy as an Owner/Admin and show it persists.

Verified:

- Focused ESLint passed for Profile, Workbench, Settings, workspace API routes, workspace store, and investor QA.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `62` checks.

Remaining blockers:

- Browser click/visual QA should be rerun after final Antigravity design changes.
- Production auth-provider password/MFA management, real notification delivery, support binary storage, and external connector credentials remain locked.
- Production env/Supabase/deploy gate remains unchanged and should be handled from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.

## 22. R-37 Production Env Doctor Hardening

R-37 hardened the production env doctor so it matches the deployment handoff and gives actionable redacted next steps.

Changed:

- `qa-artifacts/r29-release/r29-production-env-doctor.mjs` now treats these handoff keys as required for production readiness:
  - `GEMINI_MODEL`
  - `SUPABASE_AUTH_KEY`
  - `SUPABASE_EVIDENCE_BUCKET`
  - `GENIUS_ALLOW_LOCAL_AUTH`
  - `GENIUS_TENANT_AUTH_FLOW`
  - `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID`
  - `GENIUS_EXPECT_SUPABASE`
- `qa:env` now validates:
  - `GENIUS_ALLOW_LOCAL_AUTH=0`
  - `GENIUS_EXPECT_SUPABASE=1`
  - `GENIUS_TENANT_AUTH_FLOW=signin|signup`
  - `GENIUS_FORCE_LOCAL_STORE` is not `1`
  - 32+ character session/live-ingest secrets when present
- `qa:env` now emits redacted `nextActions` for the operator or next AI agent.

Verified:

- Focused ESLint passed for the env doctor and release gate.
- `npm.cmd run qa:env` failed only on expected production input blockers and wrote actionable `nextActions`.
- `npm.cmd run qa:release` still reports `requiredPassed: 7`, `requiredTotal: 12`.
- Focused `git diff --check` passed for R-37 touched files.
- `npm.cmd run qa:deployment` passed after the handoff update.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.

Remaining blockers:

- Real production env values are still missing.
- `SUPABASE_URL` still points to a target returning `ENOTFOUND`.
- Production deployment URL, two tenant smoke accounts, and live-ingest test workspace id still need to be supplied.

## 21. R-36 Deployment Handoff Gate Result

R-36 made the production deployment handoff a required release-gate contract.

Added:

- `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`
- `qa-artifacts/r36-deployment/r36-deployment-handoff-smoke.mjs`
- `npm.cmd run qa:deployment`
- `deployment_handoff` required step inside `npm.cmd run qa:release`

Verified:

- Focused ESLint passed for the R-36 QA script and release gate.
- `npm.cmd run qa:deployment` passed with `15` checks.
- Current aggregate release gate result: `requiredPassed: 7`, `requiredTotal: 12`.
- Passing release-gate steps now:
  - `route_security`
  - `dependency_audit`
  - `live_idempotency`
  - `recovery_runbook`
  - `observability_contract`
  - `deployment_handoff`
  - `schema_contract`
- Focused `git diff --check` passed for R-36 touched files; CRLF warnings are informational.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.

Remaining blockers:

- Same production blockers remain: reachable Supabase, production env, deployment URL, two tenant accounts, and live-ingest test workspace id.
- `npm.cmd run qa:supabase` was re-run with external network access and still returned `ENOTFOUND` for `https://fdscrwloptchpozyotiv.supabase.co`; correct or restore the Supabase project URL before debugging application storage code.

Next exact task:

- Configure the real production env/deployment inputs from `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`.
- Apply `supabase/schema.sql` and run `supabase/r27_rls_verification.sql` against a reachable Supabase project.
- Run `npm.cmd run qa:release` until it returns `ok: true`.

## 20. R-35 Observability Contract Gate Result

R-35 added observability/readiness checks to the release gate.

Added:

- `docs/GENIUS_PRODUCTION_OBSERVABILITY_RUNBOOK.md`
- `qa-artifacts/r35-observability/r35-observability-contract-smoke.mjs`
- `npm.cmd run qa:observability`
- `observability_contract` required step inside `npm.cmd run qa:release`

Verified:

- `npm.cmd run qa:observability` passed with `14` checks.
- Current aggregate release gate result: `requiredPassed: 6`, `requiredTotal: 11`.
- Passing release-gate steps now:
  - `route_security`
  - `dependency_audit`
  - `live_idempotency`
  - `recovery_runbook`
  - `observability_contract`
  - `schema_contract`
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.

Remaining blockers:

- Same production blockers remain: reachable Supabase, production env, deployment URL, two tenant accounts, and live-ingest test workspace id.

## 19. R-34 Recovery Runbook Gate Result

R-34 added recovery and backup/restore readiness to the local release gate.

Added:

- `docs/GENIUS_PRODUCTION_RECOVERY_RUNBOOK.md`
- `qa-artifacts/r34-recovery/r34-recovery-runbook-smoke.mjs`
- `npm.cmd run qa:recovery`
- `recovery_runbook` required step inside `npm.cmd run qa:release`

Verified:

- `npm.cmd run qa:recovery` passed with `14` checks.
- Current aggregate release gate result: `requiredPassed: 5`, `requiredTotal: 10`.
- Passing release-gate steps now:
  - `route_security`
  - `dependency_audit`
  - `live_idempotency`
  - `recovery_runbook`
  - `schema_contract`
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.

Remaining blockers:

- Same production blockers remain: reachable Supabase, production env, deployment URL, two tenant accounts, and live-ingest test workspace id.

## 18. R-33 Live-Event Idempotency Gate Result

R-33 added retry-safe idempotency to live-event ingestion.

Added:

- `x-idempotency-key` header support.
- `idempotencyKey` body support.
- Workspace-scoped idempotency hash.
- Deterministic `live-idem-*` event ids for idempotent retries.
- `idempotency` docs in `/api/live-events/schema`.
- `npm.cmd run qa:live-idempotency`.
- `live_idempotency` required step inside `npm.cmd run qa:release`.

Verified:

- `npm.cmd run qa:security` passed with `49` checks.
- `npm.cmd run qa:live-idempotency` passed with `11` checks.
- Current aggregate release gate result: `requiredPassed: 4`, `requiredTotal: 9`.
- Passing release-gate steps now:
  - `route_security`
  - `dependency_audit`
  - `live_idempotency`
  - `schema_contract`
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.

Remaining blockers:

- Same production blockers remain: reachable Supabase, production env, deployment URL, two tenant accounts, and live-ingest test workspace id.

Verified:

- `npm.cmd run qa:schema` passed.
- `npm.cmd run qa:env` ran and failed only on expected production input blockers.
- `npm.cmd run qa:release` ran and produced the aggregate six-check report.

Main next command after env/deploy is ready:

- `npm.cmd run qa:release`
