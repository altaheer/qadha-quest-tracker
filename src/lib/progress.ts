import type { HabitsHistory, PrayerHistory, PrayerCounts } from '@/types';
import { PRAYER_KEYS, isPrayed, isOnTime } from './prayerStats';
import { getDateString } from './date';
import { readStored, writeStorage } from './localStore';

export interface QadhaCompletion { id: string; prayer: keyof PrayerCounts; date: string; createdAt: number; undone: boolean }
export const EMPTY_COMPLETIONS: QadhaCompletion[] = [];
const COUNTS = 'qadha-prayer-counts';
export const COMPLETIONS = 'qadha-completions';

export function completeQadha(prayer: keyof PrayerCounts) {
  const counts = readStored<Partial<PrayerCounts>>(COUNTS, {});
  if (!(counts[prayer] > 0)) return null;
  const entry: QadhaCompletion = { id: crypto.randomUUID(), prayer, date: getDateString(new Date()), createdAt: Date.now(), undone: false };
  writeStorage({ [COUNTS]: JSON.stringify({ ...counts, [prayer]: counts[prayer] - 1 }),
    [COMPLETIONS]: JSON.stringify([...readStored(COMPLETIONS, EMPTY_COMPLETIONS), entry]) });
  return entry.id;
}

export function undoQadha(id: string) {
  const entries = readStored(COMPLETIONS, EMPTY_COMPLETIONS);
  const entry = entries.find(e => e.id === id && !e.undone);
  if (!entry) return;
  const counts = readStored<Partial<PrayerCounts>>(COUNTS, {});
  writeStorage({ [COUNTS]: JSON.stringify({ ...counts, [entry.prayer]: (counts[entry.prayer] || 0) + 1 }),
    [COMPLETIONS]: JSON.stringify(entries.map(e => e.id === id ? { ...e, undone: true } : e)) });
}

/** Activity points, derived from actual records. Repeated toggling cannot mint XP. */
export function progressSummary(prayers: PrayerHistory, habits: HabitsHistory, entries: QadhaCompletion[], today: string, goal: number) {
  const daily: Record<string, { xp: number; prayers: number; habits: number; qadha: number }> = {};
  const ensure = (day: string) => daily[day] ||= { xp: 0, prayers: 0, habits: 0, qadha: 0 };
  for (const [day, value] of Object.entries(prayers)) {
    if (day > today) continue;
    for (const prayer of PRAYER_KEYS) {
      const status = value.prayers[prayer]?.status;
      if (isPrayed(status)) { ensure(day).prayers++; ensure(day).xp += 10 + (isOnTime(status) ? 5 : 0) + (status === 'jamaah' ? 5 : 0); }
    }
  }
  for (const [day, value] of Object.entries(habits)) {
    if (day > today) continue;
    const count = Object.values(value).filter(Boolean).length;
    ensure(day).habits = count; ensure(day).xp += count * 5;
  }
  const seen = new Set<string>();
  for (const entry of entries) {
    if (entry.undone || entry.date > today || seen.has(entry.id)) continue;
    seen.add(entry.id); ensure(entry.date).qadha++; ensure(entry.date).xp += 20;
  }
  // Fixed, replay-safe daily bonuses, with a stable target independent of later goal edits.
  for (const day of Object.values(daily)) {
    if (day.prayers === 5) day.xp += 25;
    if (day.habits >= 3) day.xp += 10;
    if (day.qadha >= 1) day.xp += 10;
  }
  const totalXP = Object.values(daily).reduce((n, day) => n + day.xp, 0);
  const level = Math.floor(totalXP / 150) + 1;
  const current = ensure(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${today}T12:00:00`); date.setDate(date.getDate() - 6 + i);
    const key = getDateString(date); return { date: key, xp: daily[key]?.xp || 0 };
  });
  const qadhaTotal = seen.size;
  const milestone = [5, 10, 25, 50, 100, 250, 500, 1000].find(n => n > qadhaTotal) || (Math.floor(qadhaTotal / 1000) + 1) * 1000;
  return { totalXP, level, levelXP: totalXP % 150, current, week, qadhaTotal, milestone, goal: Math.max(1, goal) };
}
