import { beforeEach, describe, expect, it } from 'vitest';
import {
  APP_STORAGE_KEYS,
  BACKUP_VERSION,
  backupFilename,
  clearAllData,
  createBackup,
  restoreBackup,
} from './backup';

beforeEach(() => localStorage.clear());

describe('createBackup', () => {
  it('captures every app key that has a value', () => {
    for (const key of APP_STORAGE_KEYS) localStorage.setItem(key, `value-for-${key}`);

    const backup = createBackup();

    expect(backup.version).toBe(BACKUP_VERSION);
    expect(Object.keys(backup.entries).sort()).toEqual([...APP_STORAGE_KEYS].sort());
  });

  it('omits keys that were never written rather than storing null', () => {
    localStorage.setItem('qadha-prayer-counts', '{"fajr":3}');

    const backup = createBackup();

    expect(backup.entries).toEqual({ 'qadha-prayer-counts': '{"fajr":3}' });
  });

  it('ignores keys the app does not own', () => {
    localStorage.setItem('some-other-app-key', 'not ours');

    expect(createBackup().entries).toEqual({});
  });

  it('preserves plain string values without JSON-wrapping them', () => {
    localStorage.setItem('habits-level', 'sahabah');
    localStorage.setItem('qadha-daily-goal', '12');

    const { entries } = createBackup();

    expect(entries['habits-level']).toBe('sahabah');
    expect(entries['qadha-daily-goal']).toBe('12');
  });
});

describe('restoreBackup', () => {
  it('round-trips a full export back into localStorage', () => {
    localStorage.setItem('prayer-history', '{"2026-01-01":{"fajr":"ontime"}}');
    localStorage.setItem('qadha-prayer-counts', '{"fajr":40,"isha":12}');
    localStorage.setItem('habits-level', 'medium');
    const exported = JSON.stringify(createBackup());
    localStorage.clear();

    const result = restoreBackup(exported);

    expect(result.status).toBe('restored');
    expect(localStorage.getItem('prayer-history')).toBe('{"2026-01-01":{"fajr":"ontime"}}');
    expect(localStorage.getItem('qadha-prayer-counts')).toBe('{"fajr":40,"isha":12}');
    expect(localStorage.getItem('habits-level')).toBe('medium');
  });

  it('replaces existing data instead of merging with it', () => {
    localStorage.setItem('qadha-prayer-counts', '{"fajr":40}');
    const exported = JSON.stringify(createBackup());
    localStorage.setItem('qadha-prayer-counts', '{"fajr":999}');
    localStorage.setItem('prayer-history', '{"2026-05-05":{}}');

    restoreBackup(exported);

    expect(localStorage.getItem('qadha-prayer-counts')).toBe('{"fajr":40}');
    // Present before the restore but absent from the backup — must not survive.
    expect(localStorage.getItem('prayer-history')).toBeNull();
  });

  it('restores a legacy v1 backup file', () => {
    const v1 = JSON.stringify({
      version: 1,
      exportedAt: '2026-07-01T10:00:00.000Z',
      data: {
        prayers: { '2026-06-30': { fajr: 'ontime' } },
        qadha: { fajr: 7 },
        qadhaGoal: '5',
        habitsLevel: 'easy',
      },
    });

    const result = restoreBackup(v1);

    expect(result).toMatchObject({ status: 'restored', exportedAt: '2026-07-01T10:00:00.000Z' });
    expect(localStorage.getItem('prayer-history')).toBe('{"2026-06-30":{"fajr":"ontime"}}');
    expect(localStorage.getItem('qadha-prayer-counts')).toBe('{"fajr":7}');
    // v1 stored these as bare strings; they must not gain JSON quotes.
    expect(localStorage.getItem('qadha-daily-goal')).toBe('5');
    expect(localStorage.getItem('habits-level')).toBe('easy');
  });

  it('reports unreadable files without touching stored data', () => {
    localStorage.setItem('qadha-prayer-counts', '{"fajr":40}');

    expect(restoreBackup('this is not json')).toEqual({ status: 'unreadable' });
    expect(localStorage.getItem('qadha-prayer-counts')).toBe('{"fajr":40}');
  });

  it('rejects well-formed JSON that is not a backup', () => {
    localStorage.setItem('qadha-prayer-counts', '{"fajr":40}');

    expect(restoreBackup('{"hello":"world"}')).toEqual({ status: 'invalid' });
    expect(localStorage.getItem('qadha-prayer-counts')).toBe('{"fajr":40}');
  });

  it('refuses to write keys outside the app namespace', () => {
    const hostile = JSON.stringify({
      app: 'qadha-tracker',
      version: 2,
      exportedAt: new Date().toISOString(),
      entries: { 'qadha-prayer-counts': '{"fajr":1}', 'unrelated-key': 'injected' },
    });

    restoreBackup(hostile);

    expect(localStorage.getItem('qadha-prayer-counts')).toBe('{"fajr":1}');
    expect(localStorage.getItem('unrelated-key')).toBeNull();
  });
});

describe('clearAllData', () => {
  it('removes app data but leaves unrelated keys alone', () => {
    for (const key of APP_STORAGE_KEYS) localStorage.setItem(key, 'x');
    localStorage.setItem('unrelated-key', 'keep me');

    clearAllData();

    for (const key of APP_STORAGE_KEYS) expect(localStorage.getItem(key)).toBeNull();
    expect(localStorage.getItem('unrelated-key')).toBe('keep me');
  });
});

describe('backupFilename', () => {
  it('is dated so successive backups do not overwrite each other', () => {
    expect(backupFilename(new Date('2026-03-09T22:15:00Z'))).toBe(
      'qadha-tracker-backup-2026-03-09.json',
    );
  });
});
