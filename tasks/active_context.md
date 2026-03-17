# Active Context — Corporación Fernando de Aragón

_Last updated: 2026-03-17 (post-coverage-report-emojis-and-test-gaps)_

---

## 1. Current State

The project is a **functional lead generation website** for a Colombian educational institution. Both backend and frontend are feature-complete for the initial scope:

- **Frontend**: 3 pages (Home, English, ProgramPage) covering all 15 programs with lead forms, WhatsApp CTA, responsive navigation, and animated UI
- **Backend**: Contact form API with email notifications, reCAPTCHA integration, custom User model, Django Admin, and scheduled background tasks (backups, profiling)
- **Infrastructure**: Huey + Redis task queue, django-dbbackup, django-silk profiling (optional), production settings with security hardening

The site is in a **production-ready state** for its core purpose (lead capture), with the main gaps being testing and SEO.

---

## 2. Recent Focus Areas

- **Coverage Report Emojis & Test Gap Closure (2026-03-17)** — Enhanced CI coverage report with emojis/formatting and covered uncovered test code:
  - `combine-coverage-reports.py`: bold suite names, emoji detail summaries (🐍🧪🎭), emoji indicators on uncovered files, `### ✅ Test Results` section with passed/failed/skipped counts
  - `ci-coverage.yml`: added `--junitxml` for pytest, vitest JSON reporter, to feed test results into combined report
  - Backend: new `test_fixtures_and_helpers.py` (9 tests) covering all conftest fixtures + helpers branches → conftest 100%, helpers 100%
  - Backend: `test_pytest_summary_total.py` multi-file test → 100%
  - Backend: converted dead mock bodies to `raise AssertionError` guards in `test_run_tests_suites.py`
  - Frontend: intermediate animation frame test for `AnimatedCounter.tsx` → 100% stmts/funcs/lines
  - **Result: Backend 108 tests, 99.6% total coverage; Frontend 114 unit tests, 100% stmts on AnimatedCounter**
- **CI Coverage Workflows (2026-03-17)** — Created `ci-coverage.yml` with 4 parallel/sequential jobs:
  - `backend-coverage`: pytest + coverage.py → `backend-coverage.json` artifact
  - `frontend-unit-coverage`: vitest + v8 → `coverage-summary.json` artifact
  - `frontend-e2e-coverage`: Playwright (with Django backend running) → `flow-coverage.json` artifact
  - `combined-report`: downloads 3 artifacts, runs `scripts/ci/combine-coverage-reports.py`, outputs unified Markdown to GitHub Job Summary
  - Triggers: push/PR to main/master + manual `workflow_dispatch`
- **E2E flow coverage unification (2026-03-17)** — Reviewed `docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md` and aligned implementation:
  - Unified flow IDs between `flow-definitions.json` and `USER_FLOW_MAP.md` (4 IDs renamed)
  - Added 2 missing flows: `public-navigation` (P1), `lead-whatsapp-cta` (P2)
  - Created 3 new E2E spec files: `public-english-page.spec.ts`, `public-navigation.spec.ts`, `lead-whatsapp-cta.spec.ts`
  - Updated `@flow:` tags in existing 3 spec files to match new canonical IDs
  - Added JSON reporter to `playwright.config.ts`
  - Fixed windsurf rule: removed reference to non-existent `generate-coverage.js`
  - **Result: 6/6 flows covered, 17 E2E tests passing, 0 failures**
- **Test infrastructure setup (2026-03-17)** — Comprehensive test quality and coverage improvement:
  - Backend: Added `test_email_service.py` (6 tests) covering `EmailService` — `base_feature_app` now at **100% coverage** (75 tests)
  - Frontend unit: Set up Vitest with `@testing-library/react`, created 4 test files (22 tests) covering `api.ts`, `programs.ts`, `curriculum.ts`, `routes.ts`
  - Frontend E2E: Set up Playwright with Chromium, created 3 E2E test files (9 tests) covering home page, contact form, program navigation
  - Quality gate: Fixed 4 errors (forbidden tokens in test names, useless assertions) — **quality gate now passes** (0 errors, 4 warnings)
- **General cleanup (2026-03-17)** — Backend: removed `django_attachments/` (unused app), `utils/auth_utils.py` (empty), `easy-thumbnails` dep, cleaned settings.py/pytest.ini. Frontend: removed `imports/pasted_text/` (14 raw source files), 7 unused npm deps.
- Memory Bank initialization — created methodology documentation files with full codebase deep-dive

---

## 3. Active Decisions & Considerations

| Decision | Status | Notes |
|----------|--------|-------|
| Coverage report emojis + test results | ✅ Done | Bold names, emoji summaries, test results section, JUnit XML + vitest JSON |
| Frontend testing framework (Vitest) | ✅ Done | `vitest.config.ts`, setup file, 16 test files, 114 tests passing |
| E2E testing with Playwright | ✅ Done | `playwright.config.ts`, 6 E2E files, 17 tests, 6/6 flows covered |
| SEO strategy (meta tags vs SSR/SSG) | Pending | Current SPA model limits SEO; needs evaluation |
| django_attachments | Removed | Deleted in cleanup (2026-03-17) |
| User authentication for public site | Deferred | Not needed for lead generation scope |

---

## 4. Development Environment Summary

| Component | URL | Status |
|-----------|-----|--------|
| Backend (Django) | `http://localhost:8000` | ✅ Ready |
| Frontend (Vite) | `http://localhost:5173` | ✅ Ready |
| Django Admin | `http://localhost:8000/admin` | ✅ Ready |
| API Health Check | `http://localhost:8000/api/health/` | ✅ Ready |
| Redis (Huey) | `redis://localhost:6379/1` | Required for production tasks |

### Key Commands

```bash
# Backend
source backend/venv/bin/activate
python manage.py runserver

# Frontend
cd frontend && npm run dev

# Backend tests
cd backend && pytest -v
cd backend && pytest --cov

# Frontend unit tests
cd frontend && npm test
cd frontend && npm run test:coverage

# Frontend E2E tests
cd frontend && npm run e2e
cd frontend && npm run e2e:coverage

# Fake data
python manage.py create_fake_data
python manage.py delete_fake_data --confirm
```

---

## 5. Next Steps

### Immediate (High Priority)

1. ~~**Set up frontend testing**~~ ✅ Done — Vitest configured, 22 tests passing
2. ~~**Set up E2E testing**~~ ✅ Done — Playwright configured, 9 tests passing (3 flows)
3. ~~**Add missing backend tests**~~ ✅ Done — `EmailService` tested, 100% coverage

### Short-term (Medium Priority)

4. **SEO improvements** — Add `<title>` and `<meta>` tags per program page via React Helmet or similar
5. **Structured data** — Add JSON-LD schema for educational programs
6. **Frontend input validation** — Add Zod schemas for form data before API submission

### Longer-term (Low Priority)

7. **Evaluate SSR/SSG** — Consider Next.js migration or prerendering for better SEO
8. **i18n** — Only if English version of the site is needed

---

## 6. File Counts (Verified 2026-03-17)

| Category | Count |
|----------|-------|
| Backend model files | 1 (User) |
| Backend view files | 2 (contact, captcha) |
| Backend serializer files | 1 (ContactForm) |
| Backend URL files | 2 (contact, captcha) |
| Backend service files | 1 (EmailService) |
| Backend test files | 12 |
| Backend management commands | 4 (create_fake_data, create_users, delete_fake_data, silk_garbage_collect) |
| Frontend pages | 3 (Home, English, ProgramPage) |
| Frontend custom components | 8 (7 root + 1 in figma/) |
| Frontend UI primitives (shadcn) | 46 |
| Frontend data files | 2 (programs, curriculum) |
| Frontend service files | 1 (api.ts) |
| Frontend unit test files | 16 (components, pages, data, services, routes) |
| Frontend E2E test files | 6 (home, contact-form, program-page, english-page, navigation, whatsapp-cta) |
| Programs defined | 15 |
| Frontend routes | 3 (/, /ingles, /:slug) |
| API endpoints | 4 (health, contact submit, captcha site-key, captcha verify) |
