# v1-citizen — shared constraints (read first, every slice)

Run: hack rigor · ONE branch `john-v1-citizen` off `main` · slices commit sequentially, priority
order · always-demoable. Commit after every slice (CLAUDE.local.md standing authorization).

## The oracle
- **Approved references (John-gated 2026-08-12):** `docs/design/board/a-capture.png`,
  `a-abstain.png`, `c-detected.png`. These set the *direction and ceiling to exceed* — synthesize,
  never copy pixel-for-pixel. `docs/design/design-system.md` is law for tokens/type/motion; B-direction
  values in it are dead — citizen surface is the dark instrument system + red verdict drench.
- **Floors (machine-checked by the evaluator):** contrast ≥ AA on painted background · no horizontal
  scroll at 390×844 and 430×932 · copy exactly from this plan set (diff = 0) · every tap target ≥ 44px
  · reduced-motion alternative for every animation.
- **Rubric (evaluator grades):** design-system.md §Rubric axes.
- **Fix cycles: every `hard` slice gets evaluator → up to 2 fix rounds → flag-and-continue.**
  Smoke slices: script gate + one quick fix attempt.

## Hard constraints
1. **NO new native dependencies.** The installed dev build on John's phone streams JS only; one
   native `npm install` silently bricks phone testing until a 1.5h EAS rebuild. JS-only deps allowed
   (prefer none). `react-native-reanimated` is already installed — use it for motion.
2. **specs.md §2 language table is BINDING on every string.** Never "scan"/"detect nearby"/"ambient".
   Always encounter framing: "the mosquito that found you", "hold within 10 cm".
3. **All inference through `src/inference/classify.ts`** (the stub). Screens never invent scores.
   Do not modify `src/inference/gating.ts` (critical path) — consume it.
4. **Abstain is a first-class result, never an error.** No red, no warning styling on abstains.
   Aedes-red appears ONLY on a positive Aedes verdict.
5. Numbers in copy: only figures from specs.md §9, or none. Never invent a statistic.
6. Fonts: config tokens only (`font-plex*`, `font-mono*`) — never `font-[...]` arbitrary families
   (Tailwind converts `_` to space; this bug already cost a round).
7. Colors: graduate the dark-ground palette from design-system.md into `tailwind.config.js` in
   slice 1; later slices use named tokens, no raw hex in screens.

## Runtime prerequisites (all present)
Dev server: `cd app && npx expo start --web` (assume running on :8081; restart with `--clear` after
any tailwind.config change). Gate: `cd app && npm run check`. Screenshots: playwright-cli at
390×844, saved to `docs/loop-eng/screens/<slice>-<screen>.png`. Metro cold bundle ~50s — wait for
`Web Bundled` before navigating.

## Handoff
Append completed / started-unfinished to `docs/loop-eng/handoff.md` before exiting a chunk.
Flagged findings that survive 2 fix rounds: log in handoff, continue.
