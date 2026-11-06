import { describe, it, expect } from 'vitest';
import { calculateCombo, calculateDailyStreak, calculatePrayerStreaks, PRAYER_KEYS } from './prayerStats';
import { getDateString } from './date';
import { createDefaultSunnah } from './prayerData';
import type { DailyPrayers, PrayerStatus, PrayerHistory } from '@/types';

const day = (status: PrayerStatus) => ({
  prayers: Object.fromEntries(PRAYER_KEYS.map(p => [p, { status }])) as unknown as DailyPrayers,
  sunnah: createDefaultSunnah(),
});

describe('calendar-based streaks', () => {
  it('counts jamaah and preserves yesterday’s streak until today is marked', () => {
    const history = { '2026-11-05': day('jamaah') };
    expect(calculateDailyStreak(history, '2026-11-06')).toBe(1);
    expect(calculatePrayerStreaks(history, '2026-11-06').fajr.current).toBe(1);
  });
  it('breaks a combo at an unrecorded day or an internal pending prayer', () => {
    const history: PrayerHistory = { '2026-11-04': day('ontime'), '2026-11-06': day('ontime') };
    expect(calculateCombo(history, '2026-11-06')).toBe(5);
    history['2026-11-06'].prayers.maghrib.status = 'pending';
    expect(calculateCombo(history, '2026-11-06')).toBe(1);
    expect(calculatePrayerStreaks(history, '2026-11-06').fajr.best).toBe(1);
  });
  it('recomputes after corrections instead of inflating counters', () => {
    const history = { '2026-11-05': day('ontime'), '2026-11-06': day('jamaah') };
    expect(calculatePrayerStreaks(history, '2026-11-06').fajr.current).toBe(2);
    history['2026-11-06'].prayers.fajr.status = 'late';
    expect(calculatePrayerStreaks(history, '2026-11-06').fajr.current).toBe(0);
  });
  it('uses local calendar components for storage keys', () => {
    expect(getDateString(new Date(2026, 10, 6, 0, 15))).toBe('2026-11-06');
    expect(getDateString(new Date(2026, 10, 6, 23, 45))).toBe('2026-11-06');
  });
});
