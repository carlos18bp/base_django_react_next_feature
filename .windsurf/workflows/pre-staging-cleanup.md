---
description: Limpieza por fases de residuos del template base (modelos demo, endpoints, stores, vistas, traducciones, docs) antes de promover a staging — auditoría con confirmación humana fase por fase
auto_execution_mode: 2
---

# Pre-Staging Cleanup — Limpieza de Residuos del Template

## Goal
El proyecto fue iniciado clonando `base_django_react_next_feature/`. Cuando el proyecto está maduro y próximo a staging, este workflow audita el repo por fases, clasifica cada item del template como **residuo puro** (eliminar), **adaptado** (preservar) o **roto** (referencias colgantes), y aplica la limpieza solo con confirmación humana, una fase a la vez.

## Restricciones No Negociables
1. **Nunca eliminar sin confirmación humana** — incluso si el inventario fijo dice "residuo puro".
2. **Inventario fijo es la fuente de verdad** — la lista de items del template está embebida abajo.
3. **Cada fase = un commit aislado** — facilita rollback (`git revert <sha>`).
4. **PRESERVAR siempre:** `User`/`PasswordCode`, `views/auth.py`, `urls/auth.py`, `urls/user.py`, `views/user_crud.py`, `serializers/user_*.py`, `forms/user.py`, `django_attachments/`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `lib/stores/authStore.ts`, `lib/stores/localeStore.ts`, `lib/services/http.ts`, `lib/services/tokens.ts`, `lib/hooks/useRequireAuth.ts`, `lib/i18n/config.ts`. **Staging Phase Banner** (NUNCA eliminar — se oculta vía `StagingPhaseBanner.is_visible=False` en Django admin): `models/staging_phase_banner.py`, `serializers/staging_phase_banner.py`, `views/staging_phase_banner.py`, `urls/staging_phase_banner.py`, `StagingPhaseBannerAdmin` en `admin.py`; `components/staging/`, `lib/stores/stagingBannerStore.ts`, `lib/services/staging-banner.ts`.
5. **Verificar referencias** con `grep -r "<symbol>" backend/ frontend/` antes de eliminar. Si hay refs externas a la lista demo ⇒ marcar **adaptado** y preservar.
6. **Migraciones aplicadas en prod NUNCA se eliminan** — generar nueva migración con `makemigrations` tras eliminar el modelo.

## Pasos

Para cada fase: **(1)** listar inventario fijo → **(2)** grep para clasificar → **(3)** mostrar tabla de hallazgos → **(4)** confirmación → **(5)** `git rm` / edits → **(6)** verificación mínima → **(7)** commit aislado.

### Fase B1 — Modelos demo
- `backend/base_feature_app/models/blog.py` (`Blog`)
- `backend/base_feature_app/models/product.py` (`Product`)
- `backend/base_feature_app/models/sale.py` (`Sale`, `SoldProduct`)
- Actualizar `models/__init__.py` y `admin.py` tras eliminar.

### Fase B2 — Serializers demo
- `serializers/blog.py`, `blog_list.py`, `blog_detail.py`, `blog_create_update.py`
- `serializers/product.py`, `product_list.py`, `product_detail.py`, `product_create_update.py`
- `serializers/sale.py`, `sale_list.py`, `sale_detail.py`
- Actualizar `serializers/__init__.py`.

### Fase B3 — Views/Endpoints demo
- `views/blog.py`, `views/blog_crud.py`
- `views/product.py`, `views/product_crud.py`
- `views/sale.py`, `views/sale_crud.py`
- `views/captcha_views.py` (solo si reCAPTCHA no se usa)
- Preservar: `views/auth.py`, `views/user_crud.py`.

### Fase B4 — URLs demo
- `urls/blog.py`, `urls/product.py`, `urls/sale.py`, `urls/captcha.py`
- Editar `urls/__init__.py` para quitar `include()` correspondientes.
- Revisar `backend/base_feature_app/urls.py` (top-level dead-code legacy).
- Revisar `backend/base_feature_project/urls.py` para rutas registradas a nivel proyecto.
- Preservar: `urls/auth.py`, `urls/user.py`.

### Fase B5 — Forms demo
- `forms/blog.py`, `forms/product.py`
- Revisar `forms/__init_.py` (typo) y `forms/__init__.py`.

### Fase B6 — Management commands de fake data
- `management/commands/create_fake_data.py` (orquestador)
- `management/commands/create_blogs.py`, `create_products.py`, `create_sales.py`
- `management/commands/create_users.py` — revisar antes (puede ser útil para QA staging)
- `management/commands/delete_fake_data.py`
- Actualizar `management/commands/README.md`.
- Huey tasks: revisar `backend/base_feature_project/tasks.py` por tasks demo.
- También revisar `backend/base_feature_project/management/` (commands a nivel proyecto).

### Fase B7 — Migraciones obsoletas
- Listar `backend/base_feature_app/migrations/` y validar contra modelos restantes.
- **NO eliminar migraciones aplicadas en prod.** Generar migración de drop con `python manage.py makemigrations`.

### Fase B8 — Tests demo
- `backend/base_feature_app/tests/models/test_blog_model.py`, `test_product_model.py`, `test_sale_model.py`
- `backend/base_feature_app/tests/serializers/test_blog_serializers.py`, `test_product_serializers.py`, `test_sale_serializer.py`
- `backend/base_feature_app/tests/views/test_public_endpoints.py`, `test_crud_endpoints.py`, `test_crud_detail_endpoints.py`, `test_captcha_views.py` (revisar)
- Preservar tests de auth/JWT/user/admin/urls/forms (los infra).

### Fase B9 — Permissions / signals / utils demo
- Revisar `permissions/roles.py` y reemplazar roles si no aplican al nuevo dominio.
- Revisar templates de email demo en `templates/`.

### Fase B10 — Admin demo
- Editar `admin.py` para quitar registros de `Blog/Product/Sale/SoldProduct`.

### Fase F1 — Páginas/Rutas demo (App Router Next.js)
- `frontend/app/catalog/`, `app/products/[productId]/`, `app/blogs/`, `app/blogs/[blogId]/`
- `app/checkout/`, `app/manual/`, `app/backoffice/`, `app/admin-login/`
- `app/dashboard/` (revisar antes de eliminar)
- Preservar: `app/page.tsx`, `app/layout.tsx`, `app/sign-in/`, `app/sign-up/`, `app/forgot-password/`.

### Fase F2 — Componentes demo
- `components/blog/BlogCard.tsx`, `BlogCarousel.tsx`
- `components/product/ProductCard.tsx`, `ProductCarousel.tsx`
- `components/manual/ManualSearch.tsx`, `ManualSidebar.tsx`, `ProcessCard.tsx`
- Auditar links en `components/layout/Header.tsx`, `Footer.tsx`.

### Fase F3 — Stores Zustand demo
- `lib/stores/blogStore.ts`, `productStore.ts`, `cartStore.ts`
- Preservar: `authStore.ts`, `localeStore.ts`.

### Fase F4 — Hooks personalizados demo
- `lib/manual/useManualSearch.ts`
- Preservar: `lib/hooks/useRequireAuth.ts`.

### Fase F5 — Servicios / API clients demo
- Revisar `lib/services/http.ts` y eliminar helpers de `/api/blogs|products|sales`.
- Revisar `lib/constants.ts` (constantes demo `BLOG_*`, `PRODUCT_*`, `CART_*`, `MANUAL_*`).
- Revisar `frontend/proxy.ts` (URL backend del template).
- Preservar instancia axios + `lib/services/tokens.ts`.

### Fase F6 — Tipos TypeScript demo
- `lib/types.ts` — eliminar interfaces `Blog`, `Product`, `Sale`, `SoldProduct`.
- `lib/manual/types.ts`, `lib/manual/content.ts`.

### Fase F7 — i18n / traducciones demo
- `lib/i18n/config.ts` y `messages/*.json`: eliminar claves `manual.*`, `blog.*`, `product.*`, `cart.*`, `checkout.*`, `backoffice.*`.
- Reemplazar `app_name` que diga "Base Feature".

### Fase F8 — Assets / branding del template
- `frontend/public/`: buscar `base_feature*`, `template*`, `placeholder*`.
- Reemplazar `app/favicon.ico` si sigue siendo el del template.
- `app/layout.tsx`: actualizar `metadata.title`, `metadata.description`, `openGraph`.
- Revisar `manifest.json`, `robots.txt`, `sitemap.ts` si existen.

### Fase F9 — Tests unit + E2E demo
- Unit: `components/{blog,product,manual}/__tests__/`, `lib/stores/__tests__/{blog,product,cart}Store.test.ts`, `app/{catalog,products,blogs,checkout,manual,backoffice,admin-login,dashboard}/__tests__/`.
- E2E: `e2e/app/{cart,checkout,complete-purchase,user-flows}.spec.ts`, `e2e/public/{blogs,products,navigation}.spec.ts`.
- Preservar: `e2e/auth/auth.spec.ts`, `e2e/public/smoke.spec.ts`.

### Fase D1 — README.md raíz
- `grep -nE "Blog|Product|Sale|Manual|catalog|checkout|base[_ -]feature" README.md` y actualizar.

### Fase D2 — CLAUDE.md / AGENTS.md / GEMINI.md
- Raíz, `backend/`, `frontend/`. Reemplazar ejemplos `Blog/Product/Sale` y "Project Identity".

### Fase D3 — Docs en `/docs/`
- `USER_FLOW_MAP.md`, `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`, `E2E_FLOW_COVERAGE_REPORT_STANDARD.md`, `TESTING_QUALITY_STANDARDS.md`, `TEST_QUALITY_GATE_REFERENCE.md`, `DJANGO_REACT_ARCHITECTURE_STANDARD.md`, `GLOBAL_RULES_GUIDELINES.md`, `claude-code-methodology-setup-guide.md`.
- `docs/methodology/` (memory bank: `architecture.md`, `product_requirement_docs.md`, `technical.md`, `error-documentation.md`, `lessons-learned.md`) y `tasks/active_context.md`, `tasks/tasks_plan.md`.
- `frontend/SETUP.md`, `frontend/TESTING.md`.
- `audit-report.md` raíz.

### Fase D4 — `.env.example`
- `backend/.env.example`: `BACKUP_STORAGE_PATH`, `DJANGO_GOOGLE_OAUTH_CLIENT_ID`, `FRONTEND_URL`.
- `frontend/.env.example`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.

### Fase D5 — `package.json` y `pyproject.toml`
- `frontend/package.json`: `name`, `version`, `description`.
- `backend/pyproject.toml` (si existe).

### Fase D6 — Workflows `.windsurf/` y skills `.claude/` / `.agents/`
- `grep -rln "base_feature_app\|base_feature_project" .claude/ .agents/ .windsurf/` y actualizar.

### Fase D7 — Scripts raíz, CI y systemd
- `scripts/run-tests-all-suites.py`, `scripts/test_quality_gate.py`, `scripts/quality/`, `scripts/coverage-summary-ci.cjs`.
- `scripts/ci/` — workflows / pipelines.
- `scripts/systemd/` — unit files `base_django_react_next_feature_*.service`, `*-huey.service` deben renombrarse al servicio real.
- `frontend/scripts/` — scripts de soporte.
- `.github/workflows/*.yml` (si existen).

## Comandos de Validación

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

## Formato de Output

Al terminar (o al ejecutar una fase puntual), entregar:

1. **Resumen** — fases ejecutadas, items eliminados, preservados, en review.
2. **Commits creados** — sha + mensaje por fase, en orden.
3. **Pendientes manuales** — items REVIEW con archivo y razón.
4. **Verificaciones ejecutadas** — qué corrió, resultado, output si falló.
5. **Próxima fase recomendada**.
