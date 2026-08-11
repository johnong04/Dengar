# Dengar — Project Specification

> **Handoff document.** This is the complete brief for two independent Claude Code sessions
> working in parallel in the `dengar/` repo. Read it fully before writing any code.

## 0. Name and positioning line

**Dengar** — Malay/Indonesian for *"listen."* A near-homophone of **denggi** (dengue in Malay).

Chosen deliberately over the earlier working name "SkeeterScan": *skeeter* is American-English
slang that would not read to Tsinghua/HKU/UN/pan-Asian judges, and *Scan* actively contradicted
§2 by implying ambient scanning. **Dengar** names the *act* rather than the gadget, so it cannot
imply scanning; it is pronounceable regardless of first language; and it reads as belonging to
the region rather than parachuted in — which matters to UN and climate-equity panels. It also
travels across the whole expansion market: Malaysia, Indonesia, Brunei, Singapore (~300M speakers).

**Positioning line: *"Dengue is heard before it's felt."***

That is the thesis in five words — the acoustic signal precedes the human case by two to three
weeks, which is exactly the gap §1 describes. Use it as the video's closing card.

Alternative opener for the video's first beat:
***"The mosquito tells you it's coming. Nobody has been listening."***

Avoid constructions that lean on the pun as a joke ("to combat dengue, we must first dengar") —
the pun works best when it is never explained. Let the judges find it.

| | |
|---|---|
| **Deadline** | **2026-08-12** — updated full proposal + 8-minute English demo video (MP4, no PPT) |
| **Competition** | ACTION 2026 — Asian Climate-SDG Technology Innovation HackathOn |
| **Host** | Tsinghua (Dept. Earth System Science) + HKU + UN System + Asian Universities Association |
| **Team** | EdgeRunners — Universiti Malaya (John Ong, wcai, wyjuan) |
| **Track** | **Seed** — evaluation emphasis is **Technical Innovation** |
| **Theme** | 1 — AI-Empowered Solutions for Climate-Sensitive Infectious Diseases |
| **Stage** | Top 50 of ~unknown entrants; mentorship stage; next cut is to 25 |
| **Declared status** | Concept phase, no production prototype. This is legitimate on Seed Track and must not be overstated. |
| **Mentor** | Dr. Noraisyah Mohamed Shah (noraisyah@um.edu.my), UM. CC healthclimate@tsinghua.edu.cn on all mail. |

**What we are actually delivering on 2026-08-12: a video, not a shipped app.** Judge everything
against that. A screen that looks finished on camera is worth more than a screen that is wired
to a real backend but looks unfinished.

---

## 1. The idea, in one paragraph

Mosquito species beat their wings at distinguishable frequencies. A phone microphone can record
that, and a small neural network can identify the species from the sound. Dengar turns
ordinary phones into a distributed *Aedes* surveillance network: when detections cluster in a
neighbourhood, the district health office receives a targeted instruction — *fog here, within 48
hours* — instead of waiting two to three weeks for a human to fall sick and be reported.

**The problem being solved is targeting, not knowledge.** Malaysia already knows how to kill
mosquitoes. 92.2% of national vector-control spending happens at district level and goes
primarily to fogging, but fogging is dispatched off confirmed human cases — a signal that is
structurally 14–21 days behind the vector. Meanwhile MOH requested RM 31M for dengue control in
2021 and received RM 8M. The pitch is not "spend more." It is **"you already spend USD 73.5M/yr
aiming badly."**

---

## 2. The sensing model — READ THIS BEFORE ANYTHING ELSE

**This is the single most misunderstood part of the project and the earlier framing was wrong.**

Acoustic mosquito capture requires **proximity**. Stanford's Abuzz protocol specifies the insect
**within 10 cm of the microphone**, background noise no louder than light traffic, recording
≥1.2 s. MosquitoSong+'s 80–89% accuracy was measured on mosquitoes **inside an 8×12 cm net cage**;
its outdoor variant put the microphone **5 cm above a BG-Counter 2 trap**. The authors state
explicitly that field evaluation is still required.

**No published work demonstrates free-flight, room-scale detection. We do not claim one.**

**You cannot wave a phone around a room and survey the air.** Any copy, UI text, or narration that
implies ambient scanning is factually wrong and a judge with entomology background will catch it.

### Why the idea works anyway

***Aedes aegypti* actively hunts humans.** It is strongly anthropophilic, bites in daylight, and
navigates by exhaled CO₂ and body odour. **We never solve a range problem — the vector delivers
itself inside 10 cm.** Every user carrying a phone is a baited trap that walks around a city.

### Two capture modes — both must exist in the UI

1. **Encounter mode (primary).** User-triggered at the moment of contact: a mosquito buzzing at
   the ear, landed on an arm, or trapped under a glass. This is how Abuzz was actually used, and
   it inherits the proximity condition for free.
2. **Static-node mode (secondary).** A retired phone left face-up beside a passive lure (dark
   water container, BG-style trap) in a hotspot. Reproduces the exact geometry the published
   accuracy was measured under. Turns the drawer of dead phones in every Malaysian household into
   fixed surveillance infrastructure at zero hardware cost.

### Binding language rule

| Never write | Always write |
|---|---|
| "Scan the area" | "Identify the mosquito that found you" |
| "Detects mosquitoes nearby" | "Hold your phone close to the mosquito" |
| "Ambient monitoring" | "Encounter capture" / "Static node" |

This rule applies to UI copy, the proposal, the video narration, and every string in the app.

---

## 3. Repository layout

```
dengar/
├── specs.md          ← this file; both sessions read it, neither edits without telling the other
├── app/              ← SESSION A (UI). React Native + Expo.
└── ml/               ← SESSION B (ML). Python, training, TFLite export.
```

Two Claude Code sessions run in parallel, in different folders, touching different files. The
**only** thing crossing the boundary is a `.tflite` file and the contract in §4.

`hack-ideation/` (the other repo) stays what it is: ideation, ledger, proposal, corpus. No code.

---

## 4. THE CONTRACT — freeze this first

Both sessions build against this. Session A must **not** wait for Session B; it builds against a
stub that satisfies this contract and returns random values.

### Two-stage inference

```
audio (5.0 s) ──► [MED model] ──► mosquito present?
                                    │
                          no ───────┴─────── yes
                           │                  │
                     ABSTAIN screen      [MSC model] ──► species
```

**Stage 1 — MED (Mosquito Event Detection).** "Is there a mosquito in this audio at all?"
Pretrained and released by Oxford's HumBugDB. This is the abstain gate and it is free.

**Stage 2 — MSC (Mosquito Species Classification).** Only runs if MED passes.

### Interface

```
model files:  med.tflite, msc.tflite    (bundled as app assets)
input:        5.0 s mono audio, 16 kHz, float32, values normalized -1.0 … 1.0
              (Expo's PCM stream hook already delivers exactly this format)

MED output:   1 float, P(mosquito present)
MSC output:   2 floats, softmax, fixed order: [aedes, not_aedes]
              This binary IS the product contract — it is what triggers a fogging order.

detail:       OPTIONAL, from extra heads (§6). Every field independently absent.
              { taxon?: {name, confidence}      e.g. 'Aedes aegypti'
                sex?:   {value, confidence}     female|male — only females bite
                gravid?:{value, confidence} }   v3; no head planned yet
              app/ renders what is present, falls back per-field, and NEVER gates on it:
              a weak sex head must not suppress a solid Aedes call.

gating:       if MED  < 0.50           → "No mosquito detected"
              if MSC max < 0.70        → "Not confident — move closer and try again"
              if band-SNR below floor  → "Too noisy here"
              otherwise                → show species + confidence
```

### The three outcomes are all first-class UI states

**Abstain is the most common outcome, not an error.** Most 5-second recordings contain no
mosquito; outdoor noise drops accuracy to 67.3%. Realistically **the majority of taps end in
abstain.** Design the "didn't catch it" screen as carefully as the success screen — in the real
app it is the main screen.

The model returns numbers, never words. All labelling, thresholding, and copy live in the app.

### band-SNR — split ownership, one formula (added 2026-08-12)

The one item §4 left undefined. band-SNR is not a model output: it is arithmetic on the raw audio
measuring how loud the wingbeat band is relative to everything else. It exists because **the model
always answers** — it was trained to pick between classes, never to refuse — so refusal needs a
separate, non-ML measurement. It is checked **before** MED and MSC: a confident score on an unusable
recording is the dangerous case.

| | Owner | Why |
|---|---|---|
| The formula (frequency band, window, dB definition) | **`ml/`** | must match what the model was trained under, or the floor doesn't transfer |
| The floor value | **`ml/`** | only `ml/` has clips to calibrate against; app ships `6` as a marked placeholder |
| Computing it at runtime | **`app/`** | app already holds the Float32Array; no model needed |

**The anti-drift device:** `ml/` writes the formula here as one paragraph AND hands over a table of
~10 clips with their expected dB values. `app/`'s TypeScript implementation must reproduce that
table — that is the RED test, written before the implementation. Two independently-written "SNR"
functions will disagree slightly, the floor calibrated on one will not transfer to the other, and
the gate will silently pass garbage. One written formula, one reference table, no drift.

`ml/` fills this in: **band = ____ Hz … ____ Hz · window = ____ · floor = ____ dB**

---

## 5. Session A — `app/` (UI)

### Stack (decided, do not relitigate)

| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native + Expo** | EAS Build produces an installable APK **in the cloud** — no Android Studio, which the operator does not have and will not install. Flutter cannot do this. |
| Styling | **NativeWind** | Tailwind classes in RN; ahead-of-time compiled; syntax the operator already knows |
| Components | **Gluestack UI** | Copy-paste-into-repo model (shadcn-style) — you own the source. A [community MCP server](https://glama.ai/mcp/servers/gauravsaini/gluestack-ui-mcp-server) exists; use it to read real component source rather than guessing props. |
| ML runtime | **`react-native-fast-tflite`** v2.x | JSI zero-copy, GPU delegates, official Expo config plugin, 30+ inferences/sec |
| Audio | **Expo PCM stream hook** (fallback: `@siteed/expo-audio-studio`) | Delivers float32 normalized −1.0…1.0 at 16 kHz — exactly the contract |
| Map | any RN map lib | v2 only |

### Two gotchas that will cost hours if unknown

1. **`react-native-fast-tflite` is a native module — Expo Go cannot run it.** Expo Go runs
   JavaScript only. You need a development build: `eas build --profile development --platform
   android`. **Do this build on day one, not the night before.** Cloud builds queue.
2. **`metro.config.js` must be told `.tflite` is an asset extension**, or the model silently
   fails to bundle. One line. Costs an hour to diagnose.

### Scope — build the full v1→v3 frontend

The operator wants the UI as visually complete as possible, **frontend-only is acceptable**.
Screens beyond v1 may be driven entirely by seeded/simulated data. **Label simulated data as
simulated in the video narration** — declared simulation is fine, concealed simulation is fatal.

**v1 — real, must actually work**
- Onboarding + microphone permission
- Encounter capture: one big button, 5 s countdown, live level meter
- Result: species, confidence, timestamp, coarse location
- **Abstain states (three distinct):** no mosquito / not confident / too noisy
- Detection history (local)
- Offline indicator + sync-pending queue

**v2 — simulated data is fine**
- Static-node mode: setup flow, "leave this phone here" state, battery/duration
- Risk map: detection heatmap over a KL district
- Cluster detail: detections over time, rainfall overlay, risk score
- Officer view: alert feed, "fog within 48 hrs" directive card, dispatch acknowledgement
- Community view: neighbourhood risk level, prevention tips
- Bahasa Malaysia / English toggle

**v3 — aspirational, frontend only, clearly framed as roadmap**
- Privacy/federated-learning status: "your audio never left this device", local-training
  indicator, encrypted-update log
- Prediction timeline: 7–14 day outbreak-risk forecast from detection density + rainfall
- Fine-grained detection: species + sex + gravid state, with "why this matters" explainer
  (only females bite; only blood-fed females transmit)
- Surgical dispatch: block-level fogging targets, cost-per-case-averted readout
- Impact dashboard: detections contributed, area covered, estimated cases averted

### Design direction

Two audiences in one app: **citizens** (warm, simple, reassuring, low literacy tolerance) and
**health officers** (dense, operational, decision-first). Keep them visually distinct — an
officer screen that looks like a consumer screen reads as unserious to judges.

This is a **climate-health instrument**, not a fitness tracker. Avoid gamification. Avoid
mosquito cartoon mascots. The subject is a disease that killed 117 Malaysians in 2024.

---

## 6. Session B — `ml/` (model)

### Sources, and exactly what each is for

| Source | What we get | Role |
|---|---|---|
| **[HumBugDB](https://github.com/HumBug-Mosquito/HumBugDB)** (Oxford) | Dataset (20 hr, 36 species) + **baseline training code** + **released pretrained model binaries**. Colab-native. Zenodo hosted. | **The starting point.** Ships both tasks we need: MED (mosquito vs background) and MSC (species). We are NOT training from scratch. |
| **[MosquitoSong+](https://pmc.ncbi.nlm.nih.gov/articles/PMC11524479/)** (Mahidol, PLOS ONE 2024) | **Paper only — no public code or weights.** | **The recipe.** Take its architecture tweaks and its two augmentations: *noise augmentation* and *wingbeat volume variation*. This is the noise-robustness knowledge. |
| **[Stanford Abuzz](https://elifesciences.org/articles/27854)** (eLife 2017) | ~1,000 hrs, 20 species, **recorded on phone microphones** | **Test set only. Never training.** Proves the model survives real phone-mic audio rather than lab mics. |
| **[arXiv:2306.10091](https://arxiv.org/pdf/2306.10091)** | 927K-param residual CNN, 320 ms on Snapdragon 430 / 2 GB | **Citation only — do not implement.** Evidence for the video that the model fits a cheap phone. |

### Decisions

**Ship binary `[aedes, not_aedes]`, not 4-class.** *Ae. aegypti* vs *Ae. albopictus* is the hardest
pair (congeners, similar body size, similar wingbeat) and the distinction **changes no decision** —
both transmit dengue, both trigger the same fogging response. Spending accuracy budget there is
vanity. If a 4-class head falls out for free, report it in the proposal; the product ships the
binary.

**Which extra heads are worth training (added 2026-08-12).** The binary is the *product contract*,
not a cap on the model. Accuracy is a fixed budget and every extra class spends it, so spend only
where the answer **changes a decision**. Ranked:

1. **Sex (female / male) — train this.** Only females bite, so male detections are noise in the
   density signal, and density is the entire health-impact claim. MosquitoSong+ measured **93.3% on
   species+sex**, *higher* than species alone, so this head is close to free.
2. ***Anopheles* vs *Culex*, i.e. 3-class `aedes / anopheles / other` — train if cheap.** *Culex* is
   a nuisance (no action); *Anopheles* is **malaria**, and Malaysia has *knowlesi* malaria in Sabah
   and Sarawak. Different disease, different response, and a second-disease story for the proposal.
   `not_aedes` as one bucket is a lump, not a finding.
3. **aegypti vs albopictus — do not spend on this.** Hardest pair, changes no decision.

Report every head measured, in the proposal and on camera. **The §4 contract carries an optional
`detail` object for these from day one** (reversing an earlier call to defer it): every field
independently optional, `app/` renders what is present and falls back per-field, nothing in `detail`
may gate the fogging decision. Deferring it would have meant editing screens under deadline the week
a head lands. Whatever the shipped model cannot actually do is labelled simulated in the narration —
§13 rule 3 is the constraint, not the field's existence.

**Do not train from scratch.** Start from HumBugDB's baseline, retrain the species head on our
classes, apply MosquitoSong+'s two augmentations.

**Known hard part: TFLite conversion.** HumBugDB's released models are **Bayesian neural
networks**, and Bayesian layers do not convert to mobile cleanly. If conversion fights back,
sidestep it by training a **plain (non-Bayesian) CNN** through their data pipeline. Budget real
hours here — this is the project's main technical risk, not accuracy.

### Hardware and workflow

Operator's machine: **i5-12450H, 12 threads, 15.7 GB RAM, Intel integrated graphics — no NVIDIA
GPU, no CUDA.**

- **Preprocessing: local.** CPU work, 12 threads handles it. Cache to `.npy` so it never reruns.
- **Training: Colab free T4.** ~10–20 min vs 2–6 hrs on CPU.
- **No more clipboard pasting.** The loop is:

```python
!git clone https://github.com/<user>/dengar.git   # first time only
%cd dengar/ml
!git pull                                              # picks up agent edits
!pip install -q -r requirements.txt
!python preprocess.py --cache                          # instant if cached
!python train.py --epochs 30                           # the only slow cell
```

Code lives in git, not the clipboard. Operator pastes back only final metrics.

### Definition of done for `ml/`

1. `med.tflite` and `msc.tflite` exist and load in `react-native-fast-tflite`.
2. Inference verified on a phone-recorded clip from Abuzz, not just a HumBugDB test split.
3. A confusion matrix and an accuracy number honest enough to say out loud on camera.
4. Three demo audio clips selected for the video: one clean Aedes, one non-Aedes, one noisy
   clip that correctly abstains. **The abstain demo is not optional** — it is the credibility beat.

---

## 7. Video — the deliverable everything serves

8 minutes, English, MP4, no PPT.

1. **00:00 The two-week gap.** Case-triggered fogging arrives 14–21 days after the vector.
2. **00:45 Hear it.** Play a raw *Aedes* wingbeat. The signal is real and audible.
3. **01:30 The phone does it.** Hold phone ~10 cm from a speaker playing wingbeat audio. 5 s.
   Species appears. **AIRPLANE MODE ON, visible on screen.** State the proximity requirement
   out loud, then immediately give the reason it does not matter: *Aedes* comes to the human.
4. **03:00 The map fills.** Simulated fleet across a KL district; detections cluster over 3 days.
5. **04:30 The decision.** WhatsApp arrives on the officer phone: *Aedes cluster, Taman X, 14
   detections/72 hrs, rain +40mm — fog within 48 hours.* An instruction, not a chart.
6. **05:30 The numbers.** Cost per km² vs ovitraps. The RM 31M → RM 8M gap this closes.
7. **07:00 Honesty and roadmap.** State both hard limits before a judge raises them: **10 cm
   range** (mitigated by vector behaviour + static nodes) and **67.3% accuracy in outdoor noise**
   (mitigated by SNR gating). Then v3.

**The uncuttable shot is step 3 in airplane mode.** It answers privacy, offline capability, and
on-device feasibility in one gesture a judge cannot dismiss as a mockup.

---

## 8. What must be real vs what may be simulated

| Real | Simulated (and declared) |
|---|---|
| On-device classification, offline | The fleet of users |
| Abstain behaviour | Detection density on the map |
| The APK installed on a physical phone | The rainfall forecast integration |
| Model accuracy numbers | The WhatsApp dispatch (hardcoded send is fine) |
| | Everything v3 |

Judges punish **concealed** fakery, not declared simulation. Say "simulated fleet" out loud.

---

## 9. Evidence — cite these, do not invent new numbers

**Burden**
- Malaysia 2024: **122,423 dengue cases, 117 deaths, +17% YoY** (WHO)
- Cost per case Malaysia: **USD 365.16**, of which **89.8% is indirect** (lost wages); **12.5
  workdays / 6.3 school days** lost — Seremban household study
- Malaysia annual: **USD 102.2M illness**, **USD 175.7M** including prevention — Brandeis/MOH
- Southeast Asia: **2.9M episodes, 5,906 deaths, USD 950M/yr**
- Thailand 2019 outbreak: **USD 1.81B GDP impact** via tourism

**Vector-control economics**
- National programme **USD 73.5M/yr**, **USD 1,591/case**, **USD 2.68/capita**, 0.03% GDP
- **92.2% of spend at district level, primarily fogging**
- Fogging = **51.0% of DHD costs, 45.8% of LA costs**; DHD **USD 679/case**, LA **USD 499/case**
- **RM 31M requested vs RM 8,006,700 allocated (2021) — 74% shortfall** ⚠️ *single-sourced; verify
  against MOH or Hansard before it goes in the video*
- Citizen science **EUR 1.23/km²/month** vs ovitraps **EUR 9.36** (8×) — Mosquito Alert
- Mosquito Alert: 38K users, first detection in **39% of newly-infested municipalities**
- Malaysia has **155 local authorities** (19 city, 40 municipal, 91 district, 4 statutory)

**Technical**
- MosquitoSong+: **80–89%** four-species; **93.3%** species+sex controlled; **67.3%** outdoor noise
- On-device: **927K params, 320 ms, Snapdragon 430 / 2 GB**
- HumBugDB: 20 hr, 36 species, open

**Rule: never invent a figure.** If the ledger lacks it, say so. Every number in the proposal is
tagged `[cited]` or `[modeled]` with its arithmetic shown — maintain that discipline.

---

## 10. Competitive position

We are **not** competing with dengue forecasting. **D-MOSS** (UNDP + WHO + UK Met Office, Vietnam)
is a well-funded incumbent and a student team should not attack it head-on. Every forecasting
model is limited by the same lagging case-notification input. **We compete on data *capture*, not
data *modelling*** — a faster, cheaper input layer that makes every downstream model better.

- **Mosquito Alert** — proven, 8× cheaper than ovitraps, but bottlenecks on a human entomologist
  validating every photo. We automate exactly that step, in a region they do not serve.
- **HumBug/MozzWear** (Oxford) — same primitive, but Africa/malaria, server-side, no SEA deployment.
- **GLOBE Observer** (NASA) — manual dichotomous-key ID, no automated classification.
- **IoT smart traps** — per-unit hardware cost and installation crews. Our node is a phone that
  already exists.

**Moat:** the Malaysian acoustic corpus (does not exist; every user generates it), the
on-device/federated architecture, district workflow integration, and a published validation
against ovitrap ground truth.

---

## 11. Honest status — what is proven vs what we are contributing

**Proven — we are applying, not discovering**
- Wingbeat frequency is species-specific (established entomology)
- Consumer phone mics can capture it (Abuzz, eLife 2017)
- CNNs classify it at 80–89% (MosquitoSong+, PLOS ONE 2024)
- The model runs on a cheap phone in 320 ms (arXiv:2306.10091)
- Labelled training audio exists openly (HumBugDB)
- Citizen-science vector surveillance works and is 8× cheaper (Mosquito Alert)

**Unproven — this is our actual research contribution**
1. **Free-flight detection at usable range in a real Malaysian home.** Every published accuracy
   figure comes from a caged mosquito centimetres from a mic. The accuracy-versus-distance curve
   for free-flying *Aedes* on commodity phone microphones **has never been measured** — measuring
   it is a genuine publishable contribution and the first thing our pilot does.
2. Whether enough users open the app often enough to produce usable density data.
3. Whether detection clusters predict human cases with enough lead time to beat case-triggered
   fogging. **This is the entire health-impact claim and it is currently a hypothesis.**
4. A Malaysian *Aedes* acoustic corpus — does not exist. That is why it is the moat.

**Items 1–3 being open is not a weakness for Seed Track. Seed Track is for exactly this. The
weakness would be pretending they are closed.**

---

## 12. Open questions

- [x] ~~Product name.~~ **Decided 2026-08-12: Dengar** (see §0).
- [ ] Verify **RM 31M / RM 8M** against a primary MOH or Hansard source before it goes on camera.
- [ ] Committee has not yet announced the submission channel or field limits for the 2026-08-12
      deliverable.
- [ ] EAS Build free-tier queue time is unverified. **Run the first build early.**

---

## 13. Hard rules

1. **Never claim ambient scanning.** §2's language table is binding on every string, caption and
   line of narration.
2. **Never invent a figure.** Tag `[cited]` or `[modeled]`; show the arithmetic for modeled ones.
3. **Never present simulated data as real.** Declare it in narration.
4. **Abstain is a first-class state, not an error.** It is the most common outcome.
5. **Airplane mode during the classification shot.** Non-negotiable.
6. **State both hard limits (10 cm, 67.3%) before a judge raises them.**
7. `log.md` in `hack-ideation/ideas/action-2026/` is append-only. Anything real that happens gets
   a dated line. Never rewrite history — corrections get a new line.
