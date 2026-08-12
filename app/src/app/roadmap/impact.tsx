import { Text, View } from 'react-native';

import {
  Block,
  FigureRow,
  FigureTag,
  RoadmapScreen,
  SimulatedTag,
} from '@/components/RoadmapChrome';
import {
  CITED,
  CITIZEN_MONTHLY,
  COST_PER_CASE,
  COST_RATIO,
  DISTRICT_EXTENT,
  INDIRECT_PER_CASE,
  OMITTED_CASES_AVERTED,
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
  const detections = useDetections();
  const total = detections.length;
  const aedes = detections.filter((d) => d.species === 'aedes').length;

  return (
    <RoadmapScreen
      title="Impact"
      self="impact"
      headline={'What your taps\nadd up to.'}
      standing="Not built yet — there is no fleet behind this, only your own log. Every derived figure below shows the arithmetic that produced it."
    >
      <Block heading="contributed" tag={<SimulatedTag />}>
        <View className="flex-row items-end justify-between py-2">
          <View>
            <Text className="font-mono-medium text-[34px] leading-10 text-ink">{total}</Text>
            <Text className="mt-1 font-plex text-[15px] text-muted">
              {total === 1 ? 'detection logged' : 'detections logged'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-mono-medium text-[34px] leading-10 text-ink">{aedes}</Text>
            <Text className="mt-1 font-plex text-[15px] text-muted">
              {aedes === 1 ? 'was Aedes' : 'were Aedes'}
            </Text>
          </View>
        </View>
        <Text className="mt-1 font-plex text-[15px] leading-6 text-muted">
          Counted from this device&apos;s log, which is seeded for the demo. This is the only figure
          on the screen that is a count rather than an estimate.
        </Text>
      </Block>

      <Block heading="district extent">
        {/* "footprint", not "area covered": the caption below already has to walk back a coverage
            claim, and a label that does not make one is better than a caption that undoes it. */}
        <FigureRow label="Map sheet footprint" figure={DISTRICT_EXTENT} />
        <Text className="font-mono text-[12px] text-muted">
          bounds: Setapak sheet · OpenStreetMap z15
        </Text>
        <Text className="mt-2 font-plex text-[15px] leading-6 text-muted">
          The bundled map sheet&apos;s own footprint — geometry, not a coverage claim. Nobody is
          watching all of it.
        </Text>
      </Block>

      <Block heading="what surveillance costs at that extent">
        <FigureRow label="Citizen reports" figure={CITIZEN_MONTHLY} />
        <View className="h-px bg-line" />
        <FigureRow label="Ovitraps, same area" figure={OVITRAP_MONTHLY} />
        <View className="h-px bg-line" />
        <FigureRow label="Difference" figure={COST_RATIO} />
        <Text className="mt-2 font-plex text-[15px] leading-6 text-muted">
          Per-km² rates come from the Mosquito Alert comparison. The multiplication is ours, which
          is why it is printed.
        </Text>
      </Block>

      <Block heading="what one dengue case costs">
        <FigureRow label="Per case, Malaysia" figure={COST_PER_CASE} />
        <View className="h-px bg-line" />
        <FigureRow label="Of that, lost wages" figure={INDIRECT_PER_CASE} />
        <View className="flex-row items-start justify-between border-t border-line py-3">
          <View className="shrink pr-4">
            <Text className="font-plex text-[16px] leading-6 text-ink">Days lost per case</Text>
            <Text className="mt-1 font-mono text-[12px] text-muted">work · school</Text>
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
            {OMITTED_CASES_AVERTED.heading}
          </Text>
          <Text className="font-mono text-[17px] text-muted">{OMITTED_CASES_AVERTED.value}</Text>
        </View>
        <Text className="font-plex text-[16px] leading-6 text-muted">
          {OMITTED_CASES_AVERTED.reason}
        </Text>
      </Block>

      <Text className="mt-5 font-mono text-[12px] leading-5 text-muted">
        [cited] figures come from the project evidence base. [modeled] figures are our arithmetic on
        those, shown in full. Nothing that could not be derived appears at all.
      </Text>
    </RoadmapScreen>
  );
}
