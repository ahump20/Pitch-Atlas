import { SourceBadge } from 'pitch-atlas'

const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '18px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

// Every claim wears its provenance. The tier drives the dot color and the
// canonical wording; nothing here is invented.
export function Tiers() {
  return (
    <div className="rfx-panel" style={stage}>
      <SourceBadge tier="official" />
      <SourceBadge tier="reputable" />
      <SourceBadge tier="secondhand" />
      <SourceBadge tier="unverified" />
    </div>
  )
}

// A named source, and a real-but-rounded figure wearing the approx pill.
export function NamedAndApprox() {
  return (
    <div className="rfx-panel" style={stage}>
      <SourceBadge tier="official" label="Statcast 2024" />
      <SourceBadge tier="pitcher-own-words" label="Player interview" />
      <SourceBadge tier="reputable" label="FanGraphs" approximate />
    </div>
  )
}
