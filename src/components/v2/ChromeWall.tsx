import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CONFIDENCE_META,
  type ClaimConfidence,
  type PitchAtlasEntry,
  type PitchFamily,
} from '../../data/types'
import { PITCHES } from '../../data/pitches'
import { INDEX_SCOPE } from '../../lib/index-scope'
import { accentForSlug } from '../refractor/accents'
import { RefractorCard } from '../refractor/RefractorCard'
import { RefractorBall } from '../refractor/RefractorBall'
import { familyCrumb } from '../refractor/familyCrumb'
import { ChapterMark } from './ChapterMark'

/*
  v2 · The Filed Set, as a chrome wall. Each pitch is a matte Topps-Now mount
  holding a refractor card front (the SVG seam ball keeps every grid cell
  deterministic and off the WebGL-context budget the hero and grip study spend).
  Flip a card and it turns to its matte black back: the same shape read it wears
  on the front, plus the grip claim and the source it usually hides, with a link
  into the full file. The flip is a real button (aria-pressed), the only motion,
  removed under reduced motion; the hidden face is taken out of the tab order.
*/

const FAMILY_ORDER: PitchFamily[] = ['fastball', 'breaking', 'offspeed']

/* card-back tier dots, tuned to read bright on the matte black register (the
   front's badge inks are tuned for the cream plate and would sink here). */
const TIER_DOT: Record<ClaimConfidence, string> = {
  'official-data': '#4FB286',
  'pitcher-own-words': '#6CACE4',
  'coach-observed': '#6CACE4',
  'reputable-analysis': '#D8A24A',
  'secondhand-attributed': '#C7B98F',
  'community-firsthand': '#C7B98F',
  unverified: '#FF4D5E',
}

/* the front badge inks, matched to PitchSpecimenCard so a pitch reads the same
   confidence color on its chrome face here as everywhere else. */
const FRONT_INK: Record<ClaimConfidence, string> = {
  'official-data': '#1E7A4A',
  'reputable-analysis': '#8A6118',
  'pitcher-own-words': '#2C5A8C',
  'coach-observed': '#2C5A8C',
  'secondhand-attributed': '#6E5E3A',
  'community-firsthand': '#6E5E3A',
  unverified: '#6E675A',
}

function WallCard({ entry, chase, i }: { entry: PitchAtlasEntry; chase: boolean; i: number }) {
  const [flipped, setFlipped] = useState(false)
  const { canonical, motion, display } = entry
  const accent = accentForSlug(display.slug)
  const shape = canonical.physics.shape
  const conf = shape.confidence

  return (
    <div
      className={`v2-mount${chase ? ' is-chase' : ''}`}
      style={{ '--c3': accent.c3, '--i': i } as React.CSSProperties}
    >
      <div className={`v2-flip${flipped ? ' is-flipped' : ''}`}>
        <div className="v2-flip-inner">
          {/* front: the chrome refractor card */}
          <div className="v2-face" aria-hidden={flipped}>
            <RefractorCard
              accent={accent}
              gold={display.specimenNo === '00'}
              vnum={display.specimenNo}
              name={display.shortName}
              shape={shape.value}
              cue={display.heroSub}
              confidence={{ label: CONFIDENCE_META[conf].label, color: FRONT_INK[conf], approx: shape.approximate }}
              crumb={familyCrumb(canonical.family)}
              maxWidth={chase ? 520 : 360}
              face={
                <RefractorBall
                  spinAxis={motion.spinAxis}
                  gyro={motion.gyro}
                  accent={accent}
                  id={`wall-${display.slug}`}
                  gripPoints={canonical.fingerPlacement}
                />
              }
            />
            <button
              type="button"
              className="v2-flip-btn"
              aria-pressed={flipped}
              aria-label={`Flip ${display.shortName} to its sourced back`}
              tabIndex={flipped ? -1 : 0}
              onClick={() => setFlipped(true)}
            >
              <span aria-hidden="true">↺</span> Source
            </button>
          </div>

          {/* back: the matte Topps-Now data side */}
          <div className="v2-face v2-face-back" aria-hidden={!flipped}>
            <div className="v2-back flex h-full flex-col">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2">
                {display.shortName} · {display.specimenNo}
              </p>

              <p className="mt-3 text-[13px] leading-relaxed text-bone">{shape.value}</p>

              <p className="mt-3 text-[12px] leading-relaxed text-bone-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-bone-2/70">
                  The grip{' '}
                </span>
                {canonical.grip.value}
              </p>

              <div className="mt-auto pt-4">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-bone">
                  <i className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: TIER_DOT[conf] }} />
                  {CONFIDENCE_META[conf].label}
                  {shape.approximate ? <span className="text-bone-2/60"> · approx</span> : null}
                </span>
                {shape.source ? (
                  <a
                    href={shape.source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    tabIndex={flipped ? 0 : -1}
                    className="mt-2 block max-w-full truncate font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 underline decoration-bone-2/40 underline-offset-2 transition-colors hover:text-bone"
                  >
                    {shape.source.label} <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                <Link
                  to={`/pitch/${display.slug}`}
                  tabIndex={flipped ? 0 : -1}
                  className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:text-seam"
                >
                  Open the full file <span aria-hidden="true">→</span>
                </Link>
              </div>

              <button
                type="button"
                className="v2-flip-btn"
                aria-pressed={flipped}
                aria-label={`Flip ${display.shortName} back to its card`}
                tabIndex={flipped ? 0 : -1}
                onClick={() => setFlipped(false)}
              >
                <span aria-hidden="true">↺</span> Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChromeWall() {
  const filed = FAMILY_ORDER.flatMap((fam) => PITCHES.filter((p) => p.canonical.family === fam))

  return (
    <section id="set" className="v2-stage v2-tooth relative border-t border-bone/10">
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
        <ChapterMark n="03" name="The Filed Set" />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="rfx-athletic v2-display text-[clamp(28px,5vw,52px)] leading-[0.94]">
            The filed set.
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2">
            {filed.length} filed · flip any card for its source
          </p>
        </div>

        <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-bone-2">
          Every accepted pitch, struck as a card on matte stock. The front leads with the grip and
          the shape; flip it for the same reading and its source. The full index holds{' '}
          {INDEX_SCOPE.shelfLabel}, one click past the wall.
        </p>

        <div className="v2-wall mt-10">
          {filed.map((entry, i) => (
            <WallCard key={entry.display.slug} entry={entry} chase={entry.display.specimenNo === '00'} i={i} />
          ))}
        </div>

        <div className="mt-10">
          <Link to="/repertoire" className="v2-cta">
            Open the full Pitch Index <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
