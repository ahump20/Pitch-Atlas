"""Component guides for the page: a summary sentence, what the consumer provides,
when to reach for it, then Props (from the .d.ts) and an example drawn from the
verified preview. Written from the component source at main@4098cbd."""
import json, pathlib, re, sys

DS = pathlib.Path(__file__).resolve().parents[2] / 'ds-bundle'
OUT = pathlib.Path(sys.argv[1])

G = {
'Button': dict(group='Action', summary='The brand\'s action button: `chrome` for the primary action, `ghost`, the seam-red `foil` wax seal, `ink` for cream, or a quiet `link`.',
  body='''- `chrome` is the primary action: a matte dark face cut inside a 1px foil rim. The rim is what marks it primary, so use one per view.
- `ghost` is the secondary action; `link` is the quiet inline action in mono caps.
- `foil` is the seam-red wax-seal button. `ink` is its cream register and belongs only inside a `.field-cream` block.
- Pass `as="a"` (or a router link) with `href` for navigation; every native attribute passes through. `arrow` appends a decorative →.
- No disabled or invalid style ships for any variant.''',
  example='''<Button variant="chrome" arrow>Open the Pitch Index</Button>
<Button variant="ghost" arrow>Read the mission</Button>
<Button variant="link" arrow>Watch it flatten</Button>'''),
'BrandMark': dict(group='Brand', summary='The Pitch Atlas mark: the leather diamond around the seam-map ball, with the PITCH ATLAS wordmark beside it.',
  body='''- `size`: `sm` in the masthead, `md` by default and in the footer, `lg` in a hero.
- `wordmark={false}` leaves the mark alone, for tight spaces and app contexts.
- The mark is drawn in code. Never redraw it or recolor it; use this component.''',
  example='''<BrandMark size="lg" />
<BrandMark wordmark={false} />'''),
'DiamondMark': dict(group='Brand', summary='The diamond mark alone, at any pixel size; `gold` strikes the ember one-of-one face.',
  body='''- `size` is the square edge in px (48 by default); `label` is the glyph set upright inside (PA by default).
- `gold` renders the one-of-one face. The prop name is historical: the material is matte ember, never gold foil.
- Use it as a badge or favicon-scale mark; use `BrandMark` when the wordmark should read.''',
  example='''<DiamondMark size={48} />
<DiamondMark size={48} gold />'''),
'Kicker': dict(group='Labels', summary='The mono section eyebrow with its short leading rule: cyan on the void, leather ink on cream.',
  body='''- Put one above a section title or a specimen name. Write it in sentence case; the class sets it in uppercase.
- The color comes from the `kicker` token, so it re-tones itself inside `.field-cream`. To change the tone, pass a `text-*` class the stylesheet ships through `className`, as the site does with `text-cyan`; never pass a literal color.
- `rule` is reserved: the leading rule always draws.''',
  example='''<Kicker>Filed specimen</Kicker>'''),
'Stamp': dict(group='Labels', summary='The rarity-index ink stamp: blocky uppercase mono in a thin box, set a degree off square like a hand stamp.',
  body='''- Ink and box follow `currentColor`: set `color` on the stamp or a parent, for example `var(--color-cyan)` for a live state.
- Use it for a specimen number or a status, as the site does: Specimen 00, Source trail intact, Internal reference. Keep the words to two or three.''',
  example='''<Stamp>Specimen 00</Stamp>
<Stamp style={{ color: 'var(--color-cyan)' }}>Source trail intact</Stamp>'''),
'Tag': dict(group='Labels', summary='A filter chip or a family label: `active` presses it and `glyph` adds the family dot.',
  body='''- As a filter, render it `as="button"` with `onClick`; `active` maps to `aria-pressed` and fills it with `ctl-accent`.
- As a plain label, leave `active` unset and keep the default `span`.
- `glyph` is a decorative leading mark. Pass a sized element, not a bare character, and give the tag `inline-flex items-center gap-2` so the mark keeps its space, as the site's hand toggle does; mark it `aria-hidden`.''',
  example='''<Tag as="button" active={family === 'fastball'} onClick={() => setFamily('fastball')}>Fastball</Tag>
<Tag
  as="button"
  active={!showHand}
  onClick={() => setShowHand((s) => !s)}
  className="inline-flex items-center gap-2"
  glyph={<span aria-hidden="true" className="h-2 w-2 rounded-full bg-cyan" />}
>
  Lift the hand
</Tag>'''),
'Hairline': dict(group='Labels', summary='The instrument-plate rule that fades to the right: `stage` on the void, the default on cream.',
  body='''- Divide tiers of a file with it (grip above, shape below). It never boxes anything.
- `stage` draws the bone fade for the dark field; the default machined fade belongs inside `.field-cream`.''',
  example='''<Hairline stage />'''),
'SearchField': dict(group='Forms', summary='The Pitch Index search box, controlled through `value` and `onChange`, with Escape to clear.',
  body='''- Supply `value`, `onChange` and an `aria-label`; `onClear` runs when Escape is pressed on a non-empty field.
- The product's placeholder is "Search a pitch, an alias, a family…".''',
  example='''<SearchField
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery('')}
  placeholder="Search a pitch, an alias, a family…"
  aria-label="Search the Pitch Index"
/>'''),
'Input': dict(group='Forms', summary='A labelled text field on the control tokens, with a mono label wired to the input.',
  body='''- `label` renders a mono field label above the input and links it by id.
- Every native input attribute (`type`, `name`, `required`, `aria-*`) passes through.
- No invalid or disabled style ships yet.''',
  example='''<Input label="Contributor handle" placeholder="@you" />'''),
'SegmentedToggle': dict(group='Forms', summary='A segmented view switch with a controlled value, such as family, era or shape.',
  body='''- `options` takes plain strings or `{ value, label }` pairs; control it with `value` and `onChange`.
- The active segment fills with `ctl-accent` (cyan on the void).''',
  example='''<SegmentedToggle options={['family', 'era', 'shape']} value={view} onChange={setView} />'''),
'ConfidenceDot': dict(group='Provenance', summary='The provenance dot for one confidence tier, with the tier\'s words beside it by default.',
  body='''- `confidence` takes the full tier id (`official-data`, `reputable-analysis`, …). The color and wording come from `CONFIDENCE_META`.
- Keep `withLabel` on wherever the tier matters: color alone never carries it.''',
  example='''<ConfidenceDot confidence="official-data" />'''),
'SourceBadge': dict(group='Provenance', summary='A source credit: a tier\'s dot and wording, or the source\'s own name, with an optional approx pill.',
  body='''- `tier` takes the short names (`official`, `reputable`, `secondhand`, `unverified`, `pitcher-own-words`, `coach-observed`, `community-firsthand`).
- `label` shows the real source name in place of the tier wording. Take both from a real claim; never pair a tier with a source the record does not give it.
- `approximate` adds the approx pill for a real figure that is rounded or era-bound.''',
  example='''const grip = PITCHES[0].canonical.grip // reputable-analysis
<SourceBadge tier="reputable" label={grip.source.label} />'''),
'ScoutRow': dict(group='Provenance', summary='One sourced fact on a scout file: a mono label, the read, and its tier dot.',
  body='''- Wrap a run of rows in the `.rfx-scout` container.
- `tier` (`official`, `reputable`, `secondhand`, `unverified`) trails the value with its dot. Take it from the claim the value came from.''',
  example='''const four = PITCHES[0].canonical
<div className="rfx-scout">
  <ScoutRow label="Family">Fastball</ScoutRow>
  <ScoutRow label="Grip" tier="reputable">{four.grip.value}</ScoutRow>
</div>'''),
'Card': dict(group='Surface', summary='The lifted press panel on the void; `foil` gives it the grail-card foil edge.',
  body='''- Place content as direct children; padding is yours (the product uses `p-5`).
- `foil` wraps the panel in the 1px foil edge. Save it for the one object in a view that should shine.''',
  example='''<Card className="p-5">…</Card>
<Card foil className="p-5">…</Card>'''),
'PitchSpecimenCard': dict(group='Signature', summary='The signature trading card for one filed pitch, drawn from a real record in `PITCHES`.',
  body='''- `entry` must be a record from `PITCHES`; never hand-build one. `PITCHES[0]` (the four-seam, specimen 00) renders as the ember one-of-one.
- The card sizes itself from its container: give it a full-width block and cap it with `maxWidth` (340 in the gallery). A shrink-to-fit wrapper collapses it to a thumbnail.
- It links to its specimen, so render it inside `DsRouter`.
- The grip clip streams from the site's own `/grips/` path. Outside the site, pass `clipPresentation.sourceOverride` with an embedded poster, or the window shows the seam ball. A pitch with no first-party media always shows the seam ball, labeled a reference schematic.
- `foil` mounts the live WebGL foil; reserve it for a single hero card.''',
  example='''<DsRouter>
  <div style={{ maxWidth: 340 }}>
    <PitchSpecimenCard entry={PITCHES[0]} maxWidth={340} />
  </div>
</DsRouter>'''),
'BallStage': dict(group='Signature', summary='The 3D specimen: the procedural leather ball, the solved seam and the seated hand, turning on the pitch\'s own spin axis.',
  body='''- `entry` must be a record from `PITCHES`. Its `motion.spinAxis` sets the turn and its `canonical.gripModel` seats the hand when `grip` is on; the one unfiled pitch (the eephus) has no contacts to seat.
- Three presentations, one component: the hero (the defaults: turning, no hand), the grip study (`grip faceGrip autoSpin={false}`, drag to turn) and the card window (`interactive={false}`, `view="side"`, `distance={5.8}`).
- Give it a sized square box and `className="h-full w-full"`; it fills the box.
- `surface`: `stage` on the void, `paper` on the cream field.
- `vectors` draws the spin-axis and Magnus vectors (the physics presentation); no page mounts it today.
- The 3D canvas is decorative (`aria-hidden`). Name the pitch in the text beside it; only the SeamSchematic that stands in without WebGL carries an accessible title.''',
  example='''<div className="aspect-square" style={{ width: 320 }}>
  <BallStage entry={PITCHES[0]} grip faceGrip surface="stage" autoSpin={false} className="h-full w-full" />
</div>'''),
'SeamSchematic': dict(group='Signature', summary='The 2D twin of the 3D ball: a seam-informed schematic drawn from the same seam-point function, static by design.',
  body='''- Pass a record's `motion.spinAxis` and `motion.gyro` for its axis; a gyro pitch (the slider) reads as a dot, not a line.
- `grip` (a record's `canonical.gripModel.contacts`) draws the solved finger silhouettes the 3D hand sweeps; `view` turns the hold toward the viewer and `handedness` mirrors it.
- `surface`: `stage` on the void, `paper` on the cream field; the finger tone follows it.
- `title` is the accessible name. An empty string marks a decorative use and hides the drawing from assistive tech.
- Call it a seam-informed schematic, never seam-accurate.''',
  example='''const four = PITCHES[0]
<SeamSchematic
  spinAxis={four.motion.spinAxis}
  grip={four.canonical.gripModel.contacts}
  view={four.canonical.gripModel.defaultView}
  referenceContacts={four.canonical.gripModel.contacts}
  surface="stage"
  title={`A ${four.canonical.name} held right-handed: the solved finger silhouettes drawn on the seam schematic.`}
  className="h-full w-full"
/>'''),
'Select': dict(group='Primitives', summary='The Radix select, styled for the void: a trigger and a list that portals to the page body.',
  body='''- Compose it as stock Radix: `Select` › `SelectTrigger` › `SelectValue`, then `SelectContent` › `SelectItem`, with `SelectGroup`, `SelectLabel` and `SelectSeparator` for grouping.
- `position="popper"` drops the list below the trigger; the default item-aligned list covers it.''',
  example='''<Select defaultValue="breaking">
  <SelectTrigger aria-label="Pitch family"><SelectValue /></SelectTrigger>
  <SelectContent position="popper">
    <SelectItem value="fastball">Fastball</SelectItem>
    <SelectItem value="breaking">Breaking</SelectItem>
    <SelectItem value="offspeed">Offspeed</SelectItem>
    <SelectItem value="specialty">Specialty</SelectItem>
  </SelectContent>
</Select>'''),
'Dialog': dict(group='Primitives', summary='The Radix modal dialog, styled for the void.',
  body='''- Compose it as stock Radix: `DialogTrigger` (asChild around a `Button`), then `DialogContent` › `DialogHeader` › `DialogTitle` and `DialogDescription`, and a `DialogFooter` with `DialogClose`.
- The content portals to the page body and carries a close button unless `showCloseButton={false}`.''',
  example='''<Dialog>
  <DialogTrigger asChild><Button variant="ghost">Report</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Report this?</DialogTitle>
      <DialogDescription>Tell us briefly what is wrong. A few reports hide it for review.</DialogDescription>
    </DialogHeader>
    <Input label="Reason" placeholder="What is wrong?" />
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
      <Button variant="chrome">Submit report</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>'''),
'Tooltip': dict(group='Primitives', summary='The Radix tooltip, for a short gloss on a term or tier; it sits inside `TooltipProvider`.',
  body='''- Compose `TooltipProvider` › `Tooltip` › `TooltipTrigger` (asChild around the trigger) and `TooltipContent` (`side`, `sideOffset`).
- When it explains a confidence tier, quote `CONFIDENCE_META` rather than writing a gloss.''',
  example='''<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><button type="button">{CONFIDENCE_META['official-data'].label}</button></TooltipTrigger>
    <TooltipContent side="right">{CONFIDENCE_META['official-data'].meaning}</TooltipContent>
  </Tooltip>
</TooltipProvider>'''),
'Toaster': dict(group='Primitives', summary='The toast container: render it once, then call `toast()` to show a message.',
  body='''- Render one `<Toaster />` near the root; it stays empty until `toast()`, `toast.success()` or `toast.error()` fires (all on `window.PitchAtlas.toast`).
- The product's own messages: "Report sent" and "Report didn't send. Try again."''',
  example='''<Toaster />
toast.success('Report sent')'''),
}


# What each component does when it is touched, from src/index.css at main@4098cbd:
# trigger, feedback, timing token and reduced-motion behavior. "Not shipped" lines
# name where it falls short of the approved motion spec
# (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md).
INTERACTION = {
'Button': """- Hover (`chrome`, `ghost`): lifts 1px over `--pa-motion-tiny` on `--pa-ease-settle`; the sheen brightens over `--pa-motion-short`.
- Press (`chrome`, `ghost`): settles to 98% scale. Press (`foil`, `ink`): drops 1px to 98.5% with an inset shadow, pressed into the body.
- Hover (`foil`, `ink`): one foil sweep across the face over `--pa-motion-sweep`, a single pass that never loops.
- Keyboard focus: a 2px outline, bone on `chrome`, `ghost` and `link` (3px offset), seam red on `foil` and `ink` (4px offset, clear of the seal).
- `link` changes color over `--pa-motion-short`; nothing moves.
- `chrome`, `ghost`, `foil` and `ink` stand 41 to 42px tall, just under the site's 44px touch size; `link` is text height.
- Reduced motion: every change lands at once, and the sweep becomes a still sheen on hover.
- Not shipped: the disabled state.""",
'Tag': """- Color, fill and border change over `--pa-motion-short` on `--pa-ease-settle`.
- Pressed on (`aria-pressed="true"`), it settles once (`--pa-motion-short`) and stays still.
- Keyboard focus: a 2px `ctl-accent` outline, 2px offset.
- Chips are 30px tall, under the site's 44px touch size.
- Reduced motion: no settle; the new state shows at once.
- Not shipped: the disabled state.""",
'SegmentedToggle': """- The pressed segment (`aria-pressed`) fills with `ctl-accent`. Color and fill change over 0.2s and the key's shadow over 0.15s: raw values, not the motion tokens.
- Holding a segment down sinks it with an inset shadow.
- Keyboard focus uses the site-wide outline.
- Not shipped: a thumb that slides between segments; the fill switches in place.
- It takes no `aria-label` and draws no group, so a screen reader hears the segments without hearing what they choose between. Name the choice in visible text beside it.
- Segments are 34px tall, under the site's 44px touch size. On a phone a four-option toggle wraps its labels (\"A–Z\" splits across two lines).""",
'Input': """- Keyboard focus draws a 3px `ctl-accent` ring at 22% with a soft inner pool; border, shadow and fill change over 0.2s, a raw value rather than a token.
- Typing never animates.
- Not shipped: the invalid and disabled states.""",
'SearchField': """- Escape clears a non-empty field through `onClear`.
- The field is 44px tall, a comfortable touch target.
- Not shipped: a visible clear button, so only the keyboard clears it in one step; the focus expand. Its fill is a literal `#1D1710` in the component, not a token.""",
'Card': """- Still. Neither the panel nor its foil edge moves on hover; only the specimen card tilts.""",
'PitchSpecimenCard': """- Tilts toward the pointer while it moves, then eases back over 0.4s on `cubic-bezier(.2, .8, .2, 1)` when it leaves: a raw value and curve, not the tokens.
- Hover or keyboard focus slides the strip's arrow 2px; focus or press lights the banner rule.
- At rest it holds still: the stylesheet defines a 9s rake-light loop for a resting card, and a site-wide rule stops it, so the light moves only with the tilt.
- Reduced motion: no tilt, no entrance; the card shows its final state.""",
'ConfidenceDot': """- Still. A citation never animates.
- With `withLabel={false}` the tier shows by color alone; its meaning sits in a hover title that keyboard, touch and most screen readers never reach. Keep the label unless the tier is named right beside the dot.""",
'SourceBadge': """- Still. A citation never animates.""",
'ScoutRow': """- Still. A citation never animates.""",
'Select': """- Opens with a fade and a zoom up from 95%, sliding 2 units in from the side it opens on; closes in reverse. 100ms, the UI kit's default rather than the motion tokens.
- Options are 28px tall; arrow keys and typing move through them.
- Reduced motion: it opens and closes at once.""",
'Dialog': """- Opens with a fade and a zoom up from 95% over a dimmed page; closes in reverse. 100ms, the UI kit's default rather than the motion tokens.
- Focus moves into the dialog, stays inside it, and returns to the trigger on close; Escape closes it.
- The close button is 28px square, under the site's 44px touch size.
- Reduced motion: it opens and closes at once.""",
'Tooltip': """- Opens on hover or keyboard focus with a fade and a zoom up from 95%, sliding 2 units in from its side; closes in reverse, on the UI kit's default timing.
- A tap does not open it, so a reader on a phone never sees its text. Never put information only in a tooltip.
- Reduced motion: it appears and disappears at once.""",
'Toaster': """- A toast enters and leaves on the toast library's own motion; the product's success toast dismisses on its default timer.
- Reduced motion: it appears and leaves at once.""",
'BallStage': """- Drag turns the ball (orbit with damping; no zoom, no pan), repainting at full rate while the pointer moves.
- With `autoSpin` it turns on the pitch's own spin axis at about 0.55 radians (31 degrees) a second, repainting about 30 times a second; the time step is capped so it never jumps after a background pause.
- It paints nothing while scrolled off screen, and stops turning under reduced motion or when `autoSpin` is off.
- Until the first frame paints, and whenever WebGL is missing or the scene fails, the SeamSchematic stands in, so the window is never empty.""",
'SeamSchematic': """- Static by design: the 3D ball owns motion; the schematic holds still.""",
}

def dts_body(name):
    f = next(DS.glob(f'components/*/{name}/{name}.d.ts'))
    t = f.read_text()
    m = re.search(r'export interface \w+Props \{\n(.*?)\n\}', t, re.S)
    lines = m.group(1).split('\n')
    lines = [l if l.startswith('  ') else '  ' + l for l in lines]   # the first line lost its indent
    return lines, f

for name, g in G.items():
    body_lines, f = dts_body(name)
    props = 'interface %sProps {\n%s\n}' % (name, '\n'.join(body_lines))
    inter = f'\n\n## Interaction\n\n{INTERACTION[name]}' if name in INTERACTION else ''
    md = f'# {name}\n\n{g["summary"]}\n\n{g["body"]}{inter}\n\n## Props\n\n```ts\n{props}\n```\n\n## Example\n\n```jsx\n{g["example"]}\n```\n'
    d = OUT / 'components' / name
    d.mkdir(parents=True, exist_ok=True)
    (d / 'README.md').write_text(md)
    # the .d.ts with its indent fixed
    t = f.read_text()
    t = re.sub(r'(export interface \w+Props \{\n)(?!  )', r'\1  ', t)
    (d / f'{name}.d.ts').write_text(t)
json.dump({n: g['group'] for n, g in G.items()}, open(OUT.parent / 'groups.json', 'w'))
print('guides written:', len(G))
