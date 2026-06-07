# Pitch Atlas — Design Language (the continuity contract)

> One product, one read. This file is the rule set every page and component conforms to.
> When something on the site looks like it belongs to a different app, it's violating a
> rule here. Fix it to the rule, don't invent a new look.

The signature is the **holographic refractor**: a dark void field, a rainbow-foil
collectible-card aesthetic applied with restraint, athletic Anton type, and a strict
"the read lives on a matte plate, never on the patterned foil" discipline. Foil is
decoration; the numbers are sourced. ("Sourced, not corrected.")

Reference implementation: `src/components/refractor/RefractorCard.tsx` + the `rfx-*`
layer in `src/index.css` (lines ~338–717). Those are canon. Everything else conforms.

---

## 0. The state we're migrating from

The site is **already dark-only**. `RootLayout` wraps the app in `.rfx-void`, and a
sitewide `:root` cream→void remap (`src/index.css:679`) recolors every legacy Heritage
Tailwind utility (`bg-paper`, `text-ink`, `text-navy`, `text-seam`, `.mono-label`,
`.hairline`, provenance badges) onto the void. So surface color is NOT the problem.

The problem is **DNA fragmentation** — the same kind of content wears a different skin
per route:

| Tell | Heritage (retire) | Refractor (canon) |
|---|---|---|
| Headings | `.display` / Newsreader serif | `.rfx-stitle` / `.rfx-banner` / Anton |
| Cards | flat `bg-paper` plate, `border-l-navy`, corner ticks | `.rfx-card` foil / `.rfx-entry` row |
| Eyebrows | bare `.mono-label` | `.rfx-skick` (cyan rule + label) |
| Community | `.rfx-community` cream-token remap band-aid | real refractor surfaces |

The cream→void remap is a **transitional crutch**. It keeps un-migrated utilities
readable. As components move to `rfx-*` it becomes dead weight — leave it until the last
heritage component is gone, then delete it. Do not add new dependencies on it.

---

## 1. Surface

- **Void only.** `--color-void` (#070509) is the field, via `.rfx-void` at the root. No
  page sets its own light background. No `.bg-paper` as an intentional choice (only as a
  remapped legacy leftover, on its way out).
- Atmosphere: `.rfx-dotgrid` (page-level dot field), `.grain-overlay` (film grain). Both
  are fixed, pointer-none, reduced-motion-aware. Don't stack new background washes.
- Raised surfaces: `.rfx-panel` (matte press surface + bone hairline) or `.rfx-panel-foil`
  (1px foil edge wrapping a `#0a0810` inner). Cards use their own `.rfx-card` chrome.

## 2. Type

Three families, one job each. **Newsreader serif is retired from headings and titles.**

| Role | Family | Class / token |
|---|---|---|
| Hero / section / card titles | **Anton** (athletic) | `.rfx-athletic`, `.rfx-stitle`, `.rfx-banner`, `--font-athletic` |
| Body, prose, card reads | **Hanken Grotesk** | `--font-prose` (default `body`) |
| Labels, tags, source badges, eyebrows, stat labels | **Martian Mono** | `--font-mono`, `.mono-label`, `.rfx-skick` |

- Anton headings skew (`transform: skewX(-5deg)` via `.rfx-stitle`) and may carry a holo
  accent word (`.rfx-holo`) — use the holo on at most one word per heading.
- `.display` (Newsreader) is allowed in exactly one place: long-form **editorial
  pull-quotes** inside chapter prose, where the serif is the deliberate "voice." It is
  NOT allowed for a heading, a card name, a hall title, a hero, or a tool label.
- Body prose default is Hanken via `body`. Don't set serif on prose.

## 3. Color & accent

- Text: `--color-bone` (#F6F1E6 primary), `--color-bone-2` (#C2C7D6 secondary),
  `--color-ink-3` (#7C8294 muted). On the void only.
- **Cyan is the interactive accent.** `--color-cyan` (#37D6FF): eyebrows, links, focus
  rings, active chips/segments, nav. If it's clickable or focusable, cyan marks it.
- **Seam-bright** (`--color-seam-bright` #FF2D44): the leather seam, the "force"/velocity
  emphasis, and the banned/lost tier. A graphic red, never body text.
- **Foil** (`--foil`) = showcase decoration only (card edges, the diamond mark, one-word
  holo). **Gold** (`--gold`) = the 1/1 chase treatment (`.is-gold`), used sparingly for a
  truly singular specimen.
- **Family accents** drive per-pitch color. Cards take an accent triad `--c1/--c2/--c3`
  (see `accentForSlug` / `FAMILY_ACCENT`); rows take a single `--gc`. Always derive the
  accent from the pitch family — never hardcode a one-off color.
- **Provenance dots** (status, not accents): `--color-ok-bright` (official),
  `--color-amber-bright` (reputable analysis), `--color-sand-bright` (secondhand/approx).

## 4. The card family — tiered, one DNA

Every card-like surface is one of three tiers. They share DNA: dark matte field, an
accent/foil edge, an Anton title, mono labels, a family signal, and a provenance signal.
A row is not a different species from a card — it's the same card at lower density.

- **Tier A — Showcase card** (`RefractorCard`, `.rfx-card`, 5:7 foil). The signature
  artifact. Used for: home `SpecimenSet`, the Pitch Index **Cards view**, featured grids.
  Full chrome: arched window face (Austin grip clip/photo or seam ball), banner nameplate,
  matte content plate with the one headline number, family crumb, grip-source chip,
  confidence dot. Tilt + reveal. Drive everything from props/data.
- **Tier B — Plate** (the re-skin target for `IndexCard`, `CraftsmanCard`,
  `LostPitchCard`, Learn `WingCard`). Mid-density: NOT a 5:7 trading card, but unmistakably
  the same family. Required DNA:
  - dark matte field (`var(--color-press)` / `rgba(5,7,12,.84)`), not `bg-paper`
  - a **left foil/accent edge** keyed to `--gc` (family accent), seam-bright when the item
    is banned/edge/legend (mirror the `.rfx-entry.is-filed` gold treatment for filed)
  - **Anton title** (`.rfx-stitle` or `font-athletic`), bone — never `.display`/serif/navy
  - **mono labels** for the eyebrow/meta line, a `.rfx-statpill` or `StatusBadge` for status
  - an "Open →" affordance in cyan (`text-cyan`) that warms on hover
  - corner ticks allowed but in `rgba(255,255,255,.12)`, not `border-navy/30`
- **Tier C — Row** (`.rfx-entry`, existing). Dense directory listing, the Pitch Index
  **Rows view** default. Family accent via `--gc`, filed = gold edge, hover lift.

There is exactly **one** `RefractorCard`. The duplicate `SpecimenCard` in
`src/pages/PitchIndexPage.tsx` is retired — fold any better idea into `RefractorCard`.

## 5. Eyebrows, controls, chrome

- **Eyebrow:** `.rfx-skick` everywhere (cyan label + leading rule). Retire bare
  `.mono-label` used AS a section eyebrow. (`.mono-label` stays fine for micro-tags and
  source badges inside a card.)
- **Inputs/filters/toggles:** `.rfx-input` (text), `.rfx-chip` (filter, `aria-pressed`),
  `.rfx-select` (native select reseat), `.rfx-seg` (segmented/view toggle). No raw
  browser-default light controls anywhere.
- **Section title:** `.rfx-stitle`, optionally one `.rfx-holo` word.
- **Hero:** one system. `SectionHero` (refractor-styled) on content pages; the home gets
  the featured holographic treatment in Phase 4. No third hero pattern.
- **Shared chrome** (`Masthead`, `SiteFooter`, `Breadcrumb`): one link hover state (cyan),
  mono labels, consistent across every route.

## 6. Motion

- `Reveal` (scroll-in) + `useRefractorTilt` (pointer tilt on cards) only. The dissolve
  ball is the home hero's one signature motion.
- Everything respects `prefers-reduced-motion` — already wired in `index.css` (reveals
  show instantly, foil/tilt freeze, grip clips fall back to the poster still). Any new
  motion MUST honor it.

## 7. Four-state data surfaces

Every tool/data surface (`/sandbox`, `/movement-map`, `/compare`, `/kinetic-chain`,
`/classify`, `/grips`) explicitly handles **loading / error / empty / populated**. No bare
spinner, no blank grid, no `undefined`/`NaN`/`[object Object]` in served HTML.

---

## Worked example — the template every Tier-B re-skin follows

`src/components/index/IndexCard.tsx`, `RepertoireCard`, today (Heritage):

```tsx
<Link className="... border-l-2 bg-paper p-5 border-l-navy border-navy/15 hover:border-l-seam hover:bg-paper-2/40">
  <span className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-navy/30" />
  <h3 className="display text-2xl text-navy">{entry.name}</h3>        {/* serif + navy */}
  <p className="mono-label text-ink-3">aka …</p>
  <p className="text-ink/90">{entry.movement.value}</p>
  <span className="mono-label text-navy">Filed · full specimen</span>
  <span className="mono-label text-seam group-hover:text-navy">Open →</span>
</Link>
```

The same card, conformed (Tier-B plate):

```tsx
<Link
  className="rfx-plate group ..."          /* dark matte field + left accent edge via --gc */
  style={{ '--gc': accentForSlug(entry.id).c3 }}
>
  <h3 className="font-athletic text-2xl uppercase text-bone">{entry.name}</h3>  {/* Anton */}
  <p className="mono-label text-ink-3">aka …</p>
  <p className="text-bone-2">{entry.movement.value}</p>
  <StatusBadge status={entry.status} />     {/* or .rfx-statpill, tier-colored */}
  <span className="mono-label text-cyan transition-colors group-hover:text-bone">Open →</span>
</Link>
```

Net change per card: serif→Anton title, navy→family-accent edge, `bg-paper`→matte field,
seam→cyan affordance, ticks recolored. Same content, same density, one family.

> Add a `.rfx-plate` component class to `index.css` (the Tier-B primitive: matte field +
> `--gc` left edge + filed/edge variants) so all four card re-skins share one source of
> truth instead of each reimplementing the chrome.

---

## Verification gate (done = visitor-verified on the live URL)

1. **Type:** zero `.display`/Newsreader on any heading, card name, hall title, hero, or
   tool label (grep `className="display` / `text-navy` in headings → none in those roles).
2. **Cards:** every card-like surface is Tier A/B/C; no `bg-paper`-plate look; no duplicate
   `SpecimenCard`.
3. **Eyebrows/controls:** `.rfx-skick` eyebrows; `.rfx-*` controls; no light browser controls.
4. **No band-aids regress:** community sections off `.rfx-community`; no new cream→void
   dependencies.
5. **Four-state + no failure signatures** in served HTML.
6. **Tour at desktop (3-up) and true 320px** (headless): one hero, one card family, Anton
   headings, no leftover serif/navy-plate islands.
7. `npm run typecheck` clean · `npm run test` green · `npm run build` prerenders all routes.
