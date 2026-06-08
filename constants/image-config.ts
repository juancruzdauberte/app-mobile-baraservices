/**
 * Image configuration constants for expo-image
 * Centralizes caching, placeholders, and transitions
 */

// ─── Cache Policy ─────────────────────────────────────────────────────────────

/**
 * Cache images in memory and disk for optimal performance
 */
export const IMAGE_CACHE_POLICY = "memory-disk" as const;

// ─── Transitions ──────────────────────────────────────────────────────────────

/**
 * Smooth fade-in transition duration (ms)
 */
export const IMAGE_TRANSITION = 200 as const;

// ─── Placeholders ─────────────────────────────────────────────────────────────

/**
 * Default gray blurhash placeholder for loading states
 * Format: 16-character blurhash string
 */
export const DEFAULT_PLACEHOLDER = "L00000fQfQfQfQfQfQfQfQfQfQfQ" as const;

/**
 * Lighter gray placeholder for profile avatars
 */
export const AVATAR_PLACEHOLDER = "L5H2EC=PM+yV0g-mq.wG9c010J}I" as const;

// ─── Content Fit ──────────────────────────────────────────────────────────────

/**
 * Common content fit modes
 */
export const CONTENT_FIT = {
  COVER: "cover",
  CONTAIN: "contain",
  FILL: "fill",
  SCALE_DOWN: "scale-down",
} as const;
