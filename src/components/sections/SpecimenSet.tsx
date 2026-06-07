import { PITCHES } from '../../data/pitches'
import type { PitchAtlasEntry, ClaimConfidence } from '../../data/types'
import { RefractorCard, type RefractorAccent } from '../refractor/RefractorCard'
import { RefractorBall } from '../refractor/RefractorBall'
import { GripFace } from '../refractor/GripFace'
import { GripClip } from '../refractor/GripClip'
import { familyCrumb } from '../refractor/familyCrumb'
import { gripEntryFor } from '../../data/grips'

/*
  The Pitch Index as a refractor specimen set — the signature surface. Every card is
  a front-of-card summary driven by the real pitch record: the metric and shape from
  the sourced motion numbers, the confidence dot from the primary-break claim's own
  tier, and the family crumb from its family. The window shows the grip itself — for
  the pitches Austin actually throws (a photographed grip in the library) it is his
  own grip photo and the card says "Austin's grip"; for the rest it is the seam ball
  with the pitch's real finger-placement pins, marked "Reference grip". Circle change
  has no photo (he can't throw it), so it correctly falls to the schematic. Foil is
  decoration; the readings are sourced. The four-seam (specimen 00) pulls the gold 1/1.
*/

export const ACCENT: Record<string, RefractorAccent> = {
  'four-seam': { c1: '#0A1B3A', c2: '#114A8C', c3: '#37D6FF' },
  'two-seam': { c1: '#07261F', c2: '#0E7A5E', c3: '#1CF0A6' },
  'circle-change': { c1: '#2A0E2E', c2: '#9C2C7A', c3: '#FF6FB3' },
  'twelve-six': { c1: '#160B33', c2: '#4A35B5', c3: '#8A6BFF' },
  slider: { c1: '#2A0712', c2: '#B01133', c3: '#FF3B63' },
  splitter: { c1: '#08220F', c2: '#2C9E2E', c3: '#7CFF52' },
  splinker: { c1: '#2A0E06', c2: '#C2470F', c3: '#FF8A2B' },
  sweeper: { c1: '#06262A', c2: '#0E6E7A', c3: '#22E0E0' },
  cutter: { c1: '#0A1626', c2: '#2C5A8C', c3: '#6CB4E4' },
  knuckleball: { c1: '#1A1326', c2: '#4A3A6E', c3: '#A99AD0' },
  forkball: { c1: '#0E1230', c2: '#2E2E8C', c3: '#6B6BE0' },
  eephus: { c1: '#2A1E06', c2: '#9C7A1E', c3: '#FFD24D' },
}
export const FALLBACK_ACCENT: RefractorAccent = { c1: '#10131C', c2: '#2C3650', c3: '#8A93AB' }

/** The refractor accent triad for a filed specimen, by slug. Shared by the cards
    and the specimen chapter so a pitch wears the same world on both surfaces. */
export function accentForSlug(slug: string): RefractorAccent {
  return ACCENT[slug] ?? FALLBACK_ACCENT
}

const CONF: Record<ClaimConfidence, { label: string; color: string }> = {
  'official-data': { label: 'Official data', color: 'var(--color-ok-bright)' },
  'reputable-analysis': { label: 'Reputable analysis', color: 'var(--color-amber-bright)' },
  'pitcher-own-words': { label: "Pitcher's own words", color: 'var(--color-powder)' },
  'coach-observed': { label: 'Coach-observed', color: 'var(--color-powder)' },
  'secondhand-attributed': { label: 'Secondhand', color: 'var(--color-sand-bright)' },
  'community-firsthand': { label: 'Community', color: 'var(--color-sand-bright)' },
  unverified: { label: 'Unverified', color: 'var(--color-ink-3)' },
}

function bigStatFor(entry: PitchAtlasEntry) {
  const m = entry.motion
  // A pitch with no fixed break (the knuckleball) shows no headline number — the card
  // leads with its shape ("Erratic flutter") rather than a spurious precise magnitude.
  if (m.indeterminateBreak) return undefined
  const useVert = Math.abs(m.ivbInches) >= Math.abs(m.horizontalInches)
  if (useVert) {
    const sign = m.ivbInches > 0 ? '+' : ''
    return { value: `${sign}${m.ivbInches}`, unit: '″', label: m.ivbInches >= 0 ? 'INDUCED RIDE' : 'INDUCED DROP' }
  }
  return {
    value: `${m.horizontalInches}`,
    unit: '″',
    label: m.horizontalDir === 'arm-side' ? 'ARM-SIDE RUN' : 'GLOVE-SIDE BREAK',
  }
}

export function SpecimenSet() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pt-10 md:px-8">
      <div className="grid justify-items-center gap-[clamp(20px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr))]">
        {PITCHES.map((entry, i) => {
          const { canonical, motion, display } = entry
          const physics = canonical.physics
          const accent = ACCENT[display.slug] ?? FALLBACK_ACCENT
          const gold = display.specimenNo === '00'
          const pb = physics.primaryBreak.claim
          const conf = CONF[pb.confidence]

          // The grip read: Austin's own grip where he throws the pitch — a looping clip
          // for the four game-day pitches, his still photo for the situational ones —
          // else the seam ball with its real finger-placement pins. Circle change has
          // neither, so it stays a schematic and never implies he throws it.
          const grip = gripEntryFor(display.slug)
          const clip = grip?.clip
          const photo = grip && grip.photos.length > 0 ? grip.photos[0] : undefined
          const austinGrip = Boolean(clip || photo)
          const cue = austinGrip && grip ? grip.shortCue : display.heroSub
          const gripSource = austinGrip
            ? { label: "Austin's grip", color: 'var(--color-powder)' }
            : { label: 'Reference grip', color: 'var(--color-ink-3)' }

          const face = clip ? (
            <GripClip clip={clip} />
          ) : photo ? (
            <GripFace photo={photo} />
          ) : (
            <RefractorBall
              spinAxis={motion.spinAxis}
              gyro={motion.gyro}
              accent={accent}
              id={display.slug}
              gripPoints={canonical.fingerPlacement}
            />
          )

          return (
            <RefractorCard
              key={display.slug}
              to={`/pitch/${display.slug}`}
              index={i}
              gold={gold}
              accent={accent}
              vnum={display.specimenNo}
              name={display.shortName}
              face={face}
              metric={bigStatFor(entry)}
              shape={physics.primaryBreak.label}
              cue={cue}
              confidence={{ label: conf.label, color: conf.color, approx: pb.approximate }}
              crumb={familyCrumb(canonical.family)}
              gripSource={gripSource}
            />
          )
        })}
      </div>
    </div>
  )
}
