# Pitch Atlas Design System — conventions

Pitch Atlas is a grip-first atlas of baseball pitches — *"Preserving & Progressing
the Art of the Pitch."* The visual language runs **dark by default**: a cool
near-black void (`#070509`) the holographic foil is viewed on, bone-cream type,
and two hard-contrast voices — a neon **cyan** (interaction) and a **seam red**
(CTAs, the stitch, the force vector). Cream is a deliberate, scoped counterpoint
(card backs, cited inserts, print), never the page. Display type is an editorial
serif; prose is a humanist sans; every label, gauge, and source badge is mono.

These are the **real compiled product components** — the same code that ships on
pitch-atlas.com, rendering the app's own proven classes (`.v2-cta`, `.btn-foil`,
`.rfx-panel`, `.rfx-chip`, `.hairline`). This is a parity consolidation, not a
reskin: a design built from these maps 1:1 onto shippable code.

## Setup and wrapping

Components are real exports on `window.PitchAtlas.*`. Styling comes from the
global stylesheet, not a runtime theme provider — link `styles.css` once at the
root and components are styled. There is **no** ThemeProvider; the void is the
`:root` default. Two parts need a parent, exactly as in stock Radix: **Tooltip**
inside `TooltipProvider`; **Select / Dialog** compose their parts inside their
Root (`Select`+`SelectTrigger`+`SelectContent`+`SelectItem`; `Dialog`+`DialogTrigger`
+`DialogContent`+…), and their open surface portals to `<body>`.

## The styling idiom

Style components through their **props**, not by re-implementing classes. For your
own layout glue, use the semantic tokens — never hard-coded hex:

- surfaces: `var(--surface-page)` (the void), `var(--surface-card)` (`#221E18`
  charcoal panel), `var(--surface-cream)`
- text: `var(--color-bone)` / `--color-bone-2` / `--color-bone-3`
- voices: `var(--color-cyan)` (interaction), `var(--color-seam)` /
  `--color-seam-bright` (CTA, stitch)
- lines: `var(--hairline-void)`, `var(--border-card)`

Put any demo on a real surface so dark-native components read correctly: wrap it
in the `.rfx-panel` class (the charcoal card with a bone hairline) or the `Card`
component.

Variant vocabulary (use these exact values):

- `Button` — `variant`: `chrome` (the bone-lipped CTA) · `ghost` · `foil` (the
  wax-seal seam-red button) · `ink` · `link`; optional `arrow`
- `Card` — `foil` for the holographic grail-card edge
- `Tag` — `active` (a filter chip; maps to `aria-pressed`), optional `glyph`
- `SegmentedToggle` — `options` + controlled `value`/`onChange`
- `SourceBadge` / `ConfidenceDot` — `tier` / `confidence` from the provenance
  ladder: `official-data`, `pitcher-own-words`, `coach-observed`,
  `reputable-analysis`, `secondhand-attributed`, `community-firsthand`, `unverified`
- generic primitives (Radix composition): `Select`, `Dialog`, `Tooltip`, `Toaster`

Fonts (self-hosted, no network): **Newsreader** (editorial display serif — the
italic is the warmth), **Hanken Grotesk** (prose), **Martian Mono** (labels, data,
every micro-label), **Anton** (athletic logotype, uppercase).

## Motion

Use the shipped duration tokens and the one house easing — never a raw ms value:
`var(--pa-motion-tiny)` 120ms (press, focus, hover), `--pa-motion-short` 190ms
(state change, chip settle), `--pa-motion-medium` 400ms (positional move),
`--pa-motion-slow` 700ms (one-shot scroll reveal), all with
`var(--pa-ease-settle)`.

The rules are not stylistic preferences: motion supports orientation, feedback, or
state change and then **decays into stillness** — nothing loops. Animate transforms
and opacity only. Never animate long prose, and never animate a source badge or
confidence label in a way that hurts reading; provenance gets one settle on first
reveal and then rests. Always provide a `prefers-reduced-motion: reduce` branch
where the final state is visible immediately.

## Where the truth lives

- `styles.css` — the import closure (tokens + `_ds_bundle.css` component styles +
  self-hosted fonts). Read it before styling; it defines every token above.
- `components/<group>/<Name>/<Name>.prompt.md` and `<Name>.d.ts` — per-component
  usage and the prop contract.

## The one law that outranks the look

Pitch Atlas is **sourced, not corrected.** Every visible claim carries a `Source`
and a `confidence`; nothing is faked. Never fabricate a pitch figure (velocity,
spin, break), a grip, a count, or a source — render the provenance, not a guess.
No medical, injury, workload, or youth-training prescriptions.

## One idiomatic example

```tsx
import { Card, Kicker, Button, SourceBadge } from 'pitch-atlas'

export function FiledSpecimen() {
  return (
    <Card style={{ padding: 24, display: 'grid', gap: 10, maxWidth: 460 }}>
      <Kicker>Filed specimen</Kicker>
      <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: 'var(--color-bone)' }}>
        Four-seam fastball
      </h3>
      <p style={{ color: 'var(--color-bone-2)', lineHeight: 1.5 }}>
        Held across the wide horseshoe; backspin carries it at the top of the zone.
      </p>
      <SourceBadge tier="official" label="Statcast" />
      <Button variant="chrome" arrow style={{ marginTop: 8 }}>Open the specimen</Button>
    </Card>
  )
}
```
