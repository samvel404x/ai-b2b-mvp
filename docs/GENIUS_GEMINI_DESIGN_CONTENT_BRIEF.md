# GENIUS Gemini Design and Content Brief

Last updated: 2026-07-16

This document is the design and content handoff for Gemini, Claude, Antigravity, or any other assistant working on GENIUS visual polish. It explains what each visible area should mean, what content should be shown, and which parts are dynamic product logic that must not be hardcoded.

## 1. Current Goal

GENIUS is a working AI-powered B2B SaaS workspace for evidence-backed business operations.

The product must feel like a real operational command center, not a static demo. The interface should help a company upload evidence, analyze business risks, detect savings, review AI recommendations, approve actions, generate reports, and control agents under human supervision.

Design work should focus on:

- Making every section clear, premium, and investor-ready.
- Removing visual duplication where tabs look the same.
- Keeping the UI usable at 1920x1080 by default and acceptable from 80 percent to 150 percent browser zoom.
- Keeping all current API and workspace bindings intact.
- Making empty, demo, locked, and live states visually clear.
- Avoiding fake actions, dead buttons, and misleading production claims.

## 2. Files to Read Before Editing

Read these before making visual or content changes:

- `AGENTS.md`
- `docs/CURRENT_CHECKPOINT.md`
- `docs/GENIUS_INVESTOR_DEMO_BINDING_MAP_2026-07-14.md`
- `docs/GENIUS_PRODUCTION_DEPLOYMENT_HANDOFF.md`
- `docs/GENIUS_PRODUCTION_RECOVERY_RUNBOOK.md`
- `docs/GENIUS_PRODUCTION_OBSERVABILITY_RUNBOOK.md`
- This file: `docs/GENIUS_GEMINI_DESIGN_CONTENT_BRIEF.md`

Do not rewrite product architecture from scratch. Work inside existing components, patterns, routes, and workspace context.

## 3. Non-Negotiable Rules

- Do not hardcode live-looking business values if they are already coming from workspace state.
- Do not remove capability checks, disabled states, locked states, auth guards, or permission copy.
- Do not expose raw emails, auth tokens, Supabase keys, session IDs, authorization headers, or service-role data in UI.
- Do not change API route contracts unless explicitly assigned backend work.
- Do not invent a new Supabase schema in UI work.
- Do not replace functioning buttons with toast-only placeholders.
- Do not turn the app into a landing page. The workspace is the main product.
- Do not remove guest mode, portable workspace import/export, demo data loading, audit log visibility, or security indicators.
- Do not make Reports, Findings, or Approvals look like the same screen unless the state is intentionally shared.
- Do not claim production readiness until `npm.cmd run qa:release` returns `ok: true` with real production inputs.

## 4. Product Definition

GENIUS is named GENIUS because it is a new expanded business operating system with everything needed for an AI-assisted B2B company workspace:

- Evidence intake
- AI extraction
- Diagnostics
- Savings radar
- Approval workflows
- AI Gateway decision inbox
- Team CRM and operations tasks
- B2B collaboration bridge
- Excel workspace
- Agent control
- Reports
- Security and settings
- Support and learning
- Guest mode and portable workspace sessions

The product is unique because it connects separate business workflows into one evidence-backed system. A normal dashboard shows data. GENIUS turns uploaded and connected evidence into findings, actions, approvals, reports, and audit trails.

Core positioning:

> GENIUS is an evidence-backed AI command center for B2B teams. It helps businesses detect risks, find savings, control AI recommendations, approve actions safely, and generate board-ready reports from real operational data.

## 5. AI Gateway: Why "Order 100 kg of mushrooms" Does Not Change

The text:

`Order 100 kg of mushrooms`

and the related description:

`Replenish inventory to optimize availability and prevent stockouts based on rising demand and projected inventory depletion in 3-5 days.`

is not a theme setting and not permanent marketing copy.

It is seed or fallback operations data from the local workspace state. It appears when no newer dynamic operations report has replaced the first gateway report.

Current source area:

- `lib/server/workspace-state.js`
- `defaultGatewayReports`
- AI Gateway displays `operations.gatewayReports`
- `components/genius/sections/ai-gateway.jsx`

How it should work:

- If a new Team CRM or operations report is submitted, AI Gateway should show that new request.
- If the selected Gateway report is updated, the title, action, reasoning, confidence, metrics, impact, notes, and audit trail should update.
- If there are no real reports, the fallback demo report can remain visible.
- The UI must treat the mushroom example as sample data only.

Design instruction:

- Do not hardcode "mushrooms" in the design.
- Build the layout around dynamic fields:
  - report title
  - sender
  - role or team
  - date
  - status
  - urgent flag
  - decision summary
  - recommended action
  - reasoning
  - confidence
  - metrics
  - impact
  - evidence
  - notes
  - audit log
- If the report is demo data, display a small "Demo data" or "Sample operations report" indicator.
- If the report is live data, display "Live workspace report" or no demo label.

Expected AI Gateway tabs:

- Overview: short decision summary, recommended action, confidence, urgency, key metrics, execution status.
- Details: full reasoning, request context, team/sender, role, department, linked task, business impact.
- Forecast: demand trend, stock or capacity forecast, projected depletion or risk timeline, expected savings or revenue impact.
- Evidence: linked source rows, uploaded evidence, operations notes, delivery log, raw data references.
- Notes: human reviewer notes, decision comments, revision requests.
- Audit Log: approve/reject/revise events, data validation events, note additions, status changes.

Expected AI Gateway actions:

- Validate data
- Approve
- Approve and configure
- Request revision
- Reject
- Save note
- Open evidence
- Copy report ID

Locked or future execution states must be clear. Autonomous external execution must not look enabled unless production credentials and guardrails are actually configured.

## 6. Company Details: What Should Be In This Section

Company Details should explain the workspace business context. It should not ask for private personal identity unless needed. The product can work with role, position, department, section, and company context instead of requiring a user's full name.

Recommended location:

- Settings > Account: personal access and role context.
- Settings > Workspace: company and workspace details.
- Main onboarding after registration or guest mode: initial company setup.

Required Company Details content:

- Workspace display name
- Company or organization name
- Business type or industry
- Company size
- Main region or headquarters
- Primary operating country
- Default timezone
- Default currency
- Fiscal year start
- Business units
- Departments or sections
- User role
- User position
- User department
- Workspace owner role
- Member count
- Storage backend status
- Supabase/local workspace status
- Data residency note
- Demo or live workspace indicator

Recommended optional fields:

- Legal company name
- Website
- Business model
- Customer segment
- Procurement owner
- Finance owner
- Operations owner
- Security owner
- Default approval threshold
- Risk tolerance level
- Preferred report cadence

Security and privacy rules:

- Do not show raw member emails in public workspace snapshots.
- If an email must appear for the current signed-in user, mask it when possible.
- Member lists should show role, position, department, and status first.
- Do not show auth provider secrets, invite token internals, Supabase keys, API keys, or session cookies.
- Guest mode should show "Guest workspace" or "Local guest mode" clearly.

Suggested Company Details layout:

- Header: company/workspace name, status badge, storage backend.
- Business Profile panel: industry, size, region, currency, timezone.
- Operating Model panel: departments, business units, fiscal year, approval threshold.
- Access Context panel: current role, position, department, permissions summary.
- Workspace Controls panel: refresh, export, import, load demo, delete workspace data.
- Data Safety panel: residency, masking, RLS, audit logging, retention.

## 7. Reports: Why Findings and Approvals Look Like The Initial Screen

Reports currently combines the Executive Summary, Findings, and Approvals sections so the screen does not feel empty. That is useful for demo coverage, but it should not be the final UX.

Final design should separate the purpose of each tab:

- Executive Summary: board-level narrative and KPI overview.
- Metrics: numeric performance, trends, comparison, confidence, coverage.
- Findings: risk and opportunity drill-down.
- Approvals: decision and approval drill-down.
- Proof Chain: how evidence, findings, actions, and reports connect.
- Linked Evidence: source documents, files, rows, URLs, and uploaded evidence.

### Findings Tab

The Findings tab should not be a copy of the executive summary.

It should show:

- Finding title
- Category
- Severity
- Impact
- Confidence
- Status
- Owner
- Linked evidence
- Proof trail ID
- Recommended action
- Related approval/action
- "Take Action"
- "Add to backlog"
- "Open evidence"

Recommended visual structure:

- Left: filter rail or grouped categories.
- Center: findings table or dense cards.
- Right: selected finding detail panel.
- Top: severity/impact summary strip.

Finding groups:

- Spend risk
- Renewal risk
- Data quality
- Ownership gaps
- Live operations
- Inventory or fulfillment
- Contract leakage
- Approval backlog

### Approvals Tab

The Approvals tab should not be a copy of the executive summary.

It should show:

- Approval title
- Approval ID or action ID
- Status
- Priority
- Due date
- Requester
- Approver or owner
- Business impact
- Confidence
- Linked finding
- Linked evidence
- Decision history
- Human decision buttons where permissions allow them

Recommended visual structure:

- Left: approval queue grouped by status.
- Center: approval detail table.
- Right: selected approval decision panel.
- Top: open, urgent, approved, rejected, delegated, and SLA counters.

Approval actions:

- Approve
- Reject
- Request evidence
- Delegate
- Snooze
- Mark done
- Reopen
- Open evidence
- Open related report

## 8. Settings: What Each Section Should Contain

Current Settings navigation:

- Account
- Workspace
- Auth & Login
- AI Provider
- Security & Data
- Notifications
- Connectors
- Agent Guardrails
- Feature Modes
- Billing

### Account

Purpose: personal workspace context and account controls.

Should contain:

- Current user identity label
- Role
- Position
- Department
- Workspace name
- Access role
- Profile/preferences summary
- Recent sign-ins
- Sessions shortcut
- Trusted devices shortcut
- Roles and permissions shortcut
- Notification preferences shortcut
- Portable workspace export/import
- Sign out

Do not require full name as mandatory. Role, position, department, and workspace context are enough.

### Workspace

Purpose: company and tenant-level workspace controls.

Should contain:

- Workspace ID
- Workspace name
- Company details
- Company size
- Business type
- Department structure
- Business units
- Storage backend
- Supabase/local mode indicator
- Member count
- Refresh workspace
- Export workspace JSON
- Import workspace JSON
- Load investor demo data
- Delete MVP workspace data

Important:

- Import/export must be described as portable workspace data without auth secrets.
- Delete must remain visually dangerous and permission-gated.
- Demo loading must clearly replace current MVP workspace data.

### Auth & Login

Purpose: authentication, access, member management.

Should contain:

- Current session
- Auth mode: guest, email/password, or future SSO
- Current role
- Position
- Department
- Workspace members table
- Member role changes
- Disable member
- Invite member
- Invite link copy
- Session revoke shortcut
- Sign out

Do not expose:

- Raw auth secrets
- Password hashes
- Supabase service role keys
- Session cookies
- Full invite token internals

Raw emails should be avoided or masked unless the current form specifically needs an email input for invite creation.

### AI Provider

Purpose: AI model/provider control and status.

Should contain:

- Active provider: Gemini or configured provider
- Provider status
- Model name
- Fallback mode
- Langflow demo agent status
- Confidence threshold
- Auto approval limit
- Cost or usage guardrail
- Last AI run status
- Provider error state
- Locked production controls if API keys are missing

Visual states:

- Ready
- Fallback
- Missing key
- Rate limited
- Disabled
- Demo only

Do not expose API keys.

### Security & Data

Purpose: workspace data protection, policies, auditability.

Should contain:

- RLS enabled
- Audit logging
- Export restriction
- Data masking
- Auto purge
- Soft delete
- Retention policy
- Audit log preview
- Export workspace
- Security checklist
- Data residency
- Encryption status
- Production release warnings if env is incomplete

Current important policy toggles:

- `rlsEnabled`
- `auditLogging`
- `restrictExport`
- `dataMasking`
- `autoPurge`
- `softDelete`

Do not make these look like purely decorative toggles. If a setting is UI policy only, label it clearly. Server permissions remain authoritative.

### Notifications

Purpose: notification channels and event categories.

Should contain:

- Email toggle
- In-app toggle
- SMS toggle
- Slack toggle
- Urgent approvals
- Failed ingestion
- Weekly digest
- Security alerts
- Quiet hours start/end
- Read/dismiss notification behavior

If an external channel is not configured, show "Not connected" or "Locked until provider setup".

### Connectors

Purpose: external data source setup and request management.

Should contain:

- Connected sources
- Requested connectors
- Connector health
- Last sync
- Filters
- Schema preview
- Retry or refresh state
- Setup guide link
- Support request link
- Locked credential fields

Connector categories:

- Accounting
- CRM
- Database
- Spreadsheet
- Email
- Storage
- Procurement
- Analytics

Do not show real credential values.

### Agent Guardrails

Purpose: controls for AI agent safety.

Should contain:

- Human approval required
- Maximum auto-approval threshold
- Forbidden actions
- External execution disabled/enabled state
- Required evidence threshold
- Confidence threshold
- Review queue
- Escalation rules
- Langflow demo agent card
- Last agent run
- Agent audit log shortcut

Important:

- Agents can draft and recommend.
- Humans approve important actions.
- Autonomous external execution must remain locked unless production execution credentials and policy are configured.

### Feature Modes

Purpose: product capability switches and roadmap states.

Should contain:

- Genius Deep
- Genius Audit
- Autonomous Execution
- Contract Repository
- Excel AI
- AI Gateway
- Team CRM
- B2B Bridge
- Langflow Demo Agent

Each mode must show one of:

- Active
- Demo
- Locked
- Requires setup
- Coming next

Do not make locked modes look fully usable.

### Billing

Purpose: plan and commercial readiness.

Should contain:

- Current plan
- Usage summary
- Seats or members
- Storage usage
- AI usage estimate
- Plan limits
- Billing contact placeholder
- Invoice list placeholder
- Upgrade/contact sales state

Until payments are integrated, mark billing as "Demo", "Not connected", or "Coming after Stripe/provider setup".

## 9. Main Screen Additions: News, Updates, and Learning

The main screen before registration should help the user understand the product without turning the product into a marketing-only site.

Current route:

- `/`
- `app/page.js`
- `components/genius/landing-page.jsx`

Recommended sections to add:

### Product Updates

Purpose: show that the product is active and evolving.

Content:

- Latest release notes
- New features
- Security improvements
- Connector updates
- AI agent updates
- Known limitations
- Coming next

Recommended card fields:

- Date
- Category
- Title
- Short description
- Status: shipped, beta, planned
- Link or action

Example categories:

- Release
- Security
- AI
- Connectors
- Reporting
- UX

### News

Purpose: business context and product credibility.

Content:

- Company announcements
- Investor/demo milestones
- Integration roadmap
- Product lessons
- Customer-style use cases

For MVP, this can be static content. Do not fake real press coverage unless it is clearly labeled as product update content.

### Learning or Tutorial

Purpose: explain how to use GENIUS with screenshots, images, and short steps.

Recommended tutorial modules:

- What GENIUS does
- How evidence becomes findings
- How findings become approvals
- How AI Gateway reviews operations decisions
- How Reports become board-ready
- How guest mode works
- How portable workspace export/import works
- How security and data masking work

Recommended structure:

- Step number
- Screenshot or image
- Title
- One short explanation
- "Open section" or "Start demo" action

Learning flow:

1. Create or enter workspace.
2. Upload evidence or load demo data.
3. Review extracted data.
4. Confirm findings.
5. Review diagnostics and savings.
6. Approve or revise actions.
7. Generate report.
8. Export or share workspace/report.

Image guidance:

- Use real product screenshots when possible.
- Use generated bitmap images only when a real screenshot is not available.
- Do not rely only on abstract SVGs.
- Images should show actual product states, not vague technology art.

## 10. Visual Design Rules

GENIUS should feel like a serious B2B operating system:

- Dense but readable.
- Premium but not decorative.
- Operational, not playful.
- Clear hierarchy.
- Real tables, controls, and status indicators.
- No huge empty centered panels in workspace sections.
- No duplicated cards inside cards.
- No fake hero-only product experience.

Default target:

- Desktop browser viewport around 1920x1080.
- Workspace sections should use the full available width.
- The UI should remain usable at 1366x768.
- Browser zoom should be checked at 80 percent, 100 percent, 125 percent, and 150 percent.

Layout rules:

- Use stable widths, min-widths, max-widths, grid tracks, and overflow handling.
- Tables should scroll horizontally only when needed.
- Buttons must not clip text.
- Icons should use existing icon patterns.
- Do not let sidebars squeeze main panels into unusable widths.
- Avoid over-centered content with empty side margins in workspace views.
- Avoid huge marketing-style cards inside operational screens.
- Use cards for repeated items, modals, and framed tools only.

Color rules:

- Keep the existing dark operational style.
- Keep status colors consistent:
  - Green/primary: ready, approved, healthy
  - Blue/info: evidence, AI, links, neutral active states
  - Amber/warning: needs review, pending, medium risk
  - Red/critical: blocked, high risk, delete, reject
  - Muted: locked, disabled, unavailable
- Do not turn the entire UI into one flat color theme.
- Do not add decorative gradient orbs or unrelated background effects.

Typography rules:

- No viewport-based font scaling.
- No negative letter spacing.
- Use compact headings inside dashboards.
- Use hero-scale typography only on the main landing/product screen.
- Long labels must wrap or truncate cleanly.

## 11. Dynamic Data Contracts To Preserve

These workspace areas already connect sections together. Do not break these bindings.

Core workspace arrays:

- evidence
- vendors
- contracts
- invoices
- spendRows
- liveEvents
- findings
- actions
- reports
- agentRuns
- auditLog
- notifications
- supportTickets
- connectorRequests
- reportSchedules
- chatConversations
- excelWorkspaceViews
- workspaceArtifacts
- operations.gatewayReports

Important workspace methods:

- loadWorkspace
- resetWorkspace
- loadDemoWorkspace
- exportWorkspace
- importWorkspaceFile
- createGuestWorkspace
- submitTeamReport
- updateGatewayReport
- sendB2bMessage
- updateB2bWorkflowStatus
- createCrmTask
- updateCrmTask
- updateNotification
- runAgent
- saveExcelWorkspaceView
- saveWorkspacePreferences
- listWorkspaceSessions
- revokeWorkspaceSession

For visual work, use these existing bindings. Do not create separate fake state unless it is purely local UI state such as an open drawer or selected tab.

## 12. Empty, Demo, Locked, and Live States

Every major section should have clear states:

### Empty

When no data exists:

- Explain what is missing.
- Give a direct next action.
- Example: upload evidence, load demo, create task, request connector.

### Demo

When using deterministic investor demo data:

- Show a subtle "Demo data" indicator.
- Keep functionality real where it is already wired.
- Do not pretend demo data is customer production data.

### Locked

When a provider or production integration is missing:

- Show why it is locked.
- Show what setup is required.
- Keep the UI premium, not broken.

### Live

When real workspace data exists:

- Prefer real values over fallback sample content.
- Hide demo labels.
- Show source/evidence/audit context.

## 13. Investor Demo Flow To Preserve

The investor demo should be able to show:

1. Main product screen.
2. Registration or guest mode.
3. Workspace opens.
4. Load demo or use existing workspace data.
5. Command Center shows operational KPIs.
6. Data Intake shows evidence.
7. Diagnostics shows risks.
8. Savings Radar shows opportunities.
9. AI Gateway shows decision recommendations.
10. Team CRM shows tasks.
11. B2B Bridge shows collaboration workflow.
12. Excel Workspace shows spreadsheet rows and findings.
13. Approvals show human-controlled decisions.
14. Reports show board-ready output.
15. Settings show security, auth, and workspace control.
16. Support/Learning explains usage and troubleshooting.

Do not break navigation between sections.

## 14. Specific Design Tasks For Gemini

Gemini may work on these without changing backend contracts:

- Improve the main screen with Product Updates, News, and Learning/Tutorial sections.
- Make AI Gateway visually clear that the selected report is dynamic.
- Add demo/live badges where needed.
- Redesign Reports Findings tab as a real drill-down.
- Redesign Reports Approvals tab as a real approval drill-down.
- Expand Settings visual structure for all sections, even if some controls remain locked.
- Improve Company Details presentation inside Settings > Workspace and/or onboarding.
- Improve empty/demo/locked/live state visuals.
- Fix visual overflow, cramped cards, clipped text, broken scaling, and excessive side margins.
- Keep full-width workspace section layouts.
- Polish 1920x1080 desktop behavior.
- Verify 80 percent, 100 percent, 125 percent, and 150 percent browser zoom.

Gemini must not:

- Change auth/session logic.
- Change Supabase service-role handling.
- Remove masking/redaction.
- Disable permission checks.
- Delete existing API routes.
- Replace workspace context with mock-only state.
- Add new production claims without passing release QA.

## 15. Acceptance Checklist For Visual Work

Before handing work back:

- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- No React duplicate key warnings in console.
- No obvious console runtime errors.
- Main screen opens.
- Login/register screen opens.
- Guest mode or existing session can enter workspace.
- Workspace uses full width on desktop.
- No main panels are squeezed into the center with empty side margins.
- AI Gateway no longer looks like the mushroom example is permanent copy.
- Reports Findings and Approvals have distinct visual purposes.
- Settings sections are understandable and not all generic locked placeholders.
- Company Details is clear.
- No raw emails are shown outside intentional invite input/current-user context.
- No auth tokens, keys, or secrets appear in UI.
- Buttons either work, are permission-disabled, or clearly state locked/setup-required.
- 1920x1080 is polished.
- 1366x768 is usable.
- Zoom 80 percent, 100 percent, 125 percent, and 150 percent is usable.

## 16. Suggested Copy Blocks

Use short, direct copy. Avoid long explanations inside dense product screens.

### Company Details copy

Title:

`Company Details`

Description:

`Define the business context GENIUS uses for workspace defaults, approvals, reporting, and AI recommendations.`

Data safety note:

`GENIUS stores workspace context separately from auth secrets. Member emails and sensitive identifiers stay masked in public workspace data.`

### AI Gateway demo note

`This is sample operations data. New team reports and live operations events will replace the recommendation content.`

### Reports Findings note

`Findings connect business risk, evidence, confidence, impact, and the next recommended action.`

### Reports Approvals note

`Approvals show which AI-recommended actions require human review before execution.`

### Settings locked state note

`This control is visible for product completeness but requires production provider setup before it can be changed.`

### Guest mode note

`Guest mode stores the workspace locally for evaluation. Export a portable GENIUS file to keep your session data.`

## 17. Final Direction

Design should make GENIUS feel complete and understandable, but it must stay honest:

- Demo data is demo data.
- Locked integrations are locked.
- Human approval remains required for risky actions.
- Security is part of the product, not decoration.
- Reports and decisions must be evidence-backed.
- The UI must support real workspace data as soon as Supabase and production deployment are connected.

