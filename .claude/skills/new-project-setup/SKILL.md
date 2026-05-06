---
name: new-project-setup
description: "New project setup — persiste el checklist de requerimientos del cliente bajo docs/release/NN-release-checklist.md y reescribe la identidad del template (CLAUDE.md, README.md, AGENTS.md) por la del nuevo proyecto, sin tocar lógica, endpoints ni estructuras."
argument-hint: "<contenido completo del checklist .md del cliente, pegado verbatim>"
---

# New Project Setup — Bootstrap del Nuevo Proyecto sobre el Template

## Goal

El repo `base_django_react_next_feature/` se acaba de clonar para arrancar un nuevo proyecto. Antes de empezar a desarrollar, hace falta dejar el repo "auto-consciente" del proyecto real: el cliente entrega un `.md` muy estructurado con el checklist de requerimientos por categorías (listas, componentes, módulos, funcionalidades), y los archivos madre (`CLAUDE.md`, `README.md`, `AGENTS.md`) todavía describen el template, no el producto.

Este skill cubre exactamente esa transición de arranque, **simétrico al final del ciclo `pre-staging-cleanup`**: persiste el checklist del cliente en un release versionado y reescribe la identidad del template por la del nuevo proyecto en los archivos que Claude Code, Codex (vía `AGENTS.md`) y Windsurf consultan **primero** para entender de qué va el repo.

> **No toca lógica, endpoints, modelos ni estructura** — eso evoluciona durante el desarrollo y se limpia al final con `pre-staging-cleanup`. Aquí solo se persiste input del cliente y se reescribe identidad/contexto.

## Inputs

- **`$ARGUMENTS`**: contenido **literal** del archivo `.md` del cliente — pegado tal cual, no un path. El skill lo escribe verbatim a `docs/release/NN-release-checklist.md`.
- Variante detectada: este SKILL es para **Next.js / React / TypeScript / Zustand**.

## Reglas obligatorias

1. **Checklist verbatim** — el contenido de `$ARGUMENTS` se escribe SIN modificar (ni headers, ni encoding, ni espaciado, ni saltos de línea).
2. **No tocar lógica** — el skill solo modifica `CLAUDE.md` raíz, `README.md`, `AGENTS.md` y `docs/release/`. NUNCA `models/`, `views/`, `serializers/`, `urls/`, `components/`, `stores/`, `services/`, `migrations/`, `tests/`, ni código fuente.
3. **Confirmación humana antes de cada edit a archivos madre** (S3, S4, S5). S1 es la única fase write-only sin confirmación porque es input directo del usuario.
4. **Working tree limpio** — si `git status --porcelain` no está vacío al invocar, abortar antes de S1 con mensaje: `"Hay cambios sin commitear. Commitea o stashea antes de correr new-project-setup para mantener commits aislados."`
5. **Commits aislados por fase** que escriba archivos (S1, S3, S4, S5). S2, S6, S7 no commitean.
6. **No automatizar renames invasivos** — rename de Django app, edición de `.env.example`, edición de `scripts/systemd/`, regenerar Google OAuth Client ID **están fuera de scope**. S6 solo reporta.
7. **Idempotencia en S1** — si `$ARGUMENTS` (trim de whitespace) es idéntico byte-a-byte al contenido del último `NN-release-checklist.md`, abortar S1 (no crear `NN+1`); S2–S6 pueden re-ejecutarse manualmente para re-aplicar identidad.
8. **Stack se preserva** en CLAUDE.md (el clon del template ES el stack del nuevo proyecto, no se reescribe).
9. **Padding 2 dígitos** en `NN-release-checklist.md` (`01`, `02`, …, `99`). Si llegara a `100`, ampliar a 3 dígitos automáticamente.
10. **`$ARGUMENTS` vacío** → abortar con mensaje sin tocar nada.

## Workflow por fases

Flujo único **S1 → S7** (sin sub-comandos por fase). Cada fase con efectos persistentes confirma antes de aplicar y commitea aisladamente.

---

### Fase S1 — Persistir checklist (write-only)

**Objetivo**: guardar `$ARGUMENTS` verbatim en `docs/release/NN-release-checklist.md`.

**Pre-checks**:
- `git status --porcelain` debe estar vacío. Si no, abortar.
- `$ARGUMENTS` no vacío. Si vacío, abortar.

**Detección de NN**:
```bash
mkdir -p docs/release
ls docs/release/ 2>/dev/null | grep -E '^[0-9]{2}-release-checklist\.md$' | sort | tail -n1
```
- Si vacío → `NN=01`.
- Si existe `NN_max` → `NN = printf '%02d' $((10#NN_max + 1))`.

**Idempotencia**: si existe un release previo y `$ARGUMENTS` (con `trim` al inicio/fin) coincide byte-a-byte con su contenido, abortar S1 con mensaje:
```
Checklist idéntico al release NN ya existente. S2–S6 pueden re-ejecutarse manualmente si se requiere re-aplicar identidad.
```
y NO avanzar a S2.

**Acción**: escribir `docs/release/NN-release-checklist.md` con el contenido tal cual de `$ARGUMENTS`. Sin alterar markdown, encoding, espaciado, ni saltos de línea.

**Verificación**:
```bash
wc -l docs/release/NN-release-checklist.md
head -n 5 docs/release/NN-release-checklist.md
```

**Commit aislado**:
```
chore(release): add NN-release-checklist (initial requirements)
```

---

### Fase S2 — Extraer identidad del proyecto

**Objetivo**: derivar del checklist guardado los campos que se aplicarán en S3–S5: `project_name`, `project_short_description`, `project_domain`, `project_main_modules`, `project_slug`.

**Heurística** sobre el archivo de S1:
- Primer `# H1` → `project_name`.
- Blockquote `> ...` o primer párrafo inmediato → `project_short_description`.
- Líneas que empiezan con `Domain:`, `Dominio:`, `Cliente:`, `Industry:` → `project_domain`.
- Encabezados `## ...` o `### ...` → `project_main_modules` (lista).

**Slug derivation**:
```
project_slug = lowercase(project_name)
            | replace [^a-z0-9] → '_'
            | collapse '__' → '_'
            | trim '_'
```
Ej: `"Pet Adoption Platform"` → `pet_adoption_platform`. Coherente con el snake_case del template.

**Output**: tabla con valores detectados.

```
| Campo                   | Valor detectado                  |
|-------------------------|----------------------------------|
| project_name            | <name>                           |
| project_short_desc      | <desc>                           |
| project_domain          | <domain>                         |
| project_slug            | <slug>                           |
| project_main_modules    | <m1>, <m2>, <m3>                 |

¿Confirmas estos valores o corriges alguno? [y / edit / abort]
```

**Confirmación humana**:
- `y` → continuar a S3.
- `edit` → preguntar campo por campo y aplicar overrides.
- `abort` → cortar el flujo. Lo escrito en S1 se conserva (el checklist queda guardado).

**Fallback**: si la heurística devuelve vacío en algún campo, modo completamente interactivo (preguntar 4 campos uno por uno).

**Sin commit en esta fase** — los valores se mantienen en memoria para S3–S5.

---

### Fase S3 — Reescribir `CLAUDE.md` raíz

**Objetivo**: reemplazar **solo** el bloque de identidad (H1 superior y `## Project Identity`). Preservar todo el resto.

**Detección**:
- H1 superior: `# Base Django React Next Feature — Claude Code Configuration`.
- Bloque que empieza en `## Project Identity` y termina justo antes del primer `---` siguiente.

**Reemplazos** (solo dentro de Project Identity + H1):
- H1 → `# <project_name> — Claude Code Configuration`.
- `**Name**: Base Django React Next Feature (Template project)` → `**Name**: <project_name>`.
- `**Domain**: N/A (template — not deployed to production)` → `**Domain**: <project_domain>`.
- `**Stack**: Django + DRF (backend) / Next.js + React + TypeScript (frontend) / MySQL 8 / Redis / Huey` → **preservar intacto** (es el stack real del nuevo proyecto).
- `**Server path**: /home/ryzepeck/webapps/base_django_react_next_feature_staging` → reemplazar slug por `<project_slug>`.
- `**Services**: base_django_react_next_feature_staging (Gunicorn), base_django_react_next_feature-staging-huey` → reemplazar slug por `<project_slug>`.
- `**Note**: This is a **template project** ...` → `**Note**: <project_short_description>`.

**Preservar SIN tocar**: `General Rules`, `Security Rules`, `Memory Bank System`, `Directory Structure`, `Testing Rules`, `Lessons Learned`, `Error Documentation`, `Methodology Maintenance`.

**Confirmación humana**: mostrar diff unificado del bloque a editar antes de aplicar.
```
¿Aplicar reemplazos en CLAUDE.md? [y/N]
```

**Verificación post-edit**:
```bash
grep -c 'Base Django React Next Feature' CLAUDE.md     # debe ser 0
grep -c '## Project Identity' CLAUDE.md                # debe ser 1
grep -c 'Next.js\|React\|TypeScript' CLAUDE.md         # debe ser > 0 (stack preservado)
```

**Commit aislado**:
```
chore(identity): replace template identity in root CLAUDE.md
```

---

### Fase S4 — Reescribir `README.md` raíz

**Objetivo**: reescribir solo identidad/header, preservando features, technologies, structure, scripts, testing, license, author.

**Bloques a editar** (hunks puntuales, NO bulk replace):
- H1 inicial (`# 🚀 Base Django React Next Feature` o similar) → `# 🚀 <project_name>`.
- Blockquote inmediato (`> Base template for ...`) → `> <project_short_description>`.
- Párrafo "This repository serves as a foundation ..." → reescribir basado en `project_short_description` + `project_domain`.
- Sección `## 🎯 Reference Projects` → marcar como **REVIEW** (sugerir borrar; preguntar).
- Sección `## 🔧 Customization → Change Project Name` → marcar candidata a borrar (ya se ejecutó la customization vía este skill).
- Línea `*Last updated: ...*` → actualizar con `date +'%B %Y'`.

**Confirmación humana**: diff por hunk con `[y/n/all]`. NO `sed -i` masivo.

**Verificación**:
```bash
grep -c 'base_feature\|Base Django' README.md          # informativo (no aborta)
```

**Commit aislado**:
```
chore(identity): rewrite README header for <project_name>
```

---

### Fase S5 — Crear `AGENTS.md` (duplicado completo de CLAUDE.md raíz)

**Objetivo**: que Codex (y cualquier agente que lea `AGENTS.md` primero) tenga contexto completo del proyecto sin segundo lookup. La convención escogida es **duplicado completo** del `CLAUDE.md` raíz post-S3, ajustando solo el H1.

**Acción**:
```bash
cp CLAUDE.md AGENTS.md
```
Luego reemplazar el H1:
- `# <project_name> — Claude Code Configuration` → `# <project_name> — Codex/Agents Configuration`.

**Si `AGENTS.md` ya existe**: preguntar `[overwrite / merge-identity-only / skip]`.
- `overwrite` → reemplazar archivo completo.
- `merge-identity-only` → reescribir solo el bloque `## Project Identity` (heredado de S3) preservando el resto del `AGENTS.md` existente.
- `skip` → saltar S5.

**Confirmación humana**: mostrar el archivo propuesto (o el diff si era merge). `[y/N]`.

**Verificación**:
```bash
diff CLAUDE.md AGENTS.md | head -n 5     # debe mostrar solo diferencia del H1
```

**Commit aislado**:
```
chore(identity): bootstrap AGENTS.md as Codex configuration
```

---

### Fase S6 — Auditoría read-only de referencias residuales

**Objetivo**: producir un **reporte** de todas las referencias residuales al template, sin modificar nada. La sustitución es manual y se hace por fuera (renames de Django app, `.env.example`, `scripts/systemd/`, OAuth Client ID).

**Patrones a buscar**:
```
base_django_react_next_feature
base_feature_app
base_feature_project
931303546385-                       (Google OAuth Client ID del template)
/home/ryzepeck/webapps/
```

**Comando**:
```bash
grep -rln \
  --include='*.md' --include='*.py' --include='*.ts' --include='*.tsx' \
  --include='*.js' --include='*.json' --include='*.toml' --include='*.cfg' \
  --include='*.ini' --include='*.service' --include='*.yml' --include='*.yaml' \
  --include='.env.example' \
  --exclude-dir='.git' --exclude-dir='node_modules' --exclude-dir='venv' \
  --exclude-dir='.next' --exclude-dir='dist' --exclude-dir='staticfiles' \
  '<pattern>' .
```

**Output**: tabla agrupada por patrón.
```
| Patrón                          | # archivos | Ejemplos (top 5)                          |
|---------------------------------|------------|-------------------------------------------|
| base_feature_app                | 47         | backend/base_feature_app/models/...       |
| base_feature_project            | 23         | backend/base_feature_project/settings.py  |
| 931303546385-                   | 2          | backend/.env.example, frontend/.env...    |
| /home/ryzepeck/webapps/         | 5          | scripts/systemd/...service                |
```

**Sin cambios. Sin commit.** Solo informe + nota recomendando ejecutar manualmente:
- Rename de Django app (`base_feature_app` → `<project_slug>_app`) — fuera de scope, complejo (toca imports en cada `.py`, settings, urls, migrations).
- Regenerar Google OAuth Client ID y actualizar `backend/.env.example` + `frontend/.env.example`.
- Actualizar `scripts/systemd/*.service` con el nuevo `DJANGO_SETTINGS_MODULE` y nombres de servicio.
- Actualizar `frontend/package.json` (`name`, `version`, `description`).

---

### Fase S7 — Reporte final

**Acción**: imprimir el resumen consolidado (Output Contract abajo). Sin commit propio — los commits aislados de S1, S3, S4, S5 ya están hechos.

---

## Verificación post-fase

| Tipo | Comando | Cuándo |
|------|---------|--------|
| Checklist persistido | `wc -l docs/release/NN-release-checklist.md` | Tras S1 |
| Identidad CLAUDE.md | `grep -c 'Base Django React Next Feature' CLAUDE.md` (debe ser 0) | Tras S3 |
| Stack preservado | `grep -c 'Next.js\|React\|TypeScript' CLAUDE.md` (debe ser > 0) | Tras S3 |
| README header | `head -n 10 README.md` | Tras S4 |
| AGENTS.md vs CLAUDE.md | `diff CLAUDE.md AGENTS.md \| head -n 5` (solo H1 difiere) | Tras S5 |
| Commits aislados | `git log --oneline -n 4` | Tras S5 |
| Referencias residuales | (output de S6) | Tras S6 |

## Output Contract

Al terminar, entregar:

1. **Checklist persistido** — path absoluto, `NN`, líneas, bytes.
2. **Identidad aplicada** — tabla `project_name / project_short_description / project_domain / project_slug / project_main_modules`.
3. **Archivos modificados** — lista con sha de commit por archivo (`CLAUDE.md`, `README.md`, `AGENTS.md`).
4. **Referencias residuales** (output S6) — tabla resumen.
5. **Próximos pasos sugeridos**:
   - `/methodology-setup` para inicializar Memory Bank (`docs/methodology/`, `tasks/`).
   - Tareas manuales fuera de scope: rename Django app, regenerar OAuth Client ID, actualizar `scripts/systemd/`, `.env.example`.
   - Cuando el proyecto esté maduro y próximo a staging: `/pre-staging-cleanup` para limpiar residuos del template.

## Ejemplos de invocación

Invocación típica — pegando el `.md` del cliente como argumento:

```
/new-project-setup # Pet Adoption Platform

> Plataforma para conectar refugios y adoptantes en Latinoamérica.

Domain: Pet adoption / animal welfare

## Categorías

### 1. Gestión de mascotas
- [ ] CRUD de mascotas con galería
- [ ] Filtros por especie, edad, tamaño
- [ ] Sistema de etiquetas (urgente, especial, etc.)

### 2. Gestión de refugios
- [ ] Perfil del refugio
- [ ] Verificación administrativa
- [ ] Dashboard con métricas

### 3. Adopción
- [ ] Solicitud de adopción
- [ ] Seguimiento del proceso
- [ ] Comunicación refugio ↔ adoptante
```

> **Nota**: el flujo es **completo S1 → S7 siempre**. No hay invocación por fase suelta. Si solo querés re-aplicar identidad sin generar nuevo release, pegá el mismo checklist y S1 abortará por idempotencia, permitiendo continuar S2–S5 manualmente.
