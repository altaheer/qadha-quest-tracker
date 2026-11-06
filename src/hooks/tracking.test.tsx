import { StrictMode, type ReactNode } from 'react';
import { renderHook, act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { usePrayerTracking } from './usePrayerTracking';
import { useQadhaPrayers } from './useQadhaPrayers';
import { useInsightsData } from './useInsightsData';
import { createDefaultSunnah, defaultDailyPrayers } from '@/lib/prayerData';
import { getDateString } from '@/lib/date';

beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 10, 6, 12)); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('synchronizes FAB and page, preserving alternating edits and rapid toggles', () => {
  const { result } = renderHook(() => [usePrayerTracking(), usePrayerTracking()]);
  act(() => result.current[0].markPrayer('fajr', 'ontime'));
  expect(result.current[1].prayers.fajr.status).toBe('ontime');
  act(() => result.current[1].markPrayer('dhuhr', 'jamaah'));
  expect(result.current[0].prayers.fajr.status).toBe('ontime');
  expect(result.current[0].prayers.dhuhr.status).toBe('jamaah');
  act(() => {
    result.current[0].markPrayer('asr', 'missed');
    result.current[0].markPrayer('asr', 'missed');
  });
  expect(result.current[1].prayers.asr.status).toBe('pending');
  expect(JSON.parse(localStorage.getItem('qadha-prayer-counts')!).asr).toBe(0);
});

it('counts overdue prayers once with multiple consumers and StrictMode', () => {
  localStorage.setItem('prayer-history', JSON.stringify({ '2026-11-05': {
    prayers: defaultDailyPrayers, sunnah: createDefaultSunnah(),
  } }));
  const { result } = renderHook(() => ({ a: usePrayerTracking(), b: usePrayerTracking(), q: useQadhaPrayers() }), {
    wrapper: ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>,
  });
  expect(result.current.q.totalPrayers).toBe(5);
  act(() => vi.advanceTimersByTime(120_000));
  expect(result.current.q.totalPrayers).toBe(5);
});

it('updates qadha page and dialog together without overwriting a goal', () => {
  const { result } = renderHook(() => [useQadhaPrayers(), useQadhaPrayers()]);
  act(() => result.current[0].setCount('fajr', 100));
  act(() => result.current[1].setDailyGoal(10));
  expect(result.current[1].counts.fajr).toBe(100);
  expect(result.current[0].dailyGoal).toBe(10);
  expect(result.current[0].calculateDaysToComplete()).toBe(10);
});

it('includes jamaah in statistics and reacts to changes while mounted', () => {
  const { result } = renderHook(() => ({ prayers: usePrayerTracking(), stats: useInsightsData() }));
  act(() => result.current.prayers.markPrayer('fajr', 'jamaah'));
  expect(result.current.stats.prayerBalance).toMatchObject({ total: 1, onTime: 1 });
  expect(result.current.stats.prayerPunctuality.fajr.onTimePercent).toBe(100);
  expect(result.current.stats.weeklyData.at(-1)?.points).toBeGreaterThan(0);
});

it('changes the default date after midnight while the app remains open', () => {
  vi.setSystemTime(new Date(2026, 10, 6, 23, 59, 50));
  const { result } = renderHook(usePrayerTracking);
  act(() => result.current.markPrayer('fajr', 'ontime'));
  act(() => vi.advanceTimersByTime(30_000));
  expect(getDateString(result.current.selectedDate)).toBe('2026-11-07');
  expect(result.current.prayers.fajr.status).toBe('pending');
});
