import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { BallStage } from '../ball/BallStage'

export function Hero({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, display, seam } = entry

  return (
    <section id="top" className="on-stage relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true">
        <div className="h-full w-full bg-[radial-gradient(circle_at_58%_36%,rgba(178,58,48,0.22),transparent_36%),linear-gradient(115deg,rgba(243,236,224,0.08)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-6.5rem)] max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pb-20 md:pt-16">
        <div className="order-2 md:order-1 md:col-span-6">
          <p className="mono-label text-bone-2">
            {SITE.siteName} / {SITE.moduleName}
          </p>
          <h1 className="display mt-4 max-w-[9ch] text-[3rem] leading-[0.95] text-bone md:text-[4.8rem]">
            Hold the pitch before you measure it.
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-bone-2">
            {SITE.moduleName} is the launch module for {SITE.siteName}: grip, thumb, seams,
            finger pads, palm gap, and release feel first. Spin language sits below the
            craft path where it belongs.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#grip-lab"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('grip-lab')
              }}
              className="inline-flex items-center gap-2 rounded-sm border border-seam bg-seam px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-seam-deep active:translate-y-px"
            >
              Enter Grip Lab
              <span aria-hidden="true">↓</span>
            </a>
            <a
              href="#movement-translation"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('movement-translation')
              }}
              className="inline-flex items-center rounded-sm border border-bone/30 px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:border-bone"
            >
              Translate movement
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2 md:col-span-6">
          <div className="relative mx-auto aspect-square w-full max-w-[min(86vw,560px)]">
            <div
              aria-hidden="true"
              className="absolute inset-[4%] rounded-full"
              style={{ background: 'radial-gradient(circle at 50% 46%, rgba(255,246,232,0.14), transparent 64%)' }}
            />
            <BallStage
              entry={entry}
              grip
              hand
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
