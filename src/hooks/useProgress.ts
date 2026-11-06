import { useStoredState } from '@/lib/localStore';
import { progressSummary, COMPLETIONS, EMPTY_COMPLETIONS } from '@/lib/progress';
import { useLocalDay } from './useLocalDay';
import type { PrayerHistory, HabitsHistory } from '@/types';
const PRAYERS: PrayerHistory = {};
const HABITS: HabitsHistory = {};
export function useProgress() {
 const [prayers] = useStoredState('prayer-history', PRAYERS);
 const [habits] = useStoredState('habits-tracking', HABITS);
 const [entries] = useStoredState(COMPLETIONS, EMPTY_COMPLETIONS);
 const [goal] = useStoredState('qadha-daily-goal', 5);
 const today = useLocalDay();
 return { ...progressSummary(prayers, habits, entries, today, goal), entries };
}
