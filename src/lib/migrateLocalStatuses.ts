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
