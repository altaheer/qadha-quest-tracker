import { z } from 'zod';
import { createDefaultSunnah, defaultDailyPrayers } from './prayerData';

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(+parsed) && parsed.getFullYear() === Number(value.slice(0, 4))
    && parsed.getMonth() + 1 === Number(value.slice(5, 7)) && parsed.getDate() === Number(value.slice(8, 10));
});
const status = z.enum(['pending', 'ontime', 'jamaah', 'late', 'missed']);
const prayer = z.object({ status, timestamp: count.optional() });
const prayerNames = z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
const prayers = z.record(prayerNames, prayer);
const sunnahItem = z.object({ id: z.string(), name: z.string(), arabicName: z.string(), completed: z.boolean() });
const booleanHistory = z.record(date, z.record(z.string(), z.boolean()));
const mission = z.object({
  id: z.string(), actionType: z.enum(['prayer', 'habit', 'nafilah']), actionId: z.string(),
  qualifier: z.enum(['ontime', 'jamaah']).optional(), days: count.positive(),
  missesAllowed: count.optional(), startDate: date, status: z.enum(['active', 'completed', 'ended']),
});
const schemas: Record<string, z.ZodType> = {
  'prayer-history': z.record(date, z.object({ prayers, sunnah: z.record(prayerNames, z.array(sunnahItem)) })),
  'prayer-streaks': z.partialRecord(prayerNames, z.object({ current: count, best: count })),
  'prayer-combo': count,
  'notifications-enabled': z.boolean(),
  'qadha-prayer-counts': z.partialRecord(prayerNames, count),
  'qadha-daily-goal': count,
  'qadha-history': z.array(z.object({ date, total: count })),
  'sawm-qadha-count': count,
  'sawm-qadha-daily-goal': count,
  'habits-tracking': booleanHistory,
  'habits-paused': z.array(z.string()),
  'timebound-habits': booleanHistory,
  'timebound-paused': z.array(z.string()),
  'nafilah-history': booleanHistory,
  'missions': z.array(mission),
  'missions-completed': z.array(mission.extend({ completedAt: z.string(), bonus: count })),
  'missions-ended': z.array(mission),
  'achievements-unlocked': z.record(z.string(), z.string()),
  'seen-tooltips': z.record(z.string(), z.boolean()),
  'app-prefs': z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(), showArabic: z.boolean().optional(),
    autoMarkMissed: z.boolean().optional(),
    autoMarkMissedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  }),
};
const plain: Record<string, readonly string[]> = {
  'habits-level': ['easy', 'medium', 'hard', 'sahabah', 'custom'],
  'app-language': ['en', 'sv', 'tr', 'ar'],
  'onboarding-complete': ['0', '1'],
  'achievements-initialized': ['0', '1'],
};

/** Never accept an unchecked string that will later crash a JSON.parse reader. */
export function validBackupEntry(key: string, raw: string) {
  if (plain[key]) return plain[key].includes(raw);
  try { return schemas[key]?.safeParse(JSON.parse(raw)).success === true; }
  catch { return false; }
}

/** v1 used bare status strings and sometimes omitted untracked prayers. */
export function migrateLegacyPrayers(raw: string): string {
  const legacy = z.record(date, z.partialRecord(prayerNames, status)).safeParse(JSON.parse(raw.replace(/"on-time"/g, '"ontime"')));
  if (!legacy.success) return raw;
  return JSON.stringify(Object.fromEntries(Object.entries(legacy.data).map(([key, values]) => [key, {
    prayers: { ...defaultDailyPrayers, ...Object.fromEntries(Object.entries(values).map(([p, s]) => [p, { status: s }])) },
    sunnah: createDefaultSunnah(),
  }])));
}
