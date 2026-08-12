import { Text, View } from 'react-native';

import { Block, FigureTag, RoadmapScreen, SimulatedTag } from '@/components/RoadmapChrome';
import { type Copy, useCopy } from '@/copy';
import type { SpeciesDetail } from '@/inference/gating';
import { CITED } from '@/lib/impact';

/**
 * v3 — fine-grained detection explainer (specs §5 v3, third bullet).
 *
 * The `detail` fields are already in the frozen contract (specs §4) as INDEPENDENTLY OPTIONAL, and
 * the result screen renders whichever heads reported. This screen renders the full set from seeded
 * data to show what the fields would say — and, more importantly, why the app bothers asking:
 * only females bite, and only a female that has already fed can carry dengue forward. That is the
 * difference between a nuisance and a transmission event, and it is the whole case for the heads.
 *
 * NOT a verdict screen: no drench, no `alert` ground. aedes-red is reserved for an actual positive
 * Aedes verdict (COMMON rule 5); the single 8 px dot is the same mark the history log already uses
 * for a logged Aedes row, and it is the only red on this screen.
 *
 * Every number here is either a seeded confidence (declared `simulated`) or a `[cited]` accuracy
 * from specs §9. Nothing is derived, and nothing is invented.
 */

/** Seeded, and declared as such. Taxon and sex mirror the store's seed-1 entry. */
const SEEDED: Required<SpeciesDetail> = {
  taxon: { name: 'Aedes aegypti', confidence: 0.84 },
  sex: { value: 'female', confidence: 0.77 },
  gravid: { value: true, confidence: 0.61 },
};

type Head = {
  label: string;
  value: string;
  confidence: number;
  /** Why the field exists — never decoration. */
  why: string;
  /** Contract status, stated plainly (specs §4/§6). */
  status: string;
};

const headsOf = (c: Copy): Head[] => [
  {
    label: c.roadmap.headSpecies,
    value: SEEDED.taxon.name,
    confidence: SEEDED.taxon.confidence,
    why: c.roadmap.whySpecies,
    status: c.roadmap.statusInContract,
  },
  {
    label: c.roadmap.headSex,
    value: c.roadmap.sexFemale,
    confidence: SEEDED.sex.confidence,
    why: c.roadmap.whySex,
    status: c.roadmap.statusInContract,
  },
  {
    label: c.roadmap.headGravid,
    value: SEEDED.gravid.value ? c.common.yes : c.common.no,
    confidence: SEEDED.gravid.confidence,
    why: c.roadmap.whyGravid,
    status: c.roadmap.statusNoHead,
  },
];

/**
 * Confidence as a filled bar — composed from two Views, because a chart library is a native module
 * and a native module costs a 1.5 h EAS rebuild (COMMON rule 1). Width is a percentage on `style`;
 * the track is the same `line` token the gauges elsewhere use.
 */
function ConfidenceBar({ confidence }: { confidence: number }) {
  return (
    <View className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-line">
      <View
        className="h-1 rounded-pill bg-primary"
        style={{ width: `${Math.round(confidence * 100)}%` }}
      />
    </View>
  );
}

function HeadRow({ head, first }: { head: Head; first: boolean }) {
  return (
    <View className={first ? 'py-3' : 'border-t border-line py-3'}>
      <View className="flex-row items-baseline justify-between">
        <Text className="font-plex text-[15px] text-muted">{head.label}</Text>
        <Text className="font-mono-medium text-[17px] text-ink">{head.confidence.toFixed(2)}</Text>
      </View>
      <Text className="mt-1 font-plex-medium text-[16px] text-ink">{head.value}</Text>
      <ConfidenceBar confidence={head.confidence} />
      <Text className="mt-2 font-plex text-[15px] leading-6 text-muted">{head.why}</Text>
      <Text className="mt-1 font-mono text-[12px] text-muted">{head.status}</Text>
    </View>
  );
}

export default function RoadmapDetail() {
  const c = useCopy();
  const HEADS = headsOf(c);
  return (
    <RoadmapScreen
      title={c.roadmap.detailLabel}
      self="detail"
      headline={c.roadmap.detailHeadline}
      standing={c.roadmap.detailStanding}
    >
      <Block heading={c.roadmap.reading} tag={<SimulatedTag />}>
        <View className="flex-row items-center gap-2 pb-1 pt-1">
          {/* the vector's mark — same 8 px dot the history log uses, the only red here */}
          <View className="h-2 w-2 rounded-full bg-alert" />
          <Text className="font-plex-semibold text-[20px] text-ink">{c.history.aedes}</Text>
          <Text className="font-mono text-[13px] text-muted">{c.roadmap.verdict('0.91')}</Text>
        </View>
        {HEADS.map((h, i) => (
          <HeadRow key={h.label} head={h} first={i === 0} />
        ))}
      </Block>

      <Block heading={c.roadmap.whyItMatters} tint="guide">
        <Text className="font-plex text-[16px] leading-6 text-tint-guide-ink">
          {c.roadmap.detailWhyA}
        </Text>
        <Text className="mt-3 font-plex text-[16px] leading-6 text-tint-guide-ink">
          {c.roadmap.detailWhyB}
        </Text>
      </Block>

      <Block heading={c.roadmap.evidenceHeading}>
        <View className="flex-row items-start justify-between py-3">
          <Text className="shrink pr-4 font-plex text-[16px] leading-6 text-ink">
            {c.roadmap.evidenceSpeciesSex}
          </Text>
          <View className="items-end">
            <Text className="font-mono-medium text-[17px] text-ink">
              {CITED.speciesSexControlledPct}%
            </Text>
            <View className="mt-1">
              <FigureTag tag="cited" />
            </View>
          </View>
        </View>
        <View className="flex-row items-start justify-between border-t border-line py-3">
          <Text className="shrink pr-4 font-plex text-[16px] leading-6 text-ink">
            {c.roadmap.evidenceFourSpecies}
          </Text>
          <View className="items-end">
            <Text className="font-mono-medium text-[17px] text-ink">
              {CITED.fourSpeciesLowPct}–{CITED.fourSpeciesHighPct}%
            </Text>
            <View className="mt-1">
              <FigureTag tag="cited" />
            </View>
          </View>
        </View>
        <View className="flex-row items-start justify-between border-t border-line py-3">
          <Text className="shrink pr-4 font-plex text-[16px] leading-6 text-ink">
            {c.roadmap.evidenceOutdoor}
          </Text>
          <View className="items-end">
            <Text className="font-mono-medium text-[17px] text-ink">{CITED.outdoorNoisePct}%</Text>
            <View className="mt-1">
              <FigureTag tag="cited" />
            </View>
          </View>
        </View>
        <Text className="mt-2 font-plex text-[15px] leading-6 text-muted">
          {c.roadmap.evidenceNote}
        </Text>
      </Block>
    </RoadmapScreen>
  );
}
