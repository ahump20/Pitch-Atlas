import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { SITE } from '../config/site'
import { HomeHero } from '../components/sections/HomeHero'
import { HowItWorks } from '../components/sections/HowItWorks'
import { PitchFamilyRail } from '../components/sections/PitchFamilyRail'
import { RepertoireTeaser } from '../components/sections/RepertoireTeaser'
import { CraftsmenTeaser } from '../components/sections/CraftsmenTeaser'
import { LostPitchesTeaser } from '../components/sections/LostPitchesTeaser'

/*
  The Atlas home: a table of contents into the wings, in expanding scope. The hero
  states the product and How it works names the layers; the catalog opens the filed
  specimens (the deep 3D pages); the Repertoire zooms out to every accepted pitch;
  the Craftsmen teaser opens the hall of arms; and Lost Pitches opens the Negro
  Leagues archive. No single pitch leads the page; the four-seam is only the hero's
  specimen actor.
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
      <RepertoireTeaser />
      <CraftsmenTeaser />
      <LostPitchesTeaser />
    </>
  )
}
