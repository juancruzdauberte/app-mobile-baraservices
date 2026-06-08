# Solución: ESM Loader en Windows PowerShell

## El Problema

Node.js ESM loader rechaza paths absolutos de Windows (`C:\Users\...`) porque no son URLs válidas con esquema `file://`, `data:`, o `node:`.

```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Received protocol 'c:'
```

## Por qué WSL funciona y Windows no

| Entorno | Path visto por Node.js | ¿Funciona? |
|---------|------------------------|------------|
| WSL | `/mnt/c/Users/...` (path Unix) | ✅ Sí |
| Windows | `C:\Users\...` (path Windows) | ❌ No |

El ESM loader de Node.js acepta paths Unix pero rechaza paths Windows nativos.

## La Solución: Loader Custom

### Archivos creados

**1. `windows-path-loader.mjs`** - Loader custom que convierte paths Windows a `file://` URLs:

```javascript
import { pathToFileURL } from 'url';

export async function resolve(specifier, context, nextResolve) {
  // Si el specifier es un path absoluto de Windows (C:\, D:\, etc.)
  if (/^[a-zA-Z]:[\\/]/.test(specifier)) {
    // Convertirlo a file:// URL válida
    const fileURL = pathToFileURL(specifier).href;
    return nextResolve(fileURL, context);
  }
  
  // Para todo lo demás, usar el resolver por defecto
  return nextResolve(specifier, context);
}
```

**2. `package.json` - Scripts actualizados (Windows principal):**

```json
{
  "scripts": {
    "dev": "node --loader=./windows-path-loader.mjs ./node_modules/expo/bin/cli start",
    "dev:wsl": "expo start",
    "dev:tunnel": "node --loader=./windows-path-loader.mjs ./node_modules/expo/bin/cli start --tunnel"
  }
}
```

### Cómo usar

**En Windows PowerShell (principal):**
```powershell
npm run dev
```

**En Windows con túnel (dispositivo físico):**
```powershell
npm run dev:tunnel
```

**En WSL (alternativo):**
```bash
npm run dev:wsl
```

## Archivos del proyecto

```
metro.config.js          → Wrapper (mantener por compatibilidad)
metro.config.cjs         → Configuración real de Metro
windows-path-loader.mjs  → Loader custom para Windows
```

## Advertencias

⚠️ El flag `--loader` es experimental en Node.js 22 y será reemplazado por `register()` en versiones futuras.

✅ Windows con loader custom es ahora la configuración principal del proyecto.

## Instalación limpia en Windows

**IMPORTANTE:** Si vienes de WSL, necesitas reinstalar `node_modules` en Windows:

```powershell
# En PowerShell como Administrador o con permisos elevados
Remove-Item -Recurse -Force node_modules
npm cache clean --force
npm install
```

Esto descarga los bindings nativos de Windows (`.win32-x64-msvc.node`) en lugar de los de Linux.

## Conexión de dispositivos

| Escenario | Windows (Principal) | WSL (Alternativo) |
|-----------|---------------------|-------------------|
| Emulador Android | ✅ Funciona | ✅ Funciona |
| Emulador iOS | ✅ Funciona | N/A |
| Dispositivo físico (WiFi) | ✅ IP local directa | ⚠️ Usar `--tunnel` |
| Expo Go | ✅ IP local | ✅ Con túnel |

### Para dispositivo físico en Windows:

```powershell
npm run dev:tunnel
```

### Para dispositivo físico en WSL:

```bash
npm run dev:wsl -- --tunnel
```

## Troubleshooting

### Error: Cannot find module 'lightningcss.win32-x64-msvc.node'

**Causa:** Instalaste node_modules en WSL (Linux) y ahora estás en Windows.

**Solución:**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Error: EACCES permission denied en node_modules/.bin

**Causa:** Archivos corruptos/bloqueados de instalación previa mixta WSL/Windows.

**Solución:**
```powershell
Remove-Item -Recurse -Force node_modules
npm cache clean --force
npm install
npm run dev
```

### (node:XXXXX) ExperimentalWarning: --experimental-loader

**Es normal.** Es solo un warning de Node.js 22. No afecta la funcionalidad.

### Cannot find module 'windows-path-loader.mjs'

**Causa:** Estás corriendo desde un directorio incorrecto.

**Solución:**
```powershell
cd C:\Users\juanc\Desktop\baraservices\baraservices-app
npm run dev
```

## Mantener node_modules separados (Avanzado)

Si necesitas usar **ambos** entornos (Windows y WSL), puedes mantener carpetas separadas:

**Estructura:**
```
node_modules/          → versión activa
node_modules.windows/  → backup Windows
node_modules.linux/    → backup Linux
```

**Cambiar a Windows:**
```bash
mv node_modules node_modules.linux
mv node_modules.windows node_modules
```

**Cambiar a WSL:**
```bash
mv node_modules node_modules.windows
mv node_modules.linux node_modules
```

## Referencias

- Node.js ESM Loader: https://nodejs.org/api/esm.html#loaders
- Expo CLI: https://docs.expo.dev/more/expo-cli/
- Issue relacionado: https://github.com/nodejs/node/issues/31710
