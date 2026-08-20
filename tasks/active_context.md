# Active Context — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-20. Refrescar al cerrar cada sesión significativa.

## Foco actual

Alinear el estándar canónico de testing con el quality gate. El motor ya
soporta `allow-negation-only`; este cambio documenta el marcador sin modificar
el comportamiento del detector.

## Decisiones activas

- Tests backend SIEMPRE con `backend/venv` y sqlite (`db=mysql` del registry es fallback, no dato).
- Autochequeo de gate SIEMPRE con `--junk-severity=error --external-lint run` (paridad con hook/CI).
- Jest: paths con corchetes vía `--runTestsByPath` (los args posicionales son regex).
- Sin condicionales en bodies de tests (Regla 7): la fake data seedeada es contrato del entorno; un test sin data debe fallar, no saltearse.
- Excepciones de calidad SOLO con markers documentados (`// quality: allow-...` con razón).

## Cambios recientes (git, rama qa/13082026)

- `09cce03` test: purge junk verdicts from audit (25 rewrites, 6 deletes, 2 merges, baseline 0).
- `2d6e64c` docs: complete methodology memory bank.
- `f13e051` test: close missing outcome classes and weak assertions across three layers.

## Próximos pasos

1. Integrar el PR documental después de que el CI quede verde.
2. Bugs de producto detectados por el QA: BlogDetailPage not-found, Footer huérfano, selectores muertos, data-testid per-card (ver tasks_plan issues 7-11).
3. Registrar `db:`/`branch:` en projects.yml del toolkit.
