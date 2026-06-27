import { useState, type CSSProperties } from 'react'
import type { ArchiveImage } from '../../data/media/archive-images'
import { useReveal } from '../motion/Reveal'

/*
  GlassArchiveReference: the signature archive surface. A real historical still,
  graded warm like aged film and set behind a liquid-glass placard, presented as a
  surviving artifact with its provenance attached. The warm grade and the glass
  layer OVER the real photo; they never stand in for it.

  Two states, both built:
   - populated: the still renders, aged and framed, with its catalog tag, title,
     rights, and a source link beneath.
   - broken file: the alt text reads gracefully on the neutral archive black.
*/

// The warm archival grade, applied to the real still. Sepia-led, but kept from
// going flat brown with a little saturation and contrast, so the silver-halide
// still reads as a photograph rather than a filter swatch.
const AGED_FILTER = 'sepia(0.5) saturate(1.16) contrast(1.05) brightness(0.92)'

interface ToneScale {
  title: string
  placardPad: string
  caption: string
  meta: string
}

// tone scales the same composition: 'band' is the home featured-artifact scale
// where the still leads; 'plate' is the inline detail scale, in rhythm with the
// rail's detail card.
const TONE: Record<'band' | 'plate', ToneScale> = {
  band: {
    title: 'text-[clamp(20px,3.4vw,40px)]',
    placardPad: 'px-5 py-2 md:px-6 md:py-3',
    caption: 'text-[15px] leading-relaxed',
    meta: 'mt-5',
  },
  plate: {
    title: 'text-2xl',
    placardPad: 'px-4 py-2.5',
    caption: 'text-sm leading-relaxed',
    meta: 'mt-4',
  },
}

export function GlassArchiveReference({ image, tone }: { image: ArchiveImage; tone: 'band' | 'plate' }) {
  const t = TONE[tone]
  const [broken, setBroken] = useState(false)
  const { ref, shown } = useReveal<HTMLElement>('0px 0px -8% 0px')

  // The placard tag is derived from the plate kind so it never restates what the
  // rights chip already owns: "TEAM PLATE" / TITLE / "public domain", no repeats.
  const kindLabel = image.plateKind.replace('-', ' ')
  const rightsLabel = image.rights.replace('-', ' ')

  // Decorative overlays, layered over the photo (never replacing it): the warm
  // grade, a legibility scrim under the placard, and a faint glass sheen. All
  // aria-hidden and pointer-transparent.
  const gradeWash: CSSProperties = {
    background:
      'linear-gradient(158deg, rgba(122,74,46,0.22) 0%, rgba(122,74,46,0) 44%, rgba(7,5,9,0.2) 100%)',
    mixBlendMode: 'soft-light',
  }
  const scrim: CSSProperties = {
    background:
      'radial-gradient(135% 104% at 50% 32%, transparent 52%, rgba(5,4,8,0.46) 100%), linear-gradient(to top, rgba(5,4,8,0.94) 0%, rgba(5,4,8,0.28) 32%, transparent 58%)',
  }
  const sheen: CSSProperties = {
    background: 'linear-gradient(116deg, transparent 30%, rgba(246,241,230,0.10) 46%, transparent 58%)',
    mixBlendMode: 'screen',
  }
  const frameShadow: CSSProperties = {
    boxShadow:
      'inset 0 1px 0 rgba(246,241,230,0.06), inset 0 0 0 1px rgba(0,0,0,0.32), 0 30px 60px -32px rgba(0,0,0,0.85)',
  }

  return (
    <figure ref={ref} className={`reveal ${shown ? 'is-visible' : ''} flex flex-col`}>
      {/* the framed artifact: aspect locked to the plate (4/3) so there is zero CLS */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-bone/15 bg-[#090807]"
        style={frameShadow}
      >
        {!broken ? (
          <img
            src={image.imageSrc}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: AGED_FILTER }}
          />
        ) : (
          // broken-file state: the alt reads as the artifact on the archive black
          <div className="absolute inset-0 grid place-items-center bg-[#090807] p-6 text-center">
            <p className="max-w-[40ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-bone-2">
              {image.alt}
            </p>
          </div>
        )}

        {!broken && <div className="pointer-events-none absolute inset-0" style={gradeWash} aria-hidden="true" />}
        <div className="pointer-events-none absolute inset-0" style={scrim} aria-hidden="true" />
        {!broken && <div className="pointer-events-none absolute inset-0" style={sheen} aria-hidden="true" />}

        {/* the liquid-glass placard: the catalog tag and title, set over the still */}
        <figcaption
          className={`absolute inset-x-0 bottom-0 border-t border-bone/12 bg-[#0b0a12]/45 backdrop-blur-md ${t.placardPad}`}
        >
          <span className="mono-label-stage">{kindLabel} plate</span>
          <p className={`font-athletic mt-1 uppercase leading-[0.92] text-bone ${t.title}`}>{image.title}</p>
          {/* the rights determination and the proof it rests on read as one unit:
              the chip itself links to the source that backs the claim. */}
          {image.source ? (
            <a
              href={image.source.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${rightsLabel} — view the source for this image`}
              className="mono-label-stage mt-1.5 inline-flex items-center gap-1.5 text-cyan underline decoration-cyan/40 underline-offset-2 transition-colors hover:decoration-cyan"
            >
              {rightsLabel} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="mono-label-stage mt-1.5 inline-block text-cyan">{rightsLabel}</span>
          )}
        </figcaption>
      </div>

      {/* provenance, always rendered beneath the frame. The source link lives on
          the rights chip above, so claim and proof read as one unit. */}
      <div className={t.meta}>
        <p className={`max-w-[60ch] text-bone-2 ${t.caption}`}>{image.caption}</p>
        {tone === 'plate' ? (
          <p className="mt-2 max-w-[60ch] text-xs leading-relaxed text-bone-2/70">{image.qualityNote}</p>
        ) : null}
      </div>
    </figure>
  )
}
