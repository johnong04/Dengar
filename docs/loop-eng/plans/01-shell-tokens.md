# Slice 1 — tokens + app shell · gate: smoke · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Outcome
The repo stops being a template. Design-system tokens live in config; navigation is the real app's
skeleton; every template leftover is gone.

- `tailwind.config.js`: dark-ground palette from design-system.md as named tokens (`bg`, `surface`,
  `line`, `ink`, `muted`, `primary`, `alert`, `ok`, `caution`, plus drench colors `verdict-aedes`
  `#7E1B10`-family and `verdict-quiet`). Board screens may keep raw hex (they're frozen artifacts).
- Routes: `/` = capture (home). `/result` (param-driven verdict states), `/history`, `/onboarding`
  (stack of 3 + permission). Board routes stay untouched under `/board/*`.
- Delete template leftovers: `explore.tsx`, app-tabs, themed-*, hint-row, web-badge, collapsible,
  animated-icon, constants/theme, use-theme hooks — anything the new app doesn't import.
- A `src/store/detections.ts`: in-memory store behind a minimal interface (list/add/pendingSync
  count, seeded with 3 plausible entries) — slices 5/7 consume it; real persistence swaps in behind
  the same interface at the next native build.

## Acceptance (one line)
`npm run check` green + `/` renders the placeholder-free shell at 390×844 with named-token colors.
