import { describe, expect, it } from 'vitest';
import { estimateQadha, getQadhaStrings } from './qadhaEstimate';

describe('estimateQadha', () => {
  it('counts the full gap between accountability and praying consistently', () => {
    const result = estimateQadha({ bulughAge: 13, startedPrayingAge: 20, currentAge: 30 });

    expect(result.years).toBe(7);
    expect(result.perPrayer).toBe(7 * 365);
    expect(result.totalPrayers).toBe(7 * 365 * 5);
  });

  it('returns zero when praying began at or before accountability', () => {
    expect(estimateQadha({ bulughAge: 13, startedPrayingAge: 13, currentAge: 30 })).toMatchObject({
      years: 0,
      perPrayer: 0,
      totalPrayers: 0,
    });
    expect(estimateQadha({ bulughAge: 15, startedPrayingAge: 12, currentAge: 30 })).toMatchObject({
      years: 0,
      totalPrayers: 0,
    });
  });

  it('keeps totalPrayers equal to five times the per-prayer count', () => {
    for (const startedPrayingAge of [14, 17, 21, 29, 40]) {
      const { perPrayer, totalPrayers } = estimateQadha({
        bulughAge: 13,
        startedPrayingAge,
        currentAge: 45,
      });
      expect(totalPrayers).toBe(perPrayer * 5);
    }
  });

  it('handles fractional gaps by rounding to whole prayers', () => {
    const { perPrayer } = estimateQadha({
      bulughAge: 13,
      startedPrayingAge: 13.5,
      currentAge: 30,
    });

    expect(Number.isInteger(perPrayer)).toBe(true);
    expect(perPrayer).toBe(Math.round(0.5 * 365));
  });
});

describe('getQadhaStrings', () => {
  it('serves Turkish and Arabic their own copy', () => {
    expect(getQadhaStrings('tr').title).toBe('Tahmin etmeme yardım et');
    expect(getQadhaStrings('ar').title).toBe('ساعدني في التقدير');
  });

  it('falls back to English for Swedish and anything unrecognised', () => {
    const english = getQadhaStrings('en');
    expect(getQadhaStrings('sv')).toBe(english);
    expect(getQadhaStrings('xx')).toBe(english);
  });

  it('always includes the disclaimer that this is not a ruling', () => {
    for (const lang of ['en', 'sv', 'tr', 'ar']) {
      expect(getQadhaStrings(lang).disclaimer.length).toBeGreaterThan(0);
    }
  });
});
