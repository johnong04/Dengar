/**
 * The whole i18n mechanism. No library — specs' hard constraint is NO new dependencies, and a
 * keyed lookup plus one hook is all two languages need.
 *
 * `useCopy()` subscribes through `useSyncExternalStore`, so it works in any component without a
 * provider. That matters here: `src/app/officer/` and `src/app/roadmap/` each have their own
 * `_layout`, and a context mounted at the root Stack is not something every screen is guaranteed
 * to sit under.
 */

import { useSyncExternalStore } from 'react';

import { getLanguage, subscribeLanguage, type Language } from '@/store/language';

import { en, type Copy } from './en';
import { ms } from './ms';

export type { Copy };
export { setLanguage } from '@/store/language';
export type { Language };

const DICT: Record<Language, Copy> = { en, ms };

export function useLanguage(): Language {
  return useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);
}

export function useCopy(): Copy {
  return DICT[useLanguage()];
}
