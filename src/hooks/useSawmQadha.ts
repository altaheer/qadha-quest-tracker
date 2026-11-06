import { useCallback, useEffect, useState } from 'react';

const COUNT_KEY = 'sawm-qadha-count';
const GOAL_KEY = 'sawm-qadha-daily-goal';

function readCount(): number {
  try {
    const raw = localStorage.getItem(COUNT_KEY);
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function readGoal(): number {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (!raw) return 1;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 1;
  } catch {
    return 1;
  }
}

/** Fasting (sawm) qadha — parallel to prayer qadha, device-local only. */
export function useSawmQadha() {
  const [count, setCount] = useState<number>(readCount);
  const [dailyGoal, setDailyGoalState] = useState<number>(readGoal);

  useEffect(() => {
    try { localStorage.setItem(COUNT_KEY, String(count)); } catch { /* ignore */ }
  }, [count]);

  useEffect(() => {
    try { localStorage.setItem(GOAL_KEY, String(dailyGoal)); } catch { /* ignore */ }
  }, [dailyGoal]);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);
  const setCountAbsolute = useCallback((n: number) => setCount(Math.max(0, Math.floor(n))), []);
  const setDailyGoal = useCallback((n: number) => {
    setDailyGoalState(Math.max(0, Math.min(30, Math.floor(n))));
  }, []);
  const reset = useCallback(() => setCount(0), []);

  const daysToComplete = dailyGoal > 0 ? Math.ceil(count / dailyGoal) : Infinity;

  return {
    count,
    dailyGoal,
    increment,
    decrement,
    setCount: setCountAbsolute,
    setDailyGoal,
    reset,
    daysToComplete,
  };
}
