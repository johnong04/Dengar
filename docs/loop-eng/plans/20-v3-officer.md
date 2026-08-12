# Slice 20 — v3 officer roadmap screens · gate: smoke · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Officer light language, no new register.

## Outcome
specs §5 v3, officer side. Roadmap-marked, seeded data, two screens under `/officer/roadmap/`:

1. **Prediction timeline** — 7–14 day outbreak-risk forecast from detection density + rainfall. This
   is the natural extension of slice 13's chart, so reuse its View-composed vocabulary: the historical
   series, then a forecast band (a range, never a single confident line — a point forecast implies
   precision we cannot claim). Label the band as modelled and the inputs as detection density +
   rainfall. specs §10 matters here: we do NOT compete with D-MOSS on forecasting, we feed it — so the
   copy frames this as "a faster input layer", not as a rival model. Keep it to a few words.
2. **Surgical dispatch** — block-level fogging targets with a cost-per-case-averted readout. The
   economics are the strongest part of the pitch and every figure is sourceable: specs §9 has
   USD 73.5M/yr national programme, USD 1,591/case, fogging = 51.0% of DHD costs, DHD USD 679/case,
   citizen science EUR 1.23/km²/month vs ovitraps EUR 9.36 (8×). **Use those and show the arithmetic
   for anything derived; invent nothing.** Visual: the block grid from slice 14 with per-block target
   priority, and a cost comparison composed from Views (blanket fogging vs targeted).

## Acceptance (one line)
Both screens render in the officer language with roadmap markers, forecast shown as a range not a
line, every economic figure traceable to §9 with derivations shown; screenshots
`20-v3-officer-{forecast,dispatch}.png`; `npm run check` green.
