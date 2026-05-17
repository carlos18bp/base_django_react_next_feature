# Vulnerability Audit & Dependency Update Report

**Branch:** `chore/17052026-vuln-audit`
**Date:** 2026-05-17
**Base:** `master` @ `195d997`
**Scope:** patch + minor updates only (no major version bumps)

## Summary

| Surface  | Vulns (initial) | Vulns (final) | Outdated (initial) |
|----------|-----------------|---------------|--------------------|
| Frontend | 2 (1 high + 1 moderate) | 3 moderate (all `postcss` transitives) | 17 |
| Backend  | 26 across 9 packages | 4 across 1 package (`pip` only) | 22 |

Commits creados (4 en total, en `chore/17052026-vuln-audit`):

| SHA | Mensaje | Rol |
|---|---|---|
| `f09cf25` | `fix(frontend): tipa mockImplementation de matchMedia para compatibilidad con jest 30` | Desbloqueo de verificación |
| `c1b5a7a` | `deps(frontend): apply patch+minor updates` | Bumps npm |
| `4ada933` | `deps(backend): apply patch+minor updates` | Bumps pip |
| _(pendiente)_ | `docs: vulnerability audit report (2026-05-17)` | Este reporte |

---

## Frontend — `npm audit` (initial)
Source: `/tmp/base_django_react_next_feature-npm-audit.json`

| Package | Severity | Notes |
|---|---|---|
| `next`    | high     | 13 advisories (SSRF, XSS, cache poisoning, middleware bypass, DoS, etc.). Depende de `postcss` vulnerable. |
| `postcss` | moderate | XSS via unescaped `</style>` in CSS stringify output (GHSA-qx2v-qp2m-jg93). |

**Totals iniciales:** 0/1/1/0 (crit/high/mod/low).

## Frontend — `npm outdated` (initial)
Source: `/tmp/base_django_react_next_feature-npm-outdated.json`

| Package | current | wanted | latest | Acción |
|---|---|---|---|---|
| @playwright/test          | 1.59.1  | 1.60.0  | 1.60.0  | minor → aplicar |
| @tailwindcss/postcss      | 4.2.4   | 4.3.0   | 4.3.0   | minor → aplicar |
| @types/node               | 25.6.0  | 25.8.0  | 25.8.0  | minor → aplicar |
| axios                     | 1.15.2  | 1.16.1  | 1.16.1  | minor → aplicar |
| eslint                    | 9.39.4  | 9.39.4  | 10.4.0  | **major → skip** |
| eslint-config-next        | 16.2.4  | 16.2.4  | 16.2.6  | patch → aplicar |
| jest                      | 30.3.0  | 30.4.2  | 30.4.2  | minor → aplicar |
| jest-environment-jsdom    | 30.3.0  | 30.4.1  | 30.4.1  | minor → aplicar |
| js-cookie                 | 3.0.5   | 3.0.7   | 3.0.7   | patch → aplicar |
| lucide-react              | 1.14.0  | 1.16.0  | 1.16.0  | minor → aplicar |
| next                      | 16.2.4  | 16.2.4  | 16.2.6  | patch → aplicar (corrige CVEs) |
| next-intl                 | 4.11.0  | 4.12.0  | 4.12.0  | minor → aplicar |
| react / react-dom         | 19.2.5  | 19.2.5  | 19.2.6  | patch → aplicar |
| tailwindcss               | 4.2.4   | 4.3.0   | 4.3.0   | minor → aplicar |
| typescript                | 5.9.3   | 5.9.3   | 6.0.3   | **major → skip** |
| zustand                   | 5.0.12  | 5.0.13  | 5.0.13  | patch → aplicar |

---

## Backend — `pip-audit` (initial)
Source: `/tmp/base_django_react_next_feature-pip-audit.json`

| Package | Installed | Vulns | Min in-major fix |
|---|---|---|---|
| Django         | 6.0.2  | 10 CVEs | 6.0.5 |
| pillow         | 12.1.1 | 5 CVEs  | 12.2.0 (ya pinned en requirements.txt) |
| pip            | 24.0   | 4 CVEs  | n/a (pip se actualiza fuera de requirements.txt) |
| pygments       | 2.19.2 | 1 CVE   | 2.20.0 (transitive) |
| pyjwt          | 2.11.0 | 1 CVE   | 2.12.1 (transitive) |
| pytest         | 9.0.2  | 1 CVE   | 9.0.3 (ya pinned) |
| python-dotenv  | 1.2.1  | 1 CVE   | 1.2.2 (ya pinned) |
| requests       | 2.32.5 | 1 CVE   | 2.34.2 |
| urllib3        | 2.6.3  | 2 CVEs  | 2.7.0 (transitive) |

**Nota:** el venv del backend estaba desincronizado con `requirements.txt`
(p. ej. Django 6.0.2 vs pin `==6.0.4`). Reinstalar requirements.txt cierra
buena parte de los CVEs antes de cualquier bump nuevo.

## Backend — `pip list --outdated` (initial)
Source: `/tmp/base_django_react_next_feature-pip-outdated.json`

| Package | current | latest | Acción |
|---|---|---|---|
| certifi              | 2026.1.4  | 2026.4.22 | transitive, se actualiza con requests |
| charset-normalizer   | 3.4.4     | 3.4.7     | transitive |
| coverage             | 7.13.4    | 7.14.0    | `==7.13.5 → ==7.14.0` |
| Django               | 6.0.2     | 6.0.5     | `==6.0.4 → ==6.0.5` |
| django-dbbackup      | 5.2.0     | 5.3.0     | rango `>=4.0.0`; sube al hacer install |
| django-silk          | 5.4.3     | 5.5.0     | rango `>=5.0.0`; sube al hacer install |
| djangorestframework  | 3.16.1    | 3.17.1    | ya pinned `==3.17.1` |
| Faker                | 40.5.1    | 40.18.0   | `==40.15.0 → ==40.18.0` |
| huey                 | 2.6.0     | 3.0.1     | **major → skip** (rango `>=2.5.0` se respeta pero no se sube a 3.x) |
| idna                 | 3.11      | 3.15      | transitive |
| packaging            | 26.0      | 26.2      | transitive |
| pillow               | 12.1.1    | 12.2.0    | ya pinned `==12.2.0` |
| pip                  | 24.0      | 26.1.1    | pip-mgr, no parte del proyecto |
| Pygments             | 2.19.2    | 2.20.0    | nuevo pin `>=2.20.0` (security) |
| PyJWT                | 2.11.0    | 2.12.1    | nuevo pin `>=2.12.1` (security) |
| pytest / pytest-cov  | 9.0.2/7.0 | 9.0.3/7.1 | ya pinned |
| python-dotenv        | 1.2.1     | 1.2.2     | ya pinned `==1.2.2` |
| redis                | 7.2.1     | 7.4.0     | rango `>=4.0.0`; sube al hacer install |
| requests             | 2.32.5    | 2.34.2    | `==2.33.1 → ==2.34.2` |
| ruff                 | 0.15.2    | 0.15.13   | `==0.15.12 → ==0.15.13` |
| urllib3              | 2.6.3     | 2.7.0     | nuevo pin `>=2.7.0` (security) |

---

## Plan

### Frontend
- Aplicar `npm audit fix` (sin `--force`) y luego `npx npm-check-updates -u --target minor` + `npm install`.
- Skip majors: `eslint 9→10`, `typescript 5→6`.
- Verificar con `npm run build`.

### Frontend — fix preexistente (descubierto al verificar build)
- `frontend/jest.setup.ts` declara `jest.fn().mockImplementation((query: string) => ...)`,
  pero los types de `@jest/globals` (jest ≥30) exigen que el callback
  encaje en `UnknownFunction = (...args: unknown[]) => unknown`. La build
  falla con error TS en master HEAD (introducido en commit `7a08df2`, no
  fue catchado porque CI no corre `npm run build`).
- Fix: pasar la implementación directamente a `jest.fn(...)` para que el
  generic se infiera del callback, en vez de pasar por `.mockImplementation()`.
  1-line change, commit `f09cf25`.

### Backend
- Editar `backend/requirements.txt` respetando pins:
  - `Django==6.0.4 → 6.0.5` (patch dentro de 6.0.x).
  - `coverage==7.13.5 → 7.14.0` (patch+minor in-major).
  - `ruff==0.15.12 → 0.15.13`.
  - `Faker==40.15.0 → 40.18.0`.
  - `requests==2.33.1 → 2.34.2`.
- Añadir security pins para transitives con CVE: `urllib3>=2.7.0`,
  `pygments>=2.20.0`, `pyjwt>=2.12.1`.
- Rangos `>=` sin techo (django-dbbackup, django-silk, redis,
  django-cleanup, etc.) se quedan como están — `pip install -r
  requirements.txt` toma el último compatible.
- **Skip:** `huey 2.x → 3.x` (major).

## Updates Applied

### Frontend (commit `c1b5a7a` `deps(frontend): apply patch+minor updates`)
- `@playwright/test` 1.59.1 → 1.60.0
- `@tailwindcss/postcss` 4.2.4 → 4.3.0
- `@types/node` 25.6.0 → 25.8.0
- `axios` 1.15.2 → 1.16.1
- `eslint-config-next` 16.2.4 → 16.2.6
- `jest` 30.3.0 → 30.4.2
- `jest-environment-jsdom` 30.3.0 → 30.4.1
- `js-cookie` 3.0.5 → 3.0.7
- `lucide-react` 1.14.0 → 1.16.0
- `next` 16.2.4 → 16.2.6 (corrige los 13 advisories de Next.js)
- `next-intl` 4.11.0 → 4.12.0
- `react` / `react-dom` 19.2.5 → 19.2.6
- `tailwindcss` 4.2.4 → 4.3.0
- `zustand` 5.0.12 → 5.0.13

**`npm audit` final:** 3 moderate vulns en `postcss <8.5.10` (transitivo
de `next` y `next-intl`). Fix solo disponible vía `npm audit fix --force`
que degradaría `next` a 9.3.3 (cross-major). Skip — pendiente upstream.

**Remaining outdated (majors intencionalmente saltados):**
- `eslint 9.39.4 → 10.4.0`
- `typescript 5.9.3 → 6.0.3`

### Frontend fix (commit `f09cf25` `fix(frontend): tipa mockImplementation ...`)
- `frontend/jest.setup.ts`: cambio mínimo para que `npm run build` pase
  TypeScript con jest ≥30.

### Backend (commit `4ada933` `deps(backend): apply patch+minor updates`)
- Pins actualizados:
  - `Django` 6.0.4 → 6.0.5
  - `coverage` 7.13.5 → 7.14.0
  - `ruff` 0.15.12 → 0.15.13
  - `Faker` 40.15.0 → 40.18.0
  - `requests` 2.33.1 → 2.34.2
- Security pins añadidos:
  - `urllib3>=2.7.0`
  - `pygments>=2.20.0`
  - `pyjwt>=2.12.1`
- Versiones efectivas tras `pip install -r requirements.txt`:
  - `pillow` 12.1.1 → 12.2.0 (ya estaba pinned, solo sincronizó venv)
  - `python-dotenv` 1.2.1 → 1.2.2 (idem)
  - `pytest` 9.0.2 → 9.0.3 (idem)
  - `djangorestframework` 3.16.1 → 3.17.1 (idem)
  - `urllib3` 2.6.3 → 2.7.0
  - `pygments` 2.19.2 → 2.20.0
  - `pyjwt` 2.11.0 → 2.12.1

**`pip-audit` final:** 4 CVEs remanentes, todos en `pip 24.0` (CVE-2025-8869,
CVE-2026-1703, CVE-2026-3219, CVE-2026-6357). `pip` no es dependencia del
proyecto sino el package manager del venv; se actualiza con
`pip install -U pip` fuera del scope de `requirements.txt`. Pendiente
upstream.

**Remaining (skipped en este audit):**
- `huey 2.6.0 → 3.0.1` (major).
- `pip 24.0 → 26.1.1` (manager, fuera del flujo).

## Rollbacks

Ninguno. Hubo un retry intermedio donde se intentó revertir
`jest`/`jest-environment-jsdom` a `30.3.0` para descartar regresión por
bump; el rollback **no** arregló el TS error, lo que confirmó que el bug
era preexistente en master. Tras restaurar a `30.4.x` y aplicar el fix de
`jest.setup.ts`, todo verificó OK.

## Verification Results

### Frontend
- `npm audit`: 0 critical / 0 high / 3 moderate / 0 low (todas transitivas
  de `postcss <8.5.10` debajo de `next` y `next-intl`; fix requiere
  cross-major upstream).
- `npm run build`: ✓ compiled successfully in 97s (Turbopack, Next.js 16.2.6).

### Backend
- `python manage.py check`: `System check identified no issues (0 silenced).`
- `pytest --collect-only -q`: 197 tests collected en 1.43s, sin errores.
- Slice: `pytest base_feature_app/tests/utils/test_forms.py -v --no-cov`
  → **6 passed in 5.90s**.

## Notas operativas

- Trabajo realizado en `chore/17052026-vuln-audit` (rama nueva desde
  `master @ 195d997`), no en `master` directo, siguiendo el
  `git-branch-protocol` del CLAUDE.md base.
- No se ejecutó `git push` (el operador lo hace cuando decida abrir PR).
- Hay 3 archivos modificados en el working tree no relacionados con este
  audit (`.agents/skills/vuln-audit/SKILL.md`, `.claude/skills/vuln-audit/SKILL.md`,
  `.windsurf/workflows/vuln-audit.md`) que aparecieron de una sesión previa
  con cambios uncommitted al skill; quedan fuera de los commits de esta
  auditoría para no contaminar el scope.
