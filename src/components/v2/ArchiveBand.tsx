import { Link } from 'react-router-dom'
import { LOST_PITCH_ARCHIVE_IMAGES } from '../../data/media/archive-images'
import { GlassArchiveReference } from '../archive/GlassArchiveReference'
import { Descent } from '../motion/Descent'

/*
  The Archive band. A featured-artifact interlude on the home: the oldest filed
  plate in the atlas, the 1912 Lincoln Giants team photograph, shown as a surviving
  public-domain artifact with its provenance attached. It makes the preservation
  mission visible between the mission copy and the filed set. One primary CTA leads
  into the wing; the source link (inside the reference) and the quiet "filed under"
  line are provenance, not second CTAs.
*/
/* the band's accent: published to the far stratum and worn by the artifact marker */
const SCENE_TINT = '#CDBA8E'

export function ArchiveBand() {
  const image = LOST_PITCH_ARCHIVE_IMAGES.find((i) => i.id === 'cannonball-redding-1912-plate')
  if (!image) return null

  return (
    <section data-scene-tint={SCENE_TINT} className="v2-stage v2-tooth relative border-t border-bone/10">
      <Descent />
      <div className="pa-atmo pa-atmo-archive-paper opacity-[0.14]" aria-hidden="true" />
      {/* the band's own left pool: the global far-stratum pool lights the right
          half of this stretch of page, so the copy column mirrors it at a
          whisper — the pause before the artifact reads lit, not vacant. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[46%]"
        style={{
          background: `radial-gradient(78% 58% at 16% 46%, color-mix(in srgb, ${SCENE_TINT} 5%, transparent) 0%, transparent 72%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-[1] mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-10 px-5 py-20 md:grid-cols-12 md:gap-14 md:px-8 md:py-28">
        <div className="md:col-span-5">
          {/* the featured-artifact marker: ChapterMark's visual language, without
              claiming a number in the 01..09 chapter sequence this band sits inside. */}
          <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em]">
            <span style={{ color: SCENE_TINT }} aria-hidden="true">
              ■
            </span>
            <span className="text-bone-2/85">Featured artifact</span>
            <span className="h-px w-5 bg-bone/25 xl:w-8" aria-hidden="true" />
            <span className="text-bone-2">The Archive</span>
          </p>

          <h2 className="rfx-athletic v2-display mt-5 max-w-[14ch] text-[clamp(30px,5vw,58px)] leading-[0.96]">
            The oldest file in the atlas
          </h2>

          <p className="mt-6 max-w-[52ch] text-[15.5px] leading-relaxed text-bone-2 md:text-[16px]">
            Pitch Atlas preserves the craft by preserving the record. This 1912 Lincoln Giants team
            photograph is public domain, sourced, and filed as exactly what it is: a surviving
            artifact, not a reconstruction.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            {/* the arrow speaks the same invitation grammar the wax packs do:
                pointing at the door eases the arrow through it. */}
            <Link
              to="/lost-pitches"
              className="group inline-flex w-fit items-center gap-2 rounded-sm border border-bone/45 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-[#CDBA8E]/70 hover:bg-bone/[0.05]"
            >
              Enter the Lost Pitches archive{' '}
              <span
                aria-hidden="true"
                className="inline-block motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              to={`/lost-pitches/${image.relatedSlug}`}
              className="inline-flex w-fit items-center gap-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2/80 transition-colors hover:text-bone"
            >
              {/* the tick ties the provenance line to the marker grammar above */}
              <span aria-hidden="true" className="text-[8px]" style={{ color: SCENE_TINT }}>
                ■
              </span>
              Filed under {image.relatedLabel}
            </Link>
          </div>
        </div>

        <div className="md:col-span-7">
          <GlassArchiveReference image={image} tone="band" accent={SCENE_TINT} />
        </div>
      </div>
    </section>
  )
}
