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

#### The on-camera numbers — SUPERSEDED, see docs/ml-results.md

The confusion matrix that lived here described a model that no longer ships, and its error
direction was the OPPOSITE of the current one. `docs/ml-results.md` is the single citable
source; anything quoted from memory of this block will be wrong.

Shipped model, 53-run sweep, 2026-09-04: **msc macro-F1 0.825** (precision 0.820, recall
0.698 on *Aedes*, 523 held-out recordings) · **med 0.964** · tri 0.640.

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

### Run: phone-mic validation (2026-09-18) — the assumption the product rests on

Every number so far is on HumBugDB Tascam field recordings. The product runs on phones. That
gap is the largest unverified assumption in the project, and Abuzz is the only way to close it.

- [x] A1 `ml/phone_eval.py` — two sources, one evaluator, runs the SHIPPED .tflite
- [x] A1b **Dryad is behind Anubis**, a proof-of-work anti-scraping wall. The download is NOT
      scriptable and will not be bypassed — the operator put it there deliberately. My two
      earlier claims ("manual only", then "fully scriptable") were both wrong; the metadata
      API is open, the file endpoints are not.
- [x] A1c **Pivot: HumBugDB already contains the test set.** 113 *Aedes* recordings on an
      Alcatel 4009X, 2,361 not_aedes, 695 background — every one excluded from training by the
      RIG filter, so zero leakage. Comparable in size to the 89 recordings we trained on, and a
      genuine domain shift: different mic, country, colony, 8 kHz vs 44.1 kHz. Free, no download
      beyond the 4 GB we already fetch. Weakness: clips are 0.05-2 s, tiled to the contract's
      5 s, so it tests the microphone shift cleanly and duration realism less so.
- [x] A3 **RUN 2026-09-19. MED transfers, MSC does not.** MED 0.879 on 3,169 phone recordings
      (vs 0.964 in domain). MSC 0.484 — **0 of 113 Aedes found**, it answered not_aedes to
      everything. Not a degradation, a collapse. Full write-up and the permitted/forbidden claims
      are in `docs/ml-results.md`; the deck must not say species ID works on a phone.
- [x] A3c **AUC 0.182 — INVERTED, not absent.** Aedes scores systematically LOWER than
      not_aedes; flipped it would be 0.82. No threshold helps (best 0.489 vs 0.488 default).
      **Confound found afterwards:** Aedes phone clips average 0.42 s against 3.2 s for
      not_aedes, and `load_clip` tiles short clips up to 5 s, so Aedes windows are repeated ~12x
      and not_aedes ~1.6x. Duration is correlated with class. The failure is real; the CAUSE is
      unresolved between microphone shift and our own tiling artifact.

**PHASE PLAN — status after 2026-09-21**

| Phase | What | Status |
|---|---|---|
| 1 | Test the shipped models on phone audio | **DONE.** MED transfers (0.879). MSC does not (0.484, 0 of 113, AUC 0.182 inverted). |
| 1b | Diagnose the MSC failure | **DONE, inconclusive by design.** Test-set confound blocks attribution. |
| 2 | Train on phone-domain data | **NOT STARTED.** Needs Abuzz's longer clips; this subset is too short to use. |
| 3 | Pretrained audio embeddings (YAMNet/BEATs) | **NOT STARTED, and not next.** The evidence points at data and preprocessing, not architecture. |

Nothing in phases 2-3 is needed for the deck or the video. The deck needs only what phase 1
established, and `docs/ml-results.md` carries the permitted and forbidden claims.
- [ ] A3b optional, stronger: Abuzz via manual browser download, then `--source abuzz --dir`
- [ ] A4 only after A3 is recorded: split Abuzz BY RECORDING, fold part into training, keep the
      rest held out. Costs no model size — unlike the YAMNet route.
- [ ] A5 (fallback, only if A4 falls short) pretrained audio embeddings, YAMNet or BEATs.
      Storage 1.45 MB -> ~4-15 MB, compute same order. Unmeasured; an EAS build is the only proof.

Known defect in Abuzz, from HumBugDB's own paper: "no labels to timestamp mosquito events in
files where mosquito sound was only sporadic". A file labelled *Aedes aegypti* may be mostly
silence, so window-level labels are noisy. `eval` therefore gates on MED first and judges MSC
only where a mosquito is audible — the app's own two-stage flow — and prints the ungated number
alongside so the gating cannot hide anything.

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
an error). ~~Abuzz as a scored eval set~~ **reversed 2026-09-18 — see the phone-mic
validation run above.** It was parked because the download looked manual and time was short;
the Dryad API makes it scriptable, and the phone-mic gap is worth more than the reason to skip.
No sex head — HumBugDB has 22.2 min of female *Aedes* and 0.1 min of male.

## Later (not this run)
- [ ] Real audio + fast-tflite + persistence — next EAS build batch (one build, all native deps)
- [ ] BM copy human verification (Malay speaker; slice 18 flags it unverified)
- [ ] Verify RM 31M / RM 8M against a primary MOH or Hansard source before it goes on camera
