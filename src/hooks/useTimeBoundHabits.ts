import { useState, useEffect, useCallback } from 'react';
import { getDateString } from '@/lib/date';
import {
  gregorianToHijri,
  daysUntilHijriDate,
  hijriMonths,
  type HijriDate,
} from '@/lib/hijri';
import type { TimeBoundEvent } from '@/types';

export type { TimeBoundEvent };

interface TimeBoundState {
  completed: Set<string>;
  paused: Set<string>;
}

const TIMEBOUND_KEY = 'timebound-habits';
const TIMEBOUND_PAUSED_KEY = 'timebound-paused';

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
    points: 4,
    isActive: isFriday,
    daysUntil: isFriday ? 0 : daysToFriday,
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
    points: 12,
    isActive: isMonday,
    daysUntil: isMonday ? 0 : daysToMonday,
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
    points: 12,
    isActive: isThursday,
    daysUntil: isThursday ? 0 : daysToThursday,
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
    points: 12,
    isActive: isAyyamAlBeed,
    daysUntil: isAyyamAlBeed ? 0 : daysToAyyamAlBeed,
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
    points: 5,
    isActive: isEidFitr,
    daysUntil: isEidFitr ? 0 : daysToEidFitr,
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
    points: 5,
    isActive: isEidAdha,
    daysUntil: isEidAdha ? 0 : daysToEidAdha,
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
