# v2-full — shared constraints (read first, every slice)

Run 2: hack rigor · SAME branch `john-v1-citizen` (v1 is unmerged by design; one branch, always
demoable) · slices commit sequentially in priority order. Commit after every slice
(CLAUDE.local.md standing authorization). Model: Opus 5 (session default).

## The two gates are closed — read them, don't re-litigate
`docs/design/design-system.md` §Gate record + §Gate 2. Citizen = dark, **warmth revision approved**
(hues to be refined in slice 1, then LAW). Officer = light, **officer-e home + officer-d cluster map**.
No third register: a v3 screen inherits its audience's language.

## The oracle per slice type
- **Citizen screens:** `docs/design/board/warm-{capture,abstain,detected}.png` for the warm language,
  plus the shipped `docs/loop-eng/screens/final/*` for content/structure parity.
- **Officer screens:** `docs/design/board/officer-e.png` (home) and `officer-d.png` (cluster map).
- **Floors (evaluator MEASURES these):** contrast ≥AA on the *actual painted* background · no
  horizontal scroll at 390×844 and 430×932 · tap targets ≥44px · reduced-motion alternative exists ·
  copy diff = 0 vs the plan · specs §2 sweep clean.
- **Rubric (evaluator GRADES):** design-system.md §Rubric axes.
- **Fix cycles: every `hard` slice gets evaluator → up to 1 fix round → flag-and-continue.**
  Smoke slices: script gate + one quick fix attempt.

## Hard constraints
1. **NO new dependencies. None.** The installed dev build on John's phone streams JS only; one native
   `npm install` bricks phone testing until a ~1.5 h EAS rebuild. This bans every map/chart library —
   all visualization is composed from `View`s (absolute positioning, `transform: rotate`,
   variable-height flex rows, tinted grids). `react-native-reanimated` is already present for motion.
2. **specs.md §2 language table is BINDING** on every string. Never scan/nearby/ambient/survey.
3. **specs.md §9 is the only source of figures.** Never invent a number, and never build a visual that
   implies an unsourceable one (this is why officer-f's arc gauge was rejected). The simulated
   scenario figures (14 detections/72 h, +40 mm, 14–21 d lead) are sanctioned.
4. **All inference through `src/inference/classify.ts`.** `src/inference/gating.ts` is a critical path:
   consume it, and if a change is genuinely required, RED TEST FIRST in `gating.check.ts`.
5. **Aedes-red is exclusive to a positive Aedes verdict** (citizen) and to officer alert states.
   Abstain is never error-styled.
6. Fonts via config tokens only (`font-plex*`, `font-mono*`, `font-inter*`) — never `font-[...]`
   arbitrary values (Tailwind turns `_` into a space; silent fallback, cost a re-shoot once).
7. Colors via named tokens from `tailwind.config.js` — no raw hex in screens. `src/app/board/*` are
   frozen artifacts: never retoken them, never restyle them.
8. **Declared simulation.** Any screen showing seeded/simulated data gets a quiet, honest marker
   (a mono `simulated` tag or equivalent) — specs §8/§13 rule 3. Concealed simulation is the
   disqualifier; declared simulation is fine and expected on Seed Track.

## Maps
`app/assets/maps/setapak-osm.png`, 512×768, OSM z15. Project lat/lon → pixels with bounds
north 3.228271 · west 101.711426 · south 3.195364 · east 101.733398 (linear in longitude; Mercator
formula for latitude). Render `© OpenStreetMap contributors` wherever it appears. Seeded detection
coordinates live in one module so citizen and officer maps share them.

## Runtime
Dev server: `cd app && npx expo start --web` (:8081). Restart with `--clear` ONLY after changing
`tailwind.config.js`/`metro.config.js`. Cold bundle ~50 s — wait for `Web Bundled` before navigating.
Gate: `cd app && npm run check`. Screenshots: playwright-cli 390×844 →
`docs/loop-eng/screens/<slice>-<screen>.png`.

## Handoff
Append completed / started-but-unfinished to `docs/loop-eng/handoff.md` before exiting. Findings that
survive the fix round: log and continue — never halt. Slice 21 is where survivors get their second look.
