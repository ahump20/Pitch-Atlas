import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { TunnelPlot } from '../components/sections/TunnelPlot'

/*
  The compare / tunnel page. Two pitches on one frame: the shared release window
  and the late shape split. The reading lives below the plot so the diagram leads.
*/
export function ComparePage() {
  useSeoMeta({
    title: `Compare two pitches: the tunnel and the late shape split | ${SITE.siteName}`,
    description:
      'Pick any two filed pitches and see how they share a release tunnel and split late. The comparison reads direction and character, not measured separation.',
    ogTitle: `Compare two pitches | ${SITE.siteName}`,
    ogDescription: 'The tunnel and the late shape split, on one frame. Sourced, not corrected.',
    ogUrl: canonicalUrl('/compare'),
  })

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/compare'),
          name: 'Compare two pitches: the tunnel and the late shape split',
          description:
            'Pick any two filed pitches and see how they share a release tunnel and split late. The comparison reads direction and character, not measured separation.',
          breadcrumb: [{ name: 'The Atlas', to: '/' }, { name: 'Compare' }],
        })}
      />
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
            hand and only separate once the hitter has committed. Pick any two filed pitches and watch the
            shape split: which way each pitch wants to finish, and which one sets up the other.
          </>
        }
      />

      <section>
        <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
          <TunnelPlot />
          <p className="mt-10 max-w-[72ch] border-t border-ink/15 pt-6 text-sm leading-relaxed text-ink-2">
            The endpoints are each pitch's sourced shape direction, taken from the specimen records. The
            shared tunnel window and the paths leading to each endpoint are a schematic of the shared-release
            idea, not a measured trajectory. A hitter's real reaction window depends on the arm, the release,
            and the pitch sequence. For the full picture of why tunneling works, see{' '}
            <a href="/learn/sequencing" className="text-seam underline-offset-2 hover:underline">
              Sequencing &amp; Tunneling
            </a>
            .
          </p>
          <p className="mt-4 max-w-[72ch] text-sm leading-relaxed text-ink-2">
            The measured tunnel — release points, separation in inches, the tracked record — lives with
            the record-keepers:{' '}
            <a href="https://baseballsavant.mlb.com" target="_blank" rel="noreferrer noopener" className="text-seam underline-offset-2 hover:underline">
              Baseball Savant &#8599;
            </a>{' '}
            and the{' '}
            <a href="https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" target="_blank" rel="noreferrer noopener" className="text-seam underline-offset-2 hover:underline">
              FanGraphs model primer &#8599;
            </a>
            . How to read them is its own wing:{' '}
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
