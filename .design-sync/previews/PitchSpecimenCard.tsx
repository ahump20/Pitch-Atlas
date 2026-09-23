import { Kicker, PITCHES, PitchSpecimenCard } from 'pitch-atlas'
import fourSeamPoster from '../../public/grips/four-seam-grip-poster.webp'
import twoSeamPoster from '../../public/grips/two-seam-grip-poster.webp'

// The Signature section of the in-product gallery
// (src/pages/DesignSystemShowcase.tsx). Every card takes a REAL filed record from
// PITCHES, the same list the site reads. An earlier version hand-typed its entries;
// they broke the moment the record gained `canonical.gripModel`, and the card has
// no business showing a specimen the atlas never filed.
const stage = {
  background: 'var(--surface-page)',
  color: 'var(--color-bone)',
  padding: '28px',
}
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'
// Captions are code and keep the prop's own case: the site's .mono-label would
// upper-case `variant="chrome"` into a prop that does not exist.
const caption = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  letterSpacing: '0.02em',
  lineHeight: 1.5,
  color: 'var(--color-ink-3)',
}

const bySlug = (slug) => PITCHES.find((p) => p.display.slug === slug)

// A filed grip clip streams from the site's own /grips/ path, which no preview
// sandbox (or a design hosted anywhere else) can reach, so its window would open
// empty. The card's real `clipPresentation.sourceOverride` prop takes the file and
// poster together; this hands it the SAME clip with its poster embedded from the
// repo (public/grips/, compiled in as data), so the still is the clip's own frame
// and the loop still plays wherever /grips/ resolves. Alt text and in-points are
// the grip library's own (src/data/grips).
const clipFor = (name, poster, alt, start) => ({
  start,
  sourceOverride: { mp4: `/grips/${name}.mp4`, webm: `/grips/${name}.webm`, poster, alt },
})
const fourSeamClip = clipFor(
  'four-seam-grip',
  fourSeamPoster,
  "A looping close-up of Austin's four-seam grip: two fingertips laid across the seam, the ball held out toward the camera.",
  0.8,
)
const twoSeamClip = clipFor(
  'two-seam-grip',
  twoSeamPoster,
  "A looping close-up of Austin's two-seam grip: two fingers running along the narrow seams like train tracks.",
  0.6,
)

// Specimen 00, the four-seam: the 1/1 chase in its matte ember, exactly as the
// gallery shows it (PITCHES[0], 340 wide, no live WebGL foil). The card sizes
// itself from its container, so every wrapper here is a full-width block capped at
// 340px, as the gallery's is; a shrink-to-fit wrapper collapses it to a thumbnail.
export function OneOfOne() {
  return (
    <section style={stage}>
      <Kicker>Signature</Kicker>
      <h2 className={heading}>The specimen card</h2>
      <div className="max-w-[340px]">
        <PitchSpecimenCard entry={PITCHES[0]} maxWidth={340} foil={false} clipPresentation={fourSeamClip} />
      </div>
      <p style={{ marginTop: 16 }}>
        <code style={caption}>specimen 00 · the ember 1/1</code>
      </p>
    </section>
  )
}

// A standard refractor, specimen 01: the two-seam.
export function Standard() {
  return (
    <section style={stage}>
      <div className="max-w-[340px]">
        <PitchSpecimenCard entry={bySlug('two-seam')} maxWidth={340} foil={false} clipPresentation={twoSeamClip} />
      </div>
      <p style={{ marginTop: 16 }}>
        <code style={caption}>specimen 01 · refractor</code>
      </p>
    </section>
  )
}

// The circle change has no first-party grip media by design, so its window falls
// back to the seam ball carrying the pitch's real finger pins, labelled as a
// reference schematic. The card never implies media it does not have.
export function ReferenceSchematic() {
  return (
    <section style={stage}>
      <div className="max-w-[340px]">
        <PitchSpecimenCard entry={bySlug('circle-change')} maxWidth={340} foil={false} />
      </div>
      <p style={{ marginTop: 16 }}>
        <code style={caption}>specimen 02 · reference schematic</code>
      </p>
    </section>
  )
}
