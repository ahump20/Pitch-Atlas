import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { GripCompare } from '../components/sections/GripCompare'

/*
  Grip Theater, two-up. Two grips under one shared arm slot — the deception of
  "same release, different grip" made visible. The stage leads; the payoff (what
  the two pitches do after release) lives on the movement tunnel, linked below.
*/
export function GripsPage() {
  useSeoMeta({
    title: `Same release, different grip: compare two grips | ${SITE.siteName}`,
    description:
      'Two filed grips side by side under one shared arm slot — turn the view and both balls turn together. The deception a hitter faces is that the delivery is identical and only the grip, the part they cannot see, has changed.',
    ogTitle: `Same release, different grip | ${SITE.siteName}`,
    ogDescription: 'Two grips, one arm slot — the deception, made visible. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/grips`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Compare grips' }]} />}
        eyebrow="Grip theater"
        title="Same release, different grip."
        sub={
          <>
            A hitter reads the delivery, not the hand. Put two grips side by side under one shared arm slot and
            the trick becomes obvious: the part they can see is identical, and the part that decides the pitch
            is the part they can&rsquo;t.
          </>
        }
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16">
          <GripCompare />
          <p className="mt-10 max-w-[72ch] border-t border-navy/12 pt-6 text-sm leading-relaxed text-ink-2">
            Each ball is our own seam geometry, oriented to the grip — schematic, not a player&rsquo;s hand. With
            no WebGL it falls back to the 2D seam diagram from the same geometry, so the grip still reads.
          </p>
        </div>
      </section>
    </>
  )
}
