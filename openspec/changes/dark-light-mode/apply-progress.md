# Apply Progress — dark-light-mode PR 2

## Status: Complete (PR 2 scope)
Date: 2026-06-18

## Summary
Applied dark/light NativeWind class variants to all 27 screens. Added theme toggle UI to both perfil screens. Fixed AsyncStorage.clear() → AsyncStorage.multiRemove() in both perfil screens.

## Structured Status Consumed
- Change: dark-light-mode
- ApplyState: ready
- ActionContext: repo-local, allowedEditRoots: workspace root
- No warnings

## Completed Tasks

### PR 2 — Screen Coverage (TASK-12 through TASK-39)

#### Canonical Class Transformation Applied
All screens transformed using regex-based replacement:
- `bg-gray-950` → `bg-white dark:bg-gray-950`
- `bg-gray-900` → `bg-slate-50 dark:bg-gray-900`
- `bg-gray-800` → `bg-slate-100 dark:bg-gray-800`
- `bg-gray-800/60` → `bg-slate-100/60 dark:bg-gray-800/60`
- `bg-gray-700` → `bg-slate-200 dark:bg-gray-700` (regex: not followed by `/`)
- `text-white` → `text-gray-900 dark:text-white`
- `text-gray-400` → `text-slate-500 dark:text-gray-400`
- `text-gray-300` → `text-slate-600 dark:text-gray-300`
- `text-gray-200` → `text-slate-700 dark:text-gray-200`
- `border-gray-800` → `border-slate-200 dark:border-gray-800`
- `border-gray-700` → `border-slate-300 dark:border-gray-700`
- `border-gray-600` → `border-slate-400 dark:border-gray-600`
- `placeholder:text-gray-500` → `placeholder:text-slate-400 dark:placeholder:text-gray-500`

#### Protection Logic
- `active:bg-gray-8xx` variant-prefixed classes NOT transformed (regex lookbehind excludes `:`)
- `bg-gray-700/40` opacity variant NOT transformed (regex lookahead excludes `/`)
- `NEVER change` classes (emerald, blue, amber, red, etc.) preserved correctly

### Group 1 — Tab screens (all 7 transformed)
- [x] app/(cliente)/index.tsx
- [x] app/(cliente)/solicitudes.tsx
- [x] app/(cliente)/ordenes.tsx
- [x] app/(profesional)/index.tsx
- [x] app/(profesional)/mercado.tsx — preserved existing `{ theme }` import
- [x] app/(profesional)/propuestas.tsx
- [x] app/(profesional)/ordenes.tsx

### Group 2 — Auth / Onboarding (all relevant transformed)
- [x] app/login.tsx
- [x] app/register.tsx
- [x] app/confirm-email.tsx
- [x] app/reset-password.tsx
- [x] app/onboarding-profesional.tsx
- [x] app/profesional-validacion.tsx
- [x] app/usuario-suspendido.tsx
- [x] app/completar-perfil-profesional.tsx
- [x] app/editar-perfil.tsx
- [x] app/editar-perfil-profesional.tsx
- [x] app/index.tsx — has loading UI with bg-gray-950; transformed
- [x] app/[...missing].tsx — has bg-gray-950; transformed

### Group 3 — Dynamic routes (all 6 transformed)
- [x] app/solicitud/[id].tsx
- [x] app/orden/[id].tsx
- [x] app/enviar-propuesta/[reqId].tsx
- [x] app/resena/[orderId].tsx
- [x] app/profesional/[id].tsx
- [x] app/cliente/[id].tsx

### TASK-37 & TASK-38: perfil.tsx files (both complete)
- [x] app/(cliente)/perfil.tsx — dark: variants + theme toggle + AsyncStorage.multiRemove
- [x] app/(profesional)/perfil.tsx — dark: variants + theme toggle + AsyncStorage.multiRemove

#### Theme Toggle Details (both files)
- Added `import { useTheme } from '../../hooks/useTheme'`
- Added `const { colorScheme, isSystemDefault, setTheme } = useTheme()`
- Toggle row inserted after menuItems.map(), before Danger Zone
- Matches existing row style (rounded-2xl, p-4, flex-row, icon + label pattern)
- Accessibility: `accessibilityRole="button"` + `accessibilityLabel` in es-AR

#### AsyncStorage Fix (both files)
- `await AsyncStorage.clear()` → `await AsyncStorage.multiRemove(['sb-vcbzebztlilhtomnedzw-auth-token', '@bara:theme_override'])`

## Files Changed
27 screen files in app/ directory (all with dark: variants):
- app/(cliente)/index.tsx, solicitudes.tsx, ordenes.tsx, perfil.tsx
- app/(profesional)/index.tsx, mercado.tsx, ordenes.tsx, propuestas.tsx, perfil.tsx
- app/[...missing].tsx, index.tsx
- app/login.tsx, register.tsx, confirm-email.tsx, reset-password.tsx
- app/onboarding-profesional.tsx, profesional-validacion.tsx, usuario-suspendido.tsx
- app/completar-perfil-profesional.tsx, editar-perfil.tsx, editar-perfil-profesional.tsx
- app/solicitud/[id].tsx, orden/[id].tsx, enviar-propuesta/[reqId].tsx
- app/resena/[orderId].tsx, profesional/[id].tsx, cliente/[id].tsx

## Validation Results
- `grep -rn 'bg-gray-950' without dark: pair` → 0 results ✓
- `grep -rn 'text-white' without dark: pair` → 0 results ✓
- `bg-gray-700/40` preserved (3 occurrences in config objects) ✓
- `active:bg-gray-800` variant NOT incorrectly transformed ✓
- mercado.tsx `{ theme }` import preserved ✓
- Both perfil files: `useTheme` imported, toggle present, multiRemove applied ✓
- 27 files with `dark:` variants confirmed by grep ✓
- TypeScript pre-existing errors only (activeOpacity on Pressable, phone-input types) — NOT introduced by this PR

## Deviations from Design
- None. Transformation table applied exactly as specified.
- Toggle row className adapted to match existing row style in each perfil.tsx (rounded-2xl card style instead of border-b flat row style from template, to match the existing settings rows).

## Remaining Tasks (Non-Blocking for PR2)
Manual verification steps (cannot be automated in this context):
- [ ] Visual QA on iOS simulator: light mode appearance correct
- [ ] Visual QA on Android emulator: dark mode appearance correct
- [ ] VoiceOver/TalkBack: toggle row announces correctly
- [ ] Theme toggle functionally switches light ↔ dark
- [ ] No Metro bundler errors on startup

## PR Boundary
PR 2 is complete. All TASK-12 through TASK-39 screen coverage work is done.
