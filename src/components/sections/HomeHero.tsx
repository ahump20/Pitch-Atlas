import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { BallStage } from '../ball/BallStage'

/*
  The home hero states the product, not a single pitch. The interactive specimen
  is the right-hand actor: a real seam-true baseball inside an archival frame.
  The two calls send the reader into the two wings of the manual, the pitch
  catalog just below and the Craftsmen hall.
*/
export function HomeHero({ featured }: { featured: PitchAtlasEntry }) {
  const { canonical, display, seam } = featured

  return (
    <section id="top" className="on-stage relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true">
        <div className="h-full w-full bg-[radial-gradient(circle_at_58%_36%,rgba(108,172,228,0.18),transparent_36%),linear-gradient(115deg,rgba(242,236,221,0.08)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-6.5rem)] max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pb-20 md:pt-14">
        <div className="order-2 md:order-1 md:col-span-6">
          <p className="mono-label text-bone-2">{SITE.siteName} / {SITE.sourcePrinciple}</p>
          <h1 className="display mt-4 max-w-[15ch] text-[2.6rem] leading-[0.98] text-bone md:text-[4.2rem]">
            The living field manual for pitching grips.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-bone-2">
            Textbook foundations, verified master variants, and the craftsmen who defined the craft.
            Every claim is labeled by its source, not declared right or wrong. Open a pitch, study the
            hand, then read the legends who made it move.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#atlas"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('atlas')
              }}
              className="inline-flex items-center gap-2 rounded-sm border border-seam bg-seam px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-seam-deep active:translate-y-px"
            >
              Browse the pitches
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              to="/craftsmen"
              className="inline-flex items-center gap-2 rounded-sm border border-bone/30 px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:border-bone"
            >
              Meet the Craftsmen
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="mt-7 max-w-[46ch] font-mono text-xs leading-relaxed tracking-[0.04em] text-bone-2/80">
            Foundation. Masters. Field Notes. The three layers of the record, each labeled by source.
          </p>
        </div>

        <div className="order-1 md:order-2 md:col-span-6">
          <div className="relative mx-auto aspect-square w-full max-w-[min(86vw,560px)]">
            <div
              aria-hidden="true"
              className="absolute inset-[4%] rounded-full"
              style={{ background: 'radial-gradient(circle at 50% 46%, rgba(238,240,246,0.12), transparent 64%)' }}
            />
            <BallStage
              entry={featured}
              grip
              faceGrip
              autoSpin={false}
              surface="stage"
              view={canonical.gripModel.defaultView}
              className="h-full w-full"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-end">
            <p className="mono-label text-bone-2">Specimen {display.specimenNo}</p>
            <p className="mono-label text-bone-2">{seam.accuracyLevel}</p>
            <p className="mono-label text-bone-2">{SITE.sourcePrinciple}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
