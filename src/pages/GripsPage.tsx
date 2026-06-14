import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { GripLibrary, AttackPlan } from '../components/sections/GripLibrary'
import { GripCompare } from '../components/sections/GripCompare'

/*
  The Grip Library. The page leads with the real article — photographed grips in
  one pitcher's hand, owned outright, captioned in his own words (the visual,
  clean-channel layer the atlas was built to carry). The "same release, different
  grip" comparison tool follows as the interactive payoff: the schematic balls let
  you turn any two grips together to feel the deception a hitter faces.
*/
export function GripsPage() {
  useSeoMeta({
    title: `The Grip Library: real grips, in the hand | ${SITE.siteName}`,
    description:
      'Real photographs of every grip in one pitcher’s hand — four-seam, two-seam, 12-6 curve, splitter, and two changeups — captioned in his own words. Owned outright, sourced not corrected. Plus the same-release, different-grip comparison tool.',
    ogTitle: `The Grip Library | ${SITE.siteName}`,
    ogDescription: 'Real grips, in the hand. The part a hitter never gets to see. Sourced, not corrected.',
    ogUrl: canonicalUrl('/grips'),
    ...ogImageMeta('grips', 'The Grip Library — real grips, in the hand'),
  })

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/grips'),
          name: 'The Grip Library: real grips, in the hand',
          description:
            'Real photographs of every grip in one pitcher’s hand — four-seam, two-seam, 12-6 curve, splitter, and two changeups — captioned in his own words. Owned outright, sourced not corrected.',
          breadcrumb: [{ name: 'The Atlas', to: '/' }, { name: 'Grip Library' }],
        })}
      />
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Grip Library' }]} />}
        eyebrow="Grip library"
        title="Grips, from the hand."
        sub={
          <>
            The grip is the one thing a hitter never gets to see. These are the real ones — photographed in
            one pitcher&rsquo;s hand, on his own ball, owned outright and captioned in his own words. Not the
            textbook&rsquo;s idea of correct; one arm&rsquo;s actual hold. Sourced, not corrected.
          </>
        }
      />

      {/* the grip theater: footage and film read in the dark */}
      <div className="scene-coal">
      <section>
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16">
          <GripLibrary />
        </div>
      </section>

      <section className="border-t border-ink/15">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16">
          <AttackPlan />
        </div>
      </section>

      <section className="border-t border-ink/15 bg-press">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16">
          <p className="rfx-skick text-cyan">Same release, different grip</p>
          <h2 className="rfx-stitle mt-3 text-[clamp(26px,4.4vw,46px)]">Two grips, one arm slot</h2>
          <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
            A hitter reads the delivery, not the hand. Put two grips side by side under one shared arm slot and
            the trick becomes obvious: the part they can see is identical, and the part that decides the pitch is
            the part they can&rsquo;t. These balls are our own seam geometry, oriented to the grip — schematic,
            not a hand — and with no WebGL they fall back to the 2D seam diagram, so the grip still reads.
          </p>
          <div className="mt-9">
            <GripCompare />
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
