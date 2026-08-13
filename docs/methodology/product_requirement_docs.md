# Product Requirement Docs — Base Django React Next Feature

> Memory Bank · actualizado 2026-08-13 (corrida /qa). Proyecto **template**: no se despliega a producción; es el punto de partida de los proyectos Django+Next del fleet.

## Por qué existe

- Arrancar un proyecto cliente nuevo con stack, convenciones, testing y CI ya resueltos, en horas en vez de días.
- Fijar el estándar de calidad del fleet (quality gate, flow map E2E, Memory Bank) desde el commit 0 de cada derivado.
- Servir de banco de pruebas de las skills/workflows del toolkit (`new-project-setup`, `pre-staging-cleanup`, `/qa`) antes de tocar proyectos reales.

## Alcance funcional (features demo incluidas)

| Módulo | Qué demuestra | Rutas API (base_feature_app/urls/) |
|---|---|---|
| Auth | sign-up, sign-in, Google OAuth, reset por passcode, update password, validate token (JWT simplejwt) | `auth.py` (7) |
| Blog | listado + detalle público, CRUD admin | `blog.py` (3) |
| Catálogo/Producto | listado, detalle, CRUD admin, galería (django_attachments) | `product.py` (3) |
| Ventas/Checkout | carrito (frontend), venta con SoldProduct snapshot, CRUD admin | `sale.py` (3) |
| Usuarios | CRUD admin | `user.py` (2) |
| Captcha | verificación reCAPTCHA | `captcha.py` (2) |
| Staging banner | fase de staging visible + overlay de expiración | `staging_phase_banner.py` (1) |

Frontend (Next App Router, 12 páginas): home, catalog, products/[id], blogs, blogs/[id], checkout, sign-in, sign-up, forgot-password, admin-login, dashboard, backoffice (+ manual y comingSoon).

## Usuarios

- **Visitante**: navega home/catálogo/blogs, arma carrito.
- **Cliente autenticado**: checkout/compra, dashboard.
- **Admin**: admin-login → backoffice (CRUD blogs/productos/ventas/usuarios) + Django admin custom (`admin_site`).

## Reglas de negocio del template

- Bilingüe EN/ES end-to-end (next-intl en frontend; contenido con campos pareados o traducción según feature).
- JWT con refresh (`/api/token/`, `/api/token/refresh/`); rutas sensibles con permisos DRF.
- Venta congela precio en `SoldProduct` (FK `PROTECT` a Product): borrar producto no rompe historial.
- Reset de password por código de un solo uso (`PasswordCode`, FK a User).
- Fake data reproducible vía management commands (`create_fake_data N` / `delete_fake_data`) — obligatoria para E2E y demos.
- `api/health/` responde `project` + `environment` para que los probes externos verifiquen QUIÉN contesta (lección F24 del fleet).

## Fuera de alcance

- Pagos reales, emails transaccionales a terceros, monitoreo/backups (excluido explícitamente en projects.yml: scaffold sin servicios ni tráfico).
