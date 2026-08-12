# Dengar design system

Status: **GATED — LAW (John, 2026-08-12).** Board decided: **A (Field Instrument) capture + abstain,
C (Verdict) red drench for the Aedes result.** The citizen surface is the dark instrument system;
red drenches only a positive Aedes verdict. Losing-direction deltas are deleted from this file.
The officer light-ground column stays — that surface is v2, not dead. Every screen extends this
file; inventing a parallel scale is a defect even if the screen looks fine alone.

## The one sentence that forces every choice

A citizen uses this **at dusk or at night, indoors, one-handed, at the moment a mosquito found
them** — the screen is a field instrument read at arm's length, not a wellness app browsed on a
sofa. An officer uses it **at a desk, in daylight, deciding where a fogging truck goes.**

Two audiences → two surfaces, deliberately distinct (specs.md §5):

| | Citizen | Officer |
|---|---|---|
| Ground | dark (night use; screen light is hostile at 11pm) | light (daylight desk, dense data) |
| Register | calm instrument — one number, one verdict, one action | operational — KPI deltas, map, dispatch |
| Ceiling in board | airquality-2 | fleetmanagement-1 |

## Register rules (product, not brand)

- The tool disappears into the task. Earned familiarity over novelty.
- One type family per surface. Fixed px scale, ratio ~1.2. No display fonts in labels.
- Motion 150–250 ms, ease-out, conveys state only. No page-load choreography. Reduced-motion: crossfade.
- No cards-by-reflex, no side-stripe accents, no gradient text, no glassmorphism, no hero-metric
  template, no emoji as data (the 😷 in airquality-3 is the anti-reference).
- **Abstain is styled with the same dignity as detection.** Never error-red, never a sad-face empty
  state. It is the most-seen screen and the trust surface (specs.md §4).
- specs.md §2 language table is binding on every string.

## Tokens (the shared spine — law)

**One source of truth: `app/tailwind.tokens.js`.** `app/tailwind.config.js` spreads it into the
theme; `app/src/app/board/tokens.tsx` (route `/board/tokens`) imports it and renders every token as
a labelled swatch with real sample text at real sizes on its real background. This section is the
prose law and matches that file value-for-value. **Screens never write a raw hex** — the frozen
board artifacts under `src/app/board/*` and the probe route are the only exceptions.

Rewritten 2026-08-12 (slice 11) when the warm citizen revision was gated; see §Warm revision below
for what moved and why.

### Color — citizen, dark ground

Seed: oklch(0.35 0.078 240) — deep harbor blue, kept as `primary`. The ground stays a neutral
near-black; the warmth lives in the ink and in the surfaces, so a tinted panel reads as **warm light
falling on a dark instrument**, never as coloured plastic.

| Token | Value | Role |
|---|---|---|
| `bg` | `#0B0C0E` | the ground — near-black, chroma 0 |
| `surface` | `#191817` | depth 1 — filled grouped surface (warm neutral) |
| `surface-raised` | `#232120` | depth 2 — footer rows, emphasised blocks |
| `line` | `#2E2B29` | 1px hairlines, gauge tracks (warm) |
| `ink` | `#F4EFE9` | warm ink — all prose and headlines |
| `muted` | `#B5ABA1` | warm muted — labels, secondary prose |
| `primary` | `#4C9FE0` | signal blue — the one saturated control |
| `primary-press` | `#63AFE8` | pressed state of `primary` |
| `halo-inner` | `#152430` | instrument halo, inner ring |
| `halo-outer` | `#10171E` | instrument halo, outer ring |
| `tint-guide` | `#28211B` | guidance / instruction block ground |
| `tint-guide-ink` | `#FFDCC0` | prose on `tint-guide` — warm sand |
| `tint-guide-mono` | `#C9B9AC` | mono spec line on `tint-guide` |
| `tint-trust` | `#182723` | privacy / "nothing kept" block, mic-ready chip |
| `tint-trust-ink` | `#93E3BC` | mono label on `tint-trust` (body prose uses `ink`) |
| `alert` | `#FF5C49` | RESERVED — positive Aedes verdict only |
| `ok` | `#35B981` | clear / kept-nothing dot |
| `ok-bright` | `#7BE0AE` | small dots and marks on `tint-trust` |
| `caution` | `#E8B44C` | sub-floor reading, gauge fill below threshold |
| `warm-white` | `#FFF3EC` | primary action ground on the drench (never pure white) |

Both tints are **opaque by construction** — each value *is* the composite over `bg`. An alpha tint
darkens unpredictably when it lands over another surface, and that is exactly how the board's amber
went muddy. The two tints are deliberately matched in lightness (rel. luminance .0162 / .0176) and
opposed in temperature, so guidance and privacy read as one system at two temperatures.

Semantics: **aedes-red is reserved for a positive Aedes verdict and officer alerts.** Never for
errors, never decoration. Abstain uses `ink`/`muted` on `bg` with `surface` grouping — a quiet
answer, not a warning.

### Color — verdict drench (positive Aedes result only)

The C-direction wager, kept intact: the Aedes result surface IS the verdict. A vertical gradient
`from → to` (28 solid bands — a gradient without a dependency) so light gathers at the verdict. The
two depth layers are **translucent on purpose**, so they ride the gradient instead of banding
against it.

| Token | Value | Use |
|---|---|---|
| `verdict-aedes-from` | `#9A2919` | gradient top |
| `verdict-aedes` | `#7E1B10` | flat fallback / gradient mid |
| `verdict-aedes-to` | `#4E0F08` | gradient bottom |
| `verdict-aedes-soft` | `#F8D9D1` | secondary text on the drench |
| `verdict-aedes-deep` | `#5E120A` | text on `warm-white` (the primary action) |
| `verdict-aedes-line` | `rgba(255,255,255,0.14)` | hairlines on the drench |
| `verdict-aedes-raised` | `rgba(255,255,255,0.10)` | raised block (the stakes paragraph) |
| `verdict-aedes-sunken` | `rgba(0,0,0,0.22)` | recessed block (the fine-grained heads) |
| `verdict-aedes-track` | `rgba(0,0,0,0.28)` | confidence gauge track |

### Color — officer, light ground

Cool, crisp, dense. Never mixed with the citizen palette on one screen.

| Token | Value | Role |
|---|---|---|
| `o-bg` | `#FFFFFF` | the ground — pure, no tint |
| `o-surface` | `#F2F5F8` | cool panel — cards, KPI pills, zero cells |
| `o-line` | `#DDE3EA` | 1px rules, axis, zero-value spark bars |
| `o-ink` | `#15181D` | ink |
| `o-muted` | `#556170` | labels, axis and annotation text |
| `o-primary` | `#1E56A0` | cobalt — the officer action |
| `o-primary-wash` | `rgba(30,86,160,0.22)` | secondary data series (rainfall bars) |
| `o-alert` | `#C63A2B` | officer alert states |
| `o-alert-ghost` | `rgba(198,58,43,0.06)` | hollow projection fills (+14–21 d case bars) |
| `o-ok` | `#1A7B52` | ok / clear |
| `o-caution` | `#8A5F12` | caution |

Heat-grid cells are `o-alert` at alpha 0.14 → 1.00 by cell value, `o-surface` for zero — a
documented ramp, not a token.

`o-ok` and `o-caution` are **darkened from the v1 doc values** (`#1F8A5D`, `#9A6B15`): measured,
those failed AA at 4.27:1 and 4.36:1 on `o-surface`. The new values clear AA on both `o-bg` and
`o-surface`. Anything painted on `o-surface` must be checked against `o-surface`, not against white.

### Type

- **IBM Plex Sans + IBM Plex Mono on BOTH surfaces.** Decided 2026-08-12: the gated officer
  winners (`officer-e`, `officer-d`) were built in Plex, two-audience distinctness is already
  carried by ground / density / radius / register, and Plex Mono's tabular figures are the
  instrument credibility on the officer chart as much as on the citizen readout. A second family
  would buy nothing and cost a font payload the phone build has to load. `font-inter*` stays in
  the config only for the frozen B and `officer-a..c` board artifacts; **no shipped screen uses it.**
- Weights 400/500/600/700 via the family name (`font-plex-medium`, …) — never `font-bold`.
- Mono is for **numbers and machine strings only** (confidence, dB, coords, timestamps, IDs, spec
  lines). Prose is always Plex Sans. The warm revision demoted mono from prose; that is law.
- Scale (px), citizen: **12 · 13 · 15 · 16 · 17 · 20 · 24 · 30 · 34 · 38 · 56**
  — 12 mono meta · 13 mono data / small pill prose · 15 row labels + secondary actions ·
  **16 body prose** (the warm revision moved prose up one step from 15) · 17 primary action + app
  title · 20 verdict subhead · 24 in-control label · 30 capture headline · 34 abstain headline ·
  38 spare · 56 the verdict word only.
- Officer adds **10 · 11 · 22** — chart/map annotation below body size (never prose) and the KPI
  number. The officer surface is dense by design; that density is part of the register.
- Nothing above 38 on any screen except the verdict word.

### Space & shape

- Base 4: 4 8 12 16 24 32 48 64. Screen gutter 20.
- Radius tokens: `chip` 12 · `card` 10 · `block` 20 · `pill` 999. **Citizen uses chip / block /
  pill; officer uses card / pill.** The radius itself carries two-audience distinctness — soft
  consumer instrument vs crisp operational console. Never mixed on one screen.
- Grouping is by **filled surface**, not by rule: prefer a `surface` / `surface-raised` block at
  `block` radius over a hairline box. Hairlines survive only as dividers *inside* a block and as
  the officer axis.
- Hairlines 1px `line` (citizen) / `o-line` (officer). No shadows on dark ground; light ground max
  `0 1px 3px rgba(21,24,29,.08)`.
- Depth is exactly two levels per surface (`surface`/`surface-raised`, `-sunken`/`-raised` on the
  drench). A third level is a defect.

### Motion

- State transitions 180 ms ease-out. Verdict reveal 240 ms.
- Capture pulse (as built, slice 2 — recorded 2026-08-12): the one ambient animation in the app.
  Idle breathes at 1.6 s (scale 1→1.12, opacity .35→0 — the invitation); listening tightens to
  0.9 s, 1→1.06 — faster and smaller reads as "live mic". Analyzing holds the rings still: the mic
  is closed, so nothing on screen may claim liveness.
- **Color and depth never animate.** Tints, drench stops and surface levels are static; motion
  conveys state only, and a shifting ground reads as instability on a field instrument.
- Reduced motion: rings hold static (single ring at rest opacity); the level meter still moves —
  it is data, not decoration. Reveals become crossfades.

### Warm revision — what changed from the board, and why (2026-08-12, slice 11)

Gate 2 approved the *direction* and explicitly not the hues. Kept from `warm-*`: warm ink and warm
muted, filled grouped surfaces at `block` radius instead of hairline rules, mono restricted to
numbers, the two-level raised/recessed depth, warm-white primary on the drench, and the gradient
drench untouched (John: "nice and aesthetic").

Refined:

1. **The amber guidance block.** Board used `#FFC46B` at 20% alpha over near-black, which composites
   to `#3B3121` — a muddy brown that reads dull, which is precisely John's "awkward / slightly too
   much". Fixed by moving the warmth into the *text* and making the ground far subtler: a cleaner,
   less-yellow base (`#FFB877`) at 12%, stored opaque as `tint-guide #28211B`, with the prose in
   warm sand `tint-guide-ink #FFDCC0` instead of the board's yellower `#FFDFA8`.
2. **The mint block.** Same treatment — `#7BE0AE` at 18% (`#1F322B`, a visible green panel) becomes
   `#6FE0B0` at 13%, opaque as `tint-trust #182723`, label `#93E3BC`. It now reads as a cool
   counterpart to the guidance tint at the same depth, not as a green card.
3. **Alpha tints became opaque tokens** on the dark ground, for the reason above.
4. **`surface` warmed and split.** `#141619` (cool blue-grey) → `#191817` plus a genuine second
   level `surface-raised #232120`; the board used one `#18191A` for both roles.
5. **`line` warmed** `#26292E` → `#2E2B29`.
6. **`verdict-aedes-soft`** `#F3C7C0` → `#F8D9D1`. The board's `#F6D2C9` is warmer than the v1
   value and was the intended target, but measured it lands at **4.51:1** at 12px on
   `verdict-aedes-raised` over the *lightest* gradient stop — a 0.01 margin over AA is a latent
   re-shoot, not a pass. Lifted ~2% in lightness: measured 4.77:1 in that worst case, 5.85:1 on the
   bare top stop, 7.72:1 on the flat mid. Visually indistinguishable from the gated board.

**Tightest pairs in the whole palette** (measured off `/board/tokens`, 2026-08-12 — 87 text-on-
surface pairs, 0 failures): `o-alert` on `o-surface` **4.75:1** and `verdict-aedes-soft` on
`verdict-aedes-raised` over the lightest drench stop **4.77:1**. Neither has room to be placed on
anything darker/lighter than what is listed here. Every other pair clears 5:1.
7. **Drench depth layers are alpha, not opaque** — the opposite call from the citizen tints, because
   here they must ride a gradient rather than sit on one flat ground.
8. **Officer `o-ok` / `o-caution` darkened** — the v1 values failed AA on `o-surface`.

Deleted: **`faint` `#5C646E`** (3.47:1 — below AA, never used by any screen; a token that cannot
legally carry copy is a trap, not a token) and the whole **`verdict-quiet` family** (`#1A2030`,
`#B8C1D4`, `#9FA9BF`, `#333D52`). The gate record settles it: v1 and v2 abstains sit on the normal
dark ground because refusal must read as the instrument at rest, not as a second verdict colour —
so an abstain drench has no future user, and no shipped screen or board artifact referenced any of
the five. Nothing outside the config used them.

## Gate record (2026-08-12)

Three directions were built as real screens at `/board/*` (frozen artifacts — raw hex, not tokens).
John gated: **A — Field Instrument** for capture and abstain (hairlines, mono data, SNR readout as
honest hardware), **C — Verdict** for the Aedes result (the surface IS the verdict color — red
drench, one screen = one answer). B (Public Clinic, light + Inter) lost; its officer wager returns
as the v2 officer surface, tracked in the light-ground column above. v1 abstains stay on the quiet
dark ground rather than C's indigo drench — refusal reads as the instrument at rest, not a second
verdict color.

## Gate 2 — warmth revision + officer surface (John, 2026-08-12, second sitting)

**Warmth revision: APPROVED as the citizen language.** John: *"warm-detected is nice and aesthetic.
warm-abstain and capture is definitely more friendly and colorful compared to what we have now,
that's the right direction… but the colour choice looks a bit awkward or very slightly too much, so
that can be improved."* → The direction was law immediately; the specific hues were refined and
**became law in slice 11** — §Tokens above is now the only source, and §Warm revision records every
delta from the board with its reason. The refinement
brief: keep warm ink/muted, the filled grouped surfaces, the radius-20 softness, mono-for-numbers-only
and the gradient drench. Dial the amber and mint back — the amber block on warm-capture read
muddy-brown over near-black (my own read, John's "awkward"). Aim for tints that read as *warm light on
a dark instrument*, not as coloured plastic. aedes-red stays exclusive to a positive Aedes verdict.

**Officer surface: officer-e + officer-d.** `e` (Trend) is the officer HOME — the 14-day detection
series with the rainfall overlay and the hollow +14–21 d case bars under a `14–21 d` bracket, which
makes specs §1's lead-time claim a *shape* instead of a sentence. `d` (Map) is the cluster-detail
screen behind it. Both in the light officer register above. `f` (Signal) REJECTED: its arc gauge
implies a denominator specs §9 cannot source — an invented figure wearing a gauge. `a`/`b`/`c`
rejected round 1 (prose-dense; an officer must SEE the situation, not read it).
John's amendment to `e`: **more CTA emphasis, borrowing `f`'s directive weight — a nudge, not a drench.**
Also fix on `e`: the directive card's red left-edge stripe is a banned side-stripe accent.

**No gate 3.** Two audiences = two visual languages = two gates, both now closed. v2 and v3 screens
inherit whichever language their audience implies; a new version is never a new register.

## Maps — bundled raster, never a map library (decided 2026-08-12)

`app/assets/maps/setapak-osm.png` — 512×768, OpenStreetMap zoom 15, stitched from 6 tiles. Covers
Taman Melati, Wangsa Maju, Danau Kota, Setapak. Bounds for lat/lon → pixel projection:
**north 3.228271 · west 101.711426 · south 3.195364 · east 101.733398** (Web-Mercator linear in x;
use the Mercator y formula for latitude, not a linear lerp). Attribution required on any screen that
renders it: *© OpenStreetMap contributors*.

A map LIBRARY (`react-native-maps`, Mapbox, MapLibre) is banned here: native module → breaks the dev
build until an EAS rebuild, needs an API key with billing, and has no usable web implementation, which
would kill the screenshot loop. Decisively: **tiles need network, and specs §7's uncuttable shot is in
airplane mode.** A bundled raster is the only version that survives the demo.

## Rubric axes (the taste half of the loop oracle; floors live in loop-eng-profile)

1. **Verdict legibility** — outcome + next action readable in <1 s at arm's length.
2. **Abstain dignity** — abstain feels like a competent instrument reporting, never a failure state.
3. **Instrument, not toy** — zero gamification/mascot/wellness grammar; §2 language holds everywhere.
4. **Two-audience distinctness** — a citizen screen and an officer screen are never confusable.
5. **System coherence** — every screen derivable from this file; no invented spacing/color/radius.
