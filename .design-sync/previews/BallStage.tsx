import { BallStage, Kicker, PITCHES } from 'pitch-atlas'

// The 3D specimen at two of the site's own mounts, each copied prop for prop.
// It needs WebGL: without it, while the scene loads, or if the scene throws, it
// shows the SeamSchematic drawn from the same seam function, so the window is
// never empty.
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

// Grip compare (src/components/sections/GripCompare.tsx), its figure as the site
// sizes it, filling the column: the hand seated and faced to the camera, turning on the pitch's own spin axis. The turn is the
// default (autoSpin); it repaints about 30 times a second and stops under
// reduced motion or once the panel scrolls away.
export function Turning() {
  const four = PITCHES[0]
  return (
    <section style={cell}>
      <Kicker>Signature</Kicker>
      <h2 className={heading}>BallStage</h2>
      <figure className="rfx-panel aspect-square overflow-hidden rounded-sm" style={{ margin: 0 }}>
        <BallStage
          entry={four}
          grip
          faceGrip
          view={four.canonical.gripModel.defaultView}
          handedness="right"
          className="h-full w-full"
        />
      </figure>
      <p style={{ marginTop: 16 }}>
        <code style={caption}>grip · faceGrip · autoSpin (default)</code>
      </p>
    </section>
  )
}

// The specimen page's grip panel (src/components/grip/GripViewer.tsx), in its own
// box (square, up to 480px): faced for study and held still on the stage
// surface. Drag to turn it.
export function FacedForStudy() {
  const curve = bySlug('twelve-six')
  return (
    <section style={cell}>
      <div className="relative mx-auto aspect-square w-full max-w-[480px] rounded-[20px]">
        <BallStage
          entry={curve}
          grip
          view={curve.canonical.gripModel.defaultView}
          handedness="right"
          surface="stage"
          faceGrip
          autoSpin={false}
          className="h-full w-full"
        />
      </div>
      <p style={{ marginTop: 16 }}>
        <code style={caption}>grip · faceGrip · autoSpin={'{false}'} · drag to turn</code>
      </p>
    </section>
  )
}
