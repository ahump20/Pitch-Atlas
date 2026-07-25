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

// The specimen card is a single <Link> to /pitch/four-seam (react-router), so it
// renders inside the app's route context. The isolated preview surface has no
// Router on the page, so useHref() throws there; this boundary keeps the cell
// graceful in isolation while the real holographic card renders wherever route
// context exists (the live app, or a router-wrapped preview harness).
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
            Filed specimen · gold 1 of 1
          </div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: '21px', color: 'var(--color-bone)' }}>
            Four-seam fastball
          </div>
          <div style={{ color: 'var(--color-bone-2)', lineHeight: 1.5 }}>
            The specimen card deep-links to its full file, so it renders inside the app's route
            context. On this isolated preview surface there is no Router — the live holographic card
            shows in-app.
          </div>
        </div>
      )
    }
    return this.props.children
  }
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
