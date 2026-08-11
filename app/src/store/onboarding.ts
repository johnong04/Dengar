/**
 * First-run flag. Web persists via localStorage; anywhere that throws or lacks it (private mode,
 * native until the storage dep lands) falls back to in-memory for the session. Native persistence
 * swaps in behind these same two functions later.
 */

const KEY = 'dengar.onboarded';

let memory = false;

export function isOnboarded(): boolean {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(KEY) === '1';
  } catch {
    // storage blocked — memory fallback below
  }
  return memory;
}

export function markOnboarded(): void {
  memory = true;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, '1');
  } catch {
    // storage blocked — memory flag already set
  }
}
