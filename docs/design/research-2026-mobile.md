# Research: 2026 polished mobile UI patterns → Dengar

Scope: patterns implementable with plain RN `View`s + `react-native-reanimated`. **No new deps.**
Compiled 2026-09-04. Every number is either `[cited]` (from a source in §Sources) or `[inferred]`
(my judgement, defensible but unsourced). Nothing here overrides `docs/design/design-system.md` —
where a 2026 trend conflicts with our register rules (no glassmorphism, no gradient text, no
cards-by-reflex), **our system wins** and the conflict is called out inline.

Screens referenced: `index` (capture), `result`, `area`, `history`, `officer/index`,
`officer/cluster/[id]`, `onboarding`, `roadmap/*`.

---

## Ranked patterns (12)

### 1. Docked tab bar, icon + short label, hairline top, safe-area padded
Polished because it is *boring in the right way*: the nav must not compete with content. 2026 apps
have largely stopped hiding labels — icon-only tab bars fail recognition for anything that is not a
universal glyph (home/search/profile). Ours are not universal.
**Numbers:** content row height 49pt `[cited: iOS HIG]`, plus bottom safe-area inset (34pt on
gesture-nav iPhones `[cited]`, ~24–48dp Android `[cited: HIG/typical]`) — so total 83pt on modern
devices. Touch target ≥44×44pt, 48dp recommended `[cited]`. Icon 24, label 10–11px, gap 4 `[inferred]`.
**Build:** `<View>` row, `borderTopWidth: StyleSheet.hairlineWidth`, `borderTopColor: line`,
`backgroundColor: bg` (opaque — do **not** blur; glassmorphism is banned in our system),
`paddingBottom: useSafeAreaInsets().bottom`. Expo Router `Tabs` with a custom `tabBar`.
**Dengar:** new shell across capture / area / history. Officer keeps its own light-ground bar.

### 2. Active tab signalled by *fill + ink*, not by a moving pill
A sliding pill or "liquid" blob is the 2026 cliché — it is the single most-copied AI-generated nav
treatment. The durable signal is: active icon switches to filled/heavier weight, label goes from
`muted` to `ink`, and a 3px dot or 2px bar sits under it. Inactive = outline + `muted`.
**Numbers:** icon opacity 1.0 vs 0.55; indicator dot 4px, radius 2, animated 150ms `[inferred]`.
**Build:** two `View` icon variants cross-faded with `withTiming(150)`, or a single set of stroke
`View`s whose `borderWidth` animates 1.5→2.25. Indicator = absolutely-positioned `View` with
`useAnimatedStyle` on `opacity` + `scaleX`. Never translate a pill across the whole bar.
**Dengar:** the tab bar itself.

### 3. Map = real geometry, not decorative shapes — a projected point layer
The current map reads childish because circles+rectangles are *ornament*, not *data*. The fix is not
a map library: it is that every drawn element must be a **projection of a real coordinate**. Even a
crude equirectangular projection of 8 real Selangor sub-district lat/lons onto a `View` box reads as
a map; three hand-placed rounded rectangles never will.
**Build:** `project(lat,lon) → {x,y}` with a fixed bbox → `left/top` on absolutely-positioned `View`s.
Ground: `bg` with a very low-contrast 1px grid (`line` at 8–12% alpha, 32px cells) so the plane has
scale. Optional coastline/boundary: a polyline drawn as a chain of thin rotated `View`s — expensive;
prefer omitting the outline over drawing a wrong one.
**Dengar:** `officer/index`, `officer/cluster/[id]`.

### 4. Density via **graduated circles**, area-proportional — not a heatmap
Standard cartographic answer, and it needs zero libraries. The eye reads circle **area**, so a value
4× larger must be 4× the area = 2× the diameter. Getting this wrong (scaling diameter linearly) is
exactly what makes hand-made maps look amateur.
**Numbers:** `d = dMin + (dMax - dMin) * sqrt(v / vMax)`, dMin 12, dMax 44 `[formula cited: GIS
Geography / Axis Maps; the px values inferred]`. Overlap handled with 50–70% fill opacity `[cited]`.
**Build:** `View` with `borderRadius: d/2`, fill `o-alert` at alpha stepped by value (our system
already defines the 0.14→1.00 heat ramp), `borderWidth: 1` in `o-alert` at full alpha for the rim.
**Dengar:** `officer/index` cluster map, `area` (nearby-activity).

### 5. The value pill on the map (Airbnb pattern), with a real selected state
A pill carrying the *number* — not a generic pin — is why the Airbnb map reads as data. The whole
pattern lives or dies on the **selected** state.
**Numbers:** pill height 28–32, radius = height/2 (full pill), padding-x 10–12, label 13px/600
`[inferred; Airbnb radii community-observed: pill search bar, 8px buttons, 12–20px cards `[cited]`]`.
Unselected: `o-surface` fill, `o-line` border, `o-ink` text. Selected: inverted — `o-ink` fill,
`o-bg` text, `scale 1.08`, z-raised.
**Build:** absolutely-positioned `View` per point; selection animates `scale` + interpolated
background via `useAnimatedStyle` at 180ms `[inferred]`. Add a 6px triangle tail only if you can
draw it with borderWidth tricks cleanly; otherwise omit — a tailless pill is fine.
**Dengar:** `officer/index`; the same component with a case-count instead of a price.

### 6. Slide-up card with two detents and a grabber
2026's default container for secondary content: filters, details, confirmations. Two snap points
beat three — peek and full.
**Numbers:** grabber pill **56×6dp, radius 3**, and it scales to **1.3×** / fades to **0.6 alpha**
while dragging `[cited]`. Peek detent ≈ 30% of screen height, full ≈ 88% `[inferred]`. Sheet corner
radius 20–24 `[inferred, consistent with cited 12–20px card radii]`. Fling → nearest detent by
velocity, not by position `[cited]`.
**Build:** `Animated.View` with `translateY` driven by `useSharedValue`; `Gesture.Pan()` from
gesture-handler (already present under Reanimated's peer chain — **verify before relying on it**;
if absent, a tap-to-expand sheet with no drag is an acceptable downgrade). Settle with
`withSpring({ damping: 22, stiffness: 220, mass: 1 })` `[inferred]`. Scrim = `View` with
`backgroundColor: '#000'`, opacity interpolated 0→0.5 from the same shared value.
**Dengar:** `officer/cluster/[id]` opened from the map; `history` row → detail; `result` detail.

### 7. One number + one label, everything else in the sheet
The single highest-leverage text reducer. A screen states **one** quantity at display size with a
≤3-word label under it; the paragraph explaining it moves behind a "Why this number" row that opens
the sheet. Progressive disclosure is the named mechanism — show what the user needs *now*, keep the
rest reachable `[cited]`.
**Numbers:** display value 48–56px, label 12–13px uppercase-off, letter-spacing 0 `[inferred]`.
Target ≤45 words visible per screen before scroll `[inferred]`. Our 1,661-word corpus should land
near 600.
**Build:** pure layout. The work is deletion, not code.
**Dengar:** every screen, but `result`, `area` and `roadmap/*` are where the words are.

### 8. Rows with hairlines, not a stack of cards
Cards-by-reflex (identical rounded boxes, each with icon + heading + two lines) is listed by
multiple 2026 sources as *the* AI-generated tell `[cited]`. A grouped list — one `surface` block,
items separated by `hairlineWidth` rules — is denser, calmer and reads as native.
**Numbers:** row min-height 56, horizontal padding 16, separator inset-left 16 `[inferred]`.
**Build:** one container `View` (`surface`, radius 14), children with
`borderBottomWidth: StyleSheet.hairlineWidth` except the last.
**Dengar:** `history`, `area`, `officer/alerts`, all `roadmap/*`.

### 9. Elevation by surface *level*, never by shadow or glow
Dark mode in 2026 uses four explicit surfaces — base, elevated, secondary elevated, overlay `[cited]`
— rather than drop shadows, which are near-invisible on dark grounds and read as glow when
compensated. Our tokens already encode this (`bg` / `surface` / `surface-raised`).
**Build:** background color only. Zero `shadow*` props on dark screens.
**Dengar:** capture, result, area, history. Officer light ground may use one very soft shadow.

### 10. Motion: 150–250ms state, 300–400ms sheet, decelerate-in
Both cited systems agree on the shape: short utility transitions 50–200ms, medium screen-traversing
250–400ms, and a FAB-expanding-to-sheet specifically **400ms with emphasized easing** `[cited: M3]`.
Our own register rule caps state motion at 150–250ms ease-out — keep it.
**Curves `[cited: M3]`:** standard `cubic-bezier(0.2, 0, 0, 1)`; emphasized-decelerate
`cubic-bezier(0.05, 0.7, 0.1, 1)` (use this for anything entering); emphasized-accelerate
`cubic-bezier(0.3, 0, 0.8, 0.15)` (exits).
**Build:** `Easing.bezier(0.05, 0.7, 0.1, 1)` in `withTiming`. Honour `AccessibilityInfo
.isReduceMotionEnabled()` → crossfade only (already our system's rule).

### 11. Tab switches crossfade; detail pushes. Never slide between tabs.
Sibling destinations are peers — a horizontal slide implies hierarchy that isn't there. 2026 native
behaviour: tab change = 100–150ms opacity crossfade with a 4–8px `translateY` rise on the incoming
screen; drilling into detail = the sheet (#6) or a push. `[inferred; consistent with M3 short2/short3]`
**Build:** Expo Router `Stack.Screen` `animation: 'fade'` for tabs; the sheet handles detail.

### 12. Single-action hero: halo, breath, and one honest line of state
A voice-recorder-shaped screen feels *empty* when the button floats in undifferentiated void, and
*premium* when the ground is structured around it. Three moves, in order of payoff:
(a) a **concentric halo** behind the button — 2–3 rings of `View` at increasing radius using
`halo-inner`/`halo-outer`, each 1px border or very low-alpha fill; the ground now has a centre.
(b) a **breathing** loop on the outermost ring only: `scale` 1.0→1.04, opacity 0.6→0.35, 2400ms,
`withRepeat(..., -1, true)`, ease-in-out `[inferred]`. One element breathes, not three.
(c) **state as one line**, 13px `muted`, directly under the button — "Hold near the mosquito · 5 s".
Then: a top row (small, `muted`) and the tab bar at the bottom frame the void into a composition.
Kill any paragraph on this screen.
**Dengar:** `index` (capture). This is the screen the video opens on.

---

## What makes UI look AI-generated — remove these
Consolidated from three 2026 write-ups `[cited]`; items marked ★ are ones Dengar is at risk of.

1. Purple/indigo→cyan gradient anywhere. ★ (also banned by our system)
2. Glassmorphism / frosted panels / blurred nav. ★
3. Coloured glows and coloured box-shadows.
4. Three-or-six identical feature cards in a row, icon on top, heading, two lines of body. ★
5. Coloured accent border on a card's top or left edge. ★ (explicitly banned in our system)
6. A badge/chip floating directly above the H1.
7. Centred hero headline in default Inter with a subtitle paragraph nobody reads. ★
8. Numbered 1-2-3 step sequences as a layout. ★ (`onboarding`, `roadmap/*`)
9. A stat banner row of three metrics with no source. ★ (and our numbers rule makes it worse)
10. Emoji used as icons or as data. ★
11. ALL-CAPS section labels above every block. ★
12. Dark-mode body text at mid-grey that barely clears contrast. ★
13. Bounce/scale on every single press.
14. Serif-italic accent word inside an otherwise sans headline.
15. Uniform 16px radius on literally every element (no radius hierarchy).
16. Text that explains the interface instead of the situation — the strongest tell of all. Real
    products state; placeholders describe. "Recording captures 5 seconds of audio which is then
    analysed" is placeholder. "5 s · nothing leaves the phone" is product.

---

## Numbers quick-reference

| Thing | Value | Status |
|---|---|---|
| Tab bar content height | 49pt (+ safe-area bottom; 83pt total on gesture nav) | cited |
| Bottom safe area, gesture iPhone | 34pt | cited |
| Min touch target | 44×44pt; 48dp preferred | cited |
| Sheet grabber | 56×6dp, r3; 1.3× scale / 0.6 alpha on drag | cited |
| Sheet detents | peek ~30%, full ~88% of screen height | inferred |
| M3 short1–4 | 50 / 100 / 150 / 200ms | cited |
| M3 medium1–4 | 250 / 300 / 350 / 400ms | cited |
| M3 long1–4 | 450 / 500 / 550 / 600ms | cited |
| Sheet open (FAB→sheet reference) | 400ms, emphasized | cited |
| Standard easing | `cubic-bezier(0.2, 0, 0, 1)` | cited |
| Emphasized decelerate / accelerate | `(0.05,0.7,0.1,1)` / `(0.3,0,0.8,0.15)` | cited |
| Graduated circle diameter | `dMin + (dMax−dMin)·√(v/vMax)` | formula cited |
| Overlapping symbol fill | 50–70% opacity | cited |
| Airbnb-family radii | ~8 buttons, 12–20 cards, full pill on search | cited (community-observed) |
| Type ratio | ~1.2, fixed px scale | our design-system.md |

---

## Sources actually fetched
- https://m3.material.io/styles/motion/easing-and-duration/tokens-specs — duration tokens + easing curves (via r.jina.ai)
- https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/ — bottom sheet as default container, four dark surface levels, thumb-zone claim
- https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it — the 16 AI-slop patterns
- https://smoothui.dev/blog/ai-design-slop, https://superdesign.dev/blog/how-to-make-ai-ui-look-less-generic, https://www.925studios.co/blog/ai-slop-design-tells — corroborating slop tells (search snippets only)
- https://superdesign.dev/blog/airbnb-design-system — Airbnb radii, mobile pill collapse, sticky bottom bar (search snippet)
- https://mobbin.com/glossary/bottom-sheet, https://mobbin.com/glossary/tab-bar — snap/detent + tab-bar guidance (**403 on direct fetch; snippet only**)
- https://github.com/jonikay89/BottomShelfer-android — grabber 56×6dp/r3, 1.3× scale, 0.6 alpha
- https://developer.apple.com/design/human-interface-guidelines/tab-bars, .../layout — 49pt bar, 34pt home indicator, 44pt target (search snippet)
- https://gisgeography.com/dot-distribution-graduated-symbols-proportional-symbol-maps/, https://www.axismaps.com/guide/dot-density — area-not-diameter scaling, 50–70% overlap opacity
- https://lollypop.design/blog/2025/may/progressive-disclosure/, https://www.digia.tech/post/progressive-disclosure-mobile-ux/ — progressive disclosure on mobile (snippets)

**Not obtained:** YouTube transcripts. The installed `agent-reach` CLI on this machine exposes only
`setup/install/configure/doctor/uninstall/skill/format/transcribe/watch/version` — there is no
`search` subcommand, so no video could be located to transcribe. Everything above is text-sourced.
