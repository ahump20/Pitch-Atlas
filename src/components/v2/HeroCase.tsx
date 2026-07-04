import { Link } from 'react-router-dom'
import { Button } from '../ds/Button'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { accentForSlug } from '../refractor/accents'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'
import { featuredCraftsmanMedia } from '../../data/media/craftsmen'

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
  const mediaLead = featuredCraftsmanMedia()[0]

  return (
    <section
      id="case"
      data-scene-tint={accent.c3}
      className="v2-stage v2-tooth relative overflow-hidden"
      style={{ '--c3': accent.c3 } as React.CSSProperties}
    >
      <div
        className="pa-atmo pa-atmo-specimen-stage opacity-[0.28] md:opacity-[0.36]"
        style={{ backgroundPosition: '58% 46%' }}
        aria-hidden="true"
      />
      {/* phone spacing runs tighter (gap-7 / pt-6) so the specimen-first order
          still lands the headline AND the primary CTA inside the first screen */}
      <div className="relative z-[1] mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-7 px-5 pb-16 pt-6 md:min-h-[calc(100dvh-4.5rem)] md:grid-cols-12 md:gap-6 md:px-8 md:pb-24 md:pt-12">
        {/* the read, lower-left */}
        <div className="order-2 md:order-1 md:col-span-6 md:self-center">
          <p
            className="rfx-stamp v2-enter w-fit [text-wrap:balance]"
            style={{ color: '#F2ECDD', background: 'rgba(10,9,8,.7)', borderColor: 'rgba(242,236,221,.5)', '--i': 0 } as React.CSSProperties}
          >
            {SITE.brandLine}
          </p>

          <h1
            className="rfx-athletic v2-display v2-enter mt-5 text-[clamp(40px,8.5vw,84px)] leading-[0.98] [text-wrap:balance] md:leading-[0.92]"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            The pitch,
            <br className="hidden md:inline" />
            {' '}
            struck as a specimen.
          </h1>

          <p
            className="v2-enter mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-bone-2 md:mt-5 md:text-base"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            Every pitch has a file. Every grip has a history. Open the atlas, study the hold,
            and carry forward what the next pitcher shouldn't have to rebuild from rumor.
          </p>

          <div
            className="v2-enter mt-5 flex flex-wrap items-center gap-3 md:mt-7"
            style={{ '--i': 3 } as React.CSSProperties}
          >
            <Button as={Link} to="/repertoire" variant="chrome" arrow>
              Open the Pitch Index
            </Button>
            <Button as={Link} to="/about" variant="ghost" arrow>
              Read the mission
            </Button>
          </div>

          {mediaLead ? (
            <Link
              to={`/craftsmen/${mediaLead.craftsmanSlug}`}
              className="v2-enter mt-6 grid max-w-[34rem] grid-cols-[auto_1fr] gap-3 rounded-sm border border-bone/15 bg-[rgba(11,10,9,0.82)] p-4 text-left transition-colors hover:border-cyan/45"
              style={{ '--i': 4 } as React.CSSProperties}
            >
              <span className="grid h-11 w-11 place-items-center rounded-sm border border-cyan/35 bg-cyan/10 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan">
                Film
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2/80">
                  Film filed to {mediaLead.craftsmanName}
                </span>
                <span className="mt-1 block font-athletic text-[20px] uppercase leading-none text-bone">
                  {mediaLead.title}
                </span>
                <span className="mt-1.5 block text-[13px] leading-snug text-bone-2">
                  Source-owned embed. Opens in the Craftsman file.
                </span>
              </span>
            </Link>
          ) : null}

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
              {/* the card carries its own specimen plate; no second stamp over it */}
              <PitchSpecimenCard entry={featured} maxWidth={460} foil priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
