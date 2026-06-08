# Comandos de desarrollo - Windows Principal

## ⚡ Inicio rápido

```powershell
# Windows PowerShell (principal)
npm run dev

# Con dispositivo físico vía WiFi
npm run dev:tunnel

# WSL (alternativo)
npm run dev:wsl
```

## 📦 Primera instalación en Windows

```powershell
# Limpia e instala dependencias para Windows
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

## 📚 Documentación completa

Ver `docs/WINDOWS-ESM-LOADER-SOLUTION.md` para detalles sobre el loader custom y troubleshooting.
