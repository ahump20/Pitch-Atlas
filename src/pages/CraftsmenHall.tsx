import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { CRAFTSMEN } from '../data/craftsmen'
import { CraftsmanCard } from '../components/craftsmen/CraftsmanCard'
import { TierMarker } from '../components/layout/TierMarker'

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
      <section className="on-stage relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]" aria-hidden="true">
          <div className="h-full w-full bg-[radial-gradient(circle_at_70%_30%,rgba(108,172,228,0.16),transparent_40%),linear-gradient(115deg,rgba(242,236,221,0.07)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-2/80">
            <Link to="/" className="transition-colors hover:text-bone">The Atlas</Link>
            <span aria-hidden="true">/</span>
            <span className="text-bone-2">The Craftsmen</span>
          </nav>
          <p className="mono-label-stage">The hall</p>
          <h1 className="display mt-4 max-w-[16ch] text-[2.6rem] leading-[1.0] text-bone md:text-[4.4rem]">
            The arms that defined the pitches.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-bone-2">
            A pitch is a tool; a craftsman is who made it sing. This wing is the mental and physical
            edge of pitching, the intimidation, the conviction, the deception, told through the arms
            who owned a single pitch. Plus one pitch that is a legend rather than a person. Every quote
            and number is labeled by its source.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <TierMarker index="C" label="The masters" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {masters.map((c) => (
            <CraftsmanCard key={c.slug} craftsman={c} />
          ))}
        </div>

        {legends.length > 0 ? (
          <div className="mt-16">
            <TierMarker index="L" label="The legend" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {legends.map((c) => (
                <CraftsmanCard key={c.slug} craftsman={c} />
              ))}
              <div className="flex h-full flex-col justify-center gap-2 rounded-sm border border-dashed border-navy/20 p-6 md:col-span-2">
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
      </section>
    </>
  )
}
