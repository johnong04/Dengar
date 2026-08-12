"""Dengar ml/ — one script: data -> train -> export.

Runs on Colab (T4). Nothing here runs locally; see README.md for the cell.

Contract (specs.md §4) is the reason the mel front-end lives INSIDE the model:
the exported file takes 5.0 s of mono 16 kHz float32 audio in -1..1 and returns
probabilities. app/ does no DSP.

  python dengar.py data                 # download + cache windows, print counts
  python dengar.py train --task msc     # [aedes, not_aedes]   <- the product
  python dengar.py train --task med     # [mosquito, none]     <- the abstain gate
  python dengar.py train --task tri     # [aedes, anopheles, culex]  (bonus)
  python dengar.py export               # .tflite + tfjs + band-SNR reference table
"""
import argparse, collections, csv, io, json, os, random, sys, urllib.request, zipfile
import numpy as np

# --- audio / feature constants. Changing these changes the contract. -----------
SR, CLIP = 16000, 5.0
NSAMP = int(SR * CLIP)          # 80000
NFFT, HOP, NMEL = 512, 256, 64
FMIN, FMAX = 50.0, 4000.0
NFRAME = 1 + (NSAMP - NFFT) // HOP

# band-SNR (specs.md §4). Aedes fundamental ~450-700 Hz plus first harmonic.
SNR_BAND = (200.0, 1500.0)
SNR_FLOOR_DB = None             # calibrated in `export`

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA, CACHE = os.path.join(ROOT, "data"), os.path.join(ROOT, "cache")
ZEN = "https://zenodo.org/api/records/4904800/files/{}/content"
ZIPS = [f"humbugdb_neurips_2021_{i}.zip" for i in (1, 2, 3, 4)]
META = "neurips_2021_zenodo_0_0_1.csv"

# The rig the Aedes recordings come from. Restricting species training to one rig
# is what stops the model classifying the microphone instead of the mosquito.
RIG = lambda r: r["country"] == "Tanzania" and r["device_type"] == "tascam"

# Per class. 2000 x 80000 float32 = 640 MB, so a 3-class cache still fits Colab's
# 12.7 GB alongside an augmented copy.
MAX_WIN = 2000


# ---------------------------------------------------------------- data --------
def fetch(name, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print(f"  have {name}")
        return
    print(f"  get  {name} ...", flush=True)
    urllib.request.urlretrieve(ZEN.format(name), dest)


def download():
    os.makedirs(DATA, exist_ok=True)
    fetch(META, os.path.join(DATA, META))
    audio = os.path.join(DATA, "audio")
    os.makedirs(audio, exist_ok=True)
    for z in ZIPS:
        p = os.path.join(DATA, z)
        fetch(z, p)
        marker = p + ".done"
        if not os.path.exists(marker):
            print(f"  unzip {z}", flush=True)
            with zipfile.ZipFile(p) as f:
                f.extractall(audio)
            open(marker, "w").close()
            os.remove(p)          # 4 GB of zips is not worth the Colab disk
    return audio


def rows():
    with open(os.path.join(DATA, META), encoding="utf-8") as f:
        return list(csv.DictReader(f))


def find_wav(audio_dir):
    """id -> path. The archive nests, so index once."""
    idx = {}
    for dirpath, _, names in os.walk(audio_dir):
        for n in names:
            if n.endswith(".wav"):
                idx[os.path.splitext(n)[0]] = os.path.join(dirpath, n)
    return idx


def load_clip(path):
    """-> mono float32 at SR, tiled to at least NSAMP."""
    import soundfile as sf
    from scipy.signal import resample_poly
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:
        from math import gcd
        g = gcd(int(sr), SR)
        x = resample_poly(x, SR // g, int(sr) // g).astype(np.float32)
    if len(x) < NSAMP:                      # short clips are the norm here
        x = np.tile(x, int(np.ceil(NSAMP / max(len(x), 1))))[:NSAMP]
    m = np.abs(x).max()
    return (x / m).astype(np.float32) if m > 0 else x


def windows(x, hop_s=1.0):
    step = int(SR * hop_s)
    return [x[i:i + NSAMP] for i in range(0, len(x) - NSAMP + 1, step)] or [x[:NSAMP]]


TASKS = {
    # task -> (class names, row -> class index or None)
    "msc": (["aedes", "not_aedes"], lambda r: (
        0 if r["sound_type"] == "mosquito" and r["species"].startswith("ae ") and RIG(r)
        else 1 if r["sound_type"] == "mosquito" and r["species"] and RIG(r)
        else None)),
    "med": (["mosquito", "none"], lambda r: (
        0 if r["sound_type"] == "mosquito"
        else 1 if r["sound_type"] != "mosquito"
        else None)),
    "tri": (["aedes", "anopheles", "culex"], lambda r: (
        None if not (r["sound_type"] == "mosquito" and RIG(r)) else
        0 if r["species"].startswith("ae ") else
        1 if r["species"].startswith("an ") else
        2 if r["species"].startswith("culex") else None)),
}


def build_cache(task):
    from tqdm import tqdm
    names, label_of = TASKS[task]
    idx = find_wav(os.path.join(DATA, "audio"))
    buckets = collections.defaultdict(list)
    for r in rows():
        c = label_of(r)
        if c is not None and r["id"] in idx:
            buckets[c].append(r["id"])
    for c in buckets:
        random.Random(0).shuffle(buckets[c])

    X, y, grp = [], [], []
    for c, ids in sorted(buckets.items()):
        # Spread the budget across recordings rather than draining a few of them.
        # Aedes has 89 files and gets every window it can give; not_aedes has 2460
        # and gives one each, which is the more diverse 2000 windows by far.
        per_file = max(1, MAX_WIN // max(len(ids), 1))
        n, used = 0, 0
        for fid in tqdm(ids, desc=f"{task}:{names[c]}"):
            if n >= MAX_WIN:
                break
            try:
                w = windows(load_clip(idx[fid]))[:per_file]
            except Exception as e:
                print(f"  skip {fid}: {e}")
                continue
            used += 1
            for win in w:
                if n >= MAX_WIN:
                    break
                X.append(win); y.append(c); grp.append(int(fid)); n += 1
        print(f"  {names[c]}: {n} windows from {used}/{len(ids)} files "
              f"(<= {per_file} per file)")

    os.makedirs(CACHE, exist_ok=True)
    np.save(f"{CACHE}/{task}_X.npy", np.stack(X))
    np.save(f"{CACHE}/{task}_y.npy", np.array(y, np.int32))
    np.save(f"{CACHE}/{task}_g.npy", np.array(grp, np.int32))
    print(f"  cached {task}: {len(X)} windows")


def cmd_data(a):
    download()
    print("\n--- label inventory (minutes of audio) ---")
    per = collections.defaultdict(float)
    for r in rows():
        k = (r["sound_type"], r["species"] or "-", RIG(r))
        per[k] += float(r["length"])
    for k, v in sorted(per.items(), key=lambda x: -x[1])[:20]:
        print(f"  {v/60:8.1f} min  {k}")
    for t in (a.task.split(",") if a.task else ["msc", "med", "tri"]):
        if not os.path.exists(f"{CACHE}/{t}_X.npy"):
            build_cache(t)


# --------------------------------------------------------------- model --------
def mel_matrix():
    """(NFFT//2+1, NMEL) — hand-rolled so librosa is not a dependency."""
    hz2mel = lambda f: 2595.0 * np.log10(1.0 + f / 700.0)
    mel2hz = lambda m: 700.0 * (10.0 ** (m / 2595.0) - 1.0)
    pts = mel2hz(np.linspace(hz2mel(FMIN), hz2mel(FMAX), NMEL + 2))
    bins = np.floor((NFFT + 1) * pts / SR).astype(int)
    M = np.zeros((NFFT // 2 + 1, NMEL), np.float32)
    for m in range(NMEL):
        l, c, r = bins[m], bins[m + 1], bins[m + 2]
        for k in range(l, c):
            if c > l: M[k, m] = (k - l) / (c - l)
        for k in range(c, r):
            if r > c: M[k, m] = (r - k) / (r - c)
    return M


def dft_kernels():
    """Two Conv1D kernels doing a windowed real DFT (cosine and sine halves).

    Deliberately not tf.signal.stft: that lowers to ops the TFLite converter only
    keeps via the Flex delegate, which react-native-fast-tflite does not ship.
    Conv1D is plain, converts everywhere, and runs in tfjs unchanged.

    Two layers rather than one wide one so the real and imaginary halves never
    have to be sliced apart — Keras 3 will not slice a symbolic tensor without a
    Lambda, and Lambdas are the thing that breaks serialisation downstream.
    """
    n = np.arange(NFFT)
    win = 0.5 - 0.5 * np.cos(2 * np.pi * n / NFFT)          # hann
    k = np.arange(NFFT // 2 + 1)[:, None]
    ang = 2 * np.pi * k * n[None, :] / NFFT
    fix = lambda a: a.T[:, None, :].astype(np.float32)      # (NFFT, 1, F)
    return fix(np.cos(ang) * win), fix(-np.sin(ang) * win)


_LOG = None


def log_layer():
    """log(x + eps) as a registered Layer, not a Lambda.

    A Lambda cannot be reloaded from .keras without safe_mode=False, and then
    still fails to infer its output shape. A registered subclass round-trips
    cleanly, which matters because export() reloads what train() wrote.
    Import is lazy so `data` does not pay for TensorFlow.
    """
    global _LOG
    if _LOG is None:
        import keras
        from keras import ops

        @keras.saving.register_keras_serializable(package="dengar")
        class LogEps(keras.layers.Layer):
            def call(self, x):
                return ops.log(x + 1e-6)

            def compute_output_shape(self, s):
                return s

        _LOG = LogEps
    return _LOG


def build(n_classes, arch="cnn"):
    """arch='cnn'       — 380k params from scratch.
       arch='mobilenet' — ImageNet-pretrained MobileNetV2 on the spectrogram.

    The second exists because the binding constraint is 89 independent Aedes
    recordings, and pretraining is the standard answer to data that small. Both
    share the identical front-end, so the exported contract does not change.
    """
    import tensorflow as tf
    from keras import layers as L, ops

    F = NFFT // 2 + 1
    conv = dict(kernel_size=NFFT, strides=HOP, padding="valid",
                use_bias=False, trainable=False)
    inp = L.Input(shape=(NSAMP,), name="audio", dtype="float32")
    x = L.Reshape((NSAMP, 1))(inp)
    re = L.Conv1D(F, name="dft_re", **conv)(x)                         # (T, F)
    im = L.Conv1D(F, name="dft_im", **conv)(x)
    x = L.Add()([L.Multiply()([re, re]), L.Multiply()([im, im])])      # power
    x = L.Dense(NMEL, use_bias=False, trainable=False, name="mel")(x)  # (T, NMEL)
    x = log_layer()(name="logmel")(x)
    x = L.LayerNormalization(axis=[1, 2], name="cmvn")(x)              # gain-invariant
    x = L.Reshape((NFRAME, NMEL, 1))(x)

    if arch == "mobilenet":
        x = L.Resizing(96, 96)(x)
        x = L.Concatenate()([x, x, x])                  # ImageNet stem wants 3 ch
        base = tf.keras.applications.MobileNetV2(
            input_shape=(96, 96, 3), include_top=False, weights="imagenet")
        x = base(x)
    else:
        for f in (16, 32, 64, 64):
            x = L.Conv2D(f, 3, padding="same", use_bias=False)(x)
            x = L.BatchNormalization()(x)
            x = L.ReLU()(x)
            x = L.MaxPool2D(2)(x)
    x = L.GlobalAveragePooling2D()(x)
    x = L.Dropout(0.3)(x)
    out = L.Dense(n_classes, activation="softmax", name="probs")(x)

    m = tf.keras.Model(inp, out)
    kre, kim = dft_kernels()
    m.get_layer("dft_re").set_weights([kre])
    m.get_layer("dft_im").set_weights([kim])
    m.get_layer("mel").set_weights([mel_matrix()])
    return m


# --------------------------------------------------------------- train --------
def augment(X, y, noise, rng):
    """MosquitoSong+'s two: wingbeat volume variation, and noise mixing."""
    X = X * rng.uniform(0.25, 1.0, (len(X), 1)).astype(np.float32)
    if noise is not None and len(noise):
        pick = rng.integers(0, len(noise), len(X))
        snr = rng.uniform(0.0, 0.6, (len(X), 1)).astype(np.float32)
        X = X + snr * noise[pick]
    return np.clip(X, -1.0, 1.0), y


def cmd_train(a):
    import tensorflow as tf
    from sklearn.model_selection import GroupShuffleSplit
    from sklearn.metrics import confusion_matrix, classification_report

    task = a.task
    names = TASKS[task][0]
    X = np.load(f"{CACHE}/{task}_X.npy")
    y = np.load(f"{CACHE}/{task}_y.npy")
    g = np.load(f"{CACHE}/{task}_g.npy")

    # Split by RECORDING, never by window. Overlapping windows from one file on
    # both sides of the split is what produces a 99% number that means nothing.
    tr, te = next(GroupShuffleSplit(n_splits=1, test_size=0.25,
                                    random_state=0).split(X, y, g))
    print(f"train {len(tr)} / test {len(te)} windows, "
          f"{len(set(g[tr]))}/{len(set(g[te]))} recordings, no file shared")

    noise = None
    if os.path.exists(f"{CACHE}/med_X.npy"):
        ny = np.load(f"{CACHE}/med_y.npy")
        nX = np.load(f"{CACHE}/med_X.npy", mmap_mode="r")
        noise = np.array(nX[ny == 1][:400])
    Xtr, ytr = augment(X[tr], y[tr], noise, np.random.default_rng(0))

    cnt = collections.Counter(ytr.tolist())
    cw = {c: len(ytr) / (len(cnt) * n) for c, n in cnt.items()}
    print("class weights", {names[c]: round(w, 2) for c, w in cw.items()})

    m = build(len(names), a.arch)
    m.compile(optimizer=tf.keras.optimizers.Adam(1e-4 if a.arch == "mobilenet" else 1e-3),
              loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    m.fit(Xtr, ytr, validation_data=(X[te], y[te]), epochs=a.epochs,
          batch_size=32, class_weight=cw, callbacks=[
              tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=6,
                                               restore_best_weights=True)])

    p = m.predict(X[te], batch_size=64).argmax(1)
    rep = classification_report(y[te], p, target_names=names, digits=3, zero_division=0, output_dict=True)
    print(f"\n=== {task} / {a.arch} — paste this back ===")
    print("classes:", names)
    print("confusion matrix (rows=true, cols=pred):")
    print(confusion_matrix(y[te], p))
    print(classification_report(y[te], p, target_names=names, digits=3, zero_division=0))
    print(f"held-out recordings: {len(set(g[te]))}")

    # macro-F1, not accuracy: with 783 aedes against 2000 not_aedes, accuracy
    # rewards a model that just says not_aedes.
    score = rep["macro avg"]["f1-score"]
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    m.save(f"{ROOT}/out/{task}_{a.arch}.keras")
    sf = f"{ROOT}/out/scores.json"
    all_s = json.load(open(sf)) if os.path.exists(sf) else {}
    all_s[f"{task}_{a.arch}"] = {"macro_f1": round(score, 4),
                                 "accuracy": round(rep["accuracy"], 4),
                                 "params": int(m.count_params()),
                                 "test_recordings": len(set(g[te].tolist()))}
    json.dump(all_s, open(sf, "w"), indent=2)
    print(f"saved out/{task}_{a.arch}.keras  macro-F1 {score:.3f}  "
          f"({m.count_params()} params)")


# -------------------------------------------------------------- export --------
def band_snr(x):
    """dB. Same STFT the model uses, so app/ and ml/ cannot drift.

    Median over frames of: power inside SNR_BAND vs power outside it (up to FMAX).
    """
    n = np.arange(NFFT)
    win = 0.5 - 0.5 * np.cos(2 * np.pi * n / NFFT)
    frames = np.stack([x[i:i + NFFT] * win for i in range(0, len(x) - NFFT + 1, HOP)])
    P = np.abs(np.fft.rfft(frames, axis=1)) ** 2
    f = np.fft.rfftfreq(NFFT, 1 / SR)
    inb = (f >= SNR_BAND[0]) & (f <= SNR_BAND[1])
    out = (f > SNR_BAND[1]) & (f <= FMAX) | (f < SNR_BAND[0])
    return float(np.median(10 * np.log10(P[:, inb].mean(1) / (P[:, out].mean(1) + 1e-12) + 1e-12)))


def cmd_export(a):
    import tensorflow as tf
    log_layer()                                  # register before load_model
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    sf = f"{ROOT}/out/scores.json"
    scores = json.load(open(sf)) if os.path.exists(sf) else {}
    made = []
    for task, fname in (("med", "med.tflite"), ("msc", "msc.tflite"), ("tri", "tri.tflite")):
        # Pick the architecture that actually won this task. Nobody has to be
        # awake to compare them.
        cand = {k: v for k, v in scores.items() if k.startswith(task + "_")}
        if not cand:
            continue
        best = max(cand, key=lambda k: cand[k]["macro_f1"])
        src = f"{ROOT}/out/{best}.keras"
        if not os.path.exists(src):
            continue
        print(f"\n{task}: using {best} (macro-F1 {cand[best]['macro_f1']}) "
              f"out of {sorted(cand)}")
        # safe_mode=False because the log-mel step is a Lambda and Keras refuses to
        # deserialise a Python lambda without it. The artifact is one we just wrote.
        m = tf.keras.models.load_model(src, safe_mode=False)
        conv = tf.lite.TFLiteConverter.from_keras_model(m)
        conv.optimizations = []                      # float32; quantising a fixed
        conv.target_spec.supported_ops = [           # DFT kernel wrecks it
            tf.lite.OpsSet.TFLITE_BUILTINS]
        blob = conv.convert()
        open(f"{ROOT}/out/{fname}", "wb").write(blob)

        it = tf.lite.Interpreter(model_content=blob)   # prove it loads + runs
        it.allocate_tensors()
        i, o = it.get_input_details()[0], it.get_output_details()[0]
        it.set_tensor(i["index"], np.zeros((1, NSAMP), np.float32))
        it.invoke()
        print(f"{fname}: {len(blob)/1024:.0f} KB  in={i['shape']} out={it.get_tensor(o['index']).shape}")
        made.append(task)

        # Web demo path. Must be a GRAPH model, not a layers model: the log-mel
        # step is a Lambda, and tfjs cannot deserialise a Lambda in JS. Going via
        # SavedModel sidesteps layer serialisation entirely.
        try:
            sm = f"{ROOT}/out/sm_{task}"
            m.export(sm)
            os.system(f'tensorflowjs_converter --input_format=tf_saved_model '
                      f'--output_format=tfjs_graph_model "{sm}" "{ROOT}/out/tfjs_{task}"')
            print(f"  tfjs_{task}/ written" if os.path.exists(
                f"{ROOT}/out/tfjs_{task}/model.json") else "  tfjs FAILED")
        except Exception as e:
            print(f"  tfjs skipped: {e}")

    # band-SNR reference table — app/'s RED test (specs.md §4)
    X = np.load(f"{CACHE}/msc_X.npy", mmap_mode="r")
    y = np.load(f"{CACHE}/msc_y.npy")
    table = []
    for c in sorted(set(y.tolist())):
        for k, i in enumerate(np.where(y == c)[0][::max(1, (y == c).sum() // 5)][:5]):
            table.append({"clip": f"{TASKS['msc'][0][c]}_{k}",
                          "sha_first8": float(np.round(X[i][:8].sum(), 6)),
                          "band_snr_db": round(band_snr(np.array(X[i])), 3)})
    spec = {"band_hz": list(SNR_BAND), "n_fft": NFFT, "hop": HOP, "sr": SR,
            "window": "hann", "statistic": "median over frames",
            "definition": "10*log10(mean power in band / mean power outside band up to 4000 Hz)",
            "reference_table": table}
    json.dump(spec, open(f"{ROOT}/out/band_snr.json", "w"), indent=2)
    print(f"\nband-SNR reference table -> out/band_snr.json ({len(table)} clips)")
    print("models exported:", made)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("data"); d.add_argument("--task", default=None); d.set_defaults(f=cmd_data)
    t = sub.add_parser("train"); t.add_argument("--task", default="msc", choices=list(TASKS))
    t.add_argument("--arch", default="cnn", choices=["cnn", "mobilenet"])
    t.add_argument("--epochs", type=int, default=30); t.set_defaults(f=cmd_train)
    e = sub.add_parser("export"); e.set_defaults(f=cmd_export)
    a = ap.parse_args()
    a.f(a)
