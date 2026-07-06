// One-time migration of localStorage-backed data to Lovable Cloud after sign-in.
// Non-destructive: leaves localStorage in place so the app keeps working offline.
import { supabase } from '@/integrations/supabase/client';

const SYNC_FLAG = 'cloud-sync-completed-v1';

type PrayerStatus = 'jamaah' | 'ontime' | 'late' | 'missed' | 'none';
const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

function readJSON<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}

function normalizeStatus(v: unknown): PrayerStatus | null {
  if (typeof v !== 'string') return null;
  const s = v.toLowerCase();
  if (s.includes('jama')) return 'jamaah';
  if (s.includes('time') || s === 'ontime' || s === 'done') return 'ontime';
  if (s.includes('late')) return 'late';
  if (s.includes('miss')) return 'missed';
  return null;
}

export async function syncLocalDataToCloud(userId: string): Promise<{ prayers: number; qadha: number }> {
  if (localStorage.getItem(SYNC_FLAG)) return { prayers: 0, qadha: 0 };

  // Prayer history: { [date: 'YYYY-MM-DD']: { fajr: status, ... } }
  const history = readJSON<Record<string, Record<string, unknown>>>('prayer-history', {});
  const prayerRows: Array<{ user_id: string; date: string; prayer: string; status: PrayerStatus }> = [];
  for (const [date, dayObj] of Object.entries(history)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !dayObj) continue;
    for (const p of PRAYERS) {
      const st = normalizeStatus(dayObj[p]);
      if (st && st !== 'none') prayerRows.push({ user_id: userId, date, prayer: p, status: st });
    }
  }
  if (prayerRows.length) {
    // Chunk to avoid payload issues
    for (let i = 0; i < prayerRows.length; i += 500) {
      await supabase.from('prayer_logs').upsert(prayerRows.slice(i, i + 500), { onConflict: 'user_id,date,prayer' });
    }
  }

  // Qadha counts
  const q = readJSON<Record<string, number>>('qadha-prayer-counts', {});
  const qadhaRows = Object.entries(q)
    .filter(([, n]) => typeof n === 'number' && n > 0)
    .map(([prayer, remaining]) => ({ user_id: userId, prayer, remaining }));
  if (qadhaRows.length) {
    await supabase.from('qadha_counts').upsert(qadhaRows, { onConflict: 'user_id,prayer' });
  }

  localStorage.setItem(SYNC_FLAG, new Date().toISOString());
  return { prayers: prayerRows.length, qadha: qadhaRows.length };
}
