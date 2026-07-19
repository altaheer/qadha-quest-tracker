// Fire-and-forget writes from the UI hooks to Supabase, so writes done in the
// app UI match writes done via the MCP tools. No-op when signed out.
import { supabase } from '@/integrations/supabase/client';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerStatusCloud = 'pending' | 'jamaah' | 'ontime' | 'late' | 'missed';

let cachedUserId: string | null | undefined;
async function getUserId(): Promise<string | null> {
  if (cachedUserId !== undefined) return cachedUserId;
  const { data } = await supabase.auth.getSession();
  cachedUserId = data.session?.user?.id ?? null;
  return cachedUserId;
}

// Reset cache on auth changes
supabase.auth.onAuthStateChange((_e, s) => {
  cachedUserId = s?.user?.id ?? null;
});

export async function pushPrayerLog(date: string, prayer: PrayerName, status: PrayerStatusCloud) {
  const user_id = await getUserId();
  if (!user_id) return;
  try {
    if (status === 'pending') {
      await supabase.from('prayer_logs').delete().match({ user_id, date, prayer });
    } else {
      await supabase
        .from('prayer_logs')
        .upsert(
          { user_id, date, prayer, status, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,date,prayer' },
        );
    }
  } catch {
    /* offline / permission — localStorage remains source */
  }
}

export async function pushQadhaCount(prayer: string, remaining: number, delta: number, reason?: string) {
  const user_id = await getUserId();
  if (!user_id) return;
  try {
    await supabase
      .from('qadha_counts')
      .upsert(
        { user_id, prayer, remaining, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,prayer' },
      );
    if (delta !== 0) {
      await supabase.from('qadha_events').insert({ user_id, prayer, delta, reason: reason ?? null });
    }
  } catch { /* ignore */ }
}
