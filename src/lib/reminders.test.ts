import { it, expect } from 'vitest';
import { reminderPlan } from './reminders';
import { defaultDailyPrayers, createDefaultSunnah } from './prayerData';
import type { PrayerHistory } from '@/types';

it('assigns an after-midnight reminder to the previous prayer day', () => {
  const plan = reminderPlan({}, '04:00', new Date(2026, 10, 6, 2));
  expect(plan[0].day).toBe('2026-11-05');
  expect(plan[0].at.getDate()).toBe(6);
  expect(plan[0].at.getHours()).toBe(3);
  expect(plan[0].at.getMinutes()).toBe(30);
});

it('cancels the reminder for a fully recorded day and keeps future days', () => {
  const history: PrayerHistory = { '2026-11-06': {
    prayers: Object.fromEntries(Object.keys(defaultDailyPrayers).map(p => [p, { status: 'ontime' }])) as unknown as typeof defaultDailyPrayers,
    sunnah: createDefaultSunnah(),
  } };
  const plan = reminderPlan(history, '00:00', new Date(2026, 10, 6, 12));
  expect(plan.some(item => item.day === '2026-11-06')).toBe(false);
  expect(plan.length).toBeGreaterThan(20);
  expect(new Set(plan.map(item => item.id)).size).toBe(plan.length);
});
