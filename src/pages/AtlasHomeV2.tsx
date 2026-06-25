import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, truncateForMeta } from '../lib/seo'
import { HeroCase } from '../components/v2/HeroCase'
import { MissionCase } from '../components/v2/MissionCase'
import { RefractionBridge } from '../components/v2/RefractionBridge'
import { ChromeWall } from '../components/v2/ChromeWall'
import { TheRead } from '../components/v2/TheRead'
import { WingsNav } from '../components/v2/WingsNav'
import { ToolsLab } from '../components/v2/ToolsLab'
import { FieldManual } from '../components/v2/FieldManual'
import { ProvenanceStrip } from '../components/v2/ProvenanceStrip'
import { CloseCta } from '../components/v2/CloseCta'

/*
  The Refractor Case — the home. A bolder staging of the atlas on matte Topps-Now
  black: the cinematic specimen pull, the seam flattening into its 2D twin, the
  filed set as a chrome wall that flips to sourced backs, the grip-and-shape read,
  the other wings, the tools, the craft record, and the provenance model as a
  feature. Promoted from /v2 to / once it carried the whole atlas; the old
  editorial home was retired in the same change. Every visible reading is the real
  PITCHES data wearing its real source.
*/
export function AtlasHomeV2() {
  const featured = PITCHES[0]

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
      <MissionCase />
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
