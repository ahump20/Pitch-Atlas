import { Link } from 'react-router-dom'
import type { Claim, RepertoireEntry, RepertoireStatus } from '../../data/types'
import { ConfidenceLabel } from '../provenance/ConfidenceLabel'
import { SourceBadge } from '../provenance/SourceBadge'
import { pitchBySlug } from '../../data/pitches'

/*
  One pitch in the catalog, filed as a compact plate. The status sits top-right and
  is the honest part: standard / niche / rare / near-extinct read as navy, while
  banned, alias, illusion, and not-a-pitch take the seam jolt so an edge case never
  reads as a workhorse. Grip and movement are each a Claim with its own provenance
  line. When the atlas has the pitch on file, a link opens the full specimen.
*/

const SEAM_STATUSES: RepertoireStatus[] = ['banned', 'alias', 'illusion', 'not-a-pitch']

const STATUS_LABEL: Record<RepertoireStatus, string> = {
  standard: 'Standard',
  niche: 'Niche',
  rare: 'Rare',
  'near-extinct': 'Near-extinct',
  banned: 'Banned',
  alias: 'Alias',
  illusion: 'Illusion',
  'not-a-pitch': 'Not a pitch',
}

function ClaimLine({ label, claim }: { label: string; claim: Claim<string> }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[0.95rem] leading-relaxed text-ink/90">
        <span className="mono-label mr-2 text-ink-3">{label}</span>
        {claim.value}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ConfidenceLabel confidence={claim.confidence} />
        {claim.source ? (
          <>
            <span aria-hidden="true" className="text-ink-3">/</span>
            <SourceBadge source={claim.source} />
          </>
        ) : null}
      </div>
      {claim.note ? (
        <p className="max-w-[58ch] text-[0.78rem] leading-snug text-ink-2/80">{claim.note}</p>
      ) : null}
    </div>
  )
}

export function RepertoireEntryCard({ entry }: { entry: RepertoireEntry }) {
  const flagged = SEAM_STATUSES.includes(entry.status)
  const filed = entry.filedSlug ? pitchBySlug(entry.filedSlug) : undefined

  return (
    <article
      id={entry.id}
      className={`relative flex h-full scroll-mt-28 flex-col gap-4 rounded-sm border-l-2 bg-paper p-6 ${
        flagged ? 'border-l-seam border border-dashed border-seam/30' : 'border-l-navy border border-navy/12'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-2xl leading-tight text-navy">{entry.name}</h3>
          {entry.aka && entry.aka.length > 0 ? (
            <p className="mono-label mt-1 text-ink-3">aka {entry.aka.join(' · ')}</p>
          ) : null}
        </div>
        <span className={`mono-label shrink-0 ${flagged ? 'text-seam' : 'text-navy'}`}>
          {STATUS_LABEL[entry.status]}
        </span>
      </div>

      <ClaimLine label="Grip" claim={entry.grip} />
      <ClaimLine label="Moves" claim={entry.movement} />

      {entry.relationship ? <ClaimLine label="Really" claim={entry.relationship} /> : null}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-navy/12 pt-3">
        {entry.velocity ? (
          <span className="mono-label text-ink-2">{entry.velocity}</span>
        ) : null}
        {entry.notableThrowers ? (
          <span className="text-[0.8rem] leading-snug text-ink-2">{entry.notableThrowers}</span>
        ) : null}
        {filed ? (
          <Link
            to={`/pitch/${filed.display.slug}`}
            className="ml-auto mono-label text-seam transition-colors hover:text-navy"
          >
            Study the {filed.canonical.name.toLowerCase()} →
          </Link>
        ) : null}
      </div>
    </article>
  )
}
