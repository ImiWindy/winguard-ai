# Checklist Module

Adds per-user pre-trade checklists with versioned templates, scoring, and response persistence.

## Schema
- checklist_templates(user_id, version, items jsonb, is_active)
- checklist_responses(user_id, trade_id, template_version, responses jsonb, score, missing_critical_items jsonb, created_at)
- trades.checklist_score numeric
- RLS ensures users access only their data.

## API
- GET /api/checklist/template → returns active template (creates default if none)
- POST /api/checklist/template → saves new template version
- POST /api/checklist/responses → persists response (used server-side as well)
- GET /api/checklist/analytics → monthly average score (RPC example)

## Frontend
- ChecklistController intercepts form submit, opens ChecklistModal, stores JSON in hidden field, then resumes submit.
- /settings/checklist allows editing template and creating a new version.

## Scoring
- computeChecklistScore(items, responses) returns { score, missingCritical }.
- Score is saved to trades.checklist_score for analytics.

## Tests
- See modules/checklist/scoring.test.ts for unit tests.
