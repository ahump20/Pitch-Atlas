import { Link } from 'react-router-dom'
import type { Craftsman } from '../../data/types'
import { pitchBySlug } from '../../data/pitches'
import { SeamSchematic } from '../fallback/SeamSchematic'

/*
  A craftsman, filed as an archive plate. Navy frame, file stamp, the signature
  pitch named, our one-line framing. When the atlas has the signature pitch on
  file, the card shows that pitch's seam schematic as its actor, never a player
  likeness. The legend (the gyroball) gets the one teal jolt and a dashed frame so
  it never reads as a person.
*/
export function CraftsmanCard({ craftsman }: { craftsman: Craftsman }) {
  const isLegend = craftsman.kind === 'legend'
  const pitch = craftsman.signaturePitchSlug ? pitchBySlug(craftsman.signaturePitchSlug) : undefined

  return (
    <Link
      to={`/craftsmen/${craftsman.slug}`}
      className={`group relative flex h-full flex-col gap-4 rounded-sm border-l-2 bg-paper p-6 transition-colors ${
        isLegend
          ? 'border-l-teal border border-dashed border-teal/40 hover:border-l-teal hover:bg-paper-2/50'
          : 'border-l-navy border-navy/15 hover:border-l-seam hover:bg-paper-2/40'
      }`}
    >
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-navy/30" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-navy/30" />

      <div className="flex items-center justify-between gap-3">
        <span className={`mono-label ${isLegend ? 'text-teal' : 'text-navy'}`}>
          {isLegend ? 'Legend' : 'Master'} · {craftsman.specimenNo}
        </span>
        <span className="mono-label text-ink-3">{craftsman.era}</span>
      </div>

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
          <h3 className="display text-2xl leading-tight text-navy">{craftsman.name}</h3>
          <p className="mono-label mt-1.5 text-ink-2">{craftsman.signaturePitch}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink-2">{craftsman.tagline}</p>

      <div className="mt-auto flex items-center gap-x-3 border-t border-navy/12 pt-3">
        <span className="mono-label text-seam">Open the file →</span>
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
