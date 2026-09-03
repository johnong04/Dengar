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

## Cell 2 — the overnight sweep (~60-90 min, unattended)

Trains every task over N seeds, picks each winner **on validation**, exports, and copies
everything to Drive. Checkpoints after every single run, so a recycled runtime costs one
run rather than the night — re-running the same cell resumes where it stopped.

```python
from google.colab import drive; drive.mount('/content/drive')
!git clone -b john-v1-citizen https://github.com/johnong04/Dengar.git /content/Dengar
%cd /content/Dengar/ml
!pip install -q -r requirements.txt tensorflowjs
!python dengar.py data
!mkdir -p /content/drive/MyDrive/dengar/sweep
!python dengar.py sweep --task msc,med,tri --seeds 5 --epochs 60 \
    --out /content/drive/MyDrive/dengar/sweep 2>&1 | tee /content/sweep_log.txt
!python dengar.py export 2>&1 | tee -a /content/sweep_log.txt
!cp -r out/*.tflite out/band_snr.json out/tfjs_* /content/drive/MyDrive/dengar/
!cd out && zip -qr /content/dengar_models.zip *.tflite band_snr.json tfjs_* && du -h /content/dengar_models.zip
!cat /content/drive/MyDrive/dengar/sweep/sweep.json
```

**Leave the browser tab open.** A closed tab means a killed runtime.

If it dies partway, re-run the identical cell: `data` skips what it already downloaded and
`sweep` skips every run already in `sweep.json`.

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
