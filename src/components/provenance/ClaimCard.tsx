import { Link } from 'react-router-dom'
import type { Claim } from '../../data/types'
import { ConfidenceLabel } from './ConfidenceLabel'
import { SourceBadge } from './SourceBadge'

/*
  A claim filed as a physical index card: the subject plate (the pitch or entry
  the claim is about, linking to its page when one exists), the claim prose, the
  canonical confidence badge, the outbound source, and the caveat note when one
  exists. The card-density sibling of ClaimProse — same primitives, same
  CONFIDENCE_META vocabulary, never a parallel tier system. It rides the scene
  tokens, so the same card reads ink-on-cream on the field and bone-on-coal
  inside a scene.
*/
export function ClaimCard({
  claim,
  subject,
  to,
  className = '',
}: {
  claim: Claim<string>
  /** What the claim is about — a pitch, an arm, an entry. The card's top plate. */
  subject?: string
  /** Internal route to the subject's own page. */
  to?: string
  className?: string
}) {
  return (
    <div className={`claim-card ${className}`}>
      {subject ? (
        to ? (
          <Link
            to={to}
            className="mono-label w-fit underline decoration-ink-3/40 decoration-1 underline-offset-2 transition-colors hover:text-seam"
          >
            {subject} <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <p className="mono-label">{subject}</p>
        )
      ) : null}
      <p className="max-w-[58ch] text-[13.5px] leading-relaxed text-ink">{claim.value}</p>
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
      {claim.note ? (
        <p className="max-w-[58ch] border-l border-machined pl-3 text-[11px] leading-relaxed text-ink-3">
          {claim.note}
        </p>
      ) : null}
    </div>
  )
}
