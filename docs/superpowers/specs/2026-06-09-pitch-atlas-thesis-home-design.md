# Pitch Atlas Thesis Home Design

## Goal

Make the live home page say why Pitch Atlas exists before it asks a visitor to browse tools. The visitor should understand the gap: modern baseball has measurement dashboards, grip videos, paid pitch-design services, and scattered how-to pages, but almost no durable archive where a pitch starts with the hand, carries its source label, and leaves room for credible variants.

## Load-Bearing Assumptions

- The home page is the right surface. This is first-impression positioning, not a buried explainer.
- The existing refractor design language stays. The change should read as Pitch Atlas, not a new brand pass.
- Claims stay qualitative unless sourced in the product data model. No competitor names, adoption counts, or implied market-leader claims in visitor copy.

## Selected Approach

Add a compact home-page section after the hero and before the provenance model:

- A left-side thesis: "A grip disappears faster than a box score."
- Three evidence-style rows: what survives in modern baseball, what gets lost, and what Pitch Atlas preserves.
- A direct link into the Pitch Index and the Sources page.

Also remove the public Blaze companion layer and footer toggle from the production shell. The dog was a personal texture layer, but it competes with the grip-first archive read and leaks the wrong brand cue into Pitch Atlas.

## UI Shape

The new section uses full-width page structure, not a nested card. It keeps:

- `rfx-skick` eyebrow.
- Anton section heading with one holo word.
- Dark matte rows with source-like labels.
- Cyan for actions and provenance links.
- Uneven row rotation only on small stamped labels, preserving wabi-sabi without hurting scanability.

## Data And Safety

No new runtime data. No external competitor claims in the app. No medical, youth workload, or performance promise. The copy says what Pitch Atlas preserves and what it refuses to fake.

## Verification

Run:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run preview`

Then verify the rendered home page locally and, after merge/deploy, verify the live production URL shows the new thesis section and no public Blaze companion/toggle.
