// App-level hook: when signed in, pulls prayer_logs and qadha_counts from
// Supabase into localStorage (which the tracking hooks already read from),
// and subscribes to realtime + focus events so writes made via MCP tools
// show up in the UI without a manual reload.
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PrayerHistory, PrayerStatus, PrayerCounts } from '@/types';
import { syncLocalDataToCloud } from '@/lib/cloudSync';

const HISTORY_KEY = 'prayer-history';
const QADHA_KEY = 'qadha-prayer-counts';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

function readJSON<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}

function applyPrayerRow(date: string, prayer: string, status: string | null) {
  const hist = readJSON<PrayerHistory>(HISTORY_KEY, {} as PrayerHistory);
  const day = hist[date] || {
    prayers: {
      fajr: { status: 'pending' }, dhuhr: { status: 'pending' }, asr: { status: 'pending' },
      maghrib: { status: 'pending' }, isha: { status: 'pending' },
    },
    sunnah: undefined as any,
  };
  const p = prayer as (typeof PRAYERS)[number];
  if (!PRAYERS.includes(p)) return;
  const s: PrayerStatus =
    status === 'jamaah' || status === 'ontime' || status === 'late' || status === 'missed'
      ? status
      : 'pending';
  day.prayers = { ...day.prayers, [p]: { ...day.prayers[p], status: s } };
  hist[date] = day;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  window.dispatchEvent(new Event('prayer-history-updated'));
}

function applyQadhaRow(prayer: string, remaining: number) {
  const cur = readJSON<PrayerCounts>(QADHA_KEY, {
    fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
  });
  if (!(prayer in cur)) return;
  const next = { ...cur, [prayer]: Math.max(0, remaining) };
  localStorage.setItem(QADHA_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('qadha-updated'));
}

const HABITS_KEY = 'habits-tracking';

function applyHabitLog(date: string, slug: string, done: boolean) {
  const hist = readJSON<Record<string, Record<string, boolean>>>(HABITS_KEY, {});
  const day = { ...(hist[date] || {}) };
  if (done) day[slug] = true; else delete day[slug];
  hist[date] = day;
  localStorage.setItem(HABITS_KEY, JSON.stringify(hist));
  window.dispatchEvent(new Event('habits-tracking-updated'));
}

async function pullAll(userId: string) {
  // Prayers
  const { data: pr } = await supabase
    .from('prayer_logs')
    .select('date,prayer,status')
    .eq('user_id', userId);
  if (pr) {
    const hist = readJSON<PrayerHistory>(HISTORY_KEY, {} as PrayerHistory);
    for (const row of pr) {
      const date = row.date as unknown as string;
      const day = hist[date] || {
        prayers: {
          fajr: { status: 'pending' }, dhuhr: { status: 'pending' }, asr: { status: 'pending' },
          maghrib: { status: 'pending' }, isha: { status: 'pending' },
        },
        sunnah: undefined as any,
      };
      const p = row.prayer as (typeof PRAYERS)[number];
      if (!PRAYERS.includes(p)) continue;
      const s = row.status as PrayerStatus;
      day.prayers = { ...day.prayers, [p]: { ...day.prayers[p], status: s } };
      hist[date] = day;
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    window.dispatchEvent(new Event('prayer-history-updated'));
  }

  // Qadha
  const { data: qc } = await supabase
    .from('qadha_counts')
    .select('prayer,remaining')
    .eq('user_id', userId);
  if (qc) {
    const cur = readJSON<PrayerCounts>(QADHA_KEY, {
      fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
    });
    for (const row of qc) {
      if ((row.prayer as string) in cur) {
        (cur as any)[row.prayer as string] = Math.max(0, row.remaining as number);
      }
    }
    localStorage.setItem(QADHA_KEY, JSON.stringify(cur));
    window.dispatchEvent(new Event('qadha-updated'));
  }

  // Habits: join habit_logs -> habits.slug
  const { data: hl } = await supabase
    .from('habit_logs')
    .select('date,count,habits!inner(slug,user_id)')
    .eq('user_id', userId);
  if (hl) {
    const hist = readJSON<Record<string, Record<string, boolean>>>(HABITS_KEY, {});
    for (const row of hl as any[]) {
      const slug = row.habits?.slug;
      const date = row.date;
      if (!slug || !date) continue;
      const day = { ...(hist[date] || {}) };
      if ((row.count ?? 0) > 0) day[slug] = true; else delete day[slug];
      hist[date] = day;
    }
    localStorage.setItem(HABITS_KEY, JSON.stringify(hist));
    window.dispatchEvent(new Event('habits-tracking-updated'));
  }
}

export function useCloudSync() {
  useEffect(() => {
    let userId: string | null = null;
    let unsub: (() => void) | null = null;

    const attach = async (uid: string) => {
      userId = uid;
      // Legacy one-time push of local data to cloud
      try { await syncLocalDataToCloud(uid); } catch {}
      await pullAll(uid);

      const channel = supabase
        .channel(`user-sync-${uid}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'prayer_logs', filter: `user_id=eq.${uid}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              const old = payload.old as any;
              if (old?.date && old?.prayer) applyPrayerRow(old.date, old.prayer, null);
            } else {
              const row = payload.new as any;
              if (row?.date && row?.prayer) applyPrayerRow(row.date, row.prayer, row.status);
            }
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'qadha_counts', filter: `user_id=eq.${uid}` },
          (payload) => {
            const row = (payload.new ?? payload.old) as any;
            if (row?.prayer != null) applyQadhaRow(row.prayer, row.remaining ?? 0);
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${uid}` },
          async (payload) => {
            const row = (payload.new ?? payload.old) as any;
            if (!row?.habit_id || !row?.date) return;
            const { data: h } = await supabase
              .from('habits').select('slug').eq('id', row.habit_id).maybeSingle();
            if (!h?.slug) return;
            const done = payload.eventType !== 'DELETE' && (row.count ?? 0) > 0;
            applyHabitLog(row.date, h.slug, done);
          },
        )
        .subscribe();

      const onVisible = () => { if (document.visibilityState === 'visible') pullAll(uid); };
      document.addEventListener('visibilitychange', onVisible);

      unsub = () => {
        supabase.removeChannel(channel);
        document.removeEventListener('visibilitychange', onVisible);
      };
    };

    const detach = () => { if (unsub) { unsub(); unsub = null; } userId = null; };

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (uid) attach(uid);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const uid = s?.user?.id ?? null;
      if (uid && uid !== userId) { detach(); attach(uid); }
      else if (!uid && userId) { detach(); }
    });

    return () => { sub.subscription.unsubscribe(); detach(); };
  }, []);
}
