# `ml/` — run it in Colab

Nothing runs on the laptop. The dataset (4 GB) never touches it.

**Colab → Runtime → Change runtime type → T4 GPU.** Then paste these cells.

## Cell 1 — setup + data (~20 min, mostly Zenodo download)

```python
!git clone https://github.com/johnong04/Dengar.git
%cd Dengar/ml
!pip install -q -r requirements.txt
!python dengar.py data
```

Paste the label inventory and the per-class window counts back.

## Cell 2 — the overnight run (hard-capped at 3.5 h of training)

A config grid, each task's winner picked **on validation**, then the top 5 averaged into an
ensemble, then exported. Everything durable lands in Drive.

`msc` is listed first deliberately: if the night is cut short, the product model is the one
that finished.

```python
from google.colab import drive; drive.mount('/content/drive')
!git clone -b john-v1-citizen https://github.com/johnong04/Dengar.git /content/Dengar
%cd /content/Dengar/ml
!pip install -q -r requirements.txt tensorflowjs
!python dengar.py data
!mkdir -p /content/drive/MyDrive/dengar/sweep
SW=/content/drive/MyDrive/dengar/sweep

!python dengar.py sweep --task msc,med,tri --seeds 3 --widths 0.75,1.0,1.5 \
    --both-aug --epochs 80 --max-hours 3.5 --out $SW 2>&1 | tee $SW/sweep_log.txt

# single-model winners are exported and copied to Drive FIRST, so something is
# always shippable before anything risky is attempted
!python dengar.py export 2>&1 | tee -a $SW/sweep_log.txt
!cp -r out/*.tflite out/band_snr.json /content/drive/MyDrive/dengar/ || true

# then try to beat them; a failure here cannot cost the night
!python dengar.py ensemble --task msc,med,tri --top-k 5 --out $SW 2>&1 | tee -a $SW/sweep_log.txt || true
!python dengar.py export 2>&1 | tee -a $SW/sweep_log.txt || true

!cp -r out/*.tflite out/*.json out/tfjs_* /content/drive/MyDrive/dengar/ || true
!cd out && zip -qr /content/drive/MyDrive/dengar/dengar_models.zip *.tflite *.json tfjs_*
!sync; ls -la /content/drive/MyDrive/dengar/
!cat out/ensemble.json
```

**Leave the browser tab open.** A closed tab means a killed runtime.

Grid: 3 widths x specaug on/off x 3 seeds = 18 runs per task, ~3.5 h of T4 plus the ~30 min
Zenodo download. `--max-hours 3.5` is a **hard wall**: once it passes, no new run starts and
control moves straight to export and ensemble. A sweep still running when the operator's
window closes is worth nothing.

### Everything durable goes to Drive, not to the VM

`/content` is the VM's own disk and is **destroyed** when the runtime is recycled — which
happens roughly 90 minutes after the last cell finishes, and has already happened twice on
this project. `/content/drive/MyDrive/...` is Google Drive and survives.

So the sweep writes every model and `sweep.json` straight to Drive as it goes, the log is
`tee`d to Drive, and the final zip is written to Drive rather than downloaded. Nothing worth
keeping is left on the VM.

### If it dies overnight

Re-run the identical cell. `data` skips what it already downloaded, and `sweep` skips every
run already recorded in `sweep.json` on Drive. You lose one run, not the night.

## Re-running

`data` caches to `ml/cache/*.npy` and skips anything already downloaded, so cells 2–4
are cheap to repeat. After I push a fix, `!git pull` then rerun the one cell.

## What this produces

| File | Contract (specs.md §4) |
|---|---|
| `out/msc.tflite` | 5.0 s audio → 2 floats, `[aedes, not_aedes]` |
| `out/med.tflite` | 5.0 s audio → 2 floats, `[mosquito, none]`; app reads index 0 |
| `out/tri.tflite` | bonus → `[aedes, anopheles, culex]`, feeds `detail.taxon` |
| `out/tfjs_*/` | same graphs for the in-browser demo |
| `out/band_snr.json` | the formula + reference table app/ must reproduce |

## Design notes that are not obvious

- **The mel front-end is inside the model.** Input is raw audio, exactly as the contract
  says. `app/` does no DSP, so there is no second implementation to drift.
- **The STFT is a fixed-weight `Conv1D`, not `tf.signal.stft`.** The latter needs the
  Flex delegate, which `react-native-fast-tflite` does not ship.
- **Species training is restricted to one recording rig** (Tanzania / tascam / 44.1 kHz).
  All the *Aedes* audio comes from there, and so does most Culex/Anopheles. Without this
  the model can score well by recognising the microphone.
- **The train/test split is by recording, not by window.** Overlapping windows from one
  file on both sides of the split is what manufactures a meaningless 99%.
- **No sex head.** HumBugDB has 22.2 min of female *Aedes* and 0.1 min of male. There is
  nothing to train on. specs.md §6 ranked it first; the data says no.
- **The test set is never used to choose anything.** An earlier version passed the test set
  as `validation_data` and let EarlyStopping restore the epoch with the best test accuracy —
  selecting on the data it then reported, which inflates the figure. `split3` now carves
  train/val/test disjointly by recording, with the test split fixed across seeds so runs
  stay comparable, and `sweep` ranks candidates on **validation** only.
- **Cosine LR with warmup.** The flat-LR runs oscillated hard — val accuracy swinging
  0.85 -> 0.32 -> 0.84 between adjacent epochs — so early stopping fired on noise instead of
  on convergence. This is the single biggest expected gain, and it is a bug fix, not a tweak.
- **SpecAugment** (random time/frequency masks) is active in training and an exact identity
  at inference, so the exported graph is unchanged. Verified: two predictions on the same
  input are bit-identical, and the `.tflite` matches Keras.
- **Every seed shares one train/val/test split.** Seeds vary weight initialisation and
  augmentation noise only. That is what makes validation scores comparable across runs — and
  therefore what makes ranking and ensembling mean anything.
- **The ensemble only ships if it wins on validation.** `sweep` already trains many models and
  keeps one; averaging the top 5 is the most reliable free gain available, because runs
  differing only by initialisation make partly independent errors. K is fixed in advance,
  ranking is by validation, and the test score is reported without ever being selected on.
- **A tuned decision threshold is reported, not applied.** The app calls *Aedes* at >= 0.70
  because specs.md picked a round number. `ensemble` reports the threshold that maximises
  macro-F1 **on validation**, so the gap between "chosen" and "measured" is visible. Moving
  the app's threshold is a deliberate act with a RED test attached, not a silent change.
- **The TFJS export is a graph model, not a layers model.** The log-mel step is a `Lambda`
  and tfjs cannot deserialise a `Lambda` in JS. Going via SavedModel avoids the problem.

## Verified before any Colab run

Conversion was smoke-tested locally on TF-CPU: the model builds (380 k params), converts to
a 1.45 MB `.tflite`, loads in the interpreter, takes `[1, 80000]` float32 and returns
`[1, 2]`, and agrees with Keras to 7 decimals. band-SNR separates a 500 Hz tone from white
noise by ~25 dB. So the one irrecoverable risk — "it trains but won't convert" — is closed.

## The honest limitation, for the camera

**89 independent *Aedes* recordings.** Not 22 minutes — 89 recordings, of which roughly 22
are held out. That is the number that bounds how much the accuracy figure means, and it is
the one to say out loud rather than let a judge find.
