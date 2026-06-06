import { Link } from 'react-router-dom'
import type { LostPitch, RepertoireEntry } from '../../data/types'
import { DOCUMENTATION_META } from '../../data/types'
import { StatusBadge, isEdgeStatus } from './StatusBadge'

/*
  One directory plate for the Pitch Index. Unlike the detailed RepertoireEntryCard
  (which prints every Claim with its provenance), this is the compact, whole-card
  link a visitor scans and clicks: name, one-line read, and where it goes. Every
  card has a destination — a filed pitch opens its full specimen, an unfiled pitch
  opens its basic file, a lost pitch opens its archive page. Card chrome (corner
  ticks, left accent, "Open the file") matches the existing archive plates so the
  index reads as one system.
*/

const KIND_LABEL: Record<LostPitch['kind'], string> = {
  pitch: 'Lost pitch',
  pitcher: 'The arm',
  doctored: 'The doctored family',
}

function CardChrome({
  to,
  flagged,
  children,
}: {
  to: string
  flagged: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={`group relative flex h-full flex-col gap-3 rounded-sm border-l-2 bg-paper p-5 transition-colors ${
        flagged
          ? 'border-l-seam border border-dashed border-seam/35 hover:bg-paper-2/50'
          : 'border-l-navy border-navy/15 hover:border-l-seam hover:bg-paper-2/40'
      }`}
    >
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-navy/30" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-navy/30" />
      {children}
    </Link>
  )
}

function RepertoireCard({ entry }: { entry: RepertoireEntry }) {
  const filed = Boolean(entry.filedSlug)
  const to = filed ? `/pitch/${entry.filedSlug}` : `/repertoire/${entry.id}`
  const flagged = isEdgeStatus(entry.status)

  return (
    <CardChrome to={to} flagged={flagged}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-2xl leading-tight text-navy">{entry.name}</h3>
          {entry.aka && entry.aka.length > 0 ? (
            <p className="mono-label mt-1 text-ink-3">aka {entry.aka.slice(0, 3).join(' · ')}</p>
          ) : null}
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-ink/90">
        {entry.movement.value}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-navy/12 pt-3">
        <span className={`mono-label ${filed ? 'text-navy' : 'text-ink-3'}`}>
          {filed ? 'Filed · full specimen' : 'Basic file'}
        </span>
        {entry.velocity ? (
          <span className="mono-label text-ink-3">· {entry.velocity.replace(/^(~|roughly |about )/i, '')}</span>
        ) : null}
        <span className="ml-auto mono-label text-seam transition-colors group-hover:text-navy">
          Open →
        </span>
      </div>
    </CardChrome>
  )
}

function LostCard({ pitch }: { pitch: LostPitch }) {
  const isLegend = pitch.tier === 'legend'
  return (
    <CardChrome to={`/lost-pitches/${pitch.slug}`} flagged={isLegend}>
      <div className="flex items-center justify-between gap-3">
        <span className={`mono-label ${isLegend ? 'text-seam' : 'text-navy'}`}>{pitch.specimenNo}</span>
        <span className="mono-label text-ink-3">{pitch.era}</span>
      </div>
      <div>
        <h3 className="display text-2xl leading-tight text-navy">{pitch.name}</h3>
        <p className="mono-label mt-1.5 text-ink-2">{KIND_LABEL[pitch.kind]}</p>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-ink-2">{pitch.tagline}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-navy/12 pt-3">
        <span className={`mono-label ${isLegend ? 'text-seam' : 'text-ink-3'}`}>
          {DOCUMENTATION_META[pitch.tier].label}
        </span>
        <span className="ml-auto mono-label text-seam transition-colors group-hover:text-navy">
          Open →
        </span>
      </div>
    </CardChrome>
  )
}

export function IndexCard(
  props: { variant: 'repertoire'; entry: RepertoireEntry } | { variant: 'lost'; pitch: LostPitch },
) {
  if (props.variant === 'repertoire') return <RepertoireCard entry={props.entry} />
  return <LostCard pitch={props.pitch} />
}
