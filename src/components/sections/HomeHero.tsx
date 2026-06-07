import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'

/*
  The home hero on the void. The holographic wordmark states the product; the front
  door IS the signature artifact — the featured pitch (the four-seam, specimen 00, the
  gold 1/1) struck as a large, alive holographic card, its real grip clip looping in the
  window. The two calls open the set and the Craftsmen hall. The 3D seam-true ball still
  lives on every /pitch/<slug> chapter; the home leads with the card theme. Foil is
  decoration; the readings on the card are sourced.
*/
export function HomeHero({ featured }: { featured: PitchAtlasEntry }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="relative mx-auto grid min-h-[calc(100dvh-7rem)] max-w-[1320px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-12 md:gap-8 md:px-8 md:pb-20 md:pt-16">
        <div className="order-2 md:order-1 md:col-span-6">
          <p className="mono-label-stage inline-flex items-center gap-2">
            <i className="rfx-dot" style={{ background: 'var(--color-ok-bright)', color: 'var(--color-ok-bright)' }} aria-hidden="true" />
            {SITE.siteName} · {SITE.sourcePrinciple}
          </p>
          <h1 className="rfx-athletic rfx-skew rfx-stroke mt-4 text-bone" style={{ fontSize: 'clamp(44px,9vw,104px)' }}>
            Pitch <span className="rfx-holo">Atlas</span>
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-bone-2">
            Every pitch, struck as a sourced specimen — the grip, the movement, and the craftsmen who
            made it move. The foil is decoration. The readings are not.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
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

        <div className="order-1 md:order-2 md:col-span-6">
          <div className="relative mx-auto w-full max-w-[460px]">
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
        </div>
      </div>
    </section>
  )
}
