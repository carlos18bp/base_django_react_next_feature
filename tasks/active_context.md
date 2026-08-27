# Active Context — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-27. Refrescar al cerrar cada sesión significativa.

## Foco actual

Cerrar la actualización integral de dependencias en el PR #20. La rama activa
es `chore/27082026-dependency-refresh`: ya actualizó runtimes, GitHub Actions,
backend, frontend, locks y gates; resta únicamente entregar el reporte y la
memoria con CI verde.

## Decisiones activas

- Tests backend SIEMPRE con `backend/venv` y sqlite (`db=mysql` del registry es fallback, no dato).
- Autochequeo de gate SIEMPRE con `--junk-severity=error --external-lint run` (paridad con hook/CI).
- Jest: paths con corchetes vía `--runTestsByPath` (los args posicionales son regex).
- Sin condicionales en bodies de tests (Regla 7): la fake data seedeada es contrato del entorno; un test sin data debe fallar, no saltearse.
- Excepciones de calidad SOLO con markers documentados (`// quality: allow-...` con razón).
- Dependencias: nunca usar `npm audit fix --force`; aplicar majors de forma
  secuencial, en commits aislados, esperando CI verde entre fronteras.
- Backend: `requirements.in` es fuente y `requirements.txt` lock con hashes;
  CI recompila, compara, instala con hashes y audita.
- Frontend: pins exactos, Node 24/npm 11, TypeScript 7 + API compatible 6,
  ESLint 10 vía `@eslint/compat` y `allowScripts` pineado por versión.
- Backend auditado en `.venv` aislado dentro del worktree; no modificar el venv
  ni el checkout del clon principal.

## Cambios recientes (git, rama chore/27082026-dependency-refresh)

- Actions actualizadas y fijadas por SHA; CI incorpora drift del lock,
  `pip-audit`, `npm audit`, lint, TypeScript 7/6 y build.
- Python 3.14.7, pip 26.2.1, Node 24.20.0 LTS y npm 11.19.0 alineados.
- Backend completamente pineado y auditado: sqlparse 0.6, Gunicorn 26.2 y Ruff
  0.16 incluidos; `pip-audit` 40→0 y `pip list --outdated` devuelve `[]`.
- Frontend completamente pineado: jest-dom 7, ESLint 10 y TypeScript 7 incluidos;
  `npm audit` 10→0 y ncu sólo propone el runtime Node 26 fuera de alcance.
- Cada uno de los 13 commits funcionales esperó los cinco checks verdes antes
  del siguiente.

## Próximos pasos

1. El operador puede integrar el PR #20 cuando su último commit quede verde.
2. Vigilar soporte upstream de ESLint 10 en los plugins Next y de la API
   TypeScript 7 en Next/typescript-eslint para retirar los puentes.
3. Adoptar Node 26/npm 12/@types 26 como una sola frontera de runtime futura.
4. Migrar `EMAIL_*` a `MAILERS` antes de Django 7.
5. Bugs de producto detectados por QA: BlogDetailPage not-found, Footer
   huérfano, selectores muertos y data-testid per-card (tasks_plan issues 7-11).
6. Registrar `db:`/`branch:` en projects.yml del toolkit.
