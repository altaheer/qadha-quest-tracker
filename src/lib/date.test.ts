import { describe, expect, it } from 'vitest';
import { getDateString } from './date';

describe('getDateString', () => {
  it('uses local date components, not UTC', () => {
    // 00:30 local time on 6 August. In any timezone east of Greenwich this
    // is still 5 August in UTC — toISOString().split('T')[0] would have
    // returned '2026-08-05' here, mislabelling the day.
    const localMidnightThirty = new Date(2026, 7, 6, 0, 30, 0);
    expect(getDateString(localMidnightThirty)).toBe('2026-08-06');
  });

  it('pads single-digit months and days', () => {
    expect(getDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('does not roll over near midnight the way UTC-based formatting would', () => {
    const justBeforeMidnight = new Date(2026, 7, 5, 23, 59, 0);
    const justAfterMidnight = new Date(2026, 7, 6, 0, 1, 0);
    expect(getDateString(justBeforeMidnight)).toBe('2026-08-05');
    expect(getDateString(justAfterMidnight)).toBe('2026-08-06');
  });
});
