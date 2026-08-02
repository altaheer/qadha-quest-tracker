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
const easyHabits = [
  'morning-adhkar', 'evening-adhkar', 'wake-dua', 'sleep-dua',
  'sleep-3quls', 'sleep-kursi', 'bismillah',
];

const mediumHabits = [
  ...easyHabits,
  'wake-siwak', 'sleep-mulk', 'sleep-baqarah',
  'dua-after-eating', 'dua-leave-home', 'dua-enter-home',
  'dua-before-bathroom', 'dua-after-bathroom', 'duha',
];

const hardHabits = [
  ...mediumHabits,
  'sleep-wudu', 'sleep-right', 'right-hand', 'smile',
];

const sahabahExtras = [
  'tahajjud-prep', 'quran-daily', 'istighfar-100',
  'salawat-100', 'sadaqah-daily', 'dua-parents',
];

export const levelHabits: Record<HabitLevel, string[]> = {
  easy: easyHabits,
  medium: mediumHabits,
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
      { id: 'sleep-wudu', name: 'Wudu före sömn', arabicName: 'الوضوء قبل النوم', points: 4, category: 'sleep' },
      { id: 'sleep-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', points: 3, category: 'sleep' },
      { id: 'sleep-mulk', name: 'Sūrah Al-Mulk', arabicName: 'سورة الملك', points: 5, category: 'sleep' },
      { id: 'sleep-3quls', name: '3 Quls', arabicName: 'المعوذات', points: 3, category: 'sleep' },
      { id: 'sleep-baqarah', name: 'Sista 2 verserna Al-Baqarah', arabicName: 'خواتيم البقرة', points: 4, category: 'sleep' },
      { id: 'sleep-dua', name: 'Sova-du\'a', arabicName: 'دعاء النوم', points: 2, category: 'sleep' },
      { id: 'sleep-right', name: 'Sova på höger sida', arabicName: 'النوم على الشق الأيمن', points: 2, category: 'sleep' },
    ],
  },
  {
    id: 'daily',
    name: 'Under dagen',
    icon: 'Utensils',
    habits: [
      { id: 'duha', name: 'Duha-bön', arabicName: 'صلاة الضحى', points: 8, category: 'daily' },
      { id: 'right-hand', name: 'Äta med höger hand', arabicName: 'الأكل باليمين', points: 2, category: 'daily' },
      { id: 'smile', name: 'Le mot andra', arabicName: 'التبسم', points: 2, category: 'daily' },
    ],
  },
  {
    id: 'mealtime',
    name: 'Mealtime',
    icon: 'Utensils',
    habits: [
      { id: 'bismillah', name: 'Bismillah före mat', arabicName: 'البسملة', points: 2, category: 'mealtime' },
      { id: 'dua-after-eating', name: 'Du\'a after eating', arabicName: 'دعاء بعد الأكل', points: 2, category: 'mealtime' },
    ],
  },
  {
    id: 'home',
    name: 'Home',
    icon: 'Home',
    habits: [
      { id: 'dua-leave-home', name: 'Du\'a when leaving home', arabicName: 'دعاء الخروج', points: 2, category: 'home' },
      { id: 'dua-enter-home', name: 'Du\'a when entering home', arabicName: 'دعاء الدخول', points: 2, category: 'home' },
    ],
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    icon: 'Droplets',
    habits: [
      { id: 'dua-before-bathroom', name: 'Du\'a before entering', arabicName: 'دعاء دخول الخلاء', points: 1, category: 'bathroom' },
      { id: 'dua-after-bathroom', name: 'Du\'a after leaving', arabicName: 'دعاء الخروج من الخلاء', points: 1, category: 'bathroom' },
    ],
  },
  {
    id: 'sahabah',
    name: 'Sahabah-nivå',
    icon: 'Star',
    habits: [
      { id: 'tahajjud-prep', name: 'Intention för Tahajjud', arabicName: 'نية قيام الليل', points: 5, category: 'sahabah' },
      { id: 'quran-daily', name: 'Daglig Quran-läsning (min 1 sida)', arabicName: 'قراءة القرآن يوميًا', points: 8, category: 'sahabah' },
      { id: 'istighfar-100', name: '100x Istighfar', arabicName: 'مئة استغفار', points: 4, category: 'sahabah' },
      { id: 'salawat-100', name: '100x Salawat på Profeten ﷺ', arabicName: 'مئة صلاة على النبي', points: 4, category: 'sahabah' },
      { id: 'sadaqah-daily', name: 'Daglig sadaqah', arabicName: 'صدقة يومية', points: 8, category: 'sahabah' },
      { id: 'dua-parents', name: 'Du\'a för föräldrar', arabicName: 'دعاء للوالدين', points: 3, category: 'sahabah' },
    ],
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: 'Lightbulb',
    habits: [
      { id: 'misc-salaam', name: 'Say salaam', arabicName: 'إلقاء السلام', points: 2, category: 'misc' },
      { id: 'misc-gaze', name: 'Lower your gaze', arabicName: 'غض البصر', points: 2, category: 'misc' },
      { id: 'misc-speech', name: 'Speak good or remain silent', arabicName: 'قل خيراً أو اصمت', points: 2, category: 'misc' },
      { id: 'misc-parents', name: 'Respect parents in word and tone', arabicName: 'بر الوالدين', points: 3, category: 'misc' },
      { id: 'misc-husn', name: 'Think well of others', arabicName: 'حسن الظن', points: 2, category: 'misc' },
      { id: 'misc-harm', name: 'Remove harm from the path', arabicName: 'إماطة الأذى', points: 2, category: 'misc' },
      { id: 'misc-water', name: 'Do not waste water', arabicName: 'عدم إسراف الماء', points: 2, category: 'misc' },
      { id: 'misc-walk', name: 'Walk humbly', arabicName: 'التواضع في المشية', points: 2, category: 'misc' },
      { id: 'misc-bismillah-all', name: 'Begin every action with Bismillah', arabicName: 'البسملة', points: 2, category: 'misc' },
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

  // Refresh from localStorage when cloud sync (or another tab) updates it
  useEffect(() => {
    const refresh = () => {
      const stored = localStorage.getItem(HABITS_KEY);
      if (stored) {
        try { setHistory(JSON.parse(stored)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('habits-tracking-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('habits-tracking-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // Get today's completions
  const completedHabits = new Set(
    Object.entries(history[dateKey] || {})
      .filter(([_, completed]) => completed)
      .map(([id]) => id)
  );

  // Toggle habit completion
  const toggleHabit = useCallback((habitId: string) => {
    let nextDone = false;
    setHistory(prev => {
      const dayData = prev[dateKey] || {};
      nextDone = !dayData[habitId];
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [habitId]: nextDone,
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

  // Helper: only habits considered "tracked" given the current level
  const isTracked = useCallback((id: string) => {
    if (pausedHabits.has(id)) return false;
    if (level === 'custom') return true;
    return levelHabits[level].includes(id);
  }, [pausedHabits, level]);

  // Calculate points for today (only tracked, completed habits)
  const getTotalPoints = useCallback(() => {
    let total = 0;
    habitCategories.forEach(cat => {
      cat.habits.forEach(habit => {
        if (completedHabits.has(habit.id) && isTracked(habit.id)) {
          total += habit.points;
        }
      });
    });
    return total;
  }, [completedHabits, isTracked]);

  // Get active habit count (tracked under current level)
  const getActiveCount = useCallback(() => {
    return allHabitIds.filter(id => isTracked(id)).length;
  }, [isTracked]);

  // Get completed count (only tracked habits)
  const getCompletedCount = useCallback(() => {
    return allHabitIds.filter(id => 
      completedHabits.has(id) && isTracked(id)
    ).length;
  }, [completedHabits, isTracked]);

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
