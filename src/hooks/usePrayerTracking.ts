import { useState, useEffect, useCallback } from 'react';

export type PrayerStatus = 'pending' | 'on-time' | 'jamaah' | 'late' | 'missed';

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
  multiplier: number;
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

const HISTORY_KEY = 'prayer-history';
const STREAKS_KEY = 'prayer-streaks';
const QADHA_KEY = 'qadha-prayer-counts';

const defaultPrayerEntry: PrayerEntry = { status: 'pending' };

const defaultDailyPrayers: DailyPrayers = {
  fajr: { ...defaultPrayerEntry },
  dhuhr: { ...defaultPrayerEntry },
  asr: { ...defaultPrayerEntry },
  maghrib: { ...defaultPrayerEntry },
  isha: { ...defaultPrayerEntry },
};

const defaultStreak: PrayerStreak = { current: 0, best: 0, multiplier: 1 };

const defaultStreaks: PrayerStreaks = {
  fajr: { ...defaultStreak },
  dhuhr: { ...defaultStreak },
  asr: { ...defaultStreak },
  maghrib: { ...defaultStreak },
  isha: { ...defaultStreak },
};

const createDefaultSunnah = (): PrayerSunnah => ({
  fajr: [
    { id: 'fajr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'fajr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'fajr-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتا الفجر', completed: false },
    { id: 'fajr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  dhuhr: [
    { id: 'dhuhr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'dhuhr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'dhuhr-sunnah-before', name: '4 Rak\'at before', arabicName: 'أربع ركعات قبلية', completed: false },
    { id: 'dhuhr-sunnah-after', name: '2 Rak\'at after', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'dhuhr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  asr: [
    { id: 'asr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'asr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'asr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
    { id: 'asr-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
  ],
  maghrib: [
    { id: 'maghrib-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'maghrib-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'maghrib-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'maghrib-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
    { id: 'maghrib-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
  ],
  isha: [
    { id: 'isha-siwak', name: 'Siwāk', arabicName: 'السواک', completed: false },
    { id: 'isha-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'isha-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'isha-witr', name: 'Witr prayer', arabicName: 'صلاة الوتر', completed: false },
    { id: 'isha-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
    { id: 'isha-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
  ],
});

const getDateString = (date: Date) => date.toISOString().split('T')[0];

export function usePrayerTracking(selectedDate?: Date) {
  const today = new Date();
  const currentDate = selectedDate || today;
  const dateKey = getDateString(currentDate);
  const isToday = dateKey === getDateString(today);

  const [history, setHistory] = useState<PrayerHistory>(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [streaks, setStreaks] = useState<PrayerStreaks>(() => {
    const stored = localStorage.getItem(STREAKS_KEY);
    return stored ? JSON.parse(stored) : defaultStreaks;
  });

  // Get or create prayers for the selected date
  const prayers = history[dateKey]?.prayers || defaultDailyPrayers;
  const sunnah = history[dateKey]?.sunnah || createDefaultSunnah();

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STREAKS_KEY, JSON.stringify(streaks));
  }, [streaks]);

  // Helper to update Qadha counts
  const updateQadhaCount = useCallback((prayer: keyof DailyPrayers, delta: number) => {
    const stored = localStorage.getItem(QADHA_KEY);
    const qadhaCounts = stored ? JSON.parse(stored) : { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    qadhaCounts[prayer] = Math.max(0, qadhaCounts[prayer] + delta);
    localStorage.setItem(QADHA_KEY, JSON.stringify(qadhaCounts));
    // Dispatch event to notify useQadhaPrayers hook
    window.dispatchEvent(new Event('qadha-updated'));
  }, []);

  const markPrayer = useCallback((prayer: keyof DailyPrayers, status: PrayerStatus) => {
    const previousStatus = history[dateKey]?.prayers?.[prayer]?.status || 'pending';
    
    setHistory(prev => {
      const existingDay = prev[dateKey] || { prayers: { ...defaultDailyPrayers }, sunnah: createDefaultSunnah() };
      return {
        ...prev,
        [dateKey]: {
          ...existingDay,
          prayers: {
            ...existingDay.prayers,
            [prayer]: { status, timestamp: Date.now() }
          }
        }
      };
    });

    // Handle Qadha auto-add/remove
    if (status === 'missed' && previousStatus !== 'missed') {
      // Add to Qadha when marked as missed
      updateQadhaCount(prayer, 1);
    } else if (previousStatus === 'missed' && status !== 'missed') {
      // Remove from Qadha if changing from missed to something else
      updateQadhaCount(prayer, -1);
    }

    // Update streaks only for today's prayers
    if (isToday) {
      if (status === 'on-time' || status === 'jamaah') {
        setStreaks(prev => {
          const current = prev[prayer].current + 1;
          const multiplier = Math.floor(current / 50) + 1;
          return {
            ...prev,
            [prayer]: {
              current,
              best: Math.max(current, prev[prayer].best),
              multiplier,
            }
          };
        });
      } else if (status === 'missed') {
        setStreaks(prev => ({
          ...prev,
          [prayer]: {
            ...prev[prayer],
            current: 0,
            multiplier: 1,
          }
        }));
      }
    }
  }, [dateKey, history, isToday, updateQadhaCount]);

  const toggleSunnah = useCallback((prayer: keyof PrayerSunnah, sunnahId: string) => {
    setHistory(prev => {
      const existingDay = prev[dateKey] || { prayers: { ...defaultDailyPrayers }, sunnah: createDefaultSunnah() };
      return {
        ...prev,
        [dateKey]: {
          ...existingDay,
          sunnah: {
            ...existingDay.sunnah,
            [prayer]: existingDay.sunnah[prayer].map(item =>
              item.id === sunnahId ? { ...item, completed: !item.completed } : item
            )
          }
        }
      };
    });
  }, [dateKey]);

  const getPoints = useCallback((prayer: keyof DailyPrayers) => {
    const status = prayers[prayer].status;
    const multiplier = streaks[prayer].multiplier;
    
    if (status === 'jamaah') return 27 * multiplier;
    if (status === 'on-time') return 10 * multiplier;
    if (status === 'late') return 6 * multiplier;
    return 0;
  }, [prayers, streaks]);

  const getTotalPoints = useCallback(() => {
    const prayerKeys: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    return prayerKeys.reduce((sum, prayer) => sum + getPoints(prayer), 0);
  }, [getPoints]);

  const getCompletedCount = useCallback(() => {
    const prayerKeys: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    return prayerKeys.filter(p => prayers[p].status !== 'pending').length;
  }, [prayers]);

  return {
    prayers,
    streaks,
    sunnah,
    selectedDate: currentDate,
    isToday,
    markPrayer,
    toggleSunnah,
    getPoints,
    getTotalPoints,
    getCompletedCount,
  };
}
