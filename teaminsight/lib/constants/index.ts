/**
 * Constants Export
 * ----------------
 * Central export point for all constants.
 */

export * from "./status";

/**
 * Cookie names
 */
export const COOKIES = {
  TEAM_SESSION: "team_session",
  LECTURER_SESSION: "lecturer_session",
} as const;

/**
 * Default pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Session configuration
 */
export const SESSION = {
  MAX_AGE_SECONDS: 60 * 60 * 24 * 7, // 7 days
} as const;

/**
 * Reflection configuration
 */
export const REFLECTION = {
  MAX_TURNS: 16,
  RECENT_SUMMARIES_DAYS: 14,
  RECENT_SUMMARIES_LIMIT: 3,
} as const;
