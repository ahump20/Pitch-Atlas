import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { BallStage } from '../ball/BallStage'

/*
  The chapter hero leads with the pitch, not the product. The pitch name is the
  page's single H1, the specimen number and family read as an archive label, and
  the seam-true ball is the actor. One call sends the reader down into the Grip
  Lab. This is what makes each pitch its own page rather than a section.
*/
export function PitchHero({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, display, guide, seam } = entry

  return (
    <section id="top" className="on-stage relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true">
        <div className="h-full w-full bg-[radial-gradient(circle_at_60%_38%,rgba(108,172,228,0.16),transparent_38%),linear-gradient(115deg,rgba(242,236,221,0.07)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-9.5rem)] max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-8 md:grid-cols-12 md:gap-8 md:px-8 md:pb-16 md:pt-12">
        <div className="order-2 md:order-1 md:col-span-6">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-2/80">
            <Link to="/" className="transition-colors hover:text-bone">The Atlas</Link>
            <span aria-hidden="true">/</span>
            <span className="text-bone-2">Specimen {display.specimenNo}</span>
            <span aria-hidden="true">/</span>
            <span className="text-bone-2">{guide ? guide.family : canonical.family}</span>
          </nav>

          <p className="mono-label text-bone-2">{display.heroSub}</p>
          <h1 className="display mt-3 max-w-[14ch] text-[2.7rem] leading-[0.98] text-bone md:text-[4.4rem]">
            {canonical.name}
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-bone-2">{display.heroIntro}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#grip-lab"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('grip-lab', true)
              }}
              className="inline-flex items-center gap-2 rounded-sm border border-seam bg-seam px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-seam-deep active:translate-y-px"
            >
              Open the Grip Lab
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-sm border border-bone/30 px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:border-bone"
            >
              All pitches
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="order-1 md:order-2 md:col-span-6">
          <div className="relative mx-auto aspect-square w-full max-w-[min(86vw,540px)]">
            <div
              aria-hidden="true"
              className="absolute inset-[4%] rounded-full"
              style={{ background: 'radial-gradient(circle at 50% 46%, rgba(238,240,246,0.12), transparent 64%)' }}
            />
            <BallStage
              entry={entry}
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
