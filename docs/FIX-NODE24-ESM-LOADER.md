# Fix: Node.js 24 + Windows ESM Loader Issue

## Problema

**Error:**
```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
```

## Causa

Node.js v24.15.0 introdujo cambios más estrictos en el ESM loader que afectan a Windows:

1. **Expo CLI** usa `import()` dinámico para cargar `metro.config.js`
2. **Node.js 24** en Windows requiere que las rutas absolutas sean URLs válidas con esquema `file://`
3. Las rutas Windows (`C:\Users\...`) no son URLs válidas → el loader ESM falla
4. El error ocurre específicamente cuando Expo intenta cargar dinámicamente el archivo de configuración

## Diagnóstico

```bash
Node.js version: v24.15.0
Platform: Windows (via WSL)
Error location: node:internal/modules/esm/load
```

El problema NO ocurre con:
- `require()` (CommonJS) ✅
- Node.js 22 LTS ✅
- Node.js 20 LTS ✅

## Solución Implementada

**Patrón Wrapper**: Dividir la configuración en dos archivos

### Archivo 1: `metro.config.js` (wrapper)
```javascript
// Wrapper para evitar el bug de Node.js 24 con ESM loader en Windows
// El archivo real está en metro.config.cjs
module.exports = require('./metro.config.cjs');
```

### Archivo 2: `metro.config.cjs` (configuración real)
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

## ¿Por qué funciona?

1. ✅ Expo CLI encuentra `metro.config.js`
2. ✅ `metro.config.js` usa `require()` (no `import()`)
3. ✅ `require()` NO usa el ESM loader problemático
4. ✅ `metro.config.cjs` se carga correctamente vía CommonJS
5. ✅ La configuración se aplica normalmente

## Alternativas

### Opción 1: Downgrade Node.js (Recomendado para estabilidad)
```bash
# Instalar Node.js 22 LTS
nvm install 22
nvm use 22
npm run dev  # Debería funcionar sin cambios
```

### Opción 2: Usar variable de entorno (Experimental)
```bash
NODE_OPTIONS="--loader=..." npm run dev
```

### Opción 3: Mantener la solución wrapper (Actual)
- ✅ Funciona con Node.js 24
- ✅ Compatible con versiones anteriores
- ✅ Sin cambios en dependencies
- ✅ Sin cambios en workflow

## Verificación

```bash
# Debe cargar sin errores
npm run dev

# Debe mostrar la configuración
npx expo config --type prebuild
```

## Referencias

- [Node.js ESM Loader Docs](https://nodejs.org/api/esm.html#loaders)
- [Metro Config Docs](https://facebook.github.io/metro/docs/configuration)
- [Expo Metro Config](https://docs.expo.dev/guides/customizing-metro/)

## Status

⚠️ **ACTUALIZACIÓN 2026-06-08**: El wrapper pattern dejó de funcionar en Expo CLI reciente  
✅ **SOLUCIÓN DEFINITIVA**: Downgrade a Node.js 22 LTS (v22.22.3)  

```bash
nvm install 22 --lts
nvm alias default 22
nvm use 22
npm run dev  # Funciona sin errores
```

📅 **Fecha original:** 2026-06-08  
🔧 **Node.js problemático:** v24.15.0  
✅ **Node.js estable:** v22.22.3  
📦 **Expo:** v54.0.24
