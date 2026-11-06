import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useUserPrefs } from './useUserPrefs';
import { useStoredState, readStored } from '@/lib/localStore';
import { useLocalDay } from './useLocalDay';
import { useTranslation } from '@/lib/i18n';
import { pendingPrayers, reminderBody, reminderPlan } from '@/lib/reminders';
import type { PrayerHistory } from '@/types';

const EMPTY_HISTORY: PrayerHistory = {};
const PERMISSION_CHANGED = 'notification-permission-changed';
type Permission = NotificationPermission | 'unsupported';
const native = () => Capacitor.isNativePlatform();
const webSupported = () => typeof window !== 'undefined' && 'Notification' in window;
// Serialize native cancel/schedule calls when settings change rapidly.
let nativeQueue: Promise<unknown> = Promise.resolve();
let schedulingError = false;
const errorListeners = new Set<() => void>();
const subscribeError = (listener: () => void) => { errorListeners.add(listener); return () => errorListeners.delete(listener); };
const setError = (value: boolean) => { schedulingError = value; errorListeners.forEach(listener => listener()); };

export function useLocalNotifications(scheduleReminders = false) {
  const { autoMarkMissedTime } = useUserPrefs();
  const { lang } = useTranslation();
  const today = useLocalDay();
  const [history] = useStoredState('prayer-history', EMPTY_HISTORY);
  const [enabled, setEnabled] = useStoredState('notifications-enabled', false);
  const [permission, setPermission] = useState<Permission>('unsupported');
  const error = useSyncExternalStore(subscribeError, () => schedulingError, () => false);
  const [resume, setResume] = useState(0);

  const refresh = useCallback(async () => {
    try {
      if (native()) {
        const { display } = await LocalNotifications.checkPermissions();
        setPermission(display === 'granted' || display === 'denied' ? display : 'default');
      } else setPermission(webSupported() ? Notification.permission : 'unsupported');
      setResume(value => value + 1);
    } catch { setPermission('unsupported'); }
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(PERMISSION_CHANGED, refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener(PERMISSION_CHANGED, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refresh]);

  const requestPermission = useCallback(async () => {
    try {
      const result = native() ? (await LocalNotifications.requestPermissions()).display
        : webSupported() ? await Notification.requestPermission() : 'unsupported';
      const value: Permission = result === 'granted' || result === 'denied' || result === 'unsupported' ? result : 'default';
      setPermission(value);
      if (value === 'granted') setEnabled(true);
      window.dispatchEvent(new Event(PERMISSION_CHANGED));
      return value;
    } catch { setError(true); return 'unsupported' as const; }
  }, [setEnabled]);

  useEffect(() => {
    if (!scheduleReminders) return;
    let cancelled = false;
    let timer: number | undefined;
    const plan = enabled && permission === 'granted' ? reminderPlan(history, autoMarkMissedTime) : [];
    setError(false);
    if (native()) {
      nativeQueue = nativeQueue.catch(() => undefined).then(async () => {
        if (cancelled) return;
        await LocalNotifications.cancel({ notifications: Array.from({ length: 31 }, (_, i) => ({ id: 5100 + i })) });
        if (!plan.length || cancelled) return;
        await LocalNotifications.createChannel({ id: 'prayer-reminders', name: 'Ibadah', importance: 3 });
        await LocalNotifications.schedule({ notifications: plan.map(item => ({
          id: item.id, title: 'Ibadah', body: reminderBody[lang], channelId: 'prayer-reminders',
          smallIcon: 'ic_stat_prayer', schedule: { at: item.at }, extra: { prayerDay: item.day },
        })) });
      }).catch(() => { if (!cancelled) setError(true); });
    } else if (plan[0]) {
      const next = plan[0];
      timer = window.setTimeout(async () => {
        if (cancelled || pendingPrayers(readStored('prayer-history', EMPTY_HISTORY), next.day) === 0) return;
        try {
          const registration = await navigator.serviceWorker?.getRegistration();
          if (registration) await registration.showNotification('Ibadah', { body: reminderBody[lang], tag: next.day });
          else new Notification('Ibadah', { body: reminderBody[lang], tag: next.day });
        } catch { if (!cancelled) setError(true); }
        // Refresh the next web reminder even if the app stays open overnight.
        if (!cancelled) setResume(value => value + 1);
      }, Math.max(0, +next.at - Date.now()));
    }
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, [scheduleReminders, enabled, permission, history, autoMarkMissedTime, lang, today, resume]);

  return { supported: permission !== 'unsupported', permission, requestPermission, refresh, enabled, setEnabled, error, native: native() };
}
