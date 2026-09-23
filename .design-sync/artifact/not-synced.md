## Not synced

This system was built from the site's code (ahump20/Pitch-Atlas, main at 4098cbd) by running the site's own build and bundling it whole, and every preview and the cover were rendered and checked. What this page cannot carry the way the site does:

- The foil and ember gradients run longer than a token value holds, so they live only in `components/bundle.css`. Use `var(--foil)` and `var(--ember)`.
- Four tokens the site no longer declares or reads stay listed for anything that still names them: `gold`, `color-dim`, `ease-in`, `blur-2xl`.
- `.field-cream`, `.rfx-plate`, `.rfx-card` and `.scene-coal` re-tone tokens only inside their own elements. The table lists the top-level values, and each usage note says what changes on cream.
- `PitchSpecimenCard` streams its grip clip from the site's `/grips/` path, which a preview here cannot reach, so the previews show each clip's own poster frame instead of the loop.
- `BallStage` draws in 3D only where the browser has WebGL; elsewhere its card shows the `SeamSchematic` it falls back to.
- `bundle.js` is built as the site's development build, so the page loads React's development build beside it; the 3D renderer inside needs that pairing. One line differs from the converter's output: its stub for `scheduler`, which the 3D renderer imports, points at the scheduler React runs on instead of throwing.
