import { CompareButton } from '../compare/CompareButton'
import { useCompare } from '../compare/compareContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ds/Button'
import type { PitchAtlasEntry } from '../../data/types'
import { PITCHES } from '../../data/pitches'
import { featuredPitchSet } from '../../data/featured'
import { accentForSlug } from '../refractor/accents'
import { RefractorCard } from '../refractor/RefractorCard'
import { SpecimenBack } from '../refractor/SpecimenBack'
import { InspectButton } from '../inspector/InspectButton'
import { specimenFace } from '../refractor/specimenFace'
import { Descent } from '../motion/Descent'
import { ChapterMark } from './ChapterMark'

/*
  The home shows one real specimen per core family. The full filed set belongs in
  the Pitch Index; the front door only needs enough cards to explain the medium.
  Each card still flips to the sourced back; its controls stay outside the turn.
  Every card wears the live material: it mounts as the wall scrolls into view,
  draws one rest frame, and only re-renders when the hand moves it.

  The front face comes from the shared `specimenFace` resolver, same as every
  other card. This file used to hard-wire the seam ball and the words "Reference
  schematic" onto all three, which meant the two pitches Austin filmed showed a
  drawing on the front door while their real clips shipped unused.
*/

function WallCard({ entry, chase, i }: { entry: PitchAtlasEntry; chase: boolean; i: number }) {
  const [flipped, setFlipped] = useState(false)
  const compare = useCompare()
  const selected = compare?.selection.a === entry.display.slug || compare?.selection.b === entry.display.slug
  const { display } = entry
  const accent = accentForSlug(display.slug)
  /* The front door is the one place a card earns a live grip model: three cards,
     and only the ones with no clip or photo of Austin's own hand mount a canvas. */
  const { face, faceSource, cue, confidence } = specimenFace(entry, { idPrefix: 'wall-', model: true })

  return (
    <div
      className={`v2-mount${chase ? ' is-chase' : ''}${selected ? ' is-selected' : ''}`}
      style={{ '--c3': accent.c3, '--i': i } as React.CSSProperties}
    >
      <div className={`v2-flip${flipped ? ' is-flipped' : ''}`}>
        <div className="v2-flip-inner">
          <div className="v2-face" aria-hidden={flipped} inert={flipped ? true : undefined}>
            <RefractorCard
              to={`/pitch/${display.slug}`}
              index={i}
              foil
              accent={accent}
              gold={display.specimenNo === '00'}
              vnum={display.specimenNo}
              name={display.shortName}
              cue={cue}
              faceSource={faceSource}
              confidence={confidence}
              maxWidth={chase ? 520 : 360}
              face={face}
            />
          </div>

          <div
            className="v2-face v2-face-back"
            aria-hidden={!flipped}
            inert={!flipped ? true : undefined}
          >
            <SpecimenBack entry={entry} flipped={flipped} foil seed={i} />
          </div>
        </div>
      </div>
      <div className="archive-wall-actions">
        <button type="button" className="v2-flip-btn v2-flip-btn--inline archive-wall-source"
          aria-pressed={flipped}
          aria-label={`Flip ${display.shortName} ${flipped ? 'back to its card' : 'to its sourced back'}`}
          onClick={() => setFlipped((current) => !current)}>
          <span aria-hidden="true">↺</span> {flipped ? 'Card' : 'Source'}
        </button>
        <InspectButton slug={display.slug} />
        <CompareButton slug={display.slug} />
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
        <ChapterMark n="03" name="The Filed Set" accent={SCENE_TINT} delivery={[3, 5]} className="mb-4" />
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
