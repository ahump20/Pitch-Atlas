import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { LostPitch, RepertoireEntry } from '../../data/types'
import { DOCUMENTATION_META } from '../../data/types'
import { accentForSlug } from '../refractor/accents'
import { StatusBadge, isEdgeStatus } from './StatusBadge'

/*
  One directory plate for the Pitch Index, in the refractor family (Tier-B `.rfx-plate`).
  Unlike the detailed RepertoireEntryCard (which prints every Claim with its provenance),
  this is the compact, whole-card link a visitor scans and clicks: name, one-line read,
  where it goes. The left edge carries the pitch's family accent (--gc); a filed pitch
  takes the gold edge, an edge-case (alias / illusion / banned / not-a-pitch) and the lost
  legends take the seam edge. Anton title, mono meta, cyan "Open" — the same DNA as the
  showcase cards, at list density.
*/

const KIND_LABEL: Record<LostPitch['kind'], string> = {
  pitch: 'Lost pitch',
  pitcher: 'The arm',
  doctored: 'The doctored family',
}

function CardChrome({
  to,
  gc,
  variant,
  children,
}: {
  to: string
  gc: string
  variant?: 'filed' | 'edge'
  children: React.ReactNode
}) {
  const cls = `rfx-plate group ${variant === 'filed' ? 'is-filed' : ''} ${variant === 'edge' ? 'is-edge' : ''}`
  return (
    <Link to={to} className={cls} style={{ '--gc': gc } as CSSProperties}>
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-white/15" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-white/15" />
      {children}
    </Link>
  )
}

function RepertoireCard({ entry }: { entry: RepertoireEntry }) {
  const filed = Boolean(entry.filedSlug)
  const to = filed ? `/pitch/${entry.filedSlug}` : `/repertoire/${entry.id}`
  const flagged = isEdgeStatus(entry.status)
  const gc = accentForSlug(entry.filedSlug ?? entry.id).c3
  const variant = flagged ? 'edge' : filed ? 'filed' : undefined

  return (
    <CardChrome to={to} gc={gc} variant={variant}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="rfx-platetitle text-2xl">{entry.name}</h3>
          {entry.aka && entry.aka.length > 0 ? (
            <p className="mono-label mt-1 text-ink-3">aka {entry.aka.slice(0, 3).join(' · ')}</p>
          ) : null}
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-bone-2">{entry.movement.value}</p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/10 pt-3">
        <span className={`mono-label ${filed ? 'text-bone-2' : 'text-ink-3'}`}>
          {filed ? 'Filed · full specimen' : 'Basic file'}
        </span>
        <span className="ml-auto mono-label text-cyan transition-colors group-hover:text-bone">Open →</span>
      </div>
    </CardChrome>
  )
}

function LostCard({ pitch }: { pitch: LostPitch }) {
  const isLegend = pitch.tier === 'legend'
  return (
    <CardChrome to={`/lost-pitches/${pitch.slug}`} gc="var(--color-sand-bright)" variant={isLegend ? 'edge' : undefined}>
      <div className="flex items-center justify-between gap-3">
        <span className={`mono-label ${isLegend ? 'text-seam' : 'text-bone-2'}`}>{pitch.specimenNo}</span>
        <span className="mono-label text-ink-3">{pitch.era}</span>
      </div>
      <div>
        <h3 className="rfx-platetitle text-2xl">{pitch.name}</h3>
        <p className="mono-label mt-1.5 text-bone-2">{KIND_LABEL[pitch.kind]}</p>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-bone-2">{pitch.tagline}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-white/10 pt-3">
        <span className={`mono-label ${isLegend ? 'text-seam' : 'text-ink-3'}`}>{DOCUMENTATION_META[pitch.tier].label}</span>
        <span className="ml-auto mono-label text-cyan transition-colors group-hover:text-bone">Open →</span>
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
