import { useState, useEffect, useCallback } from 'react';
import { getDateString } from '@/lib/date';
import type {
  PrayerStatus,
  PrayerEntry,
  DailyPrayers,
  PrayerStreak,
  PrayerStreaks,
  SunnahItem,
  PrayerSunnah,
  PrayerHistory,
} from '@/types';

// Re-export for backward compatibility with existing consumers
export type {
  PrayerStatus,
  PrayerEntry,
  DailyPrayers,
  PrayerStreak,
  PrayerStreaks,
  SunnahItem,
  PrayerSunnah,
  PrayerHistory,
};

const HISTORY_KEY = 'prayer-history';
const STREAKS_KEY = 'prayer-streaks';
const QADHA_KEY = 'qadha-prayer-counts';
const COMBO_KEY = 'prayer-combo';

const defaultPrayerEntry: PrayerEntry = { status: 'pending' };

const defaultDailyPrayers: DailyPrayers = {
  fajr: { ...defaultPrayerEntry },
  dhuhr: { ...defaultPrayerEntry },
  asr: { ...defaultPrayerEntry },
  maghrib: { ...defaultPrayerEntry },
  isha: { ...defaultPrayerEntry },
};

const defaultStreak: PrayerStreak = { current: 0, best: 0 };

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
    { id: 'fajr-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'fajr-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'fajr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  dhuhr: [
    { id: 'dhuhr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'dhuhr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'dhuhr-sunnah-before', name: '2-4 Rak\'at before', arabicName: 'ركعات قبلية', completed: false },
    { id: 'dhuhr-sunnah-after', name: '2-4 Rak\'at after', arabicName: 'ركعات بعدية', completed: false },
    { id: 'dhuhr-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'dhuhr-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'dhuhr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  asr: [
    { id: 'asr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'asr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'asr-sunnah-before', name: '4 Rak\'at before Asr', arabicName: 'أربع ركعات قبل العصر', completed: false },
    { id: 'asr-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'asr-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'asr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  maghrib: [
    { id: 'maghrib-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'maghrib-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'maghrib-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'maghrib-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'maghrib-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'maghrib-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  isha: [
    { id: 'isha-siwak', name: 'Siwāk', arabicName: 'السواک', completed: false },
    { id: 'isha-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'isha-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'isha-witr', name: 'Witr prayer', arabicName: 'صلاة الوتر', completed: false },
    { id: 'isha-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'isha-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'isha-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
});

// Combo multiplier: +0.1x per 10 consecutive on-time/jamaah prayers
export function getComboMultiplier(combo: number): number {
  return 1 + Math.floor(combo / 10) * 0.1;
}

export function getComboLabel(combo: number): string | null {
  if (combo < 10) return null;
  if (combo >= 200) return '🔥🔥🔥 LEGENDARY';
  if (combo >= 150) return '🔥🔥 EPIC';
  if (combo >= 100) return '🔥 MASTER';
  if (combo >= 50) return '⚡ EXCELLENT';
  if (combo >= 30) return '💪 GREAT';
  if (combo >= 10) return '✨ COMBO';
  return null;
}


// Recalculate combo from full history: count consecutive good prayers
// going backwards chronologically from today.
// We iterate day by day (newest first), and within each day isha→fajr (reverse prayer order).
// Only on-time/jamaah count. Late/missed/pending all break the combo.
function recalcComboFromHistory(hist: PrayerHistory): number {
  const prayerKeys: (keyof DailyPrayers)[] = ['isha', 'maghrib', 'asr', 'dhuhr', 'fajr'];
  
  // All dates sorted newest first
  const dates = Object.keys(hist).sort().reverse();
  
  let combo = 0;
  
  for (const date of dates) {
    const day = hist[date]?.prayers;
    if (!day) break; // no data = break
    
    let dayHasAnyData = false;
    for (const p of prayerKeys) {
      const status = day[p]?.status;
      if (!status || status === 'pending') continue; // skip untracked within a day
      dayHasAnyData = true;
      if (status === 'on-time' || status === 'jamaah') {
        combo++;
      } else {
        // late or missed breaks the combo
        return combo;
      }
    }
    
    // If a day exists in history but has zero tracked prayers, stop
    if (!dayHasAnyData) break;
  }
  
  return combo;
}

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

  const combo = recalcComboFromHistory(history);

  const prayers = history[dateKey]?.prayers || defaultDailyPrayers;
  const sunnah = history[dateKey]?.sunnah || createDefaultSunnah();

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STREAKS_KEY, JSON.stringify(streaks));
  }, [streaks]);

  const updateQadhaCount = useCallback((prayer: keyof DailyPrayers, delta: number) => {
    const stored = localStorage.getItem(QADHA_KEY);
    const qadhaCounts = stored ? JSON.parse(stored) : { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    qadhaCounts[prayer] = Math.max(0, qadhaCounts[prayer] + delta);
    localStorage.setItem(QADHA_KEY, JSON.stringify(qadhaCounts));
    window.dispatchEvent(new Event('qadha-updated'));
  }, []);

  const markPrayer = useCallback((prayer: keyof DailyPrayers, status: PrayerStatus) => {
    const previousStatus = history[dateKey]?.prayers?.[prayer]?.status || 'pending';
    
    // Toggle: if clicking same status, revert to pending
    const newStatus: PrayerStatus = previousStatus === status ? 'pending' : status;

    setHistory(prev => {
      const existingDay = prev[dateKey] || { prayers: { ...defaultDailyPrayers }, sunnah: createDefaultSunnah() };
      return {
        ...prev,
        [dateKey]: {
          ...existingDay,
          prayers: {
            ...existingDay.prayers,
            [prayer]: { status: newStatus, timestamp: Date.now() }
          }
        }
      };
    });

    // Handle Qadha
    if (newStatus === 'missed' && previousStatus !== 'missed') {
      updateQadhaCount(prayer, 1);
    } else if (previousStatus === 'missed' && newStatus !== 'missed') {
      updateQadhaCount(prayer, -1);
    }

    // Combo is now derived from history automatically
    const wasGood = previousStatus === 'on-time' || previousStatus === 'jamaah';

    // Update per-prayer streaks only for today
    if (isToday) {
      if ((newStatus === 'on-time' || newStatus === 'jamaah') && !wasGood) {
        setStreaks(prev => {
          const current = prev[prayer].current + 1;
          return {
            ...prev,
            [prayer]: {
              current,
              best: Math.max(current, prev[prayer].best),
            }
          };
        });
      } else if (newStatus === 'missed') {
        setStreaks(prev => ({
          ...prev,
          [prayer]: {
            ...prev[prayer],
            current: 0,
          }
        }));
      } else if (wasGood && newStatus === 'pending') {
        // Reverting a good prayer
        setStreaks(prev => ({
          ...prev,
          [prayer]: {
            ...prev[prayer],
            current: Math.max(0, prev[prayer].current - 1),
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

  const comboMultiplier = getComboMultiplier(combo);

  const getPoints = useCallback((prayer: keyof DailyPrayers) => {
    const status = prayers[prayer].status;
    
    let base = 0;
    if (status === 'jamaah') base = 25;
    else if (status === 'on-time') base = 15;
    else if (status === 'late') base = 5;
    
    return Math.round(base * comboMultiplier);
  }, [prayers, comboMultiplier]);

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
    combo,
    comboMultiplier,
    selectedDate: currentDate,
    isToday,
    markPrayer,
    toggleSunnah,
    getPoints,
    getTotalPoints,
    getCompletedCount,
  };
}
