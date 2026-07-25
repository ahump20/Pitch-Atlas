import { BrandMark } from 'pitch-atlas'

// The brand lockup is drawn light-on-dark — a leather-edged diamond holding a
// cream ball whose seam reads as atlas meridians, beside the athletic wordmark.
// It sits on the real product panel so the drop-shadow and holo "Atlas" register.
const stage = {
  padding: '26px 28px',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '20px',
}

const column = {
  padding: '26px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '22px',
}

// The full lockup at hero scale: mark + "Pitch Atlas".
export function Lockup() {
  return (
    <div className="rfx-panel" style={stage}>
      <BrandMark size="lg" />
    </div>
  )
}

// The three registers: masthead (sm), default/footer (md), and the mark alone
// for tight spots where the wordmark would crowd.
export function Registers() {
  return (
    <div className="rfx-panel" style={column}>
      <BrandMark size="md" />
      <BrandMark size="sm" />
      <BrandMark size="md" wordmark={false} />
    </div>
  )
}
