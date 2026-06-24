import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { MovementMap } from '../components/sections/MovementMap'

/*
  The movement map page. The whole filed arsenal on one quadrant, with the
  handedness mirror. The reading lives below the plot so the diagram leads.
*/
export function MovementMapPage() {
  useSeoMeta({
    title: `The shape map: every pitch by direction | ${SITE.siteName}`,
    description:
      "Every filed pitch on one catcher's-eye field by shape language: ride, drop, arm-side run, and glove-side sweep.",
    ogTitle: `The shape map | ${SITE.siteName}`,
    ogDescription: 'Every filed pitch by direction and character. Sourced, not corrected.',
    ogUrl: canonicalUrl('/movement-map'),
  })

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/movement-map'),
          name: 'The shape map: every pitch by direction',
          description:
            "Every filed pitch on one catcher's-eye field by shape language: ride, drop, arm-side run, and glove-side sweep.",
          breadcrumb: [{ name: 'The Atlas', to: '/' }, { name: 'Shape map' }],
        })}
      />
      <SectionHero
        breadcrumb={
          <Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Shape map' }]} />
        }
        eyebrow="The shape map"
        title="Every pitch, by direction."
        sub={
          <>
            One catcher's-eye field: whether each filed pitch rides or drops, and whether it runs or
            sweeps, against a spinless ball at center. Flip the handedness to see the mirror — a slider runs
            the other way for the other arm.
          </>
        }
      />

      <section>
        <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
          <MovementMap />
          <p className="mt-10 max-w-[72ch] border-t border-ink/15 pt-6 text-sm leading-relaxed text-ink-2">
            A schematic arranged by each pitch's sourced shape language, not a measured trajectory. To
            read the poles — what ride, drop, run, and sweep mean and why a tilt of the spin axis produces
            them — see{' '}
            <a href="/learn/spin" className="text-seam underline-offset-2 hover:underline">
              Spin &amp; Movement
            </a>
            .
          </p>
          <p className="mt-4 max-w-[72ch] text-sm leading-relaxed text-ink-2">
            Want the tracked version: induced break, spin rates, the numbers this page refuses to fake?
            That craft has its own keepers:{' '}
            <a href="https://baseballsavant.mlb.com" target="_blank" rel="noreferrer noopener" className="text-seam underline-offset-2 hover:underline">
              Baseball Savant ↗
            </a>{' '}
            and the{' '}
            <a href="https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" target="_blank" rel="noreferrer noopener" className="text-seam underline-offset-2 hover:underline">
              FanGraphs model primer ↗
            </a>
            . How to read them without losing the feel is its own wing:{' '}
            <a href="/learn/metrics" className="text-seam underline-offset-2 hover:underline">
              Reading Models
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}
