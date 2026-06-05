import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { LOST_PITCHES, LOST_PITCH_TIERS, lostPitchesByTier } from '../data/lost-pitches'
import { LostPitchCard } from '../components/lost-pitches/LostPitchCard'
import { TierMarker } from '../components/layout/TierMarker'

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
      <section className="on-stage relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]" aria-hidden="true">
          <div className="h-full w-full bg-[radial-gradient(circle_at_70%_30%,rgba(200,16,46,0.16),transparent_40%),linear-gradient(115deg,rgba(242,236,221,0.07)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-2/80">
            <Link to="/" className="transition-colors hover:text-bone">The Atlas</Link>
            <span aria-hidden="true">/</span>
            <span className="text-bone-2">Lost Pitches</span>
          </nav>
          <p className="mono-label-stage">The recovered archive</p>
          <h1 className="display mt-4 max-w-[16ch] text-[2.6rem] leading-[1.0] text-bone md:text-[4.4rem]">
            Lost Pitches of the Negro Leagues.
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-bone-2">
            A box score can tell you Smokey Joe Williams struck out twenty-seven in twelve innings. It
            cannot tell you the grip, the spin, or the sequence. That gap is the wing. The statistics are
            being recovered, game by game, from microfilm and box scores; the technique mostly never will
            be. So everything here is filed by how solid the record is, not smoothed into a single
            confident voice. The documented anchors lead. The legend tier is kept on purpose, flagged, to
            show the line between a sourced record and a good story.
          </p>
        </div>
      </section>

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
