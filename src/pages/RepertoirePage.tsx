import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { INDEX_SCOPE } from '../lib/index-scope'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { IndexLedger } from '../components/sections/IndexLedger'
import { PitchIndex } from '../components/sections/PitchIndex'

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
      'A searchable index of every accepted pitch a coach, a pitcher, or the tracking taxonomy would name — plus the lost pitches of the Negro Leagues. Each one a sourced one-liner, labeled by confidence. Open any file.',
    ogTitle: `The Pitch Index | ${SITE.siteName}`,
    ogDescription: 'Every accepted pitch, by family. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/repertoire`,
  })

  return (
    <div className="scene-coal">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
      <div className="pt-6">
        <Breadcrumb trail={[{ label: 'Pitch Atlas', to: '/' }, { label: 'The Pitch Index' }]} />
      </div>

      {/* the header's right hand carries the counted shelf on desktop; on a
          phone it stacks below the lede as its own single column */}
      <header className="grid items-end gap-6 pb-2 md:grid-cols-[minmax(0,1fr)_300px] md:gap-10">
        <div>
          <p className="rfx-skick">The front door</p>
          <h1 className="rfx-athletic rfx-skew rfx-stroke mt-3 text-bone" style={{ fontSize: 'clamp(40px,8vw,86px)' }}>
            The Pitch <span className="rfx-holo">Index</span>
          </h1>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
            Every accepted pitch, by family, plus the honest edges: an alias, an illusion, a colloquialism
            that is not a pitch, and the banned doctored balls. A filed pitch opens its full specimen; an
            unfiled one opens a basic file with its sourced one-liners. Nothing fabricates geometry for a
            pitch the atlas has not measured. The shelf holds {INDEX_SCOPE.headline} —{' '}
            {INDEX_SCOPE.breakdown}.
          </p>
        </div>
        <IndexLedger />
      </header>

      <PitchIndex />
      </div>
    </div>
  )
}
