import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PitchAtlasEntry, RepertoireEntry } from '../../data/types'
import { ACCENT, FALLBACK_ACCENT } from '../refractor/accents'
import { RefractorBall } from '../refractor/RefractorBall'
import { gripEntryFor, gripEntryForRepertoire } from '../../data/grips'
import { pitchBySlug } from '../../data/pitches'
import { STATUS_LABEL, isEdgeStatus } from '../index/statusBadgeMeta'

/*
  The nine-pocket binder sheet — the plastic collector page every card kid knows.
  Each pocket is a sleeve (inset edge, one fixed gloss streak) holding a compact
  pocket card: a thin gold frame, the real grip photo (or the seam schematic where
  no photo honestly exists), the varsity number, the name strip, and a family tab
  in the page's jewel ink. Pockets never carry video — motion is the hero card's
  job; a binder page is where the set rests.

  Sheets render stacked at every width (no flip control), so all twelve filed
  names are always in the DOM — for visitors scanning, and for the tests that pin
  them. Open pockets hold the honest fillers real packs shipped with (checklist
  and set-ad cards pointing at real wings and tools, plus the lost-pitches
  ghost), and the one truly empty sleeve says nothing at all: an incomplete page
  is a true thing about a living set. The leather field wears the felt pass —
  the case lining showing between sleeves.
*/

/* family tab inks — the collegiate jewels (lift variants for the charcoal field) */
const FAMILY_TAB: Record<string, string> = {
  fastball: '#5C84B8',
  breaking: '#B0606C',
  offspeed: '#5FA27B',
}

export function PocketCard({ entry }: { entry: PitchAtlasEntry }) {
  const { display, canonical, motion } = entry
  const accent = ACCENT[display.slug] ?? FALLBACK_ACCENT
  const grip = gripEntryFor(display.slug)
  const still = grip?.photos[0]?.src ?? grip?.clip?.poster
  const tab = FAMILY_TAB[canonical.family] ?? '#D8CFB8'

  return (
    <Link to={`/pitch/${display.slug}`} className="pocket-lift" aria-label={`Open the ${display.shortName} specimen`}>
      <span className="pocket-card">
        <span className="pocket-inner">
          <span className="pocket-face">
            {still ? (
              <img src={still} alt="" loading="lazy" decoding="async" draggable={false} />
            ) : (
              <RefractorBall
                spinAxis={motion.spinAxis}
                gyro={motion.gyro}
                accent={accent}
                id={`pocket-${display.slug}`}
                gripPoints={canonical.fingerPlacement}
              />
            )}
            <i className="pocket-vnum" aria-hidden="true">
              {display.specimenNo}
            </i>
            <i className="pocket-tab" style={{ background: tab }} aria-hidden="true" />
          </span>
          <span className="pocket-name">{display.shortName}</span>
        </span>
      </span>
    </Link>
  )
}

/* a filler card: the checklist / set-ad card a real pack ships with */
export function FillerCard({ to, label, note, ghost }: { to: string; label: string; note: string; ghost?: boolean }) {
  return (
    <Link to={to} className="pocket-lift" aria-label={label}>
      <span className={`pocket-card ${ghost ? 'is-ghost' : 'is-filler'}`}>
        <span className="pocket-inner">
          <span
            className="rfx-athletic block"
            style={{ fontSize: 'clamp(13px,2vw,19px)', lineHeight: 0.95, color: ghost ? 'var(--color-bone-2)' : '#211D17' }}
          >
            {label}
          </span>
          <span
            className="block font-mono uppercase"
            style={{ fontSize: 8, letterSpacing: '0.14em', color: ghost ? '#8A8576' : 'rgba(33,29,23,.6)' }}
          >
            {note}
          </span>
        </span>
      </span>
    </Link>
  )
}

/*
  One Pitch Index entry in a binder sleeve. The face is honest by construction:
  a real grip photograph when the library holds one; the filed specimen's own
  seam schematic when the atlas authored that geometry; otherwise the typed
  cream slip that says plainly no image is on file. The name strip prints the
  index's own entry name (not the specimen short name) so the binder and the
  rows read as one directory.
*/
export function RepertoirePocket({ entry }: { entry: RepertoireEntry }) {
  const filed = entry.filedSlug ? pitchBySlug(entry.filedSlug) : undefined
  const grip = gripEntryForRepertoire(entry)
  const still = grip?.photos[0]?.src ?? grip?.clip?.poster
  const to = entry.filedSlug ? `/pitch/${entry.filedSlug}` : `/repertoire/${entry.id}`
  const edge = isEdgeStatus(entry.status)
  const status = STATUS_LABEL[entry.status]
  const open = entry.filedSlug ? 'Open specimen' : 'Basic file'

  /* no photograph, no authored schematic -> the honest slip */
  if (!still && !filed) {
    return (
      <Link to={to} className="pocket-pull" aria-label={`${entry.name}: ${open}`}>
        <span className={`pocket-slip ${edge ? 'is-edge' : ''}`}>
          <span
            className="font-mono uppercase"
            style={{ fontSize: 8, letterSpacing: '0.16em', color: edge ? '#A8232F' : 'rgba(33,29,23,.55)' }}
          >
            {status}
          </span>
          <span className="rfx-athletic block" style={{ fontSize: 'clamp(11px,1.7vw,17px)', lineHeight: 0.95, color: '#211D17' }}>
            {entry.name}
          </span>
          <span className="block font-mono uppercase" style={{ fontSize: 7.5, letterSpacing: '0.12em', color: 'rgba(33,29,23,.6)' }}>
            No image filed
          </span>
          <span className="mt-auto block font-mono uppercase" style={{ fontSize: 7.5, letterSpacing: '0.12em', color: 'rgba(33,29,23,.78)' }}>
            {open} →
          </span>
        </span>
      </Link>
    )
  }

  return (
    <Link to={to} className="pocket-pull" aria-label={`${entry.name}: ${open}`}>
      <span className="pocket-card">
        <span className="pocket-inner">
          <span className="pocket-face">
            {still ? (
              <img src={still} alt="" loading="lazy" decoding="async" draggable={false} />
            ) : filed ? (
              <RefractorBall
                spinAxis={filed.motion.spinAxis}
                gyro={filed.motion.gyro}
                accent={ACCENT[filed.display.slug] ?? FALLBACK_ACCENT}
                id={`index-pocket-${entry.id}`}
                gripPoints={filed.canonical.fingerPlacement}
              />
            ) : null}
            {filed ? (
              <i className="pocket-vnum" aria-hidden="true">
                {filed.display.specimenNo}
              </i>
            ) : null}
          </span>
          <span className="pocket-name">
            {entry.name}
            <span
              className="mt-0.5 block font-mono"
              style={{ fontSize: 7.5, letterSpacing: '0.14em', color: edge ? '#FF6B77' : '#8A8576' }}
            >
              {status}
            </span>
          </span>
        </span>
      </span>
    </Link>
  )
}

export function BinderSheet({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="binder-sheet texture-felt" role="group" aria-label={label}>
      <div className="binder-holes" aria-hidden="true">
        <i className="binder-hole" />
        <i className="binder-hole" />
        <i className="binder-hole" />
      </div>
      <div className="binder-grid">{children}</div>
    </div>
  )
}
