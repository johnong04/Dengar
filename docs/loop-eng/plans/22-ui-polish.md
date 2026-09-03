# UI polish pass — demo-ready frontend (2026-09-04)

Goal: the app reads as a real product on camera, not a spec rendered as screens. No new features.
Recording happens on a **laptop browser**, so web is the shipping target for this pass.

## Constraints
- **NO new dependencies.** Three native deps were just installed for the ML path but are NOT
  imported; do not import them here. All visuals stay composed from `View`s + reanimated.
- specs §2 language table binding; specs §9 the only source of figures; declared simulation stays.
- Citizen (dark, warm) and officer (light, dense) must stay unmistakably different.
- `app/src/app/board/*` frozen. `src/copy/` is a critical path — every string lives there.
- Design oracle: `docs/design/inspiration/*` (7 refs) + `docs/design/design-system.md`.
  `mapcluster-1.png` (Airbnb) is the map oracle: **value-in-a-pill + slide-up card**.

## The six items, in order

1. **Bottom tab bar** — Listen / Area / History. Kills the hidden `/board` as the only way around.
   Officer reached deliberately (not a fourth tab). Biggest "real product" signal per unit of work.
2. **Demote v3** — the five roadmap screens leave the flow, stay on `/board` and as routes. Nothing
   deleted. They are 518 of the app's 1,661 words and read as capability-we-don't-have.
3. **Copy cut ~60%** — officer and roadmap worst. One number + one label beats a sentence.
4. **Map rebuild** — replace hand-drawn circles + rectangles with pills carrying the count, tap →
   card. This is the screen John called childish, and it is the officer's whole insight surface.
5. **Real location** — `navigator.geolocation` on web. Real coordinates, no native module, no
   rebuild. Falls back to the seeded Setapak coords when denied or unavailable.
6. **Officer entry** — a deliberate, non-hidden way in that does not put a government dashboard in
   a citizen's tab bar.

Then, if time: capture-screen hero polish, screen transitions, empty states, the result screen's
dead vertical gap.

## Definition of done
- `cd app && npm run check` green after every item; commit per item.
- Every screen reachable by tapping — `/board` becomes a convenience, never the only route.
- No horizontal scroll at 390x844 and 430x932; tap targets >=44px; contrast AA on the painted
  background. Measured, not eyeballed.
- Word count per screen recorded before/after in the final report.
- Screenshots of each changed screen at 390 into `docs/loop-eng/screens/ui-polish/`.

## Not in scope
Importing the ML libs, the EAS build, the Malay copy (still machine-drafted and unread), anything
requiring a native rebuild.
