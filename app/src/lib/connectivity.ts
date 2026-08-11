/**
 * Web connectivity source: navigator.onLine seeded, online/offline events after that.
 * In-memory, defaults to online. Native has no navigator.onLine — the native NetInfo
 * source plugs in behind this same module (same subscribe/isOnline surface) at the
 * next native build.
 */

import { useSyncExternalStore } from 'react';

let online =
  typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;

const listeners = new Set<() => void>();

function set(next: boolean): void {
  if (next === online) return;
  online = next;
  for (const l of listeners) l();
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('online', () => set(true));
  window.addEventListener('offline', () => set(false));
}

export function isOnline(): boolean {
  return online;
}

export function subscribeConnectivity(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getServerSnapshot = () => true;

/** Reactive connectivity read for screens. */
export function useConnectivity(): boolean {
  return useSyncExternalStore(subscribeConnectivity, isOnline, getServerSnapshot);
}
