# ML results — the only source for any model figure

Written by the `ml/` session, last measured 2026-09-04. **If a number about the model appears on a slide or
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

Architecture: plain CNN. `msc` 380,306 params / 1.45 MB TFLite; `med` 353,854 / 1.36 MB.
No Bayesian layers, no borrowed weights.

## The numbers

### msc — the product model

| Metric | Value |
|---|---|
| macro-F1 | **0.825** |
| accuracy | 0.854 |
| test set | **523 held-out recordings** |
| model | 380,306 params, 1.45 MB TFLite |

Shipped config: `msc|w1.0|a0|s2` — standard width, SpecAugment **off**, chosen on validation
(val 0.915) out of 18 candidates.

```
                 predicted
              aedes  not_aedes
true aedes      164     71        precision 0.820, recall 0.698
true not_aedes   36    464        precision 0.867, recall 0.928
```

**The error direction REVERSED from the earlier model, and this matters more than the score.**
The old one over-called *Aedes* (recall 0.83-0.96, precision 0.68) — it rarely missed and often
cried wolf. This one is the opposite: **precision 0.820, recall 0.698.** It is right when it
speaks and misses roughly 30% of *Aedes*.

Any claim of the form "rarely misses a mosquito" or "catches 96%" is **false for the shipped
model** and must not appear on a slide or in narration.

**Say it like this:** *"82% of its Aedes calls are correct, and it misses about 30%. For a
fogging dispatch that is the right default — you do not send trucks to nothing. We measured the
other operating point too: lower the threshold and it trades precision for recall, which is what
a health authority would want during an outbreak. Same model, different dial."*

That claim is backed: macro-F1 at the validation-optimal lower threshold is 0.8295, against
0.8253 at the default. The dial is real and measured, not asserted.

**Also true, and worth volunteering:** across the 18 configurations trained, test macro-F1
ranged 0.56 to 0.83. With 89 independent *Aedes* recordings the estimate cannot be tighter
than that. Quote two significant figures.

**Do not say** "85% accurate" on its own, and do not quote 0.825 to three decimals.

### med — the abstain gate

macro-F1 **0.964**, over 1000 held-out recordings. Shipped config `med|w0.75|a1|s0` —
narrow, SpecAugment on. 353,854 params. Balanced both ways: mosquito recall 0.958, background
recall 0.970.

```
                 predicted
             mosquito  none
true mosquito    475    21
true none         15   489
```
 This is what makes the abstain screens real rather
than decorative.

### tri — bonus, not for presentation

macro-F1 0.640 (a 3-model ensemble; the only task where ensembling won). Mention only if
asked, and only as "a three-species head we trained but would not ship".

## What the sweep measured, beyond the headline

53 runs: 3 widths x SpecAugment on/off x 3 seeds, per task, ~3.5 h on a Colab T4. Five findings
worth having ready, because each shows a hypothesis being tested rather than assumed.

**1. The honest number came out HIGHER than the biased one.** The earlier 0.804 was inflated —
early stopping restored the epoch with the best *test* accuracy, so we were selecting on the
data we then reported. Removing that and adding a cosine learning-rate schedule netted **0.825**
on a test set untouched until the final prediction. More rigorous and better.

**2. Test scores ranged 0.56–0.83 across `msc` configurations.** That spread, not the winning
figure, is the real measure of how much 89 *Aedes* recordings can support.

**3. Validation systematically overestimates test** (val ~0.89 vs test ~0.70 on average).
Selecting on validation was still correct, and here it picked the genuinely best model — but a
validation score is not a capability claim.

**4. SpecAugment helped `med` and not `msc`.** The winning `msc` config has it off. A
reasonable hypothesis that the data declined.

**5. Ensembling lost on the tasks that matter.** Averaging the top 5 scored 0.71 on `msc` test
against the single model's 0.83; it won only on `tri`. Individual runs vary so much that
averaging pulled good models toward bad ones. The code only ships an ensemble when it beats the
best single model on validation, so it correctly did not ship.

## Two live caveats

**The TFJS export failed** and the `tfjs_*` folders on Drive are **stale — from the August
models, not these.** `tensorflowjs` breaks against NumPy 2 (`np.object` was removed in the
NumPy 1.20 deprecation cycle). Only the in-browser demo depends on this; the `.tflite` files
are current. **Do not present those folders as the shipped model.**

**The tuned threshold is not the app's threshold.** `ensemble` reports the class boundary that
maximises macro-F1 on validation (0.30 for `msc`). The app's 0.70 in `gating.ts` is an
*abstention* threshold — max confidence below it means "not confident" — which is a different
quantity. They are not comparable, and the tuning was worth +0.004 anyway. `gating.ts` is
unchanged and should stay that way.

## Phone-microphone validation — measured 2026-09-19. READ BEFORE ANY SLIDE.

Every score above is measured on HumBugDB's Tanzania/Tascam field recordings. The product runs
on phone microphones, so that gap was the project's largest untested claim. It is now tested.

Test set: **3,169 HumBugDB recordings made on phones** (Alcatel 4009X / itel A16) — 113 *Aedes*,
2,361 not-*Aedes*, 695 background. `dengar.py`'s rig filter excluded every one of them from
training, so there is **zero leakage**. 113 *Aedes* recordings is larger than the 89 the model
was trained on.

| | Trained-domain (Tascam) | **Phone microphone** |
|---|---|---|
| **MED** — is a mosquito present? | 0.964 | **0.879** — transfers |
| **MSC** — is it *Aedes*? | 0.825 | **0.484** — does not transfer |

```
MED on phone audio                     MSC on phone audio (MED-gated)
                 predicted                            predicted
            mosq   background                      aedes  not_aedes
true mosq   2577      299            true aedes        0       110
true bkgd    513     3399            true not_aedes   14      2453
  mosquito recall 0.896                 AEDES RECALL 0.000  — 0 of 113
  background recall 0.869              not_aedes recall 0.994
```

### What this means, stated plainly

**MED survives the microphone change.** 0.879 across a different phone, country and sample rate,
with no retraining. The detection-and-abstain layer is genuinely validated on phone audio.

**MSC does not survive it at all.** Not a degradation — a collapse. It found **zero of 113**
*Aedes* recordings and answered "not_aedes" to essentially everything. On a 113-against-2,763
split that reads as 95% accuracy and is worthless, which is exactly why macro-F1 is the headline
and accuracy is not.

### What may and may not be claimed

**May be claimed:**
- On-device mosquito detection, offline, validated across microphones (MED, 0.879).
- *Aedes* species identification at 0.825 macro-F1 **on the recording rig it was trained on**.
- That we tested our own premise and found its limit.

**May NOT be claimed, in the deck, the narration or the Q&A:**
- That species identification works on a phone. **It is measured, and it does not.**
- Any *Aedes* figure without naming the recording domain it came from.

### The line to say

*"We validated the two stages separately. Detection transfers across microphones — 0.88 on phone
recordings the model never saw. Species identification does not: on that same phone audio it
found none of the 113 Aedes recordings. It holds at 0.83 only on the equipment it was trained on.
We know that because we tested it rather than assumed it, and closing that gap needs phone-recorded
Aedes training data, which the public datasets barely contain — 113 recordings worldwide is what
we could find."*

That is a stronger position than a single unqualified number. The failure is specific, measured,
and has a named fix.

### The diagnostic, and why the conclusion is narrower than it looks

**AUC 0.182.** Not 0.5. AUC below 0.5 means *inverted*: the model scores *Aedes* systematically
**lower** than non-*Aedes* on this data. Flip the output and it would score 0.82. That is strong
structure pointing the wrong way, which is a different thing from absent features.

Moving the threshold cannot rescue it — the best any cut-off achieves is 0.489 against the 0.488
default.

**A confound in the test set, found after the fact.** In this phone subset the *Aedes* clips
average **0.42 s** (113 clips, 0.8 min total) while the not-*Aedes* clips average **3.2 s**
(2,361 clips, 126 min). `load_clip` tiles anything shorter than 5 s up to the contract length, so
*Aedes* clips are repeated roughly 12 times and not-*Aedes* roughly 1.6 times. **Clip duration,
and therefore tiling periodicity, is correlated with the class label.** The model may be reading
that artifact rather than the microphone change.

So the defensible statement is narrower than "species identification does not transfer to phones":

- **Established:** MSC fails completely on this set of phone recordings. 0 of 113. Nothing about
  phone species identification may be claimed.
- **Not established:** whether the cause is the microphone, the 8 kHz sample rate, or our own
  tiling. This test cannot separate them.

Resolving it needs phone *Aedes* clips long enough not to be tiled, which this subset does not
contain — Abuzz's longer field recordings would, and that is the reason to go back for them.

### Why it fails, and what would fix it

Two candidates, needing different fixes, and `phone_eval.py` now reports the AUC that separates
them — above ~0.70 the signal is present and the decision boundary is misplaced; near 0.5 the
features are absent from phone audio entirely.

The likely causes, in order:
1. **Clip length.** The phone *Aedes* clips are 0.05–2 s, tiled up to the contract's 5 s. Tiling
   splices in a periodic discontinuity the model never saw in training.
2. **Sample rate.** Phone audio is 8 kHz against 44.1 kHz training material.
3. **Microphone response and a different colony.** Real, but neither would produce 0 of 113 alone.

The fix is phone-domain training data, not a bigger model — which is why the YAMNet route was
never the first answer.

---

## band-SNR — measured, and deliberately not shipped

The third gate (specs.md §4) was measured and **does not work**, so it is not shipping. Values
across 10 clips ran −9 to −30 dB, with *Aedes* clips scoring *lower* than non-*Aedes* — backwards.
The formula's out-of-band term includes everything below 200 Hz, where handling noise and mains
rumble dominate real recordings, so it measures rumble rather than band usability. It separates a
synthetic 500 Hz tone from white noise by 25 dB and fails on real audio.

**What this means for the pitch:** two of the three abstain states — "no mosquito detected" and
"not confident" — are genuine model output. **"Too noisy" is a placeholder and must be narrated as
simulated.** Declared simulation is fine (§8); concealed simulation is the disqualifier.

If asked why: *"We measured it, it was measuring the wrong thing, and calibrating it properly needs
recordings labelled unusable — which the dataset doesn't have. We'd rather declare it than ship a
gate that passes garbage silently."*

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
| **ImageNet-pretrained MobileNetV2** | Trained and **measured**: macro-F1 0.473 vs 0.840 in the earlier run. It needs the spectrogram resized to 96×96, which destroys the frequency resolution that wingbeat identity consists of. Our from-scratch CNN is also 7× smaller. |
| **Wingbeats dataset** (85,553 *Ae. aegypti* clips) | Recorded by optoelectronic sensors, not microphones. Training on it and reporting the result as phone performance would be a meaningless high number. Never needed — msc cleared the bar without it. |
| **A sex (female/male) head** | HumBugDB has 22.2 min of female *Aedes* and 0.1 min of male. Nothing to train on. Worth mentioning: only females bite, so this is the head we *wanted* most. |

## Provenance

- Dataset: **HumBugDB**, Oxford, NeurIPS 2021 Datasets & Benchmarks. CC-BY-4.0,
  [Zenodo 4904800](https://zenodo.org/records/4904800). 20 hr labelled mosquito audio,
  15 hr background, 36 species.
- Augmentation recipe: **MosquitoSong+**, Mahidol, PLOS ONE 2024 (paper only — no code or
  weights used).
- Training: 53 runs, ~3.5 h on a Colab free T4, hard-capped. All code in [`ml/dengar.py`](../ml/dengar.py).
