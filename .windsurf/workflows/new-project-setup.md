---
description: New project setup — persiste el checklist del cliente en docs/release/NN-release-checklist.md y reescribe la identidad del template (CLAUDE.md, README.md, AGENTS.md) por la del nuevo proyecto, sin tocar lógica ni endpoints
auto_execution_mode: 2
---

# New Project Setup — Bootstrap del Nuevo Proyecto sobre el Template

## Goal
El repo `base_django_react_next_feature/` se acaba de clonar para arrancar un nuevo proyecto. El cliente entrega un `.md` con el checklist de requerimientos por categorías, y los archivos madre (`CLAUDE.md`, `README.md`, `AGENTS.md`) todavía describen el template. Este workflow persiste el checklist en un release versionado y reescribe la identidad del template por la del nuevo proyecto, sin tocar lógica/endpoints/estructura. Es el simétrico al inicio del `pre-staging-cleanup` (que se ejecuta al final del ciclo).

## Inputs
- `$ARGUMENTS`: contenido **literal** del `.md` del cliente, pegado verbatim (NO un path).
- Variante: **Next.js / React / TypeScript / Zustand**.

## Restricciones No Negociables
1. **Checklist verbatim** — `$ARGUMENTS` se escribe SIN modificar.
2. **No tocar lógica** — solo `CLAUDE.md` raíz, `README.md`, `AGENTS.md`, y `docs/release/`. NUNCA `models/`, `views/`, `serializers/`, `urls/`, `components/`, `stores/`, `services/`, `migrations/`, `tests/`.
3. **Confirmación humana** antes de cada edit a archivos madre (S3, S4, S5).
4. **Working tree limpio** — `git status --porcelain` debe estar vacío al invocar.
5. **Commits aislados** por fase con efectos (S1, S3, S4, S5).
6. **No automatizar renames invasivos** — Django app, `.env.example`, `scripts/systemd/`, OAuth Client ID quedan fuera de scope. S6 solo reporta.
7. **Idempotencia en S1** — si `$ARGUMENTS` (trim) coincide con el último release, abortar S1.
8. **Stack se preserva** en CLAUDE.md.
9. **Padding 2 dígitos** (`01`, `02`, …, `99`).
10. **`$ARGUMENTS` vacío** → abortar.

## Pasos

Flujo único S1 → S7. Sin sub-comandos por fase.

### Fase S1 — Persistir checklist (write-only)
- Pre-checks: `git status --porcelain` vacío y `$ARGUMENTS` no vacío.
- Detectar NN: `ls docs/release/ | grep -E '^[0-9]{2}-release-checklist\.md$' | sort | tail -n1`. Vacío → `NN=01`. Si `NN_max` → `NN+1` (padding 2 dígitos).
- Idempotencia: si `$ARGUMENTS` (trim) == último release, abortar S1.
- `mkdir -p docs/release && write docs/release/NN-release-checklist.md` con `$ARGUMENTS` verbatim.
- Verificación: `wc -l` y `head -n 5`.
- Commit: `chore(release): add NN-release-checklist (initial requirements)`.

### Fase S2 — Extraer identidad
- Heurística sobre el archivo de S1:
  - Primer `# H1` → `project_name`.
  - Blockquote/párrafo inmediato → `project_short_description`.
  - `Domain:|Dominio:|Cliente:|Industry:` → `project_domain`.
  - Encabezados `## ...` → `project_main_modules`.
- Slug: `lowercase(name) | replace [^a-z0-9] → '_' | collapse '__' | trim '_'`.
- Mostrar tabla y pedir `[y / edit / abort]`. Fallback completamente interactivo si la heurística devuelve vacío.
- Sin commit.

### Fase S3 — Reescribir `CLAUDE.md` raíz
- Detectar H1 superior y bloque `## Project Identity` (hasta primer `---`).
- Reemplazar:
  - H1 → `# <project_name> — Claude Code Configuration`.
  - `**Name**`, `**Domain**`, `**Note**` → valores del proyecto.
  - `**Server path**`, `**Services**` → reemplazar slug del template (`base_django_react_next_feature`) por `<project_slug>`.
  - `**Stack**` → **preservar intacto**.
- Preservar SIN tocar: `General Rules`, `Security Rules`, `Memory Bank System`, `Directory Structure`, `Testing Rules`, `Lessons Learned`, `Error Documentation`, `Methodology Maintenance`.
- Confirmación humana: diff unificado del bloque `[y/N]`.
- Verificación: `grep -c 'Base Django React Next Feature' CLAUDE.md` debe ser `0`.
- Commit: `chore(identity): replace template identity in root CLAUDE.md`.

### Fase S4 — Reescribir `README.md` raíz
- Hunks puntuales (NO sed masivo):
  - H1 → `# 🚀 <project_name>`.
  - Blockquote → `> <project_short_description>`.
  - Párrafo "This repository serves as a foundation ..." → reescribir basado en `project_short_description` + `project_domain`.
  - `## 🎯 Reference Projects` → marcar REVIEW.
  - `## 🔧 Customization → Change Project Name` → marcar candidata a borrar.
  - `*Last updated: ...*` → `date +'%B %Y'`.
- Confirmación: diff por hunk `[y/n/all]`.
- Commit: `chore(identity): rewrite README header for <project_name>`.

### Fase S5 — Crear `AGENTS.md` (duplicado completo de CLAUDE.md raíz)
- `cp CLAUDE.md AGENTS.md` y reemplazar H1: `Claude Code Configuration` → `Codex/Agents Configuration`.
- Si ya existe: preguntar `[overwrite / merge-identity-only / skip]`.
- Confirmación: mostrar archivo (o diff si merge) `[y/N]`.
- Verificación: `diff CLAUDE.md AGENTS.md | head -n 5` debe mostrar solo H1 diferente.
- Commit: `chore(identity): bootstrap AGENTS.md as Codex configuration`.

### Fase S6 — Auditoría read-only (sin cambios)
- Patrones: `base_django_react_next_feature`, `base_feature_app`, `base_feature_project`, `931303546385-`, `/home/ryzepeck/webapps/`.
- `grep -rln --include='*.md' --include='*.py' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.json' --include='*.toml' --include='*.cfg' --include='*.ini' --include='*.service' --include='*.yml' --include='*.yaml' --include='.env.example' --exclude-dir='.git' --exclude-dir='node_modules' --exclude-dir='venv' --exclude-dir='.next' --exclude-dir='dist' --exclude-dir='staticfiles' '<pattern>' .`
- Tabla `| Patrón | # archivos | Ejemplos top 5 |`.
- Sin commit. Recomendar manualmente: rename Django app, regenerar OAuth Client ID, actualizar `scripts/systemd/`, `.env.example`, `frontend/package.json`.

### Fase S7 — Reporte final
- Resumen consolidado (Output Contract). Sin commit propio.

## Comandos de Validación

| Tipo | Comando | Cuándo |
|------|---------|--------|
| Checklist persistido | `wc -l docs/release/NN-release-checklist.md` | Tras S1 |
| Identidad limpia | `grep -c 'Base Django React Next Feature' CLAUDE.md` (0) | Tras S3 |
| Stack preservado | `grep -c 'Next.js\|React\|TypeScript' CLAUDE.md` (>0) | Tras S3 |
| README header | `head -n 10 README.md` | Tras S4 |
| AGENTS.md sync | `diff CLAUDE.md AGENTS.md \| head -n 5` (solo H1) | Tras S5 |
| Commits aislados | `git log --oneline -n 4` | Tras S5 |

## Formato de Output

1. **Checklist persistido** — path absoluto, `NN`, líneas, bytes.
2. **Identidad aplicada** — tabla `project_name / short_description / domain / slug / main_modules`.
3. **Archivos modificados** — sha de commit por archivo (CLAUDE.md, README.md, AGENTS.md).
4. **Referencias residuales** (S6) — tabla resumen.
5. **Próximos pasos sugeridos**:
   - `/methodology-setup` para inicializar Memory Bank.
   - Tareas manuales fuera de scope (rename Django app, OAuth, systemd, `.env`).
   - Cuando el proyecto madure: `/pre-staging-cleanup`.
