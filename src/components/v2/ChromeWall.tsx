import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ds/Button'
import { CONFIDENCE_META, type ClaimConfidence, type PitchAtlasEntry } from '../../data/types'
import { PITCHES } from '../../data/pitches'
import { featuredPitchSet } from '../../data/featured'
import { accentForSlug } from '../refractor/accents'
import { RefractorCard } from '../refractor/RefractorCard'
import { RefractorBall } from '../refractor/RefractorBall'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { ScoutMovementWheel } from '../sections/ScoutMovementWheel'
import { Descent } from '../motion/Descent'
import { STAGE_TIER_DOT } from '../provenance/refractorClaimMeta'

/*
  The home shows one real specimen per core family. The full filed set belongs in
  the Pitch Index; the front door only needs enough cards to explain the medium.
  Each card still flips to the sourced back, and focus follows the active face.
*/

const FRONT_INK: Record<ClaimConfidence, string> = {
  'official-data': '#1E7A4A',
  'reputable-analysis': '#6E5E3A',
  'pitcher-own-words': '#6E5E3A',
  'coach-observed': '#6E5E3A',
  'secondhand-attributed': '#6E5E3A',
  'community-firsthand': '#6E5E3A',
  unverified: '#6E675A',
}

function WallCard({ entry, chase, i }: { entry: PitchAtlasEntry; chase: boolean; i: number }) {
  const [flipped, setFlipped] = useState(false)
  const frontButton = useRef<HTMLButtonElement>(null)
  const backButton = useRef<HTMLButtonElement>(null)
  const { canonical, motion, display } = entry
  const accent = accentForSlug(display.slug)
  const shape = canonical.physics.shape
  const gripCue = canonical.gripDetails[0] ?? canonical.grip
  const familyLabel = canonical.family === 'breaking' ? 'Breaking' : canonical.family === 'offspeed' ? 'Offspeed' : 'Fastball'

  function setFace(next: boolean) {
    setFlipped(next)
    window.requestAnimationFrame(() => (next ? backButton : frontButton).current?.focus())
  }

  return (
    <div
      className={`v2-mount${chase ? ' is-chase' : ''}`}
      style={{ '--c3': accent.c3, '--i': i } as React.CSSProperties}
    >
      <div className={`v2-flip${flipped ? ' is-flipped' : ''}`}>
        <div className="v2-flip-inner">
          <div className="v2-face" aria-hidden={flipped} inert={flipped ? true : undefined}>
            <RefractorCard
              to={`/pitch/${display.slug}`}
              accent={accent}
              gold={display.specimenNo === '00'}
              vnum={display.specimenNo}
              name={display.shortName}
              cue={gripCue.value}
              faceSource={{ label: 'Reference schematic', color: '#CDBA8E' }}
              confidence={{
                label: CONFIDENCE_META[gripCue.confidence].label,
                color: FRONT_INK[gripCue.confidence],
                approx: gripCue.approximate,
              }}
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
              ref={frontButton}
              type="button"
              className="v2-flip-btn"
              aria-label={`Flip ${display.shortName} to its sourced back`}
              onClick={() => setFace(true)}
            >
              <span aria-hidden="true">↺</span> Source
            </button>
          </div>

          <div
            className="v2-face v2-face-back"
            aria-hidden={!flipped}
            inert={!flipped ? true : undefined}
          >
            <div className="v2-back">
              <div className="rfx-scout">
                <div className="rfx-scout-head">
                  <span className="rfx-scout-name">{display.shortName}</span>
                  <span className="rfx-scout-no">No. {display.specimenNo} · {familyLabel}</span>
                </div>

                <ScoutMovementWheel motion={motion} accent={accent} />

                <div className="rfx-scout-rows">
                  <div className="rfx-scout-row">
                    <span className="rfx-scout-k">Grip cue</span>
                    <span className="rfx-scout-v">
                      {canonical.gripModel.status === 'filed' ? (
                        <span className="rfx-grip-twin" aria-hidden="true">
                          <SeamSchematic
                            grip={canonical.gripModel.contacts}
                            handedness="right"
                            surface="stage"
                            showAxis={false}
                            showStitches={false}
                            title=""
                          />
                        </span>
                      ) : null}
                      <span className="rfx-scout-value" title={gripCue.value}>{gripCue.value}</span>
                      <span className="mt-1 flex clear-both items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-bone-2">
                        <i
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: STAGE_TIER_DOT[gripCue.confidence] }}
                        />
                        {CONFIDENCE_META[gripCue.confidence].label}
                        {gripCue.approximate ? <span className="text-bone-2/60">· approx</span> : null}
                      </span>
                    </span>
                  </div>
                  <div className="rfx-scout-row">
                    <span className="rfx-scout-k">Shape</span>
                    <span className="rfx-scout-v">
                      <span className="rfx-scout-value" title={shape.value}>{shape.value}</span>
                      <span className="mt-1 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-bone-2">
                        <i
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: STAGE_TIER_DOT[shape.confidence] }}
                        />
                        {CONFIDENCE_META[shape.confidence].label}
                        {shape.approximate ? <span className="text-bone-2/60">· approx</span> : null}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="rfx-scout-foot">
                  {gripCue.source ? (
                    <a
                      href={gripCue.source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      tabIndex={flipped ? 0 : -1}
                      className="block max-w-full truncate font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 underline decoration-bone-2/40 underline-offset-2 transition-colors hover:text-bone"
                    >
                      Grip: {gripCue.source.label} <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  {shape.source ? (
                    <a
                      href={shape.source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      tabIndex={flipped ? 0 : -1}
                      className="block max-w-full truncate font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 underline decoration-bone-2/40 underline-offset-2 transition-colors hover:text-bone"
                    >
                      Shape: {shape.source.label} <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/pitch/${display.slug}`}
                      tabIndex={flipped ? 0 : -1}
                      className="inline-block min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:text-bone-2"
                    >
                      Open the full file <span aria-hidden="true">→</span>
                    </Link>
                    <button
                      ref={backButton}
                      type="button"
                      className="v2-flip-btn v2-flip-btn--inline"
                      aria-label={`Flip ${display.shortName} back to its card`}
                      tabIndex={flipped ? 0 : -1}
                      onClick={() => setFace(false)}
                    >
                      <span aria-hidden="true">↺</span> Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SCENE_TINT = '#8A93AB'

export function ChromeWall() {
  const featured = featuredPitchSet()

  return (
    <section
      id="set"
      data-scene-tint={SCENE_TINT}
      className="v2-stage v2-tooth relative border-t border-bone/10"
    >
      <Descent />
      <div className="pa-atmo pa-atmo-index-shelf opacity-[0.16] md:opacity-[0.22]" aria-hidden="true" />
      <div className="relative z-[1] mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="rfx-athletic v2-display text-[clamp(30px,5vw,52px)] leading-[0.94]">
            The <span className="rfx-holo">filed set.</span>
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2">
            {featured.length} shown · {PITCHES.length} filed. Flip a card for its sources.
          </p>
        </div>

        <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-bone-2">
          One specimen per family: grip first, source attached. The rest of the set lives in the
          Pitch Index.
        </p>

        <div className="v2-wall mt-10">
          {featured.map((entry, index) => (
            <WallCard
              key={entry.display.slug}
              entry={entry}
              chase={entry.display.specimenNo === '00'}
              i={index}
            />
          ))}
        </div>

        <div className="mt-10">
          <Button as={Link} to="/repertoire" variant="chrome" arrow>
            Open the full Pitch Index
          </Button>
        </div>
      </div>
    </section>
  )
}
