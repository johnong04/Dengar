/**
 * Language choice. Same wrapper pattern as `store/onboarding.ts`: web persists via localStorage;
 * anywhere that throws or lacks it (private mode, native until the storage dep lands) falls back to
 * in-memory for the session. Native persistence swaps in behind these same functions later.
 *
 * Published through a listener set rather than context, so `useCopy()` works in any component
 * without a provider — including the officer stack, which has its own `_layout`.
 */

export type Language = 'en' | 'ms';

const KEY = 'dengar.language';

function load(): Language {
  try {
    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem(KEY);
      if (v === 'ms' || v === 'en') return v;
    }
  } catch {
    // storage blocked — English default below
  }
  return 'en';
}

let current: Language = load();
const listeners = new Set<() => void>();

export function getLanguage(): Language {
  return current;
}

export function setLanguage(next: Language): void {
  if (next === current) return;
  current = next;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, next);
  } catch {
    // storage blocked — in-memory value already set
  }
  for (const l of listeners) l();
}

export function subscribeLanguage(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
