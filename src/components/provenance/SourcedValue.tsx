import type { ReactNode } from 'react'
import type { Claim } from '../../data/types'
import { ConfidenceLabel } from './ConfidenceLabel'
import { SourceBadge } from './SourceBadge'

/** A muted prose note attached to a claim (caveats, disagreements, methodology). */
export function ClaimNote({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[62ch] text-[0.8125rem] leading-snug text-ink-2/85">{children}</p>
  )
}

/*
  The workhorse. Ties a value to its confidence and its source, and surfaces the
  note when there is one. `approximate` prefixes the value and tags it, so a
  rounded or era-dependent figure never looks measured. `accent` paints the one
  hero number seam-red; use it once.
*/
export function SourcedValue({
  claim,
  valueClassName = 'text-2xl',
  accent = false,
  showNote = true,
}: {
  claim: Claim<string>
  valueClassName?: string
  accent?: boolean
  showNote?: boolean
}) {
  const approx = claim.approximate === true
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={`font-mono tabular-nums leading-none ${accent ? 'text-seam' : 'text-ink'} ${valueClassName}`}
        >
          {approx ? '≈ ' : ''}
          {claim.value}
        </span>
        {approx ? <span className="mono-label">approx</span> : null}
      </div>
      <div className="chip-settle flex flex-wrap items-center gap-x-2 gap-y-1">
        <ConfidenceLabel confidence={claim.confidence} />
        {claim.source ? (
          <>
            <span aria-hidden="true" className="text-ink-3">
              /
            </span>
            <SourceBadge source={claim.source} />
          </>
        ) : null}
      </div>
      {showNote && claim.note ? <ClaimNote>{claim.note}</ClaimNote> : null}
    </div>
  )
}
