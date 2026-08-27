---
trigger: manual
description: Error documentation and known issues tracking. Reference when debugging, fixing bugs, or encountering recurring issues.
---

# Error Documentation — Base Django React Next Feature

This file tracks known errors, their context, and resolutions. When a reusable fix or correction is found during development, document it here to avoid repeating the same mistake.

---

## Format

```
### [ERROR-NNN] Short description
- **Date**: YYYY-MM-DD
- **Context**: Where/when this error occurs
- **Root Cause**: Why it happens
- **Resolution**: How to fix it
- **Files Affected**: List of files
```

---

## Known Issues

_No errors documented yet. This file will be updated as issues are discovered and resolved._

---

## Resolved Issues

### [ERROR-001] Plugins legacy fallan al ejecutar ESLint 10

- **Date**: 2026-08-27
- **Context**: `npm run lint` después de actualizar ESLint 9.39.5 → 10.9.1.
- **Root Cause**: los plugins React/import/a11y anidados por
  `eslint-config-next` todavía usan APIs de contexto retiradas por ESLint 10 y
  sus rangos peer terminan en ESLint 9.
- **Resolution**: envolver las configuraciones de Next con
  `fixupConfigRules()` de `@eslint/compat`. La regla moderna
  `react-hooks/set-state-in-effect` también se resolvió reemplazando el estado
  de montaje por el hook compartido `useHydrated` basado en
  `useSyncExternalStore`.
- **Files Affected**: `frontend/eslint.config.mjs`,
  `frontend/lib/hooks/useHydrated.ts`, checkout, sign-up y theme toggle.

### [ERROR-002] Next no detecta el alias de compatibilidad TypeScript 6

- **Date**: 2026-08-27
- **Context**: `npm run build` con TypeScript 7 y el alias oficial
  `@typescript/typescript6` instalados lado a lado.
- **Root Cause**: Next 16.3.3 activa `experimental.useTypeScriptCli` por default
  y busca `typescript/bin/tsc`; el paquete de compatibilidad expone `tsc6`,
  mientras el `tsc` nativo vive bajo el alias `@typescript/native`.
- **Resolution**: usar TypeScript 7 como gate CLI principal, conservar
  TypeScript 6 para las APIs de Next/typescript-eslint y fijar
  `useTypeScriptCli: false` en Next. CI ejecuta ambos typechecks antes del build.
- **Files Affected**: `frontend/package.json`, `frontend/package-lock.json`,
  `frontend/next.config.ts`, `.github/workflows/ci.yml`.
