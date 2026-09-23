import { Kicker, PITCHES, SeamSchematic } from 'pitch-atlas'

// The 2D twin of the 3D ball, drawn from the same seam-point function: a
// seam-informed schematic, static by design. Three of the site's own uses, each
// copied prop for prop.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
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

// The specimen page's grip panel without WebGL (src/components/grip/GripViewer.tsx):
// the four-seam held right-handed, the solved finger silhouettes laid on the
// seam, the pitch's own spin axis dashed through the ball.
export function HeldRightHanded() {
  const four = PITCHES[0]
  const gm = four.canonical.gripModel
  return (
    <section style={cell}>
      <Kicker>Signature</Kicker>
      <h2 className={heading}>SeamSchematic</h2>
      <div style={{ width: 280, height: 280 }}>
        <SeamSchematic
          className="h-full w-full"
          spinAxis={four.motion.spinAxis}
          gyro={four.motion.gyro}
          grip={gm.contacts}
          handedness="right"
          view={gm.defaultView}
          referenceContacts={gm.contacts}
          surface="stage"
          title={`A ${four.canonical.name} held right-handed: the solved finger silhouettes drawn on the seam schematic.`}
        />
      </div>
      <p style={{ marginTop: 16 }}>
        <code style={caption}>grip · surface=&quot;stage&quot;</code>
      </p>
    </section>
  )
}

// The same panel for the slider with the hand lifted: a gyro pitch, so its spin
// axis points at the viewer and reads as a dot, not a line.
export function GyroAxis() {
  const slider = bySlug('slider')
  const gm = slider.canonical.gripModel
  return (
    <section style={cell}>
      <div style={{ width: 280, height: 280 }}>
        <SeamSchematic
          className="h-full w-full"
          spinAxis={slider.motion.spinAxis}
          gyro={slider.motion.gyro}
          handedness="right"
          view={gm.defaultView}
          referenceContacts={gm.contacts}
          surface="stage"
          title={`A ${slider.canonical.name} held right-handed: the solved finger silhouettes drawn on the seam schematic.`}
        />
      </div>
      <p style={{ marginTop: 16 }}>
        <code style={caption}>gyro · the axis as a dot</code>
      </p>
    </section>
  )
}

// A chapter page's figure for a pitch with no filed seam geometry
// (src/pages/RepertoireChapter.tsx), on the cream field with its own caption:
// the bare cover, no axis, decorative (an empty title hides it from assistive tech).
export function CoverOnCream() {
  return (
    <section style={cell}>
      <figure className="field-cream rounded-lg bg-paper px-6 py-5" style={{ margin: 0, maxWidth: 320 }}>
        <div className="mx-auto w-52">
          <SeamSchematic className="h-full w-full" showAxis={false} showStitches title="" />
        </div>
        <figcaption className="mt-3 max-w-[34ch] text-xs leading-snug text-ink-3">
          Schematic baseball cover. This pitch has no filed seam geometry yet; the grip and shape
          below are sourced in words, not measured here.
        </figcaption>
      </figure>
    </section>
  )
}
