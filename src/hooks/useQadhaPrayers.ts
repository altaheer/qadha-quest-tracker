import { useState, useEffect, useCallback } from 'react';

export interface PrayerCounts {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

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
  const [counts, setCounts] = useState<PrayerCounts>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultCounts;
  });

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 5;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    localStorage.setItem(GOAL_STORAGE_KEY, dailyGoal.toString());
  }, [dailyGoal]);

  const increment = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => ({ ...prev, [prayer]: prev[prayer] + 1 }));
  }, []);

  const decrement = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => ({ ...prev, [prayer]: Math.max(0, prev[prayer] - 1) }));
  }, []);

  const setCount = useCallback((prayer: keyof PrayerCounts, count: number) => {
    setCounts(prev => ({ ...prev, [prayer]: Math.max(0, count) }));
  }, []);

  const reset = useCallback((prayer: keyof PrayerCounts) => {
    setCounts(prev => ({ ...prev, [prayer]: 0 }));
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
