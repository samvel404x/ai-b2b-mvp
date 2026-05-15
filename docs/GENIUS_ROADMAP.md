# GENIUS - Full Product Roadmap

Last updated: 2026-05-14

## 1. Product Decision

GENIUS must not start as "AI for every business problem." That is too broad for one founder and too hard to sell.

GENIUS starts as an AI business leak analyst for B2B companies.

Core promise:

> GENIUS finds where your business is losing money, proves it with evidence, and prepares actions for approval.

The product should feel like a temporary finance/ops analyst that watches business data, explains risk, and prepares the next move. It should not pretend to be a fully autonomous employee in V1.

## 2. Corrected Strategy

### What changes from the old roadmap

1. The old "conversation analyzer" is useful, but too narrow as the main company.
2. The old "RenewalRadar" idea is strong, but contract renewal tracking alone is not enough because similar tools already exist.
3. GENIUS should combine renewal risk, spend leakage, duplicated tools, invoice mismatch, and action preparation.
4. AI agents are allowed in V1 only as supervised agents, not autonomous operators.
5. Mobile app is not V1. Mobile becomes useful later for approvals and monitoring.
6. The dashboard is not the product. The product is money found, evidence shown, and actions prepared.

### New focus

Start with:

**GENIUS Spend & Operations Leak Agent**

It helps small and mid-sized B2B companies find money leaks in contracts, invoices, subscriptions, and business operations.

## 3. Exit Goal

Target sale price: at least $50,000.

A realistic path:

- 15 customers at $99/month = $1,485 MRR.
- Annual recurring revenue = about $17,820.
- A simple micro-SaaS can potentially sell around 2-4x ARR if churn is low and the product is clean.
- At 3x ARR, $17,820 ARR becomes about $53,460.

Minimum business target before trying to sell:

- $1,500+ MRR.
- 10-20 active B2B customers.
- At least 3 case studies showing real money found or risk prevented.
- Clean codebase, clean onboarding, simple deployment.
- Low support burden.

## 4. Ideal Customer

### Primary buyer

Founder, COO, Head of Finance, Ops Manager, or RevOps lead at a B2B company.

### Company profile

- 10-200 employees.
- Uses many SaaS tools.
- Has vendor contracts, invoices, and subscriptions.
- Does not have a dedicated finance analyst or procurement team.
- Tracks contracts in spreadsheets, email, Notion, Google Drive, or memory.

### Pain

They lose money through:

- missed renewal windows;
- unused subscriptions;
- duplicated SaaS tools;
- invoices higher than contract terms;
- contracts with no clear owner;
- manual follow-up;
- no one watching financial/ops details every week.

## 5. V1 Product Scope

V1 should be small, useful, and sellable.

### Build in V1

1. Upload contract PDFs.
2. Upload invoice/spend CSV files.
3. AI extracts structured fields from documents.
4. User reviews and confirms extracted data.
5. Dashboard shows money at risk.
6. GENIUS creates leak findings with evidence.
7. GENIUS prepares recommended actions.
8. User approves, rejects, or edits each action.
9. Weekly email report summarizes risks and actions.

### Do not build in V1

- Mobile app.
- Native CRM integrations.
- Native bank integrations.
- Slack integration.
- Google Drive sync.
- Multi-user teams and roles.
- Complex analytics charts.
- Autonomous email sending.
- Vendor negotiation automation.
- Marketplace of agents.
- Support, sales, and HR modules.

## 6. MVP User Flow

1. User opens GENIUS.
2. User uploads contract PDF or spend CSV.
3. GENIUS extracts important fields.
4. User sees a review screen and confirms/corrects data.
5. GENIUS stores the confirmed data.
6. Dashboard updates "money at risk."
7. GENIUS shows findings:
   - what is wrong;
   - why it matters;
   - estimated money impact;
   - evidence source;
   - recommended next action.
8. User opens Approvals.
9. User approves, rejects, or edits actions.
10. GENIUS sends weekly summary.

## 7. Main Screens

### 1. Dashboard

Purpose: show the business owner what needs attention today.

Widgets:

- Money at risk.
- Upcoming renewals.
- Open approvals.
- Highest impact leaks.
- Recently analyzed files.

### 2. Data Room

Purpose: upload and manage documents/data.

Sections:

- Contracts.
- Invoices.
- Spend CSVs.
- Extraction status.
- Review required.

### 3. Money Leaks

Purpose: show every detected risk.

Each leak card must include:

- title;
- impact estimate;
- confidence score;
- source evidence;
- severity;
- recommended action;
- owner/status.

### 4. Agents

Purpose: show AI workers and what they are responsible for.

V1 agents:

- Finance Watcher.
- Contract Analyst.
- Spend Auditor.
- Action Drafter.

### 5. Approvals

Purpose: control all AI actions.

Actions can be:

- approve;
- reject;
- edit;
- mark as done;
- snooze.

### 6. Reports

Purpose: weekly summaries and exportable reports.

Reports:

- weekly money risk report;
- renewal report;
- leak summary;
- action history.

### 7. Settings

Purpose: account, billing, theme, data deletion, company profile.

## 8. Agent Model

GENIUS agents are not magic. They are focused AI workflows with tools, memory, and permissions.

### Agent 1: Contract Analyst

Input:

- contract PDF;
- manually corrected fields.

Output:

- vendor name;
- contract value;
- start date;
- end date;
- notice period;
- auto-renewal risk;
- cancellation clause;
- payment terms;
- evidence snippets.

### Agent 2: Spend Auditor

Input:

- invoice CSV;
- SaaS spend CSV;
- confirmed vendor records.

Output:

- duplicate vendors;
- suspicious spend increase;
- missing owner;
- contract/invoice mismatch;
- recurring payments without contract.

### Agent 3: Finance Watcher

Input:

- saved contracts;
- dates;
- thresholds.

Output:

- upcoming renewal alerts;
- overdue review alerts;
- high-risk vendor list.

### Agent 4: Action Drafter

Input:

- confirmed leak;
- user context;
- selected action type.

Output:

- email draft;
- internal task draft;
- vendor question draft;
- summary for manager.

### Permission rule

In V1, no agent can send, delete, cancel, update billing, or contact a vendor without user approval.

## 9. AI Prompt System

Prompts should be versioned like product code.

### Prompt groups

1. `contract_extraction`
2. `invoice_spend_analysis`
3. `leak_detection`
4. `action_draft`
5. `risk_review`
6. `weekly_report`

### Output format

All AI outputs should be structured JSON.

Every finding should include:

- `title`
- `category`
- `severity`
- `estimated_impact`
- `confidence`
- `evidence`
- `recommended_action`
- `requires_approval`

Free-form AI text should not drive the UI.

## 10. Trust And Safety

B2B users will not trust GENIUS unless it feels controlled and serious.

Required:

- human approval for actions;
- audit log for every AI recommendation;
- source evidence on every finding;
- confidence score;
- delete workspace data;
- no training on customer data;
- encrypted secrets;
- clear billing;
- clear data retention policy.

Later:

- SOC 2 readiness;
- role-based permissions;
- single sign-on;
- admin activity logs;
- data residency options.

## 11. Design Direction

Brand name: GENIUS.

Style:

- premium B2B;
- dark and light theme;
- soft green neon accent;
- clean left sidebar;
- dashboard-first experience;
- not playful, not cartoonish, not crypto-looking.

### Suggested colors

Dark theme:

- background: `#07110d`
- surface: `#0d1913`
- elevated surface: `#122118`
- border: `#1f6f45`
- accent: `#33d17a`
- muted green: `#9fe6bd`
- text: `#eef8f1`
- secondary text: `#9fb3a7`

Light theme:

- background: `#f7fff9`
- surface: `#ffffff`
- border: `#b7e8c9`
- accent: `#12a865`
- text: `#102019`
- secondary text: `#577064`

Risk colors:

- high risk: red;
- medium risk: amber;
- low risk: green;
- info: blue-gray.

The interface should not be only green. Risk and finance information need contrast.

## 12. Pricing

### V1 pricing

Starter:

- $49/month.
- 25 vendors/contracts.
- weekly report.
- manual upload.

Pro:

- $99/month.
- 100 vendors/contracts.
- advanced leak detection.
- export reports.

Done-for-you onboarding:

- $299 one-time.
- founder manually helps upload first files and creates first report.

### Why this pricing

The customer is not paying for AI words. They are paying to prevent money loss.

One prevented $2,000 renewal can justify a year of subscription.

## 13. 12-Week Build And Launch Plan

### Week 1: Product foundation

Goal: make GENIUS feel real.

Build:

- landing/dashboard shell;
- dark/light theme;
- left sidebar;
- fake demo data;
- core screens;
- product copy;
- first visual identity.

Definition of done:

- user can open the app and understand what GENIUS does in 10 seconds.

### Week 2: Upload and extraction

Build:

- contract upload;
- CSV upload;
- extraction API route;
- structured JSON output;
- review screen.

Definition of done:

- user uploads a contract and sees extracted fields.

### Week 3: Data model and dashboard

Build:

- database tables;
- save confirmed vendors/contracts;
- dashboard metrics;
- renewal table;
- basic money-at-risk calculation.

Definition of done:

- user can save real data and return later.

### Week 4: Leak detection

Build:

- leak cards;
- severity;
- confidence;
- evidence;
- estimated impact.

Definition of done:

- GENIUS can find at least 3 useful risk types from uploaded data.

### Week 5: Agent queue

Build:

- Agents screen;
- Approvals screen;
- action drafts;
- approve/reject/edit flow.

Definition of done:

- AI can recommend an action and user can approve/reject it.

### Week 6: Reports and billing

Build:

- weekly report;
- exportable summary;
- pricing page;
- payment flow.

Definition of done:

- product can take payment.

### Week 7-8: First customer testing

Goal:

- onboard 5 real businesses manually.
- analyze real contracts/spend files.
- record where AI is useful and where it is wrong.

Do not add big features.

### Week 9-10: Fix trust problems

Improve:

- extraction accuracy;
- evidence display;
- onboarding;
- error states;
- data deletion;
- report clarity.

### Week 11-12: Sellable MVP

Goal:

- 10 paying customers or strong pipeline.
- 3 case studies.
- clean demo.
- simple buyer-facing landing page.

## 14. Scaling Roadmap

### Phase 1: Manual upload MVP

Data sources:

- PDF contracts;
- CSV spend exports;
- invoices.

Goal:

- prove value manually.

### Phase 2: Better memory and company profile

Add:

- company profile;
- vendor owners;
- departments;
- tags;
- custom thresholds.

Goal:

- make GENIUS more accurate for each business.

### Phase 3: Integrations

Add only after paying users request them.

Priority:

1. Gmail/Google Workspace for renewal emails.
2. Slack for alerts.
3. Google Calendar for renewal reminders.
4. QuickBooks/Xero for spend data.
5. HubSpot/Pipedrive for revenue leakage later.

### Phase 4: Mobile approvals

Mobile should not be a full app first.

Start with:

- mobile-friendly web approval screen;
- push/email approval links;
- "approve/reject/edit" from phone.

Build native mobile only after daily approval usage is proven.

### Phase 5: Multi-agent operations

Add role packs:

- Finance Agent Pack.
- RevOps Agent Pack.
- Support QA Agent Pack.
- Founder Daily Brief Agent.

Each role pack must solve one measurable business loss.

### Phase 6: Enterprise readiness

Add:

- teams;
- roles;
- audit logs;
- SSO;
- SOC 2 readiness;
- admin controls;
- integration marketplace.

Do not build this before real revenue.

## 15. Go-To-Market

### First validation message

"Hey, quick question: how do you currently track SaaS/vendor renewals and make sure you are not paying for unused tools?"

Good reply signals:

- "spreadsheet";
- "we do not really track it";
- "finance handles it manually";
- "we missed one before";
- "I hate this";
- "send me what you are building."

### First offer

"I am building GENIUS, an AI ops analyst that finds money leaks in contracts and SaaS spend. I can run a free first audit on 5 contracts or a spend CSV and show you what it finds."

### First paid offer

"If the audit finds useful risks, early access is $49/month. I will personally onboard your first data."

## 16. Metrics

### Product metrics

- uploads per account;
- confirmed extracted records;
- number of leaks found;
- number of approved actions;
- weekly active accounts;
- repeat logins;
- report opens.

### Business metrics

- MRR;
- paid customers;
- churn;
- activation rate;
- time to first leak;
- estimated money found;
- support time per customer.

### Sale readiness metrics

- $1,500+ MRR;
- 10-20 paying customers;
- churn under control;
- clear onboarding;
- no founder-only manual work required for normal usage;
- demo account ready;
- codebase deployable by another developer.

## 17. Risks

### Risk 1: AI output is generic

Fix:

- force evidence;
- require source fields;
- use structured outputs;
- test on real customer files.

### Risk 2: Product becomes too broad

Fix:

- keep V1 only on spend/contracts/operations leaks.
- reject sales/support/hr features until later phases.

### Risk 3: Customers do not trust uploads

Fix:

- privacy page;
- delete data button;
- clear data handling;
- manual demo mode with fake data;
- no autonomous action.

### Risk 4: Too much manual work

Fix:

- productize onboarding after first 5 customers.
- create templates and import rules.

### Risk 5: Competitors copy the feature

Fix:

- own the workflow, not just extraction.
- build evidence, approvals, reports, and agent queue.
- collect customer-specific vendor history.

## 18. What We Build First

The first coding milestone should be a high-quality frontend shell with fake data.

Files likely to change first:

- `app/page.js`
- `app/page.module.css`
- `app/globals.css`
- `app/layout.js`

First visible result:

- GENIUS dashboard;
- left sidebar;
- dark/light theme;
- money-at-risk cards;
- leak cards;
- agents panel;
- approvals queue.

After that, we add real backend behavior.

## 19. Final North Star

GENIUS should not look like a chatbot.

GENIUS should look like a serious AI control center for business leaks:

- it watches;
- it finds;
- it proves;
- it recommends;
- it waits for approval;
- it helps the founder move faster until the company hires the right person.

