Pitch Atlas preserves the heritage, history, and art of pitching—one place to learn from trusted minds, discover creative voices, and talk about the craft. The site calls itself the living museum of pitching craft, and its tagline is "The pitch, in your hand." The components here are the real compiled product code that ships on pitch-atlas.com, so a design built from them maps one to one onto shippable code.

## Content fundamentals

- Lead with the grip a hand can hold. A specimen opens on the fingers, the seam and the pressure, and spin, axis and flight sit behind a disclosure. Write "two fingertips laid across the seam", not "maximizes Magnus lift".
- Write plainly and specifically, in the second person when the copy instructs. From the site: "Open the Pitch Index", "Read the mission", "Watch it flatten", "Report this?", "Tell us briefly what is wrong. A few reports hide it for review.", "Report sent". "We" is Pitch Atlas and "you" is the reader.
- Write sentence case in the source. Button and link labels, headings and toasts are sentence case, and proper names keep their capitals ("Pitch Index"). Mono labels and Anton titles are uppercased by their classes (`.mono-label`, `.rfx-skick`, `.rfx-stitle`), so write them in sentence case and let the CSS set the capitals.
- Every visible claim carries a source and a confidence tier (`official-data`, `pitcher-own-words`, `coach-observed`, `reputable-analysis`, `secondhand-attributed`, `community-firsthand`, `unverified`). Show the tier; never write a tagline about provenance.
- Never fill a gap with a number: no invented velocity, spin, break, grip, count or source. A pitch that is not measured says so plainly. Use a real record from `PITCHES` wherever a specimen appears.
- Give no medical, injury, workload or youth-training advice, in product copy or in anything a design suggests.
- Call the seam diagram and the ball a "seam-informed schematic", never "seam-accurate".
- Use no emoji.

## Visual foundations

### Surface

- Set every page on `color-void` (#070509). There is no light mode and no ThemeProvider; the void is the `:root` default.
- Raise content on `color-press` (#221e18, warm charcoal) edged in bone at 10%; the `Card` component and the `.rfx-panel` class draw both. Quieter raised bands sit on `color-paper-2` (#0e0b15), usually edged in `ink` at 15%.
- Cream is an exception, never a whole page. The site's stylesheet calls `.field-cream` an exception scope for surfaces that must stay cream and expects near-zero use: today only the site's own design-system showcase opts in, and the cream pieces visitors see set their own hex (the stats plate on a specimen card, for one). Inside `.field-cream`, `color-paper` turns #f4eee0 and `color-paper-2` #eae2d2, and `Button variant="ink"` belongs there.

### Color

Every value below is what pitch-atlas.com paints, read in a browser against the build at the commit the token table's `meta.ref` names, on its `meta.synced` date. The site is dark: the void and the panels on it carry nearly everything.

| Ground | Primary text | Secondary text | Muted text |
| --- | --- | --- | --- |
| Open page, #070509 | #f6f1e6, 18.0:1 | #c2c7d6, 12.0:1, or warm #c9c2b0, 11.4:1 | #7c8294, 5.3:1 |
| Panels and plates, #221e18 | #f6f1e6, 14.7:1 | #c9c2b0, 9.3:1 | #969080, 5.2:1 |
| Inside `.field-cream`, #f4eee0 | #14161b, 15.6:1 | #3f4654, 8.2:1 | #5c6473, 5.2:1 |

- The `ink` names (`color-ink`, `color-ink-2`, `color-ink-3`) follow the ground and give each row of the table. `color-bone` (#f6f1e6) and `color-bone-2` (#c9c2b0) hold their value everywhere, so they read only on dark grounds.
- The open page carries two secondary grays today: cool `color-ink-2` #c2c7d6 and warm `color-bone-2` #c9c2b0.
- `color-bone-3` (#969080) is the muted ink on panels and plates (5.2:1 on `color-press`): source links on a press panel print in it, and `color-ink-3` resolves to the same hex inside `.rfx-panel` and its kin. `color-ink-3` on a press panel without that scope is #7c8294 at 4.3:1, too faint for small type, so reach for `bone-3` there.
- `color-cyan` #5fe0ea is the interaction color on the void (12.9:1): inline links, active chips and segments, the `ring` on fields and the Radix primitives, and the section `kicker`. `ctl-border` (cyan at 40%) and `ctl-accent` are its control forms, and an active chip sets its label in `ctl-on-accent` #06121b (12.0:1).

These names change value inside `.field-cream`; everything else holds.

| Name | On the void | Inside `.field-cream` |
| --- | --- | --- |
| `color-seam` | #ff2d44 | #c8102e |
| `ring` | #5fe0ea | #1f6e78 |
| `ctl-accent`, `ctl-on-accent` | #5fe0ea, #06121b | #c8102e, #ffffff |
| `kicker` | #5fe0ea | #7a4a2e |
| `color-machined`, the hairline | #d8d1c0 at 20% | #5c6473 at 38% |

- Panels and plates (`.rfx-panel`, `.rfx-plate`, `.rfx-entry` and their kin) pin `color-seam` back to #ff2d44 and the `ink` names to the bone values, even inside cream.
- Seam red marks the stitch. `color-seam-bright` is #ff2d44 on every ground; `color-seam` is the same #ff2d44 on the void (5.5:1) and #c8102e inside cream (5.1:1). Never set small text in #c8102e on the void (3.45:1).
- The site-wide focus outline is 2px of `color-seam` set 3px off the edge, so it reads #ff2d44 on the void and #c8102e on cream. States lists the controls that draw their own.
- The foil button's wax-seal rim is #c8102e at 55% over a dark fill and warms to #ff2d44 on hover. Red is also `destructive`: #ff2d44 on the void, #c8102e on cream.
- Burnt orange is one color, #bf5700, with no lighter shade. `primary` is the fill of the product's generic action button (the report dialog's submit, for one): #bf5700 with white ink (4.6:1) on every ground. It measures 4.4:1 on the void, so it paints fills, marks, borders and display type; small print that would take it goes bone instead. No component in this system draws with `primary`; the branded primary action is `Button variant="chrome"`, bone on a dark fill (16.3:1) inside the foil rim.
- A claim's tier shows as a dot beside the tier's words (`ConfidenceDot withLabel`, `SourceBadge`). Color alone never carries the tier; burnt orange and unverified red are hard to tell apart for red-green color-blind readers.

Three trust tiers, three colors. One map paints every dot on a dark ground (`ConfidenceDot`, the home card backs, the lost-pitches timeline); the cream stats plate on a specimen card prints the `-ink` forms, which hold contrast on cream.

| Tier | Claims | On dark (`color-tier-*`) | On the cream plate (`color-tier-*-ink`) |
| --- | --- | --- | --- |
| From the source | Official data, pitcher's own words, coach-observed | #bf5700, burnt orange, 4.4:1 | #bf5700, 3.6:1 |
| Relayed | Reputable analysis, secondhand (attributed), community (firsthand) | #8fbad6, powder blue, 9.8:1 | #3d6a8a, 4.6:1 |
| Unverified | Unverified | #ff2d44, red, 5.5:1 | #c8102e, 4.7:1 |

- The `confidence-*` names in the token table are aliases of the tier tokens; nothing on the site reads them by those names. The old per-claim dot colors (`color-ok-bright`, `color-amber-bright`) stay declared and unread.

Per-pitch color comes from the pitch family, never a one-off hex. Cards take an accent triad from the family; rows take one family accent.

| Family | Accent |
| --- | --- |
| Fastball | #bf5700, burnt orange |
| Offspeed | #d8cfbb, bone |
| Breaking | #5fe0ea, cyan |
| Specialty | #b9d4e5, powder ice |
| Banned | #ff4d46, seam red |

- The unfiled pitch pages print the same accent as the dot beside each sibling pitch; edge statuses (banned, alias, illusion, not a pitch) take the banned red.
- Some cards carry their own accent inside the family palette: the eephus card is warm white #ffe9de, the twelve-six curve powder blue #8fbad6, and the circle change bone #d8cfbb. No card, chart or grip step paints brass or gold.
- Two throwback frames break the family rule on purpose, on the home wall only: the twelve-six card wears a powder-blue road-uniform finish around its powder-blue accent, and the circle change a teal one around its bone accent. The teal frame's ramp and ring are turquoise #00b2a9 with red and white trim; `color-teal-glow` #1f97a2 is the site's teal token and the two-seam accent.
- The token table also lists names the site declares but never paints, and each one's note says so. The semantic aliases (`surface-*`, `text-fg*`, `cta-*`, `focus-ring`, `confidence-*`, `border-card`, `hairline-*`) are set once at the top of the page and read by nothing. Unlike the names above, `cta-bg`, `cta-bg-hover` and `focus-ring` keep their void values inside cream, and `cta-text` on `cta-bg` is white on #ff2d44, 3.7:1, under the 4.5:1 a button label needs.
- The shadcn `chart-*` and `sidebar-*` defaults are unread too.

### Material: foil and ember

- The foil (`var(--foil)`) is the brand's only metallic, cast in what the site's stylesheet calls Electric Burnt Chrome: graphite shoulders, burnt orange, a blown cream-white highlight, powder ice, cyan and teal, steel, and burnt orange again where the ramp turns back to graphite; there is no gold or brass stop. It clips into the ATLAS wordmark, filed-specimen names and a few major headings (one foil word per heading at most), and it is the 1px rim that marks the chrome primary button. Never flatten it to solid gold or steel, and never set body text in it.
- Ember (`var(--ember)`) marks the one-of-one: the single specimen in the case that does not shine, matte warm-black lacquer with burnt-orange heat under the surface. `PitchSpecimenCard` shows it on specimen 00, the four-seam. Its class, prop and shader keep the historical name `gold` (`.is-gold`, `DiamondMark gold`), but the material is ember. Foil and ember never share an object. The old `gold` gradient token is retired from the product.

### Type

- Four families, one job each: `display` (Newsreader, the editorial serif; its italic carries the warmth) for titles, specimen names and pull quotes; `prose` (Hanken Grotesk) for body copy and reads; `mono` (Martian Mono) for every label, gauge, stat and source badge; `athletic` (Anton) for the logotype and scoreboard section titles only.
- Micro-labels use the `atlas-label` style: Martian Mono at 11px, line height 1, `tracking-label` (0.18em), uppercase. The section eyebrow (`Kicker`) is the same face at weight 500 and 0.2em.
- Display headings sit tight (`.display` tracks at -0.012em); the product's own gallery sets them at clamp(22px, 3vw, 30px), line height 1.25. Anton titles (`.rfx-stitle`) run uppercase at line height 0.98, tightening to 0.92 from 768px, and a sheared Anton wordmark reads as the brand where a flat one reads generic. The loudest display setting is the home headline (`.archive-case-title`): Newsreader at clamp(52px, 6.8vw, 98px), line height 0.98, tracked -0.052em, its second line in italic at #d0ae82; the cover borrows that tracking.
- For body sizes use the `type-*` scale (`type-sm` for secondary copy, `type-base` for reads); these are the text steps the components use.
- Every face the site loads ships here as a Latin file: Newsreader 400, 400 italic, 500, 600 and 600 italic; Hanken Grotesk 400, 400 italic, 500, 600 and 700; Martian Mono 400, 500 and 600; Anton 400. Set no other weight.

### Spacing, radius and layout

- Space on the 4px step (`spacing`, 0.25rem). Cap reading columns with the `container-*` widths; prose measures stay near 60 to 70 characters.
- Controls, panels and cards take `radius-sm`, `radius-md` or `radius-lg`: small corners, cut like card stock. Only chips and filter pills are fully rounded.
- Separate tiers with a hairline that fades to the right (`Hairline`, `.hairline`), never a full box. The default line draws `color-machined`, which follows the ground; `Hairline stage` is a fixed warm-bone fade (#f2ecdd at 22%) tuned for the dark stage. Panel edges are bone at 10%.

### Depth and texture

- Cards read as handled objects: matte stock and a cut shadow, never frosted glass or soft neumorphic blur.
- The atmosphere is one fixed film-grain layer and a dot field on the page, never a gradient mesh. Do not stack new background washes behind content.

### Motion

- Time motion with the five duration tokens and the one easing, never a raw millisecond value: `var(--pa-motion-tiny)` (120ms: press, focus, hover), `var(--pa-motion-short)` (190ms: a state change or chip settle), `var(--pa-motion-medium)` (400ms: a positional move or draw-in), `var(--pa-motion-slow)` (700ms: a one-shot scroll reveal) and `var(--pa-motion-sweep)` (900ms: the foil button's light pass on hover), all on `var(--pa-ease-settle)`. About a hundred older timings in the site's stylesheets are still raw numbers; do not copy them.
- Interaction motion is one-shot and settles into stillness. Color, border and shadow shift on hover and focus; anything that moves does it with transform and opacity. Nothing bounces; the one shake is a single settle on a form error (`.shake-in`).
- Nothing loops at rest. The stylesheet still defines slow ambient loops (the foil sliding through clipped type, the drifting void field, the breathing grain, the raking light on a resting card, the pulsing rim on the matte panels), and one site-wide rule stops all of them, so lighting holds its authored look at rest and moves only with interaction and scrolling. Do not design a drift, pulse or shimmer that runs on its own.
- Two indicators loop while work is under way: the spinner on a busy control (`.is-busy`) and the sweep across a loading placeholder (`.skel-stock`). A citation holds still: never animate a source badge or a confidence dot.
- `BallStage` turns the ball on the pitch's own spin axis, repainting about 30 times a second; it stops once scrolled off screen and holds still under reduced motion. A drag turns it by hand at full rate.
- `prefers-reduced-motion: reduce` collapses every transition and animation to its final state at once (one global rule); foil-clipped type falls back to a solid system color under `forced-colors`.

### States

- Focus is visible on every control (walked by keyboard on each card): a 2px outline in bone on the chrome, ghost and link buttons; in seam red, the site-wide rule, on the foil and ink buttons, the toggle and the tooltip trigger; in cyan on the filter chips and a specimen card; and a cyan ring on the text field, the search field and the Radix primitives.
- The site's touch size is 44px, and it applies under a touch pointer: the site grows its controls with `any-pointer-coarse` rules (a min height, or padding offset by an equal negative margin so the layout holds). Measured at 390px with touch emulation, every control on the main routes and in the open compare dialog (its close button included) is 44px or more, except the scout card back's source links (25px, the most a card's fixed face holds), the movement map's pitch dots (38px, the most their fan spacing allows without one dot's target covering its neighbour's; the 44px link row under the map opens the same pitches) and links inside a line of text, which WCAG exempts; select options carry the same rule. Under a mouse controls keep their drawn size (buttons 41 to 42px, toggle segments 34, filter chips 30, select options and the dialog's close button 28), all over the 24px floor. Give anything new the same coarse-pointer rule.
- A tooltip opens on hover or keyboard focus, never on a tap. Never put information only in one.
- Hover warms a link or button; active filter chips are pressed (`Tag active`, which sets `aria-pressed`).
- A link inside running text carries an underline (its own color at about 40%, full on hover), never color alone.
- No disabled or invalid style exists yet for the chrome button, the foil button or the text field (`.v2-cta`, `.btn-foil`, `.rfx-input`). Do not design those states as if they ship.

### Imagery

- The grip is the lesson; the celebrity is decoration. Grip images are first-party: the `grips` asset group holds the posters and stills of Austin's own grips (four-seam, two-seam, twelve-six, split-finger, three-finger change, football change).
- The `archive` group holds historical plates and studies for the lost-pitches wing; `atmosphere` holds the leather and seam textures; `brand` holds the favicon, app icons, seal and workbench images.
- Never use an unlicensed agency or photographer photo of an identifiable player, a team or league logo or mark, or a broadcast frame, and never imply that a player or league endorses Pitch Atlas.
- A specimen with no first-party grip media shows the seam ball carrying the pitch's finger pins, labeled a reference schematic. Never stand a stock photo in its place.

## Iconography

- Both marks are drawn in code: `BrandMark` (the leather diamond with the seam-map ball and the ATLAS wordmark) and `DiamondMark` (the diamond alone, `gold` for the ember one-of-one). Use them; never redraw either one.
- `assets/brand/favicon.svg`, `icon-512.png`, `apple-touch-icon.png` and `seal-128.webp` are the files for app and browser contexts.
- Interface icons are Lucide line icons at their default 2px stroke, in the text color: search, the compare tools (columns, check, swap, clear, remove), the forum and field-notes actions (flag, add image, reply, delete, retry) and the Radix select and toast glyphs. Sizes run from 12 to 20px by context and are not on a scale yet; match the nearest neighbor rather than adding a size.
- An icon beside text is `aria-hidden`. An icon-only button carries an `aria-label` ("Swap pitches", "Clear comparison", "Remove …") and needs a 44px target on touch; under a mouse the compare tray's remove button is 32 by 36px and the swap and clear buttons are 44px tall but narrower.
- The only decorative glyphs are the family dot (`●`, the `glyph` on `Tag`) and the arrow a `Button` draws with `arrow`.

## Components

- The signature medium is two components drawn from one seam function, the same function that drew this system's cover. Feed both from a `PITCHES` entry (`entry.motion.spinAxis`, `entry.canonical.gripModel`), never from made-up values, and call either one a seam-informed schematic, never seam-accurate. `BallStage` is the 3D specimen: the leather ball and its seam and, with `grip`, the hand and its contact labels. `faceGrip` turns the grip toward the viewer, `autoSpin` (on) turns the ball on the pitch's spin axis, `interactive` (on) lets a drag turn it, and `surface` is `paper` or `stage`. It fills the box it is given, so mount it in a square with `className="h-full w-full"`. Without WebGL, while the scene loads, or if it throws, it shows `SeamSchematic`, the flat drawing of the same seam, so the frame is never empty.
- Every component is a real export on `window.PitchAtlas`. Styling comes from the stylesheet (`components/bundle.css`), not a theme provider. Wrap a tree that contains `PitchSpecimenCard` in `DsRouter` (a memory router; the card links to its specimen). It does no harm around anything else.
- Style through props, and for layout glue use the `color-*` names the site paints with (see Color), never a hard-coded hex.
- Variants, exactly: `Button variant` is `chrome` (the primary action), `ghost`, `foil` (the seam-red wax-seal button), `ink` (cream only) or `link`, with an optional `arrow`; `Card foil` for the grail-card edge; `DiamondMark size` and `gold`; `Tag active` and `glyph`; `SegmentedToggle options` with a controlled `value` and `onChange`; `Hairline stage` for the dark stage (the default follows the ground).
- Provenance takes two spellings. `SourceBadge tier` and `ScoutRow tier` use the short names (`official`, `reputable`, `secondhand`, `unverified`, and for `SourceBadge` also `pitcher-own-words`, `coach-observed`, `community-firsthand`); `ConfidenceDot confidence` takes the full tier ids (`official-data`, `reputable-analysis`, `secondhand-attributed`, …).
- The generic primitives compose as stock Radix does: `Select` with `SelectTrigger`, `SelectValue`, `SelectContent` and `SelectItem`; `Dialog` with `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` and `DialogClose`; `Tooltip` inside a `TooltipProvider`, with `TooltipTrigger` and `TooltipContent`. Their open surfaces portal to `<body>`.
- Three runtime values ship beside the components. `PITCHES` is the list of filed pitch records the site reads; hand one to `PitchSpecimenCard` as `entry` (`PITCHES[0]` is the four-seam, specimen 00), and never build an entry by hand. `CONFIDENCE_META` holds each tier's `label` and one-line `meaning`, the product's only wording for them; quote it rather than writing a gloss. `toast` fires into a `<Toaster />` rendered once (`toast.success('Report sent')`).

A filed specimen on a card, every word from its record:

```tsx
const { Card, Kicker, SourceBadge, Button, PITCHES } = window.PitchAtlas
const four = PITCHES[0].canonical // the four-seam; its grip claim is reputable-analysis

<Card style={{ padding: 24, display: 'grid', gap: 10, maxWidth: 460 }}>
  <Kicker>Filed specimen</Kicker>
  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-bone)' }}>
    {four.name}
  </h3>
  <p style={{ color: 'var(--color-bone-2)', lineHeight: 1.5 }}>{four.grip.value}</p>
  <SourceBadge tier="reputable" label={four.grip.source.label} />
  <Button variant="chrome" arrow>Open the specimen</Button>
</Card>
```

