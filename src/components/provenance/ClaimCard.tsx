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
  inside a scene. An optional thumb — a small square photo clipped to the card's
  right edge, a degree off-square like anything hand-filed — carries a REAL
  asset only; a card with no photo simply files without one.
*/
export function ClaimCard({
  claim,
  subject,
  to,
  thumb,
  className = '',
}: {
  claim: Claim<string>
  /** What the claim is about — a pitch, an arm, an entry. The card's top plate. */
  subject?: string
  /** Internal route to the subject's own page. */
  to?: string
  /** A small square visual clipped at the card's right edge. Real assets only. */
  thumb?: { src: string; alt: string }
  className?: string
}) {
  const filed = (
    <>
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
    </>
  )

  return (
    <div className={`claim-card ${className}`}>
      {thumb ? (
        <div className="flex items-start gap-3.5">
          <div className="flex min-w-0 flex-1 flex-col gap-2">{filed}</div>
          <img
            src={thumb.src}
            alt={thumb.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-16 w-16 flex-none rounded-[4px] border border-machined object-cover"
            style={{ transform: 'rotate(1.2deg)' }}
          />
        </div>
      ) : (
        filed
      )}
    </div>
  )
}
