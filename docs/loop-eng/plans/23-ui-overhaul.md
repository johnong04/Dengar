# UI overhaul — make it look like a shipped product (2026-09-19)

**Deliverable: a screen-recorded demo video, browser, no voiceover, mock data.** ~10 h to submit.
A second session executes this. The dev-build EAS rebuild is running in parallel and does not block
any of it.

## The diagnosis (do not re-derive it)

Ours vs `docs/design/inspiration/*`: the gap is NOT rigor, tooling or technique. It is five choices,
each defensible, each costing polish:

1. **Monospace used as body text** on every screen (`14 detections · 72 h · +40 mm rain`,
   `block level · no address`). Neither reference uses mono anywhere. This is the single strongest
   "data-science tool, not an app" signal. **Demote mono to numerals and captions only.**
2. **The map is a dimmed PNG** — a small boxed raster with a dark veil painted over it. Washed out,
   low zoom, unreadable street names.
3. **No icons anywhere** except three hand-drawn tab glyphs.
4. **No depth** — everything is a flat rounded rect in a vertical column. The references float cards
   over the map.
5. **Card-stack layout** — `/area` is four identical rounded rectangles stacked. Our own
   `docs/design/research-2026-mobile.md` names that as the #1 AI-generated tell.

**Why we never fixed it:** the "NO new dependencies" rule. It was written because a *native* module
bricks the phone dev build for ~90 min. It got applied to JS-only packages, which carry none of that
risk. `specs.md` §5 named Gluestack as the component layer from day one and we hand-rolled everything
instead. That was the mistake.

## Register: KEEP DARK. Overhaul the surface, not the identity.

Going light would match the references but collapses the citizen/officer distinction (officer is
already light) and throws away the board gate. The red drench on a positive Aedes verdict is the
strongest single frame in the app and only works on dark. **Change how it looks, not what it is.**

## Now available (installed, gate green)

| Package | Kind | Use |
|---|---|---|
| `lucide-react-native` | JS (needs svg, present) | Every icon. Consistent 1.5–2px stroke set |
| `@gorhom/bottom-sheet` | JS (on gesture-handler + reanimated, both present) | Detail sheets, the officer cluster, history rows |
| `react-native-svg` | native, in the build | Crisp vectors, charts, custom marks |
| `@expo/vector-icons` | JS + fonts | Fallback icon set |
| `maplibre-gl` | web only | **The real live map, in the browser** — no API key, no billing |
| `react-native-maps` | native, in the build | Phone map. **Inert until Google billing is enabled** — do not wire it |

`react-native-reusables` (shadcn-for-RN, built on NativeWind) is worth pulling components from by
copy-paste. Do not add a second styling runtime (no tamagui, no gluestack provider) — NativeWind is
already the system and two of them fight.

## The work, in order of payoff

1. **Real map in the browser.** `MapView.web.tsx` using maplibre-gl with a dark vector style;
   `MapView.native.tsx` keeps the existing raster. Same props, platform split — RN resolves it. This
   kills defects 2 and 4 at once: full-bleed live map, cards floating over it.
2. **Kill the mono body text.** Sweep `src/copy/` + every screen. Mono survives ONLY for figures and
   short specs. This is the cheapest large win and touches no layout.
3. **Icons everywhere they earn it** — tab bar, row affordances, prevention actions, officer states.
   Not decoration: an icon that repeats the label is noise.
4. **Bottom sheet for detail** — officer cluster opens from a map pill; history row expands into a
   sheet. Replaces stacked cards with the pattern the references use.
5. **Break the card stack on `/area`** — grouped hairline rows inside ONE surface, not four boxes.
6. **Depth and density** — elevation by surface level (`bg`/`surface`/`surface-raised`), never glow.
   Fill the empty space on capture.

## Hard constraints (unchanged, and they still bind)

- specs §2 language table is binding on every string, both languages. `nearby`, `scan`, `ambient`,
  `survey` are banned outright — a previous copy-cut introduced `nearby` and it shipped until swept.
- specs §9 is the only source of figures. No invented numbers, arithmetic shown.
- Citizen dark / officer light must stay unmistakably different.
- Colours and fonts via tokens from `tailwind.config.js`. No raw hex in screens.
- `src/app/board/*` is frozen.
- `react-native-web` drops `className` on a reanimated `Animated.View` — geometry goes on `style`.
- Gate: `cd app && npm run check`. Commit per item. Screenshots to
  `docs/loop-eng/screens/ui-overhaul/`.

## Demo state currently ON — revert before any preview APK

`DEMO_SCRIPTED = true` (capture 1 abstains, capture 2 says Aedes), `district.simulated = false`
(honesty chips hidden), dates frozen at `FRI 4 SEP · 09:00`. Commits `89af33e` and `d426b34`.
Fine for the video. Wrong for anything handed to a judge.

## Definition of done

Six screens that survive a side-by-side with `docs/design/inspiration/*`: capture, result (Aedes),
area, history, officer home, officer cluster. No horizontal scroll at 390×844 and 430×932. Gate green.
One screenshot per screen at 390.
