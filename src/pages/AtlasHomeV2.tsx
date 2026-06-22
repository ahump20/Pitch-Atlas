import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, truncateForMeta } from '../lib/seo'
import { HeroCase } from '../components/v2/HeroCase'
import { RefractionBridge } from '../components/v2/RefractionBridge'
import { ChromeWall } from '../components/v2/ChromeWall'
import { TheRead } from '../components/v2/TheRead'
import { WingsNav } from '../components/v2/WingsNav'
import { ToolsLab } from '../components/v2/ToolsLab'
import { FieldManual } from '../components/v2/FieldManual'
import { ProvenanceStrip } from '../components/v2/ProvenanceStrip'
import { CloseCta } from '../components/v2/CloseCta'

/*
  v2 · The Refractor Case. A bolder staging of the atlas on matte Topps-Now
  black: the cinematic specimen pull, the seam flattening into its 2D twin, the
  filed set as a chrome wall that flips to sourced backs, the grip-and-shape
  read, and the provenance model as a feature. A prototype route, additive and
  regression-free; the live home at / is untouched. Every visible reading is the
  real PITCHES data wearing its real source.
*/
export function AtlasHomeV2() {
  const featured = PITCHES[0]

  useSeoMeta({
    // A prototype route: prerendered and shareable by direct link, but kept out
    // of the index (and the sitemap) until promoted, so it never competes with
    // the live home for duplicate content.
    robots: 'noindex, follow',
    title: `${SITE.siteName}: The Living Field Manual for Pitching Grips`,
    description: truncateForMeta(
      'Every pitch struck as a chrome specimen on matte stock — grip first, the shape in plain words, a source on every claim. Sourced, not corrected.',
    ),
    ogTitle: `${SITE.siteName}: ${SITE.brandLine}`,
    ogDescription: 'Every pitch struck in chrome and sourced — grip first, a source on every line.',
    ogUrl: canonicalUrl('/v2'),
    ...ogImageMeta('home', `${SITE.siteName}: every pitch, gripped and sourced`),
  })

  return (
    <>
      <HeroCase featured={featured} />
      <RefractionBridge featured={featured} />
      <ChromeWall />
      <TheRead featured={featured} />
      {/* the landing opens into the rest of the atlas: the other wings, the
          tools, then the pedagogy — so the page leads onward instead of ending
          on the deep read. */}
      <WingsNav />
      <ToolsLab />
      <FieldManual />
      <ProvenanceStrip />
      <CloseCta />
    </>
  )
}
