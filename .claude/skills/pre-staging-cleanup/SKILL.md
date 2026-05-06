---
name: pre-staging-cleanup
description: "Pre-staging template residue cleanup — checklist por fases para auditar y eliminar residuos del template base (modelos demo, endpoints, stores, vistas, traducciones, docs) que quedaron dispersos en el proyecto antes de promover a staging."
argument-hint: "[optional: fase B1..B10, F1..F9, D1..D6, o sección 'backend'|'frontend'|'docs'|'all']"
---

# Pre-Staging Cleanup — Limpieza de Residuos del Template

## Goal

El proyecto fue iniciado clonando `base_django_react_next_feature/`. A medida que se construyó el nuevo proyecto, **residuos del template original quedaron dispersos**: modelos demo (`Blog`, `Product`, `Sale`), endpoints, stores, vistas, traducciones y referencias en docs que ya no aportan al producto real.

Este skill audita el repo **por fases**, clasifica cada item del template como **residuo puro** (eliminar), **adaptado** (preservar) o **roto** (referencias colgantes), y aplica la limpieza solo con confirmación humana, una fase a la vez. Está pensado para ejecutarse cuando el proyecto está maduro y próximo a staging.

## Inputs

- Argumento opcional: una fase puntual (`B1`, `F3`, `D4`, etc.) o sección (`backend`, `frontend`, `docs`, `all`). Sin argumento, el skill recorre todas las fases en orden.
- Variante detectada: este SKILL es para **Next.js / React / TypeScript / Zustand**.

## Reglas obligatorias

1. **Nunca eliminar sin confirmación explícita** — incluso si la clasificación dice "residuo puro".
2. **Inventario fijo es la fuente de verdad** — la lista de items del template está embebida abajo. No inferir items en runtime.
3. **Cada fase = un commit aislado** — facilita rollback (`git revert <sha>`).
4. **Lista de PRESERVAR siempre** (no proponer jamás eliminar): `User`, `PasswordCode` modelos; `views/auth.py`, `urls/auth.py`, `urls/user.py`, `views/user_crud.py`, `serializers/user_*.py`; `forms/user.py`; `django_attachments/`; `components/layout/Header.tsx`, `components/layout/Footer.tsx`; `lib/stores/authStore.ts`, `lib/stores/localeStore.ts`; `lib/services/http.ts`, `lib/services/tokens.ts`; `lib/hooks/useRequireAuth.ts`; `lib/i18n/config.ts`. **Staging Phase Banner** (feature de revisión por fases): `models/staging_phase_banner.py`, `serializers/staging_phase_banner.py`, `views/staging_phase_banner.py`, `urls/staging_phase_banner.py`, `StagingPhaseBannerAdmin` en `admin.py`; `components/staging/` (Banner, Overlay, Gate), `lib/stores/stagingBannerStore.ts`, `lib/services/staging-banner.ts`. **Nunca eliminar** — esta feature se controla vía el flag `StagingPhaseBanner.is_visible` desde Django admin (acción "Hide banner"), no por borrado.
5. **Antes de eliminar un archivo, verificar referencias** con `grep -r "<symbol>" backend/ frontend/ --include="*.py" --include="*.ts" --include="*.tsx"`. Si hay referencias **fuera** de la lista de archivos demo, marcar **adaptado** y preservar.
6. **Detectar archivos modificados** con `git log --oneline -- <file>` — más de 1 commit (el inicial) ⇒ probablemente adaptado.
7. **Migraciones:** nunca eliminar migraciones aplicadas a producción. Para limpieza de modelos, generar nueva migración con `python manage.py makemigrations` tras eliminar el modelo.

## Workflow por fases

Para cada fase: **(1)** listar inventario fijo de la fase → **(2)** ejecutar grep para clasificar → **(3)** mostrar tabla de hallazgos → **(4)** pedir confirmación → **(5)** aplicar `git rm` / edits → **(6)** verificación mínima → **(7)** commit aislado.

Formato de tabla de hallazgos:

```
## Fase <ID> — <Nombre>

| # | Archivo / símbolo                              | Estado git    | Refs externas | Acción          |
|---|------------------------------------------------|---------------|---------------|-----------------|
| 1 | backend/base_feature_app/models/blog.py        | sin cambios   | 0             | DELETE          |
| 2 | backend/base_feature_app/models/product.py     | +12 líneas    | 4             | KEEP (adaptado) |
| 3 | backend/base_feature_app/models/sale.py        | sin cambios   | 1 colgante    | REVIEW: <ref>   |

¿Aplicar las acciones DELETE de esta fase? [y/N]
```

---

### BACKEND (Django)

#### Fase B1 — Modelos demo
- `backend/base_feature_app/models/blog.py` (modelo `Blog`)
- `backend/base_feature_app/models/product.py` (modelo `Product`)
- `backend/base_feature_app/models/sale.py` (modelos `Sale`, `SoldProduct`)
- Verificar: ningún modelo nuevo tiene `ForeignKey`/`ManyToMany` a estos.
- Si se elimina, también: actualizar `models/__init__.py` y `admin.py` para quitar registros.

#### Fase B2 — Serializers demo
- `backend/base_feature_app/serializers/blog.py`, `blog_list.py`, `blog_detail.py`, `blog_create_update.py`
- `backend/base_feature_app/serializers/product.py`, `product_list.py`, `product_detail.py`, `product_create_update.py`
- `backend/base_feature_app/serializers/sale.py`, `sale_list.py`, `sale_detail.py`
- Actualizar `serializers/__init__.py`.

#### Fase B3 — Views/Endpoints demo
- `backend/base_feature_app/views/blog.py`, `views/blog_crud.py`
- `backend/base_feature_app/views/product.py`, `views/product_crud.py`
- `backend/base_feature_app/views/sale.py`, `views/sale_crud.py`
- `backend/base_feature_app/views/captcha_views.py` — **solo eliminar si reCAPTCHA no se usa en el nuevo proyecto** (`grep -r RECAPTCHA backend/ frontend/`).
- **Preservar:** `views/auth.py`, `views/user_crud.py`.

#### Fase B4 — URLs demo
- `backend/base_feature_app/urls/blog.py`
- `backend/base_feature_app/urls/product.py`
- `backend/base_feature_app/urls/sale.py`
- `backend/base_feature_app/urls/captcha.py` (acompaña a B3-captcha)
- Editar `urls/__init__.py` para quitar los `include()` de los routers eliminados.
- Revisar `backend/base_feature_app/urls.py` (top-level del app, conflicta con el paquete `urls/` — probable dead code legacy del template).
- Revisar `backend/base_feature_project/urls.py` para quitar `path('blog/', ...)`, `path('product/', ...)`, etc. si están registradas a nivel proyecto.
- **Preservar:** `urls/auth.py`, `urls/user.py`.

#### Fase B5 — Forms demo
- `backend/base_feature_app/forms/blog.py`
- `backend/base_feature_app/forms/product.py`
- También revisar `forms/__init_.py` (typo) y `forms/__init__.py`.

#### Fase B6 — Management commands de fake data
- `backend/base_feature_app/management/commands/create_fake_data.py` (orquestador)
- `backend/base_feature_app/management/commands/create_blogs.py`
- `backend/base_feature_app/management/commands/create_products.py`
- `backend/base_feature_app/management/commands/create_sales.py`
- `backend/base_feature_app/management/commands/create_users.py` — revisar: si el equipo usa estos usuarios para QA en staging, **preservar y solo limpiar los de Blog/Product/Sale**.
- `backend/base_feature_app/management/commands/delete_fake_data.py`
- `backend/base_feature_app/management/commands/README.md` — actualizar al nuevo set de comandos.
- También revisar `backend/base_feature_project/management/` (commands a nivel proyecto, si existen).
- **Huey tasks demo:** `backend/base_feature_project/tasks.py` puede contener tasks demo (notificaciones de blog/product/sale, cron jobs). Revisar y limpiar.

#### Fase B7 — Migraciones obsoletas
- Listar migraciones que solo afecten modelos eliminados: `ls backend/base_feature_app/migrations/`.
- **NO eliminar migraciones ya aplicadas en producción/staging.**
- Acción recomendada: tras eliminar modelos en B1, ejecutar `python manage.py makemigrations` para generar la migración de drop, y commitearla.
- Si el proyecto aún no tiene producción, considerar `migrations/0001_initial.py` reset documentado.

#### Fase B8 — Tests demo
- `backend/base_feature_app/tests/models/test_blog_model.py`, `test_product_model.py`, `test_sale_model.py`
- `backend/base_feature_app/tests/serializers/test_blog_serializers.py`, `test_product_serializers.py`, `test_sale_serializer.py`
- `backend/base_feature_app/tests/views/` — tests de endpoints demo: `test_public_endpoints.py`, `test_crud_endpoints.py`, `test_crud_detail_endpoints.py` (revisar caso por caso — pueden cubrir endpoints adaptados)
- `backend/base_feature_app/tests/views/test_captcha_views.py` (acompaña B3-captcha)
- **Preservar:** tests de auth, JWT, user model, password_code, admin, urls, forms (los infra).

#### Fase B9 — Permissions / signals / utils demo
- Revisar `backend/base_feature_app/permissions/roles.py` — si los roles son específicos del template (sin uso en el nuevo dominio), proponer reemplazo.
- `backend/base_feature_app/services/email_service.py` — preservar; revisar templates de email demo en `templates/`.

#### Fase B10 — Admin demo
- Editar `backend/base_feature_app/admin.py` para quitar `admin.site.register(Blog/Product/Sale/SoldProduct)` y sus `ModelAdmin` clases.
- **Preservar:** `StagingPhaseBannerAdmin` y la sección "🚧 Staging Phase Banner" en `BaseFeatureAdminSite.get_app_list`.

#### Fase B11 — Staging Phase Banner (PRESERVAR, no eliminar)
- `backend/base_feature_app/models/staging_phase_banner.py`
- `backend/base_feature_app/serializers/staging_phase_banner.py`
- `backend/base_feature_app/views/staging_phase_banner.py`
- `backend/base_feature_app/urls/staging_phase_banner.py`
- `StagingPhaseBannerAdmin` en `admin.py` con sus actions (`start_design_phase`, `start_development_phase`, `show_banner`, `hide_banner`).
- Acción: **ninguna**. Esta feature controla la visibilidad del banner de revisión para clientes en staging. Se oculta poniendo `is_visible=False` desde Django admin (acción "Hide banner"), nunca se borra.
- Verificación: confirmar que el registro singleton (id=1) existe tras `migrate` y que `GET /api/staging-banner/` responde 200.

---

### FRONTEND (Next.js / React)

#### Fase F1 — Páginas/Rutas demo (App Router)
- `frontend/app/catalog/` (catálogo de productos)
- `frontend/app/products/[productId]/` (detalle producto)
- `frontend/app/blogs/`, `frontend/app/blogs/[blogId]/`
- `frontend/app/checkout/` (carrito + checkout)
- `frontend/app/manual/` (manual interactivo del template)
- `frontend/app/backoffice/` (panel admin demo)
- `frontend/app/admin-login/` (login alterno demo)
- `frontend/app/dashboard/` — **revisar antes de eliminar:** muchos proyectos extienden el dashboard.
- **Preservar:** `app/page.tsx` (root), `app/layout.tsx`, `app/sign-in/`, `app/sign-up/`, `app/forgot-password/`.

#### Fase F2 — Componentes demo
- `frontend/components/blog/BlogCard.tsx`, `BlogCarousel.tsx`
- `frontend/components/product/ProductCard.tsx`, `ProductCarousel.tsx`
- `frontend/components/manual/ManualSearch.tsx`, `ManualSidebar.tsx`, `ProcessCard.tsx`
- **Preservar:** `components/layout/Header.tsx`, `components/layout/Footer.tsx` — pero auditar el contenido (links a /blogs, /catalog, /manual deben removerse si las páginas se eliminaron).

#### Fase F3 — Stores Zustand demo
- `frontend/lib/stores/blogStore.ts`
- `frontend/lib/stores/productStore.ts`
- `frontend/lib/stores/cartStore.ts` (incluye `persist` middleware — verificar que nada nuevo lo use)
- **Preservar:** `lib/stores/authStore.ts`, `lib/stores/localeStore.ts`.

#### Fase F4 — Hooks personalizados demo
- `frontend/lib/manual/useManualSearch.ts` (acompaña F1-manual)
- **Preservar:** `lib/hooks/useRequireAuth.ts` (infra de protected routes).

#### Fase F5 — Servicios / API clients demo
- Revisar `frontend/lib/services/http.ts` para llamadas a `/api/blogs`, `/api/products`, `/api/sales` — eliminar funciones helper específicas de esos endpoints; preservar instancia axios e interceptores.
- Revisar `frontend/lib/constants.ts` — eliminar constantes demo (`BLOG_PAGE_SIZE`, `PRODUCT_*`, `CART_*`, `MANUAL_*`, `BACKOFFICE_*`); preservar las que el nuevo proyecto reutiliza.
- Revisar `frontend/proxy.ts` — apunta al backend del template; actualizar URL/host si el nuevo proyecto cambió de dominio o puerto.
- **Preservar:** `lib/services/tokens.ts`.

#### Fase F6 — Tipos TypeScript demo
- `frontend/lib/types.ts` — eliminar interfaces `Blog`, `Product`, `Sale`, `SoldProduct` y campos demo del tipo `User` que no apliquen.
- `frontend/lib/manual/types.ts` (acompaña F1-manual)
- `frontend/lib/manual/content.ts` (data estática del manual)

#### Fase F7 — i18n / traducciones demo
- Revisar `frontend/lib/i18n/config.ts` y archivos de mensajes (`messages/*.json` si existen) — eliminar claves bajo `manual.*`, `blog.*`, `product.*`, `cart.*`, `checkout.*`, `backoffice.*`.
- Cambiar cualquier `app_name` o `title` que aún diga "Base Feature" o similar.

#### Fase F8 — Assets / branding del template
- Buscar logos/imágenes en `frontend/public/` con nombres como `base_feature*`, `template*`, `placeholder*` o el favicon default.
- Reemplazar `frontend/app/favicon.ico` si sigue siendo el del template.
- Revisar `frontend/app/layout.tsx` — `metadata.title`, `metadata.description`, `openGraph` deben reflejar el nuevo proyecto, no "Base Django React Next Feature".
- Revisar archivos `manifest.json` / `robots.txt` / `sitemap.ts` si existen — deben reflejar el dominio real.

#### Fase F10 — Staging Phase Banner UI (PRESERVAR, no eliminar)
- `frontend/components/staging/StagingPhaseBanner.tsx`
- `frontend/components/staging/StagingExpiredOverlay.tsx`
- `frontend/components/staging/StagingGate.tsx`
- `frontend/lib/stores/stagingBannerStore.ts`
- `frontend/lib/services/staging-banner.ts`
- Wrapper `<StagingGate>` en `app/layout.tsx`.
- Acción: **ninguna**. La visibilidad la controla el modelo `StagingPhaseBanner.is_visible` en backend. Cuando el flag está en `false` o `started_at` es null, el componente no renderiza nada (early-return), pero el archivo debe permanecer en disco.

#### Fase F9 — Tests unit + E2E demo
- Tests unit:
  - `frontend/components/blog/__tests__/`, `frontend/components/product/__tests__/`, `frontend/components/manual/__tests__/`
  - `frontend/lib/stores/__tests__/blogStore.test.ts`, `productStore.test.ts`, `cartStore.test.ts`
  - `frontend/app/{catalog,products,blogs,checkout,manual,backoffice,admin-login,dashboard}/__tests__/`
- Tests E2E:
  - `frontend/e2e/app/cart.spec.ts`
  - `frontend/e2e/app/checkout.spec.ts`
  - `frontend/e2e/app/complete-purchase.spec.ts`
  - `frontend/e2e/app/user-flows.spec.ts` (revisar: puede cubrir flujos adaptados)
  - `frontend/e2e/public/blogs.spec.ts`
  - `frontend/e2e/public/products.spec.ts`
  - `frontend/e2e/public/navigation.spec.ts` — **revisar:** verifica navegación general.
- **Preservar:** `frontend/e2e/auth/auth.spec.ts`, `frontend/e2e/public/smoke.spec.ts`.

---

### DOCUMENTACIÓN Y CONFIGURACIÓN

#### Fase D1 — README.md raíz
- `grep -nE "Blog|Product|Sale|Manual|catalog|checkout|base[_ -]feature" README.md`
- Eliminar secciones que describan features del template; actualizar features list al producto real.

#### Fase D2 — CLAUDE.md / AGENTS.md / GEMINI.md
- `CLAUDE.md` raíz, `backend/CLAUDE.md`, `frontend/CLAUDE.md`
- Buscar y reemplazar referencias a `Blog/Product/Sale` en ejemplos de código y memory bank.
- Actualizar la sección "Project Identity" con el nombre real del proyecto si aún dice "Base Django React Next Feature".
- Si existen `tasks/active_context.md` o `tasks/tasks_plan.md`, sincronizar con el estado actual.

#### Fase D3 — Docs en `/docs/`
- `docs/USER_FLOW_MAP.md`, `docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`, `docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md`, `docs/TESTING_QUALITY_STANDARDS.md`, `docs/TEST_QUALITY_GATE_REFERENCE.md`, `docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md`, `docs/GLOBAL_RULES_GUIDELINES.md`, `docs/claude-code-methodology-setup-guide.md` — `grep -ln "base_feature\|Blog\|Product\|Sale" docs/` y actualizar.
- `docs/methodology/` — memory bank: `architecture.md`, `product_requirement_docs.md`, `technical.md`, `error-documentation.md`, `lessons-learned.md` deben reflejar el dominio real, no el template. También `tasks/active_context.md`, `tasks/tasks_plan.md`.
- Docs en frontend: `frontend/SETUP.md`, `frontend/TESTING.md` — actualizar pasos de setup, scripts npm, referencias a features demo.
- `audit-report.md` raíz — output de auditorías previas; revisar si quedan referencias obsoletas.

#### Fase D4 — `.env.example`
- `backend/.env.example`:
  - `BACKUP_STORAGE_PATH=/var/backups/base_feature_project` → reemplazar por path real.
  - `DJANGO_GOOGLE_OAUTH_CLIENT_ID=...` → debe ser el ID del nuevo proyecto, no el del template.
  - `FRONTEND_URL` → URL del nuevo dominio.
- `frontend/.env.example`:
  - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (si aplica).

#### Fase D5 — `package.json` y `pyproject.toml`
- `frontend/package.json` — `name`, `version`, `description`.
- `backend/pyproject.toml` (si existe) — metadatos del proyecto.

#### Fase D6 — Workflows `.windsurf/` y skills `.claude/` / `.agents/`
- `grep -rln "base_feature_app\|base_feature_project" .claude/ .agents/ .windsurf/`
- Actualizar referencias en otros skills (ej. `repo-cleanup`, `plan-task`, `vuln-audit`) que mencionen el nombre del módulo si fue renombrado.

#### Fase D7 — Scripts raíz, CI y systemd
- `scripts/run-tests-all-suites.py` — verificar que apunte a la app correcta tras renames; quitar suites de tests demo eliminados.
- `scripts/test_quality_gate.py` y `scripts/quality/` — actualizar thresholds y rutas si cambiaron.
- `scripts/coverage-summary-ci.cjs` — verificar paths de coverage.
- `scripts/ci/` — workflows GitHub Actions / scripts de pipeline; actualizar nombres de jobs, branch protection, deploy targets si referencian "base_feature_*".
- `scripts/systemd/` — unit files (`base_django_react_next_feature_staging.service`, `*-huey.service`) deben renombrarse al nombre real del servicio en producción.
- `frontend/scripts/` — scripts de soporte del frontend; revisar referencias.
- `.github/workflows/*.yml` (si existen) — nombres de jobs, secretos referenciados, tags de deploy.

---

## Verificación post-fase

| Tipo | Comando | Cuándo |
|------|---------|--------|
| Backend imports | `cd backend && source venv/bin/activate && python manage.py check` | Tras B1–B10 |
| Backend migraciones | `cd backend && source venv/bin/activate && python manage.py makemigrations --check --dry-run` | Tras B1, B7 |
| Backend tests afectados | `cd backend && source venv/bin/activate && pytest <tests-restantes> -x --ff` | Tras B8 |
| Frontend lint | `cd frontend && npm run lint` | Tras F1–F8 |
| Frontend typecheck | `cd frontend && npx tsc --noEmit` | Tras F3–F6 |
| Frontend tests | `cd frontend && npm test -- <archivos-restantes>` | Tras F9 |
| E2E (solo reportar) | `cd frontend && npx playwright test --list` | Tras F9 |

> No correr la suite completa. Solo el subset afectado por la fase.

## Output Contract

Al terminar (o al ejecutar una fase puntual), entregar:

1. **Resumen** — fases ejecutadas, items eliminados, items preservados, items en review.
2. **Commits creados** — sha + mensaje por fase, en orden.
3. **Pendientes manuales** — items marcados REVIEW que requieren juicio humano (con archivo y razón).
4. **Verificaciones ejecutadas** — qué corrió, resultado, output relevante si falló.
5. **Próxima fase recomendada** — si quedan fases pendientes.

## Ejemplos de invocación

- `/pre-staging-cleanup` → recorre todas las fases en orden, con confirmación por fase.
- `/pre-staging-cleanup B1` → solo modelos demo.
- `/pre-staging-cleanup backend` → fases B1–B10.
- `/pre-staging-cleanup frontend` → fases F1–F9.
- `/pre-staging-cleanup docs` → fases D1–D6.
