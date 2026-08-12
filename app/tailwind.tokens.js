// Single source of truth for the palette and radius vocabulary.
// `tailwind.config.js` spreads this into the theme; `src/app/board/tokens.tsx` (the swatch probe)
// imports it directly so the probe can never drift from the config.
// docs/design/design-system.md §Tokens is the prose law and mirrors this file exactly.
//
// Warm citizen revision gated 2026-08-12 (design-system.md §Gate 2); hues refined in slice 11.
// Screens NEVER write a raw hex — src/app/board/* are frozen artifacts and are the only exception.

// ── dark ground (citizen) ────────────────────────────────────────────────────────
// Neutral near-black ground; the warmth lives in the ink and in the surfaces, so a
// tinted panel reads as warm LIGHT falling on a dark instrument, not coloured plastic.
const citizen = {
  bg: '#0B0C0E', // near-black ground, chroma 0
  surface: '#191817', // depth 1 — filled grouped surface (warm neutral)
  'surface-raised': '#232120', // depth 2 — footer rows, emphasised blocks
  line: '#2E2B29', // 1px hairlines, gauge tracks (warm)
  ink: '#F4EFE9', // warm ink — all prose and headlines
  muted: '#B5ABA1', // warm muted — labels, secondary prose (AA on bg + both depths)

  primary: '#4C9FE0', // signal blue — the one saturated control
  'primary-press': '#63AFE8', // pressed state of primary
  'halo-inner': '#152430', // instrument halo, inner ring
  'halo-outer': '#10171E', // instrument halo, outer ring

  // Tinted blocks. Opaque by construction: each value IS the composite over `bg`, so a
  // tint can never darken unexpectedly when it lands over another surface.
  'tint-guide': '#28211B', // guidance / instruction block ground (warm)
  'tint-guide-ink': '#FFDCC0', // prose on tint-guide — warm sand, not yellow
  'tint-guide-mono': '#C9B9AC', // mono spec line on tint-guide
  'tint-trust': '#182723', // privacy / "nothing kept" block + mic-ready chip
  'tint-trust-ink': '#93E3BC', // mono label on tint-trust (body prose uses `ink`)

  alert: '#FF5C49', // reserved: positive Aedes verdict only (citizen)
  ok: '#35B981', // clear / kept-nothing dot
  'ok-bright': '#7BE0AE', // small dots and marks on tint-trust
  caution: '#E8B44C', // sub-floor reading, gauge fill below threshold
  'warm-white': '#FFF3EC', // primary action ground on the drench (never pure white)
};

// ── verdict drench (positive Aedes result ONLY) ──────────────────────────────────
// The surface IS the verdict. from → to is a vertical gradient; the depth layers are
// deliberately translucent so they ride the gradient instead of banding against it.
const drench = {
  'verdict-aedes-from': '#9A2919', // gradient top
  'verdict-aedes': '#7E1B10', // flat fallback / gradient mid
  'verdict-aedes-to': '#4E0F08', // gradient bottom
  // #F6D2C9 (the board value) measured 4.51:1 at 12px on verdict-aedes-raised over the LIGHTEST
  // gradient stop — a 0.01 margin over AA. Lifted ~2% in lightness for real headroom (4.93:1).
  'verdict-aedes-soft': '#F8D9D1', // secondary text on the drench
  'verdict-aedes-deep': '#5E120A', // text on warm-white (the primary action)
  'verdict-aedes-line': 'rgba(255,255,255,0.14)', // hairlines on the drench
  'verdict-aedes-raised': 'rgba(255,255,255,0.10)', // raised block on the drench
  'verdict-aedes-sunken': 'rgba(0,0,0,0.22)', // recessed block on the drench
  'verdict-aedes-track': 'rgba(0,0,0,0.28)', // confidence gauge track
};

// ── light ground (officer) ───────────────────────────────────────────────────────
// Cool, crisp, dense. Never mixed with the citizen palette on one screen. o-ok and
// o-caution are darkened from the v1 doc values so they clear AA on BOTH o-bg and o-surface.
const officer = {
  'o-bg': '#FFFFFF',
  'o-surface': '#F2F5F8',
  'o-line': '#DDE3EA',
  'o-ink': '#15181D',
  'o-muted': '#556170',
  'o-primary': '#1E56A0', // cobalt — actions
  'o-primary-wash': 'rgba(30,86,160,0.22)', // secondary data series (rainfall)
  'o-alert': '#C63A2B', // officer alert states
  'o-alert-ghost': 'rgba(198,58,43,0.06)', // hollow projection fills
  'o-ok': '#1A7B52',
  'o-caution': '#8A5F12',
};

module.exports = {
  citizen,
  drench,
  officer,
  colors: { ...citizen, ...drench, ...officer },
  // Citizen is soft (block 20), officer is crisp (card 10) — the radius itself carries
  // two-audience distinctness. One vocabulary per surface, never mixed.
  borderRadius: {
    chip: '12px',
    card: '10px',
    block: '20px',
    pill: '999px',
  },
};
