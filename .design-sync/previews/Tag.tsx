import { Tag } from 'pitch-atlas'

const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

// A filter row of pitch families — the live Pitch Index treatment. The on-chip
// keys off aria-pressed, exactly as the product's GripViewer filters do.
export function Families() {
  return (
    <div className="rfx-panel" style={stage}>
      <Tag as="button" active>
        Fastball
      </Tag>
      <Tag as="button">Breaking</Tag>
      <Tag as="button">Offspeed</Tag>
      <Tag as="button">Lost pitches</Tag>
    </div>
  )
}

// A non-interactive family label with a status glyph kept as a direct flex child.
export function Labelled() {
  return (
    <div className="rfx-panel" style={stage}>
      <Tag glyph={<span aria-hidden="true">●</span>}>Four-seam</Tag>
      <Tag>Two-seam</Tag>
      <Tag>Cutter</Tag>
    </div>
  )
}
