# Dengar

Acoustic *Aedes* surveillance on commodity phones. Hackathon deliverable is an **8-minute video**,
not a shipped app — a screen that looks finished on camera beats a screen wired to a real backend
that looks unfinished.

**`specs.md` is the spec.** Read it before writing code. Nothing here restates it.

## Layout

- `app/` — React Native + Expo. Screens. Owns all labelling, thresholds and copy.
- `ml/` — Python. Training, TFLite export. Emits numbers, never words.

The only thing crossing the boundary is `.tflite` + the interface in specs.md §4. `app/` never waits
on `ml/`; it builds against a stub that satisfies that interface and returns random values.

## Gotchas

- **`metro.config.js` must list `tflite` in `resolver.assetExts`** or the model silently doesn't
  bundle. One line, an hour to diagnose.
- **`react-native-fast-tflite` is a native module — Expo Go cannot load it.** Needs
  `eas build --profile development --platform android`. Cloud builds queue; run the first one on day one.
- **SDK 56 is New-Architecture-only** (55+ can't disable it). Any Bridge-only library is out.
- **fast-tflite v3 requires `react-native-nitro-modules`** — v2's plain-JSI setup is gone, and every
  peer range in that chain is `*`, so a mismatch surfaces at EAS build time, not at install time.
- **Web (`npx expo start --web`) is the dev loop's screenshot target**, not a shipping target. The
  tflite stub runs there; `Modal`, maps and the audio recorder do not behave like native. Anything
  claimed as working gets one pass on the physical phone via the dev build.
- Audio contract is 5.0 s mono, 16 kHz, float32 −1.0…1.0. `@siteed/expo-audio-studio` with
  `pcm_f32le` @ 16000 delivers it. `expo-audio` alone does not expose a PCM stream.

## UI work

Invoke the `impeccable` skill for any screen work — new screens, restyling, layout, motion, copy.
Not derivable from the code, hence written here. A PostToolUse hook already runs impeccable's
deterministic checks on every file written; the skill is the judgement half and must be invoked.

`docs/design/design-system.md` is the spec for tokens, type, spacing and motion. Extend it, never
fork it. A screen that invents its own spacing scale is a defect even if it looks fine alone.

## Two rules that are not style preferences

- **Never imply ambient scanning.** specs.md §2's language table is binding on every UI string,
  caption and narration line. A judge with entomology background catches it and the claim is false:
  capture requires ~10 cm proximity. Write "identify the mosquito that found you", never "scan the area".
- **Abstain is the main screen, not an error path.** Most 5-second recordings contain no mosquito.
  The three abstain states (no mosquito / not confident / too noisy) get the same design effort as
  the success state, because in the real app they are what users see.

Citizen screens and officer screens must not look alike — an officer screen styled like a consumer
screen reads as unserious. No gamification, no mascots.
