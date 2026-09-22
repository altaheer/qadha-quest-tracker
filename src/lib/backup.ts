// All personal data lives on this device only. A backup file is therefore the
// user's single safety net — it must capture every key the app owns, not a
// subset. Keep APP_STORAGE_KEYS in sync whenever a new key is introduced.

export const APP_STORAGE_KEYS = [
  // Prayers
  'prayer-history',
  'prayer-streaks',
  'prayer-combo',
  // Qadha
  'qadha-prayer-counts',
  'qadha-daily-goal',
  'qadha-history',
  // Sawm qadha
  'sawm-qadha-count',
  'sawm-qadha-daily-goal',
  // Habits
  'habits-tracking',
  'habits-paused',
  'habits-level',
  'timebound-habits',
  'timebound-paused',
  'nafilah-history',
  // Missions
  'missions',
  'missions-completed',
  'missions-ended',
  // Achievements
  'achievements-unlocked',
  'achievements-initialized',
  // Preferences
  'app-prefs',
  'app-language',
  'onboarding-complete',
  'seen-tooltips',
] as const;

export const BACKUP_VERSION = 2;

/**
 * v2 stores each key's raw string exactly as localStorage holds it. That keeps
 * the snapshot lossless for plain-string values ('easy', '5') as well as JSON
 * ones, and avoids re-serialising through a parse/stringify round trip.
 */
export interface BackupFile {
  app: 'qadha-tracker';
  version: number;
  exportedAt: string;
  entries: Record<string, string>;
}

/** Legacy shape written before the app went device-only. Still restorable. */
interface BackupFileV1 {
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}

const V1_FIELD_TO_KEY: Record<string, string> = {
  prayers: 'prayer-history',
  streaks: 'prayer-streaks',
  qadha: 'qadha-prayer-counts',
  qadhaGoal: 'qadha-daily-goal',
  habits: 'habits-tracking',
  habitsPaused: 'habits-paused',
  habitsLevel: 'habits-level',
};

export function createBackup(): BackupFile {
  const entries: Record<string, string> = {};
  for (const key of APP_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return {
    app: 'qadha-tracker',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
  };
}

export function backupFilename(date = new Date()): string {
  return `qadha-tracker-backup-${date.toISOString().slice(0, 10)}.json`;
}

export type RestoreResult =
  | { status: 'restored'; exportedAt: string | null; restored: number }
  | { status: 'unreadable' }
  | { status: 'invalid' };

/**
 * Normalises a parsed backup of any known version into a flat key/value map.
 * Returns null when the payload is not a backup this app wrote.
 */
function toEntries(parsed: unknown): Record<string, string> | null {
  if (typeof parsed !== 'object' || parsed === null) return null;

  const v2 = parsed as Partial<BackupFile>;
  if (v2.entries && typeof v2.entries === 'object') {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(v2.entries)) {
      // Ignore anything that is not a key this app owns, so a tampered or
      // unrelated file cannot write arbitrary entries into localStorage.
      if (!(APP_STORAGE_KEYS as readonly string[]).includes(key)) continue;
      if (typeof value === 'string') out[key] = value;
    }
    return out;
  }

  const v1 = parsed as Partial<BackupFileV1>;
  if (v1.data && typeof v1.data === 'object') {
    const out: Record<string, string> = {};
    for (const [field, value] of Object.entries(v1.data)) {
      const key = V1_FIELD_TO_KEY[field];
      if (!key || value === undefined || value === null) continue;
      out[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return out;
  }

  return null;
}

export function restoreBackup(fileContents: string): RestoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContents);
  } catch {
    return { status: 'unreadable' };
  }

  const entries = toEntries(parsed);
  if (!entries || Object.keys(entries).length === 0) {
    return { status: 'invalid' };
  }

  // Replace rather than merge: a restore should reproduce the backed-up state,
  // not blend it with whatever is currently on the device.
  for (const key of APP_STORAGE_KEYS) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);

  const exportedAt =
    typeof (parsed as { exportedAt?: unknown }).exportedAt === 'string'
      ? (parsed as { exportedAt: string }).exportedAt
      : null;

  return { status: 'restored', exportedAt, restored: Object.keys(entries).length };
}

/** Erases every trace of the user's data from this device. */
export function clearAllData(): void {
  for (const key of APP_STORAGE_KEYS) localStorage.removeItem(key);
}
