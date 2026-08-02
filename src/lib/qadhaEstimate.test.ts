import { describe, expect, it } from 'vitest';
import { estimateQadha } from './qadhaEstimate';

/** Both endpoints anchor to the 15th, so spans are whole months apart. */
const MARCH_2015 = { year: 2015, month: 2 };
const JUNE_2019 = { year: 2019, month: 5 };

describe('estimateQadha', () => {
  it('counts every day between accountability and praying regularly', () => {
    const result = estimateQadha({ from: MARCH_2015, to: JUNE_2019 });

    // 15 Mar 2015 → 15 Jun 2019 inclusive of one leap day (2016).
    expect(result.days).toBe(1553);
    expect(result.perPrayer).toBe(1553);
    expect(result.totalPrayers).toBe(1553 * 5);
    expect(result.excludedDays).toBe(0);
  });

  it('measures up to today when praying has not started yet', () => {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const result = estimateQadha({
      from: { year: fiveYearsAgo.getFullYear(), month: fiveYearsAgo.getMonth() },
      to: 'today',
    });

    // Anchoring to the 15th puts the answer within half a month of five years.
    expect(result.days).toBeGreaterThan(5 * 365 - 20);
    expect(result.days).toBeLessThan(5 * 365 + 20);
  });

  it('returns zero when praying began at or before accountability', () => {
    expect(estimateQadha({ from: JUNE_2019, to: JUNE_2019 })).toMatchObject({
      days: 0,
      perPrayer: 0,
      totalPrayers: 0,
    });
    expect(estimateQadha({ from: JUNE_2019, to: MARCH_2015 })).toMatchObject({
      days: 0,
      totalPrayers: 0,
    });
  });

  it('leaves out menstrual days when asked, and not otherwise', () => {
    const plain = estimateQadha({ from: MARCH_2015, to: JUNE_2019 });
    const deducted = estimateQadha({
      from: MARCH_2015,
      to: JUNE_2019,
      menstrualDaysPerMonth: 7,
    });

    expect(deducted.days).toBe(plain.days);
    expect(deducted.excludedDays).toBe(Math.round((1553 / 30.4375) * 7));
    expect(deducted.perPrayer).toBe(plain.perPrayer - deducted.excludedDays);
    // Roughly seven days in every thirty — a bit under a quarter.
    expect(deducted.perPrayer / plain.perPrayer).toBeCloseTo(0.77, 1);
  });

  it('treats an omitted or zero deduction the same as none', () => {
    const none = estimateQadha({ from: MARCH_2015, to: JUNE_2019 });
    const zero = estimateQadha({ from: MARCH_2015, to: JUNE_2019, menstrualDaysPerMonth: 0 });

    expect(zero).toEqual(none);
  });

  it('never lets a deduction drive the count below zero', () => {
    const result = estimateQadha({
      from: MARCH_2015,
      to: JUNE_2019,
      menstrualDaysPerMonth: 999,
    });

    expect(result.perPrayer).toBe(0);
    expect(result.totalPrayers).toBe(0);
    expect(result.excludedDays).toBe(result.days);
  });

  it('keeps totalPrayers equal to five times the per-prayer count', () => {
    for (const month of [0, 3, 7, 11]) {
      const { perPrayer, totalPrayers } = estimateQadha({
        from: { year: 2010, month },
        to: JUNE_2019,
        menstrualDaysPerMonth: month,
      });
      expect(totalPrayers).toBe(perPrayer * 5);
    }
  });
});
