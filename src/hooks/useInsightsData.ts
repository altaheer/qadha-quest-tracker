import { useMemo } from 'react';
import { getDateString, localeFor } from '@/lib/date';
import { useStoredState } from '@/lib/localStore';
import { useLocalDay } from '@/hooks/useLocalDay';
import { useTranslation } from '@/lib/i18n';
import { calculateDailyStreak, isOnTime, isPrayed } from '@/lib/prayerStats';
import type { DailyPrayers, PrayerHistory, HabitsHistory, PrayerCounts as QadhaCounts, PrayerStatus } from '@/types';

const PRAYER_HISTORY_KEY = 'prayer-history';
const HABITS_KEY = 'habits-tracking';
const QADHA_KEY = 'qadha-prayer-counts';
const EMPTY_PRAYERS: PrayerHistory = {};
const EMPTY_HABITS: HabitsHistory = {};
const EMPTY_COUNTS: QadhaCounts = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };


const getPrayerNames = (): (keyof DailyPrayers)[] => ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const getPrayerDisplayName = (prayer: keyof DailyPrayers): string => {
  const names: Record<keyof DailyPrayers, string> = {
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  };
  return names[prayer];
};

export function useInsightsData() {
  const today = useLocalDay();
  const { lang } = useTranslation();
  const [prayerHistory] = useStoredState(PRAYER_HISTORY_KEY, EMPTY_PRAYERS);
  const [habitsHistory] = useStoredState(HABITS_KEY, EMPTY_HABITS);
  const [qadhaCounts] = useStoredState(QADHA_KEY, EMPTY_COUNTS);
  const [dailyGoal] = useStoredState('qadha-daily-goal', 5);
  const currentStreak = calculateDailyStreak(prayerHistory, today);
  const dayNames = useMemo(() => Array.from({ length: 7 }, (_, i) =>
    new Date(2026, 10, 1 + i).toLocaleDateString(localeFor(lang), { weekday: 'short' })), [lang]);

  // Best day of the week
  const bestDay = useMemo(() => {
    const dayPoints: Record<number, { total: number; count: number }> = {};

    Object.entries(prayerHistory).forEach(([dateStr, data]) => {
      const date = new Date(`${dateStr}T12:00:00`);
      const dayOfWeek = date.getDay();

      if (!dayPoints[dayOfWeek]) {
        dayPoints[dayOfWeek] = { total: 0, count: 0 };
      }

      let points = 0;
      getPrayerNames().forEach(prayer => {
        const status = data.prayers[prayer]?.status;
        if (status === 'jamaah') points += 25;
        else if (status === 'ontime') points += 15;
        else if (status === 'late') points += 5;
      });

      dayPoints[dayOfWeek].total += points;
      dayPoints[dayOfWeek].count++;
    });


    let bestDayIndex = -1;
    let bestAvg = 0;

    Object.entries(dayPoints).forEach(([day, data]) => {
      const avg = data.count > 0 ? data.total / data.count : 0;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDayIndex = parseInt(day);
      }
    });

    return bestDayIndex >= 0 ? dayNames[bestDayIndex] : '-';
  }, [prayerHistory, dayNames]);

  // Weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    const data: { day: string; date: string; points: number; hasData: boolean }[] = [];


    for (let i = 6; i >= 0; i--) {
      const date = new Date(`${today}T12:00:00`);
      date.setDate(date.getDate() - i);
      const dateKey = getDateString(date);
      const dayData = prayerHistory[dateKey];
      const habitData = habitsHistory[dateKey];

      let points = 0;
      let hasData = false;

      if (dayData) {
        hasData = true;
        getPrayerNames().forEach(prayer => {
          const status = dayData.prayers[prayer]?.status;
          if (status === 'jamaah') points += 25;
          else if (status === 'ontime') points += 15;
          else if (status === 'late') points += 5;
        });
      }

      if (habitData) {
        hasData = true;
        Object.values(habitData).forEach(completed => {
          if (completed) points += 3; // Average habit points
        });
      }

      data.push({
        day: dayNames[date.getDay()],
        date: dateKey,
        points,
        hasData,
      });
    }

    return data;
  }, [prayerHistory, habitsHistory, dayNames, today]);

  // Prayer punctuality (last 7 days per prayer)
  const prayerPunctuality = useMemo(() => {
    const prayers = getPrayerNames();
    const result = {} as Record<keyof DailyPrayers, { history: PrayerStatus[]; onTimePercent: number }>;

    prayers.forEach(prayer => {
      const history: PrayerStatus[] = [];
      let onTimeCount = 0;
      let totalCount = 0;

      for (let i = 6; i >= 0; i--) {
        const date = new Date(`${today}T12:00:00`);
        date.setDate(date.getDate() - i);
        const dateKey = getDateString(date);
        const dayData = prayerHistory[dateKey];

        const status = dayData?.prayers[prayer]?.status || 'pending';
        history.push(status);

        if (status !== 'pending') {
          totalCount++;
          if (isOnTime(status)) onTimeCount++;
        }
      }

      result[prayer] = {
        history,
        onTimePercent: totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 0,
      };
    });

    return result;
  }, [prayerHistory, today]);

  // Yearly heatmap data (365 days)
  const yearlyHeatmap = useMemo(() => {
    const data: { date: string; level: number }[] = [];

    for (let i = 364; i >= 0; i--) {
      const date = new Date(`${today}T12:00:00`);
      date.setDate(date.getDate() - i);
      const dateKey = getDateString(date);

      const prayerData = prayerHistory[dateKey];

      let completedCount = 0;

      if (prayerData) {
        getPrayerNames().forEach(prayer => {
          const status = prayerData.prayers[prayer]?.status;
          if (isPrayed(status)) completedCount++;
        });
      }

      const level = completedCount;

      data.push({ date: dateKey, level });
    }

    return data;
  }, [prayerHistory, today]);

  // Prayer balance (overall)
  const prayerBalance = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let missed = 0;

    Object.values(prayerHistory).forEach(data => {
      getPrayerNames().forEach(prayer => {
        const status = data.prayers[prayer]?.status;
        if (isOnTime(status)) onTime++;
        else if (status === 'late') late++;
        else if (status === 'missed') missed++;
      });
    });

    const total = onTime + late + missed;

    return {
      onTime,
      late,
      missed,
      total,
      onTimePercent: total > 0 ? Math.round((onTime / total) * 100) : 0,
      latePercent: total > 0 ? Math.round((late / total) * 100) : 0,
      missedPercent: total > 0 ? Math.round((missed / total) * 100) : 0,
    };
  }, [prayerHistory]);

  // Total qadha
  const totalQadha = useMemo(() => {
    return Object.values(qadhaCounts).reduce((sum: number, count: number) => sum + count, 0);
  }, [qadhaCounts]);

  // Calculate months to be debt-free based on daily goal
  const qadhaProjection = useMemo(() => {

    if (dailyGoal <= 0 || totalQadha <= 0) return null;

    const daysToComplete = Math.ceil(totalQadha / dailyGoal);
    const months = Math.ceil(daysToComplete / 30);

    return {
      daysToComplete,
      months,
    };
  }, [totalQadha, dailyGoal]);

  return {
    currentStreak,
    bestDay,
    weeklyData,
    prayerPunctuality,
    yearlyHeatmap,
    prayerBalance,
    totalQadha,
    qadhaProjection,
    getPrayerDisplayName,
  };
}
