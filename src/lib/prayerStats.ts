import type { DailyPrayers, PrayerHistory, PrayerStatus, PrayerStreaks } from '@/types';
import { getDateString } from './date';

export const PRAYER_KEYS: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const isOnTime = (status?: PrayerStatus) => status === 'ontime' || status === 'jamaah';
export const isPrayed = (status?: PrayerStatus) => isOnTime(status) || status === 'late';

function previousDay(key: string) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return getDateString(date);
}

/** Only trailing, as-yet-unmarked prayers today may be skipped. */
export function calculateCombo(history: PrayerHistory, today = getDateString(new Date())) {
  let day = today;
  let combo = 0;
  let started = false;
  for (;;) {
    for (const prayer of [...PRAYER_KEYS].reverse()) {
      const status = history[day]?.prayers[prayer]?.status;
      if (!started && day === today && (!status || status === 'pending')) continue;
      started = true;
      if (!isOnTime(status)) return combo;
      combo++;
    }
    day = previousDay(day);
  }
}

export function calculatePrayerStreaks(history: PrayerHistory, today = getDateString(new Date())): PrayerStreaks {
  return Object.fromEntries(PRAYER_KEYS.map(prayer => {
    let day = history[today]?.prayers[prayer]?.status === 'pending' || !history[today]
      ? previousDay(today) : today;
    let current = 0;
    while (isOnTime(history[day]?.prayers[prayer]?.status)) {
      current++;
      day = previousDay(day);
    }
    let best = 0;
    let run = 0;
    let last: string | null = null;
    for (const key of Object.keys(history).filter(key => key <= today).sort()) {
      if (last !== previousDay(key)) run = 0;
      run = isOnTime(history[key]?.prayers[prayer]?.status) ? run + 1 : 0;
      best = Math.max(best, run);
      last = key;
    }
    return [prayer, { current, best }];
  })) as unknown as PrayerStreaks;
}

export function calculateDailyStreak(history: PrayerHistory, today = getDateString(new Date())) {
  let day = today;
  const statuses = PRAYER_KEYS.map(p => history[today]?.prayers[p]?.status);
  if (statuses.some(s => !s || s === 'pending') && !statuses.some(s => s === 'late' || s === 'missed')) {
    day = previousDay(day);
  }
  let streak = 0;
  while (PRAYER_KEYS.every(p => isOnTime(history[day]?.prayers[p]?.status))) {
    streak++;
    day = previousDay(day);
  }
  return streak;
}
