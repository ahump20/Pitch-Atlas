import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { CRAFTSMEN } from '../data/craftsmen'
import { CraftsmanCard } from '../components/craftsmen/CraftsmanCard'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'

/*
  The Craftsmen wing: a curated hall of arms who defined a pitch, plus the one
  pitch that is a legend rather than a person. The mental and physical edge of
  pitching lives here, off the foundation pages, so it can sprawl without
  crowding a specimen. Same provenance discipline: every quote and number in each
  chapter is sourced.
*/
export function CraftsmenHall() {
  const masters = CRAFTSMEN.filter((c) => c.kind === 'craftsman')
  const legends = CRAFTSMEN.filter((c) => c.kind === 'legend')

  useSeoMeta({
    title: `The Craftsmen: the arms that defined the pitches | ${SITE.siteName}`,
    description:
      'A sourced hall of the pitchers who defined a pitch, Gibson to Skenes, plus the gyroball legend. The mental edge, the signature pitch, and the record, each labeled by source.',
    ogTitle: `The Craftsmen | ${SITE.siteName}`,
    ogDescription: 'The arms that defined the pitches, and the mental edge behind them. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/craftsmen`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={
          <Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'The Craftsmen' }]} />
        }
        eyebrow="The hall"
        title="The arms that defined the pitches."
        sub={
          <>The arms that owned a pitch — and the one pitch that is a legend, not a person. Every quote sourced.</>
        }
      />

      <section className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <div className="pa-atmo pa-atmo-leather opacity-[0.06]" aria-hidden="true" />
        <div className="relative">
        <StageTierMarker index="C" label="The masters" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {masters.map((c) => (
            <CraftsmanCard key={c.slug} craftsman={c} />
          ))}
        </div>

        {legends.length > 0 ? (
          <div className="mt-16">
            <StageTierMarker index="L" label="The legend" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {legends.map((c) => (
                <CraftsmanCard key={c.slug} craftsman={c} />
              ))}
              <div className="flex h-full flex-col justify-center gap-2 rounded-sm border border-dashed border-ink/15 p-6 md:col-span-2">
                <p className="mono-label text-ink-2">Why a legend, not a master</p>
                <p className="max-w-[52ch] text-sm leading-relaxed text-ink-2">
                  The gyroball is filed apart on purpose. It is a real pitch, but most of what is said
                  about it is myth. We keep it to show the difference between a sourced record and a
                  good story, and to label which is which.
                </p>
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </section>
    </>
  )
}
