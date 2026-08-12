/**
 * Dispatch acknowledgement — the officer half of specs.md §5 v2 ("officer view: alert feed,
 * 'fog within 48 hrs' directive card, dispatch acknowledgement").
 *
 * ONE in-memory record shared by every officer screen, published through `useSyncExternalStore`,
 * so acknowledging on the cluster sheet updates the alert feed and the home directive card with no
 * reload and no prop drilling (ponytail: module singleton until there is a backend to persist to).
 *
 * NO FIGURE IS TYPED IN HERE that another figure could contradict:
 *   · the directive belongs to `activeCluster` — the only cluster the seeded district has;
 *   · row state is computed from that, never stored per row;
 *   · recency is read off each area's own spark, the one hand-written input in `data/district.ts`;
 *   · the acknowledgement stamp is `district.stamp` reformatted, not a second clock;
 *   · the 48 h window is the same one `FOG_BY_STAMP` was built from (stamp + 48 h).
 *
 * Everything here is SIMULATED, including the duty officer. Every screen that renders it carries
 * the `simulated` marker (COMMON rule 8 / specs.md §8).
 */

import { useEffect, useState, useSyncExternalStore } from 'react';

import type { Copy } from '@/copy';
import { activeCluster, district, watchAreas, type WatchArea } from '@/data/district';

/**
 * Fogging window, hours. specs.md §5 v2 names the directive "fog within 48 hrs"; `FOG_BY_STAMP`
 * in `data/district.ts` is `district.stamp` + this window, so the countdown below and the deadline
 * on screen are the same 48 h expressed twice, not two numbers that could drift.
 */
export const FOG_WINDOW_H = 48;

/** Seeded duty officer. An identity, not a figure — and declared simulated wherever it renders. */
export const dutyOfficer = { name: 'R. Kamarudin', badge: 'DHD-SPK-04' } as const;

/**
 * The scenario clock in record form ('12 AUG 07:04'), derived from `district.stamp`
 * ('TUE 12 AUG · 07:04') rather than retyped.
 *
 * It stamps both the directive and the signature, and that is not a shortcut: `FOG_BY_STAMP` is
 * already `district.stamp` + 48 h, so slice 14 had ALREADY fixed the directive's window as starting
 * at the district stamp. A second issue time here would contradict a deadline that is on screen.
 */
export const RECORD_STAMP = district.stamp.replace(/^\S+\s+/, '').replace(' · ', ' ');

export type Acknowledgement = {
  /** Cluster the record belongs to. */
  clusterId: string;
  /** Record stamp, scenario clock. */
  at: string;
  /** Real-time origin the countdown runs from. */
  originMs: number;
  by: typeof dutyOfficer;
};

let record: Acknowledgement | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function read(): Acknowledgement | null {
  return record;
}

/** Sign the directive. Idempotent — a record is signed once, and re-tapping never re-stamps it. */
export function acknowledge(): void {
  if (record) return;
  record = { clusterId: activeCluster.id, at: RECORD_STAMP, originMs: Date.now(), by: dutyOfficer };
  emit();
}

/** Test/demo reset. */
export function clearAcknowledgement(): void {
  record = null;
  emit();
}

/** Reactive read of the record. */
export function useAcknowledgement(): Acknowledgement | null {
  return useSyncExternalStore(subscribe, read, read);
}

/* ── the feed ──────────────────────────────────────────────────────────────────────────────── */

/** Row state — the three the officer feed distinguishes. */
export type DirectiveState = 'directive' | 'acknowledged' | 'watch';

/**
 * The row label for a state. The words live in `src/copy/` (slice 18) — this module owns the state
 * machine, not its vocabulary, so the officer feed reads the label out of the lookup instead.
 */
export function stateLabel(state: DirectiveState, c: Copy): string {
  return state === 'directive'
    ? c.officer.stateDirective
    : state === 'acknowledged'
      ? c.officer.stateAcknowledged
      : c.officer.stateWatch;
}

export type AlertRow = {
  area: WatchArea;
  state: DirectiveState;
  /**
   * Days since this area's last detection, read off its own spark. `null` means it never fired
   * inside the 14-day series.
   */
  lastSeenDays: number | null;
};

function daysSinceLast(spark: readonly number[]): number | null {
  for (let i = spark.length - 1; i >= 0; i--) if (spark[i] > 0) return spark.length - 1 - i;
  return null;
}

function rowsFor(ack: Acknowledgement | null): readonly AlertRow[] {
  return watchAreas.map((area) => ({
    area,
    state:
      area.id !== activeCluster.id
        ? 'watch'
        : ack && ack.clusterId === area.id
          ? 'acknowledged'
          : 'directive',
    lastSeenDays: daysSinceLast(area.spark),
  }));
}

/** The feed, recomputed whenever the record changes. */
export function useAlertFeed(): readonly AlertRow[] {
  return rowsFor(useAcknowledgement());
}

/* ── the countdown ─────────────────────────────────────────────────────────────────────────── */

export type Countdown = {
  hours: number;
  minutes: number;
  /** 0…1 of the 48 h window consumed — the record's progress rule. */
  elapsed: number;
  overdue: boolean;
};

const WINDOW_MS = FOG_WINDOW_H * 3600_000;
const TICK_MS = 30_000; // minute resolution on screen; half-minute tick so it is never stale

/**
 * Time left of the 48 h window. The scenario clock starts at the acknowledgement and advances with
 * real elapsed time, so the record reads `48 h 00 m` the moment it is signed and counts down from
 * there. Minute resolution: an officer decides in hours, and a seconds digit would be motion for
 * its own sake on a screen whose only animation budget is state (design-system.md §Motion).
 */
export function useFogCountdown(ack: Acknowledgement): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(t);
  }, [ack]);

  const left = WINDOW_MS - (now - ack.originMs);
  const clamped = Math.max(0, left);
  return {
    hours: Math.floor(clamped / 3600_000),
    minutes: Math.floor((clamped % 3600_000) / 60_000),
    elapsed: Math.min(1, Math.max(0, 1 - clamped / WINDOW_MS)),
    overdue: left <= 0,
  };
}
