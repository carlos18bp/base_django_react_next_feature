# Vulnerability Audit & Dependency Update Report

**Branch:** `chore/27082026-vuln-audit`
**Date:** 2026-08-27
**Base:** `master` @ `79032d4`
**Scope:** patch + minor updates only (no major version bumps)

## Summary

| Surface | Vulns (initial) | Vulns (final) | Outdated (initial) |
|---|---:|---:|---:|
| Frontend | 10 (9 high, 1 low) | 0 | 14 from `npm outdated`; 20 in-major candidates from `ncu` |
| Backend | 40 across 4 packages | 11 across 2 packages | 14 |

Commits:

| SHA | Message | Role |
|---|---|---|
| `20eca66` | `deps(frontend): apply patch+minor updates` | npm bumps + compatibility adjustment |
| `a8dcdbf` | `deps(backend): apply patch+minor updates` | Python bumps |
| _(this commit)_ | `docs: vulnerability audit report (2026-08-27)` | Report + affected Memory Bank files |

---

## Frontend — `npm audit` (initial)

Source: `/tmp/base_django_react_next_feature-npm-audit.json`

| Package | Severity | Notes |
|---|---|---|
| `@babel/core` | low | Transitive; fixed by lockfile refresh. |
| `axios` | high | Direct dependency; fixed by `1.20.0`. |
| `brace-expansion` | high | Transitive; fixed without `--force`. |
| `form-data` | high | Transitive below Axios; fixed by compatible resolution. |
| `js-yaml` | high | Transitive development dependency; fixed by lockfile refresh. |
| `nanoid` | high | Transitive; fixed by compatible resolution. |
| `next` | high | Direct dependency; fixed by `16.3.3`. |
| `postcss` | high | Transitive below Next; fixed with Next/Tailwind updates. |
| `sharp` | high | Transitive below Next; fixed by `16.3.3`. |
| `ws` | high | Transitive development dependency; fixed by compatible resolution. |

**Totals:** 0 critical / 9 high / 0 moderate / 1 low.

## Frontend — initial update plan

- Production: Axios, Fuse.js, js-cookie, lucide-react, Next.js, next-intl,
  React, React DOM and Zustand.
- Tooling: Playwright, Tailwind/PostCSS, Testing Library, React/Node types,
  ESLint 9.x and the Next/Playwright ESLint integrations.
- Intentionally skipped majors: `@testing-library/jest-dom 7`, `@types/node 26`,
  `eslint 10` and `typescript 7`.

---

## Backend — `pip-audit` (initial)

Source: `/tmp/base_django_react_next_feature-pip-audit.json`

| Package | Current | Vulns | Minimum fix |
|---|---:|---:|---:|
| `Django` | 6.0.5 | 9 | 6.0.8 |
| `pillow` | 12.2.0 | 20 | 12.3.0 |
| `pip` | 24.0 | 7 | 25.3 / 26.x |
| `sqlparse` | 0.5.5 | 4 | 0.6.0 |

## Backend — `pip list --outdated` (initial)

Source: `/tmp/base_django_react_next_feature-pip-outdated.json`

- Applicable in-major updates: asgiref, coverage, Django, DRF, Faker, Pillow,
  pytest, pytest-django, python-dotenv and typing-extensions.
- Floors raised to the already validated effective versions:
  `django-silk>=5.5.2` and `pygments>=2.21.0`.
- Skipped: Gunicorn `23→26` (major and `<24` pin), Ruff `0.15→0.16`
  (0.x boundary), sqlparse `0.5→0.6` (0.x boundary) and pip `24→26`
  (package manager, outside `requirements.txt`).

---

## Updates Applied

### Frontend (`20eca66`)

- `axios` 1.16.1 → 1.20.0
- `fuse.js` 7.3.0 → 7.5.0
- `js-cookie` 3.0.7 → 3.0.8
- `lucide-react` 1.16.0 → 1.34.0
- `next` 16.2.6 → 16.3.3
- `next-intl` 4.12.0 → 4.14.0
- `react` / `react-dom` 19.2.6 → 19.2.8
- `zustand` 5.0.13 → 5.0.15
- `@playwright/test` 1.60.0 → 1.62.1
- `@tailwindcss/postcss` / `tailwindcss` 4.3.0 → 4.3.3
- `@testing-library/user-event` 14.6.1 → 14.6.6
- `@types/node` 25.8.0 → 25.9.5
- `@types/react` 19.2.14 → 19.2.18
- `@types/react-dom` 19.2.3 → 19.2.5
- `eslint` 9.39.4 → 9.39.5
- `eslint-config-next` 16.2.6 → 16.3.3
- `eslint-plugin-playwright` 2.10.2 → 2.11.0
- The HTTP service test mock now retains its declared callable/interceptor type
  under Next 16.3 TypeScript checking; runtime behavior is unchanged.
- Final `npm audit`: **0 vulnerabilities**.

### Backend (`a8dcdbf`)

- `asgiref` 3.11.1 → 3.12.1
- `Django` 6.0.5 → 6.1
- `django-silk` floor 5.0.0 → 5.5.2
- `djangorestframework` 3.17.1 → 3.18.0
- `python-dotenv` 1.2.2 → 1.2.3
- `Faker` 40.18.0 → 40.37.0
- `pillow` 12.2.0 → 12.3.0
- `pytest` 9.0.3 → 9.1.1
- `pytest-django` 4.12.0 → 4.14.0
- `coverage` 7.14.0 → 7.15.4
- `typing-extensions` 4.15.0 → 4.16.0
- `Pygments` floor 2.20.0 → 2.21.0
- Final `pip-audit`: **11 vulnerabilities** — 7 in `pip 24.0` and 4 in
  `sqlparse 0.5.5`; both are intentionally outside this patch/minor plan.

## Rollbacks

- `@testing-library/jest-dom` was tested at 6.10.0 and restored to 6.9.1.
  npm marks 6.10.0 as an incorrectly published minor with breaking Node/peer
  requirements and explicitly recommends 6.9.1 for the 6.x line.
- No other rollbacks or `ERESOLVE` events occurred.

## Verification Results

### Frontend

- `npm audit`: 0 critical / 0 high / 0 moderate / 0 low.
- `npm run build`: successful with Next.js 16.3.3; all 13 static pages generated.
- `npm test -- --runTestsByPath lib/services/__tests__/http.test.ts --runInBand`:
  11 passed.

### Backend

- `python manage.py check`: no issues.
- `pytest --collect-only -q`: 197 tests collected without errors.
- `pytest base_feature_app/tests/utils/test_forms.py -v --no-cov`: 6 passed.
- Django 6.1 emits `RemovedInDjango70Warning` for legacy `EMAIL_*` settings;
  migration to `MAILERS` is tracked separately before Django 7.

## Remaining Work

- Evaluate `sqlparse 0.6` as a dedicated 0.x migration to close its 4 CVEs.
- Upgrade the isolated/deployment pip separately from project requirements.
- Evaluate the skipped frontend and tooling majors in dedicated PRs.
