import { HeroSpecimen } from '../ball/HeroSpecimen'
import type { PitchAtlasEntry } from '../../data/types'
import { scrollToId } from '../../lib/scroll'

/*
  Tier 00. A deep warm chamber where the white ball glows. One editorial headline,
  one plain promise, two ways in: down to the atlas, or straight to the physics.
  The specimen reflects whichever pitch is selected; the label under it carries the
  honest accuracy disclosure. No eyebrow spec-dump, no trust strip.
*/
export function Hero({ entry }: { entry: PitchAtlasEntry }) {
  const { display, seam } = entry

  return (
    <section id="top" className="on-stage relative overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100dvh-6.5rem)] max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-12 md:gap-8 md:px-8">
        <div className="order-2 md:order-1 md:col-span-6">
          <p className="mono-label text-bone-2">Pitch Atlas</p>
          <h1 className="display mt-4 text-[2.75rem] leading-[0.98] text-bone md:text-[4.25rem]">
            The pitch,{' '}
            <br />
            in your hand.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-bone-2">
            How the four-seam, sinker, change, curve, and slider are actually gripped and thrown —
            grip first, then the physics. Sourced, not corrected.
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
              Find your grip
              <span aria-hidden="true">↓</span>
            </a>
            <a
              href="#what-it-does"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('what-it-does')
              }}
              className="inline-flex items-center rounded-sm border border-bone/30 px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:border-bone"
            >
              Why it moves
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2 md:col-span-6">
          <div className="relative mx-auto aspect-square w-full max-w-[min(82vw,520px)]">
            <div
              aria-hidden="true"
              className="absolute inset-[8%] rounded-full"
              style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,246,232,0.12), transparent 62%)' }}
            />
            <HeroSpecimen entry={entry} className="h-full w-full" />
          </div>
          <p className="mono-label mt-4 text-center text-bone-2 md:text-right">
            Specimen {display.specimenNo} / {seam.accuracyLevel}
          </p>
        </div>
      </div>
    </section>
  )
}
