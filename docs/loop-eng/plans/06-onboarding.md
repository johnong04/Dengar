# Slice 6 — onboarding + mic permission · gate: smoke · overnight-eligible: yes

Constraints: see v1-citizen-COMMON.md — read it first.

## Outcome
First-run stack, instrument register, no board reference (pattern-follows the system — design-system
conformance is the bar). Three beats + permission:

1. **The gap** — fogging chases 2–3 week-old case reports; the mosquito announces itself first.
   ("Dengue is heard before it's felt.")
2. **How this works** — encounter capture, told honestly: hold within 10 cm, the *Aedes* comes to
   you, 5 seconds, on-device. The 10cm truth is stated proudly up front, not hidden (specs.md §7
   logic: state the limit, then why it doesn't matter).
3. **Privacy** — audio analyzed on the phone, never uploaded; abstains delete the clip.
4. **Mic permission screen** — why the mic, then the OS prompt (web: getUserMedia; the native
   permission call arrives with the audio dep — the screen and flow are what ship tonight).
   Denied state: calm explanation + settings pointer, app still browsable.

Skippable after first run (store flag). Swipe/tap progression, quiet dot indicator.

## Acceptance (one line)
Fresh load routes through onboarding to capture; skip works; denied-permission state renders;
`npm run check` green.
