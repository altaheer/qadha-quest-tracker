/**
 * Guarded localStorage access.
 *
 * Everything this app knows lives in localStorage, and a hook that parses it
 * bare inside a `useState` initialiser turns one malformed value — a partial
 * write, a quota error mid-save, a hand-edited key — into a throw during render.
 * With no data on a server to fall back to, that leaves a blank screen and no
 * route back to Settings to export or erase. Falling back to a default keeps the
 * app open, which is always the better failure.
 */

/** Reads and parses a key, returning `fallback` if it is missing or unreadable. */
export function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

/** Writes a value, swallowing quota and privacy-mode errors. */
export function safeWriteJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Out of quota, or storage blocked. Nothing useful to do at the call site.
  }
}
