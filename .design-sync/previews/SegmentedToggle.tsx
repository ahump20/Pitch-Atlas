import { useState } from 'react'
import { SegmentedToggle } from 'pitch-atlas'

const panel = { padding: '22px 24px', display: 'grid', gap: '10px', maxWidth: '420px' }
const microLabel = {
  fontFamily: 'Martian Mono, monospace',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--color-bone-3)',
}

// The view switch on a specimen page. Controlled; the on-segment carries the
// cyan accent fill via aria-pressed.
export function ViewSwitch() {
  const [view, setView] = useState('grip')
  return (
    <div className="rfx-panel" style={panel}>
      <div style={microLabel}>View</div>
      <SegmentedToggle
        options={[
          { value: 'grip', label: 'Grip' },
          { value: 'shape', label: 'Shape' },
          { value: 'provenance', label: 'Provenance' },
        ]}
        value={view}
        onChange={setView}
      />
    </div>
  )
}

// Filtering the index by family.
export function Families() {
  const [family, setFamily] = useState('fastball')
  return (
    <div className="rfx-panel" style={panel}>
      <div style={microLabel}>Family</div>
      <SegmentedToggle
        options={[
          { value: 'fastball', label: 'Fastball' },
          { value: 'breaking', label: 'Breaking' },
          { value: 'offspeed', label: 'Offspeed' },
        ]}
        value={family}
        onChange={setFamily}
      />
    </div>
  )
}
