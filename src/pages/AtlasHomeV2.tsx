import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { useSceneTint } from '../hooks/useSceneTint'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, truncateForMeta } from '../lib/seo'
import { HeroCase } from '../components/v2/HeroCase'
import { RefractionBridge } from '../components/v2/RefractionBridge'
import { ChromeWall } from '../components/v2/ChromeWall'
import { WingsNav } from '../components/v2/WingsNav'
import { CloseCta } from '../components/v2/CloseCta'

/*
  The Refractor Case — the home. Five deliberate beats: specimen, seam, filed set,
  wings, close. The deeper teaching, tools, provenance, and archive material keep
  their own routes instead of making the front door repeat the whole product.
  Every visible reading is real PITCHES data wearing its real source.
*/
export function AtlasHomeV2() {
  const featured = PITCHES[0]

  // the room follows the chapter: each section below tags its accent with
  // data-scene-tint; this publishes the active one to the far stratum.
  useSceneTint()

  useSeoMeta({
    // The published home: indexable, canonical at / (RootLayout sets the canonical
    // link from the pathname), and the only homepage now the editorial home is gone.
    title: `${SITE.siteName}: The Living Archive of Pitching Craft`,
    description: truncateForMeta(
      'A grip-first archive for preserving and progressing pitch craft: grips, variants, feel cues, forgotten experiments, master examples, and field notes.',
    ),
    ogTitle: `${SITE.siteName}: ${SITE.brandLine}`,
    ogDescription: 'Every pitch struck as a sourced specimen: grip first, lineage intact, no invented certainty.',
    ogUrl: canonicalUrl('/'),
    ...ogImageMeta('home', `${SITE.siteName}: every pitch, gripped and sourced`),
  })

  return (
    <>
      <HeroCase featured={featured} />
      <RefractionBridge featured={featured} />
      <ChromeWall />
      <WingsNav />
      <CloseCta />
    </>
  )
}
