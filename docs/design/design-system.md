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

## Tokens (the shared spine — law, mirrored in `app/tailwind.config.js`)

### Color

Seed: oklch(0.35 0.078 240) — deep harbor blue. Primary hue stays 240±10 in every direction.

| Role | Dark ground (citizen) | Light ground (officer) |
|---|---|---|
| bg | `#0B0C0E` (near-black, chroma 0) | `#FFFFFF` (pure, no tint) |
| surface | `#141619` | `#F2F5F8` (cool panel) |
| line | `#26292E` | `#DDE3EA` |
| ink | `#E9ECEF` | `#15181D` |
| muted | `#9AA3AD` (AA on bg) | `#556170` (AA on white) |
| primary | `#4C9FE0` (signal blue) | `#1E56A0` (cobalt) |
| aedes / alert | `#FF5C49` | `#C63A2B` |
| clear / ok | `#35B981` | `#1F8A5D` |
| caution | `#E8B44C` | `#9A6B15` |

Semantics: **aedes-red is reserved for a positive Aedes verdict and officer alerts.** Never for
errors, never decoration. Abstain uses ink/muted on the normal ground — a quiet answer, not a warning.

#### Verdict drench family (added 2026-08-12 — doc catches up to `tailwind.config.js`, slice 4)

The C-direction drench, as built: the Aedes result surface IS the verdict color. White ink on the
drench; `-soft` for secondary text (AA on the drench, measured 6.7:1); `-line` for hairlines and
the confidence track. The quiet family is reserved for a possible abstain drench — defined in the
config, unused in v1 (v1 abstains sit on the normal dark ground).

| Token | Value | Use |
|---|---|---|
| `verdict-aedes` | `#7E1B10` | Aedes result ground (the only red-drenched surface) |
| `verdict-aedes-soft` | `#F3C7C0` | secondary text on the drench |
| `verdict-aedes-line` | `#9E3D30` | hairlines / track on the drench |
| `verdict-quiet` | `#1A2030` | reserved (abstain drench, unused v1) |
| `verdict-quiet-soft` | `#B8C1D4` | reserved |
| `verdict-quiet-muted` | `#9FA9BF` | reserved |
| `verdict-quiet-line` | `#333D52` | reserved |

Also in config, undocumented until now: `faint #5C646E` (sub-muted, decorative only — below AA,
never for copy).

### Type

- Citizen + shared: **IBM Plex Sans** (400/500/600/700) — institutional-scientific without being cold.
- Data readouts (confidence, dB, coords, timestamps): **IBM Plex Mono** — instrument credibility,
  tabular by nature.
- Scale (px): 12 · 13 · 15 · 17 · 20 · 24 · 30 · 38 · 56(verdict number only)
- Verdict number is the only thing allowed above 38.

### Space & shape

- Base 4: 4 8 12 16 24 32 48 64. Screen gutter 20.
- Radius: control 10 · sheet 20 · pill 999. One radius vocabulary per surface, no mixing.
- Hairlines 1px `line`. No shadows on dark ground; light ground max `0 1px 3px rgba(21,24,29,.08)`.

### Motion

- State transitions 180 ms ease-out. Verdict reveal 240 ms.
- Capture pulse (as built, slice 2 — recorded 2026-08-12): the one ambient animation in the app.
  Idle breathes at 1.6 s (scale 1→1.12, opacity .35→0 — the invitation); listening tightens to
  0.9 s, 1→1.06 — faster and smaller reads as "live mic". Analyzing holds the rings still: the mic
  is closed, so nothing on screen may claim liveness.
- Reduced motion: rings hold static (single ring at rest opacity); the level meter still moves —
  it is data, not decoration. Reveals become crossfades.

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
that can be improved."* → **The direction is law; the specific hues are NOT yet law.** The refinement
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
