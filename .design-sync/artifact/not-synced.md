## Not synced

The published system was re-synced from the site's code (ahump20/Pitch-Atlas); the commit and date are in `meta` of `tokens.json`. The site build is bundled for the artifact; publication and preview checks are separate steps. What this page cannot carry the way the site does:

- The foil, readable type foil, and ember gradients run longer than a token value holds, so they live in the bundled stylesheet rather than the token table. Use `var(--foil)` for material and rims, `var(--foil-type)` for clipped text, and `var(--ember)` for the 1/1. The historical `.is-gold` class and `gold` prop remain site-compatible names; there is no active `gold` token.
- Three tokens the site no longer reads stay listed for anything that still names them: `color-dim`, `ease-in`, `blur-2xl`.
- `.field-cream`, `.rfx-plate`, `.rfx-card` and `.scene-coal` re-tone tokens only inside their own elements. The table lists the top-level values, and each usage note says what changes on cream.
- `PitchSpecimenCard` streams its grip clip from the site's `/grips/` path, which a preview here cannot reach, so the previews show each clip's own poster frame instead of the loop.
- `BallStage` draws in 3D only where the browser has WebGL; elsewhere its card shows the `SeamSchematic` it falls back to.
- `bundle.js` is built as the site's development build, so the page loads React's development build beside it; the 3D renderer inside needs that pairing. One line differs from the converter's output: its stub for `scheduler`, which the 3D renderer imports, points at the scheduler React runs on instead of throwing.
