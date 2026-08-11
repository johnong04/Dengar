# Dengar design system

Status: **DRAFT — board not yet gated.** Three directions built from these tokens; John picks at
`docs/design/board/`. After the gate, the losing directions' deltas are deleted from this file and
the winner's values become law. Every screen extends this file; inventing a parallel scale is a
defect even if the screen looks fine alone.

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

## Tokens (shared spine — all directions draw from these)

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

### Type

- Citizen + shared: **IBM Plex Sans** (400/500/600/700) — institutional-scientific without being cold.
- Data readouts (confidence, dB, coords, timestamps): **IBM Plex Mono** — instrument credibility,
  tabular by nature.
- Officer alternative in board direction B: **Inter** — denser x-height for tables.
- Scale (px): 12 · 13 · 15 · 17 · 20 · 24 · 30 · 38 · 56(verdict number only)
- Verdict number is the only thing allowed above 38.

### Space & shape

- Base 4: 4 8 12 16 24 32 48 64. Screen gutter 20.
- Radius: control 10 · sheet 20 · pill 999. One radius vocabulary per direction, no mixing.
- Hairlines 1px `line`. No shadows on dark ground; light ground max `0 1px 3px rgba(21,24,29,.08)`.

### Motion

- State transitions 180 ms ease-out. Verdict reveal 240 ms.
- Capture pulse: 1.6 s breathing ring, scale 1→1.12, opacity .35→0, loops while listening. The one
  ambient animation in the app; earned because it communicates "live mic".
- Reduced motion: ring becomes a static level meter; reveals become crossfades.

## The three board directions

Same spine, different commitment. Built as real screens at `/board/*`.

- **A — Field Instrument** (restrained, dark): hairlines, mono data, SNR readout as honest hardware.
  Wager: judges trust an instrument more than an app.
- **B — Public Clinic** (restrained, light): white + cobalt, MOH-adjacent institutional trust, Inter.
  Wager: familiarity reads as deployable-tomorrow, and the officer/citizen split is typographic
  rather than dark/light.
- **C — Verdict** (committed→drenched): capture is near-black and typographic ("Dengar." is the
  button); **the result surface IS the verdict color** — aedes drenches red, abstain drenches deep
  indigo-grey. Wager: the strongest possible video frame; one screen = one answer.

## Rubric axes (the taste half of the loop oracle; floors live in loop-eng-profile)

1. **Verdict legibility** — outcome + next action readable in <1 s at arm's length.
2. **Abstain dignity** — abstain feels like a competent instrument reporting, never a failure state.
3. **Instrument, not toy** — zero gamification/mascot/wellness grammar; §2 language holds everywhere.
4. **Two-audience distinctness** — a citizen screen and an officer screen are never confusable.
5. **System coherence** — every screen derivable from this file; no invented spacing/color/radius.
