import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { INDEX_SCOPE } from '../lib/index-scope'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { IndexLedger } from '../components/sections/IndexLedger'
import { PitchIndex } from '../components/sections/PitchIndex'
import { LineageMap } from '../components/repertoire/LineageMap'

/*
  The Pitch Index: the front door, struck in the refractor language. The whole
  page is a coal scene — the board the set is handled on — with a short athletic
  header, then the searchable, family-grouped directory that routes to a real
  page for any pitch. A filed pitch opens its full specimen; an unfiled one
  opens its basic file. The Lost Pitches wing lives one click away. The
  philosophy lives on /sources.
*/
export function RepertoirePage() {
  useSeoMeta({
    title: `The Pitch Index: every pitch, by family | ${SITE.siteName}`,
    description:
      'A searchable taxonomy of every accepted pitch a coach, a pitcher, or the tracking language would name. Each file keeps its source, confidence label, and honest edge.',
    ogTitle: `The Pitch Index | ${SITE.siteName}`,
    ogDescription: 'Every accepted pitch, by family.',
    ogUrl: canonicalUrl('/repertoire'),
    ...ogImageMeta('repertoire', 'The Pitch Index: every accepted pitch, by family'),
  })

  return (
    <div className="scene-coal">
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/repertoire'),
          name: 'The Pitch Index: every pitch, by family',
          description:
            'A searchable taxonomy of every accepted pitch a coach, a pitcher, or the tracking language would name. Each file keeps its source, confidence label, and honest edge.',
          breadcrumb: [{ name: 'Pitch Atlas', to: '/' }, { name: 'The Pitch Index' }],
        })}
      />
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
      <div className="pt-6">
        <Breadcrumb trail={[{ label: 'Pitch Atlas', to: '/' }, { label: 'The Pitch Index' }]} />
      </div>

      <header className="pitch-index-header grid items-end gap-6 pb-4 md:grid-cols-[minmax(0,1fr)_300px] md:gap-10 md:pb-8">
        <div>
          <h1 className="rfx-athletic rfx-skew rfx-stroke mt-3 text-bone" style={{ fontSize: 'clamp(40px,8vw,86px)' }}>
            The Pitch <span className="rfx-holo">Index</span>
          </h1>
          <p className="pitch-index-intro mt-4 max-w-[58ch] text-[15px] leading-relaxed text-bone-2">
            Every accepted pitch by family, plus the honest edges: aliases, illusions, and banned
            doctored balls. The shelf holds {INDEX_SCOPE.shelfLabel}; a filed pitch opens its full
            specimen, and a basic file stays honest until evidence earns more.
          </p>
        </div>
        <IndexLedger className="pitch-index-ledger hidden md:block" />
      </header>

      <PitchIndex />
      </div>

      {/* the whole accepted catalog as one map, a complement to the searchable rows */}
      <LineageMap />
    </div>
  )
}
