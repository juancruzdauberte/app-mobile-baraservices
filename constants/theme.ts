import { Platform } from 'react-native';

/**
 * Design System Tokens
 * Centralizes all design values for consistent styling
 */

// ─── Light Palette ─────────────────────────────────────────────────────────────

const lightColors = {
  primary: '#0284C7',
  primaryLight: '#38BDF8',
  primaryDark: '#0369A1',

  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0284C7',

  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
  },

  border: {
    default: '#E2E8F0',
    light: '#F1F5F9',
    dark: '#CBD5E1',
  },
} as const;

// ─── Dark Palette ──────────────────────────────────────────────────────────────

const darkColors = {
  primary: '#38BDF8',
  primaryLight: '#7DD3FC',
  primaryDark: '#0284C7',

  secondary: '#FCD34D',
  secondaryLight: '#FDE68A',
  secondaryDark: '#F59E0B',

  success: '#34D399',
  warning: '#FCD34D',
  error: '#F87171',
  info: '#38BDF8',

  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    inverse: '#0F172A',
  },

  background: {
    primary: '#18181B',
    secondary: '#27272A',
    tertiary: '#3F3F46',
  },

  border: {
    default: '#3F3F46',
    light: '#52525B',
    dark: '#71717A',
  },
} as const;

// ─── Shared Tokens ─────────────────────────────────────────────────────────────

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 5,
    },
  }),
} as const;

// ─── Named Theme Exports ───────────────────────────────────────────────────────

export const lightTheme = {
  colors: lightColors,
  spacing,
  typography,
  borderRadius,
  shadows,
} as const;

export const darkTheme = {
  colors: darkColors,
  spacing,
  typography,
  borderRadius,
  shadows,
} as const;

/** Backward-compat alias — existing import sites are unaffected */
export const theme = lightTheme;

export type Theme = typeof lightTheme;
