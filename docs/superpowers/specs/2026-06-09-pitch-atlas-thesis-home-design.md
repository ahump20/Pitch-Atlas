# Pitch Atlas Thesis Home Design

## Goal

Ship a dedicated `/about` page that says why Pitch Atlas exists, who it sits beside, and what value it brings that the nearby baseball products do not. Keep a compact home-page doorway so first-time visitors can find the thesis without making the front door heavy.

## Load-Bearing Assumptions

- `/about` is the right surface for the full analysis. The home page should only tease the thesis and route visitors into it.
- The existing refractor design language stays. The change should read as Pitch Atlas, not a new brand pass.
- Claims stay qualitative unless sourced in the product data model. Competitor mentions are category-level and respectful; no adoption counts or market-leader claims.

## Selected Approach

Add a compact home-page section after the hero and before the provenance model:

- A left-side thesis: "A grip disappears faster than a box score."
- Three evidence-style rows: what survives in modern baseball, what gets lost, and what Pitch Atlas preserves.
- A direct link to `/about` and the Sources page.

Add a new `/about` page:

- What Pitch Atlas is.
- The nearby field: measurement dashboards, training labs, smart-ball systems, grip pages, and clips.
- The unique value: provenance as interface, variants without declaring one right answer, visible missingness, and grip-first archive structure.
- A useful-imperfection section that answers the wabi-sabi question without dressing rough edges up as decoration.
- Known, unknown, and open sections so weak claims cannot read as settled facts.

Also remove the public Blaze companion layer and footer toggle from the production shell. The dog was a personal texture layer, but it competes with the grip-first archive read and leaks the wrong brand cue into Pitch Atlas.

## UI Shape

The new home section and `/about` page use full-width page structure, not nested cards. They keep:

- `rfx-skick` eyebrow.
- Anton section heading with one holo word.
- Dark matte rows with source-like labels.
- Cyan for actions and provenance links.
- Uneven row rotation only on small stamped labels, preserving human texture without hurting scanability.

## Data And Safety

No new runtime data. No external competitor claims in the app. No medical, youth workload, or performance promise. The copy says what Pitch Atlas preserves and what it refuses to fake.

## Verification

Run:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run preview`

Then verify the rendered home page and `/about` locally. After merge/deploy, verify the live production URL shows the new `/about` page, the home doorway, and no public Blaze companion/toggle.
