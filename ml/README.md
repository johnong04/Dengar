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

## Cell 2 — the product model (~10-15 min)

```python
%cd /content/Dengar/ml
!git pull
!python dengar.py train --task msc --epochs 30
```

Paste the confusion matrix and classification report.

## Cell 3 — the abstain gate, and the bonus 3-class

```python
!python dengar.py train --task med --epochs 20
!python dengar.py train --task tri --epochs 30
```

## Cell 4 — export

```python
!pip install -q tensorflowjs
!python dengar.py export
!cd out && zip -r /content/dengar_models.zip . && echo done
```

Download `/content/dengar_models.zip` from the Colab file panel, unzip into
`app/assets/models/`.

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
