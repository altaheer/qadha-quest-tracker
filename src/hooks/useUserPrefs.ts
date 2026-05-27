import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark' | 'system';

type Prefs = {
  theme: Theme;
  showArabic: boolean;
};

const KEY = 'app-prefs';
const DEFAULTS: Prefs = { theme: 'system', showArabic: false };

function read(): Prefs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

let state: Prefs = read();
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const getSnapshot = () => state;

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme: Theme = state.theme) {
  if (typeof document === 'undefined') return;
  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  state = { ...state, theme };
  persist();
  applyTheme(theme);
  listeners.forEach((l) => l());
}

export function setShowArabic(showArabic: boolean) {
  state = { ...state, showArabic };
  persist();
  listeners.forEach((l) => l());
}

// React to system changes when theme === 'system'
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.theme === 'system') applyTheme('system');
  });
}

// Initial apply
applyTheme();

export function useUserPrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...prefs, setTheme, setShowArabic };
}
