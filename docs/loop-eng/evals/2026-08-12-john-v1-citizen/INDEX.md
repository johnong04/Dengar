# Eval cases — v1-citizen run (2026-08-12)

One line per finding: real | noise — source — what.

- real — slice3-eval F1 (MAJOR) — abstain readouts were a hardcoded display-map; plan hard case demanded pipeline values. Structural: Verdict abstain arm carried no numbers. Fix: readings{} on abstain arm, red-first. Grep to find: `ABSTAIN_COPY` seeded constants in result.tsx.
- noise — slice3-eval F3 (INFO) — reduced-motion first-frame relies on reanimated auto-disable; measured correct. Do not demand a custom guard.
- noise — slice2-eval F1 (minor) — reanimated kill-switch makes bespoke reduced-motion opacity loops dead code; the static fallback is the sanctioned behavior, not a defect.
- real — slice3 fix1 verified — readings fix landed red-first; re-verdict PASS. Runnable case: gating.check.ts abstain readings asserts (the red test itself).
- noise — slice4-eval F3 (INFO) — "fourteen detections/72h" flagged as modeled-as-fact; it is plan copy from specs §8's declared-simulation scenario. Narration owns the honesty, not the screen. Do not demand a citation chip in-app.
- real — slice8 self-critique — result.tsx drench used off-scale spacing (mt-14/mt-10), same defect class slice-2 eval flagged in capture; fixed. Pattern: off-scale spacing recurs → candidate for a lint/grep gate instead of reviewer attention (retro).

## v2-full run
- real — slice13-eval F1 (HIGH) — heat grid column sums (2,2,3,6,4,7,10) contradict the trend series (2,1,2,3,4,4,6) and the KPI in the same frame: today's column says 10 detections, chart and KPI say 6. Runnable case: assert sum(heat column c) === DETECTIONS_14D[7+c] for all c. Fix: derive the grid, never hand-type it.
- real — slice13-eval F2 (HIGH) — watch-area figures don't reconcile: TM delta +6 vs derived +8; Wangsa Maju count 3 vs its own sparkline's 2; area counts total 17 against a district 72h total of 14; TM's spark is byte-identical to DETECTIONS_14D, asserting TM = whole district. Runnable case: assert DETECTIONS_14D is the element-wise sum of the area sparks, and every count/delta derives from them.
- real — slice13-eval F3 (MEDIUM) — Danau Kota "0 · 11 h" vs a sparkline whose last non-zero is 6 days back. Ambiguous column semantics (node freshness vs detection recency) rendered as fact.
- real — slice13-eval F6 (LOW, judged) — "TREND" eyebrow is the banned reflex (labels a chart already labelled by its legend and axis); "Hour × day" and "Watch areas" are legitimate wayfinding. The evaluator argued the distinction instead of applying the ban mechanically — that is the behaviour to preserve when re-tuning this reviewer.
- noise — slice13-eval prose-count discrepancy — maker claimed 29 words, evaluator reproduced 21/32/77 under three counting rules. The floor (≤40) holds under all of them; do not treat a word-count mismatch as a finding.
