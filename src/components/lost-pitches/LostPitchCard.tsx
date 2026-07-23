import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { LostPitch } from '../../data/types'

/*
  A lost pitch or an arm, filed as a refractor plate (Tier-B `.rfx-plate`). The
  documentation tier sets the frame: documented and partial plates wear the sand
  archive accent; legend plates take the seam jolt and a dashed border so a showman
  label never reads as a verified record. No likeness, ever — the visual mark is the
  Atlas seal. The kind line names whether this is a pitch, a pitcher, or the
  doctored-ball family.
*/

const KIND_LABEL: Record<LostPitch['kind'], string> = {
  pitch: 'Lost pitch',
  pitcher: 'The arm',
  doctored: 'The doctored family',
}

export function LostPitchCard({ pitch }: { pitch: LostPitch }) {
  const isLegend = pitch.tier === 'legend'

  return (
    <Link
      to={`/lost-pitches/${pitch.slug}`}
      viewTransition
      className={`rfx-plate group ${isLegend ? 'is-edge is-dashed' : ''}`}
      style={{ '--gc': 'var(--color-sand-bright)' } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-white/15" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-white/15" />

      <div className="flex items-center justify-between gap-3">
        <span className={`mono-label ${isLegend ? 'text-seam' : 'text-bone-2'}`}>{pitch.specimenNo}</span>
        <span className="mono-label text-ink-3">{pitch.era}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 shrink-0" aria-hidden="true">
          <img src="/brand/seal-128.webp" alt="" width={48} height={48} loading="lazy" decoding="async" className="opacity-80" />
        </div>
        <div>
          <h3 className="rfx-platetitle text-2xl">{pitch.name}</h3>
          <p className="mono-label mt-1.5 text-bone-2">{KIND_LABEL[pitch.kind]}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-bone-2">{pitch.tagline}</p>

      <div className="mt-auto border-t border-white/10 pt-3">
        <span className="mono-label text-cyan transition-colors group-hover:text-bone">Open the file →</span>
      </div>
    </Link>
  )
}
