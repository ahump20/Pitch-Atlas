import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { SITE } from '../config/site'
import { HomeHero } from '../components/sections/HomeHero'
import { HowItWorks } from '../components/sections/HowItWorks'
import { PitchFamilyRail } from '../components/sections/PitchFamilyRail'
import { CraftsmenTeaser } from '../components/sections/CraftsmenTeaser'

/*
  The Atlas home: a table of contents into the three wings. The hero states the
  product, How it works names the three layers, the catalog lists every pitch as
  its own page, and the Craftsmen teaser opens the hall. No single pitch leads
  the page; the four-seam is only the hero's specimen actor.
*/
export function AtlasHome() {
  useSeoMeta({
    title: `${SITE.siteName}: The Living Field Manual for Pitching Grips`,
    description:
      'A living field manual for pitching grips: textbook foundations, verified master variants, and the craftsmen who defined the craft. Every claim labeled by its source.',
    ogTitle: `${SITE.siteName}: the living field manual for pitching grips`,
    ogDescription:
      'Textbook foundations, verified master variants, and the craftsmen who defined the craft. Sourced, not corrected.',
    ogUrl: SITE.canonicalDomain,
    twitterCard: 'summary_large_image',
  })

  return (
    <>
      <HomeHero featured={PITCHES[0]} />
      <HowItWorks />
      <PitchFamilyRail />
      <CraftsmenTeaser />
    </>
  )
}
