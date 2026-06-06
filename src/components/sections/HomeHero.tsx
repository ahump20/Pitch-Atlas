import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { BallStage } from '../ball/BallStage'

/*
  The home hero on the void: the holographic wordmark states the product, the live
  seam-true ball is the one 3D actor (it degrades to the SVG schematic with no
  WebGL), and the two calls open the set and the Craftsmen hall. Foil is
  decoration; the readings are sourced.
*/
/* A floating annotation pinned around the hero ball: a glowing dot + a sourced
   one-liner, so the ball reads as an instrument, not a decoration. */
function HeroBadge({ className, color, label }: { className: string; color: string; label: string }) {
  return (
    <span
      className={`absolute inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#08080e]/75 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-bone backdrop-blur ${className}`}
    >
      <i className="rfx-dot" style={{ background: color, color }} aria-hidden="true" />
      {label}
    </span>
  )
}

export function HomeHero({ featured }: { featured: PitchAtlasEntry }) {
  const { canonical, display, seam, motion } = featured
  const ride = `${motion.ivbInches > 0 ? '+' : ''}${motion.ivbInches}″ induced ride`

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
          <div className="relative mx-auto aspect-square w-full max-w-[min(86vw,540px)]">
            <div
              aria-hidden="true"
              className="absolute inset-[6%] rounded-full"
              style={{ background: 'radial-gradient(circle at 50% 44%, rgba(238,240,246,0.14), transparent 62%)' }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, color-mix(in srgb, var(--color-cyan) 40%, transparent), transparent 40%)',
                mask: 'radial-gradient(closest-side, transparent 78%, #000 79%)',
                WebkitMask: 'radial-gradient(closest-side, transparent 78%, #000 79%)',
                animation: 'rfx-spin 18s linear infinite',
              }}
            />
            <BallStage
              entry={featured}
              grip
              faceGrip
              autoSpin={false}
              surface="stage"
              view={canonical.gripModel.defaultView}
              className="h-full w-full"
            />
            <HeroBadge className="left-[-2%] top-[7%]" color="var(--color-cyan)" label="Spin axis, authored" />
            <HeroBadge className="bottom-[14%] right-[-3%]" color="var(--color-seam-bright)" label="Seam, real geometry" />
            <HeroBadge className="bottom-[-2%] left-[16%]" color="var(--color-ok-bright)" label={`${ride} · official data`} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-end">
            <p className="mono-label-stage">Specimen {display.specimenNo}</p>
            <p className="mono-label-stage">{seam.accuracyLevel}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
