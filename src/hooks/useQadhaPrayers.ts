import { useCallback } from 'react';
import { useStoredState } from '@/lib/localStore';
import type { PrayerCounts } from '@/types';
import { daysToClearDebt } from '@/lib/qadhaEstimate';

export type { PrayerCounts };

const STORAGE_KEY = 'qadha-prayer-counts';
const GOAL_STORAGE_KEY = 'qadha-daily-goal';

const defaultCounts: PrayerCounts = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export function useQadhaPrayers() {
  const [storedCounts, setCounts] = useStoredState<PrayerCounts>(STORAGE_KEY, defaultCounts);
  const counts = { ...defaultCounts, ...storedCounts };
  const [dailyGoal, setDailyGoal] = useStoredState<number>(GOAL_STORAGE_KEY, 5);

  const increment = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => {
      const next = (prev[prayer] || 0) + 1;
      return { ...prev, [prayer]: next };
    });
  }, [setCounts]);

  const decrement = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => {
      const next = Math.max(0, (prev[prayer] || 0) - 1);
      return { ...prev, [prayer]: next };
    });
  }, [setCounts]);

  const setCount = useCallback((prayer: keyof PrayerCounts, count: number) => {
    setCounts(prev => {
      const next = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
      return { ...prev, [prayer]: next };
    });
  }, [setCounts]);

  const reset = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => {
      return { ...prev, [prayer]: 0 };
    });
  }, [setCounts]);

  const resetAll = useCallback(() => {
    setCounts(defaultCounts);
  }, [setCounts]);

  const totalPrayers = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const calculateDaysToComplete = useCallback(() => {
    return daysToClearDebt(totalPrayers, dailyGoal);
  }, [totalPrayers, dailyGoal]);

  return {
    counts,
    dailyGoal,
    setDailyGoal,
    increment,
    decrement,
    setCount,
    reset,
    resetAll,
    totalPrayers,
    calculateDaysToComplete,
  };
}
