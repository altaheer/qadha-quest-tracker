import { useCallback, useMemo, useSyncExternalStore } from 'react';

const CHANGE = 'app-storage-changed';

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function notifyStorage() {
  window.dispatchEvent(new Event(CHANGE));
}

/** Write a group before notifying readers, rolling back if storage is full. */
export function writeStorage(entries: Record<string, string | null>) {
  const previous = Object.fromEntries(Object.keys(entries).map(key => [key, localStorage.getItem(key)]));
  try {
    for (const [key, value] of Object.entries(entries)) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
  } catch (error) {
    for (const [key, value] of Object.entries(previous)) {
      if (value === null) localStorage.removeItem(key);
      else if (localStorage.getItem(key) !== value) localStorage.setItem(key, value);
    }
    throw error;
  }
  notifyStorage();
}

const subscribe = (listener: () => void) => {
  window.addEventListener(CHANGE, listener);
  window.addEventListener('storage', listener);
  // Compatibility with the setup/onboarding code and older data writers.
  window.addEventListener('qadha-updated', listener);
  window.addEventListener('prayer-history-updated', listener);
  return () => {
    window.removeEventListener(CHANGE, listener);
    window.removeEventListener('storage', listener);
    window.removeEventListener('qadha-updated', listener);
    window.removeEventListener('prayer-history-updated', listener);
  };
};

/** localStorage is the source of truth, including inside functional updates. */
export function useStoredState<T>(key: string, fallback: T) {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(key), () => null);
  const value = useMemo(() => {
    try { return raw === null ? fallback : JSON.parse(raw) as T; }
    catch { return fallback; }
  }, [raw, fallback]);
  const setValue = useCallback((update: T | ((previous: T) => T)) => {
    const next = typeof update === 'function'
      ? (update as (previous: T) => T)(readStored(key, fallback))
      : update;
    writeStorage({ [key]: JSON.stringify(next) });
  }, [key, fallback]);
  return [value, setValue] as const;
}
