import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { accentForSlug } from '../refractor/accents'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'

/*
  v2 · The Case. The pull, restaged off-axis on matte Topps-Now black: the
  hero specimen stands to the right under a raking accent light, the read sits
  lower-left, and the chrome lives in the materials around the words (the card's
  foil, the polished CTA lips, the ball's specular) rather than in a gradient
  fill. Reuses the real PitchSpecimenCard, so the live R3F ball, the foil, and
  the spring tilt are the same parts the rest of the site ships. The card exits
  with a scroll-driven refraction (.v2-refract) on capable browsers; reduced
  motion and no-WebGL keep it standing and swap the schematic in cleanly.
*/
export function HeroCase({ featured }: { featured: PitchAtlasEntry }) {
  const accent = accentForSlug(featured.display.slug)
  const isChase = featured.display.specimenNo === '00'

  return (
    <section
      id="case"
      className="v2-stage v2-tooth relative overflow-hidden"
      style={{ '--c3': accent.c3 } as React.CSSProperties}
    >
      <div className="relative z-[1] mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-10 md:min-h-[calc(100dvh-4.5rem)] md:grid-cols-12 md:gap-6 md:px-8 md:pb-24 md:pt-12">
        {/* the read, lower-left */}
        <div className="order-2 md:order-1 md:col-span-6 md:self-center">
          <p
            className="rfx-stamp v2-enter w-fit [text-wrap:balance]"
            style={{ color: '#F2ECDD', background: 'rgba(10,9,8,.7)', borderColor: 'rgba(242,236,221,.5)', '--i': 0 } as React.CSSProperties}
          >
            {SITE.brandLine}
          </p>

          <h1
            className="rfx-athletic v2-display v2-enter mt-5 text-[clamp(40px,8.5vw,84px)] leading-[0.98] md:leading-[0.92]"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            The pitch,
            <br />
            struck as a specimen.
          </h1>

          <p
            className="v2-enter mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-bone-2 md:text-base"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            Hold the grip, read the shape in plain words, check the source on every line. Pitch
            Atlas preserves the art before it disappears: grip first, claim labeled, no invented
            certainty.
          </p>

          <div
            className="v2-enter mt-7 flex flex-wrap items-center gap-3"
            style={{ '--i': 3 } as React.CSSProperties}
          >
            <Link to="/repertoire" className="v2-cta">
              Open the Pitch Index <span aria-hidden="true">→</span>
            </Link>
            <Link to="/about" className="v2-cta is-ghost">
              Read the mission <span aria-hidden="true">→</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => scrollToId('refraction')}
            className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-2/80 transition-colors hover:text-bone"
          >
            Watch it flatten <span aria-hidden="true">↓</span>
          </button>
        </div>

        {/* the specimen, upper-right, with its raking accent light. Capped small
            on phones so the headline and primary CTA stay above the fold; full
            size from md up where the split layout gives it room. */}
        <div className="order-1 flex justify-center md:order-2 md:col-span-6 md:justify-end">
          <div className="v2-refract relative mx-auto w-full max-w-[290px] sm:max-w-[360px] md:mx-0 md:max-w-[460px]">
            <div className="v2-rim" aria-hidden="true" />
            <div className="v2-enter relative" style={{ '--i': 4 } as React.CSSProperties}>
              <PitchSpecimenCard entry={featured} maxWidth={460} foil priority />
              <p
                className="rfx-stamp pointer-events-none absolute -right-3 top-3 z-10 hidden md:inline-block"
                style={{ color: '#F6F1E6', background: 'rgba(10,9,8,.72)', transform: 'rotate(3deg)' }}
              >
                Specimen {featured.display.specimenNo}
                {isChase ? ' · gold 1/1' : null}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
