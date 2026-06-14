import { CONFIDENCE_META, type Claim } from '../../data/types'
import { ConfidenceDot } from '../provenance/RefractorClaim'

/*
  The grip's source badge, worn inside the visual panel. The hand on the ball is
  a claim like any other on the page, so it carries the same seven-tier
  confidence vocabulary — the tier label and wording come straight from
  CONFIDENCE_META, never a parallel label map. An unfiled grip wears its
  'unverified' tier here too; the gap is shown, not hidden.
*/

export function GripSourceBadge({
  provenance,
  className = '',
}: {
  provenance: Claim<string>
  className?: string
}) {
  const meta = CONFIDENCE_META[provenance.confidence]
  return (
    <div
      className={`pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-md border border-bone/15 bg-stage/85 px-2.5 py-1.5 backdrop-blur-sm ${className}`}
      data-grip-source-badge={provenance.confidence}
    >
      <ConfidenceDot confidence={provenance.confidence} withLabel={false} />
      <span className="min-w-0">
        <span className="block truncate font-mono text-[9px] uppercase tracking-[0.1em] text-bone">
          {meta.label}
        </span>
        {provenance.source ? (
          <a
            href={provenance.source.url}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-mono text-[10px] tracking-[0.04em] text-bone-2 underline decoration-bone/30 underline-offset-2 transition-colors hover:text-bone"
          >
            {provenance.source.label}
          </a>
        ) : (
          <span className="block truncate font-mono text-[10px] tracking-[0.04em] text-bone-2">
            No source corroborates this grip
          </span>
        )}
      </span>
    </div>
  )
}
