# Tasks Plan — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-13 (corrida /qa). Conteos verificados con find/grep.

## Estado por feature (template)

| Feature | Estado | Nota |
|---|---|---|
| Auth (JWT + Google + passcode reset) | ✅ estable | 7 rutas API |
| Blog público + CRUD | ✅ estable | |
| Catálogo/Producto + galería | ✅ estable | django_attachments |
| Carrito + checkout + ventas | ✅ estable | SoldProduct snapshot |
| Backoffice/dashboard | ✅ estable | |
| Staging banner/overlay | ✅ estable | único uso de data-testid |
| i18n EN/ES | ✅ estable | next-intl |

## Estado de testing (medido 2026-08-13, pre-authoring de la corrida /qa)

| Layer | Volumen | Read-out del audit |
|---|---|---|
| Backend (pytest, sqlite) | 26 archivos / 197 tests | 0 errores gate; 2 warnings `nondeterministic` (`tests/views/test_staging_banner.py:41,57`) |
| Frontend unit (Jest 30) | 29 archivos / 184 tests | 18 warnings (6 mock_only, 8 negation_only, 4 querySelectorAll) |
| E2E (Playwright) | 8 specs / 40 tests | 24 warnings (23 fragile_locator posicional, 1 negation_only) |
| Flow map | 33 flows (P1=9 P2=17 P3=6 P4=1) | covered=27 · partial=6 · junk_only=0 · missing=0 · outcomes 33/33 |

Gaps de flows (los cierra la corrida /qa en curso):
- Partial P1: `auth-sign-up-form` (falta display), `catalog-browse` (failure), `catalog-product-detail` (failure).
- Partial P2/P3: `blog-list-view`, `home-product-carousel`, `purchase-loading-state`.
- `negative_case_gaps=3`: módulos `cart`, `checkout`, `navigation` sin ningún flow error/failure declarado.

## Known issues (residuos y drift detectados 2026-08-13)

1. `backend/base_feature_app/urls.py` (271 B) quedó **shadowed** por el paquete `urls/` — código muerto, candidato a repo-cleanup.
2. `docs/USER_FLOW_MAP.md` stale (2026-02-24, anterior al staging banner); `flow-definitions.json` sí está fresco (2026-07-27).
3. `.junk-baseline.json`: 15 findings frontend grandfathered — deuda de calidad declarada (no re-freezear sin veredicto del auditor).
4. Scripts `e2e:mobile` / `e2e:tablet` huérfanos: los projects Mobile/Tablet están comentados en `playwright.config.ts`.
5. `CLAUDE.md` (raíz) describe una app `content/` que no existe — la app real es `base_feature_app` (drift del template).
6. pytest instalado a nivel usuario (8.3.2) difiere del pin (9.0.3); usar SIEMPRE `backend/venv`.

## Backlog

- [ ] Corrida /qa --apply 2026-08-13: cerrar partial flows + clases negativas + rewrites de weak findings (EN CURSO — ver active_context).
- [ ] Refrescar `docs/USER_FLOW_MAP.md` desde el código real (qa-analyst) cuando el flow map se toque.
- [ ] repo-cleanup: eliminar `base_feature_app/urls.py` shadowed y scripts e2e huérfanos.
- [ ] Corregir la sección Directory Structure de `CLAUDE.md` (content/ → base_feature_app/).
- [ ] Registrar `db:` y `branch:` de este proyecto en `projects.yml` del toolkit.
