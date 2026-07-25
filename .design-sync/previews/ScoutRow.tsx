import { ScoutRow } from 'pitch-atlas'

// One sourced fact per row on the scout-file back: a mono key column and a value
// column. A run of rows is wrapped in the product's .rfx-scout container; when a
// row carries a tier, the provenance dot trails its value. Reads are qualitative
// shape language only — no velocity, spin, or break figures.
const stage = {
  padding: '24px 26px',
}

const scout = {
  width: '100%',
  maxWidth: '380px',
}

// A four-seam scout file: the family fact, the shape and read carrying their
// source tiers, and the grip cue.
export function ScoutFile() {
  return (
    <div className="rfx-panel" style={stage}>
      <div className="rfx-scout" style={scout}>
        <ScoutRow label="Family">Fastball</ScoutRow>
        <ScoutRow label="Shape" tier="reputable">
          Rides at the top of the zone
        </ScoutRow>
        <ScoutRow label="Read" tier="secondhand">
          Hitters keep swinging under it
        </ScoutRow>
        <ScoutRow label="Grip">Across the wide horseshoe</ScoutRow>
        <ScoutRow label="Source" tier="official">
          Statcast
        </ScoutRow>
      </div>
    </div>
  )
}

// The same row treatment carrying each source tier in turn, so the dot colors
// read from official down to the honest unverified gap.
export function Tiers() {
  return (
    <div className="rfx-panel" style={stage}>
      <div className="rfx-scout" style={scout}>
        <ScoutRow label="Shape" tier="official">
          Backspin carry
        </ScoutRow>
        <ScoutRow label="Slot" tier="reputable">
          Over the top, fingers behind
        </ScoutRow>
        <ScoutRow label="Cue" tier="secondhand">
          Let it sling off the pads
        </ScoutRow>
        <ScoutRow label="Spacing" tier="unverified">
          A finger-width apart
        </ScoutRow>
      </div>
    </div>
  )
}
