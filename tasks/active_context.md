# Active Context — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-13 (cierre de la corrida /qa). Refrescar al cerrar cada sesión significativa.

## Foco actual

Corrida **`/qa --apply`** (2026-08-13, 3 layers) **COMPLETADA** en la rama `qa/13082026`:

1. ✅ Substrate local (backend/venv + sqlite + create_fake_data 5) y Memory Bank completado (5 core files).
2. ✅ Autoría: 9 tests e2e nuevos (clases failure/display + 3 flows nuevos), 17 rewrites unit, freezegun backend.
3. ✅ Audit + purga aprobada por el operador: 6 DELETE, 2 MERGE, 25 REWRITE (falsos verdes por guards condicionales eliminados), baseline 15 → 0.
4. ✅ Verificación: gate CI-parity 0 errores en las 3 suites; 48/48 e2e verdes en vivo; flow audit 36/36 covered.
5. 🔄 Pendiente inmediato: PR de `qa/13082026` contra master → CI → `/merge-when-green` (QA nunca mergea).

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

1. (operador) `/merge-when-green` sobre el PR de `qa/13082026` cuando el CI esté verde.
2. Bugs de producto detectados por el QA: BlogDetailPage not-found, Footer huérfano, selectores muertos, data-testid per-card (ver tasks_plan issues 7-11).
3. Registrar `db:`/`branch:` en projects.yml del toolkit.
