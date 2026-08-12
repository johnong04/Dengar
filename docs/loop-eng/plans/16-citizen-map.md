# Slice 16 — citizen neighbourhood risk + prevention · gate: smoke · overnight-eligible: yes

Constraints: see v2-full-COMMON.md — read it first. Depends on slices 12 (warm law applied) + 14 (geo).

## Outcome
The citizen's answer to "is my area bad right now?" — specs §5 v2 community view. Dark warm register,
NOT the officer map: a citizen gets reassurance and an action, never a dashboard.

- `/area` — the same bundled basemap, but treated for the dark surface (reduced opacity / dark
  overlay so it reads as night instrument rather than a daylight map), the user's neighbourhood
  highlighted, nearby detection density shown coarsely. **Coarse on purpose**: never a dot on
  someone's house — round to block level and say so in one line. That is both a privacy stance and a
  talking point.
- One risk level in words + colour (the citizen doesn't want a score): e.g. `Raised — Aedes found
  nearby this week`, with the count and window beneath in mono.
- Prevention: 3–4 specific actions from the standard dengue set (clear standing water, cover
  containers, weekly check of pot trays/gutters, repellent in daylight hours) — concrete, no
  lecturing, no icons-as-decoration.
- Entry point from capture (the footer already has History; add this without crowding it).
- `simulated` marker + `© OpenStreetMap contributors`.

## Acceptance (one line)
`/area` renders map + risk line + prevention at 390 and 430, reachable from capture, no dot finer than
block level; screenshot `16-citizen-area.png`; `npm run check` green.
