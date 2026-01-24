import { useState, useEffect, useCallback } from 'react';

export type PrayerStatus = 'pending' | 'on-time' | 'late' | 'missed';

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

const STORAGE_KEY = 'daily-prayers';
const STREAKS_KEY = 'prayer-streaks';
const SUNNAH_KEY = 'prayer-sunnah';
const DATE_KEY = 'prayer-date';

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
    { id: 'isha-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'isha-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'isha-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'isha-witr', name: 'Witr prayer', arabicName: 'صلاة الوتر', completed: false },
    { id: 'isha-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
    { id: 'isha-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
  ],
});

const getTodayString = () => new Date().toISOString().split('T')[0];

export function usePrayerTracking() {
  const [prayers, setPrayers] = useState<DailyPrayers>(() => {
    const storedDate = localStorage.getItem(DATE_KEY);
    const today = getTodayString();
    
    if (storedDate !== today) {
      localStorage.setItem(DATE_KEY, today);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDailyPrayers));
      localStorage.setItem(SUNNAH_KEY, JSON.stringify(createDefaultSunnah()));
      return defaultDailyPrayers;
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultDailyPrayers;
  });

  const [streaks, setStreaks] = useState<PrayerStreaks>(() => {
    const stored = localStorage.getItem(STREAKS_KEY);
    return stored ? JSON.parse(stored) : defaultStreaks;
  });

  const [sunnah, setSunnah] = useState<PrayerSunnah>(() => {
    const storedDate = localStorage.getItem(DATE_KEY);
    const today = getTodayString();
    
    if (storedDate !== today) {
      return createDefaultSunnah();
    }
    
    const stored = localStorage.getItem(SUNNAH_KEY);
    return stored ? JSON.parse(stored) : createDefaultSunnah();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
  }, [prayers]);

  useEffect(() => {
    localStorage.setItem(STREAKS_KEY, JSON.stringify(streaks));
  }, [streaks]);

  useEffect(() => {
    localStorage.setItem(SUNNAH_KEY, JSON.stringify(sunnah));
  }, [sunnah]);

  const markPrayer = useCallback((prayer: keyof DailyPrayers, status: PrayerStatus) => {
    setPrayers(prev => ({
      ...prev,
      [prayer]: { status, timestamp: Date.now() }
    }));

    if (status === 'on-time') {
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
  }, []);

  const toggleSunnah = useCallback((prayer: keyof PrayerSunnah, sunnahId: string) => {
    setSunnah(prev => ({
      ...prev,
      [prayer]: prev[prayer].map(item =>
        item.id === sunnahId ? { ...item, completed: !item.completed } : item
      )
    }));
  }, []);

  const getPoints = useCallback((prayer: keyof DailyPrayers) => {
    const status = prayers[prayer].status;
    const multiplier = streaks[prayer].multiplier;
    
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
    markPrayer,
    toggleSunnah,
    getPoints,
    getTotalPoints,
    getCompletedCount,
  };
}
