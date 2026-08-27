# Auditoría de vulnerabilidades y actualización integral de dependencias

- **Fecha:** 2026-08-27
- **Rama:** `chore/27082026-dependency-refresh`
- **Base:** `master`
- **PR:** [#20](https://github.com/carlos18bp/base_django_react_next_feature/pull/20)
- **Alcance:** runtimes, package managers, GitHub Actions y todas las dependencias
  directas de backend y frontend, incluidos saltos major y fronteras `0.x`.

## Veredicto

🟢 **Actualización completada.** No quedan vulnerabilidades conocidas en los
locks instalables ni dependencias directas atrasadas compatibles con los
runtimes elegidos.

| Superficie | Estado inicial | Estado final |
|---|---:|---:|
| Frontend (`npm audit`) | 10 vulnerabilidades (9 high, 1 low) | **0** |
| Backend (`pip-audit`) | 40 hallazgos en 4 paquetes | **0** |
| Backend (`pip list --outdated`) | 14 paquetes | **0** |
| Frontend (`npm-check-updates`) | 14 atrasados + majors pendientes | **2 exclusiones de runtime** |
| Scripts de instalación npm sin revisar | No controlados | **0** |

Las dos exclusiones finales de `npm-check-updates` son `@types/node 26.4.0` y
`npm 12.0.2`: ambas corresponden a Node 26, mientras este proyecto fija Node
24 LTS. No representan librerías atrasadas dentro del runtime soportado.

## Runtimes y reproducibilidad

| Recurso | Versión final | Control |
|---|---:|---|
| Python | 3.14.7 | `.python-version` + `setup-python` |
| pip | 26.2.1 | `backend/requirements-tools.txt` |
| Node.js | 24.20.0 LTS | `.nvmrc` + `setup-node` |
| npm | 11.19.0 | `packageManager`, `engines` y CI |
| Backend | lock con hashes | `requirements.in` → `requirements.txt` |
| Frontend | lock npm | `package.json` + `package-lock.json` + `npm ci` |

CI recompila el lock de Python y falla ante drift, instala con
`--require-hashes`, ejecuta `pip-audit`, y para frontend exige `npm audit`,
allowlist completa de scripts, lint, los dos typechecks y el build de producción
antes de Jest.

## Backend final

### Aplicación

| Paquete | Versión |
|---|---:|
| Django | 6.1 |
| django-cleanup | 9.0.0 |
| django-cors-headers | 4.9.0 |
| django-dbbackup | 5.3.0 |
| django-silk | 5.5.2 |
| djangorestframework | 3.18.0 |
| djangorestframework-simplejwt | 5.5.1 |
| easy-thumbnails | 2.10.1 |
| Gunicorn | 26.2.0 |
| Huey | 3.3.4 |
| mysqlclient | 2.2.8 |
| Pillow | 12.3.0 |
| python-dotenv | 1.2.3 |
| redis | 8.1.0 |
| requests | 2.34.2 |

### Desarrollo, test y límites de seguridad explícitos

| Paquete | Versión |
|---|---:|
| coverage | 7.15.4 |
| factory-boy | 3.3.3 |
| Faker | 40.37.0 |
| freezegun | 1.5.5 |
| pytest | 9.1.1 |
| pytest-cov | 7.1.0 |
| pytest-django | 4.14.0 |
| Ruff | 0.16.4 |
| Pygments | 2.21.0 |
| PyJWT | 2.13.0 |
| sqlparse | 0.6.0 |
| urllib3 | 2.7.0 |

Se cerraron expresamente las fronteras que el plan inicial había diferido:
sqlparse `0.5→0.6`, Gunicorn `23→26`, Ruff `0.15→0.16` y pip `24→26`.

## Frontend final

### Producción

| Paquete | Versión |
|---|---:|
| Next.js | 16.3.3 |
| React / React DOM | 19.2.8 |
| Axios | 1.20.0 |
| Fuse.js | 7.5.0 |
| js-cookie | 3.0.8 |
| jwt-decode | 4.0.0 |
| lucide-react | 1.34.0 |
| next-intl | 4.14.0 |
| next-themes | 0.4.6 |
| react-google-recaptcha | 3.1.0 |
| Zustand | 5.0.15 |

Las integraciones Google OAuth y reCAPTCHA, junto con sus tipos, también están
pineadas exactamente en `package.json`.

### Tooling

| Paquete | Versión / estrategia |
|---|---:|
| TypeScript | 7.0.2 (`tsc`, gate principal) |
| TypeScript API compatible | 6.0.2 (`tsc6`, alias oficial) |
| ESLint | 10.9.1 + `@eslint/compat` 2.1.0 |
| eslint-config-next | 16.3.3 |
| eslint-plugin-playwright | 2.11.0 |
| Jest / jsdom | 30.4.2 / 30.4.1 |
| Testing Library jest-dom | 7.0.1 |
| Testing Library React | 16.3.2 |
| Playwright | 1.62.1 |
| Tailwind CSS / PostCSS | 4.3.3 |
| `@types/node` | 24.13.3, alineado con Node 24 |

TypeScript 7 aún no ofrece la API programática requerida por todo el
ecosistema. Por eso se usa la disposición lado a lado recomendada por el equipo
de TypeScript: `tsc` 7 valida el proyecto, mientras Next y typescript-eslint
consumen la API de TypeScript 6. CI exige que ambas rutas pasen.

ESLint 10 se ejecuta mediante el adaptador oficial `@eslint/compat`. Los plugins
`eslint-plugin-import`, `eslint-plugin-jsx-a11y` y `eslint-plugin-react` ya están
en sus últimas versiones, pero sus rangos peer todavía terminan en ESLint 9;
npm informa el desfase de metadata y la compatibilidad real queda verificada por
lint y CI.

## Supply chain de npm

`allowScripts` autoriza únicamente estos scripts, fijados a la versión revisada:

- `@parcel/watcher@2.5.6`
- `@swc/core@1.16.1`
- `unrs-resolver@1.11.1`

Una versión futura no heredará la autorización. El chequeo final informa:
`No packages with unreviewed install scripts`.

Los avisos deprecados de `inflight`, `glob 7/10` y `whatwg-encoding` provienen
de Jest/jsdom actuales. No hay una versión directa más nueva que los elimine y
`npm audit` no reporta vulnerabilidades; quedan como deuda exclusivamente
upstream.

## GitHub Actions

Todas las actions quedaron fijadas por SHA y anotadas con su tag:

| Action | Tag |
|---|---:|
| `actions/checkout` | 7.0.1 |
| `actions/setup-node` | 7.0.0 |
| `actions/setup-python` | 7.0.0 |
| `actions/upload-artifact` | 7.0.1 |
| `actions/download-artifact` | 8.0.1 |
| `marocchino/sticky-pull-request-comment` | 3.0.5 |

## Secuencia de commits verificados

Cada commit funcional se publicó y esperó CI verde antes de iniciar el
siguiente:

| SHA | Cambio |
|---|---|
| `ebb999d` | Actualizar GitHub Actions |
| `691265f` | Añadir gates de dependencias y compatibilidad |
| `e5a517d` | Alinear Node LTS y pinear npm/frontend |
| `4b57e6b` | Alinear Python 3.14 |
| `2a2f1ad` | Crear lock Python reproducible con hashes |
| `5179a90` | Actualizar sqlparse y exigir `pip-audit` |
| `903a957` | Actualizar Gunicorn |
| `95fd0e1` | Actualizar Ruff |
| `c6d574c` | Actualizar jest-dom |
| `3be1847` | Actualizar ESLint |
| `ad5c24c` | Añadir la transición TypeScript 7/6 |
| `2764cea` | Aprobar scripts npm por paquete y versión |
| `d3ff909` | Hacer fallar CI ante scripts npm no revisados |

## Verificación final

- `pip-audit --require-hashes`: **0 vulnerabilidades**.
- `pip list --outdated --format=json`: **`[]`**.
- `npm audit --audit-level=high`: **0 vulnerabilidades**.
- `npm-check-updates --target latest`: sólo las 2 exclusiones de Node 26.
- `npm ci` con npm 11.19.0: reproducible.
- `npm run typecheck`: TypeScript 7.0.2, verde.
- `npm run typecheck:compat`: TypeScript 6, verde.
- `npm run lint`: 0 errores (10 warnings preexistentes).
- `npm run build`: 13 rutas generadas correctamente.
- Lote unitario focalizado: 16/16 tests verdes.
- CI por commit: backend, frontend unit, frontend E2E, quality gate y coverage,
  todos verdes antes de continuar.

## Seguimiento recomendado

- Retirar `@eslint/compat` cuando los tres plugins amplíen oficialmente sus
  peers a ESLint 10.
- Retirar el alias TypeScript 6 cuando Next/typescript-eslint consuman la API de
  TypeScript 7 o posterior.
- Adoptar Node 26, npm 12 y `@types/node` 26 juntos cuando Node 26 sea el runtime
  objetivo del proyecto; no mezclar sus tipos con Node 24 LTS.
