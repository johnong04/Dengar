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
- [x] 12 warmth applied to the 8 v1 citizen screens (hard) — PASS after 1 fix
- [x] 13 officer shell + Trend home (hard) — PASS after 1 fix (every figure derived)
- [x] 14 officer cluster map on the real OSM basemap (hard · board officer-d)
- [ ] 15 officer alert feed + dispatch acknowledgement (smoke)
- [ ] 16 citizen neighbourhood risk + prevention (smoke)
- [x] 17 static-node mode — setup + running (smoke)
- [ ] 18 BM/EN toggle — copy extracted behind a lookup (smoke)
- [ ] 19 v3 citizen roadmap — privacy, detail explainer, impact (smoke)
- [ ] 20 v3 officer roadmap — forecast, surgical dispatch (smoke)
- [ ] 21 final critique + polish, whole app (hard, 1 fix cycle)

## Run: ml (2026-08-12, session B, same branch)

- [x] M1 `ml/dengar.py` — data + train + export in one script, Colab-only
- [x] M2 TFLite conversion verified locally before any Colab run (380k params, 1.45 MB,
      `[1,80000]` in / `[1,2]` out, matches Keras to 7dp). Project's named #1 risk, closed.
- [x] M3 `data` — 783 aedes windows from all 89 recordings, 2000 not_aedes from 2000 files
- [x] M4/M5 all three tasks, both architectures. **Superseded — see M9.** The figures this
      block first carried (msc 0.840) came from a run whose files were lost when a Colab VM
      was recycled; the run that actually shipped scored msc 0.804 / med 0.941 / tri 0.667.
      `docs/ml-results.md` is the single citable source and it carries the shipped run.

#### The on-camera numbers — msc, the product model (shipped run)

```
                 predicted
              aedes  not_aedes
true aedes      194     41        recall 0.826, precision 0.681
true not_aedes   91    409        recall 0.818, precision 0.909
```

**Recall 0.826, precision 0.681** — macro-F1 0.804 over 523 held-out recordings. It rarely
misses an *Aedes* and cries wolf on about one call in three. Right way round for a health
tool, and **a dial not a property**: `gating.ts` needs MSC ≥ 0.70 to call *Aedes*, and
raising that trades recall for precision. Say "we chose which way to be wrong".

med macro-F1 0.941 · tri 0.667 (*Aedes* recall 0.769 — still keep it out of the narration).
Run-to-run spread is roughly ±0.04, so quote two significant figures, not three.

Caveat that must be said out loud: tested on HumBugDB's own tascam recordings, **not**
phone-mic audio. Abuzz would be the test that proves phone transfer and it is not run.

- [x] M9 **Methodology fix — the shipped numbers were optimistically biased.** `cmd_train`
      passed the test set as `validation_data` and let EarlyStopping restore the epoch with
      the best *test* accuracy: selection on the data it then reported. Replaced with a
      3-way split (train/val/test, disjoint by recording, test fixed across seeds), cosine
      LR with warmup, and SpecAugment. Plus a `sweep` command that picks the winner on
      **validation** and checkpoints to Drive after every run so a recycled runtime costs
      one run, not the night.
- [ ] M6 `export` — tflite written; band-SNR floor + reference table still to land in specs.md §4
- [ ] M7 three demo clips (clean Aedes / non-Aedes / correctly-abstaining noisy)
- [ ] M8 stretch: real in-browser inference on Expo web, behind `classify()`

### The two upgrades — both now CLOSED, neither needed

1. ~~ImageNet-pretrained MobileNetV2~~ **measured and lost, on all three tasks**
   (msc 0.473 vs 0.840, med 0.705 vs 0.924, tri 0.247 vs 0.602). MobileNet needs the
   spectrogram resized to 96×96, which destroys the frequency resolution that wingbeat
   identity consists of. The from-scratch CNN is also 7× smaller — 380k params, 1.5 MB.
   Transfer learning was the right hypothesis and the data rejected it.
2. ~~Wingbeats~~ **not needed** — msc cleared its trigger by a wide margin, so the
   optoelectronic-vs-microphone domain-shift risk never has to be taken or explained.

Not doing: Oxford's released weights (PyTorch ResNet/VGG with MC-dropout sampling — a four-step
conversion chain, and TFLite strips dropout silently, so the Bayesian part would vanish without
an error). Abuzz as a scored eval set (Dryad, manual, test-only per specs.md).
No sex head — HumBugDB has 22.2 min of female *Aedes* and 0.1 min of male.

## Later (not this run)
- [ ] Real audio + fast-tflite + persistence — next EAS build batch (one build, all native deps)
- [ ] BM copy human verification (Malay speaker; slice 18 flags it unverified)
- [ ] Verify RM 31M / RM 8M against a primary MOH or Hansard source before it goes on camera
