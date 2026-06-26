import type { Claim, ClaimConfidence, Source } from '../../data/types'
import { CONFIDENCE_META } from '../../data/types'
import { CONFIDENCE_COLOR } from './refractorClaimMeta'

/*
  The provenance line, struck for the dark void. The cream-page primitives
  (ConfidenceLabel / SourceBadge / ClaimProse) encode confidence with a mono glyph
  on ink; here the same seven tiers read as a glowing dot in the card palette, the
  way the specimen cards and the landing ladder do. Same model, same labels, same
  "sourced, not corrected" — just tuned to bone-on-void. Foil is decoration; the
  readings are sourced.
*/

export function ConfidenceDot({
  confidence,
  withLabel = true,
  className = '',
}: {
  confidence: ClaimConfidence
  withLabel?: boolean
  className?: string
}) {
  const meta = CONFIDENCE_META[confidence]
  const color = CONFIDENCE_COLOR[confidence]
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 ${className}`}
      title={meta.meaning}
    >
      <i className="rfx-dot" style={{ background: color, color }} aria-hidden="true" />
      {withLabel ? <span>{meta.label}</span> : null}
    </span>
  )
}

export function RefractorSource({ source, className = '' }: { source: Source; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`inline-flex min-w-0 max-w-full items-baseline gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3 underline decoration-ink-3/40 decoration-1 underline-offset-2 transition-colors hover:text-bone hover:decoration-cyan ${className}`}
      title={`${source.label}${source.season ? ` / ${source.season}` : ''}. Opens in a new tab.`}
    >
      <span className="min-w-0 max-w-[28ch] truncate">{source.label}</span>
      {source.season ? <span className="opacity-70">/ {source.season}</span> : null}
      <span aria-hidden="true">↗</span>
    </a>
  )
}

export function RefractorClaim({
  claim,
  proseClassName = 'text-[15px] leading-relaxed text-bone-2',
  className = '',
}: {
  claim: Claim<string>
  proseClassName?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className={`max-w-[64ch] ${proseClassName}`}>{claim.value}</p>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <ConfidenceDot confidence={claim.confidence} />
        {claim.source ? (
          <>
            <span aria-hidden="true" className="text-ink-3">/</span>
            <RefractorSource source={claim.source} />
          </>
        ) : null}
      </div>
      {claim.note ? (
        <p
          className="max-w-[64ch] border-l-2 pl-3 font-mono text-[10px] leading-relaxed text-ink-3"
          style={{ borderColor: 'color-mix(in srgb, var(--color-cyan) 38%, transparent)' }}
        >
          {claim.note}
        </p>
      ) : null}
    </div>
  )
}
