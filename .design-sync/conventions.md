# Pitch Atlas Design System — conventions

Pitch Atlas preserves the heritage, history, and art of pitching: one place to
learn from trusted minds, discover creative voices, and talk about the craft. It
is a living museum of pitches, and the visual language runs **dark by default**:
a cool near-black void (`#070509`), bone-cream type, and a trading-card refractor
identity read on top of it.

The load-bearing material is the **rainbow foil** (`var(--foil)`), struck as
electric burnt chrome: graphite shoulders, burnt orange, a blown cream-white
highlight, powder ice, cyan and teal, steel, and a gold glint. It is the brand,
not a card-only effect: it clips into the ATLAS wordmark, filed-specimen names,
and a few load-bearing headings, and it forms the 1px rim that identifies the
primary CTA. It is the only metallic in the set. Do not flatten it to solid gold
or steel — that changes the brand system.

**Ember** (`var(--ember)`) is the separate 1/1 register: the one-of-one specimen
is the one card in the case that does not shine — matte warm-black lacquer with a
burnt-orange heat under the surface. Its class, prop, and shader keep their
historical `gold` names (`.is-gold`, `gold`), but the material is ember, never
gold and never a second metal. Foil and ember do not mix on one object.

Under those, two hard-contrast voices: an electric **cyan** (interaction and
wayfinding — active nav, toggles, source dots) and a **seam red** (the stitch, the
force vector, the foil button's wax-seal rim). Cream is a deliberate, scoped
counterpoint (card backs, cited inserts, print), never the page. Display type is
an editorial serif; prose is a humanist sans; every label, gauge, and source
badge is mono.

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

Three runtime values ship beside the components:

- `PITCHES` — the filed pitch records, exactly as the site reads them.
  `PitchSpecimenCard` takes one as `entry` (`PITCHES[0]` is the four-seam,
  specimen 00, which renders as the ember 1/1). Never hand-build an entry: a
  specimen the atlas never filed is a fabrication.
- `CONFIDENCE_META` — each confidence tier's `label` and one-line `meaning`, the
  product's single source of badge wording. Quote it when a design explains a
  tier; never write your own gloss.
- `toast` — fires into `<Toaster />` (`toast.success('Report sent')`, the
  product's own message). Render the Toaster once; it is an empty container
  until `toast()` is called.

## The styling idiom

Style components through their **props**, not by re-implementing classes. For your
own layout glue, use the semantic tokens — never hard-coded hex:

- surfaces: `var(--surface-page)` (the void), `var(--surface-card)` (`#221E18`
  charcoal panel), `var(--surface-cream)`
- text: `var(--color-bone)` / `--color-bone-2` / `--color-bone-3`
- voices: `var(--color-cyan)` (interaction), `var(--color-seam)` /
  `--color-seam-bright` (CTA, stitch)
- lines: `var(--hairline-void)`, `var(--border-card)`

Put any demo on a real surface so dark-native components read correctly: set it
on the void (`var(--surface-page)`), or wrap it in the `.rfx-panel` class (the
charcoal card with a bone hairline) or the `Card` component. Components drawn for
cream go on cream: `Button variant="ink"` and the default `Hairline` sit inside a
`.field-cream` swatch.

Variant vocabulary (use these exact values):

- `Button` — `variant`: `chrome` (the primary action: a matte dark face cut inside
  a 1px rainbow-foil rim — the spectrum is what marks it primary) · `ghost` ·
  `foil` (the wax-seal seam-red button) · `ink` (cream register) · `link`;
  optional `arrow`
- `Card` — `foil` for the holographic grail-card edge
- `DiamondMark` — `size` (px), `label`, and `gold` for the ember 1/1 face
- `Tag` — `active` (a filter chip; maps to `aria-pressed`), optional `glyph`
- `SegmentedToggle` — `options` + controlled `value`/`onChange`
- `SourceBadge` / `ConfidenceDot` — `tier` / `confidence` from the provenance
  ladder: `official-data`, `pitcher-own-words`, `coach-observed`,
  `reputable-analysis`, `secondhand-attributed`, `community-firsthand`, `unverified`
- `Hairline` — `stage` for the dark stage; the default fade is for the cream field
- generic primitives (Radix composition): `Select`, `Dialog`, `Tooltip`, `Toaster`

No component ships a disabled or invalid style yet (`.v2-cta`, `.btn-foil` and
`.rfx-input` define neither), so don't design those states as if they exist.

Fonts (self-hosted, no network): **Newsreader** (editorial display serif — the
italic is the warmth), **Hanken Grotesk** (prose), **Martian Mono** (labels, data,
every micro-label), **Anton** (athletic logotype, uppercase).

## Motion

Use the shipped duration tokens and the one house easing — never a raw ms value:
`var(--pa-motion-tiny)` 120ms (press, focus, hover), `--pa-motion-short` 190ms
(state change, chip settle), `--pa-motion-medium` 400ms (positional move),
`--pa-motion-slow` 700ms (one-shot scroll reveal), all with
`var(--pa-ease-settle)`.

`--pa-motion-sweep` (900ms) is the foil light pass, and it is the one duration a
component may run on its own schedule.

There are two motion classes here, and mixing them is the mistake to avoid.
**Interaction motion** — press, focus, state change, positional move, the scroll
reveal — supports orientation or feedback and then decays into stillness. It is
one-shot, it animates transforms and opacity only, and it never loops.

**Ambient material motion** is the exception, and it is deliberate: the rainbow
foil breathes. The wordmark's spectrum slides slowly, and the grain, the ambient
foil, and the card rake drift on long cycles. These loops are slow, low-contrast,
and non-informational — the surface behaving like foil under a moving light, not
an interface asking for attention. Do not add a fast or high-contrast loop, and
do not put a loop on anything a reader is trying to read.

Never animate long prose, and never animate a source badge or confidence label in
a way that hurts reading; provenance gets one settle on first reveal and then
rests. Every animation, ambient ones included, must collapse under
`prefers-reduced-motion: reduce` with the final state visible immediately, and
gradient-clipped type falls back to a solid system color under `forced-colors`.

## Where the truth lives

- `styles.css` — the import closure (tokens + `_ds_bundle.css` component styles +
  self-hosted fonts). Read it before styling; it defines every token above.
- `components/<group>/<Name>/<Name>.prompt.md` and `<Name>.d.ts` — per-component
  usage and the prop contract.

## Provenance is the infrastructure, not the headline

Every visible claim carries a `Source` and a `confidence`; nothing is faked. Never
fabricate a pitch figure (velocity, spin, break), a grip, a count, or a source —
render the provenance, not a guess, and use a real record from `PITCHES` wherever
a specimen appears. Provenance is how the atlas earns trust; it is not the
product's slogan, so don't put it forward as a tagline. No medical, injury,
workload, or youth-training prescriptions.

## One idiomatic example

A filed specimen on a card, every word from its record: the four-seam's own grip
claim, with the source and tier the record gives it.

```tsx
import { Card, Kicker, SourceBadge, Button, PITCHES } from 'pitch-atlas'

export function FiledSpecimen() {
  const four = PITCHES[0].canonical // the four-seam; its grip is reputable-analysis
  return (
    <Card style={{ padding: 24, display: 'grid', gap: 10, maxWidth: 460 }}>
      <Kicker>Filed specimen</Kicker>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-bone)' }}>
        {four.name}
      </h3>
      <p style={{ color: 'var(--color-bone-2)', lineHeight: 1.5 }}>{four.grip.value}</p>
      <SourceBadge tier="reputable" label={four.grip.source.label} />
      <Button variant="chrome" arrow style={{ marginTop: 8 }}>Open the specimen</Button>
    </Card>
  )
}
```

A specimen is always a real record:

```tsx
import { PitchSpecimenCard, PITCHES } from 'pitch-atlas'

<PitchSpecimenCard entry={PITCHES[0]} maxWidth={340} />
```
