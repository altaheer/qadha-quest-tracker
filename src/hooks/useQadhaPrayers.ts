import { useState, useEffect, useCallback } from 'react';
import { safeReadJSON } from '@/lib/storage';
import type { PrayerCounts } from '@/types';

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
  const [counts, setCounts] = useState<PrayerCounts>(() =>
    safeReadJSON(STORAGE_KEY, defaultCounts),
  );

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return isNaN(parsed) ? 5 : parsed;
  });

  // Listen for updates from usePrayerTracking
  useEffect(() => {
    const handleQadhaUpdate = () => {
      if (localStorage.getItem(STORAGE_KEY) === null) return;
      setCounts(safeReadJSON(STORAGE_KEY, defaultCounts));
    };

    window.addEventListener('qadha-updated', handleQadhaUpdate);
    return () => window.removeEventListener('qadha-updated', handleQadhaUpdate);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    localStorage.setItem(GOAL_STORAGE_KEY, dailyGoal.toString());
  }, [dailyGoal]);

  const increment = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => {
      const next = prev[prayer] + 1;
      return { ...prev, [prayer]: next };
    });
  }, []);

  const decrement = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => {
      const next = Math.max(0, prev[prayer] - 1);
      return { ...prev, [prayer]: next };
    });
  }, []);

  const setCount = useCallback((prayer: keyof PrayerCounts, count: number) => {
    setCounts(prev => {
      const next = Math.max(0, count);
      return { ...prev, [prayer]: next };
    });
  }, []);

  const reset = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => {
      return { ...prev, [prayer]: 0 };
    });
  }, []);

  const resetAll = useCallback(() => {
    setCounts(defaultCounts);
  }, []);

  const totalPrayers = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const calculateDaysToComplete = useCallback(() => {
    if (dailyGoal <= 0) return Infinity;
    return Math.ceil(totalPrayers / dailyGoal);
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
