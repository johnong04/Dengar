import { ScrollView, Text, View } from 'react-native';

import tokens from '../../../tailwind.tokens';

// TOKEN PROBE — a permanent deliverable, not a throwaway board sketch.
//
// Every color token in `tailwind.tokens.js` is rendered here as a labelled swatch, and every
// text-on-surface pair the design system sanctions is rendered as real sample text at the real
// size on the real painted background. Slice 12+ reads this route to pick a token; the evaluator
// reads it to MEASURE contrast (each sample carries a testID of the form `fg--on--bg--<px>`).
//
// It imports the token map directly, so it cannot drift from the config. This file is the one
// place outside src/app/board/* allowed to name token values in JS — it exists to display them.

const C = tokens.citizen;
const D = tokens.drench;
const O = tokens.officer;

type Font = 'plex' | 'plex-medium' | 'plex-semibold' | 'plex-bold' | 'mono' | 'mono-medium';

const FONT_CLASS: Record<Font, string> = {
  plex: 'font-plex',
  'plex-medium': 'font-plex-medium',
  'plex-semibold': 'font-plex-semibold',
  'plex-bold': 'font-plex-bold',
  mono: 'font-mono',
  'mono-medium': 'font-mono-medium',
};

type Pair = {
  fg: string; // token name
  size: number;
  font: Font;
  text: string;
};

/** A labelled swatch: the token's own background, its name + value, and its sanctioned text pairs. */
function Swatch({
  name,
  value,
  role,
  over,
  pairs,
  labelOn,
  radius = 20,
}: {
  name: string;
  value: string;
  role: string;
  /** token name of the ground this swatch is painted over, for the caption only */
  over?: string;
  pairs: Pair[];
  /** color token used for the name/value caption (must contrast with `value`) */
  labelOn: string;
  radius?: number;
}) {
  const colors: Record<string, string> = tokens.colors;
  return (
    <View className="mb-3" style={{ backgroundColor: colors[value] ?? value, borderRadius: radius }}>
      <View className="px-4 pb-3 pt-3">
        <Text className="font-mono text-[10px]" style={{ color: colors[labelOn] }}>
          {name}
          <Text className="font-mono text-[10px]" style={{ color: colors[labelOn], opacity: 0.7 }}>
            {'  '}
            {colors[value] ?? value}
            {over ? `  over ${over}` : ''}
            {'  ·  '}
            {role}
          </Text>
        </Text>
      </View>
      {pairs.map((p) => (
        <View key={`${p.fg}-${p.size}-${p.font}`} className="px-4 pb-3">
          <Text
            testID={`${p.fg}--on--${name}--${p.size}`}
            className={FONT_CLASS[p.font]}
            style={{ color: colors[p.fg], fontSize: p.size, lineHeight: Math.round(p.size * 1.35) }}
          >
            {p.text}
          </Text>
          <Text className="mt-0.5 font-mono text-[9px]" style={{ color: colors[labelOn], opacity: 0.6 }}>
            {p.fg} · {p.size}px · {p.font}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** A swatch with no text on it — a fill, hairline or data color. */
function FillSwatch({ name, role }: { name: string; role: string }) {
  const colors: Record<string, string> = tokens.colors;
  return (
    <View className="mb-2 flex-row items-center gap-3">
      <View
        style={{ width: 44, height: 28, borderRadius: 6, backgroundColor: colors[name] }}
      />
      <Text className="flex-1 font-mono text-[10px]" style={{ color: C.muted }}>
        {name} <Text className="font-mono text-[10px]" style={{ color: C.muted }}>{colors[name]}</Text>
        {'\n'}
        {role}
      </Text>
    </View>
  );
}

function Head({ children, color }: { children: string; color: string }) {
  return (
    <Text className="mb-3 mt-6 font-plex-bold text-[17px]" style={{ color }}>
      {children}
    </Text>
  );
}

// 28 solid bands — the drench gradient without a dependency (same construction as slice 12 uses).
const BAND_COUNT = 28;
const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const TOP = hexToRgb(D['verdict-aedes-from']);
const BOT = hexToRgb(D['verdict-aedes-to']);
const BANDS = Array.from({ length: BAND_COUNT }, (_, i) => {
  const t = i / (BAND_COUNT - 1);
  const c = TOP.map((v, k) => Math.round(v + (BOT[k] - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
});

/** A drench region: the gradient behind, tokens painted on top. */
function DrenchBlock({
  ground,
  groundName,
  children,
}: {
  ground: string;
  groundName: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-3 overflow-hidden" style={{ backgroundColor: ground, borderRadius: 20 }}>
      <Text className="px-4 pb-2 pt-3 font-mono text-[10px]" style={{ color: D['verdict-aedes-soft'] }}>
        ground: {groundName} {ground}
      </Text>
      {children}
    </View>
  );
}

export default function TokenProbe() {
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerClassName="px-5 pb-16 pt-14">
      <Text className="font-plex-bold text-[30px]" style={{ color: C.ink }}>
        Tokens
      </Text>
      <Text className="mt-2 font-plex text-[16px]" style={{ color: C.muted }}>
        Every token in tailwind.tokens.js, with the text pairs the design system sanctions, at the
        sizes they are actually used. Contrast is measured off this route, never eyeballed.
      </Text>

      {/* ───────────────── citizen, dark ground ───────────────── */}
      <Head color={C.ink}>Citizen — dark ground</Head>

      <Swatch
        name="bg"
        value="bg"
        role="the ground: near-black, chroma 0"
        labelOn="muted"
        radius={0}
        pairs={[
          { fg: 'ink', size: 34, font: 'plex-bold', text: 'No mosquito' },
          { fg: 'ink', size: 30, font: 'plex-bold', text: 'Identify the mosquito' },
          { fg: 'ink', size: 20, font: 'plex', text: 'The mosquito that found you' },
          { fg: 'ink', size: 17, font: 'plex-semibold', text: 'Dengar' },
          { fg: 'ink', size: 16, font: 'plex', text: 'Nothing was saved; nothing left your phone.' },
          { fg: 'muted', size: 16, font: 'plex', text: 'The clip carried no wingbeat signature.' },
          { fg: 'muted', size: 15, font: 'plex-medium', text: '← Result · Done' },
          { fg: 'muted', size: 12, font: 'mono', text: '#2322 · 07:52:02' },
          { fg: 'primary', size: 15, font: 'plex-semibold', text: 'Listen again' },
          { fg: 'alert', size: 15, font: 'plex-semibold', text: 'Aedes — positive verdict only' },
          { fg: 'ok', size: 12, font: 'mono', text: 'mic ready · on-device' },
          { fg: 'caution', size: 13, font: 'mono', text: '0.21 / floor 0.50' },
        ]}
      />

      <Swatch
        name="surface"
        value="surface"
        role="depth 1 — filled grouped surface"
        over="bg"
        labelOn="muted"
        pairs={[
          { fg: 'ink', size: 17, font: 'mono-medium', text: '0.21 / floor 0.50' },
          { fg: 'ink', size: 16, font: 'plex', text: 'Nothing was saved.' },
          { fg: 'ink', size: 15, font: 'mono', text: '18.4 dB · usable' },
          { fg: 'muted', size: 15, font: 'plex', text: 'Event score' },
          { fg: 'muted', size: 13, font: 'mono', text: 'deleted on device' },
          { fg: 'primary', size: 15, font: 'plex-semibold', text: 'History' },
          { fg: 'caution', size: 13, font: 'mono', text: 'below floor' },
        ]}
      />

      <Swatch
        name="surface-raised"
        value="surface-raised"
        role="depth 2 — footer rows, emphasised blocks"
        over="bg"
        labelOn="muted"
        pairs={[
          { fg: 'ink', size: 16, font: 'plex-medium', text: 'History' },
          { fg: 'ink', size: 15, font: 'mono', text: '3 this week' },
          { fg: 'muted', size: 15, font: 'plex', text: 'Band SNR' },
          { fg: 'muted', size: 13, font: 'mono', text: '3 this week' },
        ]}
      />

      <Swatch
        name="tint-guide"
        value="tint-guide"
        role="guidance block — warm light on the instrument"
        over="bg"
        labelOn="tint-guide-mono"
        pairs={[
          {
            fg: 'tint-guide-ink',
            size: 16,
            font: 'plex',
            text: 'Hold your phone within 10 cm. Trapped under a glass works best.',
          },
          { fg: 'tint-guide-ink', size: 13, font: 'plex', text: 'Get within 10 cm — under a glass is ideal' },
          { fg: 'tint-guide-mono', size: 12, font: 'mono', text: '16 kHz · mono · band-SNR gate armed' },
        ]}
      />

      <Swatch
        name="tint-trust"
        value="tint-trust"
        role="privacy block + mic-ready chip"
        over="bg"
        labelOn="tint-trust-ink"
        pairs={[
          { fg: 'tint-trust-ink', size: 12, font: 'mono', text: 'nothing kept' },
          { fg: 'ink', size: 16, font: 'plex', text: 'Nothing was saved; nothing left your phone.' },
          { fg: 'ok-bright', size: 12, font: 'mono', text: 'mic ready · on-device' },
        ]}
      />

      <Swatch
        name="primary"
        value="primary"
        role="the one saturated control — Listen disc, primary action"
        over="bg"
        labelOn="bg"
        pairs={[
          { fg: 'bg', size: 24, font: 'plex-semibold', text: 'Listen' },
          { fg: 'bg', size: 17, font: 'plex-semibold', text: 'Listen again' },
          { fg: 'bg', size: 13, font: 'mono', text: '5.0 s' },
        ]}
      />

      <Swatch
        name="warm-white"
        value="warm-white"
        role="primary action on the drench — authority without glare"
        labelOn="verdict-aedes-deep"
        pairs={[{ fg: 'verdict-aedes-deep', size: 17, font: 'plex-semibold', text: 'Log detection' }]}
      />

      <Head color={C.ink}>Citizen — fills, hairlines, states (no text)</Head>
      <FillSwatch name="line" role="1px hairlines and gauge tracks" />
      <FillSwatch name="primary-press" role="pressed state of primary" />
      <FillSwatch name="halo-inner" role="instrument halo, inner ring" />
      <FillSwatch name="halo-outer" role="instrument halo, outer ring" />
      <FillSwatch name="ok" role="clear / kept-nothing dot" />
      <FillSwatch name="ok-bright" role="small dots and marks on tint-trust" />
      <FillSwatch name="caution" role="gauge fill below threshold" />
      <FillSwatch name="alert" role="RESERVED — positive Aedes verdict only" />

      {/* ───────────────── verdict drench ───────────────── */}
      <Head color={C.ink}>Verdict drench — positive Aedes result only</Head>

      <View className="mb-3 overflow-hidden" style={{ borderRadius: 20 }}>
        <View className="h-10 flex-row">
          {BANDS.map((c, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: c }} />
          ))}
        </View>
        <View className="pt-2">
          <Text className="font-mono text-[10px]" style={{ color: C.muted }}>
            verdict-aedes-from {D['verdict-aedes-from']} → verdict-aedes-to {D['verdict-aedes-to']} ·
            28 bands · mid / flat fallback verdict-aedes {D['verdict-aedes']}
          </Text>
        </View>
      </View>

      {(
        [
          ['verdict-aedes-from', D['verdict-aedes-from']],
          ['verdict-aedes', D['verdict-aedes']],
          ['verdict-aedes-to', D['verdict-aedes-to']],
        ] as const
      ).map(([groundName, ground]) => (
        <DrenchBlock key={groundName} ground={ground} groundName={groundName}>
          <View className="px-4 pb-3">
            <Text
              testID={`white--on--${groundName}--56`}
              className="font-plex-bold"
              style={{ color: '#FFFFFF', fontSize: 56, lineHeight: 60 }}
            >
              Aedes.
            </Text>
            <Text
              testID={`white--on--${groundName}--30`}
              className="font-mono-medium"
              style={{ color: '#FFFFFF', fontSize: 30 }}
            >
              91%
            </Text>
            <Text
              testID={`white--on--${groundName}--15`}
              className="font-mono"
              style={{ color: '#FFFFFF', fontSize: 15 }}
            >
              Aedes aegypti
            </Text>
            <Text
              testID={`verdict-aedes-soft--on--${groundName}--20`}
              className="font-plex"
              style={{ color: D['verdict-aedes-soft'], fontSize: 20, lineHeight: 29 }}
            >
              The mosquito that found you carries dengue.
            </Text>
            <Text
              testID={`verdict-aedes-soft--on--${groundName}--15`}
              className="font-plex"
              style={{ color: D['verdict-aedes-soft'], fontSize: 15 }}
            >
              Species · Sex · Gravid
            </Text>
            <Text
              testID={`verdict-aedes-soft--on--${groundName}--12`}
              className="font-mono"
              style={{ color: D['verdict-aedes-soft'], fontSize: 12 }}
            >
              #2631 · 07:57:11
            </Text>
          </View>

          {/* the two translucent depth layers, on this stop */}
          <View
            className="mx-4 mb-3 px-4 py-3"
            style={{ backgroundColor: D['verdict-aedes-sunken'], borderRadius: 20 }}
          >
            <Text className="font-mono text-[10px]" style={{ color: D['verdict-aedes-soft'] }}>
              verdict-aedes-sunken {D['verdict-aedes-sunken']}
            </Text>
            <Text
              testID={`white--on--verdict-aedes-sunken-${groundName}--15`}
              className="font-mono"
              style={{ color: '#FFFFFF', fontSize: 15 }}
            >
              female · 0.93
            </Text>
            <Text
              testID={`verdict-aedes-soft--on--verdict-aedes-sunken-${groundName}--15`}
              className="font-plex"
              style={{ color: D['verdict-aedes-soft'], fontSize: 15 }}
            >
              Sex
            </Text>
            <View className="mt-2 h-2 overflow-hidden" style={{ backgroundColor: D['verdict-aedes-track'], borderRadius: 999 }}>
              <View style={{ width: '91%', height: '100%', backgroundColor: C['warm-white'] }} />
            </View>
          </View>

          <View
            className="mx-4 mb-4 px-4 py-3"
            style={{ backgroundColor: D['verdict-aedes-raised'], borderRadius: 20 }}
          >
            <Text className="font-mono text-[10px]" style={{ color: D['verdict-aedes-soft'] }}>
              verdict-aedes-raised {D['verdict-aedes-raised']}
            </Text>
            <Text
              testID={`verdict-aedes-soft--on--verdict-aedes-raised-${groundName}--12`}
              className="font-mono"
              style={{ color: D['verdict-aedes-soft'], fontSize: 12 }}
            >
              why this matters
            </Text>
            <Text
              testID={`white--on--verdict-aedes-raised-${groundName}--15`}
              className="font-plex"
              style={{ color: '#FFFFFF', fontSize: 15, lineHeight: 23 }}
            >
              Logging this puts one more point on your district&apos;s map.
            </Text>
            <View className="mt-2 h-px" style={{ backgroundColor: D['verdict-aedes-line'] }} />
            <Text className="mt-1 font-mono text-[9px]" style={{ color: D['verdict-aedes-soft'] }}>
              verdict-aedes-line {D['verdict-aedes-line']}
            </Text>
          </View>
        </DrenchBlock>
      ))}

      {/* ───────────────── officer, light ground ───────────────── */}
      <Head color={C.ink}>Officer — light ground</Head>

      <View className="overflow-hidden" style={{ backgroundColor: O['o-bg'], borderRadius: 20 }}>
        <View className="px-4 pb-4 pt-4">
          <Swatch
            name="o-bg"
            value="o-bg"
            role="the officer ground: pure white, no tint"
            labelOn="o-muted"
            radius={0}
            pairs={[
              { fg: 'o-ink', size: 22, font: 'mono-medium', text: '23/26' },
              { fg: 'o-ink', size: 17, font: 'plex-semibold', text: 'Fog within 48 h' },
              { fg: 'o-ink', size: 15, font: 'plex-semibold', text: 'Setapak' },
              { fg: 'o-ink', size: 13, font: 'plex-medium', text: 'Taman Melati' },
              { fg: 'o-muted', size: 12, font: 'mono', text: 'TUE 12 AUG · 07:04' },
              { fg: 'o-muted', size: 11, font: 'mono', text: '11 h' },
              { fg: 'o-muted', size: 10, font: 'mono', text: 'detections · rain mm · cases' },
              { fg: 'o-alert', size: 12, font: 'mono', text: 'Taman Melati · B3–B5' },
              { fg: 'o-alert', size: 11, font: 'mono', text: '+6' },
              { fg: 'o-caution', size: 11, font: 'mono', text: '+1' },
              { fg: 'o-ok', size: 11, font: 'mono', text: 'clear' },
              { fg: 'o-primary', size: 13, font: 'plex-semibold', text: 'Acknowledge' },
            ]}
          />

          <Swatch
            name="o-surface"
            value="o-surface"
            role="cool panel — cards, KPI pills, zero cells"
            over="o-bg"
            labelOn="o-muted"
            radius={10}
            pairs={[
              { fg: 'o-ink', size: 17, font: 'plex-semibold', text: 'Fog within 48 h' },
              { fg: 'o-ink', size: 15, font: 'plex-semibold', text: 'Taman Melati' },
              { fg: 'o-muted', size: 10, font: 'plex-medium', text: 'DETECTIONS' },
              { fg: 'o-muted', size: 10, font: 'mono', text: '−3' },
              { fg: 'o-alert', size: 10, font: 'mono', text: '+2' },
              { fg: 'o-caution', size: 11, font: 'mono', text: '+1' },
              { fg: 'o-ok', size: 11, font: 'mono', text: 'clear' },
              { fg: 'o-primary', size: 13, font: 'plex-semibold', text: 'Acknowledge' },
            ]}
          />

          <Swatch
            name="o-primary"
            value="o-primary"
            role="cobalt — the officer action"
            over="o-bg"
            labelOn="o-bg"
            radius={10}
            pairs={[
              { fg: 'o-bg', size: 13, font: 'plex-semibold', text: 'Acknowledge' },
              { fg: 'o-bg', size: 10, font: 'mono-medium', text: 'rain mm' },
            ]}
          />

          <Swatch
            name="o-alert"
            value="o-alert"
            role="officer alert — bracket labels, bars, dispatch marks"
            over="o-bg"
            labelOn="o-bg"
            radius={10}
            pairs={[
              { fg: 'o-bg', size: 10, font: 'mono-medium', text: '14–21 d' },
              { fg: 'o-bg', size: 13, font: 'plex-semibold', text: 'Dispatch' },
            ]}
          />

          <Text className="mb-2 mt-4 font-mono text-[10px]" style={{ color: O['o-muted'] }}>
            fills / data series — no text sits on these
          </Text>
          {(
            [
              ['o-line', '1px rules, axis, zero-value spark bars'],
              ['o-primary-wash', 'secondary data series (rainfall bars)'],
              ['o-alert-ghost', 'hollow projection fills (+14–21 d case bars)'],
            ] as const
          ).map(([name, role]) => (
            <View key={name} className="mb-2 flex-row items-center gap-3">
              <View
                style={{
                  width: 44,
                  height: 28,
                  borderRadius: 4,
                  backgroundColor: O[name],
                  borderWidth: 1,
                  borderColor: O['o-line'],
                }}
              />
              <Text className="flex-1 font-mono text-[10px]" style={{ color: O['o-muted'] }}>
                {name} {O[name]}
                {'\n'}
                {role}
              </Text>
            </View>
          ))}
          <Text className="mt-2 font-mono text-[10px]" style={{ color: O['o-muted'] }}>
            heat grid: o-alert at alpha 0.14 → 1.00 by cell value, o-surface for zero. A ramp, not a
            token.
          </Text>
        </View>
      </View>

      {/* ───────────────── radius + type ───────────────── */}
      <Head color={C.ink}>Radius vocabulary</Head>
      <View className="flex-row items-end gap-3">
        {(
          [
            ['chip', 12],
            ['card', 10],
            ['block', 20],
            ['pill', 999],
          ] as const
        ).map(([name, r]) => (
          <View key={name} className="items-center gap-1">
            <View
              style={{
                width: 64,
                height: 44,
                borderRadius: r,
                backgroundColor: C['surface-raised'],
              }}
            />
            <Text className="font-mono text-[9px]" style={{ color: C.muted }}>
              {name} {r}
            </Text>
          </View>
        ))}
      </View>
      <Text className="mt-2 font-mono text-[10px]" style={{ color: C.muted }}>
        citizen uses chip / block / pill · officer uses card / pill · never mixed on one screen
      </Text>

      <Head color={C.ink}>Type scale</Head>
      {([10, 11, 12, 13, 15, 16, 17, 20, 22, 24, 30, 34, 38, 56] as const).map((s) => (
        <View key={s} className="flex-row items-baseline gap-3">
          <Text className="w-9 font-mono text-[9px]" style={{ color: C.muted }}>
            {s}
          </Text>
          <Text
            className="font-plex"
            style={{ color: C.ink, fontSize: s, lineHeight: Math.round(s * 1.3) }}
          >
            Aedes aegypti
          </Text>
        </View>
      ))}
      <Text className="mt-3 font-mono text-[10px]" style={{ color: C.muted }}>
        10 / 11 / 22 are officer-only (chart + map annotation, KPI numbers). 56 is the verdict word
        only. IBM Plex Sans and Plex Mono on both surfaces; mono is for numbers and machine strings.
      </Text>
    </ScrollView>
  );
}
