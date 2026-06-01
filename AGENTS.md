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

- Documentacion, comentarios y mensajes de commit en **ingles**.
- Codigo, identificadores y nombres de variable en **ingles**.

## Skills por-proyecto

Los skills Codex de este proyecto viven en `.agents/skills/<name>/SKILL.md`.
**No** en `.codex/skills/` — esa ruta no es valida segun la docs oficial.
Cada skill tiene `SKILL.md` con frontmatter YAML (`name`, `description`) y
opcionalmente `agents/openai.yaml` adyacente con metadata Codex-especifica.

## Configuracion Codex per-proyecto

`.codex/config.toml` define modelo, sandbox y aprobacion para este proyecto.
Sincronizado desde `workflows/.codex/base/config.toml.tmpl`.

## Ecosistemas IA paralelos

Ver `CLAUDE.md` para la convencion completa. Los tres ecosistemas (Claude
Code, Codex, Windsurf) comparten el mismo cuerpo de instrucciones general.

<!-- fleet-base:end -->

<!-- project-specific:begin -->
## Seccion especifica del proyecto

Esta seccion **NO** la toca el sync. Contenido del proyecto (arquitectura,
comandos clave, decisiones puntuales).

<!-- project-specific:end -->
