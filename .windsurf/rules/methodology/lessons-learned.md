---
trigger: model_decision
description: Project intelligence and lessons learned. Reference for project-specific patterns, preferences, and key insights discovered during development.
---

# Lessons Learned — ProjectApp

This file captures important patterns, preferences, and project intelligence that help work more effectively with this codebase. Updated as new insights are discovered.

---

## 1. Architecture Patterns

### Content Storage: Structured JSON over CMS
- Proposal sections, portfolio works, and blog posts use Django `JSONField` for content
- Each proposal section's `content_json` maps directly to a Vue component's props schema
- Blog supports dual format: structured JSON (preferred) with HTML fallback via `v-html`
- This avoids the need for a full CMS while keeping content rich and structured

### Single Django App: `content`
- All models, views, serializers, and services live in the `content` app
- This works for now but may need splitting if scope grows significantly
- Models are already split into individual files under `content/models/`

### Service Layer Pattern
- Business logic lives in `content/services/`, not in views
- Views are thin FBV wrappers that call service methods
- Services: `ProposalService`, `ProposalEmailService`, `ProposalPdfService`, `EmailTemplateRegistry`

---

## 2. Code Style & Conventions

### Backend: Function-Based Views (FBV)
- **All** DRF views use `@api_view` decorators, not class-based views
- Never convert to CBV unless explicitly requested
- Views file for proposals is very large (123K) — be careful with edits

### Frontend: Pinia Options API
- **All** Pinia stores use Options API pattern: `{ state, getters, actions }`
- Do NOT use Composition API (`setup()`) style for stores
- HTTP requests go through `stores/services/request_http` centralized service

### Bilingual Content Pattern
- Models have paired fields: `title_en`/`title_es`, `content_json_en`/`content_json_es`, etc.
- Frontend reads the appropriate field based on current locale
- Proposals have a `language` field (`es`/`en`) that determines which default content to use

### Naming Conventions
- Backend: snake_case for everything (Python standard)
- Frontend stores: snake_case file names (`portfolio_works.js`, `proposals.js`)
- Frontend components: PascalCase (`BusinessProposal/Greeting.vue`)
- Frontend composables: camelCase with `use` prefix (`useExpirationTimer.js`)

---

## 3. Development Workflow

### Backend Commands Always Need venv
```bash
source venv/bin/activate && <command>
# or
venv/bin/python <command>
```

### Huey Immediate Mode in Development
- When `DJANGO_ENV != 'production'`, Huey tasks execute synchronously
- No need to run Redis or Huey worker for development
- Tasks still need to be importable and functional

### Frontend Dev Proxy
- Nuxt proxies `/api`, `/admin`, `/static`, `/media` to Django at `127.0.0.1:8000`
- Both servers must be running simultaneously for full functionality
- In production, everything goes through Django (no separate Nuxt server)

### Test Execution Rules
- Never run the full test suite — always specify files
- Backend: `pytest backend/content/tests/<specific_file> -v`
- Frontend: `npm test -- <specific_file>`
- E2E: max 2 files per `npx playwright test` invocation
- Use `E2E_REUSE_SERVER=1` when dev server is already running

---

## 4. Production Deployment

### Build Flow
1. Frontend: `npm run build:django` → generates `backend/static/frontend/`
2. Backend: `python manage.py collectstatic` → copies to `backend/staticfiles/`
3. Restart: `sudo systemctl restart projectapp && sudo systemctl restart projectapp-huey`

### Django Serves Nuxt Pages
- The `serve_nuxt` catch-all view in `projectapp/views.py` serves pre-rendered Nuxt pages
- This is the LAST URL pattern — all other routes take priority
- CDN URL for assets configurable via `NUXT_APP_CDN_URL`

---

## 5. Email System

### Template Registry Pattern
- All emails defined in `EmailTemplateRegistry` with default content
- Admin can override content via `EmailTemplateConfig` model
- Admin can disable specific emails via `is_active` flag
- Preview rendering available for all templates

### 24h Cooldown Rule
- `last_automated_email_at` field on `BusinessProposal` tracks last automated email
- All automated email tasks check this before sending
- Manual sends (admin clicks "Send") bypass the cooldown

### Automations Pause
- `automations_paused` flag on `BusinessProposal` stops all automated emails
- Each Huey task checks this flag early and returns if paused

---

## 6. Proposal System Specifics

### Section Types Are Fixed
- 12 section types defined in `ProposalSection.SectionType` choices
- Each maps to a specific Vue component in `components/BusinessProposal/`
- Unique together constraint: `(proposal, section_type)` — one of each per proposal

### Heat Score (1-10)
- Pre-computed and cached in `cached_heat_score` field
- Updated by tracking endpoint and periodic task (`refresh_all_heat_scores`)
- Based on: view count, section time, recency, engagement patterns

### Change Log Types
- 20+ change types in `ProposalChangeLog.ChangeType`
- Includes: created, updated, sent, viewed, accepted, rejected, resent, expired, duplicated, commented, negotiating, reengagement, call, meeting, followup, note, calc_confirmed, calc_abandoned, auto_archived, status_change, cond_accepted, calc_followup

---

## 7. Testing Insights

### Backend conftest.py
- Custom coverage report with Unicode progress bars replaces default pytest-cov output
- `api_client` fixture provides unauthenticated DRF APIClient
- Content tests have their own `conftest.py` with model-specific fixtures

### E2E Flow Definitions
- Every navigation flow must be registered in `docs/USER_FLOW_MAP.md` and `frontend/e2e/flow-definitions.json`
- E2E tests must reflect real user integrations
- Follow quality standards from `docs/TESTING_QUALITY_STANDARDS.md`

### CI Sharding
- Playwright E2E tests are sharded into 5 parallel jobs
- Blob reports are merged after all shards complete
- Test quality gate runs after all test suites pass
