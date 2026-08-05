import { useState, useEffect, useCallback } from 'react';
import { getDateString } from '@/lib/date';
import { safeReadJSON } from '@/lib/storage';
import type { NafilahDifficulty, NafilahPrayer, DailyNafilah } from '@/types';

export type { NafilahDifficulty, NafilahPrayer, DailyNafilah };

const NAFILAH_KEY = 'nafilah-history';

export const nafilahPrayers: Omit<NafilahPrayer, 'completed'>[] = [
  // Hard
  {
    id: 'tahajjud',
    name: 'Tahajjud',
    arabicName: 'تهجد',
    description: 'Nattbönen – vakna mitt i natten',
    difficulty: 'hard',
    points: 20,
    rakaat: '2–8 rak\'at',
  },
  {
    id: 'tasbih',
    name: 'Salat al-Tasbih',
    arabicName: 'صلاة التسبيح',
    description: 'Förlåtelsebönen – 300 tasbih under bönen',
    difficulty: 'hard',
    points: 15,
    rakaat: '4 rak\'at',
  },
  // Medium
  {
    id: 'ishraq',
    name: 'Ishraq',
    arabicName: 'إشراق',
    description: 'Bönen efter soluppgång – stanna vaken efter Fajr',
    difficulty: 'hard',
    points: 12,
    rakaat: '2–4 rak\'at',
  },
  {
    id: 'duha',
    name: 'Salat al-Duha',
    arabicName: 'صلاة الضحى',
    description: 'Förmiddagsbönen – under arbetstid',
    difficulty: 'medium',
    points: 8,
    rakaat: '2–8 rak\'at',
  },
  {
    id: 'awwabin',
    name: 'Awwabin',
    arabicName: 'الأوابين',
    description: 'Mellan Maghrib och Isha',
    difficulty: 'medium',
    points: 8,
    rakaat: '2–6 rak\'at',
  },
  // Easy
  {
    id: 'istikhara',
    name: 'Istikhara / Hajat',
    arabicName: 'استخارة / حاجة',
    description: 'Väglednings- eller behovsbönen',
    difficulty: 'easy',
    points: 3,
    rakaat: '2 rak\'at',
  },
  {
    id: 'tahiyatul-masjid',
    name: 'Tahiyatul Masjid',
    arabicName: 'تحية المسجد',
    description: 'Hälsning till moskén',
    difficulty: 'easy',
    points: 3,
    rakaat: '2 rak\'at',
  },
];




export function useNafilahTracking(selectedDate?: Date) {
  const currentDate = selectedDate || new Date();
  const dateKey = getDateString(currentDate);

  const [history, setHistory] = useState<DailyNafilah>(() =>
    safeReadJSON(NAFILAH_KEY, {} as DailyNafilah),
  );

  useEffect(() => {
    localStorage.setItem(NAFILAH_KEY, JSON.stringify(history));
  }, [history]);

  const toggleNafilah = useCallback((prayerId: string) => {
    setHistory(prev => {
      const dayData = prev[dateKey] || {};
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [prayerId]: !dayData[prayerId],
        },
      };
    });
  }, [dateKey]);

  const getPrayersWithStatus = useCallback((): NafilahPrayer[] => {
    const dayData = history[dateKey] || {};
    return nafilahPrayers.map(p => ({
      ...p,
      completed: !!dayData[p.id],
    }));
  }, [dateKey, history]);

  const getTotalNafilahPoints = useCallback(() => {
    const dayData = history[dateKey] || {};
    return nafilahPrayers
      .filter(p => dayData[p.id])
      .reduce((sum, p) => sum + p.points, 0);
  }, [dateKey, history]);

  const getCompletedNafilahCount = useCallback(() => {
    const dayData = history[dateKey] || {};
    return nafilahPrayers.filter(p => dayData[p.id]).length;
  }, [dateKey, history]);

  return {
    nafilahPrayers: getPrayersWithStatus(),
    toggleNafilah,
    getTotalNafilahPoints,
    getCompletedNafilahCount,
    totalNafilah: nafilahPrayers.length,
  };
}
