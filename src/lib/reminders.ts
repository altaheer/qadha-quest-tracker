import { getDateString } from './date';
import { PRAYER_KEYS } from './prayerStats';
import type { PrayerHistory } from '@/types';

export function pendingPrayers(history: PrayerHistory, day: string) {
  return PRAYER_KEYS.filter(p => !history[day]?.prayers[p]?.status || history[day].prayers[p].status === 'pending').length;
}

/** The cutoff belongs to the previous prayer day, even after midnight. */
export function reminderPlan(history: PrayerHistory, cutoff: string, now = new Date()) {
  const [hour, minute] = /^([01]\d|2[0-3]):[0-5]\d$/.test(cutoff) ? cutoff.split(':').map(Number) : [0, 0];
  const plan: { id: number; at: Date; day: string }[] = [];
  for (let offset = -1; offset < 30; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, hour, minute - 30);
    if (at <= now || pendingPrayers(history, getDateString(day)) === 0) continue;
    plan.push({ id: 5101 + offset, at, day: getDateString(day) });
  }
  return plan;
}

export const reminderBody = {
  sv: 'Öppna Ibadah och kontrollera dina omarkerade böner.',
  en: 'Open Ibadah and check your unmarked prayers.',
  tr: 'İbadah uygulamasını açıp işaretlenmemiş namazlarını kontrol et.',
  ar: 'افتح عبادة وراجع الصلوات غير المسجلة.',
};
