import {
  CONFIDENCE_META,
  Kicker,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'pitch-atlas'

// A provenance tier explained on hover: the trigger is the tier's own label and
// the tip its one-line meaning, both from CONFIDENCE_META, the product's only
// wording for them.
const cell = {
  background: 'var(--surface-page)',
  color: 'var(--color-bone)',
  padding: '28px',
  minHeight: '100vh',
  boxSizing: 'border-box',
}
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'
const tier = {
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

export function ProvenanceTier() {
  return (
    <section style={cell}>
      <Kicker>Primitives</Kicker>
      <h2 className={heading}>Tooltip</h2>
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button" style={tier}>
              {CONFIDENCE_META['official-data'].label}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{CONFIDENCE_META['official-data'].meaning}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </section>
  )
}
