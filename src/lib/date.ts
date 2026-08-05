/**
 * Shared date helpers used across hooks and components.
 * Uses local date components (not UTC) to avoid timezone drift
 * when storing day-keyed history entries.
 */

export const getDateString = (date: Date): string => {
  // Local components, not toISOString() — that returns UTC, which east of
  // Greenwich mislabels anything prayed between local midnight and the UTC
  // offset as the previous day. See migrateHistoryKeysToLocalDates() for the
  // one-time fix-up of dates written by the old UTC-based version.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayString = (): string => getDateString(new Date());

/** Maps the app's language codes onto BCP 47 locales for Intl formatting. */
const LOCALES: Record<string, string> = {
  en: 'en-GB',
  sv: 'sv-SE',
  tr: 'tr-TR',
  ar: 'ar-EG',
};

export const localeFor = (lang: string): string => LOCALES[lang] ?? 'en-GB';
