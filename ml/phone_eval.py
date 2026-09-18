"""Phone-microphone validation — the assumption the product rests on.

Every number in docs/ml-results.md is measured on HumBugDB's Tanzania/Tascam
field recordings. The product runs on phone microphones. Nothing has ever tested
that gap, and it is the project's largest unverified claim.

Two sources, same evaluator. Both are TEST ONLY — nothing here trains.

  python phone_eval.py eval --source humbug-phone      # free, already downloaded
  python phone_eval.py eval --source abuzz --dir DIR   # needs a manual download

**humbug-phone** is the default and the one to run first. HumBugDB contains 113
*Aedes* recordings made on an Alcatel 4009X, plus ~2,385 not-Aedes and ~695
background, and the RIG filter in dengar.py excluded every one of them from
training. So they are a genuine zero-leakage domain-shift test: different
microphone, different country, different colony, 8 kHz rather than 44.1 kHz.
Their weakness is length — 0.05-2 s per clip, tiled up to the 5 s the contract
requires, which is what the app does too but is a shorter look than training saw.

**abuzz** (Stanford, eLife 2017, Dryad doi:10.5061/dryad.98d7s) is the larger and
better test, but Dryad sits behind Anubis, a proof-of-work anti-scraping wall the
operator put up deliberately. It is not scriptable and will not be bypassed here.
Download the per-species .rar files in a browser, extract them into one folder
with a subfolder per species, and point --dir at it.

One known Abuzz defect, from HumBugDB's own paper: "no labels to timestamp
mosquito events in files where mosquito sound was only sporadic". A file labelled
*Aedes aegypti* may be mostly silence. So eval gates on MED first and judges MSC
only where a mosquito is audible — the app's own two-stage flow — and prints the
ungated number beside it so the gating cannot hide anything.
"""
import argparse, collections, json, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dengar as D

ROOT = os.path.dirname(os.path.abspath(__file__))
MAX_WIN_PER_FILE = 6          # stop one long recording dominating the score

# Aedes here is aegypti + albopictus only, matching the 'ae ' label the model was
# trained on.
IS_AEDES = lambda sp: (sp or "").startswith("ae ")
PHONE_KEYS = ("alcatel", "itel", "phone", "samsung", "xperia", "iphone")
IS_PHONE = lambda r: any(k in (r.get("device_type") or "").lower()
                         for k in PHONE_KEYS)


# -------------------------------------------------------------- sources -------
def source_humbug_phone():
    """-> [(path, cls)] where cls: 0 aedes, 1 not_aedes, 2 background."""
    idx = D.find_wav(os.path.join(D.DATA, "audio"))
    out = []
    for r in D.rows():
        if not IS_PHONE(r) or r["id"] not in idx:
            continue
        if r["sound_type"] == "mosquito":
            if not r["species"]:
                continue                       # unlabelled species: no MSC truth
            cls = 0 if IS_AEDES(r["species"]) else 1
        else:
            cls = 2
        out.append((idx[r["id"]], cls))
    return out


def source_abuzz(d):
    """A folder with one subfolder per species, as downloaded from Dryad."""
    out = []
    for name in sorted(os.listdir(d)):
        sub = os.path.join(d, name)
        if not os.path.isdir(sub):
            continue
        low = name.lower()
        if low.startswith("aedes"):
            # Ae. sierrensis is genus Aedes but is not a dengue vector and was
            # never in training, so scoring it would measure a claim we never made.
            if "aegypti" not in low and "albopictus" not in low:
                print(f"  skip {name} (not a trained Aedes species)"); continue
            cls = 0
        elif low.startswith(("anopheles", "culex", "culiseta")):
            cls = 1
        else:
            print(f"  skip {name} (unmapped)"); continue
        n = 0
        for dp, _, ns in os.walk(sub):
            for f in ns:
                if f.lower().endswith((".wav", ".mp3", ".m4a", ".aac")):
                    out.append((os.path.join(dp, f), cls)); n += 1
        print(f"  {name:26s} {n:5d} files -> {'aedes' if cls == 0 else 'not_aedes'}")
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

    files = (source_humbug_phone() if a.source == "humbug-phone"
             else source_abuzz(a.dir))
    if not files:
        print("no files found — has the audio been downloaded?"); return
    cnt = collections.Counter(c for _, c in files)
    print(f"\n=== {a.source}: {len(files)} recordings "
          f"(aedes {cnt[0]}, not_aedes {cnt[1]}, background {cnt[2]}) ===")
    if cnt[0] < 20:
        print("!! fewer than 20 aedes recordings — too thin to read much into")

    med = TFLite(os.path.join(a.models, "med.tflite"))
    msc = TFLite(os.path.join(a.models, "msc.tflite"))

    rows = []                                   # (cls, P(mosquito), P(aedes), file)
    for n, (path, cls) in enumerate(files):
        try:
            x = D.load_clip(path)
        except Exception:
            continue
        for win in D.windows(x, hop_s=2.5)[:MAX_WIN_PER_FILE]:
            rows.append((cls, float(med(win)[0]), float(msc(win)[0]), path))
        if n % 250 == 0:
            print(f"  {n}/{len(files)} ...", flush=True)

    cls = np.array([r[0] for r in rows])
    medp = np.array([r[1] for r in rows])
    mscp = np.array([r[2] for r in rows])
    names = ["aedes", "not_aedes"]

    # --- MED first: does the abstain gate even fire on phone audio? -----------
    ymed = (cls == 2).astype(int)               # 0 mosquito, 1 background
    pmed = (medp < a.med_floor).astype(int)
    print(f"\n-- MED (mosquito vs background), {len(ymed)} windows")
    print(confusion_matrix(ymed, pmed, labels=[0, 1]))
    print(classification_report(ymed, pmed, digits=3, zero_division=0,
                                target_names=["mosquito", "background"], labels=[0, 1]))
    med_f1 = f1_score(ymed, pmed, average="macro", zero_division=0)

    # --- MSC on the mosquito windows only ------------------------------------
    mo = cls != 2
    def block(title, mask):
        if mask.sum() == 0 or len(set(cls[mask].tolist())) < 2:
            print(f"\n-- {title}: not enough windows"); return None
        p = (mscp[mask] < 0.5).astype(int)      # index 0 = aedes
        print(f"\n-- {title}  ({mask.sum()} windows)")
        print(confusion_matrix(cls[mask], p, labels=[0, 1]))
        print(classification_report(cls[mask], p, target_names=names, digits=3,
                                    zero_division=0, labels=[0, 1]))
        return f1_score(cls[mask], p, average="macro", zero_division=0)

    f_all = block("MSC, ALL mosquito windows (ungated)", mo)
    f_med = block(f"MSC, MED-gated at {a.med_floor} — what the app does",
                  mo & (medp >= a.med_floor))

    # --- per recording: the real deployment unit ------------------------------
    byfile = collections.defaultdict(list)
    for (c, mp, sp, f) in rows:
        if c != 2 and mp >= a.med_floor:
            byfile[(f, c)].append(sp)
    f_file = None
    if len(byfile) > 1:
        fy = np.array([c for (_, c) in byfile])
        fp = np.array([0 if np.mean(v) >= 0.5 else 1 for v in byfile.values()])
        if len(set(fy.tolist())) > 1:
            print(f"\n-- MSC per RECORDING, majority vote ({len(fy)} recordings)")
            print(confusion_matrix(fy, fp, labels=[0, 1]))
            print(classification_report(fy, fp, target_names=names, digits=3,
                                        zero_division=0, labels=[0, 1]))
            f_file = f1_score(fy, fp, average="macro", zero_division=0)

    # --- miscalibration, or blindness? ---------------------------------------
    # 0 of 113 could mean the signal is present but the decision boundary sits in
    # the wrong place in this domain (a threshold fixes that) or that the features
    # are simply absent from phone audio (only retraining fixes that). AUC settles
    # it: it asks whether aedes windows score HIGHER than not_aedes at all,
    # independently of where the boundary is.
    g = mo & (medp >= a.med_floor)
    print("\n-- P(aedes) distribution on MED-gated windows")
    for c, lab in ((0, "TRUE aedes    "), (1, "TRUE not_aedes")):
        v = mscp[g & (cls == c)]
        if len(v):
            print(f"   {lab} n={len(v):5d}  " +
                  "  ".join(f"p{q}={np.percentile(v, q):.3f}"
                            for q in (1, 5, 25, 50, 75, 95, 99)))

    best_t = best_f = auc = None
    if (g & (cls == 0)).sum() and (g & (cls == 1)).sum():
        yy, pp = cls[g], mscp[g]
        grid = np.arange(0.002, 0.999, 0.002)
        sc = [f1_score(yy, (pp >= t).astype(int) ^ 1, average="macro",
                       zero_division=0) for t in grid]
        i = int(np.argmax(sc))
        best_t, best_f = float(grid[i]), float(sc[i])
        print(f"\n   best reachable by MOVING THE THRESHOLD ALONE: {best_f:.4f} "
              f"at P(aedes) >= {best_t:.3f}  (the 0.5 default gave {f_med:.4f})")
        try:
            from sklearn.metrics import roc_auc_score
            auc = float(roc_auc_score((yy == 0).astype(int), pp))
            verdict = ("SIGNAL PRESENT, boundary misplaced — retrain or recalibrate"
                       if auc > 0.70 else
                       "WEAK signal — threshold alone will not rescue it"
                       if auc > 0.55 else
                       "NO usable signal in this domain — the features do not transfer")
            print(f"   AUC {auc:.4f}  (0.5 = no signal, 1.0 = perfectly separable)"
                  f"\n   => {verdict}")
        except Exception as e:
            print(f"   AUC n/a ({e})")

    summary = {"source": a.source, "recordings": len(files), "windows": len(rows),
               "msc_auc": None if auc is None else round(auc, 4),
               "msc_best_threshold": None if best_t is None else round(best_t, 4),
               "msc_best_threshold_macro_f1": None if best_f is None else round(best_f, 4),
               "aedes_recordings": cnt[0],
               "med_macro_f1": round(med_f1, 4),
               "med_fire_rate_on_mosquito": round(float((medp[mo] >= a.med_floor).mean()), 4),
               "msc_ungated_macro_f1": None if f_all is None else round(f_all, 4),
               "msc_med_gated_macro_f1": None if f_med is None else round(f_med, 4),
               "msc_per_recording_macro_f1": None if f_file is None else round(f_file, 4)}
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    json.dump(summary, open(f"{ROOT}/out/phone_eval_{a.source}.json", "w"), indent=2)
    print("\n" + json.dumps(summary, indent=2))
    print("\nThis is a CROSS-DOMAIN score against HumBugDB's 0.825. A large drop "
          "is the expected result, not a bug — it is the first honest measurement "
          "of the phone-microphone assumption. Record it either way.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    e = sub.add_parser("eval")
    e.add_argument("--source", default="humbug-phone",
                   choices=["humbug-phone", "abuzz"])
    e.add_argument("--dir", default=None, help="abuzz only: extracted folder")
    e.add_argument("--models", default="/content/drive/MyDrive/dengar")
    e.add_argument("--med-floor", type=float, default=0.5)
    e.set_defaults(f=cmd_eval)
    a = ap.parse_args()
    if a.source == "abuzz" and not a.dir:
        ap.error("--source abuzz needs --dir (Dryad is behind Anubis; "
                 "download in a browser and extract)")
    a.f(a)
