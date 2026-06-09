# Wabi Sabi Motion

Pitch Atlas motion should feel like a field manual coming alive at the edge of the page, not a product trying to entertain the reader.

## Motion Tokens

- tiny: 90ms to 140ms
- short: 160ms to 220ms
- medium: 320ms to 480ms
- slow: 700ms to 1100ms
- easing: soft out, no rubbery overshoot except a tiny Blaze body settle
- max decorative movement: small enough that paragraphs, charts, cards, and source labels remain the read

## Rules

- Motion supports orientation, action feedback, or state change.
- Motion decays into stillness. No endless high-frequency loops.
- Never animate long paragraphs while they are being read.
- Never animate safety, legal, privacy, report, block, delete-account, or source-citation content in a way that reduces trust.
- Respect `prefers-reduced-motion` on web and `UIAccessibility.isReduceMotionEnabled` / SwiftUI reduced-motion environment on iOS.
- Use transforms and opacity. Avoid changing layout, filters, and shadows every frame.
- Blaze must disappear near source-heavy or footer-heavy scroll positions instead of covering source labels or controls.

## Companion Micro-Interactions

- Route props: Blaze carries a page-native mark, not a generic mascot badge. Home uses a home plate, pitch detail uses a mound, repertoire detail uses a scorecard, craftsmen uses a rosin bag, and tool routes use a chalk-talk mark.
- Scroll chase: the baseball moves first and Blaze follows with damped inertia. The body gets only small hop, tilt, and squash changes.
- Pat interaction: tapping Blaze gives one bark bubble and one short body hop. Browser audio is generated locally and may be skipped when audio is blocked.
- Source/provenance stamp: one tiny opacity/scale settle when first revealed. No repeat.
- Pitch cards: keep existing reveal and refractor tilt; add no extra Blaze motion inside card content.
- Filter/search chips: selected chips may settle like a paper tab, short duration only.
- Empty states: Blaze may sniff once, then rest.
- Upload progress: only show a rolling baseball when real upload progress is available.
- Success: one catch or belly-roll reaction, then idle.
- Error: one ear dip or ball drop. Retry remains the primary action.
- System notices: hide Blaze instead of lifting him over update prompts, offline notices, toasts, source labels, or controls.
- Serious flows: hide Blaze or hold one still frame outside the work area.

## Do Not Animate

- Long prose
- Medical, youth-safety, privacy, legal, and account-deletion text
- Report/block/delete confirmation surfaces
- Source citations in a way that hurts readability
- Form typing, except existing focus states
- Fake progress, fake freshness, fake badges, fake stats, or fake community activity
