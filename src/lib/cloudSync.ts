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

export async function syncLocalDataToCloud(userId: string): Promise<{ prayers: number; qadha: number; habits: number }> {
  if (localStorage.getItem(SYNC_FLAG)) return { prayers: 0, qadha: 0, habits: 0 };

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

  // Habits history: { [date]: { [habitSlug]: boolean } }
  const habitsHistory = readJSON<Record<string, Record<string, boolean>>>('habits-tracking', {});
  const slugsUsed = new Set<string>();
  for (const dayObj of Object.values(habitsHistory)) {
    if (!dayObj) continue;
    for (const [slug, done] of Object.entries(dayObj)) if (done) slugsUsed.add(slug);
  }
  let habitCount = 0;
  if (slugsUsed.size) {
    // Lazy import to avoid circular deps
    const { habitCategories } = await import('@/hooks/useHabitsTracking');
    const meta = new Map<string, { name: string; points: number }>();
    for (const cat of habitCategories) for (const h of cat.habits) meta.set(h.id, { name: h.name, points: h.points });

    // Ensure habits rows exist and collect id map
    const idBySlug = new Map<string, string>();
    for (const slug of slugsUsed) {
      const m = meta.get(slug);
      if (!m) continue;
      const { data: existing } = await supabase
        .from('habits').select('id').eq('user_id', userId).eq('slug', slug).maybeSingle();
      if (existing?.id) { idBySlug.set(slug, existing.id); continue; }
      const { data: inserted } = await supabase
        .from('habits').insert({ user_id: userId, slug, name: m.name, points: m.points })
        .select('id').single();
      if (inserted?.id) idBySlug.set(slug, inserted.id);
    }

    const logRows: Array<{ user_id: string; habit_id: string; date: string; count: number }> = [];
    for (const [date, dayObj] of Object.entries(habitsHistory)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !dayObj) continue;
      for (const [slug, done] of Object.entries(dayObj)) {
        if (!done) continue;
        const hid = idBySlug.get(slug);
        if (!hid) continue;
        logRows.push({ user_id: userId, habit_id: hid, date, count: 1 });
      }
    }
    for (let i = 0; i < logRows.length; i += 500) {
      await supabase.from('habit_logs').upsert(logRows.slice(i, i + 500), { onConflict: 'habit_id,date' });
    }
    habitCount = logRows.length;
  }

  localStorage.setItem(SYNC_FLAG, new Date().toISOString());
  return { prayers: prayerRows.length, qadha: qadhaRows.length, habits: habitCount };
}
