/**
 * In-memory detection store. Minimal interface on purpose — real persistence swaps in behind the
 * same functions at the next native build (ponytail: module singleton until then).
 */

import { useSyncExternalStore } from 'react';

import type { Species, SpeciesDetail } from '@/inference/gating';
import { isOnline, subscribeConnectivity } from '@/lib/connectivity';

export type Detection = {
  id: string;
  /** ISO 8601 timestamp of the encounter. */
  at: string;
  species: Species;
  confidence: number;
  detail?: SpeciesDetail;
  synced: boolean;
};

/**
 * Seeded log. Mock data, and deliberately EIGHT entries rather than three.
 *
 * Three rows left roughly 350 px of empty ground under the log at 390 — a screen that reads as a
 * prototype rather than as a record, which is the same defect plan §diagnosis 6 names on capture.
 * A citizen who has been using this for a fortnight has a log, and the log is the evidence that the
 * district map above it is built out of individual encounters.
 *
 * The mix is honest about what the instrument actually does: most captures that reach the log are
 * Aedes or not-Aedes calls the model stood behind, the confidences sit across the real band rather
 * than all near 1.0, and the two most recent are unsynced so the queue chip and the sheet's sync
 * row both have something true to say. Abstains are NOT in here — they are never logged, which is
 * the whole reason the abstain screens exist.
 */
let detections: Detection[] = [
  {
    id: 'seed-1',
    at: '2026-09-04T07:12:00+08:00',
    species: 'aedes',
    confidence: 0.74,
    detail: { taxon: { name: 'Aedes aegypti', confidence: 0.71 } },
    synced: false,
  },
  {
    id: 'seed-2',
    at: '2026-09-03T21:42:00+08:00',
    species: 'aedes',
    confidence: 0.91,
    detail: {
      taxon: { name: 'Aedes aegypti', confidence: 0.84 },
      sex: { value: 'female', confidence: 0.77 },
    },
    synced: false,
  },
  {
    id: 'seed-3',
    at: '2026-09-03T06:58:00+08:00',
    species: 'not_aedes',
    confidence: 0.69,
    synced: true,
  },
  {
    id: 'seed-4',
    at: '2026-09-02T19:05:00+08:00',
    species: 'not_aedes',
    confidence: 0.82,
    synced: true,
  },
  {
    id: 'seed-5',
    at: '2026-09-02T08:20:00+08:00',
    species: 'aedes',
    confidence: 0.88,
    detail: {
      taxon: { name: 'Aedes albopictus', confidence: 0.79 },
      sex: { value: 'female', confidence: 0.73 },
      gravid: { value: true, confidence: 0.64 },
    },
    synced: true,
  },
  {
    id: 'seed-6',
    at: '2026-09-01T22:14:00+08:00',
    species: 'aedes',
    confidence: 0.79,
    detail: { taxon: { name: 'Aedes aegypti', confidence: 0.76 } },
    synced: true,
  },
  {
    id: 'seed-7',
    at: '2026-08-31T18:47:00+08:00',
    species: 'not_aedes',
    confidence: 0.73,
    synced: true,
  },
  {
    id: 'seed-8',
    at: '2026-08-30T20:33:00+08:00',
    species: 'aedes',
    confidence: 0.86,
    detail: {
      taxon: { name: 'Aedes aegypti', confidence: 0.81 },
      sex: { value: 'male', confidence: 0.68 },
    },
    synced: true,
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
  scheduleSync(); // a detection logged while online drains to the backend shortly
}

export function pendingSyncCount(): number {
  return detections.filter((d) => !d.synced).length;
}

// Fake sync (ponytail: real uploader swaps in behind scheduleSync at the next native build).
// One timer; runs only while online with a queue. Offline cancels it — nothing is lost, the
// queue just waits for the next online flip.
const SYNC_MS = 3000;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync(): void {
  if (syncTimer !== null || !isOnline() || pendingSyncCount() === 0) return;
  syncTimer = setTimeout(() => {
    syncTimer = null;
    if (!isOnline()) return; // flipped offline between schedule and fire
    detections = detections.map((d) => (d.synced ? d : { ...d, synced: true }));
    emit();
  }, SYNC_MS);
}

function cancelSync(): void {
  if (syncTimer !== null) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
}

subscribeConnectivity(() => {
  if (isOnline()) scheduleSync();
  else cancelSync();
});
scheduleSync(); // app may open online with a queue from a previous offline session

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
