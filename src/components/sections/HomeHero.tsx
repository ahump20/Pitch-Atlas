import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'
import { MediaStage } from '../media/MediaStage'
import { gripEntryFor } from '../../data/grips'

/*
  The home hero: the hand carries the page. Austin's own 12-6 grip clip runs full-bleed
  behind everything, dimmed under the scrim so the chrome wordmark and bone type sit on
  real footage instead of empty void. The featured pitch (the four-seam, specimen 00,
  the gold 1/1) stays the signature artifact, struck as the one large card on the page,
  its own grip clip looping in the window. On desktop the claim sits left and the card
  right; on mobile the claim leads and a right-sized card follows in the same screen.
  The backdrop is decorative (aria-hidden) — the card carries the named media.
*/
const heroBackdrop = gripEntryFor('twelve-six')?.clip

export function HomeHero({ featured }: { featured: PitchAtlasEntry }) {
  return (
    <section id="top" className="relative overflow-hidden">
      {heroBackdrop ? (
        <>
          <MediaStage
            clip={heroBackdrop}
            variant="bleed"
            priority
            decorative
            scrim={false}
            className="[&_.pa-stage-media]:opacity-40"
          />
          {/* claim-side darkening: the type needs a quiet field, the footage stays legible at right */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(100deg, rgba(7,5,9,.94) 0%, rgba(7,5,9,.72) 38%, rgba(7,5,9,.34) 64%, rgba(7,5,9,.55) 100%), linear-gradient(to top, var(--color-void) 0%, transparent 30%)',
            }}
          />
        </>
      ) : null}
      <div className="relative z-[2] mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-7 px-5 pb-11 pt-7 md:min-h-[calc(100dvh-7rem)] md:grid-cols-12 md:gap-8 md:px-8 md:pb-20 md:pt-16">
        <div className="md:col-span-6">
          <p className="mono-label-stage inline-flex items-center gap-2">
            <i className="rfx-dot" style={{ background: 'var(--color-ok-bright)', color: 'var(--color-ok-bright)' }} aria-hidden="true" />
            {SITE.siteName} · {SITE.sourcePrinciple}
          </p>
          <h1 className="rfx-athletic rfx-skew rfx-stroke mt-3 text-bone md:mt-4" style={{ fontSize: 'clamp(46px,11vw,104px)' }}>
            Pitch <span className="rfx-chrome-text">Atlas</span>
          </h1>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-bone-2 md:mt-5 md:text-lg">
            Every pitch, struck as a sourced specimen — the grip, the movement, and the craftsmen who
            made it move. The foil is decoration. The readings are not.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-9">
            <a
              href="#index"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('index')
              }}
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-[#06121b] transition-transform active:translate-y-px"
              style={{ background: 'var(--color-cyan)', boxShadow: '0 6px 24px -8px var(--color-cyan)' }}
            >
              Open the set
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              to="/craftsmen"
              className="inline-flex items-center gap-2 rounded-md border border-bone/30 px-5 py-3 font-mono text-sm uppercase tracking-wide text-bone transition-colors hover:border-bone"
            >
              Meet the Craftsmen
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="relative mx-auto w-full max-w-[clamp(208px,62vw,272px)] md:max-w-[460px]">
            <div
              aria-hidden="true"
              className="absolute inset-[-10%] rounded-[44px]"
              style={{
                background:
                  'radial-gradient(58% 48% at 50% 28%, color-mix(in srgb, var(--color-cyan) 18%, transparent), transparent 70%)',
              }}
            />
            <PitchSpecimenCard entry={featured} maxWidth={460} />
          </div>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3 md:hidden">
            Specimen 00 · the gold 1/1 · tap to open
          </p>
        </div>
      </div>
    </section>
  )
}
