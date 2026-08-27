# Active Context — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-27. Refrescar al cerrar cada sesión significativa.

## Foco actual

Cerrar vulnerabilidades corregibles mediante bumps patch/minor, manteniendo
fuera de alcance los majors y las fronteras `0.x`. La rama activa es
`chore/27082026-vuln-audit` y entrega los manifests, verificaciones y reporte.

## Decisiones activas

- Tests backend SIEMPRE con `backend/venv` y sqlite (`db=mysql` del registry es fallback, no dato).
- Autochequeo de gate SIEMPRE con `--junk-severity=error --external-lint run` (paridad con hook/CI).
- Jest: paths con corchetes vía `--runTestsByPath` (los args posicionales son regex).
- Sin condicionales en bodies de tests (Regla 7): la fake data seedeada es contrato del entorno; un test sin data debe fallar, no saltearse.
- Excepciones de calidad SOLO con markers documentados (`// quality: allow-...` con razón).
- Dependencias: nunca usar `npm audit fix --force`; los saltos de major se
  separan en PRs dedicados.
- Backend auditado en `backend/.venv` aislado dentro del worktree; no modificar
  el venv del clon principal.

## Cambios recientes (git, rama chore/27082026-vuln-audit)

- `20eca66` deps(frontend): 19 bumps in-major, lockfile seguro y compatibilidad
  del mock HTTP; npm audit 10→0, build y 11 tests verdes.
- `a8dcdbf` deps(backend): 12 pins/floors actualizados; pip-audit 40→11,
  check + collect-only + slice de 6 tests verdes.
- `audit-report.md` documenta los rollbacks y remanentes de pip/sqlparse.

## Próximos pasos

1. Integrar el PR de vuln-audit después de que el CI quede verde.
2. Evaluar `sqlparse 0.6` y actualizar pip en tareas separadas.
3. Migrar `EMAIL_*` a `MAILERS` antes de Django 7.
4. Bugs de producto detectados por QA: BlogDetailPage not-found, Footer
   huérfano, selectores muertos y data-testid per-card (tasks_plan issues 7-11).
5. Registrar `db:`/`branch:` en projects.yml del toolkit.
