import { Kicker } from 'pitch-atlas'

// The mono section eyebrow with its short leading rule — cyan on the dark stage.
export function Eyebrows() {
  return (
    <div className="rfx-panel" style={{ padding: '22px 24px', display: 'grid', gap: '16px' }}>
      <Kicker>Filed specimen</Kicker>
      <Kicker>Lost pitches</Kicker>
      <Kicker>Provenance</Kicker>
    </div>
  )
}

// How it actually sits: an eyebrow above the specimen's display title and lede.
export function InContext() {
  return (
    <div className="rfx-panel" style={{ padding: '22px 24px', display: 'grid', gap: '8px' }}>
      <Kicker>Filed specimen</Kicker>
      <div style={{ fontFamily: 'Newsreader, serif', fontSize: '22px', color: 'var(--color-bone)' }}>Cutter</div>
      <div style={{ color: 'var(--color-bone-2)', lineHeight: 1.5, maxWidth: '46ch' }}>
        A fastball with a late, glancing tilt — held a touch off-center so it slips the barrel.
      </div>
    </div>
  )
}
