import { Button } from 'pitch-atlas'

// Previews render on the void; a real .rfx-panel surface gives the dark-native
// components the charcoal stage + bone hairline they were drawn for.
const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

export function Registers() {
  return (
    <div className="rfx-panel" style={stage}>
      <Button variant="chrome">Study the grip</Button>
      <Button variant="foil">File the pitch</Button>
      <Button variant="ghost">Not now</Button>
      <Button variant="ink">Cite a source</Button>
      <Button variant="link">View provenance</Button>
    </div>
  )
}

export function WithArrow() {
  return (
    <div className="rfx-panel" style={stage}>
      <Button variant="chrome" arrow>
        Open the four-seam
      </Button>
      <Button variant="foil" arrow>
        Next specimen
      </Button>
    </div>
  )
}
