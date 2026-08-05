import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrayerTracking } from './usePrayerTracking';
import { getDateString } from '@/lib/date';

const QADHA_KEY = 'qadha-prayer-counts';
const HISTORY_KEY = 'prayer-history';

const emptyPrayers = () => ({
  fajr: { status: 'pending' },
  dhuhr: { status: 'pending' },
  asr: { status: 'pending' },
  maghrib: { status: 'pending' },
  isha: { status: 'pending' },
});

describe('usePrayerTracking', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adjusts qadha exactly once per mark, and reverts it on unmark', () => {
    const { result, unmount } = renderHook(() => usePrayerTracking());

    act(() => result.current.markPrayer('fajr', 'missed'));
    expect(JSON.parse(localStorage.getItem(QADHA_KEY)!).fajr).toBe(1);

    // Clicking the same status again toggles back to pending.
    act(() => result.current.markPrayer('fajr', 'missed'));
    expect(JSON.parse(localStorage.getItem(QADHA_KEY)!).fajr).toBe(0);

    unmount();
  });

  it('only sweeps days whose cutoff has actually passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 12, 0, 0)); // noon, 10 Aug 2026

    const closedDayKey = '2026-08-08'; // cutoff (00:00 on the 9th) is in the past
    const openDayKey = '2026-08-10'; // today — cutoff (00:00 on the 11th) has not arrived

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        [closedDayKey]: { prayers: emptyPrayers(), sunnah: {} },
        [openDayKey]: { prayers: emptyPrayers(), sunnah: {} },
      }),
    );

    const { unmount } = renderHook(() => usePrayerTracking());

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)!);
    expect(history[closedDayKey].prayers.fajr.status).toBe('missed');
    expect(history[openDayKey].prayers.fajr.status).toBe('pending');

    const qadha = JSON.parse(localStorage.getItem(QADHA_KEY)!);
    expect(qadha.fajr).toBe(1);

    unmount();
  });

  it('files a prayer marked just after local midnight under today, not yesterday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 6, 0, 30, 0)); // 00:30 local, 6 Aug 2026

    const { result, unmount } = renderHook(() => usePrayerTracking());
    act(() => result.current.markPrayer('fajr', 'ontime'));

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)!);
    expect(Object.keys(history)).toEqual([getDateString(new Date())]);
    expect(history['2026-08-06']).toBeDefined();
    expect(history['2026-08-05']).toBeUndefined();

    unmount();
  });
});
