# GENIUS Product Design Context

This document is the source brief for Product Design work on GENIUS.

## Product

GENIUS is an evidence-backed AI operations workspace for B2B companies.

Core promise:

GENIUS finds where a business is losing money, proves it with source evidence, prepares the next action, and waits for human approval before anything is executed.

The product should not feel like a chatbot, a crypto dashboard, or a generic BI tool. It should feel like a serious operating workspace for finance, operations, procurement, and founder-led teams.

## Target User

Primary users:

- Founder, COO, Head of Finance, Ops Manager, RevOps lead.
- B2B company with 10-200 employees.
- Uses many SaaS tools, vendor contracts, invoices, spreadsheets, and manual tracking.
- Needs proof, control, and fast decisions more than decorative analytics.

Investor/demo audience:

- They need to see a real workflow, not just a beautiful shell.
- The demo must show upload/import, analysis, evidence, AI recommendation, approval, and report output.

## Differentiation

GENIUS is unique because it combines these into one approval-first workflow:

- Evidence-backed findings from files, tables, and connectors.
- AI analysis that produces structured findings, not only chat text.
- Supervised agents that recommend actions but cannot execute without approval.
- Human approval queue with approve, reject, edit, snooze, request evidence, and email confirmation.
- Proof trail and board-ready reporting from the same data.
- Excel/workbook analysis as a first-class workspace, not an afterthought.

The product value is not "AI answers." The product value is money found, risk explained, evidence shown, and action prepared safely.

## MVP Scope

Build all core sections needed for the MVP, not only three screens.

Required sections:

1. Command Center
   - Main operating overview.
   - Business health, money at risk, savings potential, evidence coverage, AI confidence, approvals, reports.
   - Evidence pipeline, decision queue, proof-backed findings.

2. AI Chat / Workbench
   - Workspace-aware AI chat.
   - Keeps conversation history.
   - Uses uploaded evidence and current findings.
   - Shows citations, proof trails, and recommended next actions.

3. Data Intake
   - Upload Excel/CSV/PDF.
   - URL intake.
   - Extraction review.
   - Confirm fields.
   - Send confirmed evidence to diagnostics and proof trail.

4. Diagnostics
   - Risk and data quality analysis.
   - Category table, selected issue inspector, related business impacts.
   - Must explain why a finding exists and which evidence supports it.

5. Savings Radar
   - Opportunity/risk ranking.
   - Impact, confidence, owner, source evidence, recommended action.
   - Create approval, ask AI, export, view proof trail.

6. Agents
   - Supervised AI agents.
   - Agent workload, status, confidence, guardrails, outputs, blocked actions.
   - Run selected, run all, view outputs, review approvals.

7. Approvals
   - Human decision queue.
   - Approve, reject, edit details, request more evidence, snooze, mark done.
   - Email confirmation should be the primary demo feature.

8. Excel Workspace
   - Spreadsheet intelligence.
   - Analyze rows, anomalies, duplicate payments, forecast variance, missing owners.
   - Suggested fixes and approval states.

9. Connectors
   - Business Live webhook and connector catalog.
   - Demo connectors can be simulated.
   - Show connection health, mapping, live events, retry queue.

10. Reports
   - Board-ready reports and proof packs.
   - Weekly risk report, savings proof pack, renewal risk report, action history.
   - Export formats can be simulated first.

11. Profile / Account
   - Minimal workspace profile, user info, workspace settings, data controls.

12. Support / FAQ
   - Can be simplified for MVP.
   - Should exist as a lightweight help/status area, not a huge build.

13. Settings / Security & Data
   - Can be simplified for MVP.
   - Must show data protection, provider status, retention/deletion controls.

## MVP Workflow

The primary demo should follow this path:

1. User uploads Excel/CSV/PDF or uses sample data.
2. GENIUS extracts structured fields.
3. User confirms extracted data.
4. Diagnostics identifies risk and data quality issues.
5. Savings Radar ranks opportunities.
6. AI Chat explains findings with evidence.
7. Agents draft recommended actions.
8. Approvals requires human confirmation.
9. Email confirmation demonstrates control.
10. Reports generate a board-ready summary.

## Functional Expectations

The MVP should prioritize a stable demo loop:

- Auth can be removed or simplified for now.
- Use sample workspace data if real backend data is missing.
- Real Excel/CSV upload and parsing should be prioritized.
- Supabase/database persistence should be added for workspace data, findings, approvals, and reports.
- AI output must be structured data, not free text driving UI.
- Every finding needs title, category, severity, impact, confidence, evidence, recommended action, and approval state.
- Buttons should do something visible even before full backend integration.
- Pagination, filters, dropdowns, checkboxes, tabs, and menus must be styled and interactive.
- Dropdown menus must match the dark theme and never open as white default browser UI when avoidable.

## Design Direction

Overall style:

- Premium enterprise.
- Functional and calm.
- Dense but readable.
- Built for repeated work, scanning, comparing, and approving.
- No cyber/game look.
- No decorative empty blocks.
- No huge marketing-style panels inside the app.

Navigation:

- Use a top horizontal navigation model similar in simplicity to a trading platform category bar.
- The old left sidebar can be removed or minimized because it consumes too much workspace.
- Top navigation should expose the main sections clearly.
- Keep top system chips for Provider, Database, Connectors, Data quality, and Open approvals.

Color and surface:

- Background: near-black graphite, not green.
- Surfaces: dark elevated panels with subtle borders.
- Primary action: restrained emerald.
- Evidence/proof links: blue.
- Warnings: muted amber.
- Critical risks: controlled red.
- Avoid neon saturation and oversized glow.
- Metrics should be legible and calm, not distracting.

Layout:

- Use tables and split-pane work areas as primary UI.
- Avoid empty vertical gaps.
- Avoid nested card-heavy layouts.
- Every block must have a clear purpose.
- Remove decorative content that does not help the user decide or act.
- Text must not overlap, clip, or overflow out of its panel.
- Circular metrics must keep numbers centered.
- Fixed bottom status bars should be removed or heavily minimized if they cover content.

Motion:

- Motion should be minimal, fast, and functional.
- Use subtle hover, pressed, menu open, row select, tab switch, and metric load animations.
- Do not use slow wow-effect transitions.
- Prefer 120-180ms transitions.

Buttons and controls:

- Buttons should look premium and consistent.
- Primary buttons: approve, create approval, publish, save.
- Destructive buttons: reject, delete.
- Secondary buttons: export, filters, view proof trail.
- Icon buttons need tooltips.
- Menus should support archive, rename, delete where applicable, especially chat history.

## Current Known Problems To Avoid

Previous iterations had these issues:

- Too much empty space.
- Blocks overlapping.
- Text clipped or outside cards.
- Bright cyber/game-like colors.
- Bottom status bar covering content.
- Sidebar consumed too much width.
- Dropdown/select menus were unstyled.
- Checkboxes were default/unstyled.
- Chat behaved like a static report instead of a real chat.
- Some pages had wrong section names or mismatched content.
- Reports, Agents, Diagnostics, Data Intake, and Approvals had overflow and positioning problems.

The next design should simplify structure before adding visual polish.

## Reference Assets

Use the old mockups for information architecture and content ideas, not as a strict visual target:

- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/01_auth_workspace_setup.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/02_command_center.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/03_ai_chat_workbench.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/04_data_intake.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/05_diagnostics.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/06_savings_radar.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/07_agents_agent_control.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/08_approvals.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/09_excel_workspace.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/10_connectors_business_live.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/11_reports_board_reports.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/12_support_faq.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/13_settings_security_data.png
- C:/Users/only/Downloads/genius_existing_mockups_corrected_sidebar_bg/_preview_contact_sheet.png

Use this only for top navigation direction:

- C:/Users/only/Downloads/Снимок экрана 2026-07-03 110313.png

## Implementation Strategy

Do not rebuild everything as a pixel-perfect clone.

Recommended design/build sequence:

1. Establish shared app shell with top navigation, system chips, page container, buttons, tables, tabs, dropdowns, checkboxes, metric cards, and panels.
2. Rebuild Command Center, Excel Workspace, Data Intake, Approvals, Savings Radar, AI Chat, Agents, Diagnostics, Connectors, and Reports using the same system.
3. Remove or simplify low-MVP content.
4. Add functional interactions: tabs, filters, pagination, row selection, menus, chat history, upload actions, approval actions.
5. Add backend persistence and AI workflows.

## Technical Context

Repository:

- C:/Users/only/Downloads/ai-b2b-mvp

Known stack:

- Next.js app.
- Main frontend currently lives under `app/`.
- Existing product UI has been concentrated in `app/genius-dashboard.js` and `app/page.module.css`.
- API routes and server helpers exist under `app/api/` and `lib/server/`.

Important engineering constraint:

- Read the project docs and current code before changing frontend or backend.
- The repo may contain dirty changes. Do not reset or revert unrelated user work.
- For Next.js-specific changes, read local `node_modules/next/dist/docs/` first because project rules say this Next.js version may differ from assumptions.

## Demo Success Criteria

The MVP is successful for July 18 if an investor can see:

- A serious product with a premium, functional interface.
- Upload or sample data intake.
- Evidence extraction/review.
- AI-generated finding with source evidence.
- Chat explanation grounded in workspace data.
- Agent recommendation.
- Human approval/reject/request evidence flow.
- Email confirmation for approved action.
- Updated metrics across sections.
- Board-ready report output.

