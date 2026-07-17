# GENIUS Full Product Execution Plan

Status: execution source of truth
Fixed: 2026-07-10
Release candidate target: 2026-07-18
Production-hardening target: 2026-07-25
Primary readers: Product Owner, Codex, Gemini, Antigravity, and future engineers

## 1. Purpose

This file is the implementation contract for completing GENIUS as a working Full Product V1. It is not a feature wishlist and it is not permission to replace the existing design.

The name GENIUS was chosen because the product is a new, expanded, unique operating system that brings together the capabilities a business needs to detect risks, understand evidence, coordinate decisions, and work with supervised AI in one place.

The delivery is split into two hard milestones:

- July 18: release candidate with every current section usable, all core workflows persisted, and no dead controls.
- July 25: production candidate with tenant isolation, security gates, end-to-end tests, observability, recovery procedures, and deployment verification complete.

If a release gate fails, the milestone is not complete. A toast, demo-only state, static table, or visually clickable control does not count as implemented functionality.

## 2. Product Outcome

GENIUS is an AI-powered B2B business operating system. It receives business evidence, extracts structured facts, detects money leaks and operational risks, prepares evidence-backed actions, routes decisions to humans, and produces reports without allowing AI to execute sensitive external actions autonomously.

The product promise is:

> GENIUS finds where a business is losing money or control, proves the issue with evidence, prepares the next action, and keeps a human responsible for the final decision.

The first production customer profile is a 10-200 employee B2B company with contracts, invoices, SaaS spend, operational reports, and fragmented approval workflows.

## 3. Definition Of Full Product V1

Full Product V1 means all of the following are true:

- A visitor can understand the product before registration.
- A user can register without providing a name.
- Registration requires role, position, department/section, workspace name, company size, and business type.
- A registered user is redirected into the correct isolated workspace.
- The user can upload supported evidence, analyze a public URL, review extracted fields, and confirm or reject evidence.
- Confirmed evidence creates normalized business facts, findings, recommended actions, diagnostics, and reports.
- Agents run as supervised workflows and record their inputs, outputs, status, model, prompt version, and audit events.
- Approvals support approve, reject, edit, delegate, snooze, reopen, and mark-done transitions according to permissions.
- AI Chat answers from the current workspace only, cites internal evidence IDs, and labels uncertainty.
- Team Operations CRM, CEO AI Gateway, and B2B Bridge persist their workflows and audit decisions.
- Reports and exports contain real workspace data.
- Settings, profile, support, notifications, and connector states have real behavior or an explicit production-safe locked state.
- Every visible action is classified as working, intentionally locked, or unavailable due to a recoverable error.
- Every mutation is authenticated, authorized, workspace-scoped, validated, and audited when sensitive.
- The full critical path passes automated end-to-end tests against production-like Supabase configuration.

External writes to email, Slack, CRM, banking, accounting, or vendor systems are not required for Full Product V1 unless credentials and explicit product approval are available. Their UI may remain intentionally locked, but the lock must explain the prerequisite and must never simulate success.

## 4. Scope Freeze

The release scope freezes on 2026-07-11. Until July 25, do not add unrelated modules, redesign the navigation, replace the visual system, or introduce autonomous external execution.

Included:

- Landing page.
- Email/password authentication and onboarding.
- Workspace and profile.
- Command Center.
- Data Intake and Evidence Engine.
- Diagnostics.
- Savings Radar.
- Agents.
- Approvals.
- AI Chat.
- Reports.
- Excel Workspace.
- Connectors and live events.
- CEO AI Gateway.
- Team Operations CRM.
- Multi-Business OS / B2B Bridge.
- Support / FAQ.
- Settings, security, audit, notifications, export, reset, and sign out.

Excluded until after July 25 unless already production-ready:

- Native mobile applications.
- Autonomous vendor communication.
- Autonomous financial transactions.
- Native accounting, banking, CRM, Slack, Gmail, or calendar integrations without approved credentials.
- Billing and subscription charging unless the Product Owner explicitly adds Stripe scope.
- SSO, SCIM, and enterprise compliance certification.

## 5. Current Repository Baseline

Observed on 2026-07-10:

- Next.js `16.2.4`, React `19.2.4`, App Router, JavaScript/JSX.
- Landing page, login flow, `/workspace`, App Shell, and 16 workspace section components exist.
- A single `WorkspaceProvider` is the current frontend data gateway.
- Route Handlers exist for workspace, evidence, review, actions, reports, agents, chat, diagnostics, live events, notifications, exports, and operations.
- Gemini extraction and streaming chat integrations exist with local fallback behavior.
- Local JSON persistence and a Supabase adapter exist.
- Supabase migrations exist for the initial evidence, entity, action, report, and audit tables.
- Operations state and APIs exist for Team CRM, CEO Gateway, and B2B Bridge.
- Lint and production build passed at the last completed checkpoint.
- The current working tree contains a large uncommitted implementation pass and must not be reset.

Known production gaps:

- `getRequestWorkspaceContext()` currently falls back to a default workspace when no valid session exists. This is unacceptable for production APIs.
- The signed application cookie is not a complete refresh-token, revocation, and server-side session solution.
- `GENIUS_SESSION_SECRET`, Supabase auth key, storage bucket, and production-only controls are missing from `.env.example`.
- RLS is not complete for every table and the service-role backend bypasses RLS by design.
- Operations, members, roles, notifications, connectors, support tickets, and agent runs are not fully normalized in the production schema.
- Several UI controls still produce placeholder toasts or static demo responses.
- XLS/XLSX/DOC/DOCX are accepted, but the current extraction path does not reliably parse their content before analysis.
- Gemini JSON is parsed but not validated against strict versioned schemas.
- URL analysis validates the initial host, but redirect targets must be revalidated per hop to close SSRF bypasses.
- No automated unit, integration, or Playwright end-to-end test suite is configured in `package.json`.
- No production observability, rate limiting, backup restore drill, or incident runbook is complete.

## 6. Architecture Contract

All agents must preserve these boundaries.

### 6.1 Frontend

- Keep App Router pages thin.
- Keep interactive workspace sections as Client Components.
- Use the existing App Shell and design tokens.
- Use `WorkspaceProvider` as the primary client state gateway.
- Do not fetch Supabase directly from section components.
- Do not duplicate workspace state inside multiple sections when it belongs in the provider.
- Every async operation must expose pending, success, empty, and recoverable error states.

### 6.2 API

- Route Handlers are the public application boundary.
- Every private handler must call a strict authenticated context helper.
- Every mutation must validate the input schema before calling a service.
- Route Handlers must stay small: parse, authenticate, authorize, call service, serialize response.
- Never trust `workspaceId`, user ID, role, or actor identity from request bodies.
- Never return service-role keys, provider secrets, raw model prompts containing secrets, or Supabase tokens.

### 6.3 Domain And Persistence

- Keep business rules in `lib/server`, not React components.
- Preserve the existing storage adapter boundary so local development remains possible.
- Supabase is the production persistence adapter.
- Normalized tables are the production source of truth.
- The JSON workspace snapshot may remain as a compatibility/read-model cache during this release, but new production entities must also have normalized persistence.
- Every record must carry `workspace_id`, stable ID, timestamps, and actor metadata where relevant.
- Sensitive mutations must append an immutable audit event.

### 6.4 AI

- AI provider clients must be initialized lazily so `next build` never requires runtime secrets.
- All machine-readable outputs must use versioned JSON schemas and runtime validation.
- Store prompt version, model, provider status, latency, token usage when available, and output validation status.
- AI may prepare or recommend, but cannot approve or execute external writes.
- AI output is untrusted input. Escape it in UI, validate it on the server, and never interpret it as executable code.
- Workspace context must be bounded, redacted, and filtered by the authenticated workspace.

## 7. Required Data Model

Production migrations must cover these entities:

| Entity | Required purpose |
| --- | --- |
| `workspaces` | Tenant root, settings, plan, status |
| `profiles` | Optional display name and user preferences |
| `workspace_members` | User-to-workspace membership, role, position, department |
| `evidence_records` | Uploaded file or URL metadata, state, storage path |
| `evidence_fields` | Extracted and user-corrected structured fields |
| `vendors` | Confirmed vendor entity |
| `contracts` | Confirmed contract and renewal facts |
| `invoices` | Confirmed invoice facts |
| `spend_rows` | Confirmed spend/import rows |
| `findings` | Evidence-backed risk or savings opportunity |
| `finding_evidence` | Many-to-many proof links |
| `actions` | Human-controllable recommended work |
| `approval_events` | Immutable approval state transitions |
| `reports` | Generated reports and versions |
| `agent_runs` | Agent execution, status, input/output references |
| `chat_threads` | Workspace chat conversation metadata |
| `chat_messages` | User/assistant messages and citations |
| `notifications` | Persistent read/unread user notifications |
| `connectors` | Connector configuration and health, never raw secrets |
| `live_events` | Inbound normalized business events |
| `team_tasks` | Team Operations CRM tasks and delivery status |
| `gateway_reports` | Team-to-CEO reports and decisions |
| `b2b_threads` | Partner conversation metadata |
| `b2b_messages` | Partner messages, sender, visibility, status |
| `b2b_workflow_events` | Shared workflow approvals and status history |
| `support_tickets` | User-created support requests and status |
| `audit_log` | Append-only sensitive activity history |

Migration rules:

- Use foreign keys and indexes for `workspace_id`, status, created time, and common lookup IDs.
- Add unique constraints for idempotency keys and external event IDs.
- Enable RLS on every tenant table.
- Add workspace membership-based policies for authenticated users.
- Keep service-role access server-only.
- Add migration rollback notes and seed data separately from production data.
- Never use `DROP TABLE` or destructive data rewrites without an approved migration plan.

## 8. Authentication And Authorization

Required roles:

| Capability | Owner | Admin | Manager | Member | Viewer |
| --- | --- | --- | --- | --- | --- |
| Read workspace data | Yes | Yes | Yes | Yes | Yes |
| Upload and review evidence | Yes | Yes | Yes | Yes | No |
| Run supervised agents | Yes | Yes | Yes | Yes | No |
| Approve/reject actions | Yes | Yes | Yes | No | No |
| Delegate section work | Yes | Yes | Yes | No | No |
| Manage members and roles | Yes | Yes | No | No | No |
| Configure connectors | Yes | Yes | No | No | No |
| Export workspace/audit data | Yes | Yes | Policy-based | No | No |
| Delete/reset workspace data | Yes | No by default | No | No | No |

Implementation requirements:

- Replace permissive context fallback with `requireAuthenticatedContext()` for private APIs.
- Keep an explicit local-demo mode behind a development-only environment flag. It must be impossible in production.
- Validate authorization in each Route Handler or service, not only in navigation or proxy code.
- Bind workspace access to verified membership, not a client-provided workspace ID.
- Use secure, `httpOnly`, `SameSite=Lax` or stricter cookies and production `Secure` flag.
- Add session rotation, expiry, sign-out invalidation, and revocation behavior.
- Fail startup or readiness in production when the session secret is missing or uses the development fallback.
- Add password reset and email verification behavior or clearly disable the controls until Supabase email configuration is verified.
- Do not require a name at signup. Display name remains optional in Profile.

## 9. Section Completion Matrix

| Section | Must work by July 18 | Acceptance criteria |
| --- | --- | --- |
| Landing | Product explanation and auth CTAs | New visitor understands value; signed-in user can enter workspace; responsive and accessible |
| Auth/Onboarding | Signup, signin, role/position/department setup | Server validation, useful errors, secure session, redirect to isolated workspace |
| Command Center | Real metrics, drilldowns, live status | Every KPI derives from workspace data and navigates to its source |
| Data Intake | File upload, URL input, review, confirm/reject, delete, export | Real progress/errors; supported formats truthful; confirmed data persists |
| Evidence Engine | Extraction, facts, proof links | Every finding/action/report can trace to evidence; missing proof is explicit |
| Diagnostics | Filters, status, drilldowns, readiness | Derived from real records; state persists when a user changes it |
| Savings Radar | Opportunities, impact, confidence, action creation | Opportunity opens evidence; action routes to Approvals; export is real |
| Agents | Run supervised agents and inspect runs | Run status and errors persist; output links to evidence/actions; no external execution |
| Approvals | Full controlled state machine | Approve/reject/edit/delegate/snooze/reopen/done persist and audit correctly |
| AI Chat | Streaming workspace-aware answers | Uses only current tenant data; provides citations; handles provider failure and limits |
| Reports | Generate, view, version, export, share locally | Content comes from persisted data; CSV/JSON/Markdown downloads are valid |
| Excel Workspace | Parse and analyze tabular evidence | Real imported rows, filters, anomaly links, and CSV export; no fake spreadsheet actions |
| Connectors | Live events, schema, test event, health | Inbound token auth, idempotency, clear history; native connectors may remain locked |
| CEO AI Gateway | Receive report, inspect AI recommendation, decide/delegate | Decision persists, role checked, notifications/audit updated |
| Team Operations CRM | Tasks, notes, delivery log, submit report | Changes persist and submitted reports appear in CEO Gateway |
| B2B Bridge | Messages, summaries, workflow status | Workspace-scoped persistence, participant validation, human-controlled workflow decisions |
| Support | FAQ, onboarding links, ticket creation | Search/navigation work; tickets persist; external live chat may remain locked |
| Profile/Settings | Profile, security, exports, sessions, reset, sign out | Real forms and confirmations; destructive actions authorized and audited |

## 10. Core End-To-End Workflows

These workflows are release blockers.

### Workflow A: New Customer Activation

Landing -> Signup -> Workspace setup -> Role/position/department -> Workspace -> Empty-state guidance -> First upload.

Done when a new production user receives a verified isolated workspace and no demo data from another tenant.

### Workflow B: Evidence To Decision

Upload/URL -> Validation -> Extraction -> User review -> Confirm -> Facts -> Finding -> Recommended action -> Approval -> Audit -> Report.

Done when every object is persisted and the report can trace the decision back to the original evidence.

### Workflow C: Supervised Agent

Run agent -> Persist queued/running/completed/failed status -> Validate model output -> Create draft action -> Human approval -> Audit.

Done when retries are idempotent and an AI failure cannot corrupt existing workspace data.

### Workflow D: Operations Escalation

Team task -> Delivery log -> Submit to CEO Gateway -> Recommendation -> Approve/delegate/revise -> Notification and audit.

Done when every status transition survives refresh and unauthorized roles are rejected server-side.

### Workflow E: B2B Coordination

Open thread -> Send message -> Generate bounded summary -> Review terms -> Human approval -> Workflow status history.

Done when messages and decisions are tenant/participant scoped and AI cannot approve terms.

### Workflow F: Administration

Profile update -> Export -> Audit review -> Session management -> Data reset confirmation -> Sign out.

Done when role restrictions and destructive confirmations are enforced on the server.

## 11. AI Pipeline Requirements

Required pipeline stages:

- Ingest and normalize input.
- Extract text using format-specific parsers.
- Remove unsupported content and enforce size/page/row limits.
- Call Gemini with a versioned task prompt.
- Validate response against a runtime schema.
- Record provider metadata and validation result.
- Store extracted facts as unconfirmed.
- Require human confirmation before facts drive high-impact decisions.
- Generate findings only from confirmed or clearly labeled provisional evidence.
- Generate actions with evidence IDs, confidence, and `requires_approval=true`.
- Generate reports from persisted facts/findings/actions, not raw model prose.
- Build chat context with size limits, tenant filtering, citation IDs, and prompt-injection defenses.

Minimum AI quality fixtures:

- Contract PDF with renewal and notice period.
- Invoice CSV with duplicate or variance.
- XLSX spend file with multiple sheets.
- DOCX contract or procurement note.
- Image invoice with OCR-capable extraction.
- Malformed file and password-protected/unsupported document.
- Prompt-injection text inside an uploaded document.
- Gemini timeout, invalid JSON, rate limit, and provider outage.

## 12. Security Release Gates

All items are P0 before the July 25 production candidate.

- Private APIs reject missing, expired, forged, or revoked sessions.
- Server authorization rejects role escalation and cross-workspace IDs.
- RLS exists on every tenant table and is tested with two real users/two workspaces.
- Service-role key never reaches the browser or logs.
- Production refuses the development session secret.
- Uploads enforce extension, MIME signature where practical, size, file count, decompression, and parser limits.
- Storage bucket is private and paths are workspace scoped.
- URL analysis validates every redirect hop, blocks private/link-local/reserved IPs, limits redirects/body size/time, and prevents DNS rebinding where feasible.
- Public/auth/chat/upload/live-event routes have rate limits.
- Live-event ingestion uses hashed rotating tokens, idempotency keys, and bounded payloads.
- AI prompts treat uploaded and partner content as untrusted data.
- UI renders AI output as text, never executable HTML.
- Destructive actions require explicit confirmation and fresh authorization.
- Audit events cannot be edited by ordinary workspace users.
- Logs redact emails, secrets, file contents, authorization headers, and model context.
- Dependency audit has no unresolved critical/high production vulnerability.

## 13. UX And Accessibility Gates

- All sections work at 1440x900, 1280x720, 390x844, and 360x800.
- No text overlap, clipped menus, horizontal page overflow, or unstable layout shifts.
- Keyboard users can reach every action and close dialogs/drawers.
- Icon-only actions have accessible labels and tooltips where needed.
- Forms have labels, validation messages, disabled states, and pending states.
- Empty states explain the next valid action.
- Errors preserve user input and provide a retry or recovery path.
- Dangerous actions use confirmation dialogs, not browser-only assumptions.
- Tables provide useful mobile behavior, pagination, and truthful counts.
- Toasts confirm completed operations; they do not replace the operation.
- Locked features explain what is missing and never claim success.

## 14. Test Strategy

Add these scripts:

- `test:unit`: domain helpers, validators, permission matrix, state transitions.
- `test:integration`: Route Handlers/services with isolated test data.
- `test:e2e`: Playwright critical paths.
- `test`: unit plus integration.

Minimum automated coverage:

- Session signing, expiry, revocation, and production fail-closed behavior.
- Workspace membership and role permission matrix.
- Evidence upload validation and review transitions.
- Strict extraction schema validation and fallback states.
- Finding/action/report derivation.
- Approval state machine including invalid transitions.
- Operations report and B2B workflow transitions.
- SSRF redirect and private-network cases.
- Cross-workspace access attempts for every sensitive entity.
- Export content and response headers.
- New-user, evidence-to-approval, operations, B2B, and admin Playwright flows.

Every work block must run the smallest relevant tests. Every merge-ready block must run:

```text
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run test:e2e
git diff --check
```

Until test scripts exist, lint, build, focused API smoke tests, and documented manual browser checks are mandatory.

## 15. Delivery Calendar

### July 10: Baseline And Coordination

- Freeze this plan.
- Finish or explicitly checkpoint the current Phase 3 changes.
- Run lint/build and capture known failures.
- Create a clean shared baseline commit before Gemini starts.
- Assign file ownership and branches/worktrees.

Exit gate: both agents start from the same commit and no uncommitted changes are copied over each other.

### July 11: Complete UI Action Inventory

- Finish all remaining button wiring.
- Replace fake success toasts.
- Add real filters, pagination, navigation, confirmations, pending, empty, and error states.
- Record each intentionally locked external integration.

Exit gate: every control in all 16 workspace sections is working or intentionally locked.

### July 12: Authentication, Sessions, Roles

- Strict authenticated request context.
- Production-safe session behavior.
- Membership and permission service.
- Server-side authorization for all private routes.
- Complete onboarding persistence.

Exit gate: two-user/two-workspace isolation smoke test passes at the API layer.

### July 13: Supabase Schema And Persistence

- Add missing normalized tables and migrations.
- Complete RLS and indexes.
- Persist notifications, support, agents, operations, chat, and settings.
- Verify local fallback still works only in allowed development mode.

Exit gate: critical workflows survive refresh and server restart using Supabase.

### July 14: Evidence And AI Pipeline

- Real parsers for every advertised file format.
- Strict AI output schemas and prompt versions.
- Evidence citations and extraction failure states.
- Prompt-injection and URL SSRF hardening.

Exit gate: the AI quality fixture set produces valid reviewed evidence or an explicit recoverable failure.

### July 15: Workflow Completion

- Findings/actions/reports pipeline.
- Agent run persistence.
- Approval state machine.
- CEO Gateway, Team CRM, and B2B workflow completion.

Exit gate: Workflows B-E pass against Supabase.

### July 16: Tests And Responsive UX

- Unit and integration suite.
- Playwright critical paths.
- Desktop/mobile layout and accessibility pass.
- Loading, empty, error, and confirmation states.

Exit gate: lint, tests, build, and critical browser flows pass.

### July 17: Security And Release Rehearsal

- Cross-tenant tests.
- Rate limits and abuse cases.
- Dependency/security audit.
- Production environment validation.
- Deploy preview and run full smoke test.

Exit gate: no open P0 defect; every P1 defect has an owner and release decision.

### July 18: Release Candidate

- Freeze features.
- Fix only release-blocking defects.
- Generate release notes, known limitations, and demo data.
- Tag the exact tested commit.

Exit gate: all Full Product V1 acceptance criteria pass on the release candidate deployment.

### July 19-21: Production-Like QA

- Realistic data volume, browser, mobile, slow network, refresh, and retry testing.
- Verify emails/auth redirects if enabled.
- Measure API latency, AI latency, upload limits, and error rates.
- Fix data integrity and usability defects.

### July 22: Security Review

- RLS policy review.
- Session and authorization review.
- SSRF/upload/prompt-injection tests.
- Secret and log review.
- Dependency update decision.

### July 23: Reliability And Recovery

- Backup verification and restore drill.
- Retry/idempotency review.
- Provider outage behavior.
- Database and storage failure behavior.
- Incident runbook.

### July 24: Final Regression

- Full automated suite.
- Full section-by-section manual check.
- Production configuration and domain check.
- Documentation and handoff check.

### July 25: Production Candidate

- Deploy the exact tested commit.
- Run post-deploy smoke tests.
- Monitor auth, API, database, AI, and client errors.
- Record rollback commit and recovery steps.

## 16. Priority Rules

P0 release blocker:

- Data leak or security bypass.
- Cross-workspace access.
- Auth/session failure.
- Core workflow cannot complete or persist.
- Data corruption or destructive action without confirmation.
- Build failure or critical end-to-end failure.

P1 required for production candidate:

- Broken section action with a safe workaround.
- Missing loading/error/empty state in a major workflow.
- Major mobile/accessibility issue.
- Incorrect report/export content.
- Missing audit event for a sensitive but recoverable action.

P2 after July 25:

- Cosmetic polish.
- Additional chart or filter.
- Native external integration.
- Non-critical performance optimization.
- Additional AI agent beyond the fixed set.

Do not fix P2 while a P0 or P1 release item remains.

## 17. Parallel Work Protocol

Codex and Gemini must not edit the same dirty workspace concurrently.

Required process:

1. The Product Owner creates or confirms one clean baseline commit.
2. Each agent works in a separate branch or Git worktree.
3. Each task has one owner and a bounded file list.
4. Shared core files have only one owner at a time.
5. Each agent rebases/merges the latest baseline before beginning a new task bundle.
6. A task bundle should normally touch no more than one vertical slice and its tests.
7. The Product Owner or integration owner merges one completed bundle at a time.
8. After merge, run the complete merge gate before assigning the next shared-core task.

Shared-core files requiring exclusive ownership:

- `components/genius/workspace-context.jsx`
- `components/genius/app-shell.jsx`
- `lib/server/evidence-store.js`
- `lib/server/workspace-state.js`
- `lib/server/workspace-engine.js`
- `lib/server/auth-session.js`
- `lib/server/supabase-workspace-store.js`
- `supabase/migrations/**`
- `package.json` and `package-lock.json`

Recommended initial ownership:

| Workstream | Owner | Allowed area |
| --- | --- | --- |
| Security, auth, tenant isolation | Codex | Auth/session, authorization service, private Route Handlers, security tests |
| Persistence and shared state | Codex | Workspace provider, store adapter, schema/migrations |
| Remaining section UX actions | Gemini | Assigned section components only; no shared-core edits without approval |
| Operations UX completion | Gemini | `team-crm.jsx`, `ai-gateway.jsx`, `b2b-bridge.jsx`, existing operations APIs only |
| AI/evidence pipeline | Codex | Gemini client, prompts, extraction, evidence services |
| E2E test authoring | Gemini | Playwright tests after test infrastructure owner creates the baseline |
| Design binding | Product Owner / Antigravity | Visual design and component binding without changing backend contracts |
| Integration and release gates | Codex | Merge review, lint, tests, build, runtime smoke, checkpoint |

If Gemini needs a shared-core change, it must stop at the boundary, document the required contract, and hand the integration request to the current shared-core owner.

## 18. Gemini Operating Instructions

The Product Owner can give this entire file to Gemini. Gemini must follow these rules exactly.

### Startup Sequence

Before editing anything, Gemini must read completely:

1. `AGENTS.md`
2. `docs/GENIUS_FULL_PRODUCT_EXECUTION_PLAN_2026-07-18_25.md`
3. `docs/CURRENT_CHECKPOINT.md`
4. `docs/GENIUS_FULL_PRODUCT_PLAN.md`
5. The relevant Next.js 16 guide under `node_modules/next/dist/docs/`
6. Every file in the assigned task boundary
7. `git status --short` and the diff for files it will touch

Gemini must then report:

- Current phase and assigned task ID.
- Existing behavior and dependencies.
- Exact files it plans to modify.
- Risks and acceptance criteria.
- Tests it will run.

### Implementation Rules

- Preserve the current design unless the task explicitly requests design changes.
- Preserve existing user changes and never reset the worktree.
- Do not rewrite a complete section when a scoped change is sufficient.
- Do not create duplicate providers, stores, auth systems, or API clients.
- Do not call Supabase from Client Components.
- Do not trust client-provided identity, role, or workspace IDs.
- Do not mark a task complete when only the UI changed but persistence is required.
- Do not use placeholder success toasts as implementation.
- Do not invent backend response shapes; inspect the existing API contract.
- Do not silently change shared state or schemas.
- Do not enable autonomous external actions.
- Use `apply_patch` for manual edits.
- Keep comments concise and only where logic is non-obvious.
- Add focused tests proportional to the risk.
- Run verification before handoff.

### Required Handoff

At the end of every Gemini block, report and append to `docs/CURRENT_CHECKPOINT.md`:

- Task ID and status.
- Completed behavior.
- Files changed.
- Migrations or environment variables added.
- Tests and exact results.
- Manual checks performed.
- Known risks or incomplete behavior.
- Exact next task.
- Commit hash if committed.

Gemini must never claim "full product complete" unless every release gate in this document has passed.

### Ready-To-Paste Gemini Prompt

```text
You are implementing GENIUS as a production Full Product V1. Treat the attached GENIUS Full Product Execution Plan as the source of truth. Read AGENTS.md, the execution plan, docs/CURRENT_CHECKPOINT.md, docs/GENIUS_FULL_PRODUCT_PLAN.md, the relevant Next.js 16 local documentation, git status, and all assigned files before editing.

Work only on the task and file boundary assigned by the Product Owner. Preserve the existing design and all existing changes. Do not reset files, duplicate architecture, simulate success with toasts, trust client-supplied identity/workspace/roles, or modify shared-core files without explicit ownership.

Before code changes, state the current phase, behavior, dependencies, exact files, risks, acceptance criteria, and tests. Implement the complete vertical behavior including validation, loading/error/empty states, persistence, permissions, audit events where required, and focused tests. Then run lint, relevant tests, production build, and git diff --check. Update docs/CURRENT_CHECKPOINT.md with the exact handoff. If a shared-core change is required outside your ownership, stop at that boundary and write an integration request instead of editing it.
```

## 19. Task Board

Task status values: `READY`, `ACTIVE`, `BLOCKED`, `REVIEW`, `DONE`.

| ID | Priority | Task | Owner | Status | Dependency |
| --- | --- | --- | --- | --- | --- |
| R-00 | P0 | Finish/checkpoint current Phase 3 UI wiring and create clean baseline | Codex | REVIEW | None |
| R-01 | P0 | Inventory every remaining control and remove fake success behavior | Gemini after baseline | READY | R-00 |
| R-02 | P0 | Strict authenticated context and production session safety | Codex | REVIEW | R-00 |
| R-03 | P0 | Membership/role authorization service and route enforcement | Codex | READY | R-02 |
| R-04 | P0 | Complete normalized Supabase schema and RLS | Codex | READY | R-03 |
| R-05 | P0 | Persist notifications, support, chat, agents, and operations | Unassigned | READY | R-04 |
| R-06 | P0 | Complete file parsers and strict AI extraction schemas | Codex | READY | R-00 |
| R-07 | P0 | Fix redirect-aware SSRF defense and upload abuse limits | Codex | READY | R-02 |
| R-08 | P0 | Complete findings/actions/reports derivation pipeline | Unassigned | READY | R-04, R-06 |
| R-09 | P0 | Complete approval state machine and audit transitions | Unassigned | READY | R-03, R-04 |
| R-10 | P0 | Complete operations UX secondary actions | Gemini | READY | R-00 |
| R-11 | P1 | Settings/Profile/Support real persistence and confirmations | Gemini | READY | R-03, R-05 |
| R-12 | P0 | Unit/integration test infrastructure | Unassigned | READY | R-02 |
| R-13 | P0 | Playwright critical-path suite | Gemini | READY | R-12, R-08, R-09 |
| R-14 | P1 | Responsive/accessibility/error-state pass | Gemini | READY | R-01 |
| R-15 | P0 | Rate limits, secret/log review, dependency audit | Codex | READY | R-02, R-07 |
| R-16 | P0 | Preview deploy and release rehearsal | Codex | READY | R-04 through R-15 |
| R-17 | P0 | Production-like QA and defect closure | All | READY | R-16 |
| R-18 | P0 | Backup/restore, outage, rollback, incident runbook | Codex | READY | R-16 |
| R-19 | P0 | Production candidate deploy and post-deploy smoke | Codex | READY | R-17, R-18 |

Only one task may be `ACTIVE` for each agent. The Product Owner assigns ownership before work begins.

## 20. Definition Of Done For Any Task

A task is done only when:

- The acceptance criteria are met in real behavior.
- Server validation and authorization exist where applicable.
- Persistence survives refresh and server restart where applicable.
- Audit events exist for sensitive mutations.
- Loading, empty, error, and locked states are truthful.
- Focused automated tests pass.
- Lint and production build pass.
- No unrelated files were reformatted or reverted.
- `git diff --check` passes.
- `docs/CURRENT_CHECKPOINT.md` is updated.
- The integration owner can reproduce the result from the handoff.

## 21. Release Decision

The Product Owner may release only when:

- No P0 issue is open.
- All critical workflows pass in production-like configuration.
- Two-workspace isolation tests pass.
- Supabase migrations and rollback notes are complete.
- AI failure states are safe and recoverable.
- Every section passes the action inventory.
- All required automated checks pass on the exact deployment commit.
- Monitoring, backup, rollback, and incident ownership are recorded.

If these conditions are not true by July 18, call the build a preview, not a full release candidate. If they are not true by July 25, delay production rather than misrepresenting product safety.
