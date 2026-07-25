import { Hairline } from 'pitch-atlas'

const microLabel = {
  fontFamily: 'Martian Mono, monospace',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--color-bone-3)',
}
const body = { color: 'var(--color-bone-2)', lineHeight: 1.5, maxWidth: '46ch' }

// The instrument-plate rule dividing two tiers of a specimen file — grip above,
// shape below. The bone-fade `stage` variant is the one tuned for the dark panel.
export function Divider() {
  return (
    <div className="rfx-panel" style={{ padding: '22px 24px', display: 'grid', gap: '14px' }}>
      <div style={microLabel}>Grip</div>
      <div style={body}>Held across the wide horseshoe, two fingers along the seam.</div>
      <Hairline stage />
      <div style={microLabel}>Shape</div>
      <div style={body}>Backspin carries it true; it stays at the top of the zone.</div>
    </div>
  )
}

// Paired with a label, the rule fades to the right and grows to fill the track.
export function Labeled() {
  return (
    <div className="rfx-panel" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={microLabel}>Provenance</div>
      <Hairline stage style={{ flex: 1 }} />
    </div>
  )
}
