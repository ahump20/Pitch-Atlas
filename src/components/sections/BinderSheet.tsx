import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { ACCENT, FALLBACK_ACCENT } from '../refractor/accents'
import { RefractorBall } from '../refractor/RefractorBall'
import { gripEntryFor } from '../../data/grips'

/*
  The nine-pocket binder sheet — the plastic collector page every card kid knows.
  Each pocket is a sleeve (inset edge, one fixed gloss streak) holding a compact
  pocket card: a thin gold frame, the real grip photo (or the seam schematic where
  no photo honestly exists), the varsity number, the name strip, and a family tab
  in the page's jewel ink. Pockets never carry video — motion is the hero card's
  job; a binder page is where the set rests.

  Sheets render stacked at every width (no flip control), so all twelve filed
  names are always in the DOM — for visitors scanning, and for the tests that pin
  them. Open pockets hold the honest fillers real packs shipped with (a checklist
  card, the softball set, the lost-pitches ghost) and truly empty sleeves say
  nothing at all: an incomplete page is a true thing about a living set.
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

export function BinderSheet({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="binder-sheet" role="group" aria-label={label}>
      <div className="binder-holes" aria-hidden="true">
        <i className="binder-hole" />
        <i className="binder-hole" />
        <i className="binder-hole" />
      </div>
      <div className="binder-grid">{children}</div>
    </div>
  )
}
