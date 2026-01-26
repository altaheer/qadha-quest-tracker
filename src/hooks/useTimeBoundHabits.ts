import { useState, useEffect, useCallback } from 'react';

interface HijriDate {
  day: number;
  month: number;
  year: number;
}

interface TimeBoundEvent {
  id: string;
  name: string;
  arabicName: string;
  type: 'weekly' | 'monthly' | 'yearly';
  description: string;
  points: number;
  isActive: boolean;
  daysUntil: number | null;
  nextDate: string | null; // Formatted date string
  hijriDate?: string; // For yearly events
}

interface TimeBoundState {
  completed: Set<string>;
  paused: Set<string>;
}

const TIMEBOUND_KEY = 'timebound-habits';
const TIMEBOUND_PAUSED_KEY = 'timebound-paused';

// Hijri month names
const hijriMonths = [
  { en: 'Muharram', ar: 'محرم' },
  { en: 'Safar', ar: 'صفر' },
  { en: "Rabi' al-Awwal", ar: 'ربيع الأول' },
  { en: "Rabi' al-Thani", ar: 'ربيع الثاني' },
  { en: 'Jumada al-Awwal', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Thani', ar: 'جمادى الثانية' },
  { en: 'Rajab', ar: 'رجب' },
  { en: "Sha'ban", ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوال' },
  { en: "Dhu al-Qi'dah", ar: 'ذو القعدة' },
  { en: 'Dhu al-Hijjah', ar: 'ذو الحجة' },
];

// Convert Gregorian to Hijri
function gregorianToHijri(date: Date): HijriDate {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();

  const a = Math.floor((14 - gregorianMonth) / 12);
  const y = gregorianYear + 4800 - a;
  const m = gregorianMonth + 12 * a - 3;
  const jdn = gregorianDay + Math.floor((153 * m + 2) / 5) + 365 * y + 
              Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
            Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const adjustedRemainder = remainder - Math.floor((30 - j) / 15) * 
                           Math.floor((17719 * j) / 50) - Math.floor(j / 16) * 
                           Math.floor((15238 * j) / 43) + 29;
  const hijriMonth = Math.floor((24 * adjustedRemainder) / 709);
  const hijriDay = adjustedRemainder - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return { day: hijriDay, month: hijriMonth, year: hijriYear };
}

// Calculate days until next occurrence of a Hijri date
function daysUntilHijriDate(targetMonth: number, targetDay: number, currentHijri: HijriDate): number {
  // Simple approximation - each Hijri month is ~29.5 days
  const currentDayOfYear = (currentHijri.month - 1) * 29.5 + currentHijri.day;
  const targetDayOfYear = (targetMonth - 1) * 29.5 + targetDay;
  
  let diff = targetDayOfYear - currentDayOfYear;
  if (diff < 0) {
    diff += 354; // Add a Hijri year
  }
  
  return Math.round(diff);
}

// Get day of week (0 = Sunday, 5 = Friday)
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

// Calculate next occurrence of a weekday
function daysUntilWeekday(targetDay: number, currentDate: Date): number {
  const currentDay = currentDate.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  return diff;
}

const getDateString = (date: Date) => date.toISOString().split('T')[0];

export function useTimeBoundHabits(selectedDate?: Date) {
  const today = new Date();
  const currentDate = selectedDate || today;
  const dateKey = getDateString(currentDate);
  
  const hijriDate = gregorianToHijri(currentDate);
  const dayOfWeek = getDayOfWeek(currentDate);

  // Completion history
  const [history, setHistory] = useState<Record<string, Record<string, boolean>>>(() => {
    const stored = localStorage.getItem(TIMEBOUND_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Paused events
  const [pausedEvents, setPausedEvents] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(TIMEBOUND_PAUSED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Persist history
  useEffect(() => {
    localStorage.setItem(TIMEBOUND_KEY, JSON.stringify(history));
  }, [history]);

  // Persist paused
  useEffect(() => {
    localStorage.setItem(TIMEBOUND_PAUSED_KEY, JSON.stringify(Array.from(pausedEvents)));
  }, [pausedEvents]);

  // Get today's completions
  const completedEvents = new Set(
    Object.entries(history[dateKey] || {})
      .filter(([_, completed]) => completed)
      .map(([id]) => id)
  );

  // Toggle completion
  const toggleEvent = useCallback((eventId: string) => {
    setHistory(prev => {
      const dayData = prev[dateKey] || {};
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [eventId]: !dayData[eventId]
        }
      };
    });
  }, [dateKey]);

  // Toggle pause
  const togglePause = useCallback((eventId: string) => {
    setPausedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  // Build the events list
  const events: TimeBoundEvent[] = [];

  // === WEEKLY EVENTS ===
  
  // Jumu'ah (Friday)
  const isFriday = dayOfWeek === 5;
  const daysToFriday = daysUntilWeekday(5, currentDate);
  events.push({
    id: 'jumuah',
    name: "Jumu'ah (Fredagsbön)",
    arabicName: 'صلاة الجمعة',
    type: 'weekly',
    description: 'Veckans viktigaste bön som ersätter Dhuhr på fredagar',
    points: 10,
    isActive: isFriday,
    daysUntil: isFriday ? 0 : daysToFriday,
    nextDate: isFriday ? 'Idag!' : `om ${daysToFriday} dagar`,
  });

  // Fasta måndag
  const isMonday = dayOfWeek === 1;
  const daysToMonday = daysUntilWeekday(1, currentDate);
  events.push({
    id: 'fast-monday',
    name: 'Fasta (måndag)',
    arabicName: 'صيام الإثنين',
    type: 'weekly',
    description: 'Sunnah-fasta som profeten ﷺ utförde regelbundet',
    points: 8,
    isActive: isMonday,
    daysUntil: isMonday ? 0 : daysToMonday,
    nextDate: isMonday ? 'Idag!' : `om ${daysToMonday} dagar`,
  });

  // Fasta torsdag
  const isThursday = dayOfWeek === 4;
  const daysToThursday = daysUntilWeekday(4, currentDate);
  events.push({
    id: 'fast-thursday',
    name: 'Fasta (torsdag)',
    arabicName: 'صيام الخميس',
    type: 'weekly',
    description: 'Sunnah-fasta som profeten ﷺ utförde regelbundet',
    points: 8,
    isActive: isThursday,
    daysUntil: isThursday ? 0 : daysToThursday,
    nextDate: isThursday ? 'Idag!' : `om ${daysToThursday} dagar`,
  });

  // === MONTHLY EVENTS (Ayyam al-Beed) ===
  
  const isAyyamAlBeed = hijriDate.day >= 13 && hijriDate.day <= 15;
  let daysToAyyamAlBeed = 0;
  if (hijriDate.day < 13) {
    daysToAyyamAlBeed = 13 - hijriDate.day;
  } else if (hijriDate.day > 15) {
    daysToAyyamAlBeed = (30 - hijriDate.day) + 13; // Approximate
  }
  
  events.push({
    id: 'ayyam-al-beed',
    name: 'Ayyām al-Bīḍ (Vita dagarna)',
    arabicName: 'أيام البيض',
    type: 'monthly',
    description: 'Fasta den 13:e, 14:e och 15:e i varje Hijri-månad',
    points: 8,
    isActive: isAyyamAlBeed,
    daysUntil: isAyyamAlBeed ? 0 : daysToAyyamAlBeed,
    nextDate: isAyyamAlBeed 
      ? `Idag! (${hijriDate.day} ${hijriMonths[hijriDate.month - 1]?.ar})`
      : `om ${daysToAyyamAlBeed} dagar`,
    hijriDate: `13-15 ${hijriMonths[hijriDate.month - 1]?.ar || ''}`,
  });

  // === YEARLY EVENTS ===

  // Ramadan (month 9)
  const isRamadan = hijriDate.month === 9;
  const daysToRamadan = daysUntilHijriDate(9, 1, hijriDate);
  events.push({
    id: 'ramadan',
    name: 'Ramadan (Fastan)',
    arabicName: 'رمضان',
    type: 'yearly',
    description: 'Obligatorisk fasta från gryning till solnedgång',
    points: 20,
    isActive: isRamadan,
    daysUntil: isRamadan ? 0 : daysToRamadan,
    nextDate: isRamadan 
      ? `Pågår! (dag ${hijriDate.day})` 
      : `om ${daysToRamadan} dagar`,
    hijriDate: '1-29/30 Ramadan',
  });

  // Eid al-Fitr (1 Shawwal)
  const isEidFitr = hijriDate.month === 10 && hijriDate.day === 1;
  const daysToEidFitr = daysUntilHijriDate(10, 1, hijriDate);
  events.push({
    id: 'eid-fitr',
    name: 'Eid al-Fitr',
    arabicName: 'عيد الفطر',
    type: 'yearly',
    description: 'Högtiden som avslutar Ramadan',
    points: 15,
    isActive: isEidFitr,
    daysUntil: isEidFitr ? 0 : daysToEidFitr,
    nextDate: isEidFitr ? 'Idag!' : `om ${daysToEidFitr} dagar`,
    hijriDate: '1 Shawwāl',
  });

  // Arafah (9 Dhul-Hijjah)
  const isArafah = hijriDate.month === 12 && hijriDate.day === 9;
  const daysToArafah = daysUntilHijriDate(12, 9, hijriDate);
  events.push({
    id: 'arafah',
    name: 'Arafah-dagen (Fasta)',
    arabicName: 'يوم عرفة',
    type: 'yearly',
    description: 'Rekommenderad fasta för de som inte är på Hajj',
    points: 15,
    isActive: isArafah,
    daysUntil: isArafah ? 0 : daysToArafah,
    nextDate: isArafah ? 'Idag!' : `om ${daysToArafah} dagar`,
    hijriDate: '9 Dhul-Ḥijjah',
  });

  // Eid al-Adha (10 Dhul-Hijjah)
  const isEidAdha = hijriDate.month === 12 && hijriDate.day === 10;
  const daysToEidAdha = daysUntilHijriDate(12, 10, hijriDate);
  events.push({
    id: 'eid-adha',
    name: 'Eid al-Adha',
    arabicName: 'عيد الأضحى',
    type: 'yearly',
    description: 'Offerhögtiden till minne av Ibrahim (as)',
    points: 15,
    isActive: isEidAdha,
    daysUntil: isEidAdha ? 0 : daysToEidAdha,
    nextDate: isEidAdha ? 'Idag!' : `om ${daysToEidAdha} dagar`,
    hijriDate: '10 Dhul-Ḥijjah',
  });

  // Ashura (10 Muharram)
  const isAshura = hijriDate.month === 1 && hijriDate.day === 10;
  const daysToAshura = daysUntilHijriDate(1, 10, hijriDate);
  events.push({
    id: 'ashura',
    name: 'Ashura (Fasta)',
    arabicName: 'عاشوراء',
    type: 'yearly',
    description: 'Fasta till minne av Musa (as) räddning',
    points: 10,
    isActive: isAshura,
    daysUntil: isAshura ? 0 : daysToAshura,
    nextDate: isAshura ? 'Idag!' : `om ${daysToAshura} dagar`,
    hijriDate: '10 Muḥarram',
  });

  // Calculate points
  const getTotalPoints = useCallback(() => {
    let total = 0;
    events.forEach(event => {
      if (completedEvents.has(event.id) && !pausedEvents.has(event.id) && event.isActive) {
        total += event.points;
      }
    });
    return total;
  }, [completedEvents, pausedEvents, events]);

  // Get active events that are relevant today
  const getActiveEvents = useCallback(() => {
    return events.filter(e => e.isActive && !pausedEvents.has(e.id));
  }, [events, pausedEvents]);

  // Get completed count (only active, non-paused)
  const getCompletedCount = useCallback(() => {
    return events.filter(e => 
      completedEvents.has(e.id) && e.isActive && !pausedEvents.has(e.id)
    ).length;
  }, [completedEvents, pausedEvents, events]);

  return {
    events,
    completedEvents,
    pausedEvents,
    toggleEvent,
    togglePause,
    getTotalPoints,
    getActiveEvents,
    getCompletedCount,
    hijriDate,
    hijriMonthName: hijriMonths[hijriDate.month - 1],
  };
}
