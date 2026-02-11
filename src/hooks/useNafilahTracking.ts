import { useState, useEffect, useCallback } from 'react';

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

const NAFILAH_KEY = 'nafilah-history';

export const nafilahPrayers: Omit<NafilahPrayer, 'completed'>[] = [
  // Hard
  {
    id: 'tahajjud',
    name: 'Tahajjud',
    arabicName: 'تهجد',
    description: 'Nattbönen – vakna mitt i natten',
    difficulty: 'hard',
    points: 50,
    rakaat: '2–8 rak\'at',
  },
  {
    id: 'tasbih',
    name: 'Salat al-Tasbih',
    arabicName: 'صلاة التسبيح',
    description: 'Förlåtelsebönen – 300 tasbih under bönen',
    difficulty: 'hard',
    points: 40,
    rakaat: '4 rak\'at',
  },
  // Medium
  {
    id: 'ishraq',
    name: 'Ishraq',
    arabicName: 'إشراق',
    description: 'Bönen efter soluppgång – stanna vaken efter Fajr',
    difficulty: 'medium',
    points: 25,
    rakaat: '2–4 rak\'at',
  },
  {
    id: 'duha',
    name: 'Salat al-Duha',
    arabicName: 'صلاة الضحى',
    description: 'Förmiddagsbönen – under arbetstid',
    difficulty: 'medium',
    points: 20,
    rakaat: '2–8 rak\'at',
  },
  {
    id: 'awwabin',
    name: 'Awwabin',
    arabicName: 'الأوابين',
    description: 'Mellan Maghrib och Isha',
    difficulty: 'medium',
    points: 20,
    rakaat: '2–6 rak\'at',
  },
  // Easy
  {
    id: 'istikhara',
    name: 'Istikhara / Hajat',
    arabicName: 'استخارة / حاجة',
    description: 'Väglednings- eller behovsbönen',
    difficulty: 'easy',
    points: 10,
    rakaat: '2 rak\'at',
  },
  {
    id: 'tahiyatul-masjid',
    name: 'Tahiyatul Masjid',
    arabicName: 'تحية المسجد',
    description: 'Hälsning till moskén',
    difficulty: 'easy',
    points: 5,
    rakaat: '2 rak\'at',
  },
];

const getDateString = (date: Date) => date.toISOString().split('T')[0];

export function useNafilahTracking(selectedDate?: Date) {
  const currentDate = selectedDate || new Date();
  const dateKey = getDateString(currentDate);

  const [history, setHistory] = useState<DailyNafilah>(() => {
    const stored = localStorage.getItem(NAFILAH_KEY);
    return stored ? JSON.parse(stored) : {};
  });

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
