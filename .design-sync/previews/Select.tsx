import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'pitch-atlas'

// Choosing how to file a pitch. The trigger renders closed with a real value
// already selected; the options stay sourced to the families the atlas uses.
const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  alignItems: 'center',
}
const field = { display: 'grid', gap: '8px' }
const mono = {
  fontFamily: 'Martian Mono, monospace',
  fontSize: '11px',
  letterSpacing: '0.06em',
  color: 'var(--color-bone-3)',
}

// Pick a family. Closed trigger shows the selected value.
export function PitchFamily() {
  return (
    <div className="rfx-panel" style={stage}>
      <div style={field}>
        <span style={mono}>PITCH FAMILY</span>
        <Select defaultValue="breaking">
          <SelectTrigger style={{ width: '220px' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fastball">Fastball</SelectItem>
            <SelectItem value="breaking">Breaking</SelectItem>
            <SelectItem value="offspeed">Offspeed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Narrow to a specimen. Closed trigger shows the selected pitch.
export function SpecificPitch() {
  return (
    <div className="rfx-panel" style={stage}>
      <div style={field}>
        <span style={mono}>SPECIMEN</span>
        <Select defaultValue="slider">
          <SelectTrigger style={{ width: '220px' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="four-seam">Four-seam fastball</SelectItem>
            <SelectItem value="slider">Slider</SelectItem>
            <SelectItem value="curveball">Curveball</SelectItem>
            <SelectItem value="changeup">Changeup</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
