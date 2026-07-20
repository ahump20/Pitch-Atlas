import { Link } from 'react-router-dom'
import { Button } from '../ds/Button'
import type { PitchAtlasEntry } from '../../data/types'
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
      {/* Phones lead with the read and primary action; the specimen follows.
          Desktop keeps the off-axis specimen composition beside the read. */}
      <div className="v2-hero-grid relative z-[1] mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-7 px-5 pb-16 pt-6 md:min-h-[calc(100dvh-4.5rem)] md:grid-cols-12 md:gap-6 md:px-8 md:pb-24 md:pt-12">
        {/* the read, lower-left */}
        <div className="v2-hero-read order-1 md:col-span-6 md:self-center">
          <h1
            className="rfx-athletic v2-display v2-enter text-[clamp(40px,8.5vw,84px)] leading-[0.98] [text-wrap:balance] md:leading-[0.92]"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            The pitch,
            <br className="hidden md:inline" />
            {' '}
            struck as a <span className="rfx-holo">specimen.</span>
          </h1>

          <p
            className="v2-hero-lede v2-enter mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-bone-2 md:mt-5 md:text-base"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            Every pitch has a file; every grip has a history. Study the hold and carry it forward.
          </p>

          <div
            className="v2-enter mt-5 flex flex-wrap items-center gap-3 md:mt-7"
            style={{ '--i': 3 } as React.CSSProperties}
          >
            <Button as={Link} to="/repertoire" variant="chrome" arrow>
              Open the Pitch Index
            </Button>
            <Button as={Link} to="/about" variant="ghost" className="v2-secondary-cta" arrow>
              Read the mission
            </Button>
          </div>

        </div>

        {/* the specimen, upper-right, with its raking accent light. Capped small
            on phones so the headline and primary CTA stay above the fold; full
            size from md up where the split layout gives it room. */}
        <div className="order-2 flex justify-center md:col-span-6 md:justify-end">
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
