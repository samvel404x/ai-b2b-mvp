# GENIUS Full Product Plan v1

Last fixed: 2026-07-10  
Next work session: 2026-07-11

This document is the master technical execution checklist for building GENIUS into a fully working product, not just a visual MVP. It is the source of truth for handoffs between Codex, Antigravity, and manual product/design work.

## Product Definition

GENIUS is an AI-powered B2B business operating system that helps companies find money leaks, operational risks, missed approvals, weak evidence, and blocked workflows. It turns uploaded files, URLs, live business events, team reports, and partner communication into evidence-backed findings, recommended actions, approvals, reports, and workspace intelligence.

The name GENIUS was chosen because the product is intended to be a new, expanded, unique system that contains everything a business team needs to understand risks, make decisions, coordinate work, and act with AI support while keeping humans in control.

## Core Principle

Every button in the product must either work now, clearly show a locked/future state, or guide the user to the next required step. No fake actions, dead controls, or decorative workflows.

## Architecture Foundation

- [ ] Next.js App Router application.
- [ ] One `WorkspaceProvider` as the frontend state gateway.
- [ ] Backend through route handlers.
- [ ] Storage adapter with local fallback now and Supabase as the production adapter.
- [ ] Workspace isolation by `workspaceId`.
- [ ] Auth with email/password.
- [ ] No required user name at registration.
- [ ] User selects role, position, and section/department after signup.
- [ ] Optional display name only after onboarding.

## User Model

Required user setup:

- Role: Owner, Admin, Manager, Member, Viewer.
- Position: CEO, CFO, Operations, Procurement, Finance, Analyst, Sales, Logistics, HR, or custom.
- Section/department: Finance, Operations, Procurement, Sales, Logistics, Warehouse, HR, or custom.

Permission rules:

- Owner/Admin can manage workspace, exports, reset, security settings, and members.
- Manager can approve, delegate, and manage section workflows.
- Member can submit evidence, team reports, tasks, and comments.
- Viewer can read approved workspace data and reports.
- Sensitive actions must create audit log entries.

## Security Base

- [ ] Signed `httpOnly` session cookie.
- [ ] Supabase Auth for production.
- [ ] RLS on every Supabase table.
- [ ] API authorization on every route handler.
- [ ] No cross-workspace reads or writes.
- [ ] Audit log for every sensitive action.
- [ ] File upload validation: type, size, parsing boundaries.
- [ ] URL analysis SSRF protection.
- [ ] Secrets only server-side.
- [ ] AI never receives unnecessary secrets.
- [ ] AI output cannot directly execute external actions.
- [ ] Final security pass before release.

## Workspace Data Model

The workspace must store:

- [ ] users and members.
- [ ] roles and permissions.
- [ ] evidence records.
- [ ] extracted facts.
- [ ] findings.
- [ ] actions.
- [ ] approvals.
- [ ] reports.
- [ ] audit logs.
- [ ] notifications.
- [ ] connectors.
- [ ] live events.
- [ ] agent runs.
- [ ] operations data.
- [ ] CEO gateway reports.
- [ ] B2B partner threads.
- [ ] CRM tasks and delivery logs.

## Product Sections

- [ ] Landing Page: real product intro, trust, security, modules, CTA.
- [ ] Auth / Onboarding: signup, signin, role selection, position/section setup, workspace creation.
- [ ] Command Center: risk, money at risk, approvals, agents, live events, reports, proof coverage.
- [ ] Data Intake: upload files, analyze URLs, review extracted fields, confirm/reject evidence.
- [ ] Evidence Engine: each file/event becomes evidence; confirmed evidence creates findings, actions, and reports.
- [ ] Diagnostics: data quality, missing fields, risk categories, proof coverage, readiness score.
- [ ] Savings Radar: savings/risk opportunities, confidence, impact, evidence, run agent, create approval, export.
- [ ] Agents: Contract Analyst, Spend Auditor, Finance Watcher, Action Drafter. Supervised only.
- [ ] Approvals: approve, reject, edit, snooze, mark done; every decision saved to audit log.
- [ ] AI Chat: workspace-aware assistant using evidence, reports, findings, actions, and metrics.
- [ ] Reports: board-ready reports, markdown/csv export, evidence-backed sections.
- [ ] Excel Workspace: spreadsheet-style analysis, anomaly detection, parsed table evidence.
- [ ] Connectors: live business events, webhook schema, test events, future locked integrations.
- [ ] CEO AI Gateway: inbox for team reports, AI recommendations, approve/delegate/reject.
- [ ] Team Operations CRM: tasks, team submissions, delivery logs, notes, submit to CEO Gateway.
- [ ] Multi-Business OS / B2B Bridge: secure partner chat, shared documents, workflow approvals, AI summaries.
- [ ] Support / FAQ: help center, ticket creation, status, onboarding guide.
- [ ] Settings: workspace export, audit export, reset data, sign out, role/security settings.

## AI Rules

AI can:

- [ ] summarize.
- [ ] extract facts.
- [ ] detect risks.
- [ ] draft actions.
- [ ] explain reasoning.
- [ ] prepare reports.
- [ ] answer workspace questions.

AI cannot:

- [ ] execute external writes.
- [ ] approve actions itself.
- [ ] access another workspace.
- [ ] hide missing evidence.
- [ ] present speculation as fact.
- [ ] bypass permissions.

## UX Requirements

- [ ] Every async action has loading state.
- [ ] Every empty table has next-step guidance.
- [ ] Every error has clear recovery.
- [ ] No broken navigation.
- [ ] No text overlap.
- [ ] Responsive desktop/mobile behavior.
- [ ] Buttons connected to real logic or intentionally locked.
- [ ] Locked features look intentional.
- [ ] Critical actions require confirmation.
- [ ] Reports, exports, and downloads feel real.
- [ ] Main screen lets a visitor understand the product before registration.
- [ ] After registration, the user lands in the workspace.

## Execution Phases

### Phase 1 - Current Core

- [~] Landing page.
- [~] Email/password auth with local fallback.
- [~] Workspace provider.
- [~] Data intake.
- [~] Evidence review.
- [~] Findings/actions/report generation.
- [~] Command Center.
- [~] Agents, Approvals, AI Chat, Reports, Settings, Connectors.

### Phase 2 - Operations Backend

- [x] Add operations state shape.
- [x] Add CEO Gateway report helpers.
- [x] Add Team CRM submission route.
- [x] Add Gateway report update route.
- [x] Add B2B thread/workflow route.
- [x] Add frontend provider methods for operations.
- [x] Wire Team Operations CRM UI.
- [x] Wire CEO AI Gateway UI.
- [x] Wire B2B Bridge UI.
- [x] Add audit coverage for all operation decisions.
- [x] Run lint, build, and runtime checks.

### Phase 3 - Full Button Wiring

- [x] Connect every command center action.
- [~] Connect every section CTA.
- [~] Connect export/download actions.
- [x] Connect approvals and status transitions.
- [~] Add disabled/locked state copy where feature is intentionally future.
- [~] Remove or replace any decorative non-working controls.

### Phase 4 - Supabase Production Adapter

- [ ] Finalize schema for evidence, reports, actions, approvals, audit logs.
- [ ] Add operations, gateway, CRM, and B2B tables.
- [ ] Add RLS policies for workspace isolation.
- [ ] Add role-aware access policies.
- [ ] Keep local JSON fallback for development.
- [ ] Verify service-role access is server-only.

### Phase 5 - AI Processing Pipeline

- [ ] Evidence extraction pipeline.
- [ ] Risk/finding generator.
- [ ] Action drafting.
- [ ] Report drafting.
- [ ] Workspace-aware chat context builder.
- [ ] Prompt-injection protection.
- [ ] Human approval boundary for all business actions.

### Phase 6 - Roles And Permissions

- [ ] Role-based navigation states.
- [ ] Role-based route authorization.
- [ ] Workspace member management.
- [ ] Department/section ownership.
- [ ] Audit log visibility rules.

### Phase 7 - UX Pass

- [ ] Desktop responsive pass.
- [ ] Mobile responsive pass.
- [ ] Loading states.
- [ ] Empty states.
- [ ] Error states.
- [ ] Confirmation modals.
- [ ] Text overflow/overlap check.
- [ ] End-to-end onboarding flow.

### Phase 8 - Security Pass

- [ ] Auth/session review.
- [ ] Workspace isolation test.
- [ ] RLS review.
- [ ] File upload abuse review.
- [ ] URL SSRF review.
- [ ] API permission review.
- [ ] AI prompt-injection review.
- [ ] Audit log coverage check.
- [ ] Dependency audit.
- [ ] Production env/secrets check.
- [ ] UX safety check for destructive actions.

### Phase 9 - End-To-End QA

- [ ] New user signup.
- [ ] Role/position/section setup.
- [ ] Workspace open after registration.
- [ ] Evidence upload.
- [ ] URL analysis.
- [ ] Evidence review.
- [ ] Agent run.
- [ ] Approval decision.
- [ ] Report export.
- [ ] Live event ingestion.
- [ ] Team report submission.
- [ ] CEO Gateway decision.
- [ ] B2B thread workflow.
- [ ] Settings export/reset/sign out.

### Phase 10 - Deploy

- [ ] Production env variables.
- [ ] Supabase production project.
- [ ] Private storage bucket.
- [ ] Build passes.
- [ ] Runtime smoke test.
- [ ] Security checklist complete.
- [ ] Deployment URL verified.

## Handoff Rule

After every work block, the outgoing agent must leave:

- [ ] What was completed.
- [ ] Files changed.
- [ ] Tests run.
- [ ] What is broken or not finished.
- [ ] Exact next task.
- [ ] Current checkpoint.
