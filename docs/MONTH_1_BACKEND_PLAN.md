# GENIUS Month 1 Backend Plan

Goal: ship a working MVP backend for manual customer onboarding before expanding features.

## Scope Rule

V1 has one active AI mode: Gemini 2.5 Flash through Google AI Studio free tier.

No autonomous actions, billing, native integrations, or multi-user permissions in month 1. Every AI output must be saved only after human review.

## Week 1: Evidence Backend Core

- File upload API for contracts, invoices, CSV, and text.
- Gemini extraction route with local fallback.
- Local MVP data store.
- Human review save flow.
- Clear provider status in the UI.

Done when a user uploads a file, sees extracted fields, edits them, saves them, and reloads without losing data.

## Week 2: Real Data Model

- Replace local JSON store with a production database.
- Add entities: workspace, evidence, vendors, contracts, invoices, findings, actions, audit log.
- Add validation boundaries for every mutation.
- Add delete workspace data flow.

Done when confirmed data is stored in normalized tables and can drive dashboard metrics.

## Week 3: Leak Detection Engine

- Renewal risk detection.
- Missing owner detection.
- Invoice or spend mismatch detection.
- Duplicate vendor or duplicate tool detection.
- Evidence-backed finding cards.

Done when GENIUS can create at least 3 useful findings from uploaded evidence.

## Week 4: Approvals And Reports

- Action draft API.
- Approve, reject, edit, done, and snooze states.
- Weekly report generation.
- Exportable summary.
- Basic backend tests for upload, review, findings, and approvals.

Done when a first customer can upload files, review data, see risks, approve actions, and receive/export a summary.

## Upgrade After Month 1

- More AI providers or paid tiers only after the MVP proves customer value.
- Native integrations only after manual upload flow is reliable.
- Multi-user roles only after single-workspace retention is solved.
