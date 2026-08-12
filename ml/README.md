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

## Cell 2 — everything else, unattended (~60-90 min)

Trains all three tasks under both architectures, exports the winner of each, zips it.
Nobody needs to be watching: `export` reads `out/scores.json` and picks the best
architecture per task by macro-F1 on its own.

```python
%cd /content/Dengar/ml
!git pull
!pip install -q tensorflowjs
!for t in msc med tri; do for a in cnn mobilenet; do echo "===== $t / $a"; \
   python dengar.py train --task $t --arch $a --epochs 30; done; done 2>&1 \
   | tee /content/train_log.txt
!python dengar.py export 2>&1 | tee -a /content/train_log.txt
!cat out/scores.json
!cd out && zip -qr /content/dengar_models.zip . && du -h /content/dengar_models.zip
```

**Leave the browser tab open.** Colab free disconnects a runtime whose tab is gone,
and an hour of training goes with it. Everything is logged to `/content/train_log.txt`
so scrollback loss is survivable; a disconnect is not.

Download `/content/dengar_models.zip` from the Colab file panel, unzip into
`app/assets/models/`.

**macro-F1, not accuracy**, decides the winner. With 783 *Aedes* windows against 2000
not_aedes, accuracy rewards a model that always says not_aedes; macro-F1 does not.

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
