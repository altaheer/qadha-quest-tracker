import { useCallback, useEffect, useState } from 'react';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { getDateString } from '@/lib/date';
import type { DailyPrayers, PrayerStatus } from '@/types';

const LAST_SHOWN_KEY = 'notifications-last-pending-shown';

const PRAYER_KEYS: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function supportsNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function readPrayerHistory(): Record<string, { prayers?: DailyPrayers }> {
  try {
    const raw = localStorage.getItem('prayer-history');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function pendingCountFor(dateKey: string): number {
  const day = readPrayerHistory()[dateKey];
  if (!day?.prayers) return 5;
  return PRAYER_KEYS.filter((k) => {
    const s = day.prayers?.[k]?.status as PrayerStatus | undefined;
    return !s || s === 'pending';
  }).length;
}

function msUntilTime(hhmm: string): number {
  const [hh, mm] = hhmm.split(':').map((n) => parseInt(n, 10));
  const now = new Date();
  const target = new Date();
  target.setHours(hh || 0, mm || 0, 0, 0);
  // Reminder ~30 minutes before the day-reset cutoff.
  target.setMinutes(target.getMinutes() - 30);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

/**
 * Local-only reminder: when notification permission is granted and auto-mark
 * missed is enabled, nudge once near the day-reset time if prayers are pending.
 * No server, no location.
 */
export function useLocalNotifications() {
  const { autoMarkMissed, autoMarkMissedTime } = useUserPrefs();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (!supportsNotifications()) return 'unsupported';
    return Notification.permission;
  });

  const refresh = useCallback(() => {
    if (!supportsNotifications()) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supportsNotifications()) {
      setPermission('unsupported');
      return 'unsupported' as const;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      setPermission('denied');
      return 'denied' as const;
    }
  }, []);

  useEffect(() => {
    if (!supportsNotifications()) return;
    if (Notification.permission !== 'granted') return;
    if (!autoMarkMissed) return;

    let timer: number | undefined;
    let cancelled = false;

    const schedule = () => {
      const delay = Math.max(5_000, msUntilTime(autoMarkMissedTime || '00:00'));
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const today = getDateString(new Date());
        const pending = pendingCountFor(today);
        const last = localStorage.getItem(LAST_SHOWN_KEY);
        if (pending > 0 && last !== today) {
          try {
            new Notification('Ibadah', {
              body:
                pending === 1
                  ? '1 prayer still unmarked today.'
                  : `${pending} prayers still unmarked today.`,
              tag: 'ibadah-pending-prayers',
            });
            localStorage.setItem(LAST_SHOWN_KEY, today);
          } catch {
            // Some browsers need a service worker when the tab is backgrounded.
          }
        }
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [autoMarkMissed, autoMarkMissedTime, permission]);

  return {
    supported: permission !== 'unsupported',
    permission,
    requestPermission,
    refresh,
  };
}
