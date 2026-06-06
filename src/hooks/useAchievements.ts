import { useEffect, useMemo, useState } from 'react';
import {
  achievements,
  checkAchievements,
  type AchievementStats,
} from '@/lib/achievements';
import type { PrayerHistory, HabitsHistory, PrayerCounts } from '@/types';

const UNLOCKED_KEY = 'achievements-unlocked';
const INIT_KEY = 'achievements-initialized';

type UnlockedMap = Record<string, string>; // id -> ISO date

const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isoWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${wk}`;
}

function consecutiveMax(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let best = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const next = new Date(sorted[i]);
    const diff = Math.round((+next - +prev) / 86400000);
    if (diff === 1) {
      cur++;
      if (cur > best) best = cur;
    } else if (diff > 1) {
      cur = 1;
    }
  }
  return best;
}

function computeStats(unlockedCountForMeta: number): AchievementStats {
  const prayerHistory = read<PrayerHistory>('prayer-history', {});
  const qadhaCounts = read<PrayerCounts>('qadha-prayer-counts', {
    fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
  });
  const habitsHistory = read<HabitsHistory>('habits-tracking', {});
  const nafilahHistory = read<Record<string, Record<string, boolean>>>('nafilah-history', {});
  const timebound = read<Record<string, Record<string, boolean>>>('timebound-habits', {});
  const habitsLevel = (localStorage.getItem('habits-level') || 'easy');
  const langKey = localStorage.getItem('app-language');

  // Prayer-derived
  let firstPrayerMarked = false;
  let jamaahTotal = 0;
  let missedInHistory = 0;
  const fajrOnTimeDates: string[] = [];
  const allFiveDates: string[] = [];
  let anyAllFiveDay = false;
  let totalPoints = 0;
  let comboMax = 0;
  let comboRun = 0;

  const sortedPrayerDates = Object.keys(prayerHistory).sort();
  for (const date of sortedPrayerDates) {
    const day = prayerHistory[date];
    if (!day) continue;
    let allMarked = true;
    let allGoodOrLate = true;
    for (const p of PRAYER_IDS) {
      const status = day.prayers?.[p]?.status || 'pending';
      if (status !== 'pending') firstPrayerMarked = true;
      if (status === 'jamaah') { jamaahTotal++; totalPoints += 25; }
      else if (status === 'on-time') { totalPoints += 15; }
      else if (status === 'late') { totalPoints += 5; }
      else if (status === 'missed') { missedInHistory++; }
      if (status === 'pending') allMarked = false;
      if (status === 'pending' || status === 'missed') allGoodOrLate = false;
      // combo walk fajr → isha within day
      if (status === 'on-time' || status === 'jamaah') {
        comboRun++;
        if (comboRun > comboMax) comboMax = comboRun;
      } else if (status === 'late' || status === 'missed') {
        comboRun = 0;
      }
    }
    if (allMarked) anyAllFiveDay = true;
    if (allGoodOrLate) allFiveDates.push(date);
    const fajrStatus = day.prayers?.fajr?.status;
    if (fajrStatus === 'on-time' || fajrStatus === 'jamaah') fajrOnTimeDates.push(date);
  }

  // Habit cumulative totals
  const habitDays = (id: string) =>
    Object.values(habitsHistory).filter((d) => !!d?.[id]).length;

  const sleepIds = ['sleep-wudu', 'sleep-kursi', 'sleep-mulk', 'sleep-3quls', 'sleep-baqarah', 'sleep-dua', 'sleep-right'];
  const sahabahIds = ['tahajjud-prep', 'quran-daily', 'istighfar-100', 'salawat-100', 'sadaqah-daily', 'dua-parents'];

  let sleepHabitsAnyDay = false;
  let allSahabahOneDay = false;
  let totalHabitCompletions = 0;
  for (const day of Object.values(habitsHistory)) {
    if (!day) continue;
    for (const v of Object.values(day)) if (v) totalHabitCompletions++;
    if (sleepIds.every((id) => day[id])) sleepHabitsAnyDay = true;
    if (sahabahIds.every((id) => day[id])) allSahabahOneDay = true;
  }
  totalPoints += totalHabitCompletions * 3;

  // Time-bound
  let jumuahTotal = 0;
  let arafahLogged = false;
  let ashuraLogged = false;
  let ramadanComplete = false;
  const ayyamMonths = new Set<string>();
  const weeks: Record<string, { mon?: boolean; thu?: boolean }> = {};

  for (const [date, evts] of Object.entries(timebound)) {
    if (!evts) continue;
    if (evts['jumuah']) jumuahTotal++;
    if (evts['arafah']) arafahLogged = true;
    if (evts['ashura']) ashuraLogged = true;
    if (evts['ramadan']) ramadanComplete = true;
    if (evts['ayyam-al-beed']) ayyamMonths.add(date.slice(0, 7));
    if (evts['fast-monday'] || evts['fast-thursday']) {
      const w = isoWeek(new Date(date));
      weeks[w] ||= {};
      if (evts['fast-monday']) weeks[w].mon = true;
      if (evts['fast-thursday']) weeks[w].thu = true;
    }
  }
  const mondayThursdaySameWeek = Object.values(weeks).some((w) => w.mon && w.thu);

  // App days
  const allDates = new Set<string>([
    ...Object.keys(prayerHistory),
    ...Object.keys(habitsHistory),
    ...Object.keys(nafilahHistory),
    ...Object.keys(timebound),
  ]);
  const sortedAll = [...allDates].sort();
  let appDays = 0;
  if (sortedAll.length > 0) {
    const earliest = new Date(sortedAll[0]);
    appDays = Math.max(1, Math.floor((Date.now() - +earliest) / 86400000) + 1);
  }

  const qadhaTotal = Object.values(qadhaCounts).reduce((a, b) => a + (b || 0), 0);
  const qadhaLogged = qadhaTotal > 0 || missedInHistory > 0;
  const qadhaMadeUp = Math.max(0, missedInHistory - qadhaTotal);
  const qadhaReachedZero = qadhaLogged && qadhaTotal === 0;
  const qadhaGoalSet = localStorage.getItem('qadha-daily-goal') !== null;

  return {
    firstPrayerMarked,
    fajrOnTimeMax: consecutiveMax(fajrOnTimeDates),
    allFiveDaysMax: consecutiveMax(allFiveDates),
    anyAllFiveDay,
    jamaahTotal,
    comboMax,
    qadhaLogged,
    qadhaMadeUp,
    qadhaReachedZero,
    qadhaGoalSet,
    duaAfterEatingTotal: habitDays('dua-after-eating'),
    siwakTotal: habitDays('wake-siwak'),
    ishraqTotal: habitDays('ishraq'),
    tahajjudTotal: habitDays('tahajjud-prep'),
    quranTotal: habitDays('quran-daily'),
    sadaqahTotal: habitDays('sadaqah-daily'),
    morningAdhkarTotal: habitDays('morning-adhkar'),
    sleepHabitsAnyDay,
    allSahabahOneDay,
    movedUpFromEasy: habitsLevel !== 'easy',
    switchedToSahabah: habitsLevel === 'sahabah',
    jumuahTotal,
    ayyamAlBeedComplete: ayyamMonths.size,
    mondayThursdaySameWeek,
    arafahLogged,
    ashuraLogged,
    ramadanComplete,
    appDays,
    backupExported: localStorage.getItem('backup-exported') === '1',
    backupRestored: localStorage.getItem('backup-restored') === '1',
    languageChanged: langKey !== null,
    totalPoints,
    unlockedCount: unlockedCountForMeta,
  };
}

export interface AchievementsResult {
  unlocked: UnlockedMap;
  newlyUnlocked: string[];
  stats: AchievementStats;
}

export function useAchievements(): AchievementsResult {
  const [tick, setTick] = useState(0);

  // Recompute on storage changes from other parts of the app
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('storage', bump);
    window.addEventListener('qadha-updated', bump);
    return () => {
      window.removeEventListener('storage', bump);
      window.removeEventListener('qadha-updated', bump);
    };
  }, []);

  return useMemo<AchievementsResult>(() => {
    // First pass: compute stats with provisional unlockedCount = 0,
    // determine non-secret unlocks, then re-evaluate the secret.
    const provisional = computeStats(0);
    const firstUnlocked = checkAchievements(provisional)
      .filter((id) => id !== 'khatam');
    const stats = { ...provisional, unlockedCount: firstUnlocked.length };
    const unlockedIds = checkAchievements(stats);

    const existing = read<UnlockedMap>(UNLOCKED_KEY, {});
    const initialized = localStorage.getItem(INIT_KEY) === '1';

    const now = new Date().toISOString();
    const next: UnlockedMap = { ...existing };
    const newly: string[] = [];

    for (const id of unlockedIds) {
      if (!(id in next)) {
        next[id] = now;
        if (initialized) newly.push(id);
      }
    }

    if (!initialized) {
      localStorage.setItem(INIT_KEY, '1');
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(next));
      return { unlocked: next, newlyUnlocked: [], stats };
    }

    if (newly.length > 0) {
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(next));
    }

    return { unlocked: next, newlyUnlocked: newly, stats };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
}

export { achievements };
