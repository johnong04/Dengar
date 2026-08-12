import { Text, View } from 'react-native';

import {
  Block,
  FigureRow,
  FigureTag,
  RoadmapScreen,
  SimulatedTag,
} from '@/components/RoadmapChrome';
import { useCopy } from '@/copy';
import {
  CITED,
  CITIZEN_MONTHLY,
  COST_PER_CASE,
  COST_RATIO,
  DISTRICT_EXTENT,
  INDIRECT_PER_CASE,
  OVITRAP_MONTHLY,
} from '@/lib/impact';
import { useDetections } from '@/store/detections';

/**
 * v3 — impact dashboard (specs §5 v3, fifth bullet).
 *
 * THE DANGEROUS SCREEN. An impact dashboard is where invented figures come from, and specs §13
 * rule 2 plus CLAUDE.local.md treat an invented figure as a data-loss-class defect: it is what
 * disqualifies the submission. So this screen is built from the opposite end — the headline is the
 * one COUNT the app actually holds (the local detection log), every derived figure carries its
 * arithmetic from `lib/impact.ts`, and the figure a judge would most expect to see, cases averted,
 * is deliberately ABSENT with the reason printed where the number would have been.
 *
 * There is no efficacy figure in our evidence base linking a detection to a prevented case. Printing
 * one would require inventing a multiplier. The omission block is the most defensible thing here.
 */
export default function RoadmapImpact() {
  const c = useCopy();
  const detections = useDetections();
  const total = detections.length;
  const aedes = detections.filter((d) => d.species === 'aedes').length;

  return (
    <RoadmapScreen
      title={c.roadmap.impactLabel}
      self="impact"
      headline={c.roadmap.impactHeadline}
      standing={c.roadmap.impactStanding}
    >
      <Block heading={c.roadmap.contributed} tag={<SimulatedTag />}>
        <View className="flex-row items-end justify-between py-2">
          <View>
            <Text className="font-mono-medium text-[34px] leading-10 text-ink">{total}</Text>
            <Text className="mt-1 font-plex text-[15px] text-muted">
              {total === 1 ? c.roadmap.detectionLogged : c.roadmap.detectionsLogged}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-mono-medium text-[34px] leading-10 text-ink">{aedes}</Text>
            <Text className="mt-1 font-plex text-[15px] text-muted">
              {aedes === 1 ? c.roadmap.wasAedes : c.roadmap.wereAedes}
            </Text>
          </View>
        </View>
        <Text className="mt-1 font-plex text-[15px] leading-6 text-muted">
          {c.roadmap.contributedNote}
        </Text>
      </Block>

      <Block heading={c.roadmap.districtExtent}>
        {/* "footprint", not "area covered": the caption below already has to walk back a coverage
            claim, and a label that does not make one is better than a caption that undoes it. */}
        <FigureRow label={c.roadmap.mapFootprint} figure={DISTRICT_EXTENT} />
        <Text className="font-mono text-[12px] text-muted">{c.roadmap.boundsNote}</Text>
        <Text className="mt-2 font-plex text-[15px] leading-6 text-muted">
          {c.roadmap.extentNote}
        </Text>
      </Block>

      <Block heading={c.roadmap.costHeading}>
        <FigureRow label={c.roadmap.citizenReports} figure={CITIZEN_MONTHLY} />
        <View className="h-px bg-line" />
        <FigureRow label={c.roadmap.ovitraps} figure={OVITRAP_MONTHLY} />
        <View className="h-px bg-line" />
        <FigureRow label={c.roadmap.difference} figure={COST_RATIO} />
        <Text className="mt-2 font-plex text-[15px] leading-6 text-muted">
          {c.roadmap.costNote}
        </Text>
      </Block>

      <Block heading={c.roadmap.caseCostHeading}>
        <FigureRow label={c.roadmap.perCase} figure={COST_PER_CASE} />
        <View className="h-px bg-line" />
        <FigureRow label={c.roadmap.lostWages} figure={INDIRECT_PER_CASE} />
        <View className="flex-row items-start justify-between border-t border-line py-3">
          <View className="shrink pr-4">
            <Text className="font-plex text-[16px] leading-6 text-ink">{c.roadmap.daysLost}</Text>
            <Text className="mt-1 font-mono text-[12px] text-muted">{c.roadmap.workSchool}</Text>
          </View>
          <View className="items-end">
            <Text className="font-mono-medium text-[17px] text-ink">
              {CITED.workdaysLost} · {CITED.schoolDaysLost}
            </Text>
            <View className="mt-1">
              <FigureTag tag="cited" />
            </View>
          </View>
        </View>
      </Block>

      {/* The absence, printed. Same block weight as a figure — an omission that looks like a
          footnote reads as an oversight rather than a decision. */}
      <Block>
        <View className="flex-row items-start justify-between py-2">
          <Text className="shrink pr-4 font-plex-medium text-[16px] leading-6 text-ink">
            {c.roadmap.casesAverted}
          </Text>
          <Text className="font-mono text-[17px] text-muted">{c.roadmap.notShown}</Text>
        </View>
        <Text className="font-plex text-[16px] leading-6 text-muted">
          {c.roadmap.casesAvertedReason}
        </Text>
      </Block>

      <Text className="mt-5 font-mono text-[12px] leading-5 text-muted">
        {c.roadmap.tagFootnote}
      </Text>
    </RoadmapScreen>
  );
}
