import { Kicker, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'pitch-atlas'

// The Radix select, shown open over its trigger with one family chosen. Its list
// portals to <body>; the cell is tall enough to hold it.
const cell = {
  background: 'var(--surface-page)',
  color: 'var(--color-bone)',
  padding: '28px',
  minHeight: '100vh',
  boxSizing: 'border-box',
}
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

export function PitchFamily() {
  return (
    <section style={cell}>
      <Kicker>Primitives</Kicker>
      <h2 className={heading}>Select</h2>
      <Select defaultValue="breaking" defaultOpen>
        <SelectTrigger aria-label="Pitch family" style={{ width: '240px' }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="fastball">Fastball</SelectItem>
          <SelectItem value="breaking">Breaking</SelectItem>
          <SelectItem value="offspeed">Offspeed</SelectItem>
          <SelectItem value="specialty">Specialty</SelectItem>
        </SelectContent>
      </Select>
    </section>
  )
}
