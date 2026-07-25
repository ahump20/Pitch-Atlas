import { Card, Kicker, SourceBadge } from 'pitch-atlas'

const pad = { padding: '24px', display: 'grid', gap: '10px' }
const wrap = { display: 'grid', gap: '20px' }

// The leather panel on the void — the surface every specimen sits on.
export function Leather() {
  return (
    <div style={wrap}>
      <Card style={pad}>
        <Kicker>Filed specimen</Kicker>
        <div style={{ fontFamily: 'Newsreader, serif', fontSize: '22px', color: 'var(--color-bone)' }}>
          Four-seam fastball
        </div>
        <div style={{ color: 'var(--color-bone-2)', lineHeight: 1.5, maxWidth: '46ch' }}>
          Held across the wide horseshoe; backspin carries it at the top of the zone.
        </div>
        <SourceBadge tier="official" label="Statcast" />
      </Card>
    </div>
  )
}

// The foil-edged register for the rare specimen — one bright gradient frame.
export function Foil() {
  return (
    <div style={wrap}>
      <Card foil style={pad}>
        <Kicker>Grail card</Kicker>
        <div style={{ fontFamily: 'Newsreader, serif', fontSize: '22px', color: 'var(--color-bone)' }}>
          The vanished screwball
        </div>
        <div style={{ color: 'var(--color-bone-2)', lineHeight: 1.5, maxWidth: '46ch' }}>
          A pitch the record remembers but few now throw — preserved in the lost-pitches wing.
        </div>
      </Card>
    </div>
  )
}
