import { getDateString } from './date';

// One-shot migration: rewrite legacy 'on-time' strings to 'ontime' in localStorage.
// Safe to run on every boot — becomes a no-op once done.
const FLAG = 'status-vocab-v2-migrated';

export function migrateLocalStatuses() {
  try {
    if (localStorage.getItem(FLAG)) return;
    const raw = localStorage.getItem('prayer-history');
    if (raw) {
      const patched = raw.replace(/"on-time"/g, '"ontime"');
      if (patched !== raw) localStorage.setItem('prayer-history', patched);
    }
    // Missions may also carry qualifier: 'on-time'
    const m = localStorage.getItem('missions-v1');
    if (m) {
      const patched = m.replace(/"on-time"/g, '"ontime"');
      if (patched !== m) localStorage.setItem('missions-v1', patched);
    }
    localStorage.setItem(FLAG, '1');
  } catch {
    // ignore
  }
}

/**
 * One-shot migration: `prayer-history` used to be keyed by
 * `date.toISOString().split('T')[0]` — a UTC date. getDateString() now uses
 * local date components instead, so anyone east of Greenwich had prayers
 * filed a day early whenever they prayed between local midnight and the UTC
 * offset. Each entry that has a `timestamp` can be re-keyed to the local date
 * that timestamp actually falls on; entries without one (older data, or a
 * restored v1 backup) are left under their existing key rather than guessed at.
 */
const HISTORY_KEY_FLAG = 'history-keys-local-v1-migrated';

export function migrateHistoryKeysToLocalDates() {
  try {
    if (localStorage.getItem(HISTORY_KEY_FLAG)) return;

    const raw = localStorage.getItem('prayer-history');
    if (!raw) {
      localStorage.setItem(HISTORY_KEY_FLAG, '1');
      return;
    }

    const history = JSON.parse(raw);
    if (!history || typeof history !== 'object') {
      localStorage.setItem(HISTORY_KEY_FLAG, '1');
      return;
    }

    const next: Record<string, unknown> = {};
    let changed = false;

    for (const [oldKey, day] of Object.entries(history)) {
      const prayers = (day as { prayers?: Record<string, { timestamp?: number }> })?.prayers;
      const timestamps = prayers
        ? Object.values(prayers)
            .map((p) => p?.timestamp)
            .filter((t): t is number => typeof t === 'number')
        : [];

      // Use the earliest mark of the day — closest to when the day actually
      // happened for the person praying it.
      const newKey = timestamps.length
        ? getDateString(new Date(Math.min(...timestamps)))
        : oldKey;

      if (newKey !== oldKey) changed = true;

      if (next[newKey] && typeof next[newKey] === 'object') {
        // Two old UTC-keyed days can collapse onto the same local day
        // (rare, but possible right at the boundary) — merge rather than
        // let the second overwrite the first.
        next[newKey] = mergeDay(next[newKey] as Record<string, unknown>, day as Record<string, unknown>);
      } else {
        next[newKey] = day;
      }
    }

    if (changed) {
      localStorage.setItem('prayer-history', JSON.stringify(next));
    }
    localStorage.setItem(HISTORY_KEY_FLAG, '1');
  } catch {
    // Leave history untouched rather than risk losing it.
  }
}

function mergeDay(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const aPrayers = (a.prayers as Record<string, unknown>) || {};
  const bPrayers = (b.prayers as Record<string, unknown>) || {};
  const aSunnah = (a.sunnah as Record<string, unknown>) || {};
  const bSunnah = (b.sunnah as Record<string, unknown>) || {};
  return {
    ...a,
    ...b,
    prayers: { ...aPrayers, ...bPrayers },
    sunnah: { ...aSunnah, ...bSunnah },
  };
}
