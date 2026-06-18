import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

const THEME_KEY = '@bara:theme_override';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedScheme = 'light' | 'dark';

export interface ThemeContextValue {
  colorScheme: ResolvedScheme;
  isSystemDefault: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme: nwColorScheme, setColorScheme: nwSetColorScheme } = useColorScheme();
  const [hydrated, setHydrated] = useState(false);
  const [isSystemDefault, setIsSystemDefault] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          nwSetColorScheme(stored);
          setIsSystemDefault(false);
        } else {
          nwSetColorScheme('system');
          setIsSystemDefault(true);
        }
      })
      .catch(() => {
        nwSetColorScheme('system');
        setIsSystemDefault(true);
      })
      .finally(() => setHydrated(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      if (mode === 'system') {
        await AsyncStorage.removeItem(THEME_KEY);
        nwSetColorScheme('system');
        setIsSystemDefault(true);
      } else {
        await AsyncStorage.setItem(THEME_KEY, mode);
        nwSetColorScheme(mode);
        setIsSystemDefault(false);
      }
    } catch (e) {
      console.warn('[ThemeProvider] Failed to persist theme preference:', e);
      nwSetColorScheme(mode === 'system' ? 'system' : mode);
      setIsSystemDefault(mode === 'system');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedScheme: ResolvedScheme =
    nwColorScheme === 'light' || nwColorScheme === 'dark' ? nwColorScheme : 'light';

  const value = useMemo<ThemeContextValue>(
    () => ({ colorScheme: resolvedScheme, isSystemDefault, setTheme }),
    [resolvedScheme, isSystemDefault, setTheme],
  );

  if (!hydrated) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
