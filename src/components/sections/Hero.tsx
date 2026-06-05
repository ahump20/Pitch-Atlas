import { HeroSpecimen } from '../ball/HeroSpecimen'
import type { PitchAtlasEntry } from '../../data/types'
import { scrollToId } from '../../lib/scroll'

/*
  Tier 00. Dark stage, the specimen, two lines of headline, one line of intent,
  one CTA. No eyebrow, no trust strip, no centered hero. The figure label under
  the specimen carries the honest accuracy disclosure. Headline and intent come
  from the selected pitch.
*/
export function Hero({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, display, seam } = entry
  const headline = `The ${canonical.name.charAt(0).toLowerCase()}${canonical.name.slice(1)}.`

  return (
    <section
      id="top"
      className="mx-auto grid min-h-[calc(100dvh-6rem)] max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-12 md:gap-8 md:px-8"
    >
      <div className="order-1 md:order-2 md:col-span-6 lg:col-span-7">
        <div className="relative mx-auto aspect-square w-full max-w-[min(80vw,540px)]">
          <HeroSpecimen entry={entry} className="h-full w-full" />
        </div>
        <p className="mono-label mt-4 text-center md:text-right">
          Specimen {display.specimenNo} / {seam.accuracyLevel}
        </p>
      </div>

      <div className="order-2 md:order-1 md:col-span-6 lg:col-span-5">
        <h1 className="font-prose text-4xl font-bold leading-[1.04] tracking-tight text-ink md:text-5xl">
          {headline}
          <span className="mt-1 block font-normal text-dim">{display.heroSub}</span>
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-dim">{display.heroIntro}</p>
        <a
          href="#foundation"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('foundation')
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-sm border border-seam px-5 py-3 font-mono text-sm tracking-wide text-ink transition-colors hover:bg-seam/15 active:translate-y-px"
        >
          Inspect the grip
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  )
}
