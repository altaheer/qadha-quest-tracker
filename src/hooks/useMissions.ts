import { useCallback, useEffect, useState } from 'react';
import { getDateString } from '@/lib/date';
import { habitCategories } from '@/hooks/useHabitsTracking';
import { nafilahPrayers } from '@/hooks/useNafilahTracking';
import type { PrayerHistory, HabitsHistory, DailyNafilah, DailyPrayers, PrayerStatus } from '@/types';

export type MissionActionType = 'prayer' | 'habit' | 'nafilah';
export type MissionQualifier = 'on-time' | 'jamaah';
export type MissionStatus = 'active' | 'completed' | 'ended';

export interface Mission {
  id: string;
  actionType: MissionActionType;
  actionId: string; // prayer name, habit id, nafilah id, or 'all' for all 5 prayers
  qualifier?: MissionQualifier;
  days: number;
  missesAllowed?: number; // optional override; defaults to ceil(days * 0.1)
  startDate: string; // YYYY-MM-DD
  status: MissionStatus;
}

export interface CompletedMission extends Mission {
  completedAt: string;
  bonus: number;
}

export interface MissionProgress {
  mission: Mission;
  progress: number;       // fulfilled days
  daysElapsed: number;    // days passed since start (capped at days)
  missesUsed: number;
  missesAllowed: number;
  daysRemaining: number;
  bonus: number;
  derivedStatus: MissionStatus;
}

const MISSIONS_KEY = 'missions';
const COMPLETED_KEY = 'missions-completed';

const PRAYER_NAMES: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function statusSatisfies(actual: PrayerStatus | undefined, qualifier: MissionQualifier | undefined): boolean {
  if (!qualifier) return actual === 'on-time' || actual === 'jamaah';
  if (qualifier === 'jamaah') return actual === 'jamaah';
  // on-time also accepts jamaah
  return actual === 'on-time' || actual === 'jamaah';
}

export function getActionBasePoints(m: Pick<Mission, 'actionType' | 'actionId' | 'qualifier'>): number {
  if (m.actionType === 'prayer') {
    return m.qualifier === 'jamaah' ? 25 : 15;
  }
  if (m.actionType === 'habit') {
    const habit = habitCategories.flatMap((c) => c.habits).find((h) => h.id === m.actionId);
    return habit?.points ?? 5;
  }
  if (m.actionType === 'nafilah') {
    const n = nafilahPrayers.find((p) => p.id === m.actionId);
    return n?.points ?? 5;
  }
  return 5;
}

function isDayFulfilled(
  date: string,
  mission: Mission,
  prayerHistory: PrayerHistory,
  habitsHistory: HabitsHistory,
  nafilahHistory: DailyNafilah,
): boolean {
  if (mission.actionType === 'prayer') {
    const dayData = prayerHistory[date];
    if (!dayData) return false;
    if (mission.actionId === 'all') {
      return PRAYER_NAMES.every((p) =>
        statusSatisfies(dayData.prayers[p]?.status, mission.qualifier),
      );
    }
    const p = mission.actionId as keyof DailyPrayers;
    return statusSatisfies(dayData.prayers[p]?.status, mission.qualifier);
  }
  if (mission.actionType === 'habit') {
    return !!habitsHistory[date]?.[mission.actionId];
  }
  if (mission.actionType === 'nafilah') {
    return !!nafilahHistory[date]?.[mission.actionId];
  }
  return false;
}

export function computeProgress(mission: Mission): MissionProgress {
  const prayerHistory = readJSON<PrayerHistory>('prayer-history', {});
  const habitsHistory = readJSON<HabitsHistory>('habits-tracking', {});
  const nafilahHistory = readJSON<DailyNafilah>('nafilah-history', {});

  const start = new Date(mission.startDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 86400000;
  const rawElapsed = Math.floor((today.getTime() - start.getTime()) / msPerDay) + 1;
  const daysElapsed = Math.max(0, Math.min(mission.days, rawElapsed));

  let progress = 0;
  for (let i = 0; i < daysElapsed; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = getDateString(d);
    if (isDayFulfilled(key, mission, prayerHistory, habitsHistory, nafilahHistory)) {
      progress++;
    }
  }

  const missesAllowed = mission.missesAllowed ?? Math.ceil(mission.days * 0.1);
  const missesUsed = Math.max(0, daysElapsed - progress);
  const daysRemaining = Math.max(0, mission.days - daysElapsed);
  const bonus = getActionBasePoints(mission) * mission.days;

  let derivedStatus: MissionStatus = mission.status;
  if (mission.status === 'active') {
    if (missesUsed > missesAllowed) {
      derivedStatus = 'ended';
    } else if (progress >= mission.days - missesAllowed && daysElapsed >= mission.days) {
      derivedStatus = 'completed';
    }
  }

  return {
    mission,
    progress,
    daysElapsed,
    missesUsed,
    missesAllowed,
    daysRemaining,
    bonus,
    derivedStatus,
  };
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>(() =>
    readJSON<Mission[]>(MISSIONS_KEY, []),
  );
  const [completed, setCompleted] = useState<CompletedMission[]>(() =>
    readJSON<CompletedMission[]>(COMPLETED_KEY, []),
  );

  useEffect(() => {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
  }, [completed]);

  const createMission = useCallback(
    (data: Omit<Mission, 'id' | 'startDate' | 'status'>) => {
      const m: Mission = {
        ...data,
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        startDate: getDateString(new Date()),
        status: 'active',
      };
      setMissions((prev) => [m, ...prev]);
      return m;
    },
    [],
  );

  const deleteMission = useCallback((id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Recompute and reconcile statuses; move completed/ended out of active list
  const reconcile = useCallback((): {
    active: MissionProgress[];
    justCompleted: CompletedMission[];
    justEnded: Mission[];
  } => {
    const active: MissionProgress[] = [];
    const justCompleted: CompletedMission[] = [];
    const justEnded: Mission[] = [];
    const remaining: Mission[] = [];

    for (const m of missions) {
      const p = computeProgress(m);
      if (p.derivedStatus === 'completed') {
        const cm: CompletedMission = {
          ...m,
          status: 'completed',
          completedAt: getDateString(new Date()),
          bonus: p.bonus,
        };
        justCompleted.push(cm);
      } else if (p.derivedStatus === 'ended') {
        justEnded.push({ ...m, status: 'ended' });
      } else {
        remaining.push(m);
        active.push(p);
      }
    }

    if (justCompleted.length || justEnded.length) {
      setMissions(remaining);
      if (justCompleted.length) {
        setCompleted((prev) => [...justCompleted, ...prev]);
      }
      // ended missions: keep them in a separate localStorage list
      if (justEnded.length) {
        const prev = readJSON<Mission[]>('missions-ended', []);
        localStorage.setItem('missions-ended', JSON.stringify([...justEnded, ...prev]));
      }
    }

    return { active, justCompleted, justEnded };
  }, [missions]);

  const endedMissions = readJSON<Mission[]>('missions-ended', []);

  const recreateMission = useCallback((m: Mission) => {
    const newM: Mission = {
      ...m,
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      startDate: getDateString(new Date()),
      status: 'active',
    };
    setMissions((prev) => [newM, ...prev]);
    // remove from ended list
    const ended = readJSON<Mission[]>('missions-ended', []);
    localStorage.setItem(
      'missions-ended',
      JSON.stringify(ended.filter((e) => e.id !== m.id)),
    );
    return newM;
  }, []);

  const removeEnded = useCallback((id: string) => {
    const ended = readJSON<Mission[]>('missions-ended', []);
    localStorage.setItem(
      'missions-ended',
      JSON.stringify(ended.filter((e) => e.id !== id)),
    );
  }, []);

  const totalCompletedBonus = completed.reduce((s, c) => s + (c.bonus || 0), 0);

  return {
    missions,
    completed,
    endedMissions,
    createMission,
    deleteMission,
    reconcile,
    recreateMission,
    removeEnded,
    totalCompletedBonus,
  };
}
