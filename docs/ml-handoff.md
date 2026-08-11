# Session B handoff — `ml/`

You are the ML session for **Dengar**. Read `specs.md` in full before writing code — especially §2
(the sensing model), §4 (the contract), §6 (your section), §9 (the only figures you may cite).
`CLAUDE.md` and `CLAUDE.local.md` carry the gotchas and this machine's limits.

**You own `ml/` only. Never edit `app/`.** The other session is building the UI in parallel against a
stub. `specs.md` is shared — tell John before editing it.

## The one thing that decides whether this project has a demo

Deliverable is an 8-minute video whose uncuttable shot is a phone classifying a wingbeat **in
airplane mode**. That needs a `.tflite` file on a phone. Everything else is negotiable; that isn't.

**Task 1, before any accuracy work: a model file that loads in `react-native-fast-tflite`.**

Do not attempt to convert HumBugDB's released weights. They are Bayesian neural networks and
Bayesian layers do not convert to mobile cleanly — that is this project's main technical risk, and
the mitigation is to not enter the risk. Use HumBugDB's **data pipeline** (the valuable part:
labelled, preprocessed audio, 20 hr, 36 species) and train a **plain CNN** through it. A plain CNN
converting to TFLite is a routine operation.

Ship a deliberately dumb, small, converting model first. Then improve it.

## Constraints

- **No NVIDIA GPU, no CUDA.** Preprocessing local (12 threads, cache to `.npy` so it never reruns).
  Training on Colab free T4.
- **No clipboard pasting.** Code lives in git; Colab does `git pull`, runs `preprocess.py` then
  `train.py`, and John pastes back only final metrics. See specs.md §6 for the cell.
- **Abuzz is test-only, never training.** It is the proof the model survives real phone-mic audio.
- **Never invent a figure.** specs.md §9 is the source. Tag `[cited]` or `[modeled]`.

## What you hand to `app/`

Numbers, never words. All labelling, thresholds and copy live in the app — do not put a class name
or a user-facing string anywhere in your output.

1. **`med.tflite`** — 1 float, P(mosquito present). Oxford's pretrained MED is the abstain gate and
   it is free; use it if it converts, retrain plain if it doesn't.
2. **`msc.tflite`** — 2 floats, softmax, **fixed order `[aedes, not_aedes]`**. This binary IS the
   product contract: it is what triggers a fogging order.
3. **The band-SNR spec.** specs.md §4 has three blanks with your name on them — band (Hz range),
   window, and floor (dB). Plus a **reference table of ~10 clips with their expected dB values**.
   The app implements the formula in TypeScript and must reproduce your table; that table is the
   app's RED test. Without it, two slightly different SNR implementations drift, the floor doesn't
   transfer, and the gate silently passes garbage.
4. **An honest accuracy number and a confusion matrix** — honest enough to say out loud on camera.
5. **Three demo clips:** one clean *Aedes*, one non-*Aedes*, one noisy clip that **correctly
   abstains**. The abstain clip is not optional; it is the credibility beat.

## Extra heads — only after task 1 lands

Optional `detail` fields in the contract (specs.md §4). Every one independently optional; the app
renders what's present. Ranked by *does the answer change a decision*:

1. **Sex (female/male) — do this one.** Only females bite, so male detections are noise in the
   density signal, and density is the entire health-impact claim. MosquitoSong+ measured 93.3% on
   species+sex, *higher* than species alone. Close to free.
2. **3-class `aedes / anopheles / other` — if cheap.** *Culex* is a nuisance; *Anopheles* is malaria,
   and Malaysia has *knowlesi* malaria in Sabah/Sarawak. A second disease story for the proposal.
3. ***aegypti* vs *albopictus* — do not spend on this.** Hardest pair, changes no decision, both
   transmit dengue and both trigger the same fogging response.

From MosquitoSong+ (paper only, no code or weights — it is the recipe, not a dependency): take its
architecture tweaks and its two augmentations, **noise augmentation** and **wingbeat volume
variation**. That is the noise-robustness knowledge and it is what moves the 67.3% outdoor number.

## Done means

`med.tflite` and `msc.tflite` load in `react-native-fast-tflite`; inference verified on a
phone-recorded Abuzz clip (not just a HumBugDB split); a confusion matrix; the band-SNR spec and
reference table written into specs.md §4; three demo clips selected. Report which heads exist so the
video narration can label everything else as simulated — specs.md §13 rule 3, concealed simulation
is the disqualifier.
