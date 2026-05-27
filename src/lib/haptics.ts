/**
 * Lightweight haptic feedback helpers.
 * No-ops on devices without the Vibration API (e.g. iOS Safari, desktop).
 */

function vibrate(pattern: number | number[]) {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(25),
  strong: () => vibrate([50, 30, 50]),
};
