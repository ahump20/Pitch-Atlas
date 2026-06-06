import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { REPERTOIRE } from '../data/repertoire'
import { LOST_PITCHES } from '../data/lost-pitches'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { PitchIndex } from '../components/sections/PitchIndex'

/*
  The Pitch Index: the front door. Every accepted pitch by family, plus the lost
  pitches wing, in one searchable, filterable directory that routes to a real page
  for any pitch. The hero is short on purpose; the philosophy lives on /sources.
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
    <>
      <SectionHero
        breadcrumb={
          <Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'The Pitch Index' }]} />
        }
        eyebrow="The index"
        title="Every accepted pitch, by family."
        sub={
          <>
            Every accepted pitch, by family — plus the lost pitches of the Negro Leagues. Search, filter,
            open any file.
            {count > 0 ? (
              <span className="mt-4 block font-mono text-xs uppercase tracking-[0.12em] text-bone-2/70">
                {count} pitches filed
              </span>
            ) : null}
          </>
        }
      />
      <PitchIndex />
    </>
  )
}
