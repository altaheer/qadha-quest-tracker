import { useState, useEffect, useCallback } from 'react';
import { getDateString } from '@/lib/date';
import type {
  Habit,
  HabitCategory,
  HabitState,
  DailyHabits,
  HabitsHistory,
  HabitLevel,
} from '@/types';

// Re-export for backward compatibility
export type { Habit, HabitCategory, HabitState, DailyHabits, HabitsHistory, HabitLevel };

const HABITS_KEY = 'habits-tracking';
const PAUSED_KEY = 'habits-paused';
const LEVEL_KEY = 'habits-level';

// Define which habits are active per level
const sahabahExtras = [
  'tahajjud-prep', 'quran-daily', 'istighfar-100', 'salawat-100', 'sadaqah-daily', 'dua-parents'
];

const hardHabits = [
  'morning-adhkar', 'evening-adhkar', 'wake-dua', 'wake-siwak',
  'sleep-dua', 'sleep-kursi', 'sleep-3quls', 'sleep-wudu', 'sleep-mulk', 'sleep-baqarah', 'sleep-right',
  'duha', 'bismillah', 'right-hand', 'smile'
];

export const levelHabits: Record<HabitLevel, string[]> = {
  easy: [
    'morning-adhkar', 'evening-adhkar', 'wake-dua',
    'sleep-dua', 'sleep-kursi', 'sleep-3quls'
  ],
  medium: [
    'morning-adhkar', 'evening-adhkar', 'wake-dua', 'wake-siwak',
    'sleep-dua', 'sleep-kursi', 'sleep-3quls', 'sleep-wudu', 'sleep-mulk',
    'duha', 'bismillah'
  ],
  hard: hardHabits,
  sahabah: [...hardHabits, ...sahabahExtras],
  custom: [], // All habits available, user controls individually
};

export const habitCategories: HabitCategory[] = [
  {
    id: 'morning',
    name: 'Morgonrutiner',
    icon: 'Sun',
    habits: [
      { id: 'morning-adhkar', name: 'Morgon-adhkār', arabicName: 'أذكار الصباح', points: 5, category: 'morning' },
      { id: 'wake-dua', name: 'Vakna-du\'a', arabicName: 'دعاء الاستيقاظ', points: 2, category: 'morning' },
      { id: 'wake-siwak', name: 'Siwāk vid uppvaknande', arabicName: 'السواك', points: 2, category: 'morning' },
    ],
  },
  {
    id: 'evening',
    name: 'Kvällsrutiner',
    icon: 'Moon',
    habits: [
      { id: 'evening-adhkar', name: 'Kvälls-adhkār', arabicName: 'أذكار المساء', points: 5, category: 'evening' },
    ],
  },
  {
    id: 'sleep',
    name: 'Innan sömn',
    icon: 'Bed',
    habits: [
      { id: 'sleep-wudu', name: 'Wudu före sömn', arabicName: 'الوضوء قبل النوم', points: 3, category: 'sleep' },
      { id: 'sleep-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', points: 4, category: 'sleep' },
      { id: 'sleep-mulk', name: 'Sūrah Al-Mulk', arabicName: 'سورة الملك', points: 4, category: 'sleep' },
      { id: 'sleep-3quls', name: '3 Quls', arabicName: 'المعوذات', points: 3, category: 'sleep' },
      { id: 'sleep-baqarah', name: 'Sista 2 verserna Al-Baqarah', arabicName: 'خواتيم البقرة', points: 3, category: 'sleep' },
      { id: 'sleep-dua', name: 'Sova-du\'a', arabicName: 'دعاء النوم', points: 2, category: 'sleep' },
      { id: 'sleep-right', name: 'Sova på höger sida', arabicName: 'النوم على الشق الأيمن', points: 2, category: 'sleep' },
    ],
  },
  {
    id: 'daily',
    name: 'Under dagen',
    icon: 'Utensils',
    habits: [
      { id: 'duha', name: 'Duha-bön', arabicName: 'صلاة الضحى', points: 5, category: 'daily' },
      { id: 'bismillah', name: 'Bismillah före mat', arabicName: 'البسملة', points: 2, category: 'daily' },
      { id: 'right-hand', name: 'Äta med höger hand', arabicName: 'الأكل باليمين', points: 2, category: 'daily' },
      { id: 'smile', name: 'Le mot andra', arabicName: 'التبسم', points: 2, category: 'daily' },
    ],
  },
  {
    id: 'sahabah',
    name: 'Sahabah-nivå',
    icon: 'Star',
    habits: [
      { id: 'tahajjud-prep', name: 'Intention för Tahajjud', arabicName: 'نية قيام الليل', points: 5, category: 'sahabah' },
      { id: 'quran-daily', name: 'Daglig Quran-läsning (min 1 sida)', arabicName: 'قراءة القرآن يوميًا', points: 8, category: 'sahabah' },
      { id: 'istighfar-100', name: '100x Istighfar', arabicName: 'مئة استغفار', points: 5, category: 'sahabah' },
      { id: 'salawat-100', name: '100x Salawat på Profeten ﷺ', arabicName: 'مئة صلاة على النبي', points: 5, category: 'sahabah' },
      { id: 'sadaqah-daily', name: 'Daglig sadaqah', arabicName: 'صدقة يومية', points: 8, category: 'sahabah' },
      { id: 'dua-parents', name: 'Du\'a för föräldrar', arabicName: 'دعاء للوالدين', points: 3, category: 'sahabah' },
    ],
  },
];

// Get all habit IDs
const allHabitIds = habitCategories.flatMap(c => c.habits.map(h => h.id));



export function useHabitsTracking(selectedDate?: Date) {
  const today = new Date();
  const currentDate = selectedDate || today;
  const dateKey = getDateString(currentDate);

  // Completion history
  const [history, setHistory] = useState<HabitsHistory>(() => {
    const stored = localStorage.getItem(HABITS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Paused habits (persisted separately, not date-dependent)
  const [pausedHabits, setPausedHabits] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(PAUSED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Selected level
  const [level, setLevel] = useState<HabitLevel>(() => {
    const stored = localStorage.getItem(LEVEL_KEY);
    return (stored as HabitLevel) || 'easy';
  });

  // Persist history
  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(history));
  }, [history]);

  // Persist paused habits
  useEffect(() => {
    localStorage.setItem(PAUSED_KEY, JSON.stringify(Array.from(pausedHabits)));
  }, [pausedHabits]);

  // Persist level
  useEffect(() => {
    localStorage.setItem(LEVEL_KEY, level);
  }, [level]);

  // Get today's completions
  const completedHabits = new Set(
    Object.entries(history[dateKey] || {})
      .filter(([_, completed]) => completed)
      .map(([id]) => id)
  );

  // Toggle habit completion
  const toggleHabit = useCallback((habitId: string) => {
    setHistory(prev => {
      const dayData = prev[dateKey] || {};
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [habitId]: !dayData[habitId]
        }
      };
    });
  }, [dateKey]);

  // Toggle pause state
  const togglePause = useCallback((habitId: string) => {
    setPausedHabits(prev => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  }, []);

  // Apply level template (sets paused state based on level)
  const applyLevel = useCallback((newLevel: HabitLevel) => {
    setLevel(newLevel);
    
    if (newLevel === 'custom') {
      // Custom mode: don't change any pause states
      return;
    }

    const activeHabits = new Set(levelHabits[newLevel]);
    const newPaused = new Set<string>();
    
    allHabitIds.forEach(id => {
      if (!activeHabits.has(id)) {
        newPaused.add(id);
      }
    });
    
    setPausedHabits(newPaused);
  }, []);

  // Calculate points for today (only non-paused, completed habits)
  const getTotalPoints = useCallback(() => {
    let total = 0;
    habitCategories.forEach(cat => {
      cat.habits.forEach(habit => {
        if (completedHabits.has(habit.id) && !pausedHabits.has(habit.id)) {
          total += habit.points;
        }
      });
    });
    return total;
  }, [completedHabits, pausedHabits]);

  // Get active habit count (non-paused)
  const getActiveCount = useCallback(() => {
    return allHabitIds.filter(id => !pausedHabits.has(id)).length;
  }, [pausedHabits]);

  // Get completed count (only active habits)
  const getCompletedCount = useCallback(() => {
    return allHabitIds.filter(id => 
      completedHabits.has(id) && !pausedHabits.has(id)
    ).length;
  }, [completedHabits, pausedHabits]);

  return {
    habitCategories,
    completedHabits,
    pausedHabits,
    level,
    toggleHabit,
    togglePause,
    applyLevel,
    getTotalPoints,
    getActiveCount,
    getCompletedCount,
  };
}
