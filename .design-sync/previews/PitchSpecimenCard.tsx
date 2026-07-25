import { Component } from 'react'
import { PitchSpecimenCard } from 'pitch-atlas'

// One filed pitch, struck as a holographic refractor specimen. The card derives
// its grip clip, accent triad, collectible grade, and family crumb from the slug
// inside the bundle, so the entry only carries what the card reads directly: the
// sourced shape read (qualitative prose, never a fabricated number), the family,
// the finger placements, and the render motion. The four-seam is specimen 00 —
// the gold 1/1 chase.
const fourSeam = {
  display: {
    slug: 'four-seam',
    specimenNo: '00',
    shortName: 'Four-seam',
    heroSub: 'Read by feel, not by a gun.',
  },
  canonical: {
    family: 'fastball',
    // The card reads `canonical.gripDetails[0] ?? canonical.grip` for its cue and
    // confidence badge. Both are required — omitting gripDetails throws on
    // `undefined[0]` before the ?? can fall through, which is exactly what used to
    // send this cell into its error boundary. Prose is the real sourced four-seam
    // grip text (paraphrased from the cited reference), never invented.
    grip: {
      value:
        'Index and middle fingers laid across the seams at the open end of the horseshoe, the seam that faces away from the body. Thumb underneath on the leather. Held loose toward the fingertips.',
      confidence: 'reputable-analysis',
      approximate: false,
    },
    gripDetails: [
      {
        value:
          'Fingers cross the outward-facing horseshoe seam, pads resting where the two seams run closest together.',
        confidence: 'reputable-analysis',
        approximate: false,
      },
    ],
    fingerPlacement: [
      { seamT: 0.305, lift: 0.02, label: 'Index', finger: 'index', note: 'Across the seam at the open end of the horseshoe.' },
      { seamT: 0.355, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Beside the index, about a finger-width over.' },
      { seamT: 0.83, lift: 0, label: 'Thumb', finger: 'thumb', note: 'Underneath, on the leather, centered below the two fingers.' },
    ],
    physics: {
      shape: {
        value:
          'Rides through the top of the zone. Backspin fights the fall the whole way, so it drops less than a spinless ball and looks like it holds its line. It carries; it never literally rises.',
        confidence: 'reputable-analysis',
        approximate: false,
      },
    },
  },
  motion: {
    spinAxis: { x: 1, y: 0.12, z: 0 },
    gyro: false,
    forceLabel: 'Magnus',
    verticalShape: 'ride',
    horizontalDir: 'none',
    breakView: 'carry',
  },
}

const frame = {
  padding: '22px 24px',
  display: 'flex',
  justifyContent: 'center',
}

const note = {
  padding: '24px 26px',
  display: 'grid',
  gap: '10px',
  maxWidth: '360px',
}

// A last-resort boundary so one bad cell can never take down the card. Route
// context IS provided here — cfg.provider wraps every preview in DsRouter
// (MemoryRouter), bundled alongside the card so they share one react-router
// context. An earlier version of this fallback blamed a missing Router; that was
// wrong, and it masked a real crash (a preview entry missing canonical.grip*) as
// an expected limitation. The message below states only what is actually known,
// because a plausible-but-false explanation is worse than a blank cell.
class RouteSafe extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="rfx-panel" style={note}>
          <div
            style={{
              fontFamily: 'Martian Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-cyan)',
            }}
          >
            Preview failed to render
          </div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: '21px', color: 'var(--color-bone)' }}>
            PitchSpecimenCard
          </div>
          <div style={{ color: 'var(--color-bone-2)', lineHeight: 1.5 }}>
            This cell threw while rendering. That is a defect in this preview or the component, not
            an expected limitation — check the browser console on this card. The component itself is
            still importable from <code>window.PitchAtlas.PitchSpecimenCard</code>.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// The circle change is the card's OTHER face. It has no Austin clip or photo by
// design ("never implies he throws it"), so the window falls back to the seam ball
// carrying the pitch's real finger pins, labelled "Reference schematic". Showing
// both faces is the honest pair: the specimen with first-party media, and the
// specimen without. Fields are the real circle-change record.
const circleChange = {
  display: {
    slug: 'circle-change',
    specimenNo: '02',
    shortName: 'Circle change',
    heroSub: 'Fastball arm, a beat late.',
  },
  canonical: {
    family: 'offspeed',
    grip: {
      value:
        'The thumb and index finger form an OK circle against the inner side of the ball while the other three fingers lay across the top. The ball rests deeper in the hand, which deadens the exit, and the off-center grip tilts the axis toward the arm for fade.',
      confidence: 'official-data',
      approximate: false,
    },
    gripDetails: [
      {
        value:
          'MLB.com calls the circle change the most common changeup grip: thumb and index in a circle on the inner side, the other three fingers over the rest of the ball. Held farther back in the hand, sometimes toward the palm, which is what takes the speed off.',
        confidence: 'official-data',
        approximate: false,
      },
    ],
    fingerPlacement: [
      { seamT: 0.305, lift: 0.02, label: 'Index', finger: 'index', note: 'Over the top, with the thumb it forms the OK circle on the inner side.' },
      { seamT: 0.355, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Across the top, leading the three fingers that grip the ball.' },
      { seamT: 0.86, lift: 0, label: 'Thumb', finger: 'thumb', note: 'Curled to meet the index in a circle; the ball sits deeper in the hand.' },
    ],
    physics: {
      shape: {
        value:
          'Fastball arm speed with the ball held deeper in the hand. It arrives late and fades toward the throwing arm.',
        confidence: 'official-data',
        approximate: false,
      },
    },
  },
  motion: {
    spinAxis: { x: 0.62, y: 0.52, z: 0.59 },
    gyro: false,
    forceLabel: 'Magnus, arm-side',
    verticalShape: 'flat',
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },
}

// The four-seam specimen, gold chase, built from its real record fields.
export function FourSeam() {
  return (
    <div style={frame}>
      <RouteSafe>
        <PitchSpecimenCard entry={fourSeam} maxWidth={300} />
      </RouteSafe>
    </div>
  )
}

// The reference-schematic face: seam ball, real finger pins, no first-party media.
export function ReferenceSchematic() {
  return (
    <div style={frame}>
      <RouteSafe>
        <PitchSpecimenCard entry={circleChange} maxWidth={300} />
      </RouteSafe>
    </div>
  )
}
