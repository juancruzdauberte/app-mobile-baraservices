// windows-path-loader.mjs
// Loader custom para convertir paths de Windows a file:// URLs
import { pathToFileURL } from 'url';

export async function resolve(specifier, context, nextResolve) {
  // Si el specifier parece un path absoluto de Windows (C:\, D:\, etc.)
  if (/^[a-zA-Z]:[\\/]/.test(specifier)) {
    // Convertirlo a file:// URL válida
    const fileURL = pathToFileURL(specifier).href;
    return nextResolve(fileURL, context);
  }
  
  // Para todo lo demás, usar el resolver por defecto
  return nextResolve(specifier, context);
}
