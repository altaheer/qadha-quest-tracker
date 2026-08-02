/**
 * Centralized domain types shared across hooks and components.
 */

// ============ Prayer ============
export type PrayerStatus = 'pending' | 'ontime' | 'jamaah' | 'late' | 'missed';

export interface PrayerEntry {
  status: PrayerStatus;
  timestamp?: number;
}

export interface DailyPrayers {
  fajr: PrayerEntry;
  dhuhr: PrayerEntry;
  asr: PrayerEntry;
  maghrib: PrayerEntry;
  isha: PrayerEntry;
}

export interface PrayerStreak {
  current: number;
  best: number;
}

export interface PrayerStreaks {
  fajr: PrayerStreak;
  dhuhr: PrayerStreak;
  asr: PrayerStreak;
  maghrib: PrayerStreak;
  isha: PrayerStreak;
}

export interface SunnahItem {
  id: string;
  name: string;
  arabicName: string;
  completed: boolean;
}

export interface PrayerSunnah {
  fajr: SunnahItem[];
  dhuhr: SunnahItem[];
  asr: SunnahItem[];
  maghrib: SunnahItem[];
  isha: SunnahItem[];
}

export interface PrayerHistory {
  [date: string]: {
    prayers: DailyPrayers;
    sunnah: PrayerSunnah;
  };
}

// ============ Qadha ============
export interface PrayerCounts {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

// ============ Habits ============
export interface Habit {
  id: string;
  name: string;
  arabicName?: string;
  points: number;
  category: string;
}

export interface HabitCategory {
  id: string;
  name: string;
  icon: string;
  habits: Habit[];
}

export interface HabitState {
  completed: boolean;
  paused: boolean;
}

export interface DailyHabits {
  [habitId: string]: HabitState;
}

export interface HabitsHistory {
  [date: string]: {
    [habitId: string]: boolean;
  };
}

export type HabitLevel = 'easy' | 'medium' | 'hard' | 'sahabah' | 'custom';

// ============ Nafilah ============
export type NafilahDifficulty = 'hard' | 'medium' | 'easy';

export interface NafilahPrayer {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  difficulty: NafilahDifficulty;
  points: number;
  rakaat: string;
  completed: boolean;
}

export interface DailyNafilah {
  [date: string]: { [prayerId: string]: boolean };
}

// ============ Time-bound events ============
export interface TimeBoundEvent {
  id: string;
  name: string;
  arabicName: string;
  type: 'weekly' | 'monthly' | 'yearly';
  description: string;
  points: number;
  isActive: boolean;
  daysUntil: number | null;
  hijriDate?: string;
}
