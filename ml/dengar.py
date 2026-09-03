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


_SPEC = None


def spec_augment_layer():
    """SpecAugment — random frequency and time masks, TRAINING ONLY.

    The binding constraint is 89 Aedes recordings, and masking is the cheapest
    honest way to make a small set behave like a larger one: the model cannot
    lean on any single frequency band or instant. Inference is the identity, so
    the exported graph is unchanged.
    """
    global _SPEC
    if _SPEC is None:
        import keras
        from keras import ops, random as krandom

        @keras.saving.register_keras_serializable(package="dengar")
        class SpecAugment(keras.layers.Layer):
            def __init__(self, freq_w=10, time_w=40, n=2, **kw):
                super().__init__(**kw)
                self.freq_w, self.time_w, self.n = freq_w, time_w, n

            def call(self, x, training=None):
                if not training:
                    return x
                b = ops.shape(x)[0]
                T, F = x.shape[1], x.shape[2]
                for width, size, axis in ((self.time_w, T, 1), (self.freq_w, F, 2)):
                    for _ in range(self.n):
                        w = krandom.uniform((b, 1, 1), 0, width)
                        s = krandom.uniform((b, 1, 1), 0, size - width)
                        shape = (1, size, 1) if axis == 1 else (1, 1, size)
                        idx = ops.reshape(ops.arange(size, dtype="float32"), shape)
                        keep = ops.logical_or(idx < s, idx >= s + w)
                        x = x * ops.cast(keep, x.dtype)
                return x

            def get_config(self):
                c = super().get_config()
                c.update(freq_w=self.freq_w, time_w=self.time_w, n=self.n)
                return c

        _SPEC = SpecAugment
    return _SPEC


def build(n_classes, arch="cnn", specaug=True):
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
    if specaug:
        x = spec_augment_layer()(name="specaug")(x)
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


def split3(X, y, g, seed=0):
    """train / val / test, all disjoint BY RECORDING.

    The earlier version passed the test set as validation_data and let
    EarlyStopping restore the epoch with the best test accuracy — selecting on
    the data it then reported, which inflates the number. Validation now comes
    out of the training pool; test is not looked at until the final predict.
    The test split is fixed across seeds so runs stay comparable.
    """
    from sklearn.model_selection import GroupShuffleSplit
    gss = lambda frac, rs: GroupShuffleSplit(n_splits=1, test_size=frac, random_state=rs)
    pool, te = next(gss(0.25, 0).split(X, y, g))
    p2, v2 = next(gss(0.20, seed).split(X[pool], y[pool], g[pool]))
    return pool[p2], pool[v2], te


def load_task(task):
    X = np.load(f"{CACHE}/{task}_X.npy")
    y = np.load(f"{CACHE}/{task}_y.npy")
    g = np.load(f"{CACHE}/{task}_g.npy")
    noise = None
    if os.path.exists(f"{CACHE}/med_X.npy"):
        ny = np.load(f"{CACHE}/med_y.npy")
        nX = np.load(f"{CACHE}/med_X.npy", mmap_mode="r")
        noise = np.array(nX[ny == 1][:400])
    return X, y, g, noise


def fit_one(task, arch, seed, epochs, specaug, X, y, g, noise, quiet=False):
    """One training run. Returns (model, report dict) — test metrics included but
    never used to choose anything."""
    import tensorflow as tf
    from sklearn.metrics import classification_report
    names = TASKS[task][0]
    tf.keras.utils.set_random_seed(seed)

    tr, va, te = split3(X, y, g, seed)
    Xtr, ytr = augment(X[tr], y[tr], noise, np.random.default_rng(seed))
    cnt = collections.Counter(ytr.tolist())
    cw = {c: len(ytr) / (len(cnt) * n) for c, n in cnt.items()}

    m = build(len(names), arch, specaug=specaug)
    steps = max(1, len(Xtr) // 32) * epochs
    # Cosine decay with warmup. The flat-LR runs oscillated hard — val accuracy
    # swinging 0.85 -> 0.32 -> 0.84 between adjacent epochs — so early stopping
    # was firing on noise instead of on convergence.
    lr = tf.keras.optimizers.schedules.CosineDecay(
        initial_learning_rate=0.0, decay_steps=steps,
        warmup_target=1e-4 if arch == "mobilenet" else 1e-3,
        warmup_steps=max(1, steps // 20))
    m.compile(optimizer=tf.keras.optimizers.Adam(lr),
              loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    m.fit(Xtr, ytr, validation_data=(X[va], y[va]), epochs=epochs, batch_size=32,
          class_weight=cw, verbose=0 if quiet else 1, callbacks=[
              tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=12,
                                               restore_best_weights=True)])

    pv = m.predict(X[va], batch_size=64, verbose=0).argmax(1)
    pt = m.predict(X[te], batch_size=64, verbose=0).argmax(1)
    rv = classification_report(y[va], pv, digits=3, zero_division=0, output_dict=True)
    rt = classification_report(y[te], pt, target_names=names, digits=3,
                               zero_division=0, output_dict=True)
    return m, {"seed": seed, "arch": arch, "specaug": bool(specaug),
               "val_macro_f1": round(rv["macro avg"]["f1-score"], 4),
               "test_macro_f1": round(rt["macro avg"]["f1-score"], 4),
               "test_accuracy": round(rt["accuracy"], 4),
               "test_recordings": len(set(g[te].tolist())),
               "params": int(m.count_params()),
               "pred": pt.tolist(), "true": y[te].tolist()}


def report(task, r):
    from sklearn.metrics import confusion_matrix, classification_report
    names = TASKS[task][0]
    print(f"\n=== {task} / {r['arch']} / seed {r['seed']} / specaug {r['specaug']} ===")
    print(f"val macro-F1 {r['val_macro_f1']}   TEST macro-F1 {r['test_macro_f1']}")
    print(f"held-out recordings: {r['test_recordings']}")
    print(confusion_matrix(r["true"], r["pred"]))
    print(classification_report(r["true"], r["pred"], target_names=names,
                                digits=3, zero_division=0))


def cmd_train(a):
    X, y, g, noise = load_task(a.task)
    m, r = fit_one(a.task, a.arch, a.seed, a.epochs, not a.no_specaug, X, y, g, noise)
    report(a.task, r)
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    m.save(f"{ROOT}/out/{a.task}_{a.arch}.keras")
    sf = f"{ROOT}/out/scores.json"
    all_s = json.load(open(sf)) if os.path.exists(sf) else {}
    all_s[f"{a.task}_{a.arch}"] = {k: v for k, v in r.items() if k not in ("pred", "true")}
    json.dump(all_s, open(sf, "w"), indent=2)


def cmd_sweep(a):
    """Many seeds; the winner is chosen ON VALIDATION, its test score is reported.

    Built to survive a recycled Colab runtime: every run appends to sweep.json and
    a re-run skips what is already there, so a disconnect costs one run, not the
    night. Point --out at Drive.
    """
    import shutil
    out = a.out or f"{ROOT}/out"
    os.makedirs(out, exist_ok=True)
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    sj = f"{out}/sweep.json"
    done = json.load(open(sj)) if os.path.exists(sj) else {}

    for task in a.task.split(","):
        X, y, g, noise = load_task(task)
        for specaug in ([True, False] if a.both_aug else [not a.no_specaug]):
            for seed in range(a.seeds):
                key = f"{task}|cnn|s{seed}|a{int(specaug)}"
                if key in done:
                    print(f"skip {key} (already done)", flush=True)
                    continue
                print(f"\n########## {key}", flush=True)
                m, r = fit_one(task, "cnn", seed, a.epochs, specaug, X, y, g,
                               noise, quiet=True)
                report(task, r)
                m.save(f"{out}/{task}_cnn_s{seed}_a{int(specaug)}.keras")
                done[key] = {k: v for k, v in r.items() if k not in ("pred", "true")}
                json.dump(done, open(sj, "w"), indent=2)     # after EVERY run

        # Winner chosen on VALIDATION. Choosing on test would reintroduce exactly
        # the selection bias this rewrite exists to remove.
        cand = {k: v for k, v in done.items() if k.startswith(task + "|")}
        if not cand:
            continue
        best = max(cand, key=lambda k: cand[k]["val_macro_f1"])
        b = cand[best]
        src = f"{out}/{task}_cnn_s{b['seed']}_a{int(b['specaug'])}.keras"
        if os.path.exists(src):
            shutil.copy(src, f"{ROOT}/out/{task}_cnn.keras")
        print(f"\n>>> {task} winner {best}: val {b['val_macro_f1']} "
              f"TEST {b['test_macro_f1']}  (of {len(cand)} runs)", flush=True)

    print("\n===== LEADERBOARD (ranked by VAL; test shown, never selected on) =====")
    for k, v in sorted(done.items(), key=lambda kv: -kv[1]["val_macro_f1"]):
        print(f"  {k:22s} val {v['val_macro_f1']:.4f}   test {v['test_macro_f1']:.4f}")


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
    log_layer(); spec_augment_layer()            # register before load_model
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    sf = f"{ROOT}/out/scores.json"
    scores = json.load(open(sf)) if os.path.exists(sf) else {}
    made = []
    for task, fname in (("med", "med.tflite"), ("msc", "msc.tflite"), ("tri", "tri.tflite")):
        # `sweep` already picked this task's winner ON VALIDATION and copied it
        # here, so prefer it. Fall back to comparing whatever `train` left behind.
        src = f"{ROOT}/out/{task}_cnn.keras"
        if os.path.exists(src):
            print(f"\n{task}: using {task}_cnn.keras (sweep winner)")
        else:
            cand = {k: v for k, v in scores.items() if k.startswith(task + "_")}
            cand = {k: v for k, v in cand.items()
                    if os.path.exists(f"{ROOT}/out/{k}.keras")}
            if not cand:
                continue
            rank = lambda k: cand[k].get("val_macro_f1", cand[k].get("macro_f1", 0))
            best = max(cand, key=rank)
            src = f"{ROOT}/out/{best}.keras"
            print(f"\n{task}: using {best} (val {rank(best)}) out of {sorted(cand)}")
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
    t.add_argument("--seed", type=int, default=0)
    t.add_argument("--no-specaug", action="store_true")
    t.add_argument("--epochs", type=int, default=60); t.set_defaults(f=cmd_train)
    w = sub.add_parser("sweep"); w.add_argument("--task", default="msc,med,tri")
    w.add_argument("--seeds", type=int, default=5)
    w.add_argument("--epochs", type=int, default=60)
    w.add_argument("--both-aug", action="store_true")
    w.add_argument("--no-specaug", action="store_true")
    w.add_argument("--out", default=None); w.set_defaults(f=cmd_sweep)
    e = sub.add_parser("export"); e.set_defaults(f=cmd_export)
    a = ap.parse_args()
    a.f(a)
