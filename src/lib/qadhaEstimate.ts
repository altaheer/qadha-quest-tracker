/**
 * Qadha estimation helper.
 *
 * Works out roughly how many prayers a person owes from two rough dates: when
 * they reached accountability (bulugh), and when they began praying regularly —
 * or today, if they are starting now.
 *
 * Dates rather than ages, because "March 2015" is something people can actually
 * recall, and because the "I have not started yet" case cannot be expressed as a
 * pair of ages at all.
 *
 * The full gap is counted. We deliberately do NOT subtract scattered prayers the
 * user may have prayed during the period: the safer position is to over-estimate
 * qadha rather than under-count, and the counters can always be adjusted down by
 * hand afterwards.
 *
 * Menstruation is the one deduction offered, because prayers missed during
 * menses are not made up at all — that is agreed across the madhhabs, unlike
 * fasts, which are. Excluding those days therefore gives the correct figure, not
 * a lenient one. It is off by default and the user opts in.
 *
 * This is an ESTIMATE, not a religious ruling. The UI shows a disclaimer.
 */

/** A rough point in time. `month` is 0–11, matching `Date`. */
export interface YearMonth {
  year: number;
  month: number;
}

export interface QadhaEstimateInput {
  /** When they reached accountability. */
  from: YearMonth;
  /** When they began praying regularly, or `'today'` if they are starting now. */
  to: YearMonth | 'today';
  /** Days per month to exclude for menstruation. Omitted or 0 applies nothing. */
  menstrualDaysPerMonth?: number;
}

export interface QadhaEstimateResult {
  /** Calendar days in the gap, before any deduction. */
  days: number;
  /** Days removed for menstruation. */
  excludedDays: number;
  /** Payable days — each contributes one Fajr, one Dhuhr, and so on. */
  perPrayer: number;
  /** perPrayer × 5. */
  totalPrayers: number;
}

const MS_PER_DAY = 86_400_000;

/** Mean length of a Gregorian month, used to turn a day span into months. */
const DAYS_PER_MONTH = 30.4375;

/**
 * A rough month is anchored to its middle rather than its first day, so neither
 * endpoint claims precision the answer does not have. Picking the 1st would bias
 * every estimate upward by half a month at each end.
 */
function anchor(point: YearMonth | 'today'): Date {
  if (point === 'today') return new Date();
  return new Date(point.year, point.month, 15);
}

export function estimateQadha(input: QadhaEstimateInput): QadhaEstimateResult {
  const { from, to, menstrualDaysPerMonth = 0 } = input;

  const spanMs = anchor(to).getTime() - anchor(from).getTime();
  const days = Math.max(0, Math.round(spanMs / MS_PER_DAY));

  // Clamped so an implausible days-per-month can never drive the count negative.
  const excludedDays = Math.min(
    days,
    Math.round((days / DAYS_PER_MONTH) * Math.max(0, menstrualDaysPerMonth)),
  );

  const perPrayer = days - excludedDays;

  return {
    days,
    excludedDays,
    perPrayer,
    totalPrayers: perPrayer * 5,
  };
}

/**
 * Days needed to clear a qadha backlog at a steady daily pace.
 * Used by the Qadha page "at this pace" estimate so the UI can stay in sync
 * with goal / count changes.
 */
export function daysToClearDebt(totalPrayers: number, dailyGoal: number): number {
  if (dailyGoal <= 0 || totalPrayers <= 0) return Infinity;
  return Math.ceil(totalPrayers / dailyGoal);
}

