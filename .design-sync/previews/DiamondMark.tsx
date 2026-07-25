import { DiamondMark } from 'pitch-atlas'

// The compact PA diamond device, rendered over the product's leather brand mark.
// The class tilts the diamond 45 degrees and counter-rotates the glyph upright,
// so it always sits on the charcoal panel where its bezel and pressed-foil edge
// can be read.
const stage = {
  padding: '26px 28px',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '24px',
}

// One device at three edge lengths: tight chip, default, and a larger seal.
export function Device() {
  return (
    <div className="rfx-panel" style={stage}>
      <DiamondMark size={32} />
      <DiamondMark size={48} />
      <DiamondMark size={64} />
    </div>
  )
}

// The standard face beside the gold 1/1 chase face — the grail register reserved
// for the four-seam struck at specimen 00.
export function Chase() {
  return (
    <div className="rfx-panel" style={stage}>
      <DiamondMark size={56} />
      <DiamondMark size={56} gold />
    </div>
  )
}
