# ML results — the only source for any model figure

Written by the `ml/` session, 2026-08-12. **If a number about the model appears on a slide or
in an answer, it comes from here.** specs.md §9 governs epidemiology figures; this file governs
model figures. Nothing else is citable.

## What was built

Two models, both trained from scratch. They return numbers only — every label, threshold and
user-facing word lives in the app.

| File | Question | Output |
|---|---|---|
| `msc.tflite` | Is it *Aedes*? | 2 floats, `[aedes, not_aedes]` — **the product** |
| `med.tflite` | Is there a mosquito at all? | 2 floats — the abstain gate |
| `tri.tflite` | *Aedes* / *Anopheles* / *Culex*? | 3 floats — bonus, **weak, do not present** |

Input to all three: **5.0 s mono, 16 kHz, float32 in −1…1**. The mel-spectrogram front-end is
inside the model file, so the app performs no signal processing.

Architecture: plain CNN, **380,306 parameters, 1.45 MB** as TFLite. No Bayesian layers, no
borrowed weights.

## The numbers

### msc — the product model

| Metric | Value |
|---|---|
| macro-F1 | **0.804** |
| accuracy | 0.820 |
| ***Aedes* recall** | **0.826** |
| ***Aedes* precision** | **0.681** |
| test set | 735 windows drawn from **523 held-out recordings** |

```
                 predicted
              aedes  not_aedes
true aedes      194     41
true not_aedes   91    409
```

**Say it like this:** *"It catches 83% of Aedes and cries wolf on about one call in three. For a
health tool that is the right way round to be wrong — a miss is an unreported dengue risk, a
false alarm is a wasted fogging run. And it is a dial, not a fixed property: the app requires
70% confidence before it calls Aedes, and raising that trades sensitivity for precision."*

**Do not say** "82% accurate" on its own. It is true and it hides the interesting part.

### med — the abstain gate

macro-F1 **0.941**. Mosquito recall 0.927, background recall 0.954.
This is what makes the three abstain screens real rather than decorative.

### tri — bonus, not for presentation

macro-F1 0.667, *Aedes* recall 0.769, precision 0.620. Better than expected, still well short
of the binary. Mention only if asked directly, and only as "a three-species head we trained but
would not ship".

### Run-to-run variance — know this before quoting a third decimal

The model was trained twice with identical code and data. Weight initialisation is not seeded,
so the scores moved: **msc 0.840 → 0.804, med 0.924 → 0.941, tri 0.602 → 0.667.** Roughly
±0.04 on macro-F1.

The figures in this file are from the **second run — the one whose files actually shipped.**
Treat two significant figures as real and the third as noise. If asked how confident the number
is, "0.80 to 0.84 across runs" is the honest answer, and giving it unprompted is stronger than
being caught with false precision. With 89 *Aedes* recordings, this much variance is expected.

## Why these numbers are trustworthy

Two design decisions did the work, and both are worth a slide if there's room:

1. **Split by recording, not by clip.** Consecutive slices of one recording are nearly
   identical. Putting them on both sides of the train/test split is the standard way to
   manufacture a 99% that means nothing. 523 held-out **recordings** the model never saw.
2. **Species training restricted to a single recording rig** (Tanzania, tascam, 44.1 kHz).
   All the *Aedes* audio comes from that rig and so does most of the *Culex* and *Anopheles*,
   so the model cannot score well by recognising the microphone instead of the mosquito.

Training used the two augmentations from MosquitoSong+ (PLOS ONE 2024): noise mixing and
wingbeat volume variation.

## Limitations — state these before a judge finds them

- **89 independent *Aedes* recordings** exist in HumBugDB (22.2 min *Ae. aegypti*, 0.7 min
  *Ae. albopictus*). That, not the minute count, is what bounds the result. Roughly 22 recordings
  are in the held-out set.
- **Tested on HumBugDB's tascam recordings, not phone-microphone audio.** Stanford's Abuzz
  corpus is the test that would prove phone transfer, and it was not run. Do not claim
  phone-mic validation.
- The *Aedes* set is almost entirely *Ae. aegypti*; *Ae. albopictus* is 0.7 min. The binary
  claim is sound, a species-level *albopictus* claim is not.

## Four things we tried or considered and rejected — with evidence

Useful for "what did you rule out?" questions.

| Rejected | Why |
|---|---|
| **Oxford's released HumBugDB weights** | PyTorch ResNet/VGG using MC dropout. Reaching a phone needs PyTorch→ONNX→TF→TFLite, and TFLite treats dropout as an inference no-op and strips it — the Bayesian behaviour would vanish silently, with no error. |
| **ImageNet-pretrained MobileNetV2** | Trained and **measured**: macro-F1 0.473 vs 0.840. It needs the spectrogram resized to 96×96, which destroys the frequency resolution that wingbeat identity consists of. Our from-scratch CNN is also 7× smaller. |
| **Wingbeats dataset** (85,553 *Ae. aegypti* clips) | Recorded by optoelectronic sensors, not microphones. Training on it and reporting the result as phone performance would be a meaningless high number. Never needed — msc cleared the bar without it. |
| **A sex (female/male) head** | HumBugDB has 22.2 min of female *Aedes* and 0.1 min of male. Nothing to train on. Worth mentioning: only females bite, so this is the head we *wanted* most. |

## Provenance

- Dataset: **HumBugDB**, Oxford, NeurIPS 2021 Datasets & Benchmarks. CC-BY-4.0,
  [Zenodo 4904800](https://zenodo.org/records/4904800). 20 hr labelled mosquito audio,
  15 hr background, 36 species.
- Augmentation recipe: **MosquitoSong+**, Mahidol, PLOS ONE 2024 (paper only — no code or
  weights used).
- Training: 16 min on a Colab free T4. All code in [`ml/dengar.py`](../ml/dengar.py).
