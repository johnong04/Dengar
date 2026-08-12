# Dengar tasks

## Run: v1-citizen (overnight 2026-08-12, hack rigor, branch john-v1-citizen)

- [x] 01 shell + tokens (smoke)
- [x] 02 capture screen (hard · board a-capture)
- [x] 03 abstain results ×3 (hard · board a-abstain)
- [x] 04 detected result drench (hard · board c-detected)
- [x] 05 history (smoke)
- [x] 06 onboarding + mic permission (smoke)
- [x] 07 offline indicator (smoke)
- [x] 08 critique + polish pass (hard)

## Run: v2-full (2026-08-12, hack rigor, same branch john-v1-citizen)

Gate 2 closed: warmth revision approved (hues to refine), officer = e (home) + d (cluster map).

- [x] 11 warmth into law — tokens + design-system.md (hard)
- [ ] 12 warmth applied to the 8 v1 citizen screens (hard)
- [ ] 13 officer shell + Trend home (hard · board officer-e + CTA emphasis, stripe removed)
- [ ] 14 officer cluster map on the real OSM basemap (hard · board officer-d)
- [ ] 15 officer alert feed + dispatch acknowledgement (smoke)
- [ ] 16 citizen neighbourhood risk + prevention (smoke)
- [ ] 17 static-node mode — setup + running (smoke)
- [ ] 18 BM/EN toggle — copy extracted behind a lookup (smoke)
- [ ] 19 v3 citizen roadmap — privacy, detail explainer, impact (smoke)
- [ ] 20 v3 officer roadmap — forecast, surgical dispatch (smoke)
- [ ] 21 final critique + polish, whole app (hard, 1 fix cycle)

## Run: ml (2026-08-12, session B, same branch)

- [x] M1 `ml/dengar.py` — data + train + export in one script, Colab-only
- [x] M2 TFLite conversion verified locally before any Colab run (380k params, 1.45 MB,
      `[1,80000]` in / `[1,2]` out, matches Keras to 7dp). Project's named #1 risk, closed.
- [ ] M3 `data` — download + window cache, confirm per-class counts
- [ ] M4 `train --task msc` — the product model, `[aedes, not_aedes]`
- [ ] M5 `train --task med` + `--task tri`
- [ ] M6 `export` — tflite + tfjs + band-SNR floor and reference table into specs.md §4
- [ ] M7 three demo clips (clean Aedes / non-Aedes / correctly-abstaining noisy)
- [ ] M8 stretch: real in-browser inference on Expo web, behind `classify()`

### If MSC comes back weak — two upgrades, in this order, measured not assumed

Trigger: MSC accuracy under ~75%. Not to be done pre-emptively.

1. **ImageNet-pretrained MobileNetV2** on the spectrograms instead of the from-scratch CNN
   (~30 min). The one real compromise in the current design is no transfer learning: we train
   from scratch on **89 independent *Aedes* recordings**. Pretraining is the standard fix for
   data that small, and MobileNetV2 is the canonical TFLite model so conversion stays safe.
2. **Wingbeats** ([Kaggle, 85,553 *Ae. aegypti* clips](https://www.kaggle.com/datasets/potamitis/wingbeats))
   folded into training, HumBugDB held out for test (~40 min). **Handle with care:** Wingbeats
   was recorded by optoelectronic sensors, not microphones. Training on it and reporting the
   result as phone-mic performance is the invented-figure defect class — the accuracy would be
   high and meaningless. Only valid with a mic-recorded held-out test set and stated on camera.

Not doing: Oxford's released weights (PyTorch ResNet/VGG with MC-dropout sampling — a four-step
conversion chain, and TFLite strips dropout silently, so the Bayesian part would vanish without
an error). Abuzz as a scored eval set (Dryad, manual, test-only per specs.md).
No sex head — HumBugDB has 22.2 min of female *Aedes* and 0.1 min of male.

## Later (not this run)
- [ ] Real audio + fast-tflite + persistence — next EAS build batch (one build, all native deps)
- [ ] BM copy human verification (Malay speaker; slice 18 flags it unverified)
- [ ] Verify RM 31M / RM 8M against a primary MOH or Hansard source before it goes on camera
