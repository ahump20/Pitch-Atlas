import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from 'pitch-atlas'

// Each provenance tier explains itself on hover. The mono label is the trigger;
// at rest the card shows just that label, which is the point.
const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '18px',
  flexWrap: 'wrap',
  alignItems: 'center',
}
const tierLabel = {
  fontFamily: 'Martian Mono, monospace',
  fontSize: '12px',
  letterSpacing: '0.06em',
  color: 'var(--color-cyan)',
  background: 'transparent',
  border: 0,
  padding: 0,
  cursor: 'help',
  textDecoration: 'underline dotted',
  textUnderlineOffset: '4px',
}

// The top tier: explain what "official-data" actually certifies.
export function ProvenanceTier() {
  return (
    <div className="rfx-panel" style={stage}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button style={tierLabel}>official-data</button>
          </TooltipTrigger>
          <TooltipContent>
            Measured and published by a tracking system — the highest tier in the atlas.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

// The honest floor: a claim no source corroborates is shown, but flagged.
export function Unverified() {
  return (
    <div className="rfx-panel" style={stage}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button style={tierLabel}>unverified</button>
          </TooltipTrigger>
          <TooltipContent>
            No source corroborates this yet. It carries a note and stays labeled.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
