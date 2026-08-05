import { useMemo } from 'react';
import { getDateString } from '@/lib/date';
import { safeReadJSON } from '@/lib/storage';
import type { DailyPrayers, PrayerHistory, HabitsHistory, PrayerCounts as QadhaCounts, PrayerStatus } from '@/types';

interface QadhaHistory {
  date: string;
  total: number;
}

const PRAYER_HISTORY_KEY = 'prayer-history';
const HABITS_KEY = 'habits-tracking';
const QADHA_KEY = 'qadha-prayer-counts';
const QADHA_HISTORY_KEY = 'qadha-history';


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
  const prayerHistory: PrayerHistory = useMemo(
    () => safeReadJSON(PRAYER_HISTORY_KEY, {} as PrayerHistory),
    [],
  );

  const habitsHistory: HabitsHistory = useMemo(
    () => safeReadJSON(HABITS_KEY, {} as HabitsHistory),
    [],
  );

  const qadhaCounts: QadhaCounts = useMemo(
    () => safeReadJSON(QADHA_KEY, { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }),
    [],
  );

  // Current streak: consecutive days with all prayers on time
  const currentStreak = useMemo(() => {
    const today = new Date();
    let streak = 0;
    let date = new Date(today);
    
    while (true) {
      const dateKey = getDateString(date);
      const dayData = prayerHistory[dateKey];
      
      if (!dayData) break;
      
      const allOnTime = getPrayerNames().every(
        prayer => dayData.prayers[prayer]?.status === 'ontime'
      );
      
      if (!allOnTime) break;
      
      streak++;
      date.setDate(date.getDate() - 1);
    }
    
    return streak;
  }, [prayerHistory]);

  // Best day of the week
  const bestDay = useMemo(() => {
    const dayPoints: Record<number, { total: number; count: number }> = {};
    
    Object.entries(prayerHistory).forEach(([dateStr, data]) => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      
      if (!dayPoints[dayOfWeek]) {
        dayPoints[dayOfWeek] = { total: 0, count: 0 };
      }
      
      let points = 0;
      getPrayerNames().forEach(prayer => {
        const status = data.prayers[prayer]?.status;
        if (status === 'ontime') points += 10;
        else if (status === 'late') points += 6;
      });
      
      dayPoints[dayOfWeek].total += points;
      dayPoints[dayOfWeek].count++;
    });
    
    const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör'];
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
  }, [prayerHistory]);

  // Weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    const data: { day: string; date: string; points: number; hasData: boolean }[] = [];
    const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
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
          if (status === 'ontime') points += 10;
          else if (status === 'late') points += 6;
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
  }, [prayerHistory, habitsHistory]);

  // Prayer punctuality (last 7 days per prayer)
  const prayerPunctuality = useMemo(() => {
    const prayers = getPrayerNames();
    const result: Record<keyof DailyPrayers, { history: PrayerStatus[]; onTimePercent: number }> = {} as any;
    
    prayers.forEach(prayer => {
      const history: PrayerStatus[] = [];
      let onTimeCount = 0;
      let totalCount = 0;
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = getDateString(date);
        const dayData = prayerHistory[dateKey];
        
        const status = dayData?.prayers[prayer]?.status || 'pending';
        history.push(status);
        
        if (status !== 'pending') {
          totalCount++;
          if (status === 'ontime') onTimeCount++;
        }
      }
      
      result[prayer] = {
        history,
        onTimePercent: totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 0,
      };
    });
    
    return result;
  }, [prayerHistory]);

  // Yearly heatmap data (365 days)
  const yearlyHeatmap = useMemo(() => {
    const data: { date: string; level: number }[] = [];
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = getDateString(date);
      
      const prayerData = prayerHistory[dateKey];
      const habitData = habitsHistory[dateKey];
      
      let completedCount = 0;
      let maxCount = 5; // 5 prayers minimum
      
      if (prayerData) {
        getPrayerNames().forEach(prayer => {
          const status = prayerData.prayers[prayer]?.status;
          if (status === 'ontime' || status === 'late') completedCount++;
        });
      }
      
      if (habitData) {
        const habitCount = Object.values(habitData).filter(Boolean).length;
        completedCount += habitCount;
        maxCount += 10; // Assume ~10 habits
      }
      
      const level = maxCount > 0 ? Math.min(5, Math.floor((completedCount / maxCount) * 6)) : 0;
      
      data.push({ date: dateKey, level });
    }
    
    return data;
  }, [prayerHistory, habitsHistory]);

  // Prayer balance (overall)
  const prayerBalance = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let missed = 0;
    
    Object.values(prayerHistory).forEach(data => {
      getPrayerNames().forEach(prayer => {
        const status = data.prayers[prayer]?.status;
        if (status === 'ontime') onTime++;
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
    const stored = localStorage.getItem('qadha-daily-goal');
    const dailyGoal = stored ? parseInt(stored, 10) : 5;
    
    if (dailyGoal <= 0 || totalQadha <= 0) return null;
    
    const daysToComplete = Math.ceil(totalQadha / dailyGoal);
    const months = Math.ceil(daysToComplete / 30);
    
    return {
      daysToComplete,
      months,
    };
  }, [totalQadha]);

  // Spiritual wheel data (simplified for now)
  const spiritualWheel = useMemo(() => {
    // Calculate average scores for each category
    const prayerScore = prayerBalance.total > 0 
      ? Math.round((prayerBalance.onTimePercent * 0.8 + prayerBalance.latePercent * 0.4) / 10) * 10
      : 0;
    
    // Habit categories mapped to spiritual wheel
    const habitScores = {
      dhikr: 50, // Placeholder
      quran: 30, // Placeholder  
      sunnah: 40, // Placeholder
      fasting: 20, // Placeholder
    };
    
    return [
      { category: 'Böner', value: prayerScore, fullMark: 100 },
      { category: 'Koranen', value: habitScores.quran, fullMark: 100 },
      { category: 'Dhikr', value: habitScores.dhikr, fullMark: 100 },
      { category: 'Fasta', value: habitScores.fasting, fullMark: 100 },
      { category: 'Sunnah', value: habitScores.sunnah, fullMark: 100 },
    ];
  }, [prayerBalance]);

  return {
    currentStreak,
    bestDay,
    weeklyData,
    prayerPunctuality,
    yearlyHeatmap,
    prayerBalance,
    totalQadha,
    qadhaProjection,
    spiritualWheel,
    getPrayerDisplayName,
  };
}
