/**
 * Theme and Design System Types
 */

import { theme } from './theme';

// Re-export theme type
export type Theme = typeof theme;

// Color token types
export type ColorToken = keyof typeof theme.colors;
export type TextColorToken = keyof typeof theme.colors.text;
export type BackgroundColorToken = keyof typeof theme.colors.background;
export type BorderColorToken = keyof typeof theme.colors.border;

// Spacing token type
export type SpacingToken = keyof typeof theme.spacing;

// Typography token types
export type FontSizeToken = keyof typeof theme.typography.fontSize;
export type FontWeightToken = keyof typeof theme.typography.fontWeight;
export type LineHeightToken = keyof typeof theme.typography.lineHeight;

// Border radius token type
export type BorderRadiusToken = keyof typeof theme.borderRadius;

// Shadow token type
export type ShadowToken = keyof typeof theme.shadows;
