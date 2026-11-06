import { useEffect, useCallback } from 'react';
import { useStoredState, readStored, writeStorage } from '@/lib/localStore';
import { defaultDailyPrayers, createDefaultSunnah } from '@/lib/prayerData';
import { calculateCombo, calculatePrayerStreaks, isPrayed } from '@/lib/prayerStats';
import { useLocalDay } from '@/hooks/useLocalDay';
import { getDateString } from '@/lib/date';
import type {
  PrayerStatus,
  PrayerEntry,
  DailyPrayers,
  PrayerStreak,
  PrayerStreaks,
  SunnahItem,
  PrayerSunnah,
  PrayerHistory,
} from '@/types';

// Re-export for backward compatibility with existing consumers
export type {
  PrayerStatus,
  PrayerEntry,
  DailyPrayers,
  PrayerStreak,
  PrayerStreaks,
  SunnahItem,
  PrayerSunnah,
  PrayerHistory,
};

const HISTORY_KEY = 'prayer-history';
const QADHA_KEY = 'qadha-prayer-counts';
const EMPTY_HISTORY: PrayerHistory = {};

// Combo multiplier: +0.1x per 10 consecutive ontime/jamaah prayers
export function getComboMultiplier(combo: number): number {
  return 1 + Math.floor(combo / 10) * 0.1;
}

export function getComboLabel(combo: number): string | null {
  if (combo < 10) return null;
  if (combo >= 200) return '🔥🔥🔥 LEGENDARY';
  if (combo >= 150) return '🔥🔥 EPIC';
  if (combo >= 100) return '🔥 MASTER';
  if (combo >= 50) return '⚡ EXCELLENT';
  if (combo >= 30) return '💪 GREAT';
  if (combo >= 10) return '✨ COMBO';
  return null;
}


export function usePrayerTracking(selectedDate?: Date) {
  useLocalDay();
  const today = new Date();
  const currentDate = selectedDate || today;
  const dateKey = getDateString(currentDate);
  const isToday = dateKey === getDateString(today);

  const [history] = useStoredState<PrayerHistory>(HISTORY_KEY, EMPTY_HISTORY);
  const combo = calculateCombo(history);
  const streaks = calculatePrayerStreaks(history);
  const prayers = history[dateKey]?.prayers || defaultDailyPrayers;
  const sunnah = history[dateKey]?.sunnah || createDefaultSunnah();

  // Commit history and debt together. Multiple mounted consumers always read
  // the last committed history, so an overdue prayer is counted exactly once.
  const commitHistory = useCallback((update: (previous: PrayerHistory) => {
    history: PrayerHistory;
    deltas: Partial<Record<keyof DailyPrayers, number>>;
  }) => {
    const previous = readStored<PrayerHistory>(HISTORY_KEY, EMPTY_HISTORY);
    const result = update(previous);
    if (result.history === previous) return;
    const counts = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
      ...readStored<Record<string, number>>(QADHA_KEY, {}) };
    for (const prayer of Object.keys(result.deltas) as (keyof DailyPrayers)[]) {
      counts[prayer] = Math.max(0, counts[prayer] + (result.deltas[prayer] || 0));
    }
    writeStorage({
      [HISTORY_KEY]: JSON.stringify(result.history),
      [QADHA_KEY]: JSON.stringify(counts),
    });
  }, []);

  // Auto-mark pending past prayers as missed once the day's cutoff has passed.
  useEffect(() => {
    const sweep = () => {
      let prefs: { autoMarkMissed?: boolean; autoMarkMissedTime?: string } = {};
      try { prefs = JSON.parse(localStorage.getItem('app-prefs') || '{}'); } catch { /* Keep existing state if browser storage is unavailable. */ }
      if (prefs.autoMarkMissed === false) return;
      const [hh, mm] = (prefs.autoMarkMissedTime || '00:00').split(':').map((n) => parseInt(n, 10));
      const cutoffMin = (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);
      const now = new Date();

      commitHistory((prev) => {
        const deltas: Partial<Record<keyof DailyPrayers, number>> = {};
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(prev)) {
          const [y, m, d] = key.split('-').map((n) => parseInt(n, 10));
          if (!y || !m || !d) continue;
          // Day "closes" at start of (key + 1) + cutoffMin minutes
          const closeAt = new Date(y, m - 1, d + 1, 0, cutoffMin, 0, 0);
          if (now < closeAt) continue;
          const day = prev[key];
          let dayChanged = false;
          const newPrayers = { ...day.prayers };
          (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).forEach((p) => {
            if (newPrayers[p]?.status === 'pending') {
              newPrayers[p] = { status: 'missed', timestamp: closeAt.getTime() };
              deltas[p] = (deltas[p] || 0) + 1;
              dayChanged = true;
            }
          });
          if (dayChanged) {
            next[key] = { ...day, prayers: newPrayers };
            changed = true;
          }
        }
        return { history: changed ? next : prev, deltas };
      });
    };
    sweep();
    const id = window.setInterval(sweep, 60_000);
    return () => window.clearInterval(id);
  }, [commitHistory]);

  const markPrayer = useCallback((prayer: keyof DailyPrayers, status: PrayerStatus) => {
    commitHistory(prev => {
      const existingDay = prev[dateKey] || { prayers: { ...defaultDailyPrayers }, sunnah: createDefaultSunnah() };
      const previousStatus = existingDay.prayers[prayer].status;
      const newStatus: PrayerStatus = previousStatus === status ? 'pending' : status;
      return {
        history: { ...prev, [dateKey]: {
          ...existingDay,
          prayers: { ...existingDay.prayers, [prayer]: { status: newStatus, timestamp: Date.now() } },
        } },
        deltas: { [prayer]: Number(newStatus === 'missed') - Number(previousStatus === 'missed') },
      };
    });
  }, [dateKey, commitHistory]);

  const toggleSunnah = useCallback((prayer: keyof PrayerSunnah, sunnahId: string) => {
    commitHistory(prev => {
      const existingDay = prev[dateKey] || { prayers: { ...defaultDailyPrayers }, sunnah: createDefaultSunnah() };
      return {
        history: { ...prev, [dateKey]: {
          ...existingDay,
          sunnah: { ...existingDay.sunnah, [prayer]: existingDay.sunnah[prayer].map(item =>
            item.id === sunnahId ? { ...item, completed: !item.completed } : item) },
        } },
        deltas: {},
      };
    });
  }, [dateKey, commitHistory]);

  const comboMultiplier = getComboMultiplier(combo);

  const getPoints = useCallback((prayer: keyof DailyPrayers) => {
    const status = prayers[prayer].status;
    
    let base = 0;
    if (status === 'jamaah') base = 25;
    else if (status === 'ontime') base = 15;
    else if (status === 'late') base = 5;
    
    return Math.round(base * comboMultiplier);
  }, [prayers, comboMultiplier]);

  const getTotalPoints = useCallback(() => {
    const prayerKeys: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    return prayerKeys.reduce((sum, prayer) => sum + getPoints(prayer), 0);
  }, [getPoints]);

  const getCompletedCount = useCallback(() => {
    const prayerKeys: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    return prayerKeys.filter(p => isPrayed(prayers[p].status)).length;
  }, [prayers]);

  return {
    prayers,
    streaks,
    sunnah,
    combo,
    comboMultiplier,
    selectedDate: currentDate,
    isToday,
    markPrayer,
    toggleSunnah,
    getPoints,
    getTotalPoints,
    getCompletedCount,
  };
}
