/**
 * In-memory detection store. Minimal interface on purpose — real persistence swaps in behind the
 * same functions at the next native build (ponytail: module singleton until then).
 */

import { useSyncExternalStore } from 'react';

import type { Species, SpeciesDetail } from '@/inference/gating';

export type Detection = {
  id: string;
  /** ISO 8601 timestamp of the encounter. */
  at: string;
  species: Species;
  confidence: number;
  detail?: SpeciesDetail;
  synced: boolean;
};

// Seeded with plausible entries so history/officer slices have something to render.
let detections: Detection[] = [
  {
    id: 'seed-1',
    at: '2026-08-11T21:42:00+08:00',
    species: 'aedes',
    confidence: 0.91,
    detail: { taxon: { name: 'Aedes aegypti', confidence: 0.84 }, sex: { value: 'female', confidence: 0.77 } },
    synced: true,
  },
  {
    id: 'seed-2',
    at: '2026-08-10T19:05:00+08:00',
    species: 'not_aedes',
    confidence: 0.82,
    synced: true,
  },
  {
    id: 'seed-3',
    at: '2026-08-12T06:58:00+08:00',
    species: 'aedes',
    confidence: 0.74,
    synced: false,
  },
];

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function list(): readonly Detection[] {
  return detections;
}

export function add(detection: Detection): void {
  detections = [detection, ...detections];
  emit();
}

export function pendingSyncCount(): number {
  return detections.filter((d) => !d.synced).length;
}

export function clearAll(): void {
  detections = [];
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive read of the store for screens. */
export function useDetections(): readonly Detection[] {
  return useSyncExternalStore(subscribe, list, list);
}
