import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { MovementMap } from '../components/sections/MovementMap'

/*
  The movement map page. The whole filed arsenal on one quadrant, with the
  handedness mirror. The reading lives below the plot so the diagram leads.
*/
export function MovementMapPage() {
  useSeoMeta({
    title: `The movement map: every pitch on one quadrant | ${SITE.siteName}`,
    description:
      "Every filed pitch on one catcher's-eye quadrant — induced vertical break against horizontal break — with a right-handed / left-handed mirror. The classic movement chart, aggregated and sourced.",
    ogTitle: `The movement map | ${SITE.siteName}`,
    ogDescription: 'Every filed pitch on one quadrant. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/movement-map`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={
          <Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Movement map' }]} />
        }
        eyebrow="The quadrant"
        title="Every pitch, on one quadrant."
        sub={
          <>
            One catcher's-eye chart: how much each filed pitch rides or drops, and how much it runs or
            sweeps, against a spinless ball at center. Flip the handedness to see the mirror — a slider runs
            the other way for the other arm.
          </>
        }
      />

      <section>
        <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
          <MovementMap />
          <p className="mt-10 max-w-[72ch] border-t border-[rgba(255,255,255,0.12)] pt-6 text-sm leading-relaxed text-ink-2">
            A schematic scaled from each pitch's sourced break figures, not a measured trajectory. The
            break numbers live on each specimen page with their sources; this view only arranges them. To
            read the axes — what ride, drop, run, and sweep mean and why a tilt of the spin axis produces
            them — see{' '}
            <a href="/learn/spin" className="text-cyan underline-offset-2 hover:underline">
              Spin &amp; Movement
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}
