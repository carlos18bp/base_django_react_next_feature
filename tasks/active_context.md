# Active Context — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-13. Este archivo refleja el foco ACTUAL; refrescarlo al cerrar cada sesión significativa.

## Foco actual

Corrida **`/qa --apply`** (2026-08-13, las 3 layers) sobre el template:

1. ✅ Preflight: on-work-host, prod-direct, abstain=no; substrate local creado (`backend/venv` + migrate + `create_fake_data 5`).
2. ✅ Coverage audit (`--check`): 🟡 — covered=27/33, partial=6, junk_only=0, 44 warnings del gate.
3. 🔄 qa-architect armando briefs por layer → fan-out qa-engineer-backend/unit/e2e.
4. Pendiente: verify (gate severidad CI) → junk purge (qa-auditor) → land.

## Decisiones activas

- Landing: rama `qa/<fecha>` + PR contra master (repo prod-direct, cero PRs abiertos). **Nunca merge** — eso es `/merge-when-green`.
- Tests backend SIEMPRE con `backend/venv` y sqlite (el `db=mysql` del registry es fallback, no dato).
- Specs e2e nuevos: ejecutados contra la app local (Playwright auto-levanta webServers), tags vía `e2e/helpers/flow-tags.ts`, selectores por rol (sin data-testid en prod source, copy bilingüe).
- Rewrites sobre tests baselined en `.junk-baseline.json`: no renombrar el test (baseline keyed `file::rule::test_name`).

## Cambios recientes (git)

- 2026-08-11 `22ffe3c` chore(skills): sync fake-data-refresh.
- 2026-08-03 `db9d15a` chore(testing): regla F62 + baseline re-freeze.
- 2026-08-02 `6269008` último cambio en specs e2e.
- 2026-05-06 `927afba` último cambio de source frontend (staging banner + dark mode).

## Próximos pasos

1. Cerrar la corrida /qa: PR `qa/<fecha>` con tests + methodology; reporte final con veredicto.
2. `/merge-when-green` cuando el CI del PR esté verde.
3. Backlog de tasks_plan.md (residuos: urls.py shadowed, USER_FLOW_MAP stale, CLAUDE.md drift).
