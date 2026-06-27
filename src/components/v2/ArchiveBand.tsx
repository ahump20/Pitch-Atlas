import { Link } from 'react-router-dom'
import { LOST_PITCH_ARCHIVE_IMAGES } from '../../data/media/archive-images'
import { GlassArchiveReference } from '../archive/GlassArchiveReference'

/*
  The Archive band. A featured-artifact interlude on the home: the oldest filed
  plate in the atlas, the 1912 Lincoln Giants team photograph, shown as a surviving
  public-domain artifact with its provenance attached. It makes the preservation
  mission visible between the mission copy and the filed set. One primary CTA leads
  into the wing; the source link (inside the reference) and the quiet "filed under"
  line are provenance, not second CTAs.
*/
export function ArchiveBand() {
  const image = LOST_PITCH_ARCHIVE_IMAGES.find((i) => i.id === 'cannonball-redding-1912-plate')
  if (!image) return null

  return (
    <section className="v2-stage v2-tooth relative border-t border-bone/10">
      <div className="pa-atmo pa-atmo-leather opacity-[0.05]" aria-hidden="true" />
      <div className="relative z-[1] mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-10 px-5 py-20 md:grid-cols-12 md:gap-14 md:px-8 md:py-28">
        <div className="md:col-span-5">
          {/* the featured-artifact marker: ChapterMark's visual language, without
              claiming a number in the 01..09 chapter sequence this band sits inside. */}
          <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="text-cyan" aria-hidden="true">
              ■
            </span>
            <span className="text-bone-2/70">Featured artifact</span>
            <span className="h-px w-5 bg-bone/25" aria-hidden="true" />
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

          <div className="mt-8 flex flex-col gap-4">
            <Link
              to="/lost-pitches"
              className="inline-flex w-fit items-center gap-2 rounded-sm border border-bone/45 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-cyan/70 hover:bg-bone/[0.05]"
            >
              Enter the Lost Pitches archive <span aria-hidden="true">→</span>
            </Link>
            <Link
              to={`/lost-pitches/${image.relatedSlug}`}
              className="inline-flex w-fit items-center gap-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2/80 transition-colors hover:text-bone"
            >
              Filed under {image.relatedLabel}
            </Link>
          </div>
        </div>

        <div className="md:col-span-7">
          <GlassArchiveReference image={image} tone="band" />
        </div>
      </div>
    </section>
  )
}
