import { useEffect, useState } from 'react';
import { getTodayString } from '@/lib/date';

/** Refresh the selected default day at midnight and after resuming the app. */
export function useLocalDay() {
  const [day, setDay] = useState(getTodayString);
  useEffect(() => {
    const update = () => setDay(getTodayString());
    const timer = window.setInterval(update, 30_000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return day;
}
