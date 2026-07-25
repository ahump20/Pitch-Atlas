import { ConfidenceDot } from 'pitch-atlas'

// Every claim on the void wears its provenance as a glowing dot. The seven tiers
// are the one canonical source-tier model; the dot reads its color and wording
// from CONFIDENCE_META, so nothing here is invented. Shown on the product panel.
const ladder = {
  padding: '24px 26px',
  display: 'grid',
  gap: '13px',
  justifyItems: 'start',
}

const inline = {
  padding: '24px 26px',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '22px',
}

// The full provenance ladder, strongest source at the top down to the honest gap.
export function Ladder() {
  return (
    <div className="rfx-panel" style={ladder}>
      <ConfidenceDot confidence="official-data" />
      <ConfidenceDot confidence="pitcher-own-words" />
      <ConfidenceDot confidence="coach-observed" />
      <ConfidenceDot confidence="reputable-analysis" />
      <ConfidenceDot confidence="secondhand-attributed" />
      <ConfidenceDot confidence="community-firsthand" />
      <ConfidenceDot confidence="unverified" />
    </div>
  )
}

// The bare dot, label suppressed — for tight rows where the color alone carries
// the tier and the wording lives in a nearby legend.
export function Bare() {
  return (
    <div className="rfx-panel" style={inline}>
      <ConfidenceDot confidence="official-data" withLabel={false} />
      <ConfidenceDot confidence="reputable-analysis" withLabel={false} />
      <ConfidenceDot confidence="unverified" withLabel={false} />
    </div>
  )
}
