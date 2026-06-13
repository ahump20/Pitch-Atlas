import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Craftsman } from '../../data/types'
import { pitchBySlug } from '../../data/pitches'
import { accentForSlug } from '../refractor/accents'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { parseEra } from '../../lib/era'
import { EraBand } from './EraBand'

/*
  A craftsman, filed as a refractor plate (Tier-B `.rfx-plate`). The master wears his
  signature pitch's family accent on the left edge, so the hall reads in the same colors
  as the specimens. When the atlas has the signature pitch on file, the card shows that
  pitch's seam schematic as its actor, never a player likeness. The legend (the gyroball)
  takes the one teal jolt and a dashed frame so it never reads as a verified person.
*/
export function CraftsmanCard({ craftsman }: { craftsman: Craftsman }) {
  const isLegend = craftsman.kind === 'legend'
  const pitch = craftsman.signaturePitchSlug ? pitchBySlug(craftsman.signaturePitchSlug) : undefined
  const gc = isLegend
    ? 'var(--color-teal-glow)'
    : craftsman.signaturePitchSlug
      ? accentForSlug(craftsman.signaturePitchSlug).c3
      : 'var(--color-cyan)'
  // a master sits on the timeline by his real era; the legend is a design, not a
  // career, so it carries no span band — only the masters chart against history
  const span = isLegend ? null : parseEra(craftsman.era)

  return (
    <Link
      to={`/craftsmen/${craftsman.slug}`}
      className={`rfx-plate group ${isLegend ? 'is-dashed' : ''}`}
      style={{ '--gc': gc } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-white/15" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-white/15" />

      <div className="flex items-center justify-between gap-3">
        <span className="mono-label" style={{ color: isLegend ? 'var(--color-teal-glow)' : gc }}>
          {isLegend ? 'Legend' : 'Master'} · {craftsman.specimenNo}
        </span>
        <span className="mono-label text-ink-3">{craftsman.era}</span>
      </div>

      {span ? <EraBand span={span} accent={gc} /> : null}

      <div className="flex items-center gap-4">
        <div className="w-14 shrink-0" aria-hidden="true">
          {pitch ? (
            <SeamSchematic
              className="h-full w-full"
              showAxis={false}
              showStitches={false}
              spinAxis={pitch.motion.spinAxis}
              gyro={pitch.motion.gyro}
              title=""
            />
          ) : (
            <img src="/brand/seal-128.webp" alt="" width={48} height={48} loading="lazy" decoding="async" className="opacity-80" />
          )}
        </div>
        <div>
          <h3 className="rfx-platetitle text-2xl">{craftsman.name}</h3>
          <p className="mono-label mt-1.5 text-bone-2">{craftsman.signaturePitch}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-bone-2">{craftsman.tagline}</p>

      <div className="mt-auto flex items-center gap-x-3 border-t border-white/10 pt-3">
        <span className="mono-label text-cyan transition-colors group-hover:text-bone">Open the file →</span>
        {craftsman.hand ? (
          <>
            <span aria-hidden="true" className="text-ink-3">·</span>
            <span className="mono-label text-ink-3">{craftsman.hand}-handed</span>
          </>
        ) : null}
      </div>
    </Link>
  )
}
