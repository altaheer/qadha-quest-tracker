/**
 * Shared date helpers used across hooks and components.
 * Uses local date components (not UTC) to avoid timezone drift
 * when storing day-keyed history entries.
 */

export const getDateString = (date: Date): string => {
  // Preserve previous behavior (ISO yyyy-mm-dd in UTC) for backward
  // compatibility with already-stored localStorage history keys.
  return date.toISOString().split('T')[0];
};

export const getTodayString = (): string => getDateString(new Date());
