<!--
  AGENTS.md template — fleet base (Codex CLI)
  ============================================
  Fuente: workflows/.agents/base/AGENTS.md.tmpl en vps-ops-toolkit
  Sincronizado por: sync-codex-base.sh (Fase 3b) — pendiente
  Convencion: bloques delimitados por markers HTML (igual que CLAUDE.md).
  Per docs Codex CLI: AGENTS.md vive en la raiz del proyecto, los skills en
  .agents/skills/<name>/SKILL.md. .codex/ por-proyecto SOLO lleva config.toml.
-->
<!-- fleet-base:begin v=1 -->
# AGENTS.md — Base Django+React+Next (scaffold) (`base_django_react_next_feature`)

Este archivo es el equivalente Codex de `CLAUDE.md`. Mismo cuerpo de
instrucciones general, distinto frontmatter/estructura. Sincronizado desde
`vps-ops-toolkit/workflows/.agents/base/AGENTS.md.tmpl`.

## Convencion de lenguaje

- Codigo, identificadores y nombres de variable: **ingles**.
- Mensajes de commit: **ingles** (Conventional Commits).
- Docs operativos, skills y reportes: **espanol** (terminos tecnicos en ingles donde son de uso corriente).
- Mensajes de error visibles al usuario final: idioma del proyecto.

## Skills por-proyecto

Los skills Codex de este proyecto viven en `.agents/skills/<name>/SKILL.md`.
**No** en `.codex/skills/` — esa ruta no es valida segun la docs oficial.
Cada skill tiene `SKILL.md` con frontmatter YAML (`name`, `description`) y
opcionalmente `agents/openai.yaml` adyacente con metadata Codex-especifica.

## Configuracion Codex per-proyecto

`.codex/config.toml` define modelo, sandbox y aprobacion para este proyecto.
Sincronizado desde `workflows/.codex/base/config.toml.tmpl`.

<!-- git-branch-protocol:begin -->
## Reglas de trabajo con Git: ramas y commits

**Nunca hagas commits directamente sobre `main` o `master`.** Estas ramas están protegidas y los pushes serán rechazados por GitHub.

**El default es REUTILIZAR una rama abierta, no crear una nueva.** La convención del fleet es **máximo 1 PR feature activo por proyecto**: todo el trabajo en curso — aunque sean features o arreglos distintos entre sí — se acumula como **commits sucesivos sobre esa misma rama** hasta que mergee. **Lo que identifica cada pieza de trabajo es el COMMIT, no una rama nueva.** Sólo se crea una rama cuando estás en `main`/`master` y NO hay ninguna rama abierta. Antes de cualquier `git commit`, seguí este protocolo:

### 0. (Fleet) Confirmá la coordenada de trabajo del proyecto

Si este repo pertenece al fleet `vps-ops-toolkit` (existe `~/webapps/vps-ops-toolkit/projects.yml`), la **fuente de verdad de dónde y sobre qué rama se trabaja** es `projects.yml` + los PRs abiertos, no tu intuición:

```bash
OPS=~/webapps/vps-ops-toolkit
RESOLVER="$OPS/scripts/maintenance/resolve-work-coordinate.sh"
PROJ=$(basename "$(git rev-parse --show-toplevel)")
[[ -x "$RESOLVER" ]] && bash "$RESOLVER" --check "$PROJ"   # imprime vps_work, resolved_branch, host_status, matches_yml
```

- **`host_status=wrong-host`** → **PARÁ**: el trabajo de este proyecto va en OTRO clon (el `vps_work` que imprime el resolver). Avisá al operador antes de commitear acá.
- **`resolved_branch` es una rama release** (`pr_state=single`) → esa es la rama de trabajo: `git checkout <resolved_branch>` y commiteá ahí. No crees una feature branch nueva.
- **`matches_yml=no`** → avisá al operador (puede requerir `--apply` en el toolkit para refrescar projects.yml).
- **`branch_deploy_status=yml-stale`** → avisá y refrescá el yml con `--fix` desde el toolkit. NUNCA hagas checkout de la rama vieja del yml. `unbacked` o host ajeno → derivar a migrate-project / revisión manual.
- **Sin toolkit, o el proyecto no está en `projects.yml`** → ignorá este paso y seguí con la sección 1.

### 1. Verificar la rama actual

```bash
git rev-parse --abbrev-ref HEAD
```

- **Si ya estás en una rama feature** (no `main`/`master`): quedate ahí y commiteá — aunque el cambio sea de un feature distinto. NO crees una rama nueva.
- **Si estás en `main`/`master`**: seguí la sección 2.

### 2. En `main`/`master`: primero buscá una rama abierta para reutilizar

```bash
git fetch --quiet --prune
gh pr list --state open --json headRefName,url -q '.[] | "\(.headRefName)\t\(.url)"' 2>/dev/null
# Fallback sin gh:
git branch -r | grep -vE 'origin/(HEAD|main|master|release-)' | sed 's@^[[:space:]]*origin/@@' | sort -u
```

- **UNA rama abierta** → `git checkout <rama>`, `git pull --rebase` si está atrás, y commiteá ahí (sin pedir permiso; sólo comunicalo).
- **VARIAS** → preguntá al usuario en cuál.
- **NINGUNA** → recién ahí creá una rama nueva (sección 3).

### 3. Formato obligatorio del nombre de rama

`<prefijo>/<DDMMYYYY>-<descripcion-corta>` — prefijos: `feat` `fix` `docs` `refactor` `test` `chore` `style` `perf` `ci` `hotfix`; la fecha SIEMPRE de `date +%d%m%Y` (nunca asumida); descripción kebab-case ≤5 palabras.

```bash
TODAY=$(date +%d%m%Y)
git checkout -b <prefijo>/${TODAY}-<descripcion-corta>
git add <archivos> && git commit -m "<mensaje conventional commits>"
```

### 4. Excepciones y cierre

- Operaciones read-only (`status`, `log`, `diff`, `pull`, `fetch`) permitidas en `main`/`master`.
- Ya en rama feature: **nunca** crear una rama paralela para un cambio "distinto" — cada cambio es un commit más.
- Mensajes de commit: Conventional Commits, mismo prefijo de la rama cuando aplique.
- Tras cada `git push` que cree rama nueva, terminá reportando la URL "Create a pull request" (`PR URL: <url>`; con PR existente, `gh pr view --json url -q .url`).
<!-- git-branch-protocol:end -->

## Ecosistemas IA paralelos

Ver `CLAUDE.md` para la convencion completa. Los tres ecosistemas (Claude
Code, Codex, Windsurf) comparten el mismo cuerpo de instrucciones general.

<!-- fleet-base:end -->

<!-- project-specific:begin -->
## Seccion especifica del proyecto

Esta seccion **NO** la toca el sync. Contenido del proyecto (arquitectura,
comandos clave, decisiones puntuales).

<!-- project-specific:end -->
