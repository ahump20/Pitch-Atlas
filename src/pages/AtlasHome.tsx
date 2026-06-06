import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { SITE } from '../config/site'
import { HomeHero } from '../components/sections/HomeHero'
import { PitchIndex } from '../components/sections/PitchIndex'

/*
  The Atlas home: one front door. The hero states the product and shows the
  signature ball; the Pitch Index directly below is the dominant surface — every
  pitch, searchable, one click to its page. A single compact colophon line names
  how the record works and opens the two side wings (Craftsmen, Lost Pitches). The
  old scatter of teaser sections and the repeated philosophy are gone; the
  philosophy now lives once, on /sources.
*/
export function AtlasHome() {
  useSeoMeta({
    title: `${SITE.siteName}: The Living Field Manual for Pitching Grips`,
    description:
      'A searchable atlas of every pitch — grip, movement, and the craftsmen who defined it. Every claim labeled by its source. Sourced, not corrected.',
    ogTitle: `${SITE.siteName}: the living field manual for pitching grips`,
    ogDescription: 'Every pitch, gripped and sourced. Sourced, not corrected.',
    ogUrl: SITE.canonicalDomain,
    twitterCard: 'summary_large_image',
  })

  return (
    <>
      <HomeHero featured={PITCHES[0]} />

      <section id="index" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-5 pt-16 md:px-8 md:pt-20">
          <p className="mono-label text-seam">The Pitch Index</p>
          <h2 className="display mt-3 max-w-[24ch] text-3xl leading-tight text-navy md:text-[2.6rem]">
            Every pitch, gripped and sourced. Find the one you want.
          </h2>
        </div>
        <PitchIndex />
      </section>

      {/* One colophon line + the two side wings. */}
      <section className="border-t border-navy/15 bg-paper-2/60">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="display max-w-[40ch] text-2xl leading-snug text-ink">
            Every claim is labeled by its source, not declared right or wrong.
          </p>
          <Link
            to="/sources"
            className="mono-label mt-4 inline-block text-seam transition-colors hover:text-navy"
          >
            How a claim is filed →
          </Link>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Link
              to="/craftsmen"
              className="group rounded-sm border-l-2 border-l-navy border border-navy/15 bg-paper p-6 transition-colors hover:border-l-seam hover:bg-paper-2/40"
            >
              <p className="mono-label text-navy">The Craftsmen</p>
              <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-ink-2">
                The arms that owned a pitch — and the one pitch that is a legend, not a person.
              </p>
              <span className="mono-label mt-3 inline-block text-seam transition-colors group-hover:text-navy">
                Open the hall →
              </span>
            </Link>
            <Link
              to="/lost-pitches"
              className="group rounded-sm border-l-2 border-l-seam border border-dashed border-seam/35 bg-paper p-6 transition-colors hover:bg-paper-2/50"
            >
              <p className="mono-label text-seam">Lost Pitches</p>
              <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-ink-2">
                The pitches of the Negro Leagues whose statistics survive but whose grips mostly do not.
              </p>
              <span className="mono-label mt-3 inline-block text-seam transition-colors group-hover:text-navy">
                Open the archive →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
