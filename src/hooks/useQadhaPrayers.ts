import { useState, useEffect, useCallback } from 'react';
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
  const [counts, setCounts] = useState<PrayerCounts>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultCounts;
  });

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 5;
  });

  // Keep multiple hook instances (page + setup dialog) and other writers in sync.
  useEffect(() => {
    const handleQadhaUpdate = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      setCounts((prev) => {
        try {
          if (JSON.stringify(prev) === stored) return prev;
          return JSON.parse(stored) as PrayerCounts;
        } catch {
          return prev;
        }
      });
      const goalStored = localStorage.getItem(GOAL_STORAGE_KEY);
      if (goalStored !== null) {
        const n = parseInt(goalStored, 10);
        if (!Number.isNaN(n)) {
          setDailyGoal((prev) => (prev === n ? prev : n));
        }
      }
    };

    window.addEventListener('qadha-updated', handleQadhaUpdate);
    return () => window.removeEventListener('qadha-updated', handleQadhaUpdate);
  }, []);

  useEffect(() => {
    const serialized = JSON.stringify(counts);
    if (localStorage.getItem(STORAGE_KEY) !== serialized) {
      localStorage.setItem(STORAGE_KEY, serialized);
      window.dispatchEvent(new Event('qadha-updated'));
    }
  }, [counts]);

  useEffect(() => {
    const serialized = dailyGoal.toString();
    if (localStorage.getItem(GOAL_STORAGE_KEY) !== serialized) {
      localStorage.setItem(GOAL_STORAGE_KEY, serialized);
      window.dispatchEvent(new Event('qadha-updated'));
    }
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
