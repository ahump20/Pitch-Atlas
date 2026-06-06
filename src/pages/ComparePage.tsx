import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { TunnelPlot } from '../components/sections/TunnelPlot'

/*
  The compare / tunnel page. Two pitches on one frame: the shared release window,
  and the late separation between their sourced break locations. The reading lives
  below the plot so the diagram leads.
*/
export function ComparePage() {
  useSeoMeta({
    title: `Compare two pitches: the tunnel and the late break | ${SITE.siteName}`,
    description:
      'Pick any two filed pitches and see how they share a release tunnel and split late. The separation between their sourced break locations — the gap a hitter must cover after committing — measured in inches, with a right- and left-handed mirror.',
    ogTitle: `Compare two pitches | ${SITE.siteName}`,
    ogDescription: 'The tunnel and the late break, on one frame. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/compare`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={
          <Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Compare' }]} />
        }
        eyebrow="The tunnel"
        accent="powder"
        title="Two pitches, one tunnel."
        sub={
          <>
            Deception is shared early flight. From the same arm slot, two pitches look like one out of the
            hand and only separate once the hitter has committed. Pick any two filed pitches and watch the gap
            open: how far apart they end up at the plate, and which one sets up the other.
          </>
        }
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
          <TunnelPlot />
          <p className="mt-10 max-w-[72ch] border-t border-navy/12 pt-6 text-sm leading-relaxed text-ink-2">
            The two endpoints are each pitch's sourced induced-vertical and horizontal break, taken from the
            specimen records; the separation between them is real geometry. The shared tunnel window and the
            paths leading to each endpoint are a schematic of the shared-release idea, not a measured
            trajectory — a hitter's real reaction window and the exact commitment point depend on velocity,
            extension, and release height. For the full picture of why tunneling works, see{' '}
            <a href="/learn/sequencing" className="text-columbia underline-offset-2 hover:underline">
              Sequencing &amp; Tunneling
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}
