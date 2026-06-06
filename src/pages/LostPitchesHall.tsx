import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { LOST_PITCHES, LOST_PITCH_TIERS, lostPitchesByTier } from '../data/lost-pitches'
import { LostPitchCard } from '../components/lost-pitches/LostPitchCard'
import { TierMarker } from '../components/layout/TierMarker'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'

/*
  Lost Pitches of the Negro Leagues. A wing built on one honest asymmetry: the
  statistics are being recovered, the technique mostly never will be. Filed by
  documentation tier, because how solid the record is matters more here than
  anywhere else on the site. The documented anchors lead — the hesitation pitch,
  the only one with a hard paper trail. The legend tier is kept on purpose, flagged,
  to show the difference between a sourced record and a good story.
*/
export function LostPitchesHall() {
  const count = LOST_PITCHES.length

  useSeoMeta({
    title: `Lost Pitches of the Negro Leagues | ${SITE.siteName}`,
    description:
      'The pitches and the arms the box scores cannot hold: Satchel Paige’s banned hesitation pitch, Hilton Smith’s documented curve, the doctored-ball craft that diverged from the segregated majors. Filed by how solid the record is. Sourced, not corrected.',
    ogTitle: `Lost Pitches of the Negro Leagues | ${SITE.siteName}`,
    ogDescription: 'The pitches the record cannot hold, filed by how well they survive. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/lost-pitches`,
  })

  return (
    <>
      <SectionHero
        accent="seam"
        breadcrumb={
          <Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Lost Pitches' }]} />
        }
        eyebrow="The recovered archive"
        title="Lost Pitches of the Negro Leagues."
        sub={
          <>
            The statistics are being recovered; the technique mostly never will be. Filed by how solid the
            record is — documented anchors first, legend flagged.
          </>
        }
      />

      {count === 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <p className="text-lg text-ink-2">The archive is being filed.</p>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          {LOST_PITCH_TIERS.map((t, idx) => {
            const entries = lostPitchesByTier(t.tier)
            if (entries.length === 0) return null
            return (
              <div key={t.tier} className={idx > 0 ? 'mt-16' : ''}>
                <TierMarker index={t.index} label={t.label} />
                <p className="mb-8 max-w-[64ch] text-base leading-relaxed text-ink-2">{t.note}</p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {entries.map((p) => (
                    <LostPitchCard key={p.slug} pitch={p} />
                  ))}
                </div>
              </div>
            )
          })}

          <div className="mt-16 rounded-sm border border-dashed border-seam/30 p-6">
            <p className="mono-label text-seam">Why the tiers</p>
            <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-2">
              Segregated record-keeping, almost no surviving film, barnstorming with no institutional
              archive, doctored pitches that were permitted in Black baseball and banned in the white
              one, and a culture of self-promotion that turned pitch names into ticket sales: five forces
              erased the technical record. The tier on each plate is how we stay honest about which of
              those forces we beat and which we did not.
            </p>
          </div>
        </section>
      )}
    </>
  )
}
