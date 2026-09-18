"""Abuzz — the phone-microphone test set. NEVER training, not in this file.

Stanford, Mukundarajan et al., eLife 2017, Dryad doi:10.5061/dryad.98d7s.
20 species, one .rar per species, recorded on commodity phones.

This exists to answer the one question the HumBugDB numbers cannot: does the
model survive a phone microphone? We train on Tascam field recordings and the
product runs on phones, so that gap is the project's largest unverified
assumption, not a detail.

  python abuzz.py data                      # download + extract + inventory
  python abuzz.py eval --models <dir>       # run the SHIPPED tflite against it

One known defect in this dataset, from HumBugDB's own paper: Abuzz has "no
labels to timestamp mosquito events in files where mosquito sound was only
sporadic". A file labelled 'Aedes aegypti' may be mostly silence. Cut into 5 s
windows, most windows would be mislabelled. So `eval` runs MED first and judges
MSC only on windows where a mosquito is actually audible — which is exactly what
the app does. The ungated number is printed too, so the gating cannot hide
anything.
"""
import argparse, collections, json, os, subprocess, sys, urllib.request
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dengar as D

ROOT = os.path.dirname(os.path.abspath(__file__))
ADATA = os.path.join(ROOT, "abuzz_data")
API = "https://datadryad.org/api/v2"
DOI = "doi%3A10.5061%2Fdryad.98d7s"

# Which archives to pull. Aedes here is aegypti + albopictus ONLY, matching the
# HumBugDB 'ae ' label the model was trained on. Ae. sierrensis is genus Aedes
# but is not a dengue vector and was not in training, so including it would
# measure something we never claimed.
AEDES = ["Aedes aegypti", "Aedes albopictus"]
NOT_AEDES = ["Anopheles arabiensis", "Anopheles gambiae", "Anopheles stephensi",
             "Anopheles dirus", "Culex pipiens", "Culex quinquefasciatus",
             "Culex tarsalis"]
WANT = AEDES + NOT_AEDES

MAX_WIN_PER_FILE = 6          # keep long recordings from dominating the score


# ---------------------------------------------------------------- data --------
def file_index():
    with urllib.request.urlopen(f"{API}/datasets/{DOI}") as r:
        ver = json.load(r)["_links"]["stash:version"]["href"]
    with urllib.request.urlopen(f"https://datadryad.org{ver}/files") as r:
        fs = json.load(r)["_embedded"]["stash:files"]
    return {f["path"]: (f["_links"]["stash:download"]["href"], f["size"]) for f in fs}


def cmd_data(a):
    os.makedirs(ADATA, exist_ok=True)
    idx = file_index()
    for name in WANT:
        key = f"{name}.rar"
        if key not in idx:
            print(f"  !! {key} not in the Dryad record"); continue
        href, size = idx[key]
        rar = os.path.join(ADATA, key)
        out = os.path.join(ADATA, name)
        if os.path.isdir(out) and os.listdir(out):
            print(f"  have {name}"); continue
        if not os.path.exists(rar):
            print(f"  get  {key} ({size/1e6:.0f} MB) ...", flush=True)
            urllib.request.urlretrieve(f"https://datadryad.org{href}", rar)
        os.makedirs(out, exist_ok=True)
        # unrar, not Python: rarfile still shells out to it anyway.
        rc = subprocess.call(["unrar", "x", "-inul", "-o+", rar, out + os.sep])
        if rc != 0:
            print(f"  !! unrar failed on {key} (rc={rc}). "
                  f"Colab needs: !apt-get -qq install unrar")
            continue
        os.remove(rar)
        print(f"  unpacked {name}")

    print("\n--- Abuzz inventory (what we can actually test on) ---")
    total = collections.Counter()
    for name in WANT:
        wavs = list_wavs(os.path.join(ADATA, name))
        secs = 0.0
        for w in wavs:
            try:
                import soundfile as sf
                info = sf.info(w)
                secs += info.frames / float(info.samplerate)
            except Exception:
                pass
        cls = "aedes" if name in AEDES else "not_aedes"
        total[cls] += len(wavs)
        print(f"  {name:26s} {len(wavs):5d} files  {secs/60:7.1f} min  -> {cls}")
    print(f"\n  aedes files {total['aedes']}  |  not_aedes files {total['not_aedes']}")
    print("  NB: file counts matter more than minutes — windows from one "
          "recording are near-duplicates.")


def list_wavs(d):
    out = []
    for dp, _, ns in os.walk(d):
        for n in ns:
            if n.lower().endswith((".wav", ".m4a", ".mp3", ".aac")):
                out.append(os.path.join(dp, n))
    return out


# ---------------------------------------------------------------- eval --------
class TFLite:
    def __init__(self, path):
        import tensorflow as tf
        self.it = tf.lite.Interpreter(model_path=path)
        self.it.allocate_tensors()
        self.i = self.it.get_input_details()[0]
        self.o = self.it.get_output_details()[0]

    def __call__(self, x):
        self.it.set_tensor(self.i["index"], x[None, :].astype(np.float32))
        self.it.invoke()
        return self.it.get_tensor(self.o["index"])[0]


def cmd_eval(a):
    from sklearn.metrics import confusion_matrix, classification_report, f1_score
    med = TFLite(os.path.join(a.models, "med.tflite"))
    msc = TFLite(os.path.join(a.models, "msc.tflite"))

    rows = []          # (true_cls, med_p, msc_p_aedes, file)
    for name in WANT:
        cls = 0 if name in AEDES else 1
        wavs = list_wavs(os.path.join(ADATA, name))
        for w in wavs:
            try:
                x = D.load_clip(w)
            except Exception:
                continue
            for win in D.windows(x, hop_s=2.5)[:MAX_WIN_PER_FILE]:
                rows.append((cls, float(med(win)[0]), float(msc(win)[0]), w))
        print(f"  scored {name:26s} {len(wavs):5d} files", flush=True)

    y = np.array([r[0] for r in rows])
    medp = np.array([r[1] for r in rows])
    mscp = np.array([r[2] for r in rows])
    names = ["aedes", "not_aedes"]
    print(f"\n=== Abuzz: {len(rows)} windows from "
          f"{len(set(r[3] for r in rows))} phone recordings ===")

    def block(title, mask):
        if mask.sum() == 0:
            print(f"\n-- {title}: no windows"); return None
        p = (mscp[mask] < 0.5).astype(int)     # index 0 = aedes
        print(f"\n-- {title}  ({mask.sum()} windows, "
              f"{100*mask.mean():.0f}% of all)")
        print(confusion_matrix(y[mask], p, labels=[0, 1]))
        print(classification_report(y[mask], p, target_names=names, digits=3,
                                    zero_division=0, labels=[0, 1]))
        return f1_score(y[mask], p, average="macro", zero_division=0)

    # Ungated is the pessimistic bound: it scores windows the mosquito is not
    # even audible in. Gated is what the app would actually do.
    f_all = block("ALL windows (ungated — includes silence)",
                  np.ones(len(y), bool))
    f_med = block(f"MED-gated (P(mosquito) >= {a.med_floor}) — what the app does",
                  medp >= a.med_floor)
    print(f"\nMED fired on {100*(medp >= a.med_floor).mean():.0f}% of windows "
          f"(aedes {100*(medp[y==0] >= a.med_floor).mean():.0f}%, "
          f"not_aedes {100*(medp[y==1] >= a.med_floor).mean():.0f}%)")

    # Per-RECORDING vote: the honest deployment unit. A user records repeatedly.
    byfile = collections.defaultdict(list)
    for (c, mp, sp, f) in rows:
        if mp >= a.med_floor:
            byfile[(f, c)].append(sp)
    if byfile:
        fy = np.array([c for (_, c) in byfile])
        fp = np.array([0 if np.mean(v) >= 0.5 else 1 for v in byfile.values()])
        print(f"\n-- PER-RECORDING majority vote ({len(fy)} recordings)")
        print(confusion_matrix(fy, fp, labels=[0, 1]))
        print(classification_report(fy, fp, target_names=names, digits=3,
                                    zero_division=0, labels=[0, 1]))
        f_file = f1_score(fy, fp, average="macro", zero_division=0)
    else:
        f_file = None

    summary = {"windows": len(rows), "ungated_macro_f1": f_all,
               "med_gated_macro_f1": f_med, "per_recording_macro_f1": f_file,
               "med_fire_rate": float((medp >= a.med_floor).mean())}
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    json.dump(summary, open(f"{ROOT}/out/abuzz.json", "w"), indent=2)
    print("\n" + json.dumps(summary, indent=2))
    print("\nThis is a CROSS-DATASET score. A large drop from the HumBugDB "
          "number is the expected result, not a bug — it is the first honest "
          "measurement of the phone-microphone assumption.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("data"); d.set_defaults(f=cmd_data)
    e = sub.add_parser("eval")
    e.add_argument("--models", default="/content/drive/MyDrive/dengar")
    e.add_argument("--med-floor", type=float, default=0.5)
    e.set_defaults(f=cmd_eval)
    a = ap.parse_args()
    a.f(a)
