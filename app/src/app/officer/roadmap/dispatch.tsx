import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoadmapHeader } from '@/components/RoadmapHeader';
import { type Copy, useCopy } from '@/copy';
import { activeCluster } from '@/data/district';
import {
  blockGrid,
  dispatchRoute,
  economics,
  ledger,
  type BlockTarget,
  type LedgerRow,
} from '@/data/roadmap';

// v3 ROADMAP — SURGICAL DISPATCH (specs.md §5 v3: "block-level fogging targets, cost-per-case-
// averted readout").
//
// Two claims on this screen, and they are different kinds of claim, so they are styled apart:
//
//  1. WHERE the truck goes. Slice 14's block grid, promoted from a strip in the cluster sheet to
//     the real 2×4 ground layout, with each block's detection count counted geometrically from the
//     same seeded coordinates the map draws. Priority is a DECLARED recency weighting, printed
//     under the grid — it is a modelling choice, not a figure, and it does not pretend to be one.
//
//  2. WHAT it costs. Every economic figure traces to specs §9 and nothing is asserted without its
//     arithmetic beside it (specs §13 rule 2). The headline is a RATIO — cost per case averted
//     scales with the ground fogged — because the absolute needs a cases-averted denominator and
//     specs §11 item 3 says plainly that we do not have one. Both assumptions behind the ratio are
//     printed on the same line as the number, and the closing note says what the screen is not
//     claiming. An invented denominator wearing a big number is the defect that disqualifies a
//     submission; a stated open term is Seed Track working correctly.
//
// No chart library (COMMON rule 1): the comparison is two Views whose widths are the two footprints.

const CELL_H = 62;
const BAR_H = 14;

function Eyebrow({ children }: { children: string }) {
  return (
    <Text className="font-plex-medium text-[10px] uppercase tracking-[1.2px] text-o-muted">
      {children}
    </Text>
  );
}

/**
 * One block. Targets are solid `o-alert` — an officer alert state, which is the one place aedes-red
 * is permitted on this surface — carrying a white priority chip; quiet blocks are `o-surface` and
 * read as ground, not as a weaker alarm.
 */
function BlockCell({ b }: { b: BlockTarget }) {
  const c = useCopy();
  const target = b.priority !== null;
  return (
    <View
      className={`flex-1 justify-between rounded-card px-2 py-2 ${target ? 'bg-o-alert' : 'bg-o-surface'}`}
      style={{ height: CELL_H }}
    >
      <View className="flex-row items-center justify-between">
        <Text className={`font-mono-medium text-[13px] ${target ? 'text-o-bg' : 'text-o-muted'}`}>
          {b.id}
        </Text>
        {target ? (
          <View className="rounded-pill bg-o-bg px-1.5">
            <Text className="font-mono-medium text-[10px] text-o-alert">P{b.priority}</Text>
          </View>
        ) : null}
      </View>
      <Text className={`font-mono text-[11px] ${target ? 'text-o-bg' : 'text-o-muted'}`}>
        {c.officer.det(b.detections)}
      </Text>
    </View>
  );
}

/** A footprint bar. Width is the share of ground, so the two bars ARE the comparison. */
function FootprintBar({
  name,
  detail,
  share,
  tone,
}: {
  name: string;
  detail: string;
  share: number;
  tone: 'target' | 'blanket';
}) {
  return (
    <View className="mt-2.5">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-plex-medium text-[13px] text-o-ink">{name}</Text>
        <Text className="font-mono text-[11px] text-o-muted">{detail}</Text>
      </View>
      {/* Height goes on `style` so the track and the fill are driven by one constant — the fill's
          width is computed at runtime, and a class-set track height could drift from it silently.
          NOT because decimal classes are broken: `h-1.5` measures 6px live, and `mt-1.5` on this
          very line works. Bars measure 350x14, fill 135.1px = 38.6%, matching the stated share. */}
      <View className="mt-1.5 w-full flex-row" style={{ height: BAR_H }}>
        <View
          /* Blanket is a solid neutral mass, not an empty track: an outlined bar reads as a
             progress rail waiting to be filled, and the point is that the blanket sortie is the
             heavier of the two, not the target the targeted one is chasing. */
          className={`rounded-[3px] ${tone === 'target' ? 'bg-o-primary' : 'bg-o-muted'}`}
          style={{ width: `${share * 100}%`, height: BAR_H }}
        />
      </View>
    </View>
  );
}

/** Ledger caption key → prose. `data/roadmap.ts` emits the key and the arithmetic, never words. */
function ledgerNote(note: LedgerRow['note'], c: Copy): string {
  switch (note) {
    case 'national':
      return c.officer.ledgerNational;
    case 'district':
      return c.officer.ledgerDistrict;
    case 'fogging':
      return c.officer.ledgerFogging;
    case 'released':
      return c.officer.ledgerReleased;
    case 'programme':
      return c.officer.ledgerProgramme;
    case 'input':
      return c.officer.ledgerInput;
  }
}

function LedgerLine({ row }: { row: LedgerRow }) {
  const c = useCopy();
  return (
    <View className="flex-row items-baseline gap-2 border-t border-o-line py-2">
      <View className="flex-1">
        {/* The ` = ` lives INSIDE the result string: a flex gap between two <Text> nodes collapses
            here, and `× 92.2%=USD 67.8M` is arithmetic a reader has to decode rather than check. */}
        <View className="flex-row flex-wrap items-baseline">
          <Text className="font-mono text-[12px] text-o-ink">{row.math}</Text>
          {row.result ? (
            <Text className="font-mono-medium text-[12px] text-o-ink">{` = ${row.result}`}</Text>
          ) : null}
        </View>
        <Text className="mt-[2px] font-plex text-[11px] text-o-muted">
          {ledgerNote(row.note, c)}
        </Text>
      </View>
      <Text
        className={`font-mono text-[10px] ${row.tag === 'cited' ? 'text-o-ok' : 'text-o-caution'}`}
      >
        {row.tag}
      </Text>
    </View>
  );
}

export default function RoadmapDispatch() {
  const c = useCopy();
  return (
    <SafeAreaView className="flex-1 bg-o-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <RoadmapHeader
          title={c.officer.dispatchTitle}
          kicker={c.officer.dispatchKicker(
            activeCluster.area,
            activeCluster.detections,
            activeCluster.windowHours,
          )}
        />

        {/* ── where the truck goes ────────────────────────────────────────── */}
        <View className="mt-4 px-5">
          <Eyebrow>{c.officer.foggingTargets}</Eyebrow>
          <View className="mt-2 gap-2">
            {blockGrid.map((row, r) => (
              <View key={r} className="flex-row gap-2">
                {row.map((b) => (
                  <BlockCell key={b.id} b={b} />
                ))}
              </View>
            ))}
          </View>
          <View className="mt-2.5 flex-row items-baseline justify-between gap-3">
            <Text className="font-plex-medium text-[13px] text-o-ink">
              {c.officer.dispatchOrder}
            </Text>
            <Text className="font-mono-medium text-[13px] text-o-alert">
              {dispatchRoute.join(' → ')}
            </Text>
          </View>
          <Text className="mt-1 font-plex text-[11px] text-o-muted">{c.officer.priorityNote}</Text>
        </View>

        {/* ── the footprint ───────────────────────────────────────────────── */}
        <View className="mt-5 px-5">
          <Eyebrow>{c.officer.footprint}</Eyebrow>
          <FootprintBar
            name={c.officer.blanket}
            detail={`${c.officer.blocks(blockGrid.flat().length)} · ${economics.totalKm2.toFixed(3)} km²`}
            share={1}
            tone="blanket"
          />
          <FootprintBar
            name={c.officer.targeted}
            detail={`${c.officer.blocks(dispatchRoute.length)} · ${economics.targetKm2.toFixed(3)} km²`}
            share={economics.footprintShare}
            tone="target"
          />
          <Text className="mt-2 font-mono text-[11px] text-o-muted">
            {economics.targetKm2.toFixed(3)} ÷ {economics.totalKm2.toFixed(3)} ={' '}
            {(economics.footprintShare * 100).toFixed(1)}% {c.officer.ofTheGround}
          </Text>
        </View>

        {/* ── the readout ─────────────────────────────────────────────────── */}
        <View className="mt-5 px-5">
          <View className="rounded-card bg-o-surface px-4 py-3.5">
            <Eyebrow>{c.officer.costPerCaseAverted}</Eyebrow>
            <View className="mt-1 flex-row items-baseline gap-2">
              <Text className="font-mono-medium text-[30px] text-o-ink">
                {economics.costFactor.toFixed(1)}×
              </Text>
              <Text className="font-plex-medium text-[15px] text-o-ink">
                {c.officer.lowerThanBlanket}
              </Text>
            </View>
            <Text className="mt-1 font-mono text-[11px] text-o-muted">
              1 ÷ {(economics.footprintShare * 100).toFixed(1)}% = {economics.costFactor.toFixed(2)}
            </Text>
            <Text className="mt-2 font-plex text-[13px] text-o-muted">
              {c.officer.costAssumption}
            </Text>
          </View>
        </View>

        {/* ── the ledger ──────────────────────────────────────────────────── */}
        <View className="mt-5 px-5">
          <Eyebrow>{c.officer.whereMoney}</Eyebrow>
          <View className="mt-1">
            {ledger.map((row) => (
              <LedgerLine key={row.note} row={row} />
            ))}
          </View>
        </View>

        {/* ── what this screen does not claim ─────────────────────────────── */}
        <View className="mt-3 px-5">
          <Text className="font-plex text-[13px] text-o-muted">{c.officer.notClaimed}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
