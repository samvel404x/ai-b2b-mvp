# GENIUS Current Checkpoint

Date fixed: 2026-07-10
Last updated: 2026-07-16
Next planned work block: R-55 - final browser/visual QA after Antigravity design changes or production env/Supabase/deploy handoff; local investor API smoke includes Profile, Workbench, Settings, sessions, and Langflow demo-agent coverage

Execution deadline plan: `docs/GENIUS_FULL_PRODUCT_EXECUTION_PLAN_2026-07-18_25.md`

The release is now planned as a functional release candidate by 2026-07-18 and a security/reliability production candidate by 2026-07-25. The execution file is also the required operating brief for Gemini. Do not start parallel Gemini edits until the current dirty implementation pass has been verified and fixed as a shared baseline commit.

## Current State

The product direction and full execution checklist are fixed in `docs/GENIUS_FULL_PRODUCT_PLAN.md`.

The repository currently contains a large working-tree implementation pass. The core product shell, landing/auth flow, workspace provider, and several workspace sections have been worked on. The Operations backend pass is now implemented and verified.

## R-53 Langflow Demo Agent Integration

Langflow-ready Agent 1 is implemented for the current product cut.

Completed:

- `lib/server/langflow-demo-agent.js`: added a server-only Langflow HTTP adapter with timeout, summarized workspace context, strict output clamping, and local supervised fallback when Langflow env is not configured.
- `lib/server/workspace-engine.js`: added visible `Langflow Demo Agent` metadata to `workspace.agentRuns`, including runtime provider, blueprint path, and artifact-only guardrails.
- `lib/server/evidence-store.js`: added `runLangflowDemoAgent`, which saves the output as a Workbench artifact and records `langflow_demo_agent_run` without executing external actions.
- `app/api/agents/run/route.js`: `POST { agentId: "langflow-demo" }` now runs the Langflow demo path; normal POST still refreshes existing supervised agents.
- `components/genius/workspace-context.jsx` and `components/genius/sections/command-center.jsx`: Command Center can run `Langflow Demo Agent` from the Live Agent Operations control and route to AI Workbench with the saved artifact context.
- `.env.example`: documented server-only Langflow env vars.
- `langflow/genius-demo-agent.blueprint.json`: added the Agent 1 flow contract/blueprint for Langflow/Gemini/Claude handoff.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now verifies Langflow artifact creation, runtime guardrails, agent metadata persistence, and audit coverage.

Verified:

- Focused ESLint passed for the touched Langflow/server/UI/QA files.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 36 routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke passed `npm.cmd run qa:investor` with `49` checks, including Langflow artifact creation, runtime guardrail, metadata persistence, and audit event coverage.

Important:

- `uv` / `langflow` is not available in the current PowerShell PATH, so this pass does not start a local Langflow process.
- Next.js does not spawn `uv` or Python. Real Langflow is connected by setting `LANGFLOW_DEMO_ENABLED=1`, `LANGFLOW_SERVER_URL`, `LANGFLOW_FLOW_ID`, and `LANGFLOW_API_KEY` on the server.
- The fallback is intentional and investor-safe: it proves the agent workflow while keeping `externalExecution.enabled=false`.

## R-54 Profile, Workbench, Settings Persistence And UI Binding

The remaining local workspace UI binding pass is implemented for the current product cut.

Completed:

- `app/api/workspace/preferences/route.js`: added authenticated workspace preferences read/write with section-level capability checks.
- `app/api/workspace/sessions/route.js`: added active-session listing and revoke-other-session actions with raw IP/location hidden from the public UI.
- `lib/server/workspace-state.js`: added normalized preferences for profile, AI, notifications, security policies, and Workbench default tags; chat conversations now support persisted tags.
- `lib/server/evidence-store.js`: added workspace preference persistence, session projection/revoke helpers, `workspace_preferences_updated` audit events, and fail-closed Supabase mode when `GENIUS_EXPECT_SUPABASE=1`.
- `components/genius/profile/*`: Personal Info, AI Preferences, Notifications, and Security now read/write workspace state instead of resetting to local-only UI state.
- `components/genius/sections/ai-chat.jsx` and `components/genius/sections/workbench/*`: Workbench file attachment uses evidence upload, options route to real actions, clear conversation uses existing delete/draft clear behavior, and conversation tags persist through `/api/chat`.
- `components/genius/sections/settings.jsx`: Security & Data policy toggles now persist to workspace preferences and require `manage_workspace`.
- `lib/server/workspace-state.js`: fixed public redaction so boolean `preferences.notifications.channels.email` is no longer converted to an empty string while real string email values remain hidden.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now verifies preferences, security policy preferences, notification preferences, session privacy, Workbench chat tags, final workspace persistence, and audit coverage.

Verified:

- Focused ESLint passed for the touched Profile, Workbench, Settings, API, store, and QA files.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated `38` app routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke passed with `62` checks using an isolated local store and `GENIUS_FORCE_LOCAL_CHAT=1`.
- Regression check confirms `notifications.channels.email` remains boolean `true` in public API response and final workspace snapshot.

Remaining:

- Browser/visual QA should be rerun after final Antigravity design changes.
- Real production readiness still depends on valid Supabase, production env, deploy URL, cross-tenant accounts, and live-ingest test workspace inputs.
- Production auth-provider password/MFA management, real notification delivery, support binary storage, and external connector credentials remain intentionally locked.

## Known Completed Or Mostly Completed Work

- Landing screen exists before registration so a user can understand the product first.
- After registration/signin, the user is intended to enter the workspace.
- Email/password auth route exists with local development fallback.
- Workspace state is centralized through a frontend provider.
- Core sections have been partially wired to workspace data: Command Center, Data Intake, Approvals, Agents, AI Chat, Reports, Settings, Savings Radar, Connectors, Excel Workspace.
- Local workspace fallback is still available when production Supabase configuration is missing.

## Completed In This Checkpoint

Operations backend has been completed for the current product cut.

Completed changes include:

- `lib/server/workspace-state.js`: added operations state shape for gateway reports, B2B thread, and CRM tasks.
- `lib/server/evidence-store.js`: added operation helpers for team reports, gateway updates, B2B messages, workflow status updates, CRM task persistence, and audit events.
- `app/api/operations/team-report/route.js`: Team CRM submission API.
- `app/api/operations/reports/[id]/route.js`: CEO Gateway report decision API.
- `app/api/operations/b2b/route.js`: B2B message and workflow status API.
- `components/genius/workspace-context.jsx`: operations methods exposed through the single frontend state gateway.
- `components/genius/sections/team-crm.jsx`: Submit to CEO / AI writes a real gateway report.
- `components/genius/sections/ai-gateway.jsx`: approve/delegate and revision decisions write report status.
- `components/genius/sections/b2b-bridge.jsx`: messages, AI summary, and terms approval write to the backend.

Verified:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Runtime smoke test passed: `/api/workspace`, team report submit, gateway delegation, B2B message, and B2B workflow approval.

## Completed In Current Phase 3 Block

Full button wiring has started.

Completed changes include:

- `components/genius/sections/command-center.jsx`: Evidence Graph nodes/more links navigate to real sections; decision `Edit` opens Approvals; finding menu actions now navigate or show an intentional locked false-positive state.
- `components/genius/sections/reports.jsx`: findings CSV export uses the backend evidence export; report status pills navigate to Settings, Connectors, Diagnostics, and Approvals; share link copies the current page; finding backlog creation now writes Team CRM tasks; external board publishing and duplication stay locked intentionally.
- `components/genius/app-shell.jsx`: profile/account menus navigate to Profile and Settings; Sign out calls the real session delete flow; billing, invites, account switching, date range selection, and notification bulk actions are intentionally locked.
- `components/genius/sections/connectors.jsx`: provider/database/health/quality pills navigate to real sections; live stream clear uses the real live-events API; filters persist and now filter the Event Stream UI; pause/resume freezes the local stream view; production-only connector settings, credential manager, retry queue, secret rotation, and historical backfill remain locked intentionally.
- `components/genius/sections/support.jsx`: support categories, breadcrumbs, onboarding pipeline, status links, security links, email support, and workspace refresh now navigate or execute real local actions; ticket creation is controlled and clearly marked as prepared until support persistence exists.
- `components/genius/sections/profile.jsx`: profile fields are controlled, editable, locally savable, and security/session operations now show intentional locked states until production auth/member management is implemented.
- `components/genius/sections/excel-workspace.jsx`: filtered workbook export now downloads a real CSV; analysis/report/finding/breakdown/proof/connector CTAs navigate to Agents, Reports, Savings, Diagnostics, Data Intake, and Connectors; spreadsheet-only configuration remains intentionally locked.
- `components/genius/sections/diagnostics.jsx`: real category/severity/owner/status filters, status changes, detail drilldowns, evidence navigation, and intentional locks for assignment/archive persistence.
- `components/genius/sections/agents.jsx`: detail tabs and output/proof/approval navigation are wired; agent filters and task-board actions work; production-only policy actions are intentionally locked.
- `components/genius/sections/ai-chat.jsx`: evidence and spreadsheet shortcuts navigate to their real sections; proof links open Data Intake; persistent search/files/voice capabilities are intentionally locked.
- `components/genius/sections/data-intake.jsx`: source/status filtering, review/proof navigation, approval routing, pagination, workspace refresh, and truthful locked states for archived/date/column/routing controls are wired.
- `app/login/page.jsx`, `components/genius/sections/ai-gateway.jsx`, `components/genius/sections/team-crm.jsx`, `components/genius/sections/ai-chat.jsx`, and `lib/db/adapter.js`: React 19 lint blockers were resolved without disabling lint rules.

Verified after this block:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.

## Next Exact Task

Release task `R-07` is in progress: support ticket persistence and lifecycle actions, connector request/filter persistence, report schedule draft persistence, Approvals lifecycle actions, Diagnostics workflow persistence, demo reset session preservation, and desktop visual QA cleanup are implemented; continue remaining production workflow wiring across lower-risk workspace sections. Gemini must start from the verified current baseline and stay inside its assigned section files.

## Current Risk

The codebase was lint/build clean at the completed Operations checkpoint. The working tree now contains additional intentional product changes and should not be reset or reverted.

## Planning And Baseline Verification Update

The deadline-oriented execution plan is fixed in `docs/GENIUS_FULL_PRODUCT_EXECUTION_PLAN_2026-07-18_25.md`.

Verification after completing the technical part of `R-00`:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 26 routes.
- `git diff --check` passed; line-ending conversion warnings are informational.

The remaining `R-00` action is creating or confirming the clean shared baseline commit. No commit was created automatically because the working tree contains a large combined product pass.

## R-02 Auth And Tenant Boundary

The strict authenticated workspace boundary is implemented and ready for review.

Completed:

- `lib/server/auth-session.js`: removed anonymous default-workspace fallback; added strict authenticated context, stable `401` response, malformed-cookie handling, session IDs/timestamps, workspace-ID verification, and production secret validation.
- `lib/server/supabase-auth.js`: local authentication fallback is now impossible in production, even if the development flag is set.
- `.env.example`: documented Supabase auth/storage, dedicated session secret, development auth fallback, and live-ingest token variables.
- All private Route Handlers now reject missing, expired, or forged sessions before reading or mutating workspace state.
- `app/api/live-events/route.js`: external ingest uses constant-time token comparison, validated workspace IDs, explicit token/session modes, and blocks demo loading through webhook credentials.

Verified:

- Route audit confirmed every non-public Route Handler uses `requireRequestWorkspaceContext`.
- Runtime smoke: anonymous workspace `401`, forged cookie `401`, expired cookie `401`, valid signed session `200`, and returned workspace ID matched the user-derived tenant ID.
- Runtime smoke: client workspace override without webhook token `401`, invalid webhook token `401`, valid token with empty payload reached validation `400`, and external-token demo load was blocked with `403`.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed and generated all 26 routes.
- `git diff --check` passed.

Residual risk:

- The current signed cookie is still stateless. Server-side session revocation and refresh-token rotation require normalized session/member persistence and remain coupled to `R-03` and `R-04`.
- Role values are not yet enforced per capability. Authentication is now strict; authorization is the next task.

## R-03 Workspace Roles And Authorization

Workspace role/capability enforcement is implemented and ready for review.

Completed:

- `lib/server/authorization.js`: added normalized workspace roles, member profile shape, capability matrix, public member projection, and shared `403` response helper.
- `lib/server/auth-session.js`: sessions now carry role, position, department, member profile, and capabilities.
- `lib/server/supabase-auth.js`: signup/signin preserves role, position, department, and workspace metadata; local auth remains disabled in production.
- `lib/server/evidence-store.js` and `lib/server/workspace-state.js`: workspace members are now persisted in local workspace state.
- Sensitive route handlers now enforce capabilities for AI usage, agent runs, approvals, evidence upload/review/delete, exports, workspace reset, operations decisions, B2B workflows, notifications, and live-event management.
- `components/genius/workspace-context.jsx`: workspace members are exposed through the client workspace gateway.
- `components/genius/logo.jsx` and `public/genius-logo.png`: the logo asset is now transparent, with the previous visible background removed.

Verified:

- Focused ESLint passed for the R-03 server/client files and touched route handlers.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 26 routes.
- Runtime source smoke passed: Viewer can read workspace but receives `403` for agent/export/approval actions; Manager passes the approval permission and reaches the expected missing-action `404`; Admin cannot reset workspace; Owner can reset workspace.

Residual risk:

- Full `git diff --check` is currently blocked by pre-existing trailing whitespace in older UI section files from the wider product pass: `ai-gateway.jsx`, `b2b-bridge.jsx`, `command-center.jsx`, and `team-crm.jsx`.
- The signed cookie is still stateless. Server-side session revocation, invite/member management, and client-side UX hiding for unavailable capabilities belong to `R-04`.
- Production authorization now exists on the server, but some UI controls may still be visible to roles that will receive `403`; this should be cleaned up in the next UX-gating pass.

## R-04 Member Persistence And UX Gating

Workspace member management and client capability gating are implemented for the current product cut.

Completed:

- `lib/server/authorization.js`, `lib/server/workspace-state.js`, and `lib/server/evidence-store.js`: workspace members are normalized with active/invited/disabled status, persisted metadata, public member projection, last-owner protection, invite/update/disable helpers, and audit events.
- `app/api/workspace/members/route.js`: authenticated roster read, invite, update, and soft-disable endpoints now exist and enforce `manage_members`.
- `app/api/auth/email/route.js`: signup/signin now refreshes persisted member state, records `lastSeenAt`, and blocks disabled members from signing in.
- `components/genius/workspace-context.jsx`: added capability helpers plus member invite/update/disable methods, and added client-side guards for high-risk mutations and exports.
- `components/genius/account-modals.jsx`, `components/genius/app-shell.jsx`, and `components/genius/sections/settings.jsx`: the invite modal, session profile display, and settings member roster now use real workspace member data and permissions.
- High-risk workspace controls now respect capabilities in Agents, Approvals, Data Intake, AI Gateway, B2B Bridge, Team CRM task submission, Connectors, Settings export, and Settings reset.

Verified:

- Focused ESLint passed for the R-04 server/client files. The remaining Team CRM avatar `<img>` warning from that phase was resolved in R-06.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 27 routes, including `/api/workspace/members`.
- R-04 source smoke passed: owner signup/read/invite/update/disable, Team CRM report submit, Gateway approval, Viewer `403` on agents/invite, and Admin `403` on reset.
- Scoped R-04 `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Invite creates and persists roster members, but full invite-token join from login is not implemented yet.
- Cookies remain stateless for already-issued sessions. Disabled members are blocked on signin, but live session revocation still needs a server-side session registry.
- The Team CRM avatar `<img>` warning from this phase was resolved in R-06.
- Some lower-risk/read-only controls still use demo or locked behavior and should be cleaned up after core workflows.

Next exact task: release task `R-05`, implementing invite-token join through login, server-side session revocation/refresh, and remaining role UX cleanup.

## R-05 Invite Join Flow And Session Revocation

Invite-token join, server-side session validation, and role-change revocation behavior are implemented for the current product cut.

Completed:

- `lib/server/workspace-state.js` and `lib/server/evidence-store.js`: added persisted workspace session registry plus hashed invite-token metadata while keeping private session/token fields out of public workspace payloads.
- `lib/server/auth-session.js`: signed cookies now identify a session, but current authorization is revalidated against the persisted session registry and active workspace member on every protected request.
- All protected Route Handlers now use async validated auth context, so disabled members and revoked sessions cannot continue reading or mutating workspace data with an old cookie.
- `app/api/workspace/invite/route.js`: public invite lookup endpoint validates token, expiry, target member, and workspace metadata before login.
- `app/api/auth/email/route.js`: signup/signin accepts invite tokens, joins the invited workspace, preserves the assigned role/position/department, registers the session server-side, and supports existing user invite acceptance.
- `app/api/auth/session/route.js`: sign out revokes the server-side session before clearing the browser cookie.
- `app/api/workspace/members/route.js`: invite responses now include a copyable join URL; member disable/downgrade revokes or restricts active sessions immediately.
- `components/genius/account-modals.jsx` and `app/login/page.jsx`: invite modal now shows a copyable join link, and login/signup accepts `?invite=...` links with a one-step invited-account flow.
- Fixed full-lint blockers in AI Gateway subcomponents and removed trailing whitespace in touched section files.

Verified:

- Focused R-05 ESLint passed.
- Full `npm.cmd run lint` passed with 0 errors; the remaining Team CRM `<img>` warnings from that phase were resolved in R-06.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 28 routes, including `/api/workspace/invite`.
- R-05 source smoke passed: owner signup/read, invite-token creation, public invite lookup, invited signup into same workspace, public payload hides sessions/invite hashes, Admin can run agents, role downgrade to Viewer immediately returns `403`, member disable makes old cookie return `401`, and sign out revokes the owner session.
- Full `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Invitations are copy-link based; transactional email delivery is not implemented yet.
- Session registry is stored inside the workspace snapshot for this product cut. For higher-scale production, it should move into normalized database tables with indexed lookup.
- Supabase refresh-token rotation/revocation is still not integrated; app-level cookie/session revocation is implemented.
- Team CRM `<img>` lint warnings were resolved in R-06 by moving avatars to `next/image`.
- Some lower-risk UI controls still intentionally show demo/locked behavior until their production backend workflows are wired.

R-06 was completed after this block. R-07 is now in progress; support ticket persistence is complete and the next exact task is another secondary workflow slice plus desktop visual QA.

## R-06 Production UX Cleanup And Team CRM Media Polish

Team CRM polish is implemented and verified for the current product cut.

Completed:

- `next.config.mjs`: added a constrained Next Image remote allowlist for DiceBear notionists PNG avatars.
- `components/genius/sections/team-crm/crm-bottom-widgets.jsx`: replaced raw avatar `<img>` usage with `next/image` and removed a non-ASCII separator that could render inconsistently in terminals.
- `components/genius/sections/team-crm/kanban-board.jsx`: replaced task assignee raw avatar `<img>` usage with `next/image`.
- `components/genius/sections/team-crm/task-panel.jsx`: replaced raw avatar `<img>` usage with `next/image`.
- `components/genius/sections/team-crm/task-panel.jsx`: removed unfinished placeholder tab content and added real Details, Notes, Attachments, and Activity panel states.
- `components/genius/sections/team-crm/task-panel.jsx`: added a truthful empty attachment state, safer completion percentage calculation, and horizontally scrollable tabs so the side panel does not break at narrower desktop widths.

Verified:

- Focused ESLint passed for `next.config.mjs` and the touched Team CRM subcomponents.
- Full `npm.cmd run lint` passed with 0 errors and no remaining Team CRM `<img>` warnings.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 28 routes.
- `git diff --check` passed; CRLF warnings are informational.
- Temporary dev-server HTTP smoke passed: `/` returned `200`, and `/workspace` returned `200`.

Residual risk:

- Full browser screenshot verification was not available in this tool session because agent-browser/Playwright/Puppeteer execution was unavailable locally; HTTP runtime smoke, lint, and production build passed.
- DiceBear avatars still depend on an external image service. Production should eventually move member/task avatars to stored workspace assets or deterministic initials fallback.
- Some lower-risk controls in secondary sections still intentionally show locked/demo behavior until their production backends are assigned in the next wiring pass.

Next exact task: continue release task `R-07` with report scheduling draft persistence, then desktop visual QA for 100% scale plus stress checks around 80%-150%.

## R-07 Support Ticket Workflow Slice

Support ticket creation is implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-state.js`: added normalized `supportTickets` to the stable workspace shape.
- `lib/server/evidence-store.js`: added `createSupportTicket`, ticket ID generation, support ticket audit events, and persistence through the existing workspace store.
- `app/api/support/tickets/route.js`: added authenticated `GET` and `POST` endpoints for listing and creating support tickets.
- `components/genius/workspace-context.jsx`: exposed `supportTickets` and `createSupportTicket` through the central workspace provider.
- `components/genius/sections/support.jsx`: the support form now creates a real persisted ticket, the ticket KPI reads workspace ticket state, and the Live Support card shows the latest saved tickets.
- Support binary attachment storage and external support integrations remain intentionally locked. Local support ticket comments/status and attachment metadata references were completed in later support slices, including R-48.

Verified:

- Focused ESLint passed for the support ticket route, workspace state/store helpers, workspace provider, and Support UI.
- HTTP route smoke passed on a temporary Next dev server and isolated temp workspace: signup `200`, support ticket POST `200`, support tickets GET `200`, persisted open count `1`.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 29 routes, including `/api/support/tickets`.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Support ticket attachments are not implemented yet; they should reuse the existing evidence/file storage pattern rather than adding ad hoc upload code.
- Ticket status updates and support-team assignment are not implemented yet; the current cut covers authenticated creation/listing and auditability.
- Browser screenshot verification is still pending for the wider R-07 visual QA pass.

Next exact task: choose and implement the next low-risk workflow slice, then rerun focused browser QA for the touched section.

## R-07 Support Ticket Lifecycle Slice

Support ticket status lifecycle is implemented and verified for the current product cut.

Completed:

- `lib/server/evidence-store.js`: added `updateSupportTicketStatus` with status validation, status history events, audit events, and persistence through the existing workspace store.
- `lib/server/evidence-store.js`: status updates are limited to the ticket requester or workspace members with `manage_members`, preserving a clear security boundary until a dedicated support-agent role exists.
- `app/api/support/tickets/route.js`: added authenticated `PATCH` support for updating ticket status.
- `components/genius/workspace-context.jsx`: exposed `updateSupportTicketStatus` through the central workspace provider.
- `components/genius/sections/support.jsx`: Live Support now uses real `Mark resolved` and `Reopen` actions against the persisted ticket state, with busy/disabled handling.

Verified:

- Focused ESLint passed for the support ticket route, evidence store helper, workspace provider, and Support UI.
- Isolated HTTP smoke passed on a temporary Next dev server: signup `200`, support ticket create `200`, resolve `200`, reopen `200`, tickets GET `200`, final open count `1`, ticket event count `3`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 31 routes, including `/api/support/tickets`.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Ticket assignments, comments, attachments, SLA/escalation queues, and admin support console are not implemented yet.
- Lifecycle permission currently uses requester-or-`manage_members`; a production support-team role should get a dedicated capability later.
- Focused browser screenshot QA for the Support section is still recommended after the next UI-heavy support pass.

Next exact task: choose another low-risk workflow slice or run focused browser QA for Support if the next change touches support UI again.

## R-07 Connector Request And Filter Persistence Slice

Connector request and filter persistence is implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-state.js`: added normalized `connectorRequests` and `connectorFilters` to the stable workspace shape.
- `lib/server/evidence-store.js`: added `createConnectorRequest` and `saveConnectorFilters` with audit events and workspace persistence.
- `app/api/connectors/route.js`: added authenticated connector state read, connector request creation, and filter preset persistence.
- `components/genius/workspace-context.jsx`: exposed `connectorRequests`, `connectorFilters`, `requestConnector`, and `saveConnectorFilters` through the central workspace provider.
- `components/genius/sections/connectors.jsx`: `Request a connector` now opens a real persisted request form; `Filters` uses editable rules; `Save filters` persists rules through the backend; saved requests appear in the connector sidebar.
- Credential manager, secret rotation, retry queue management, historical backfill, and external connector docs remain intentionally locked because they require production credentials or external integrations.

Verified:

- Focused ESLint passed for the connector route, workspace state/store helpers, workspace provider, and Connectors UI.
- HTTP route smoke passed on a temporary Next dev server and isolated temp workspace: signup `200`, connector request POST `200`, connector filters PATCH `200`, connector state GET `200`, persisted request count `1`, persisted filter rule count `2`.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 30 routes, including `/api/connectors`.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Connector filter rules are persisted as workspace preferences and now filter the local Event Stream UI; they still do not change server-side live-event ingestion behavior.
- Connector requests are saved to the workspace backlog, but assignment/status transitions for the internal implementation team are not implemented yet.
- Browser screenshot verification is still pending for the wider R-07 visual QA pass.

Next exact task: choose and implement the next low-risk workflow slice, then rerun focused browser QA for the touched section.

## R-07 Report Scheduling Draft Persistence Slice

Report scheduling draft persistence is implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-state.js`: added normalized `reportSchedules` to the stable workspace shape with cadence, format, recipient, owner, status, and timestamp normalization.
- `lib/server/evidence-store.js`: added `createReportScheduleDraft`, schedule ID generation, validation, audit events, and workspace persistence.
- `app/api/reports/schedules/route.js`: added authenticated `GET` and capability-gated `POST` endpoints for report schedule drafts.
- `components/genius/workspace-context.jsx`: exposed `reportSchedules` and `createReportSchedule` through the central workspace provider.
- `components/genius/sections/reports.jsx`: `Schedule report` now opens a real draft form, saves cadence/format/recipients/review note through the backend, and shows the latest saved schedule. External delivery remains intentionally locked; this slice persists the draft only.

Verified:

- Focused ESLint passed for the report schedule route, workspace state/store helpers, workspace provider, and Reports UI.
- HTTP route smoke passed on a temporary Next dev server and isolated temp workspace: signup `200`, report schedule POST `200`, report schedules GET `200`, persisted schedule count `1`, recipient count `1`.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 31 routes, including `/api/reports/schedules`.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- The schedule is a saved draft only. Email delivery, cron execution, board portal publishing, retry logs, and recipient verification are not implemented yet.
- Schedule drafts are stored in workspace state for this product cut; production-scale scheduling should move to normalized schedule/job tables with idempotent workers.
- Browser screenshot verification is still pending for the wider R-07 visual QA pass.

Next exact task: choose and implement the next low-risk workflow slice, then rerun focused browser QA for the touched section.

## R-07 Desktop Visual QA And Scaling Cleanup

Desktop visual QA is implemented and verified for the current product cut.

Completed:

- `app/globals.css`: removed the stale local `Inter` font-face reference that pointed at a missing `/fonts/inter-var.woff2` asset; the app now falls back to the configured system/Geist stack without a missing font request in production output.
- `components/genius/landing-page.jsx`: converted invalid SVG path percentages to numeric `viewBox` coordinates so the landing page no longer emits SVG path parsing errors; preloaded the above-the-fold GENIUS logo.
- `components/genius/app-shell.jsx`: preloaded the workspace loading logo and kept the responsive shell behavior intact.
- `components/genius/sections/reports.jsx`: made the Reports header responsive at narrower desktop widths; secondary status pills collapse before the header forces horizontal overflow, while primary report actions remain visible.
- `components/genius/sections/team-crm/crm-metrics.jsx` and `components/genius/sections/team-crm/kanban-board.jsx`: reduced KPI and Kanban column fixed widths so the Team CRM board behaves better at 1920x1080 and still uses intentional horizontal scrolling for dense workflow lanes.
- `components/genius/sections/excel-workspace.jsx` and `components/genius/sections/connectors.jsx`: tightened KPI card sizing and hid decorative sparklines below wide desktop widths to reduce clipping and keep the sections usable around 1280px.

Verified:

- Browser QA used system Chrome through Playwright with a temporary authenticated local workspace.
- Screenshots and DOM overflow metrics were captured under `work/visual-qa-r07/`.
- Landing page at `1920x1080`: no document-level horizontal overflow; remaining offscreen elements are decorative absolute background glows that do not increase page width.
- Reports at `1280x720`: no document-level horizontal overflow and no uncontained offender after header cleanup.
- Team CRM at `1920x1080`: board remains usable with intentional horizontal Kanban scrolling and side panel visible.
- Production output check: `.next/static` and `.next/server` contain no `inter-var` or `/fonts/inter` references after build.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 31 routes.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- The dense workspace intentionally relies on horizontal scrolling for Kanban lanes and KPI strips on narrower desktop widths; this is acceptable for the current desktop-first product cut, but final UX polish should add stronger scroll affordances.
- The landing page still uses large offscreen decorative background glows. They do not create document overflow, but they should be reviewed if mobile performance becomes a priority.
- Browser QA covered representative desktop sizes, not every workspace section at every viewport.

Next exact task: choose and implement the next low-risk workflow slice, then rerun focused browser QA for the touched section.

## R-07 Approvals Lifecycle And Demo Reset Session Slice

Approvals detail lifecycle actions are implemented and verified for the current product cut.

Completed:

- `app/api/actions/[id]/route.js`: added `Needs evidence` to the approved action status contract while keeping the route capability-gated by `decide_approvals`.
- `lib/server/evidence-store.js`: added `Needs evidence` to `updateActionStatus` and kept all action lifecycle transitions audit-backed through `decisionHistory` and `action_status_updated` events.
- `lib/server/evidence-store.js`: fixed `resetWorkspaceToDemo` so demo loading replaces business/demo data but preserves workspace identity state: members, sessions, workspace profile, and prior audit log.
- `components/genius/sections/approvals.jsx`: wired detail-panel `Save review note`, `Request more evidence`, `Snooze`, and `Mark done` to the real action status backend.
- `components/genius/sections/approvals.jsx`: added busy/disabled handling for action updates and fixed detail-panel close behavior so closing the panel no longer immediately reopens the first item.

Verified:

- Focused ESLint passed for the action route, evidence store, and Approvals UI.
- HTTP smoke passed on a temporary Next dev server and isolated temp workspace: signup `200`, demo reset `200`, workspace after reset `200`, `Needs evidence` `200`, `Snoozed` `200`, `Done` `200`, final status `Done`, decision history count `3`, audit event count `3`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 31 routes.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Approvals still use status transitions only; there is no dedicated evidence-request object, assignee workflow, SLA timer, or external notification delivery yet.
- `Save review note` stores the note through an `Edited` lifecycle event; a richer product pass should add a dedicated note-only endpoint if reviewers need independent note history.
- Focused browser screenshot QA for Approvals is still recommended after the next UI-heavy approvals pass.

Next exact task: choose the next low-risk workflow slice, with Diagnostics assignment/status persistence or Support comments/attachments as the likely next candidates.

## R-07 Diagnostics Workflow Persistence Slice

Diagnostics workflow status and owner assignment persistence are implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-engine.js`: added a `diagnostics.overrides` layer so human workflow status, owner, note, and update metadata survive derived diagnostics rebuilds.
- `lib/server/evidence-store.js`: added `updateDiagnosticWorkflow` with diagnostic id validation, allowed workflow statuses, audit events, and workspace persistence.
- `app/api/diagnostics/route.js`: added authenticated `PATCH` support gated by `decide_approvals`.
- `components/genius/workspace-context.jsx`: exposed `updateDiagnosticWorkflow` through the central workspace provider.
- `components/genius/sections/diagnostics.jsx`: Diagnostics now reads real workspace diagnostic categories when available, falls back to the existing static rows before workspace hydration, persists detail-panel status changes, and persists assignment to Michael Wong, Sarah Green, or Riva Nelson.
- `components/genius/sections/diagnostics.jsx`: fixed detail-panel close behavior and kept archive intentionally locked because archived diagnostics need a separate retention model.

Verified:

- Focused ESLint passed for the diagnostics route, evidence store, workspace engine, workspace provider, and Diagnostics UI.
- HTTP smoke passed on a temporary Next dev server and isolated temp workspace using `localhost`: signup `200`, demo reset `200`, diagnostics GET `200`, diagnostics PATCH `200`, follow-up GET `200`, updated diagnostic `spend-leakage`, workflow status `Closed`, owner `Michael Wong`, owner role `Procurement`, audit event count `1`, categories `7`.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 31 routes after the Diagnostics changes.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Diagnostics owner assignment is stored as workflow metadata only; it does not yet create tasks, notifications, SLA timers, or escalation reminders.
- Archive remains locked until retention/audit behavior is defined.
- Browser screenshot QA for Diagnostics is still recommended after the next UI-heavy diagnostics pass.

Next exact task: choose the next low-risk workflow slice; Support comments/attachments, connector request status transitions, or report schedule activation are the next likely candidates.

## R-07 Guest Local Workspace And Portable Export/Import Slice

Guest local workspace mode and portable workspace file transfer are implemented and verified for the current product cut.

Completed:

- `app/api/auth/guest/route.js`: added a local-only guest session endpoint that creates a signed `HttpOnly` app session without issuing Supabase Auth tokens.
- `lib/server/auth-session.js`: added guest workspace/session helpers and public session metadata that does not expose the synthetic guest email.
- `lib/server/evidence-store.js`: guest workspaces now use the local store even when Supabase env vars are configured; added portable workspace export/import helpers.
- `app/api/workspace/portable/route.js`: added capability-gated portable JSON export/import. Export omits `sessions`, invite token hashes, auth tokens, secrets, and member emails. Import preserves the current workspace members/sessions so a file cannot replace the active access boundary.
- `lib/server/authorization.js` and `lib/server/workspace-state.js`: public member DTOs now include `emailMasked` and hide raw member email by default.
- `components/genius/workspace-context.jsx`: exposed `exportWorkspace` and `importWorkspaceFile`.
- `app/login/page.jsx`: added `Continue as guest`, which opens a local workspace and routes into `/workspace`.
- `components/genius/sections/settings.jsx`: Settings now supports portable workspace JSON export/import and member management by stable member id instead of raw email.
- `components/genius/landing-page.jsx` and `app/api/workspace/route.js`: guest sessions display as local mode, and backend status reports `local` storage for `guest-*` workspaces.

Verified:

- Focused ESLint passed for the new guest/portable routes and all touched auth/workspace/UI files.
- Runtime smoke passed on a temporary Next dev server and isolated local data dir: guest create `200`, workspace read `200`, portable export `200`, portable import `200`, `session.isGuest=true`, backend storage `local`, exported schema `genius.workspace.portable.v1`, exported file had no `sessions`, exported member email was blank, and the imported session stayed guest.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes, including `/api/auth/guest` and `/api/workspace/portable`.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Portable import currently replaces workspace business data but intentionally preserves the current access boundary. If the product later needs cross-account ownership transfer, that should be a separate admin-reviewed migration flow.
- Portable export is privacy-first and redacts email-like fields. If customers need a regulated full-data export later, add a separate encrypted/admin-only export format with explicit consent.
- Guest workspaces are local to the running machine/environment. A user must export the JSON file before clearing local data or moving to another machine.

Next exact task: continue R-07 with connector request status transitions, report schedule activation, or support ticket comments/attachments.

## R-07 Connector Request Status Lifecycle Slice

Connector request backlog status transitions are implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-state.js`: connector requests now normalize `statusNote`, `updatedBy`, and bounded status event history.
- `lib/server/evidence-store.js`: added `updateConnectorRequestStatus` with request id validation, allowed status validation, event persistence, and `connector_request_status_updated` audit events.
- `app/api/connectors/route.js`: `PATCH /api/connectors` now preserves the existing connector filter flow and adds explicit `action: "update_request_status"` support gated by `manage_connectors`.
- `app/api/connectors/route.js`: connector request summaries no longer expose raw requester email through the connector API.
- `components/genius/workspace-context.jsx`: exposed `updateConnectorRequestStatus` through the central workspace provider.
- `components/genius/sections/connectors.jsx`: connector request backlog now shows recent requests, status metadata, requester role/department, status note, and Owner/Admin status action buttons.

Verified:

- Focused ESLint passed for the connector route, workspace provider, Connectors UI, evidence store, and workspace state.
- HTTP smoke passed on a temporary Next dev server and isolated local data dir: guest workspace create `200`, connector request create `200`, status `reviewing` `200`, status `planned` `200`, connector GET confirmed `planned`, two request events persisted, requester email was not exposed, and existing connector filter PATCH still persisted rules.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.

Residual risk:

- Connector status lifecycle is intentionally lightweight: it does not yet provision real third-party credentials, OAuth flows, secrets rotation, sync jobs, or deployment tickets.
- Request status changes are logged inside the workspace JSON payload. At higher scale this should move to normalized connector request/event tables.
- UI still uses the existing static connector detail object for the central connector detail panel; that should be separated from this lifecycle slice when active connector detail persistence is implemented.

Next exact task: continue R-07 with report schedule activation/pause or support ticket comments/attachments.

## R-07 Report Schedule Lifecycle Slice

Report schedule lifecycle controls are implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-state.js`: report schedules now normalize `statusNote`, `updatedBy`, and bounded status event history.
- `lib/server/evidence-store.js`: added `updateReportScheduleStatus` with schedule id validation, allowed lifecycle statuses, `nextRunAt` calculation for active schedules, status event persistence, and `report_schedule_status_updated` audit events.
- `app/api/reports/schedules/route.js`: added authenticated `PATCH` support gated by `export_data`; schedule summaries no longer expose raw owner email.
- `components/genius/workspace-context.jsx`: exposed `updateReportScheduleStatus` through the central workspace provider.
- `components/genius/sections/reports.jsx`: the latest schedule card now supports Activate, Pause, Resume, Archive, and Restore actions with status metadata and next-run visibility.

Verified:

- Focused ESLint passed for the schedule route, workspace provider, Reports UI, evidence store, and workspace state.
- HTTP smoke passed on a temporary Next dev server and isolated local data dir: guest workspace create `200`, schedule draft create `200`, activate `200` with `nextRunAt`, pause `200` with `nextRunAt` cleared, archive `200`, GET confirmed archived status, three schedule events persisted, three audit events persisted, and schedule owner email was not exposed.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Schedule lifecycle is a control-plane implementation only; no background job runner, email delivery, calendar integration, or board-portal publishing exists yet.
- `nextRunAt` is metadata calculated on activation/resume. Real delivery needs a durable scheduler and retry log.
- The Reports section still uses mostly static visual report content when generated workspace reports are unavailable.

Next exact task: continue R-07 with support ticket comments/attachments or another small workflow lifecycle slice.

## R-07 Support Ticket Conversation And Attachment Reference Slice

Support ticket comments and attachment references are implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-state.js`: support ticket events and attachment references now normalize into bounded, structured records.
- `lib/server/evidence-store.js`: added support ticket comment and attachment-reference mutations with requester/admin authorization, activity timestamps, bounded event history, and audit events.
- `app/api/support/tickets/route.js`: `PATCH /api/support/tickets` now supports `add_comment`, `add_attachment`, and existing status updates without changing the route contract.
- `app/api/support/tickets/route.js`: ticket summaries no longer expose raw requester email, event actor email, or attachment `addedBy` email.
- `components/genius/workspace-context.jsx`: exposed `addSupportTicketComment` and `addSupportTicketAttachment` through the central workspace provider.
- `components/genius/sections/support.jsx`: latest support ticket card now shows recent activity, attachment references, comment entry, and attachment-reference entry.

Verified:

- Focused ESLint passed for the support route, workspace provider, Support UI, evidence store, and workspace state.
- HTTP smoke passed on a temporary Next dev server and isolated local data dir: guest workspace create `200`, ticket create `200`, add comment `200`, add attachment reference `200`, resolve ticket `200`, GET confirmed resolved status, comment event persisted, attachment event persisted, one attachment reference persisted, support audit events persisted, and support API did not expose requester/event/attachment actor emails.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Attachment support is metadata/reference-only. Real binary upload still needs storage, content-type validation, malware scanning, file-size enforcement, and signed download URLs.
- Comments are stored as ticket events. A larger support product should add dedicated comment entities if threaded replies, internal notes, or rich editor history are required.
- Support notification delivery is not implemented yet; activity is persisted in workspace state only.

Next exact task: continue R-07 with another small workflow lifecycle slice or do focused browser QA on the touched Support panel.

## R-07 Notification Lifecycle Slice

Workspace notification lifecycle is implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-engine.js`: derived approval notifications now preserve `readAt` and `dismissedAt` across workspace rebuilds.
- `lib/server/evidence-store.js`: notification status updates now handle `queued`, `read`, and `dismissed` timestamps correctly, and bulk mark-read no longer restores dismissed notifications.
- `app/api/notifications/route.js`: notification reads now require a valid workspace session, updates are capability-gated by `update_notifications`, and mutation responses are `no-store`.
- `components/genius/workspace-context.jsx`: exposed `updateNotificationStatus` through the central workspace provider.
- `components/genius/app-shell.jsx`: the notification dropdown now uses real workspace notifications, unread badge counts, mark read/unread, dismiss, mark all read, and open-notification navigation.

Verified:

- Focused ESLint passed for the notification route, workspace provider, AppShell, evidence store, and workspace engine.
- HTTP smoke passed on a temporary Next dev server and isolated local data dir: guest workspace create `200`, demo reset `200`, notification GET returned 11 queued records, read transition persisted `readAt`, queued transition cleared `readAt`, dismiss transition persisted `dismissedAt`, bulk mark-read left dismissed records dismissed, all queued notifications became read, and four notification audit events persisted.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.
- `git diff --check` passed; CRLF warnings are informational.

Residual risk:

- Notifications are in-app state only. Push, email, digest delivery, and user-level notification preferences are still future work.
- The dropdown intentionally hides dismissed notifications. Restoring dismissed records needs a dedicated notification center or settings surface.
- `View all notifications` currently routes into Settings because a full notification center has not been created yet.

Next exact task: continue R-07 with focused browser QA for AppShell notifications or another small workflow lifecycle slice.

## R-07 AI Chat Persistence And Real Streaming Slice

AI Chat now uses the real workspace-aware chat endpoint and persists conversation history for the current product cut.

Completed:

- `lib/server/workspace-state.js`: added normalized `chatConversations` to the workspace model with bounded messages, status, pinning, timestamps, provider metadata, and safe defaults.
- `lib/server/evidence-store.js`: added chat conversation create, turn append, update/archive/pin, and delete mutations with audit events.
- `app/api/chat/route.js`: added authenticated `GET`, `PATCH`, and `DELETE` support for conversations; `POST` now creates a conversation when needed, streams Gemini/local-fallback text, and persists the completed user/assistant turn.
- `components/genius/workspace-context.jsx`: exposed `chatConversations`, `sendChatMessage`, `updateChatConversation`, and `deleteChatConversation` through the central provider.
- `components/genius/sections/ai-chat.jsx`: replaced fake timer-based chat output with real streaming from `/api/chat`, optimistic UI, abort support, persisted conversation selection, rename/archive/delete/pin handlers, and local markdown/json export.
- `components/genius/sections/workbench/workbench-sidebar.jsx`: replaced mock conversations with real workspace conversations and read-only workspace agent/report context.
- `components/genius/sections/workbench/workbench-canvas.jsx` and `workbench-composer.jsx`: wired real conversation title/update state, prompt suggestions, real send/stop behavior, real input character count, and removed default fake attached files.

Verified:

- Focused ESLint passed for the chat route, workspace provider, workspace state/store, and touched Workbench UI files.
- HTTP smoke passed on a temporary Next dev server and isolated local data dir with `GENIUS_FORCE_LOCAL_CHAT=1`: guest workspace create `200`, demo reset `200`, chat POST returned `local-fallback`, response length `1461`, conversation id returned, user/assistant messages persisted, assistant provider persisted, rename/pin/archive persisted, delete removed the conversation, and `chat_conversation_created`, `chat_turn_added`, `chat_conversation_updated`, and `chat_conversation_deleted` audit events persisted.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.
- Scoped `git diff --check` passed for all files touched in this slice; CRLF warnings are informational.

Residual risk:

- Full repository `git diff --check` currently reports pre-existing trailing whitespace in `components/genius/sections/approvals.jsx` and `components/genius/sections/settings.jsx`; those files were not part of this slice.
- Gemini streaming persistence saves the assistant turn after the stream completes. If the browser aborts early, the server may still finish and persist the completed turn depending on runtime cancellation behavior.
- Workbench context panel and some secondary header controls still contain visual/future-state content. They need the broader remaining button inventory pass.
- Chat file attachments are local UI chips only; real attachment-to-evidence linkage should route users through Data Intake or a dedicated upload mutation.

Next exact task: continue R-07 with either Workbench context-panel real data wiring/browser QA or move into the next functional section slice: Data Intake upload security, Excel Workspace persistence, or Agents run lifecycle hardening.

## R-07 Workbench Context Panel Real Data Slice

The AI Workbench context panel now reads real workspace state instead of mock data.

Completed:

- `components/genius/sections/workbench/workbench-context-panel.jsx`: replaced hardcoded workspace, source, agent, artifact, and activity data with derived views from `workspace`, `evidence`, `liveEvents`, `diagnostics`, `metrics`, `agentRuns`, `reports`, `chatConversations`, `connectors`, and `currentMember`.
- `components/genius/sections/workbench/workbench-context-panel.jsx`: added real empty states for missing sources, agents, evidence, artifacts, and audit activity.
- `components/genius/sections/workbench/workbench-context-panel.jsx`: wired panel actions to existing sections through `onNavigate` and refresh through `loadWorkspace`.
- `components/genius/sections/ai-chat.jsx`: passes workspace context, backend status, member context, section navigation, and refresh handlers into the mobile and desktop Workbench context panels.

Verified:

- Focused ESLint passed for `ai-chat.jsx`, `workbench-context-panel.jsx`, and the existing agent detail drawer.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.
- Runtime smoke passed on a temporary Next dev server and isolated local data dir: guest workspace create `200`, demo reset `200`, `/workspace` returned `200`, Next static assets were present, and workspace context input existed for evidence `3`, agents `4`, reports `4`, and audit events `2`.
- Scoped `git diff --check` passed for the touched Workbench context files and checkpoint doc; CRLF warnings are informational.

Residual risk:

- This was a data-wiring pass, not full visual browser QA. Pixel-level responsive validation for the Workbench panel still belongs to the broader UX pass.
- Agent drawer controls remain display-only because agent run lifecycle hardening is a separate workflow slice.
- Full repository `git diff --check` still has pre-existing trailing whitespace in unrelated files from earlier work.

Next exact task: continue with Agents run lifecycle hardening, Data Intake upload/security hardening, or Excel Workspace persistence.

## R-07 Agent Run Lifecycle Slice

Supervised agent runs now have a real lifecycle instead of display-only controls.

Completed:

- `lib/server/workspace-engine.js`: added supported agent run statuses, lifecycle event normalization, progress/status preservation across derived workspace rebuilds, and corrected active-agent metrics to count only `Ready` and `Running`.
- `lib/server/evidence-store.js`: added `updateAgentRunStatus` with validation, bounded notes, lifecycle timestamps, per-run event history, and audit events.
- `app/api/agents/run/route.js`: kept supervised refresh on `POST` and added authenticated/capability-gated `PATCH` for lifecycle updates with `Cache-Control: private, no-store`.
- `components/genius/workspace-context.jsx`: exposed `updateAgentRunStatus` through the central workspace provider.
- `components/genius/sections/workbench/drawers/agent-detail-drawer.jsx`: replaced decorative controls with real Run/Pause/Complete/Fail lifecycle actions, permission/busy disabled states, status notes, and event-backed logs.
- `components/genius/sections/workbench/workbench-context-panel.jsx` and `components/genius/sections/ai-chat.jsx`: wired real agent lifecycle controls into the AI Workbench context panel on desktop and mobile.
- `components/genius/sections/command-center.jsx` and `components/genius/sections/command-center/live-agent-operations.jsx`: moved Live Agent Operations from mock-only data to real `workspace.agentRuns`, with mock fallback only when no workspace runs exist and disabled lifecycle controls for fallback rows.

Verified:

- Focused ESLint passed for the agent route, workspace provider, workspace engine/store, AI Chat, Command Center, Live Agent Operations, Workbench context panel, and agent drawer.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.
- Production-bundle API smoke passed without a dev server: guest session created, investor demo loaded with evidence `3`, first run moved `Ready -> Running -> Paused -> Completed`, refresh via `POST /api/agents/run` preserved `Completed`, event count was `3`, note was `Smoke completed`, and `3` `agent_run_status_updated` audit events persisted.
- Scoped `git diff --check` passed for all files touched in this slice; CRLF warnings are informational.

Residual risk:

- Direct HTTP smoke against a live dev server could not be completed because the shell session did not keep `next dev` reachable on `127.0.0.1` even after logging `Ready`; production-bundle route smoke covered the API lifecycle contract instead.
- Agent lifecycle changes status and audit history only. It still does not execute external actions, by design.
- Command Center KPI cards still contain some static/mock values outside Live Agent Operations; that belongs to the later dashboard data-realism pass.
- Full repository `git diff --check` still reports pre-existing trailing whitespace in `components/genius/sections/approvals.jsx` and `components/genius/sections/settings.jsx`.

Next exact task: continue R-07 with Data Intake upload/security hardening or Excel Workspace persistence, then return to a full UX/button inventory pass.

## R-07 Data Intake Upload And URL Security Slice

Data Intake now enforces a shared upload policy on the client and server, and URL analysis no longer follows redirects without revalidating the target.

Completed:

- `lib/evidence-upload-policy.js`: added the shared evidence upload contract: supported extensions, browser `accept`, max `8` files, max `20 MB` per file, max `50 MB` per batch, and common validation/formatting helpers.
- `lib/server/evidence-analysis.js`: reused the shared policy, added upload batch validation, rejected empty files, and added practical file signature checks for PDF, PNG, JPG/JPEG, WEBP, DOCX/XLSX ZIP containers, legacy DOC/XLS OLE files, and text/CSV binary-null signatures.
- `app/api/evidence/route.js`: added server-side batch policy enforcement before analysis, real actor audit attribution for uploads, `no-store` responses, and returned the active upload policy to the client.
- `app/api/evidence/review/route.js` and `app/api/evidence/[id]/route.js`: added `no-store` responses for review/delete success and error paths.
- `app/api/sources/url/route.js`: replaced `redirect: "follow"` with manual redirect handling, revalidated every redirect hop with DNS/private-IP checks, blocked embedded credentials and private/reserved/link-local/documentation ranges, capped redirects at `5`, capped response body at `2 MB`, and kept URL evidence in the same review-first pipeline.
- `components/genius/sections/data-intake.jsx`: added client-side preflight using the same policy, realistic supported format chips, file input `accept`, and visible batch/file limits in the upload panel.

Verified:

- Focused ESLint passed for the upload policy, evidence analysis/store, evidence routes, URL route, and Data Intake UI.
- Full `npm.cmd run lint` passed.
- `npm.cmd run build` passed on Next.js 16.2.4 and generated all 33 routes.
- Production-bundle API smoke passed without a dev server: guest session created, valid CSV upload returned `200` with one evidence record and policy max files `8`, fake PDF signature returned `415`, nine-file batch returned `413`, and private URL `http://127.0.0.1/admin` returned `400`.
- Scoped `git diff --check` passed for all files touched in this slice; CRLF warnings are informational.

Residual risk:

- MIME/signature validation is practical, not a malware scanner. Production still needs antivirus/sandbox scanning for uploaded binaries.
- DOCX/XLSX validation currently verifies ZIP container signatures but does not inspect compressed entries, decompression ratios, macros, or sheet/row limits. That remains part of the deeper parser hardening work.
- URL defense revalidates DNS before each request and every redirect hop, but cannot fully pin the resolved IP for HTTPS without a lower-level fetch client. This is acceptable for current Next runtime hardening but should be revisited for production WAF/network egress controls.
- Full repository `git diff --check` still reports pre-existing trailing whitespace in `components/genius/sections/approvals.jsx` and `components/genius/sections/settings.jsx`.

Next exact task: continue with Excel Workspace persistence or R-08 findings/actions/reports derivation hardening, then run a full UX/button inventory pass.

## R-07 Excel Workspace View Persistence Slice

Excel Workspace saved views are implemented and verified for the current product cut.

Completed:

- `lib/server/workspace-state.js`: added normalized `excelWorkspaceViews` to the stable workspace shape with workbook/sheet names, tabs, active tab, filters, search query, page size, selected rows, notes, metrics, saved-by metadata, and timestamps.
- `lib/server/evidence-store.js`: added `saveExcelWorkspaceView` with bounded input normalization, create/update behavior, workspace persistence, and `excel_workspace_view_saved` audit events.
- `app/api/excel-workspace/route.js`: added authenticated `GET` and capability-gated `POST` endpoints for reading and saving Excel workspace views.
- `components/genius/workspace-context.jsx`: exposed `excelWorkspaceViews` and `saveExcelWorkspaceView` through the central workspace provider.
- `components/genius/sections/excel-workspace.jsx`: added saved-view restore, `Save view`, persisted workbook notes, selected-row persistence, saved timestamp display, and kept formula/XLSX write-back work out of scope.
- `app/api/readiness/route.js`: Excel now reports as working when at least one workbook view is saved, while formula execution and XLSX write-back remain explicitly locked/future.

Verified:

- Focused ESLint passed for the Excel route, readiness route, workspace provider, Excel UI, workspace state, and evidence store.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes, including `/api/excel-workspace`.
- Runtime smoke passed on a temporary production Next server and isolated local data dir: guest workspace `200`, Excel view save `200`, Excel view GET `200`, saved view count `1`, restored active tab `2`, rows per page `25`, selected rows `2`, readiness Excel views `1`, readiness Excel state `ready`, and one `excel_workspace_view_saved` audit event persisted.
- Scoped `git diff --check` passed for all files touched in this slice; CRLF warnings are informational.

Residual risk:

- Excel persistence currently saves the workspace view state and review note, not a real spreadsheet engine.
- Formula execution, XLSX write-back, cell-level comments, and binary workbook storage remain locked/future and should reuse the existing evidence/file-storage pipeline when implemented.
- The UI still renders static demo workbook rows from `genius-data`; connecting parsed uploaded spreadsheet rows into the table belongs to the next data-realism pass.

Next exact task: continue with R-08 findings/actions/reports derivation hardening or parsed spreadsheet rows into Excel Workspace, then run a full UX/button inventory pass.

## R-07 Excel Workspace Data-Backed Rows Slice

Excel Workspace now uses real workspace rows when they exist, with demo workbook rows kept only as fallback.

Completed:

- `components/genius/sections/excel-workspace.jsx`: maps workspace `spendRows`, `invoices`, and `contracts` into workbook rows, including amount, source, category, anomaly, confidence, owner, suggested fix, and approval state.
- `components/genius/sections/excel-workspace.jsx`: uses workspace findings/actions to enrich Excel rows, AI analysis summary, proof trail rows, spend-by-category chart, KPI cards, saved timestamps, and workbook metadata.
- `components/genius/sections/excel-workspace.jsx`: preserves saved-view restore/save, export, filters, pagination, selected rows, notes, and static demo fallback for empty workspaces.
- `app/api/readiness/route.js`: counts workspace-backed Excel rows and marks Excel as working/ready when spend, invoice, contract rows, or saved Excel views exist.

Verified:

- Focused ESLint passed for `components/genius/sections/excel-workspace.jsx` and `app/api/readiness/route.js`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Runtime smoke passed on a temporary production Next server and isolated local data dir: guest session `200`, investor demo reset `200`, workspace `200`, readiness `200`, workspace-backed Excel rows `10`, readiness Excel rows `10`, and Excel section `working/ready`.

Residual risk:

- Excel Workspace now reflects normalized business entities, not raw XLSX cell storage.
- Formula execution, XLSX write-back, cell-level comments, and binary workbook persistence remain locked/future.
- Visual browser QA for the full Excel section still belongs to the broader UX/button inventory pass.

Next exact task: continue with R-08 findings/actions/reports derivation hardening or row-level spreadsheet parser/export hardening, then run a full UX/button inventory pass.

## R-08 Reports Dynamic Detail And Export Slice

Reports now render workspace-derived report details instead of showing a real report list beside static seed detail content.

Completed:

- `components/genius/sections/reports.jsx`: added workspace report view-model builders for KPI cards, report detail header, summary stats, top findings, risk exposure, approvals, proof coverage, board status, key risks, and report metadata.
- `components/genius/sections/reports.jsx`: report library counts, filtered counts, status badges, detail tabs/counts, right summary panel, and export actions now follow current workspace reports when available.
- `components/genius/sections/reports.jsx`: kept `genius-data` report content as fallback for empty workspaces, so the section still renders before evidence/demo data is loaded.
- `lib/server/report-engine.js`: CSV report export now includes report title/status metadata rows before section data, making downloaded report files self-describing.

Verified:

- Focused ESLint passed for `components/genius/sections/reports.jsx` and `lib/server/report-engine.js`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Runtime smoke passed on a temporary production Next server and isolated local data dir: guest session, investor demo reset, approval decision `Approved`, decision history count `1`, `/api/reports` `200` with `4` reports, `/api/reports/[id]` `200` with linked findings/actions/proof trail, CSV export `200`, and CSV contained the report title metadata.

Residual risk:

- Reports UI still does not fetch a separate `/api/reports/[id]` detail payload on click; it derives display data from `workspace.reports`, which is stable for the current product cut.
- Board portal publish, duplicate report, and external sharing remain locked because they require external workspace/sharing infrastructure.
- Visual browser QA for the full Reports section still belongs to the broader UX/button inventory pass.

Next exact task: continue with Approvals/Savings proof-trail navigation hardening or row-level spreadsheet parser/export hardening, then run a full UX/button inventory pass.

## R-08 Approvals And Savings Proof Navigation Slice

Proof-trail and evidence actions now navigate to real product sections instead of staying decorative.

Completed:

- `components/genius/sections/approvals.jsx`: backend approval rows now preserve `evidenceId`, `evidenceName`, `findingId`, proof trail id, and rationale in the UI row model.
- `components/genius/sections/approvals.jsx`: evidence count is now actionable and routes users to Data Intake when an evidence record is linked.
- `components/genius/sections/approvals.jsx`: proof trail actions now route users to Reports proof coverage with a concrete toast message instead of only showing a placeholder toast.
- `components/genius/sections/savings-radar.jsx`: savings opportunities now keep linked `evidenceId`, and `View proof trail` routes to Approvals, Data Intake, or Reports depending on available context.

Verified:

- Focused ESLint passed for `components/genius/sections/approvals.jsx` and `components/genius/sections/savings-radar.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.

Residual risk:

- Navigation is section-level, not deep-linking to a specific row/card inside the destination section yet.
- A future UX pass should add shared selected entity context so Reports/Data Intake can auto-focus the exact proof trail or evidence record after navigation.

Next exact task: continue with row-level spreadsheet parser/export hardening or build selected-entity deep-link context across Savings, Approvals, Reports, and Data Intake.

## R-08 Selected Entity Deep-Link Context Slice

Workspace navigation now carries selected entity context between key product sections, so users land on the relevant evidence, finding, approval, or report instead of manually searching after navigation.

Completed:

- `components/genius/app-shell.jsx`: added a shared `focusContext` navigation contract through `onNavigate(section, context)` while preserving all existing string-only navigation calls.
- `components/genius/app-shell.jsx`: notification opens now pass `actionId` / `findingId` into the destination section.
- `components/genius/sections/data-intake.jsx`: accepts `focusContext.evidenceId`, selects the linked evidence, scrolls the review panel into view, and visually highlights the selected source row.
- `components/genius/sections/approvals.jsx`: accepts `actionId`, `findingId`, or `evidenceId`, focuses the matching approval row, and forwards evidence/proof/report context when opening Data Intake or Reports.
- `components/genius/sections/savings-radar.jsx`: accepts linked finding/action/evidence context, focuses the matching savings opportunity, and forwards context to Approvals, Data Intake, or Reports from proof/facts/action buttons.
- `components/genius/sections/reports.jsx`: accepts report/proof/action/finding/evidence context, opens the matching report and tab, and replaced the locked detail placeholder with workspace-derived detail cards for Metrics, Proof Chain, and Linked Evidence.
- `components/genius/sections/data-intake.jsx`: review actions now send confirmed evidence to Approvals or Reports with selected evidence context.

Verified:

- Focused ESLint passed for `app-shell.jsx`, `data-intake.jsx`, `approvals.jsx`, `savings-radar.jsx`, and `reports.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.

Residual risk:

- Focus is still in-memory UI state, not URL-addressable deep links. Browser refresh will clear the selected entity context.
- Reports selects matching report/tab from `workspace.reports`; it does not yet fetch `/api/reports/[id]` detail on click.
- Pixel/browser QA is still pending for the focused states across all supported viewport scales.

Next exact task: continue with row-level spreadsheet parser/export hardening or add URL-addressable workspace entity routes/query params for durable deep links.

## R-08 Row-Level Spreadsheet Parser And Export Hardening Slice

CSV/XLSX uploads now produce bounded row-level workspace data instead of one aggregate spend row when real spreadsheet rows can be parsed.

Completed:

- `lib/server/evidence-analysis.js`: added bounded spreadsheet parsing for CSV and minimal OOXML XLSX worksheets, capped at 200 rows, 40 columns, 2 MB per XML entry, and 6 MB total inflated XML.
- `lib/server/evidence-analysis.js`: local extraction now stores `spreadsheet_rows`, `spreadsheet_row_count`, `spreadsheet_amount_total`, and `spreadsheet_parse_status`, with UTF-8 BOM-safe CSV headers and sanitized row fields.
- `lib/server/workspace-engine.js`: reviewed CSV/XLSX evidence with parsed rows now creates one spend row per spreadsheet row, creates invoice entities from row invoice numbers, and upserts vendors from row-level data.
- `components/genius/sections/excel-workspace.jsx`: Excel Workspace rows now preserve source spreadsheet row numbers, row descriptions, and parsed categories.
- `app/api/evidence/export/route.js`: evidence export now includes spreadsheet row count, parsed amount total, and parse status in JSON and CSV exports.

Verified:

- Focused ESLint passed for `lib/server/evidence-analysis.js`, `lib/server/workspace-engine.js`, `app/api/evidence/export/route.js`, and `components/genius/sections/excel-workspace.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Runtime CSV upload/review/workspace smoke passed on a temporary production Next server and isolated local data dir: parsed rows `3`, parsed amount total `5400`, parse status `parsed`, workspace spend rows `3`, invoices `3`, vendors `2`, and first source `spend_export.csv row 2`.
- Runtime combined CSV/XLSX/export smoke passed on a temporary production Next server and isolated local data dir: CSV rows `3`, XLSX rows `3`, both parsed amount total `5400`, both parse status `parsed`, workspace spend rows `6`, invoices `6`, vendors `2`, evidence export count `2`, and CSV export contained `spreadsheetRows`, `spreadsheetAmountTotal`, and `spreadsheetParseStatus`.

Residual risk:

- XLSX parsing is intentionally minimal and read-only. It parses shared strings and the first worksheet XML but does not execute formulas, evaluate styles, or write back binary workbooks.
- Legacy `.xls` files remain accepted as Excel evidence but do not get row-level parsing unless converted to `.xlsx` or CSV.
- Formula execution, XLSX write-back, cell-level comments, and binary workbook persistence remain locked/future and should reuse the existing evidence/file-storage safety pipeline.

Next exact task: continue with the full UX/button inventory and remaining production workflow wiring, then run the security/reliability pass before the 2026-07-25 production candidate target.

## R-09 Command Center UX/Button Inventory Slice

Command Center controls now route to real product sections or show an intentional locked state instead of acting as decorative controls.

Completed:

- `components/genius/sections/command-center.jsx`: added workspace-backed decision and attention row models from current `actions` and `findings`, with seed data kept only as fallback for empty workspaces.
- `components/genius/sections/command-center.jsx`: KPI, attention, decision, risk exposure, value captured, system health, evidence coverage, and activity interactions now use `onNavigate(section, context)`.
- `components/genius/sections/command-center/decision-queue.jsx`: queue tabs now filter the visible rows and show an empty state when a tab has no matching decisions.
- `components/genius/sections/command-center/requires-attention.jsx`: row review and view-all controls now navigate to Approvals, Savings, or Diagnostics with selected context.
- `components/genius/sections/command-center/executive-kpi-row.jsx`: KPI cards are real buttons and route to Diagnostics, Savings, Approvals, Chat, or Data Intake based on metric type.
- `components/genius/sections/command-center/risk-exposure.jsx`, `value-captured.jsx`, `system-health.jsx`, `evidence-coverage.jsx`, and `activity-stream.jsx`: drill-down controls are now real buttons; activity filtering is intentionally locked with a truthful toast until audit stream filters are persistent.

Verified:

- Focused ESLint passed for `components/genius/sections/command-center.jsx` and all files under `components/genius/sections/command-center/`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.

Residual risk:

- This slice verifies code and build, not pixel-level browser QA.
- Command Center focus context is still in-memory through `onNavigate`; durable URL query params remain a future deep-link phase.
- Some cards still use fallback seed metrics when workspace has no live data, which is intentional for demo readiness.

Next exact task: continue Phase 2 UX/button inventory with one section at a time, likely Data Intake or Excel Workspace because they are central to upload/review workflows.

## R-09 Data Intake UX/Button Inventory Slice

Data Intake controls now better match the actual upload/review workflow: visible selection controls are real, batch confirmation works through the existing review API, and proof/navigation buttons route to real product sections or clearly locked states.

Completed:

- `components/genius/sections/data-intake.jsx`: added real source-row selection state plus visible-page select/clear behavior for the uploaded sources table.
- `components/genius/sections/data-intake.jsx`: `Confirm Selected`, `Send to Approvals`, and `Create Proof Trail` now operate on selected rows when present, falling back to the currently focused evidence only when nothing is selected.
- `components/genius/sections/data-intake.jsx`: batch confirmation uses the existing `reviewEvidence({ ids, fieldsById })` path, so no backend surface was added.
- `components/genius/sections/data-intake.jsx`: proof-trail links now open Reports proof context for confirmed evidence and route unconfirmed evidence back to review with a truthful toast.
- `components/genius/sections/data-intake.jsx`: source-type focus context from Command Center can filter Data Intake, and the upload dropzone now has keyboard-accessible button semantics.
- `components/genius/sections/data-intake.jsx`: URL supported-category chips now focus the URL input with a clear hint instead of being decorative cursor-only text.
- `components/genius/sections/data-intake.jsx`: remaining locked controls still use explicit locked toasts for production-only page preview, routing options, archived browsing, date range, columns, field editing, and custom extraction fields.

Verified:

- Focused ESLint passed for `components/genius/sections/data-intake.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Trailing whitespace check passed for `components/genius/sections/data-intake.jsx`.

Residual risk:

- This slice did not run browser/pixel QA.
- Data Intake batch proof navigation passes the first selected evidence as focus context while also passing the selected ID list; downstream sections currently focus one evidence at a time.
- Durable URL query params for Data Intake filters/focus remain part of the later deep-link phase.

Follow-up completed below: Excel Workspace UX/Button Inventory Slice.

## R-09 Excel Workspace UX/Button Inventory Slice

Excel Workspace controls now better match the real workbook workflow: row selection is page-safe, CSV export is explicit, saved views remain persistent, and spreadsheet-only tools are clearly locked instead of behaving like decorative dropdowns.

Completed:

- `components/genius/sections/excel-workspace.jsx`: current-page select now only selects or clears visible rows, while preserving selections from other pages for large imported datasets.
- `components/genius/sections/excel-workspace.jsx`: row checkboxes now have their own accessible selection handlers and no longer depend on row-click side effects.
- `components/genius/sections/excel-workspace.jsx`: `Analyze` no longer navigates to the nonexistent `agents` section; it opens AI Chat with selected spreadsheet row context.
- `components/genius/sections/excel-workspace.jsx`: workbook/sheet selectors, column visibility, and row-lineage expansion use explicit locked toasts until persistent spreadsheet tooling is implemented.
- `components/genius/sections/excel-workspace.jsx`: CSV export is labeled as `Export CSV`, proof-trail links forward Data Intake focus context when a real evidence id exists, and pagination uses the real computed final page instead of a static demo page count.
- `components/genius/sections/excel-workspace.jsx`: top status pills and footer refresh are real buttons with clearer navigation or refresh behavior.

Verified:

- Focused ESLint passed for `components/genius/sections/excel-workspace.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes after rerunning with network access for Google Font fetches.

Residual risk:

- This slice did not run browser/pixel QA.
- Excel Workspace still does not implement XLSX write-back, formula execution, column visibility persistence, cell comments, or row-lineage expansion; those remain intentionally locked production features.
- AI Chat currently receives selected row ids as focus context, but it does not yet hydrate those row ids into a prefilled prompt or attached table preview.

Follow-up completed below: Approvals UX/Button Inventory Slice.

## R-09 Approvals UX/Button Inventory Slice

Approvals now has a more complete decision workflow surface: queue tabs filter or sort truthfully, row selection supports useful bulk actions, detail tabs are no longer blank, and visible controls either navigate to real sections or expose a locked production-only state.

Completed:

- `components/genius/sections/approvals.jsx`: queue tabs now use explicit ids; `Due Soon`, `Mine`, `By Agent`, and `By Impact` no longer rely on fragile label splitting.
- `components/genius/sections/approvals.jsx`: sort dropdown now changes real ordering by due date, impact, agent, or AI confidence instead of only showing a toast.
- `components/genius/sections/approvals.jsx`: page select now only selects or clears visible approvals while preserving selected approvals from other pages.
- `components/genius/sections/approvals.jsx`: selected approvals now show a bulk action bar with `Approve selected`, `Request evidence`, and `Clear`; bulk decisions reuse the existing `updateAction` lifecycle and server audit path.
- `components/genius/sections/approvals.jsx`: detail-panel tabs now render lightweight Evidence, Impact, Timeline, and Related views instead of blank content.
- `components/genius/sections/approvals.jsx`: evidence, proof, confidence, rationale, timeline, and related links now navigate to Data Intake, Reports, Diagnostics, Savings, or AI Chat with focus context where available.
- `components/genius/sections/approvals.jsx`: fullscreen, layout switching, and rich-text note formatting use explicit locked toasts until production approval tooling is implemented.

Verified:

- Focused ESLint passed for `components/genius/sections/approvals.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.

Residual risk:

- Browser/pixel QA still needs to be run for the highest-risk touched workflow.
- Bulk decisions call the existing action update path sequentially; this keeps audit behavior safe but is not optimized for very large approval batches.
- Detail related views pass focus context to adjacent sections, but durable URL query params remain a later deep-link phase.

Follow-up completed below: Reports UX/Button Inventory Slice.

## R-09 Reports UX/Button Inventory Slice

Reports now has a more complete report workflow surface: KPI cards, report library rows, report tabs, findings, approvals, risk summaries, export actions, schedule controls, and footer refresh are real controls tied to workspace data, adjacent-section navigation, or explicit locked production-only states.

Completed:

- `components/genius/sections/reports.jsx`: report KPI cards are real buttons and route to Proof Chain, Approvals, or locked publishing behavior based on metric intent.
- `components/genius/sections/reports.jsx`: header status pills now navigate to Settings, Connectors, Diagnostics, or refresh the workspace instead of behaving like decorative chips.
- `components/genius/sections/reports.jsx`: report library rows, search clearing, tabs, findings, approval cards, risk categories, and summary links now use explicit button semantics and pass focus context to adjacent sections.
- `components/genius/sections/reports.jsx`: export actions now call the existing report export pipeline for JSON, CSV, and Markdown and are disabled when export permission/data is unavailable.
- `components/genius/sections/reports.jsx`: Report ID copy, share link, schedule draft, schedule status actions, and footer refresh are now real controls with guarded loading/permission states.
- `components/genius/sections/reports.jsx`: remaining unavailable report features such as board portal publishing, report duplication, and custom report builder still show explicit locked-state feedback.

Verified:

- Focused ESLint passed for `components/genius/sections/reports.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- `git diff --check` and trailing whitespace check passed for `components/genius/sections/reports.jsx` and `docs/CURRENT_CHECKPOINT.md`.

Residual risk:

- Browser/pixel QA still needs to be run for the Reports view, especially the dense right sidebar and schedule form at 100% browser zoom.
- Report navigation focus context is still in-memory through `onNavigate`; durable URL query params remain a later deep-link phase.

Follow-up completed below: Connectors UX/Button Inventory Slice.

## R-09 Connectors UX/Button Inventory Slice

Connectors now has a more complete workflow surface: connector catalog search is real, KPI/header controls route to the right product areas, Business Live test/clear/filter actions use the existing workspace APIs, and unavailable connector-management features show explicit locked states.

Completed:

- `components/genius/sections/connectors.jsx`: KPI cards are real buttons and route to Event Stream, Diagnostics, Data Intake, Approvals, or Schema Mapping based on metric intent.
- `components/genius/sections/connectors.jsx`: header status pills are real buttons for Settings, Diagnostics, and workspace refresh instead of decorative click targets.
- `components/genius/sections/connectors.jsx`: connector catalog search now filters visible connector groups and supports clear search.
- `components/genius/sections/connectors.jsx`: file/finance/url connector rows navigate into Data Intake with connector focus context; unsupported native sync connectors show intentional locked feedback.
- `components/genius/sections/connectors.jsx`: setup checklist actions now copy the live-events endpoint, open schema/event tabs, or send the existing Business Live test event.
- `components/genius/sections/connectors.jsx`: schema mapping validation checks required mappings, custom mapping/settings remain locked, and Event Stream uses workspace live events when available.
- `components/genius/sections/connectors.jsx`: filter toggles, filter save, connector request backlog actions, health metric cards, retry queue rows, webhook secret copy, test event, and clear live events now use real button semantics and guarded permission/loading states.

Verified:

- Focused ESLint passed for `components/genius/sections/connectors.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- `git diff --check` and trailing whitespace check passed for `components/genius/sections/connectors.jsx` and `docs/CURRENT_CHECKPOINT.md`.

Residual risk:

- Browser/pixel QA still needs to be run for the dense Connectors screen, especially catalog search, request backlog, filters tab, and the right sidebar.
- Connector detail content is still Business Live centered; native CRM/Sheets/commerce credential flows remain intentionally locked until production credential handling exists.

Follow-up completed below: Settings UX/Button Inventory Slice.

## R-09 Settings UX/Button Inventory Slice

Settings now has a more complete workflow surface: Account controls route to real settings areas or explicit locked states, Workspace exposes portable import/export/reset controls, Auth & Login manages workspace members through the existing API, and Security & Data shows local policy controls plus an audit preview.

Completed:

- `components/genius/sections/settings.jsx`: KPI cards, header status pills, sidebar nav, activity pagination, recent sign-in links, security report links, help links, and footer refresh now use explicit button semantics.
- `components/genius/sections/settings.jsx`: Account actions now route to Auth, Notifications, Workspace, Support, or an explicit locked-state message instead of decorative toasts.
- `components/genius/sections/settings.jsx`: Workspace tab now shows workspace id, storage backend, current role, member count, refresh, portable export/import, and guarded delete-data actions.
- `components/genius/sections/settings.jsx`: Auth & Login tab now shows current session details, real workspace member role updates, member disable actions, and invite-link creation/copy through the existing members API.
- `components/genius/sections/settings.jsx`: Security & Data tab now shows local policy toggles and a paginated audit-log preview with workspace export access guarded by role permissions.
- `components/genius/sections/settings.jsx`: Remaining external-account features such as password, MFA provider management, linked accounts, trusted devices, and API token manager are intentionally locked until production auth/provider integrations exist.

Verified:

- Focused ESLint passed for `components/genius/sections/settings.jsx`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- `git diff --check` and trailing whitespace check passed for `components/genius/sections/settings.jsx` and `docs/CURRENT_CHECKPOINT.md`.

Residual risk:

- Browser/pixel QA has now been run for the main Reports, Connectors, and Settings paths at 1440x900. Additional responsive sweeps at 1920x1080, 1536px desktop, and browser zoom levels remain a later UX hardening pass.
- Security toggle state is local UI state in this slice; server-side role/capability checks remain the authoritative security layer.

Follow-up completed below: Reports / Connectors / Settings Focused Browser QA.

## R-09 Focused Browser QA for Reports, Connectors, and Settings

Focused browser QA was completed for the latest UX/button inventory slices. The smoke path uses the real login page, guest workspace creation, the workspace shell, mobile-overlay navigation at 1440px, and visible button selectors for the target sections.

Completed:

- `app/layout.js`: added the official Next.js 16 `data-scroll-behavior="smooth"` attribute on `<html>` because the project intentionally sets global `scroll-behavior: smooth`.
- `app/login/page.jsx`: replaced the remote `https://grainy-gradients.vercel.app/noise.svg` login background texture with an inline data-SVG texture so login no longer emits a 404 for an external asset.
- Browser QA verified guest login flow, `/workspace`, Reports, Connectors, and Settings at `1440x900` using system Chrome through Playwright.
- Browser QA verified Settings tab switching for Account, Workspace, Auth & Login, and Security & Data.
- Screenshots were saved under `qa-artifacts/` for the checked views.

Verified:

- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Final browser smoke passed with no console warnings, no console errors, no 404 responses, no request failures, and no Next.js error overlay.
- Final browser smoke results: Reports rendered with `h1=Reports`, Connectors rendered with `h1=Connectors`, Settings rendered with `h1=Workspace Settings`.

Residual risk:

- This was a focused desktop smoke at `1440x900`; it was not a full responsive matrix across 80-150% browser zoom.
- The workspace left navigation is still hidden behind the overlay below the `2xl` breakpoint, including 1440px. It works correctly, but a later UX pass should decide whether 1440px desktop should show the persistent sidebar.
- `qa-artifacts/` contains generated screenshots for local review and should not be committed unless the team wants to preserve QA evidence in the repository.

Next exact task: continue the next UX/button inventory section or begin the responsive/zoom hardening pass if design is now stable.

## R-10 Investor Critical Upload Loop Hardening

Investor-critical CSV upload and workspace propagation were hardened. CSV/XLSX files that already parse into safe row-level spreadsheet data now use the bounded local parser instead of waiting for Gemini, which removes the main demo blocker where Data Intake could sit in upload/analyze state for too long.

Completed:

- `lib/server/evidence-analysis.js`: added a local-first spreadsheet extraction path for CSV/XLSX when `spreadsheet_rows` are parsed successfully.
- `lib/server/evidence-analysis.js`: local spreadsheet uploads now return provider metadata as `provider=local`, `providerStatus=ready`, and a parser model name, so workspace quality checks do not treat successful local parsing as an AI-provider outage.
- `components/genius/sections/diagnostics.jsx`: fixed duplicate React keys in the Diagnostics detail top-driver list, removing a dev overlay during real workspace-derived data rendering.
- `components/genius/sections/savings-radar.jsx`: fixed the detail panel runtime crash by rendering the existing `detailNarrative` value instead of an undefined `narrative` variable.

Verified:

- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Browser QA verified `/login -> Continue as guest -> /workspace -> Data Intake -> CSV upload -> Confirm Selected -> Excel Workspace -> Diagnostics -> Savings Radar -> Approvals -> Reports` at `1920x1080`.
- Final CSV upload smoke result: upload `200` in `136ms`, review `200` in `323ms`, provider `local/ready`, `4` parsed spreadsheet rows.
- Final workspace result after confirm: `1` confirmed evidence item, `3` findings, `3` actions, `4` reports, `4` Excel workspace rows.
- Final section smoke result: Excel Workspace, Diagnostics, Savings Radar, Approvals, and Reports rendered with no console warnings, no console errors, no page errors, no request failures, and no Next.js overlay.
- Screenshots were saved under `qa-artifacts/investor-critical-loop/`.

Residual risk:

- PDF/image/DOC extraction can still depend on Gemini and provider/network latency; CSV/XLSX are now demo-safe through the local parser.
- This was an investor-critical desktop smoke at `1920x1080`, not the full 80-150% browser zoom matrix.
- `qa-artifacts/` and `.codex-dev-server*.log` files are local QA evidence and should stay out of commits unless the team explicitly wants them versioned.
- Production security still needs a final pass: Supabase RLS, request workspace isolation, session refresh/revocation, auth UI privacy, and API rate limiting.

Next exact task: continue investor-ready hardening with a focused pass over AI Chat, Reports export/download flows, portable workspace import/export, and security/readiness checks before the final demo script.

## R-11 Connected Flows and Export UX Hardening

AI Chat, Reports exports, portable workspace export/import, and readiness endpoints were checked as connected product flows rather than static screens. The main issue found was that the shared export helper navigated the whole workspace tab to the export endpoint instead of starting a file download in-place.

Completed:

- `components/genius/workspace-context.jsx`: changed the shared `downloadUrl()` helper from `window.location.assign()` to a hidden same-origin download link, so report/evidence/audit/workspace exports no longer navigate away from `/workspace`.
- Verified AI Chat API flow after reviewed evidence: chat returns a provider response, persists a conversation, supports PATCH rename/pin, and returns saved conversations from `GET /api/chat`.
- Verified Reports export APIs for JSON, CSV, and Markdown using a workspace-generated report.
- Verified portable workspace export/import APIs; exported JSON did not include session/password/token-like secrets in the smoke check.
- Verified readiness JSON and Markdown endpoints after confirmed evidence.
- Verified UI buttons for AI Chat send, Reports JSON/CSV/Markdown downloads, and Settings portable workspace export with screenshots and downloaded files under `qa-artifacts/ui-button-bindings/`.

Verified:

- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Connected-flow smoke result after CSV upload and confirm: `1` confirmed evidence, `3` findings, `3` actions, `4` reports.
- Chat smoke result: `POST /api/chat` returned `200`, provider response persisted as a saved conversation, and PATCH update returned `200`.
- Reports export smoke result: `weekly-leak-summary.json`, `weekly-leak-summary.csv`, and `weekly-leak-summary.md` downloaded through UI export buttons.
- Settings portable export smoke result: workspace JSON downloaded through the Workspace tab export button and stayed on `/workspace`.
- Readiness smoke result: score `100`, status `investor_ready`, Markdown export returned an attachment.

Residual risk:

- The UI export test requires precise selectors because the report list also contains compact `JSON / CSV / MD` chips; product behavior is correct, but future tests should click the sidebar export buttons by their descriptions.
- AI Chat can still stream for a few seconds after the response starts; demo scripts should wait for the send button to return from Stop to Send before moving to another section.
- Full security hardening remains: Supabase RLS, strict workspace isolation audit, session refresh/revocation, rate limiting, and auth UI privacy review.

Next exact task: continue with security/readiness hardening and a final investor demo walkthrough script that lists exactly which buttons to click and what data each section should show.

## R-12 Mutation Security Guard and Investor Readiness Smoke

All workspace mutation APIs now share a lightweight server-side security guard before parsing request bodies or touching workspace state. The goal was to reduce demo and production risk from cross-origin browser mutations and abusive repeat calls without changing the existing workspace/session architecture.

Completed:

- `lib/server/request-security.js`: added shared mutation security helpers for same-origin browser mutation checks, private no-store error responses, client IP extraction, bounded in-memory rate-limit buckets, and one-call `guardMutationRequest()`.
- Added `guardMutationRequest()` to every `POST`, `PUT`, `PATCH`, and `DELETE` route handler under `app/api`.
- Covered auth, guest mode, chat persistence, evidence upload/review/delete, workspace reset/import, member management, reports schedules, agents, diagnostics, connectors, notifications, URL analysis, Excel workspace, operations, support tickets, mobile approvals, and live-events mutations.
- Kept `GET` routes unchanged except for existing session/capability checks already added in earlier phases.

Verified:

- Static route scan found no mutation `route.js` files without `guardMutationRequest`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Runtime API smoke passed on local dev server:
  - cross-origin `POST /api/auth/guest` returned `403 BAD_ORIGIN`;
  - normal `POST /api/auth/guest` returned `200` and issued a session cookie;
  - cross-origin `PATCH /api/notifications` returned `403 BAD_ORIGIN`;
  - same-origin `PATCH /api/notifications` returned `200`.
- Browser smoke passed through system Edge at `1440x900`: `/`, `/login`, `Continue as guest`, and `/workspace` loaded with no Next.js error overlay and no console warnings/errors.
- Screenshot saved at `qa-artifacts/security-smoke-workspace.png`.

Residual risk:

- The current rate limiter is per Node.js process and resets on restart. Production should move this to Vercel Firewall/WAF, Upstash Redis, Supabase-backed limits, or another shared limiter.
- Same-origin validation is defense-in-depth for browser-originated mutations; every sensitive mutation still depends on server-side session/capability checks and must keep doing so.
- Server-to-server live event ingestion should normally omit an `Origin` header. If an external system sends a mismatched browser-style `Origin`, the new guard will block it even with a valid ingest token.
- Supabase RLS/schema policies still need a final production audit before real customer data is used.

Next exact task: continue investor-ready P0 hardening by checking the remaining button wiring and connected data refresh paths section by section, then produce the final Antigravity/Gemini handoff map.

## R-13 Savings Radar Button Wiring and Local Interaction Hardening

Savings Radar was moved further away from static demo behavior and toward connected workspace behavior. The section now uses real workspace findings/actions, updates approval-safe action status through the workspace API when possible, and no longer uses fake toast-only handlers for the main table filters and detail panel tabs.

Completed:

- `components/genius/sections/savings-radar.jsx`: replaced decorative table controls with stateful category, severity, confidence, owner, approval-state, and source-type filters.
- `components/genius/sections/savings-radar.jsx`: added active filter summary chips, clear-all behavior, safe pagination after filtering, current-page selection, and empty-filter state.
- `components/genius/sections/savings-radar.jsx`: changed Save View into a real local saved-view counter for the current filter state.
- `components/genius/sections/savings-radar.jsx`: added a visible column-settings panel instead of a toast-only control.
- `components/genius/sections/savings-radar.jsx`: made detail tabs stateful. Evidence, Impact, Timeline, Activity, and Related now render contextual content for the selected opportunity.
- `components/genius/sections/savings-radar.jsx`: changed proof-trail links, supporting-evidence links, and the bottom more-options menu into real navigation/status actions with workspace context.
- `components/genius/sections/savings-radar.jsx`: fixed filtered pagination to avoid React 19 set-state-in-effect violations by using a computed safe page value.

Verified:

- Focused `npx.cmd eslint components/genius/sections/savings-radar.jsx` passed.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js 16.2.4 and generated all 34 routes.
- Browser smoke passed through system Edge at `1920x1080`:
  - `/login -> Continue as guest -> /workspace`;
  - `POST /api/demo/reset` returned `200`;
  - Savings Radar rendered with investor-demo findings;
  - severity filter opened the active-filter summary;
  - Impact tab rendered the contextual impact panel;
  - no Next.js overlay, console warnings/errors, or request failures.
- Screenshot saved at `qa-artifacts/savings-radar-wired-smoke.png`.

Residual risk:

- Saved views and visible-column settings are local UI state only. Persisting named views should wait until product requirements for saved workspace views are finalized.
- The section still intentionally locks or routes production-only capabilities instead of pretending to have external connector credentials.
- Full 80-150% zoom/responsive QA still remains a later pass after the design is stable.

Next exact task: continue the same button-wiring pass on the next investor-critical section with the highest visible fake-action density, likely `Reports`, `Connectors`, or `B2B Bridge`, then produce the Antigravity/Gemini final binding map.

## R-14 Security Audit Pass and Runtime Hardening

Security audit pass started from the downloaded external reference repo at `work/security-skills/Anthropic-Cybersecurity-Skills`. The repo is used only as a checklist/reference; no third-party code from it was executed.

Completed:

- `next.config.mjs`: added global security headers through Next.js `headers()`:
  - `Content-Security-Policy`;
  - `X-Content-Type-Options: nosniff`;
  - `X-Frame-Options: DENY`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy`;
  - `Cross-Origin-Opener-Policy`;
  - `Cross-Origin-Resource-Policy`;
  - production-only `Strict-Transport-Security`.
- `lib/server/request-security.js`: tightened origin host validation to prefer the real `Host` header before `x-forwarded-host`, added normalized host parsing, and added shared mutation `Content-Length` limiting.
- `app/api/evidence/route.js`: kept file uploads compatible by allowing the configured evidence batch size plus multipart overhead.
- `app/api/workspace/portable/route.js`: kept portable workspace import compatible with the 10 MB import cap.
- `supabase/schema.sql`: completed RLS policies for every `genius_*` tenant table instead of leaving child-table policies as a TODO, and aligned policy workspace IDs with server session `workspaceIdForUser()`.
- `lib/db/supabase.js` and `lib/db/adapter.js`: disabled the legacy browser-style Supabase client shim so future imports fall back to local demo data instead of creating a second public database access path.
- `package.json` / `package-lock.json`: upgraded `next` and `eslint-config-next` from `16.2.4` to exact `16.2.10`, removing the high-severity Next.js advisories reported by `npm audit`.

Verified:

- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all 34 routes.
- `npm.cmd audit --omit=dev --json --cache .npm-cache` now reports `0 high`, `0 critical`, and `2 moderate` advisories remaining.
- Production smoke on `next start --port 3010` passed:
  - `/login` returned CSP, `DENY`, `nosniff`, and strict referrer headers;
  - cross-origin `DELETE /api/auth/session` returned `403`;
  - oversized `POST /api/auth/guest` returned `413`.

Residual risk:

- The remaining `npm audit` finding is `postcss` nested inside `next@16.2.10`; npm suggests `next@9.3.3` through `--force`, which is a breaking downgrade and must not be used. Recheck once a newer Next patch is available.
- The shared body-size guard uses `Content-Length`. It blocks normal oversized browser/API requests, but a determined streaming client without `Content-Length` still needs platform-level request size limits.
- The in-memory rate limiter is still per Node.js process. Production should move rate limiting to Vercel Firewall/WAF, Redis, Supabase, or another shared limiter.
- Supabase RLS is now complete for deterministic owner workspaces, but direct client-side Supabase access is still intentionally not part of the product architecture. Keep all production reads/writes through server route handlers.
- URL analysis already blocks private/local hosts and revalidates redirects, but DNS rebinding risk should be reassessed before allowing high-trust customer deployments.

Next exact task: continue investor-critical section wiring and data refresh paths, then run a final end-to-end demo script with guest mode, demo reset, upload/import/export, approvals, reports, connectors, and settings security checks.

## R-15 B2B Bridge Workflow Wiring

B2B Bridge is now connected to the real workspace operation APIs instead of running as a mostly static chat mock. The visible workflow controls are approval-gated, messages persist through the workspace store, internal notes survive refresh, and transcript export works locally without navigating away from the workspace.

Completed:

- `components/genius/sections/b2b-bridge.jsx`: rewired the section to `useWorkspace()` operations state, real `sendB2bMessage()`, real `updateB2bWorkflowStatus()`, permission checks, internal follow-up notes, acknowledgement notes, evidence navigation, and JSON transcript export.
- `components/genius/sections/b2b-bridge/conversation-header.jsx`: workflow status is now dynamic; approve/reject/reopen actions call the real API; back/details/export controls now navigate or execute real local behavior.
- `components/genius/sections/b2b-bridge/message-list.jsx`: evidence and acknowledgement controls now trigger real handlers instead of static buttons.
- `components/genius/sections/b2b-bridge/message-composer.jsx`: message send is async, respects permissions, disables on closed/rejected workflow states, and reports locked partner-file utilities truthfully.
- `components/genius/sections/b2b-bridge/context-panel.jsx`: side panel now uses real thread status/messages/participants/timeline, real approve/reject/reopen buttons, real follow-up note creation, real evidence navigation, and transcript export.
- `lib/server/evidence-store.js`: B2B thread messages now persist `isInternal`, so internal notes stay internal after refresh and are recorded in the audit log.

Verified:

- Focused ESLint passed for the B2B Bridge section files and `lib/server/evidence-store.js`.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all 34 routes.
- Production API smoke on `next start` passed with explicit production session secret:
  - guest workspace creation returned `200`;
  - `PATCH /api/operations/b2b` approved the workflow with `200`;
  - `POST /api/operations/b2b` created an internal follow-up note with `200`;
  - `GET /api/workspace` returned workflow status `Approved`;
  - the latest B2B message was `Smoke follow-up note` with `isInternal: true`.

Residual risk:

- Full browser/pixel QA for the B2B Bridge screen still needs to be run at `1920x1080` and the agreed zoom range after the design stabilizes.
- Transcript export is local JSON only; production partner delivery, file sharing, and retention policy controls remain intentionally locked.
- The B2B channel list and partner credential flows remain demo-centered; real external partner integration should stay gated behind connector/security design.

Next exact task: continue investor-critical connected workflow wiring. Highest-value remaining candidates are Approvals lifecycle QA, Excel Workspace saved-view/persistence QA, final end-to-end investor demo script, and the Antigravity/Gemini button-binding map.

## R-16 Approvals Lifecycle and Cross-Section Metrics Hardening

Approvals lifecycle is now a stronger connected workflow instead of a simple status toggle. Decisions write durable lifecycle metadata, reports and workspace metrics understand delegated/rejected/done counts, and navigation from B2B/Connectors back into Data Intake uses the correct workspace section id.

Completed:

- `app/api/actions/[id]/route.js`: action decisions now accept `Delegated` plus optional `delegateTo` and `source` metadata while keeping `decide_approvals` authorization.
- `lib/server/evidence-store.js`: `updateActionStatus()` now records previous status, source, delegate target, lifecycle timestamps/by-fields for approved/rejected/done/needs-evidence/edited/ready/delegated/snoozed states, decision history, and explicit `externalExecution` blocking metadata.
- `lib/server/workspace-engine.js`: derived action rebuilds now preserve lifecycle fields, and workspace/diagnostics metrics now include approved, rejected, delegated, and done action counts.
- `lib/server/report-engine.js`: report metrics now include rejected, delegated, and done action counts where relevant.
- `components/genius/workspace-context.jsx`: `updateAction()` can pass decision metadata through the existing frontend gateway.
- `components/genius/sections/approvals.jsx`: detail panel now shows dynamic decision timeline/rationale, supports delegate/reopen actions, supports delegated/rejected bulk actions, and local fallback actions maintain decision history.
- `components/genius/sections/reports.jsx`: report summary now reflects rejected/delegated counts instead of hardcoding rejected approvals as zero.
- `components/genius/sections/savings-radar.jsx`: delegated actions map to the existing in-progress state for cross-section consistency.
- `components/genius/app-shell.jsx`, `components/genius/sections/b2b-bridge*`, and `components/genius/sections/connectors.jsx`: fixed stale `data-intake` navigation ids to the actual `data` section id.

Verified:

- Focused ESLint passed for all touched R-16 files.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all 34 routes.
- Production API smoke on fresh `next start` passed:
  - guest workspace creation returned `200`;
  - investor demo reset returned `200`;
  - three approval decisions returned `[200, 200, 200]` for `Delegated`, `Rejected`, and `Approved`;
  - each updated action had matching top `decisionHistory` status;
  - workspace metrics returned `open=9`, `approved=1`, `rejected=1`, `delegated=1`;
  - weekly report metrics returned the same `open=9`, `approved=1`, `rejected=1`, `delegated=1`.
- Scoped `git diff --check` passed for the touched files; line-ending warnings are informational.

Residual risk:

- Browser/pixel QA for the updated Approvals detail panel still needs to be run at the final target viewports and zoom levels.
- External execution remains intentionally blocked even after approval; production connector write permissions and execution policies are not implemented in this slice.
- Bulk lifecycle decisions are sequential API calls. This is acceptable for the current product cut, but a future production bulk endpoint would be better for large queues.

Next exact task: run the final investor demo path end to end in the browser, then produce the Antigravity/Gemini button-binding map and any remaining UX/security punch list.

## R-17 Investor Demo Loader And Binding Map

The investor demo handoff is now explicit and reproducible. A user with Owner access can load deterministic investor demo data from the UI, and a new handoff document explains the demo path, section IDs, button/API bindings, Gemini instructions, and remaining browser QA matrix.

Completed:

- `components/genius/workspace-context.jsx`: added `loadDemoWorkspace()`, an authorized frontend gateway method for the existing `/api/demo/reset` endpoint.
- `components/genius/sections/settings.jsx`: added Owner-only `Load demo` controls in Settings, with confirmation and truthful replacement copy.
- `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`: added the current investor demo path, Antigravity binding map, Gemini prompt, browser QA matrix, and known limits.

Verified:

- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all 34 routes.
- Production HTTP/API smoke on fresh `next start` passed:
  - `/` returned `200`;
  - `/login` returned `200`;
  - guest workspace creation returned `200`;
  - investor demo reset returned `200`;
  - `/workspace` returned `200`;
  - `/api/readiness` returned `200`.
- Scoped `git diff --check` passed for the touched files; line-ending warnings are informational.

Residual risk:

- Full browser click-through QA was not run in this tool session because Playwright is not installed in the project and no browser automation connector was available after tool discovery.
- The new `Load demo` button uses the existing backend endpoint and authorization, but still needs visual QA in Settings at the final desktop/zoom targets.
- The new binding map is a handoff document, not automated E2E coverage.

Next exact task: run the browser visual QA matrix from `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`, capture issues/screenshots, then close the final UX/security punch list before declaring a release candidate.

## R-18 Browser Visual QA Matrix

The main investor demo path has now been browser-smoked with real local navigation and deterministic demo data. Playwright is not installed, so this pass used system Chrome in headless mode through Chrome DevTools Protocol against a production `next start` server.

Completed:

- Launched production server with `GENIUS_SESSION_SECRET=codex-smoke-session-secret-32-characters-minimum`.
- Opened `/login`, used `Continue as guest`, reached `/workspace`, opened Settings, and used the Owner-only `Load demo` control.
- Walked the main workspace sections after demo load:
  - Command Center
  - Data Intake
  - Excel Workspace
  - Diagnostics
  - Savings Radar
  - Approvals
  - Reports
  - AI Chat / Workbench
  - Connectors
  - Multi-Business OS / B2B Bridge
  - Support / FAQ
  - Settings
- Captured local screenshots under `qa-artifacts/r18-browser-qa/`.
- Ran automated layout checks for visible heading, Next.js overlay text, horizontal overflow, visible buttons, clipped elements, console events, and request failures.
- Rechecked Settings at `1536x864`, `1366x768`, and `1920x1080`.

Verified:

- Every tested section rendered the expected primary heading.
- No Next.js error overlay was detected.
- No horizontal page overflow was detected.
- No browser console events were recorded.
- No request failures were recorded.
- Settings rendered successfully at `1536x864`, `1366x768`, and `1920x1080`.
- The `Load demo` UI was exercised in-browser, not only through API smoke.

Residual risk:

- The automated clipped-element detector flagged small dense UI elements such as the notification `9+` badge and one top status chip. These did not block the demo path, but they should be visually reviewed during the final polish pass.
- Browser zoom checks at `80%`, `125%`, and `150%` were not completed in this slice.
- This pass verified section rendering and navigation, but did not deeply click every secondary workflow inside every section.
- `qa-artifacts/` contains local screenshots and should not be committed unless the team wants QA evidence versioned.

Next exact task: continue with `R-19` final release punch list: run zoom QA, click the remaining high-risk secondary workflows inside Approvals/Reports/Data Intake/Excel/Connectors, fix any P0/P1 UI issues, then do one final security/readiness pass.

## R-19 Investor-Critical API Interaction Smoke

The highest-risk cross-section backend contracts were smoke-tested on a fresh guest session against a production `next start` server. This verifies that the main investor buttons have real server behavior and data propagation underneath the UI.

Completed:

- Created a guest Owner workspace through `/api/auth/guest`.
- Loaded deterministic investor demo data through `/api/demo/reset`.
- Uploaded a CSV spend file through `/api/evidence`.
- Confirmed the uploaded evidence through `/api/evidence/review`.
- Verified workspace derivation into spend rows, invoices, and vendors through `/api/workspace`.
- Saved an Excel Workspace view through `/api/excel-workspace`.
- Delegated an approval through `/api/actions/[id]` and verified decision history/lifecycle metadata.
- Loaded reports, fetched report detail, exported report CSV, created a report schedule draft, and activated it through `/api/reports` and `/api/reports/schedules`.
- Created a connector request, moved it to `reviewing`, and saved a connector filter preset through `/api/connectors`.
- Created, commented on, and resolved a support ticket through `/api/support/tickets`.
- Exported and re-imported a portable workspace through `/api/workspace/portable`.
- Checked final readiness through `/api/readiness`.

Verified:

- R-19 smoke result was saved to `qa-artifacts/r19-api-smoke/r19-api-smoke-result.json`.
- All tested endpoints returned `200`.
- CSV upload parsed `3` spreadsheet rows with `spreadsheet_parse_status=parsed`.
- Workspace derivation returned `8` spend rows, `5` invoices, and `10` vendors after demo plus uploaded evidence.
- Excel saved view persisted with `2` selected rows.
- Approval delegation persisted with `decisionHistory[0].status=Delegated` and `delegatedTo=Finance owner`.
- Report schedule moved to `active`.
- Connector request moved to `reviewing`; filter preset saved for `netsuite`.
- Support ticket resolved after comment event.
- Portable export/import preserved guest mode and used schema `genius.workspace.portable.v1`.
- Readiness returned `investor_ready`, score `100`, `excelViews=1`, `excelRows=16`, `auditEvents=29`, and `humanDecisions=1`.

Residual risk:

- This was API-level interaction smoke, not a full click-by-click browser test for every secondary button.
- Browser zoom automation for R-19 was blocked by local Windows headless Chrome/Edge launch instability. R-18 browser screenshots remain valid for the main path, but the 80/125/150 zoom pass still needs to be run with a stable browser runner.
- Support status PATCH now accepts both `id` and `ticketId`; comments and attachments also accept `ticketId`, which reduces Antigravity binding mistakes.
- Report/connector/support external delivery remains intentionally local/locked.

Follow-up completed below: `R-20` fixed Support ticket payload compatibility. Remaining browser zoom polish and UI-level interaction checks are now `R-21`.

## R-20 Support Ticket Payload Compatibility

A small API compatibility issue was fixed after the R-19 smoke: support comments already accepted `ticketId`, but support status updates only accepted `id`. This was easy to bind incorrectly from Antigravity, so status updates now accept both.

Completed:

- `lib/server/evidence-store.js`: `updateSupportTicketStatus()` now resolves the ticket id from `input.id || input.ticketId`.
- `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`: Support binding notes now state that status/comment/attachment PATCH can use `ticketId`, with `id` still supported for status compatibility.

Verified:

- Focused `npm.cmd run lint -- lib/server/evidence-store.js` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all 34 routes.
- Production support smoke passed on fresh `next start`:
  - guest workspace creation succeeded;
  - support ticket creation succeeded;
  - support status PATCH with `{ ticketId, status: "resolved" }` returned `resolved`;
  - ticket event count was `2`.

Residual risk:

- This was a support API compatibility fix only; it did not complete the remaining browser zoom polish.

Next exact task: continue with `R-21` final browser zoom polish and UI-level interaction checks. If browser automation remains unstable locally, run the app manually at 80%, 100%, 125%, and 150% and record only real P0/P1 layout defects before changing UI code.

## R-21 Interface Wiring: AppShell, Search, Team CRM, CEO AI Gateway

The next investor-facing UI wiring pass connected several remaining shell and operations surfaces to real workspace state instead of static demo-only state.

Completed:

- `components/genius/app-shell.jsx`
  - Global search now builds results from the current workspace:
    - screen links;
    - findings;
    - approval actions;
    - evidence;
    - Excel/spend rows;
    - reports;
    - support tickets;
    - connector requests.
  - Search clicks now pass focus context into the destination section.
  - Removed old hardcoded Microsoft/SaaS/Duplicate payment search seed rows.
- `components/genius/sections/team-crm.jsx`
  - Team Operations CRM now reads persisted `operations.crmTasks`.
  - Local board actions create tasks, filter to "my tasks", move cards across columns, and update dynamic metrics/widgets.
  - Submitting a task still uses the existing `/api/operations/team-report` backend path through `submitTeamReport`.
  - Submitted tasks immediately move to `submitted` locally and appear in CEO Gateway after workspace refresh/state update.
- `components/genius/sections/team-crm/crm-header.jsx`
  - Header buttons now call real parent handlers for create, filter focus, automations focus, and analytics date range.
- `components/genius/sections/team-crm/kanban-board.jsx`
  - Column `+`, column menu, and bottom `Add task` controls now call parent handlers.
- `components/genius/sections/team-crm/task-panel.jsx`
  - Submit callback returns the created Gateway report and updates the board state.
- `components/genius/sections/ai-gateway.jsx`
  - Gateway utility actions are wired:
    - Validate Data opens the existing validation dialog;
    - Copy report ID uses clipboard with toast fallback;
    - raw evidence links route to Data Intake with context;
    - note save validates input and records local UI state.
- `components/genius/sections/ai-gateway/decision-header.jsx`
  - Validate, Audit menu, and Copy report ID controls now have handlers.
- `components/genius/sections/ai-gateway/tabs.jsx`
  - Evidence revalidation uses the validation dialog.
  - Evidence "View Raw" routes to Data Intake.
  - Notes can be saved into the current local view.
  - Audit Log filter toggles decision events and CSV export downloads the visible log rows.

Verified:

- Focused lint passed:
  - `components/genius/app-shell.jsx`
  - Team CRM files touched in R-21
  - AI Gateway files touched in R-21
- Full `npm.cmd run build` passed after AppShell search wiring.
- Full `npm.cmd run build` passed after Team CRM wiring.
- Full `npm.cmd run build` passed after AI Gateway wiring.

Residual risk:

- Team CRM card creation and drag/drop are intentionally local board interactions; persistence happens when the user submits a task to CEO AI Gateway through the existing backend contract. A separate persisted task-update endpoint does not exist yet.
- AI Gateway notes are local UI notes in this pass. Persisted decision notes would require extending `/api/operations/reports/[id]`.
- B2B Bridge messaging/workflow/export are backend-backed, but the left channel list is still mostly local navigation and can be improved in the next wiring pass.
- Browser zoom QA at 80%, 125%, and 150% is still pending because local headless Chrome/Edge automation was unstable earlier.

Follow-up completed below: `R-22` finished B2B Bridge channel-list and utility action wiring. The next exact task is the final cross-section browser click pass plus Antigravity/Gemini binding map update.

## R-22 B2B Bridge Channel Actions And Local Session Wiring

B2B Bridge channel-list and utility actions are now wired enough for investor/browser use without corrupting the real persisted invoice thread. The primary `INV-2025-0519` discussion still writes through `/api/operations/b2b`; secondary/demo/local discussions run as safe local-session channels with their own messages, workflow status, pin/archive state, transcript export, and navigation actions.

Completed:

- `components/genius/workspace-context.jsx`: `sendB2bMessage()` now forwards `isInternal` and `isAction`, so internal B2B notes persist with the correct visibility metadata.
- `components/genius/sections/b2b-bridge.jsx`: added selected discussion state, local-session message/workflow handling, safe primary-vs-local routing, pin/unpin, archive/restore, invite logging, channel settings navigation, attachment navigation, local follow-up notes, local acknowledgements, and selected-discussion transcript export.
- `components/genius/sections/b2b-bridge/channel-list.jsx`: made selected channel controlled by the parent and added dynamic pinned/unpinned/archived/restored handling without React effect state mirroring.
- `components/genius/sections/b2b-bridge/conversation-header.jsx`: channel action callbacks now drive pin, invite, settings, archive/restore, workflow actions, and export; action menu has an accessible label.
- `components/genius/sections/b2b-bridge/message-composer.jsx`: attachment opens Data Intake, mention/emoji/formatting modify the input, send has an accessible label, and archived channels show a precise disabled reason.
- `components/genius/sections/b2b-bridge/context-panel.jsx`: related document names open Data Intake, SLA details open Diagnostics, and the collapse control is accessible.
- `qa-artifacts/r22-b2b-actions/b2b-actions-smoke.mjs`: added a focused Playwright smoke covering B2B navigation, local discussion creation, composer utilities, external/internal send, pin, invite, approve, export, archive/restore, settings, Data Intake, and Diagnostics links.

Verified:

- Focused ESLint passed for the touched B2B files, `workspace-context.jsx`, and the R-22 QA script.
- `npm.cmd run build` passed on Next.js `16.2.10` and generated all 34 routes.
- R-22 browser smoke passed against a temporary local dev server:
  - `15` functional steps passed;
  - `3` screenshots captured;
  - `1` selected-discussion transcript JSON exported;
  - report saved to `qa-artifacts/r22-b2b-actions/r22-b2b-actions-smoke.json`.

Residual risk:

- Secondary B2B channels are intentionally local-session only. Real multi-thread partner persistence still needs a backend schema/API before production partner collaboration.
- The primary invoice thread is backend-backed, but partner delivery, file sharing, credential checks, and retention policy enforcement remain future integration/security work.
- R-22 verifies B2B actions deeply; the next pass should do cross-section click QA across Team CRM -> CEO Gateway -> Data Intake plus final Antigravity/Gemini button-binding documentation.

Next exact task: run the final cross-section browser click pass, update the Antigravity/Gemini binding map with the exact button/API/section bindings, then close remaining P0/P1 UX/security punch-list items before release-candidate handoff.

## R-23 Cross-Section Browser Click QA And Handoff Refresh

The final cross-section investor workflow smoke has passed in the browser and the Antigravity/Gemini binding map has been refreshed for the current baseline.

Completed:

- `qa-artifacts/r23-cross-section/cross-section-click-smoke.mjs`: added a reproducible Playwright smoke for the investor-critical cross-section workflow.
- `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`: updated status to R-23, added R-22/R-23 verification results, corrected B2B Bridge binding notes, and replaced the old Gemini next-task prompt with the R-24 release-readiness/security/UX-binding sweep.
- `eslint.config.mjs`: ignored generated Chrome visual-QA profile folders under `qa-artifacts/**/chrome-profile-*` and `qa-artifacts/**/chrome-debug-profile-*` so full lint checks project source and QA scripts without linting vendored browser extension files.

Verified in R-23 browser smoke:

- Guest login and investor demo reset.
- Team CRM task creation and `Submit to AI / CEO Review`.
- CEO AI Gateway validation, copy report ID, and Audit Log filter.
- Data Intake review confirmation and extracted-data CSV export.
- Excel Workspace row selection, saved view, and CSV export.
- Approvals detail delegation.
- Reports JSON export and schedule draft.
- Connectors request creation and move to reviewing.
- Support ticket creation and comment.
- Settings portable workspace export.

Artifacts:

- Report: `qa-artifacts/r23-cross-section/r23-cross-section-click-smoke.json`
- Screenshots: `qa-artifacts/r23-cross-section/01-command-center-demo-loaded.png` through `10-settings-export.png`
- Downloads: extracted data CSV, Excel CSV, weekly report JSON, and portable workspace JSON.

Result:

- R-23 passed on 2026-07-15 against a managed local Next dev server at `http://localhost:3011`.
- `ok: true`, `failedCount: 0`, `steps: 11`, `screenshots: 10`, `downloads: 4`.
- No console errors, page errors, bad `5xx` responses, Next.js overlay, horizontal overflow, or clipped visible controls were detected.
- One `GET /api/workspace net::ERR_ABORTED` request during navigation was recorded and safely ignored by the smoke script.
- Focused ESLint passed for `qa-artifacts/r23-cross-section/cross-section-click-smoke.mjs`.
- Full `npm.cmd run lint` passed after excluding generated browser profile folders.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes, including `/api/auth/guest`, `/api/operations/*`, `/api/reports/*`, `/api/support/tickets`, and `/api/workspace/portable`.

Residual risk:

- R-23 is a critical click smoke, not exhaustive coverage for every visual button.
- Final zoom/manual QA at 80%, 100%, 125%, and 150% should be repeated after the user's final design edits.
- Security/readiness is still the next release gate: auth/session revocation, guest mode boundaries, portable export masking, Supabase env/RLS assumptions, route authorization, and deployment env checks.
- Production external connector writes, transactional email, billing, SSO, and final AI-agent expansion remain intentionally out of scope until credentials and policy controls are assigned.

Next exact task: run `R-24` release-readiness and security sweep, then final zoom/design regression QA and deployment/env handoff.

## R-24 Security Projection And Portable Workspace Hardening

The release-readiness security sweep closed concrete data-projection and portable-workspace privacy gaps without changing the investor demo workflow.

Completed:

- `lib/server/auth-session.js`: public session projection no longer exposes raw auth/login email. Guest sessions also no longer expose generated guest email or generated masked email to the client.
- `lib/server/workspace-state.js`: public workspace projection now recursively strips unknown sensitive fields such as `session*`, `token*`, `secret*`, `password*`, `apiKey*`, auth headers, credentials, cookies, and storage path metadata.
- `lib/server/workspace-state.js`: public workspace projection now clears raw `email` / `*Email` fields and masks actor-like email values in public arrays such as report recipients.
- `lib/server/evidence-store.js`: portable import now strips sensitive unknown keys before writing workspace state, including camelCase email keys like `ownerEmail`.
- `lib/server/evidence-store.js`: portable export metadata no longer writes an email-like `exportedBy`; email actors are reduced to `workspace-user`.
- `qa-artifacts/r24-security/r24-security-smoke.mjs`: added an API-level smoke for guest session masking, public workspace projection, dirty portable import sanitation, and portable export redaction.

Verified:

- Focused ESLint passed for:
  - `lib/server/auth-session.js`
  - `lib/server/workspace-state.js`
  - `lib/server/evidence-store.js`
  - `qa-artifacts/r24-security/r24-security-smoke.mjs`
- R-24 security smoke passed against a managed local Next dev server:
  - guest auth returned `200`;
  - public session returned empty `email` and empty guest `emailMasked`;
  - public workspace did not expose `sessions`;
  - public workspace members did not expose raw email;
  - dirty portable import returned `200`;
  - public workspace after dirty import had `0` leak matches for seeded secret/token/session/email values;
  - portable export returned `exportedBy: workspace-user` and `0` leak matches.
- Report: `qa-artifacts/r24-security/r24-security-smoke.json`
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Residual risk:

- This hardens app-level projection and portable import/export, but it is not a replacement for real Supabase RLS verification in the production project.
- Invite lookup intentionally still exposes the invited email to someone holding the invite token so the login page can prefill the invited account. Treat invite URLs as bearer secrets until transactional email and invite acceptance policies are finalized.
- Final deployment still needs environment verification: `GENIUS_SESSION_SECRET`, Supabase URL/service keys/table policies, live ingest secret, Gemini key, Vercel project settings, and production smoke.
- Final zoom/design QA for the current local design baseline was completed in R-25.

R-25, R-26, and R-27 were completed after this block. Current next exact task is `R-28` Supabase env repair, remote Supabase smoke, deploy, and production URL smoke.

## R-25 Final Zoom And Design Regression QA

The final desktop zoom/design regression pass is complete for the current local design baseline.

Completed:

- `components/genius/sections/team-crm/task-panel.jsx`: fixed the Team Operations CRM slide-over so the selected task panel stays inside the workspace viewport at desktop widths.
- `components/genius/sections/team-crm/task-panel.jsx`: removed the close-button negative margin and tightened task-panel tab spacing so the `Attachments` tab no longer clips at `1920x1080`.
- `qa-artifacts/r21-browser-qa/playwright-smoke.mjs`: made the existing browser smoke reusable through `GENIUS_QA_OUTPUT_DIR` and `GENIUS_QA_REPORT_NAME`, preserving R-21 defaults while allowing R-25 artifacts.
- `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`: updated the Gemini/Claude handoff to reflect R-24 completion before running R-25.

Verified:

- Focused ESLint passed for:
  - `components/genius/sections/team-crm/task-panel.jsx`
  - `qa-artifacts/r21-browser-qa/playwright-smoke.mjs`
- R-25 browser zoom smoke passed against a managed local Next dev server at `http://localhost:3017`.
- R-25 covered guest login, investor demo reset, all main workspace sections at `1920x1080`, and dense screens at zoom-equivalent viewports:
  - `80%`: `2400x1350`
  - `100%`: `1920x1080`
  - `125%`: `1536x864`
  - `150%`: `1280x720`
- Dense screens checked: Data Intake, Approvals, Reports, Connectors, B2B Bridge, and Settings.
- Report: `qa-artifacts/r25-zoom-readiness/r25-zoom-smoke.json`
- Screenshots: `qa-artifacts/r25-zoom-readiness/`, `38` screenshots.
- R-25 result: `ok: true`, `failedCount: 0`, no console errors, no page errors, no request failures, no `5xx` responses, no horizontal overflow, and no clipped visible controls.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Residual risk:

- R-25 validates the current local design baseline. If the user or Antigravity changes section layouts again, rerun the same R-25 smoke before investor demo.
- Production environment and deployment smoke are still not verified in this local pass: `GENIUS_SESSION_SECRET`, Supabase project URL/keys/table policies/RLS, live ingest secret, Gemini key, Vercel settings, and production URL smoke remain the next release gate.
- External connector writes, transactional email, billing, SSO, native CRM/accounting/banking integrations, and final AI-agent expansion remain intentionally blocked until credentials and policy controls are assigned.

R-26 and R-27 were completed after this block. Current next exact task is `R-28` Supabase env repair, remote Supabase smoke, deploy, and production URL smoke.

## R-26 Local Production Readiness Smoke

Local production-readiness smoke is complete for the current repository baseline. This did not deploy to a remote host and did not verify a real Supabase project; it verified local `next start` behavior and production fail-safes.

Completed:

- Audited local `.env.local` by key name only; no secret values were printed or written.
- Confirmed current local env contains:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`
  - `GENIUS_WORKSPACE_ID`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL`
- Confirmed current local env is missing production-required:
  - `GENIUS_SESSION_SECRET`
  - `GENIUS_LIVE_INGEST_SECRET`
- Ran production `next start` with no `GENIUS_SESSION_SECRET` override and confirmed auth fails safely instead of issuing insecure production cookies.
- Ran production `next start` with a temporary child-process-only session secret and `GENIUS_FORCE_LOCAL_STORE=1` to verify production build/start behavior without writing any real secret into files.

Verified:

- R-26 report: `qa-artifacts/r26-production-readiness/r26-production-readiness-smoke.json`
- Fail-safe scenario:
  - `/login` returned `200`.
  - `/api/auth/guest` returned `500` with `GENIUS_SESSION_SECRET is required in production.`
- Configured local production scenario:
  - `/login` returned `200`.
  - `/api/auth/guest` returned `200`.
  - Public guest session returned empty `email` and empty `emailMasked`.
  - `/api/demo/reset` returned `200`.
  - `/api/readiness` returned `200`, `status: investor_ready`, `score: 97`, `backend.storage: local`.

Residual risk:

- A real production deployment still needs actual env values configured outside the repo:
  - `GENIUS_SESSION_SECRET` with at least 32 characters.
  - `GENIUS_LIVE_INGEST_SECRET` for HMAC live-event ingestion.
  - Production Supabase URL/service role key and schema/RLS applied in the target Supabase project.
  - Gemini key/model.
  - Vercel/project env settings.
- R-26 used `GENIUS_FORCE_LOCAL_STORE=1` only for local production smoke. It does not prove real Supabase persistence, table policies, or cross-tenant isolation.
- Remote production URL smoke still remains after deploy.

R-27 was completed after this block. Current next exact task is `R-28` Supabase env repair, remote Supabase smoke, deploy, and production URL smoke.

## R-27 Supabase Production Contract And Remote Smoke Tooling

The production Supabase/deploy verification layer is prepared, and one real schema mismatch was fixed before deployment.

Completed:

- `supabase/schema.sql`: made table creation idempotent with `CREATE TABLE IF NOT EXISTS`.
- `supabase/schema.sql`: aligned `genius_reports` with `lib/server/supabase-workspace-store.js` by adding `type`, `detail`, `summary`, and `generated_at`.
- `supabase/schema.sql`: added migration-safe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements for pre-R27 `genius_reports` tables.
- `supabase/schema.sql`: added `FORCE ROW LEVEL SECURITY` for all GENIUS tables and workspace indexes for workspace-scoped tables.
- `supabase/r27_rls_verification.sql`: added a Supabase SQL Editor verification file for table presence, report columns, RLS enabled/forced state, and policies.
- `.env.example`: documented `GENIUS_FORCE_LOCAL_STORE` and R27 production smoke env variables.
- `qa-artifacts/r27-production/r27-supabase-schema-contract-smoke.mjs`: added a local schema/code contract smoke.
- `qa-artifacts/r27-production/r27-supabase-rest-smoke.mjs`: added a real Supabase REST table/column smoke using local env without printing secrets.
- `qa-artifacts/r27-production/r27-production-url-smoke.mjs`: added a production URL smoke for `/`, `/login`, auth, demo reset, readiness, and portable export redaction.

Verified:

- R27 local schema contract smoke passed:
  - Report: `qa-artifacts/r27-production/r27-supabase-schema-contract-smoke.json`
  - `checkedTables: 9`
  - all expected columns present
  - RLS enabled and forced in schema
  - workspace indexes present
- Focused ESLint passed for all R27 QA scripts.
- `git diff --check` passed for R27-touched files; CRLF warning on `.env.example` is informational.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- Real Supabase REST smoke did not reach the configured project:
  - Report: `qa-artifacts/r27-production/r27-supabase-rest-smoke.json`
  - Target origin: `https://fdscrwloptchpozyotiv.supabase.co`
  - Result: `ENOTFOUND` for all table checks.
- This means the current `SUPABASE_URL` in `.env.local` is not resolving from this machine/session. It may be wrong, the project may be deleted/paused, or DNS/network access to that project is unavailable.
- Because Supabase REST is unreachable, RLS in the real project and cross-tenant isolation are not yet verified.
- Remote deployment was not attempted because production env is still missing required keys and Supabase is not reachable.

R-28 and R-29 were completed after this block. Current next exact task is `R-30`: supply working production env/deploy inputs and run `npm.cmd run qa:release` until all required gates pass.

## R-28 Release Gate And Cross-Tenant Smoke Tooling

The release gate is now executable. It intentionally fails in the current environment because the real production/Supabase inputs are still missing or invalid.

Completed:

- `qa-artifacts/r28-release/r28-cross-tenant-production-smoke.mjs`: added a two-tenant production smoke that signs in/up two disposable account users, verifies separate workspace IDs, checks Supabase-backed account storage, writes a Tenant A live-event marker, verifies Tenant B cannot see it, blocks workspace override without a live token, and checks public payloads for raw-email leaks.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: added an aggregate release gate that runs:
  - local Supabase schema contract smoke
  - remote Supabase REST schema smoke
  - production URL smoke
  - cross-tenant production smoke
- `.env.example`: documented the R28 two-tenant smoke variables:
  - `GENIUS_TENANT_AUTH_FLOW`
  - `GENIUS_TENANT_A_EMAIL`
  - `GENIUS_TENANT_A_PASSWORD`
  - `GENIUS_TENANT_B_EMAIL`
  - `GENIUS_TENANT_B_PASSWORD`
  - `GENIUS_EXPECT_SUPABASE`

Verified:

- Focused ESLint passed for the R27/R28 QA scripts.
- R28 release gate produced a structured report:
  - Report: `qa-artifacts/r28-release/r28-release-gate.json`
  - `requiredPassed: 1`
  - `requiredTotal: 4`
  - `schema_contract`: passed
  - `supabase_rest`: failed with `ENOTFOUND` for `https://fdscrwloptchpozyotiv.supabase.co`
  - `production_url`: failed because `GENIUS_PRODUCTION_BASE_URL` is not set
  - `cross_tenant`: failed because `GENIUS_PRODUCTION_BASE_URL` and two tenant smoke credentials are not set

Blocked / not complete:

- Remote Supabase is still unreachable from the configured `SUPABASE_URL`.
- Remote production URL is not configured.
- Two disposable account-level tenant smoke users are not configured.
- Therefore real Supabase persistence/RLS/cross-tenant production security cannot be claimed yet.

R-29 was completed after this block. Current next exact task is `R-30`: fix production env/deploy inputs, then run `npm.cmd run qa:release` until `ok: true`.

## R-29 Production Env And Live-Ingest Release Gate Hardening

The release gate now checks the production environment contract and live-event ingestion security before investor/demo sign-off. It intentionally fails in the current local environment because production env, deploy URL, and reachable Supabase inputs are still missing or invalid.

Completed:

- `.env.example`: documented `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID` for disposable production live-ingest smoke workspaces.
- `qa-artifacts/r29-release/r29-production-env-doctor.mjs`: added a no-secret-output production env doctor for required keys, recommended keys, secret length checks, tenant-account distinctness, local-store guard, Supabase DNS, and production URL DNS.
- `qa-artifacts/r29-release/r29-live-ingest-production-smoke.mjs`: added a production live-ingest smoke that validates HMAC live tokens, rejects invalid tokens, blocks demo loading through live tokens, and blocks workspace override without a token.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: expanded the aggregate release gate to six required checks:
  - production env doctor
  - local Supabase schema/code contract smoke
  - remote Supabase REST schema smoke
  - remote production URL smoke
  - two-account cross-tenant isolation smoke
  - production live-ingest security smoke

Verified:

- Focused ESLint passed for:
  - `qa-artifacts/r29-release/r29-production-env-doctor.mjs`
  - `qa-artifacts/r29-release/r29-live-ingest-production-smoke.mjs`
  - `qa-artifacts/r28-release/r28-release-gate.mjs`
- R-29 env doctor produced a structured report:
  - Report: `qa-artifacts/r29-release/r29-production-env-doctor.json`
- R-29 release gate produced a structured report:
  - Report: `qa-artifacts/r28-release/r28-release-gate.json`
  - `requiredPassed: 1`
  - `requiredTotal: 6`
  - `schema_contract`: passed
  - `production_env`: failed because production env/deploy inputs are missing and Supabase DNS fails
  - `supabase_rest`: failed with `ENOTFOUND` for `https://fdscrwloptchpozyotiv.supabase.co`
  - `production_url`: failed because `GENIUS_PRODUCTION_BASE_URL` is not set
  - `cross_tenant`: failed because production URL and two tenant smoke credentials are not set
  - `live_ingest`: failed because production URL, live-ingest secret, and live-ingest test workspace id are not set

Blocked / not complete:

- `GENIUS_SESSION_SECRET` is missing and must be at least 32 characters.
- `GENIUS_LIVE_INGEST_SECRET` is missing and must be at least 32 characters.
- `GENIUS_PRODUCTION_BASE_URL` is missing.
- `GENIUS_TENANT_A_EMAIL`, `GENIUS_TENANT_A_PASSWORD`, `GENIUS_TENANT_B_EMAIL`, and `GENIUS_TENANT_B_PASSWORD` are missing.
- `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID` is missing.
- Current Supabase host still fails DNS: `fdscrwloptchpozyotiv.supabase.co`.

R-31 was completed after this block. Current next exact task is `R-32`: run dependency audit if network/registry access is available, then provide deploy inputs and run `npm.cmd run qa:release` until `ok: true`.

## R-30 Release QA Command Shortcuts

The production release checks now have stable npm entrypoints so Gemini/Claude/Antigravity do not need to memorize long artifact paths.

Completed:

- `package.json`: added release QA shortcuts:
  - `npm.cmd run qa:env`
  - `npm.cmd run qa:schema`
  - `npm.cmd run qa:supabase`
  - `npm.cmd run qa:production`
  - `npm.cmd run qa:cross-tenant`
  - `npm.cmd run qa:live-ingest`
  - `npm.cmd run qa:release`

Verified:

- `npm.cmd run qa:schema` passed with `checkedTables: 9`.
- `npm.cmd run qa:env` ran successfully and failed for the expected production input blockers.
- `npm.cmd run qa:release` ran successfully and produced the aggregate six-check release report.

Blocked / not complete:

- `npm.cmd run qa:release` still cannot pass until the production Supabase URL/key, deployment URL, production secrets, two tenant accounts, and live-ingest test workspace id are configured.

## R-31 Route Security Contract And Read Rate Limits

Local route security hardening is complete for the current API surface. This does not replace production WAF/rate limiting, but it prevents obvious unguarded API regressions before deploy.

Completed:

- `app/api/chat/route.js`: added GET rate limiting for chat history reads.
- `app/api/live-events/route.js`: added GET rate limiting for live-event reads.
- `app/api/evidence/export/route.js`: added GET rate limiting for evidence export.
- `app/api/audit/export/route.js`: added GET rate limiting for audit export.
- `qa-artifacts/r31-security/r31-route-security-contract-smoke.mjs`: added a contract smoke that checks:
  - every mutating API handler uses `guardMutationRequest`
  - high-risk GET routes use `applyRateLimit` with the expected key prefix
- `package.json`: added `npm.cmd run qa:security`.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: added `route_security` as a required release-gate step.

Verified:

- Focused ESLint passed for the touched API routes and QA scripts.
- `npm.cmd run qa:security` passed:
  - Report: `qa-artifacts/r31-security/r31-route-security-contract-smoke.json`
  - `checkedRoutes: 33`
  - `checks: 44`
- `npm.cmd run qa:release` now includes `route_security` and produced:
  - `requiredPassed: 2`
  - `requiredTotal: 7`
  - `route_security`: passed
  - `schema_contract`: passed
- Full `npm.cmd run lint` passed.
- Focused `git diff --check` passed for R-31 touched files; CRLF warnings are informational.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- `npm.cmd run qa:release` still cannot pass until production env/deploy/Supabase inputs are configured.
- In-memory rate limits are a local application guard only. Production should still use platform/API gateway/WAF rate limiting for durable multi-instance enforcement.

R-32 was completed after this block. Current next exact task is `R-33`: configure production Supabase/deploy/env inputs and run `npm.cmd run qa:release` until `ok: true`.

## R-32 Dependency Audit Release Gate

Dependency audit is now part of the release gate.

Completed:

- `qa-artifacts/r32-security/r32-dependency-audit.mjs`: added a stable npm audit wrapper that writes a structured report and blocks only high/critical production vulnerabilities.
- `package.json`: added `npm.cmd run qa:deps`.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: added `dependency_audit` as a required release-gate step.

Verified:

- Direct `npm.cmd audit --audit-level=high` passed.
- `npm.cmd run qa:deps` passed:
  - Report: `qa-artifacts/r32-security/r32-dependency-audit.json`
  - high vulnerabilities: `0`
  - critical vulnerabilities: `0`
  - review findings: `2` moderate findings through `next -> postcss`
  - fix available: `false`
- `npm.cmd run qa:release` now includes `dependency_audit` and produced:
  - `requiredPassed: 3`
  - `requiredTotal: 8`
  - `route_security`: passed
  - `dependency_audit`: passed
  - `schema_contract`: passed
- Full `npm.cmd run lint` passed.
- Focused `git diff --check` passed for R-32 touched files; CRLF warnings are informational.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- Moderate `postcss` advisory is recorded for review, but it is not a release blocker under the high/critical gate and currently has no available fix through the installed Next dependency chain.
- `npm.cmd run qa:release` still cannot pass until production env/deploy/Supabase inputs are configured.

R-33 was completed after this block. Current next exact task is `R-34`: configure production Supabase/deploy/env inputs, run `supabase/r27_rls_verification.sql`, then run `npm.cmd run qa:release` until `ok: true`.

## R-33 Live-Event Idempotency Contract

Live-event ingestion now supports explicit retry idempotency for external webhooks and connector retries.

Completed:

- `app/api/live-events/route.js`: added support for `x-idempotency-key` and body-level `idempotencyKey`.
- `app/api/live-events/route.js`: idempotency keys are hashed with the workspace id; raw idempotency keys are not returned.
- `app/api/live-events/route.js`: idempotent requests write deterministic `live-idem-*` event ids, so retries upsert rather than append duplicate live events.
- `app/api/live-events/schema/route.js`: documented idempotency behavior in the live-event schema endpoint.
- `lib/server/live-events.js`: added `idempotencyKey` to the sample payload.
- `qa-artifacts/r31-security/r31-route-security-contract-smoke.mjs`: expanded route security contract checks for live-event bounds, token auth, and idempotency.
- `qa-artifacts/r33-security/r33-live-event-idempotency-smoke.mjs`: added a bundler-independent static idempotency contract smoke.
- `package.json`: added `npm.cmd run qa:live-idempotency`.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: added `live_idempotency` as a required release-gate step.

Verified:

- Focused ESLint passed for touched live-event route/schema/source and QA scripts.
- `npm.cmd run qa:security` passed:
  - `checks: 49`
- `npm.cmd run qa:live-idempotency` passed:
  - Report: `qa-artifacts/r33-security/r33-live-event-idempotency-smoke.json`
  - `checks: 11`
- `npm.cmd run qa:release` now includes `live_idempotency` and produced:
  - `requiredPassed: 4`
  - `requiredTotal: 9`
  - `route_security`: passed
  - `dependency_audit`: passed
  - `live_idempotency`: passed
  - `schema_contract`: passed
- Full `npm.cmd run lint` passed.
- Focused `git diff --check` passed for R-33 touched files; CRLF warnings are informational.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- Production live-ingest smoke still cannot run until `GENIUS_PRODUCTION_BASE_URL`, `GENIUS_LIVE_INGEST_SECRET`, and `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID` are configured.

R-34 was completed after this block. Current next exact task is `R-35`: configure production Supabase/deploy/env inputs, run `supabase/r27_rls_verification.sql`, then run `npm.cmd run qa:release` until `ok: true`.

## R-34 Recovery Runbook And Backup/Restore Gate

Production recovery documentation and a local recovery contract smoke are now part of the release gate.

Completed:

- `docs/GENIUS_PRODUCTION_RECOVERY_RUNBOOK.md`: added release-candidate operating guide for:
  - release gate commands
  - owners
  - RPO/RTO targets
  - portable workspace backup drill
  - Supabase restore drill
  - rollback procedure
  - incident response checklist
  - current production blockers
  - required QA evidence files
- `qa-artifacts/r34-recovery/r34-recovery-runbook-smoke.mjs`: added a smoke that verifies the runbook is connected to real product contracts:
  - portable export/import route exists
  - portable route is capability-gated
  - portable route uses private/no-store cache headers
  - portable export/import redaction helpers exist
  - Supabase workspace backup surface exists
  - RLS verification file exists
  - recovery npm script exists
- `package.json`: added `npm.cmd run qa:recovery`.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: added `recovery_runbook` as a required release-gate step.

Verified:

- Focused ESLint passed for the R-34 QA script and release gate.
- `npm.cmd run qa:recovery` passed:
  - Report: `qa-artifacts/r34-recovery/r34-recovery-runbook-smoke.json`
  - `checks: 14`
- `npm.cmd run qa:release` now includes `recovery_runbook` and produced:
  - `requiredPassed: 5`
  - `requiredTotal: 10`
  - `route_security`: passed
  - `dependency_audit`: passed
  - `live_idempotency`: passed
  - `recovery_runbook`: passed
  - `schema_contract`: passed
- Full `npm.cmd run lint` passed.
- Focused `git diff --check` passed for R-34 touched files; CRLF warnings are informational.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- This is a local recovery contract and runbook gate. Real restore cannot be fully verified until a reachable Supabase production/staging project and deployment URL are configured.

R-35 was completed after this block. Current next exact task is `R-36`: configure production Supabase/deploy/env inputs, run `supabase/r27_rls_verification.sql`, then run `npm.cmd run qa:release` until `ok: true`.

## R-35 Observability Contract Gate

Production observability/readiness documentation and a local observability contract smoke are now part of the release gate.

Completed:

- `docs/GENIUS_PRODUCTION_OBSERVABILITY_RUNBOOK.md`: added production monitoring guide for:
  - required checks
  - primary health surfaces
  - monitor signals
  - alert thresholds
  - post-deploy smoke
  - incident triage
  - known current observability limitations
- `qa-artifacts/r35-observability/r35-observability-contract-smoke.mjs`: added a smoke that verifies:
  - observability runbook exists and references key health surfaces
  - `/api/readiness` exposes score/status/backend/metrics/items/sections and markdown export
  - `/api/diagnostics` exposes monitoring payloads
  - production URL smoke checks readiness
  - release gate includes observability
  - package script exists
- `package.json`: added `npm.cmd run qa:observability`.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: added `observability_contract` as a required release-gate step.

Verified:

- Focused ESLint passed for the R-35 QA script and release gate.
- `npm.cmd run qa:observability` passed:
  - Report: `qa-artifacts/r35-observability/r35-observability-contract-smoke.json`
  - `checks: 14`
- `npm.cmd run qa:release` now includes `observability_contract` and produced:
  - `requiredPassed: 6`
  - `requiredTotal: 11`
  - `route_security`: passed
  - `dependency_audit`: passed
  - `live_idempotency`: passed
  - `recovery_runbook`: passed
  - `observability_contract`: passed
  - `schema_contract`: passed
- Full `npm.cmd run lint` passed.
- Focused `git diff --check` passed for R-35 touched files; CRLF warnings are informational.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- External APM/log drains are not wired in this repository. Deployment-provider logs/metrics must be used until a production observability integration is assigned.
- Production observability cannot be fully verified until a deployment URL and production Supabase project are configured.

## R-36 Deployment Handoff Gate

The deployment handoff is now explicit and testable. This gives Gemini, Claude, Antigravity, or a human deployer one source of truth for the exact production inputs and verification sequence needed to move the release gate from local-ready to production-ready.

Completed:

- `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`: added the production deployment handoff covering:
  - current gate status and expected blockers
  - required env variables
  - production env rules
  - Supabase schema/RLS setup
  - deployment steps
  - acceptance criteria
  - failure handling
  - Gemini/Claude/Antigravity handoff instructions
- `qa-artifacts/r36-deployment/r36-deployment-handoff-smoke.mjs`: added a smoke that verifies:
  - the deployment handoff exists
  - all required env keys are documented in the handoff and `.env.example`
  - Supabase/schema/RLS instructions are linked
  - recovery and observability runbooks are present
  - release gate includes `deployment_handoff`
  - package script exists
- `package.json`: added `npm.cmd run qa:deployment`.
- `qa-artifacts/r28-release/r28-release-gate.mjs`: added `deployment_handoff` as a required release-gate step.

Verified:

- Focused ESLint passed for the R-36 QA script and release gate.
- `npm.cmd run qa:deployment` passed:
  - Report: `qa-artifacts/r36-deployment/r36-deployment-handoff-smoke.json`
  - `checks: 15`
- `npm.cmd run qa:release` now includes `deployment_handoff` and produced:
  - `requiredPassed: 7`
  - `requiredTotal: 12`
  - `route_security`: passed
  - `dependency_audit`: passed
  - `live_idempotency`: passed
  - `recovery_runbook`: passed
  - `observability_contract`: passed
  - `deployment_handoff`: passed
  - `schema_contract`: passed
- Focused `git diff --check` passed for R-36 touched files; CRLF warnings are informational.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- `production_env`: missing production secrets, deployment URL, tenant smoke accounts, and reachable Supabase DNS.
- `supabase_rest`: configured Supabase target still returns DNS `ENOTFOUND`; this was rechecked with external network access through `npm.cmd run qa:supabase`, so the configured project URL must be corrected or restored.
- `production_url`: `GENIUS_PRODUCTION_BASE_URL` is not set.
- `cross_tenant`: production URL and two disposable tenant credentials are not set.
- `live_ingest`: production URL, live ingest secret, and live ingest test workspace id are not set.

## R-37 Production Env Doctor Hardening

The production env doctor now matches the deployment handoff instead of checking only a partial subset of required inputs.

Completed:

- `qa-artifacts/r29-release/r29-production-env-doctor.mjs`: expanded required production input checks to include:
  - `GEMINI_MODEL`
  - `SUPABASE_AUTH_KEY`
  - `SUPABASE_EVIDENCE_BUCKET`
  - `GENIUS_ALLOW_LOCAL_AUTH`
  - `GENIUS_TENANT_AUTH_FLOW`
  - `GENIUS_LIVE_INGEST_TEST_WORKSPACE_ID`
  - `GENIUS_EXPECT_SUPABASE`
- Added value validation for:
  - `GENIUS_ALLOW_LOCAL_AUTH=0`
  - `GENIUS_EXPECT_SUPABASE=1`
  - `GENIUS_TENANT_AUTH_FLOW=signin|signup`
  - `GENIUS_FORCE_LOCAL_STORE` not being `1`
  - 32+ character session/live-ingest secrets when present
- Added `nextActions` to the env-doctor JSON/stderr output so the next operator sees exact external actions without exposing secret values.
- Removed duplicate missing/invalid actions for the same env key.

Verified:

- Focused ESLint passed for the hardened env doctor and release gate.
- `npm.cmd run qa:env` ran and failed only on expected production input blockers. The report now includes actionable `nextActions`.
- `npm.cmd run qa:release` still produced:
  - `requiredPassed: 7`
  - `requiredTotal: 12`
  - local passing gates unchanged: `route_security`, `dependency_audit`, `live_idempotency`, `recovery_runbook`, `observability_contract`, `deployment_handoff`, and `schema_contract`
- Focused `git diff --check` passed for R-37 touched files.
- `npm.cmd run qa:deployment` passed after the handoff update.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 35 routes.

Blocked / not complete:

- Real production env values are still not supplied.
- Current configured Supabase target still returns `ENOTFOUND`.
- Production URL, tenant smoke credentials, and live-ingest test workspace id are still missing.

Next exact task: configure production Supabase/deploy/env inputs, run `supabase/r27_rls_verification.sql`, then run `npm.cmd run qa:release` until `ok: true`.

## R-38 Workbench Artifact Binding

AI Workbench structured-response actions now persist to the shared workspace instead of ending at toast-only local UI.

Completed:

- Added normalized `workspaceArtifacts` state and server-side artifact persistence.
- Added `/api/workbench/artifacts` with same-origin mutation guard, body limit, rate limiting, session auth, and `ask_ai` capability enforcement.
- Workbench executive summaries now save as artifacts and project into `reports` as `report-{artifactId}`.
- Workbench negotiation plans and approval workflows now save as artifacts and project into approval-safe `actions` with `externalExecution.enabled=false`.
- Workbench alternative selection now saves as an `alternative_analysis` artifact without auto-creating an approval action.
- AI Chat now shows the structured Workbench response for analysis prompts and passes artifact persistence into the drawers/modals.
- Workbench context panel now lists saved Workbench artifacts and routes them to Reports, Approvals, or Chat by artifact type.
- Removed the external `transparenttextures.com` image dependency from the landing page so the existing strict CSP no longer logs a blocked-image console error.

Verified:

- Focused ESLint passed for all touched Workbench/server files and the landing CSP fix.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated 36 routes, including `/api/workbench/artifacts`.
- Production smoke passed on a temporary `next start` server with local test env:
  - landing page loaded
  - no Next.js overlay
  - guest workspace creation returned `200`
  - workspace loaded
  - executive summary artifact save returned `200`
  - negotiation plan artifact save returned `200`
  - summary artifact projected into Reports
  - negotiation artifact projected into a `Needs review` approval-safe action
  - workspace artifact count became `2`
  - browser console errors were `[]`

Blocked / not complete:

- This does not solve external production blockers. Real production env values, reachable Supabase, deployment URL, tenant smoke credentials, and live-ingest test workspace id remain outside this local code pass.
- Gemini should still use `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md` for the production env/Supabase/deploy track.

Next exact task: continue remaining product wiring where visible controls still have intentional locks, or hand production env/Supabase/deploy to Gemini and run `npm.cmd run qa:release` after real inputs exist.

## R-39 AI Gateway Decision Note Persistence

The CEO / AI Gateway Notes tab no longer stores human notes only in component state.

Completed:

- `PATCH /api/operations/reports/[id]` now supports note-only updates when `note` is provided and `status` is empty.
- `updateGatewayOperationReport` writes note-only updates into the selected gateway report `auditTrail` with `type: note_added`.
- Workspace audit log now records `gateway_report_note_added`.
- AI Gateway `NotesTab` now reads persisted notes from `report.auditTrail` instead of keeping them in local-only state.
- AI Gateway `AuditLogTab` now includes persisted gateway report events before its static context rows.
- Saving a note does not change the report status.

Verified:

- Focused ESLint passed for `app/api/operations/reports/[id]/route.js`, `lib/server/evidence-store.js`, `components/genius/workspace-context.jsx`, `components/genius/sections/ai-gateway.jsx`, and `components/genius/sections/ai-gateway/tabs.jsx`.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production smoke passed on a temporary `next start` server with local test env:
  - guest workspace creation `200`
  - Team CRM gateway report creation `200`
  - note-only gateway report PATCH `200`
  - report remained `Pending AI Review`
  - report `auditTrail` contained the `note_added` event
  - workspace `auditLog` contained `gateway_report_note_added`

Blocked / not complete:

- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue high-value local persistence gaps only; leave billing, real connector credentials, external execution, MFA/provider management, and production deploy/Supabase for the Gemini/deployment track.

## R-40 B2B Bridge Discussion Metadata Persistence

B2B Bridge channel metadata no longer disappears after reload for new/pin/archive discussion actions.

Completed:

- Added normalized `operations.b2bThread.discussions` state.
- Added `normalizeB2bDiscussion` for import/export/public workspace snapshots.
- Added `updateB2bDiscussion` server helper with audit events for `upsert`, `pin`, `unpin`, `archive`, and `restore`.
- Extended `PATCH /api/operations/b2b` with `action: "update_discussion"` guarded by `send_b2b_message`; approval status updates still require `approve_b2b_workflow`.
- Added `updateB2bDiscussion` to `WorkspaceProvider`.
- B2B Bridge now derives pinned/unpinned/archived/restored state from persisted workspace discussions.
- ChannelList now receives persisted custom discussions instead of owning local-only created channels.

Verified:

- Focused ESLint passed for B2B route, workspace state, evidence store, workspace context, B2B Bridge, and ChannelList.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production API smoke passed on a temporary `next start` server with local test env:
  - landing page loaded
  - guest workspace created
  - session validated
  - custom discussion `upsert` returned `200`
  - `pin`, `archive`, and `restore` returned `200`
  - final workspace snapshot contained the discussion with `local=true`, `pinned=true`, `archived=false`
  - workspace audit log contained `4` B2B discussion events
- Full browser smoke was attempted, but local project dependencies do not include Playwright and bundled Playwright is missing `playwright-core`; no package install was performed.

Blocked / not complete:

- Secondary-channel messages are handled in R-41 below.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue another high-value local persistence gap or final investor click-path QA; leave real partner accounts, external execution, billing, MFA/provider management, and production deploy/Supabase for the Gemini/deployment track.

## R-41 B2B Bridge Secondary Thread Persistence

B2B Bridge secondary/demo channels now persist their messages, internal notes, invite logs, acknowledgements, and workflow decisions in workspace state.

Completed:

- Added normalized `operations.b2bThread.discussionThreads` state.
- Added `normalizeB2bThreadMessage` and `normalizeB2bDiscussionThread` for import/export/public workspace snapshots.
- Extended `appendB2bThreadMessage` so a non-primary `discussionId` writes into a scoped `discussionThread` instead of the primary invoice thread.
- Extended `updateB2bWorkflowStatus` so a non-primary `discussionId` updates the scoped thread workflow status and appends a scoped system message.
- `sendB2bMessage` and `updateB2bWorkflowStatus` in `WorkspaceProvider` now accept `discussionId`.
- B2B Bridge now reads secondary messages/workflow status from `discussionThreads` instead of local React state.
- Secondary channel seed messages now truthfully state that workspace persistence is enabled while external partner delivery remains locked.

Verified:

- Focused ESLint passed for B2B route, workspace state, evidence store, workspace context, B2B Bridge, and ChannelList.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production API smoke passed on a temporary `next start` server with local test env:
  - landing page loaded
  - guest workspace created
  - session validated
  - secondary discussion created
  - secondary external message persisted
  - secondary internal note persisted
  - secondary workflow status persisted as `Approved`
  - scoped thread contained `3` messages
  - secondary messages did not leak into the primary invoice thread
  - workspace audit log contained `3` scoped B2B thread events

Blocked / not complete:

- Real external partner delivery, partner accounts, participant access rules, and cross-company data sharing are still intentionally locked until the production partner model is designed.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: run final investor click-path QA or continue another high-value persistence gap such as Support ticket comment/attachment polish; leave real partner accounts, external execution, billing, MFA/provider management, and production deploy/Supabase for the Gemini/deployment track.

## R-42 Investor Click-Path QA Smoke

The core investor-demo backend path is now covered by a repeatable local smoke script.

Completed:

- Added `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`.
- Added `npm.cmd run qa:investor`.
- The smoke creates a guest workspace and verifies:
  - main screen response;
  - guest auth/session validation;
  - Support ticket creation, comment persistence, and attachment-reference persistence;
  - B2B secondary discussion metadata, scoped messages, internal notes, and approval state;
  - Workbench executive summary artifact persistence;
  - Team CRM report creation;
  - Gateway note-only audit persistence;
  - final `/api/workspace` snapshot consistency;
  - required audit-log events across the investor-demo write path.
- The smoke writes a redacted JSON report to `qa-artifacts/r42-investor/r42-investor-click-path-smoke.json` without storing session cookies or auth tokens.

Verified:

- Focused ESLint passed for `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`.
- First production smoke without `GENIUS_SESSION_SECRET` failed safely with `GENIUS_SESSION_SECRET is required in production`, confirming the production guard remains active.
- Production smoke passed on a temporary `next start` server with a child-process-only local test session secret:
  - `18` checks passed;
  - guest workspace was created and validated;
  - support ticket had persisted comment and attachment reference;
  - B2B secondary scoped thread had `3` messages and `workflowStatus: Approved`;
  - no secondary B2B message leaked into the primary invoice thread;
  - Workbench artifact and Gateway report note persisted;
  - audit log contained all required investor-demo write events.

Blocked / not complete:

- This does not replace browser visual QA. If Antigravity changes final layouts, rerun visual/zoom smoke.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue remaining visible UI/subsection binding gaps, then rerun `npm.cmd run qa:investor` and the focused visual path before handing production env/Supabase/deploy to Gemini.

## R-43 Team CRM Checklist Persistence And Investor Smoke Extension

Team Operations CRM task progress is now connected to the existing CRM task persistence API instead of staying only in the slide-over panel state.

Completed:

- `components/genius/sections/team-crm/task-panel.jsx`: checklist state now initializes from the selected task's persisted `checklist/progress` summary.
- Checklist toggles call `updateCrmTask` and persist updated `checklist`, `progress`, and `comments` through `/api/operations/crm-tasks`.
- Failed checklist saves roll back the optimistic checkbox state and show a toast.
- `components/genius/sections/team-crm.jsx`: task panel updates are merged back into board state, and drag/drop now merges the normalized API response after saving.
- Task panel remounts by `task.id`, avoiding React 19 `set-state-in-effect` patterns.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now also verifies CRM task creation, update, list readback, final workspace persistence, and CRM audit events.

Verified:

- Focused ESLint passed for Team CRM files and `/api/operations/crm-tasks`.
- Focused ESLint passed for the investor QA script.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `22` checks:
  - CRM task created;
  - CRM task updated to `review`;
  - CRM task list reflected `checklist: 4/7` and `progress: 57`;
  - final workspace snapshot retained the CRM board task;
  - audit log included `crm_task_created` and `crm_task_updated`.

Blocked / not complete:

- This does not add real binary attachment upload or editable per-item checklist storage; it persists the operational checklist summary that the current API supports.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue final visible UI binding gaps, then rerun `npm.cmd run qa:investor` and visual/zoom QA if Antigravity changes layouts.

## R-44 Investor Smoke Demo Reset And Diagnostics Workflow Coverage

The investor click-path smoke now starts from the same deterministic demo state used in the live presentation and verifies Diagnostics workflow persistence.

Completed:

- Extended `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs` to call `/api/demo/reset` with `confirm: "load-investor-demo"` after guest session validation.
- Added Diagnostics API coverage:
  - `GET /api/diagnostics` must return demo categories;
  - `PATCH /api/diagnostics` updates a category to `Review`;
  - owner/ownerRole are assigned to `QA Diagnostics / Investor Demo`;
  - final `/api/workspace` snapshot must retain the diagnostic workflow override;
  - audit log must contain `diagnostic_workflow_updated`.

Verified:

- Focused ESLint passed for the investor QA script.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `26` checks:
  - guest auth and investor demo reset;
  - Diagnostics workflow update;
  - Support comment/attachment persistence;
  - Team CRM task create/update/list persistence;
  - B2B secondary scoped thread persistence;
  - Workbench artifact persistence;
  - Team CRM to Gateway report creation;
  - Gateway note persistence;
  - final workspace and audit-log consistency.

Blocked / not complete:

- This remains an API-level smoke, not visual QA.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: keep using `npm.cmd run qa:investor` after any Antigravity/UI binding changes; rerun browser/zoom QA once final layouts are changed.

## R-45 Diagnostics Archive Binding

Diagnostics detail-menu archive is now wired to the existing workflow persistence layer instead of showing a locked placeholder.

Completed:

- `components/genius/sections/diagnostics.jsx`: the detail-panel `Archive` action now calls `updateDiagnosticWorkflow` with `status: "Closed"`.
- Archive respects `decide_approvals` capability and the existing loading/disabled state.
- The selected diagnostics row updates optimistically to `Closed` after a successful archive call.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now archives the demo diagnostic after the Review/owner assignment step and verifies final workspace persistence.

Verified:

- Focused ESLint passed for Diagnostics and the investor QA script.
- Full `npm.cmd run build` passed on Next.js `16.2.10`.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `27` checks:
  - Diagnostics workflow update to `Review`;
  - Diagnostics archive persisted as `Closed`;
  - final workspace retained the assigned owner and `Closed` workflow status;
  - full investor API path still passed.

Blocked / not complete:

- Archive is represented as the existing `Closed` workflow state; no separate deleted/hidden archive collection is created.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue visible UI binding gaps that can use existing safe APIs; rerun `npm.cmd run qa:investor` after each investor-path change.

## R-46 Data Intake To Excel Workspace Investor Smoke Coverage

The investor smoke now proves the Data Intake spreadsheet path at row level instead of only validating generalized workspace spend state.

Completed:

- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: uploads a bounded CSV evidence file through `/api/evidence`.
- The smoke verifies that the evidence parser extracts `3` real spreadsheet rows from CSV headers including vendor, invoice number, amount, currency, category, description, date, and owner.
- The smoke saves an Excel Workspace view through `/api/excel-workspace` using the parsed row IDs, filters, and metrics.
- The final `/api/workspace` snapshot must retain both the uploaded spreadsheet rows and the saved Excel Workspace view.
- Audit coverage now requires `evidence_uploaded` and `excel_workspace_view_saved` in addition to the existing investor-demo write events.

Verified:

- Focused ESLint passed for the investor QA script.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `33` checks:
  - CSV evidence upload;
  - row-level spreadsheet parsing;
  - Excel Workspace saved-view persistence;
  - final workspace retained uploaded rows and selected Excel view metrics;
  - full investor API path still passed.

Blocked / not complete:

- This remains API-level verification; visual/zoom QA is still required after final Antigravity design changes.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue remaining visible UI button/subsection binding gaps that can use existing APIs; rerun `npm.cmd run qa:investor` after each investor-path change.

## R-47 Reports To Team CRM Backlog Binding

Reports now turns a visible finding action into a real Team CRM backlog task instead of showing a locked placeholder.

Completed:

- `components/genius/sections/reports.jsx`: `Add to backlog` creates or updates a stable CRM task through the existing `createCrmTask` workspace method and `/api/operations/crm-tasks`.
- Backlog task IDs are deterministic from report and finding context, so repeated clicks update the same task instead of creating duplicates.
- The saved task carries report ID, finding/action/evidence/proof context through navigation, priority derived from severity, and a backlog status.
- `components/genius/sections/team-crm.jsx`: accepts initial `taskId` / `crmTaskId` focus context so a task created from Reports can open selected in Team Operations CRM.

Verified:

- Focused ESLint passed for Reports and Team CRM.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all `36` static/dynamic app routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `33` checks.

Blocked / not complete:

- Browser click QA for the exact Reports button is still needed after final Antigravity design changes; current verification proves compile/runtime safety and the existing Team CRM API path.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue visible UI button/subsection binding gaps that can use existing APIs; good candidates are remaining Reports utility actions, Support file references, or Connectors non-credential utilities.

## R-48 Support Attachment File Metadata Binding

Support ticket attachment selection now works as a real local metadata flow instead of a decorative file button.

Completed:

- `components/genius/sections/support.jsx`: `Choose file` opens a hidden file picker for PNG, JPG/JPEG, and PDF files up to `10MB`.
- Selected file metadata populates the existing attachment reference draft with name, MIME type, size, and a support note.
- When a new ticket is created with a selected file, Support automatically saves the attachment reference to the created ticket through the existing `addSupportTicketAttachment` / `/api/support/tickets` contract.
- Existing ticket attachment references now pass through stored `type` and `size` instead of always using a generic `reference` type.
- Binary file upload/storage remains intentionally out of scope; this slice stores safe reference metadata only.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now verifies support attachment `type/size` in the support ticket list and final workspace snapshot.

Verified:

- Focused ESLint passed for Support and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all `36` static/dynamic app routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `35` checks.

Blocked / not complete:

- Real binary upload/storage for support files remains a later security/storage slice.
- Browser click QA for the exact file picker should be rerun after final Antigravity design changes.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue visible UI button/subsection binding gaps that can use existing APIs; good candidates are remaining Reports utility actions or Connectors non-credential utilities.

## R-49 Connectors Event Stream Filter And Pause Binding

Connectors Event Stream controls now work locally instead of behaving like placeholders.

Completed:

- `components/genius/sections/connectors.jsx`: active filter rules now filter the visible Event Stream table by amount, status, source, type, customer, order/ref, or ingestion fields.
- `Pause` now freezes the currently loaded stream rows and switches to `Resume`; resuming returns to the live workspace/demo rows.
- `View all events` disables active filter rules for the current view instead of showing a locked historical-backfill placeholder.
- Empty filtered results show a clear table state.
- Existing `Save filters` persistence still writes through `/api/connectors`; R-49 adds the missing visible behavior on top of that persisted contract.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now saves connector filters, verifies connector state readback, verifies final workspace persistence, and requires `connector_filters_saved` in the audit log.

Verified:

- Focused ESLint passed for Connectors and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all `36` static/dynamic app routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `38` checks.

Blocked / not complete:

- Filter rules are UI/workspace preferences; they do not alter external webhook ingestion or production sync jobs.
- Historical backfill, credential manager, retry queue execution, and secret rotation remain production credential/security work.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: continue the final local investor UX/button pass only for newly changed Antigravity UI, or move production env/Supabase/deploy through the deployment handoff.

## R-50 Reports Duplicate Draft Binding

Reports `Duplicate report` now writes a real local draft instead of behaving like a placeholder.

Completed:

- `components/genius/sections/reports.jsx`: `Duplicate report` now creates a one-time markdown report schedule draft through the existing `createReportSchedule` workspace method.
- The button uses the same `export_data` permission gate as report publish/schedule/export actions.
- The UI shows a loading state while the duplicate draft is saved and then surfaces the new schedule in the existing Latest schedule panel.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now loads `/api/reports`, creates a duplicate report draft through `/api/reports/schedules`, verifies schedule list readback, verifies final workspace persistence, and requires `report_schedule_draft_created` in the audit log.

Verified:

- Focused ESLint passed for Reports and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all `36` static/dynamic app routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `42` checks.

Blocked / not complete:

- This creates a local workspace report-pack draft; it does not send board emails or publish to an external board portal.
- Exact browser-click QA for the Reports button should be rerun after final Antigravity design changes.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: run final visual/browser QA after Antigravity design changes, then hand production env/Supabase/deploy to Gemini/Claude using the production deployment handoff.

## R-51 Excel Workspace Column Visibility Binding

Excel Workspace `Columns` now works as a real local spreadsheet control and persists with saved views.

Completed:

- `components/genius/sections/excel-workspace.jsx`: replaced the locked `Columns` button with a dropdown of toggleable data columns.
- The table header/body now render from the selected visible-column model instead of hardcoded cells.
- The UI prevents hiding every data column.
- Saved views now include `visibleColumnIds`, and loading the latest saved view restores the selected column set.
- `lib/server/workspace-state.js`: normalizes `visibleColumnIds` against a fixed allowlist and falls back to the full default column set when input is empty or invalid.
- `app/api/excel-workspace/route.js`: includes `visibleColumnIds` in view summaries.
- `qa-artifacts/r42-investor/r42-investor-click-path-smoke.mjs`: investor smoke now saves a view with five visible columns, verifies list readback, and verifies final workspace persistence.

Verified:

- Focused ESLint passed for Excel Workspace, `/api/excel-workspace`, workspace-state, and the investor QA script.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all `36` static/dynamic app routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `44` checks.

Blocked / not complete:

- Workbook/sheet switching still stays local/locked until a multi-workbook persistence model exists.
- Browser-click QA for the dropdown should be rerun after final Antigravity design changes.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: final visual/browser QA after Antigravity design changes, or hand production env/Supabase/deploy to Gemini/Claude using the production deployment handoff.

## R-52 Excel Workspace Row Lineage Expansion

Excel Workspace proof-trail row expansion now works locally instead of showing a locked placeholder.

Completed:

- `components/genius/sections/excel-workspace.jsx`: proof-trail expand/collapse buttons now maintain local expanded-row state.
- Expanded rows show source evidence name/status, row description, category, owner, impact, confidence, and action status.
- Expanded lineage rows include quick navigation buttons for Evidence, Report, and Approval context.
- Workspace-backed proof-trail rows now carry evidence/finding/action ids and row metadata into the lineage panel.
- Demo fallback proof rows still render safely even without workspace ids.

Verified:

- Focused ESLint passed for Excel Workspace.
- Full `npm.cmd run lint` passed.
- Full `npm.cmd run build` passed on Next.js `16.2.10` and generated all `36` static/dynamic app routes.
- `git diff --check` passed; CRLF warnings are informational.
- Production `next start` smoke with a temporary child-process-only session secret passed `npm.cmd run qa:investor` with `44` checks.

Blocked / not complete:

- This is local UI lineage expansion; no new backend persistence was needed.
- Exact browser-click QA for the expand/collapse control should be rerun after final Antigravity design changes.
- Production env/Supabase/deploy blockers remain unchanged and still belong to the deployment handoff track.

Next exact task: final visual/browser QA after Antigravity design changes, or continue only safe local controls that already have data contracts.
