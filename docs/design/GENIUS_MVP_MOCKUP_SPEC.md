# GENIUS MVP Mockup Spec

Source mockup board: `docs/design/genius-mvp-mockups.html`

## Visual Lock

- Background: deep graphite / near black, not pure black.
- Primary action: emerald green.
- Proof links and evidence references: blue only.
- Warning: amber.
- Critical risk: red.
- Radius: 8px for panels, controls, rows.
- Motion: minimal, fast, functional.
- Layout language: dense B2B operating workspace, not marketing page.

## Working MVP Sections

1. Auth / Workspace Setup
   - Sign in, create workspace, provider status, Supabase security messaging.

2. Command Center
   - Business health, money at risk, savings potential, evidence coverage, AI confidence, approval queue, report readiness.
   - Main Evidence Graph pipeline.
   - Decision queue and active supervised agents.

3. AI Chat / Workbench
   - Chat history, evidence-grounded answer table, evidence context rail, active agents, open approvals, data quality.
   - Composer supports Upload, URL, Excel/CSV, Screenshot.

4. Data Intake
   - File upload, URL analysis, connector entry points, extraction review, confirmation, provider status, review actions, uploaded sources.

5. Diagnostics
   - Health score, risk category scores, proof coverage, backlog, exposure, confidence, selected diagnostic inspector.

6. Savings Radar
   - Evidence-backed opportunity ranking, impact, severity, confidence, source evidence, proof trail, recommended action, create approval.

7. Agent Control
   - Supervised agents, workloads, confidence, guardrails, blocked external actions, linked proof trails, approval queue.

8. Approvals
   - Human decision queue, evidence summary, AI recommendation, approve/reject/edit/snooze/mark done, timeline.

9. Excel Workspace
   - Spreadsheet anomaly surface, row/source proof, suggested fixes, approval state, export readiness.

10. Connectors / Business Live
   - Active: Upload, URL Analysis, Business Live webhook.
   - Demo: Google Sheets, CRM Export.
   - Locked: Gmail, Drive, QuickBooks/Xero, Shopify/WooCommerce, HubSpot/Pipedrive, Slack.

11. Reports
   - Weekly Risk Report, Savings Proof Pack, Renewal Risk Report, Action History.
   - Proof chain and linked evidence included.

12. Support / FAQ
   - Product docs, FAQ, support ticket, system status, security explanation.

13. Settings / Security & Data
   - Account, workspace, auth/login, AI provider, security/data, notifications, connectors, guardrails, feature modes.

## Future / Demo / Locked Labels

- Demo: Full CRM Layer, Contract Repository, Native Mobile App, Multi-Business OS, Billing, Marketplace Extensions.
- Locked: Autonomous execution, Genius Deep, Genius Audit, external write integrations.

## Implementation Rule

When moving these mockups into React, each metric must come from backend workspace state or an explicit QA sample load. Empty workspace must show setup CTA, not fake production values.
