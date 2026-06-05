import type { Claim } from '../../data/types'
import { ConfidenceLabel } from './ConfidenceLabel'
import { SourceBadge } from './SourceBadge'
import { ClaimNote } from './SourcedValue'

/*
  A prose claim: the paraphrased sentence in Hanken, with its provenance line
  (confidence + source) beneath, and the caveat note when one exists. The text
  surface equivalent of SourcedValue, which handles numeric data.
*/
export function ClaimProse({
  claim,
  className = '',
  proseClassName = 'text-[1.0625rem] leading-relaxed text-ink/90',
}: {
  claim: Claim<string>
  className?: string
  proseClassName?: string
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className={`max-w-[64ch] ${proseClassName}`}>{claim.value}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
      {claim.note ? <ClaimNote>{claim.note}</ClaimNote> : null}
    </div>
  )
}
