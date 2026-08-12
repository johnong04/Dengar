# Slice 21 — final critique + polish, whole app · gate: hard (1 fix cycle) · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Runs last.

## Outcome
The pass over everything slices 11–20 built. Not new features — repair, coherence, and the deliverable
set John reviews.

1. **Invoke `impeccable:impeccable` critique** across every screen, both audiences, at 390×844 and
   430×932. The ban list applies: no side-stripe accents (already caught once on officer-e), no
   gradient text, no glassmorphism, no eyebrow-kicker on every section, no identical-card grids, no
   text overflow at any viewport.
2. **Cross-audience coherence audit** — the thing only a whole-app pass can see: is every back-row
   grammar the same within a surface? Every primary button the same metrics? Every timestamp the same
   format? Are the citizen and officer surfaces still unmistakably different, and is that difference
   *systematic* rather than accidental?
3. **Measure the floors on every screen**: contrast on actual painted backgrounds (compute, don't
   eyeball), no horizontal scroll, tap targets ≥44px, reduced-motion paths, BM overflow, dead routes.
4. **Honesty sweep — the one that protects the submission.** Every figure on every screen traced to
   specs §9 or shown with its arithmetic; every simulated/seeded surface carrying its marker; every
   roadmap screen marked; the §2 language grep clean over `src/copy/` and `src/`. Report a table:
   screen → figures shown → source. **Anything unsourceable gets removed, not reworded.**
5. **Grade the rubric** (design-system.md §Rubric axes) per screen, 1–5, evidence per score.
6. **Fix within 1 bounded round**, re-screenshot after each.

## Deliverables
- `docs/loop-eng/screens/final/` — complete set, every screen and state, both viewports for the gated
  ones, consistent naming. This supersedes the v1 set.
- `docs/loop-eng/handoff.md` — rubric table, what was fixed, what was flagged-unfixed and why.
- `docs/loop-eng/runs/2026-08-12-v2-full.md` — run report in the shape of the v1 one.
- `design-system.md` updated if any token legitimately moved, with a dated note.

## What is unrecreatable (why hard)
John's review and the video shot list both come out of this deliverable set. A polish pass that
silently skipped screens forfeits the run.
