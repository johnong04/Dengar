# Slice 18 — Bahasa Malaysia / English toggle · gate: smoke · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Runs late on purpose: it touches every string, so
every screen must exist first.

## Outcome
specs §5 v2's BM/EN toggle, with the mechanism mattering more than the translation.

- `src/copy/` — every user-facing string moved behind a keyed lookup with `en` and `ms` values, and a
  `useCopy()` hook. No string literals left in screens (this also makes the §2 language sweep a single
  grep over one directory, which is worth having on its own).
- Toggle in onboarding and a settings-adjacent spot; persisted via the existing `store/onboarding.ts`
  wrapper pattern.
- Draft the `ms` values. Malay renders longer than English — **re-check every screen at 390 for
  overflow and clipping in BM**, which is the real work of this slice, not the words.
- **Flag every `ms` string as needing human verification** in the handoff: machine-drafted health copy
  reads wrong to the exact regional panel this is pitched to (CLAUDE.local.md). Do not present the BM
  copy as verified.

## Acceptance (one line)
Toggle flips every screen's language, no clipping/overflow in BM at 390, `ms` strings flagged unverified
in handoff; screenshots of capture + one abstain + officer home in BM; `npm run check` green.
