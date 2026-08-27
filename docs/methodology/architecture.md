# Architecture — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-27 (dependency refresh). Diagramas y pipeline verificados contra el código.

## Vista de sistema

```mermaid
flowchart LR
    B[Browser] --> N[Next.js 16 App Router\nfrontend/ :3000]
    N -- axios + JWT --> D[DRF API\nbackend/ :8000]
    D --> DB[(sqlite dev/test\nMySQL prod)]
    D --> R[(Redis)]
    R --> H[Huey worker]
    D --> M[/media: easy-thumbnails\ndjango_attachments/]
```

- Frontend consume `api/*`; auth por JWT (`/api/token/` + refresh) guardado vía `lib/services/tokens`.
- `api/health/` identifica proyecto+entorno (verificación de probes del fleet).

## Flujo de request típico (compra)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Next (cartStore/checkout)
    participant API as DRF (views/sale.py)
    participant ORM as Modelos
    U->>FE: agrega productos, checkout
    FE->>API: POST venta (JWT)
    API->>ORM: valida serializer sale
    ORM->>ORM: crea SoldProduct (precio congelado, FK PROTECT)
    ORM->>ORM: crea Sale + M2M sold_products
    API-->>FE: 201 + detalle
    FE-->>U: confirmación
```

## Modelo de datos (ER)

```mermaid
erDiagram
    USER ||--o{ PASSWORD_CODE : "password_codes"
    USER ||--o{ SALE : "compras"
    PRODUCT ||--o{ SOLD_PRODUCT : "snapshot precio (PROTECT)"
    SALE }o--o{ SOLD_PRODUCT : "sold_products M2M"
    LIBRARY ||--o{ ATTACHMENT : "django_attachments"
    PRODUCT ||--o| LIBRARY : "galeria"
    BLOG ||--o| LIBRARY : "imagenes"
    STAGING_PHASE_BANNER {
        string phase
        datetime expires_at
    }
```

Modelos en `backend/base_feature_app/models/` (6): `user.py` (custom User + manager), `password_code.py`, `product.py`, `blog.py`, `sale.py` (Sale + SoldProduct), `staging_phase_banner.py`; más `django_attachments/models.py` (Library/Attachment).

## Capas backend

```mermaid
flowchart TD
    U[urls/ paquete: auth, blog, captcha, product, sale, staging_phase_banner, user] --> V[views/ FBV @api_view x10]
    V --> S[serializers/ x16: list, detail, create_update]
    V --> SV[services/: email_service]
    S --> M[models/ x6 + django_attachments]
    C[management/commands: create_fake_data, delete_fake_data, create_users/products/blogs/sales] --> M
```

## Frontend (App Router)

- 12 páginas: `/`, `catalog`, `products/[productId]`, `blogs`, `blogs/[blogId]`, `checkout`, `sign-in`, `sign-up`, `forgot-password`, `admin-login`, `dashboard`, `backoffice` (+ `manual`).
- 6 stores Zustand (`lib/stores/`): auth, blog, cart, locale, product, stagingBanner. 2 hooks compartidos (`useRequireAuth`, `useHydrated`).
- 30 componentes/páginas `.tsx` entre `app/` y `components/` sin contar tests (48 incluyendo `__tests__/`); incluye `components/staging/` con el banner de fase.

## Deployment / CI (workflow actual)

- Template **sin despliegue**: sólo CI en GitHub Actions.
- `ci.yml`: backend-tests (lock drift + hashes + pip-audit + pytest sqlite) ·
  frontend-unit-tests (npm audit + scripts revisados + lint + TypeScript 7/6 +
  build + Jest) ·
  frontend-e2e-tests (venv + migrate + `create_fake_data 5` + Playwright
  chromium + flow-coverage reporter) · coverage-summary.
- `test-quality-gate.yml`: gate con `--junk-severity=error` contra `.junk-baseline.json`.
- Ramas protegidas: nunca commit directo a master; trabajo vía rama + PR.

## Supply chain de dependencias

```mermaid
flowchart LR
    RI[requirements.in] --> PC[pip-compile]
    PC --> RL[requirements.txt\nexacto + hashes]
    RL --> PA[pip install --require-hashes\n+ pip-audit]
    PJ[package.json\nexact pins + allowScripts] --> NC[npm ci]
    PL[package-lock.json] --> NC
    NC --> FA[npm audit + ESLint\nTS 7 + TS 6 + Next build]
```

- Runtimes compartidos por local y CI: Python 3.14.7 (`.python-version`) y
  Node 24.20.0 (`.nvmrc`); npm 11.19.0 se declara en `packageManager`.
- Las GitHub Actions están fijadas por SHA con el tag legible como comentario.
- Los scripts nativos npm sólo se autorizan por paquete y versión mediante
  `allowScripts`; un bump no hereda confianza automáticamente.

### Workflow actual (2026-08-27)

El dependency refresh integral quedó implementado secuencialmente en el PR #20:
cada commit funcional esperó backend, frontend unit, frontend E2E, quality gate
y coverage verdes antes del siguiente. El reporte canónico es
`audit-report.md`.
