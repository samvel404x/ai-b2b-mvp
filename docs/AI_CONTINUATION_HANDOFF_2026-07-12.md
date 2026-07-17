# GENIUS AI Continuation Handoff - 2026-07-12

This file is the operating brief for Gemini, Claude Sonnet, or Claude Opus when continuing GENIUS after the current Codex pass.

## Non-Negotiable Rules

- Read `AGENTS.md`, `docs/CURRENT_CHECKPOINT.md`, and `docs/GENIUS_FULL_PRODUCT_EXECUTION_PLAN_2026-07-18_25.md` before editing.
- This is a dirty working tree. Do not run `git reset`, do not revert unrelated files, and do not delete generated work unless the owner explicitly asks.
- Keep changes phase-scoped. Do not edit the same section files in parallel with another AI.
- Use the existing architecture: App Router route handlers, `workspace-context.jsx` as the frontend gateway, server helpers under `lib/server`, and local/Supabase parity where it already exists.
- Every functional button must be one of these states: real action, real navigation, or explicit locked/future state with truthful UX.
- Never create fake success for production-only actions. If credentials, external infra, payments, email delivery, or real spreadsheet write-back do not exist, the UI must say that.
- Do not weaken auth, workspace boundaries, capability checks, upload validation, SSRF protections, or file-size limits.

## Current Verified Baseline

As of this handoff, the following verification passed:

- `npx.cmd eslint lib/server/evidence-analysis.js lib/server/workspace-engine.js app/api/evidence/export/route.js components/genius/sections/excel-workspace.jsx`
- `npm.cmd run lint`
- `npm.cmd run build`
- Runtime production smoke for CSV upload/review/workspace.
- Runtime production smoke for combined CSV/XLSX upload/review/workspace/export.

The latest completed slice is:

- Row-level CSV/XLSX parser and export hardening.
- CSV and XLSX uploads now create bounded parsed spreadsheet rows.
- Reviewed spreadsheet evidence now becomes row-level `spendRows` and row-derived invoices.
- Evidence export now includes spreadsheet row count, amount total, and parse status.
- Excel Workspace preserves source spreadsheet row number, description, and parsed category.

## Files Recently Touched In This Slice

- `lib/server/evidence-analysis.js`
- `lib/server/workspace-engine.js`
- `components/genius/sections/excel-workspace.jsx`
- `app/api/evidence/export/route.js`
- `docs/CURRENT_CHECKPOINT.md`

Do not rewrite these files unless your next task explicitly depends on them.

## Recommended AI Split

Use Gemini for:

- Broad UX/button inventory.
- Section-by-section UI wiring.
- Documentation and checklists.
- Mechanical consistency checks across many components.

Use Claude Sonnet for:

- Focused feature slices inside one section.
- Routine API/route handler wiring.
- Small lifecycle persistence tasks.
- Fixing lint/build blockers.

Use Claude Opus for:

- Auth/security/session architecture.
- Supabase schema/RLS decisions.
- Cross-module data model changes.
- Parser/import/export changes.
- Any task touching more than one high-risk backend boundary.

## Next Phase Order

### Phase 1 - Baseline Recheck

Before new edits:

1. Run `git status --short`.
2. Read the last section of `docs/CURRENT_CHECKPOINT.md`.
3. Run `npm.cmd run lint`.
4. Run `npm.cmd run build`.
5. If either fails, fix only the blocker first.

### Phase 2 - Full UX/Button Inventory

Goal: every visible control in the workspace must be real, navigational, or honestly locked.

Audit these areas:

- App shell navigation, profile, notifications, account menus.
- Command Center.
- Data Intake.
- Excel Workspace.
- Approvals.
- Savings Radar.
- Reports.
- Diagnostics.
- Connectors.
- Support.
- Settings.
- AI Chat.
- AI Gateway.
- Team CRM.
- B2B Bridge.
- Workbench/profile/account modals if present.

For every section produce this table internally before editing:

- Button/control label.
- Current behavior.
- Required behavior.
- API/context method needed.
- Status: real, navigation, locked.
- Files touched.

Implementation rule:

- Do one section per task.
- After each section run focused ESLint for touched files.
- After 2-3 sections run full lint/build.

### Phase 3 - Durable Deep Links

Goal: focused entity navigation should survive refresh and be shareable.

Implement a stable URL contract such as:

- `/workspace?section=data-intake&evidenceId=...`
- `/workspace?section=approvals&actionId=...`
- `/workspace?section=reports&reportId=...&tab=proof`
- `/workspace?section=savings&findingId=...`

Expected behavior:

- `app-shell.jsx` reads URL params on load.
- `onNavigate(section, context)` updates URL params without breaking current in-memory focus behavior.
- Data Intake, Approvals, Savings, and Reports still accept `focusContext`.
- Refresh restores the focused row/card where possible.

Risk:

- Do not create hard navigation loops.
- Do not store sensitive data in query params.
- IDs only, no full evidence text.

### Phase 4 - Remaining Workflow Persistence

Close the lower-risk production workflow gaps one by one:

- Support ticket comments and attachments metadata.
- Connector request status transitions and filters.
- Report schedule activation, pause, and edit draft persistence.
- Diagnostics assignment/archive lifecycle if not fully persistent.
- Agents run lifecycle hardening and clearer status transitions.
- Mobile approvals API/UI parity checks.
- Guest portable save/load UX if still incomplete.

Each task must include:

- Route handler or server helper update.
- Workspace context method update.
- UI section wiring.
- Audit event when state changes.
- Runtime smoke for the workflow.

### Phase 5 - Supabase/Data Hardening

Goal: the local store and Supabase-backed store must behave consistently.

Required work:

- Review `supabase/schema.sql`.
- Confirm tables cover workspace state, members, sessions, invites, evidence, actions, reports, tickets, connector requests, and audit events.
- Add missing schema only if needed.
- Add Row Level Security policies for workspace isolation.
- Confirm production env without Supabase fails safely or intentionally uses local fallback only in development.
- Keep local fallback for demo/dev.

Use Claude Opus for this phase if possible.

### Phase 6 - Security And Reliability Pass

Required checks:

- Auth: session validation, revocation, role/capability enforcement.
- Workspace tenant boundary: no client-provided workspace ID can override auth context.
- Uploads: file size, extension/signature match, spreadsheet parser bounds, no formula execution.
- URL analysis: SSRF protections, private IP blocking, timeout limits.
- Exports: capability checks, no cross-workspace data.
- Guest mode: local/portable behavior must not expose auth login data or member email data unnecessarily.
- Cookies: secure flags, secret requirements, production fallback disabled.
- Audit logs: all high-risk state changes recorded.
- Rate limiting plan or implementation for auth/upload/AI endpoints.

### Phase 7 - Visual QA And Scale QA

Required viewports/scales:

- 1920x1080 at 100%.
- 1366x768 at 100%.
- 1536x864 at 100%.
- Desktop browser zoom behavior around 80%, 100%, 125%, 150%.

Check:

- No overlapping text.
- No broken cards/tables.
- Workspace fills width correctly.
- Sidebars and section panels remain usable.
- Long labels do not break buttons.
- Empty/loading/error states are present.

### Phase 8 - Release Candidate Smoke

Final smoke sequence:

1. Landing page loads.
2. Guest workspace opens.
3. Email signup/signin works in development mode.
4. Invite link flow works.
5. CSV upload parses rows.
6. XLSX upload parses rows.
7. Evidence review creates workspace entities.
8. Excel Workspace shows parsed rows.
9. Approvals decision persists.
10. Reports export works.
11. Support ticket workflow works.
12. Connector request workflow works.
13. Diagnostics status update persists.
14. Portable export/import works if enabled.
15. Sign out revokes session.
16. Unauthorized requests return `401` or `403`.
17. `npm.cmd run lint` passes.
18. `npm.cmd run build` passes.

## Prompt To Give Gemini Or Claude

Use this prompt:

```text
You are continuing GENIUS in C:\Users\only\Downloads\ai-b2b-mvp. Read AGENTS.md, docs/CURRENT_CHECKPOINT.md, docs/GENIUS_FULL_PRODUCT_EXECUTION_PLAN_2026-07-18_25.md, and docs/AI_CONTINUATION_HANDOFF_2026-07-12.md first.

Do not reset the working tree. Do not revert unrelated changes. Work like a senior production engineer. Keep the task phase-scoped and tell me which phase you are working on.

Start with Phase 2: full UX/button inventory, unless I assign another phase. Pick one section, audit every visible button/control, then implement only that section's real navigation/action/locked behavior. Use existing architecture and workspace-context methods. Run focused ESLint for touched files, then report exactly what changed, what passed, and what remains.
```

## Stop Conditions

Stop and report before continuing if:

- `npm.cmd run build` fails for a reason outside the files you touched.
- You need to change auth/session/schema architecture.
- You need Supabase credentials or production secrets.
- Another AI is editing the same files.
- A button requires external infrastructure not present in the repo.

