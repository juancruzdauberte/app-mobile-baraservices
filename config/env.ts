const EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Falta la variable de entorno ${name}. Revisá tu .env.local y reiniciá con 'npx expo start -c'.`,
    );
  }

  return value;
}

export const env = {
  SUPABASE_URL: requireEnv(
    'EXPO_PUBLIC_SUPABASE_URL',
    EXPO_PUBLIC_SUPABASE_URL,
  ),
  SUPABASE_ANON_KEY: requireEnv(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  API_URL: requireEnv('EXPO_PUBLIC_API_URL', EXPO_PUBLIC_API_URL),
} as const;
