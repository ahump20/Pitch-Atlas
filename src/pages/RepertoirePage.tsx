import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { REPERTOIRE } from '../data/repertoire'
import { LOST_PITCHES } from '../data/lost-pitches'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { PitchIndex } from '../components/sections/PitchIndex'

/*
  The Pitch Index: the front door, struck in the refractor language. A short
  athletic header on the void, then the searchable, family-grouped directory that
  routes to a real page for any pitch. A filed pitch opens its full specimen; an
  unfiled one opens its basic file. The Lost Pitches wing lives one click away.
  The philosophy lives on /sources.
*/
export function RepertoirePage() {
  const count = REPERTOIRE.length + LOST_PITCHES.length

  useSeoMeta({
    title: `The Pitch Index: every pitch, by family | ${SITE.siteName}`,
    description:
      'A searchable index of every accepted pitch a coach, a pitcher, or the tracking taxonomy would name — plus the lost pitches of the Negro Leagues. Each one a sourced one-liner, labeled by confidence. Open any file.',
    ogTitle: `The Pitch Index | ${SITE.siteName}`,
    ogDescription: 'Every accepted pitch, by family. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/repertoire`,
  })

  return (
    <div className="mx-auto max-w-[1240px] px-5 md:px-8">
      <div className="pt-6">
        <Breadcrumb trail={[{ label: 'Pitch Atlas', to: '/' }, { label: 'The Pitch Index' }]} />
      </div>

      <header className="pb-2">
        <p className="rfx-skick">The front door</p>
        <h1 className="rfx-athletic rfx-skew rfx-stroke mt-3 text-bone" style={{ fontSize: 'clamp(40px,8vw,86px)' }}>
          The Pitch <span className="rfx-holo">Index</span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
          Every accepted pitch, by family, plus the honest edges: an alias, an illusion, a colloquialism
          that is not a pitch, and the banned doctored balls. A filed pitch opens its full specimen; an
          unfiled one opens a basic file with its sourced one-liners. Nothing fabricates geometry for a
          pitch the atlas has not measured.
          <span className="mt-3 block font-mono text-xs uppercase tracking-[0.12em] text-bone-2/70">
            {count} pitches filed
          </span>
        </p>
      </header>

      <PitchIndex />
    </div>
  )
}
