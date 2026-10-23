import { ChevronDown, RotateCcw, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { familyOverline } from '../../data/family'
import type { PitchAtlasEntry } from '../../data/types'
import { CompareButton } from '../compare/CompareButton'
import { PauseMotionButton } from '../refractor/PauseMotionButton'
import { DialogClose } from '../ui/dialog'
import type { FinishFace } from './finishPrefs'

/*
  The compact control rail beside the enlarged specimen (below it on phones). Six
  jobs: Front / Sources, Study grip, Compare, Finish, Export, Pause / Reset. Pause and
  Reset steer the view rather than the card, so they sit beside the face switch in one
  view row, as quiet icon buttons whose names say what they do. Everything routes
  through what already exists: the grip lab anchor, the compare selection, the motion
  preference (the site's own Pause, so a pause here holds every clip on the site).
  Study grip is the one primary; Compare and Finish sit in an even pair; every control
  in the rail stands one height; the keys follow the last link.

  The header says what the card does not: the full name, and the family when the name
  does not already say it. It is the viewer's own grid cell rather than the rail's
  first row, so it stays put while the rail scrolls and, on an upright phone, takes the
  top strip; the close button lives in it, so a long name can never run under the disc.
*/
export function InspectorRail({
  entry,
  face,
  onFace,
  finishOpen,
  onToggleFinish,
  motionAvailable,
  onReset,
  onStudy,
  children,
}: {
  entry: PitchAtlasEntry
  face: FinishFace
  onFace: (face: FinishFace) => void
  finishOpen: boolean
  onToggleFinish: () => void
  /** false under reduced motion, where there is no turn to pause */
  motionAvailable: boolean
  onReset: () => void
  onStudy: () => void
  children: ReactNode
}) {
  const { display, canonical } = entry
  const overline = familyOverline(entry)
  return (
    <>
      <header className="specimen-rail-head">
        <div className="specimen-rail-title">
          {overline ? <p className="archive-eyebrow">{overline}</p> : null}
          <h2>{canonical.name}</h2>
        </div>
        <DialogClose className="specimen-close">
          <X size={18} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </header>
      <aside className="specimen-rail" aria-label="Inspector controls">
        <div className="specimen-view" role="group" aria-label="View">
          <div className="specimen-seg" role="group" aria-label="Face">
            <button type="button" aria-pressed={face === 'front'} onClick={() => onFace('front')}>Front</button>
            <button type="button" aria-pressed={face === 'back'} onClick={() => onFace('back')}>Sources</button>
          </div>
          {motionAvailable ? <PauseMotionButton className="specimen-icon-action" /> : null}
          <button type="button" className="specimen-action specimen-icon-action" onClick={onReset}>
            <RotateCcw size={16} aria-hidden="true" />
            <span className="specimen-action-label">Reset view</span>
          </button>
        </div>

        <Link to={`/pitch/${display.slug}#grip-lab`} viewTransition className="specimen-primary" onClick={onStudy}>
          Study grip <span aria-hidden="true">→</span>
        </Link>
        <div className="specimen-rail-actions">
          <CompareButton slug={display.slug} />
          <button type="button" className="specimen-action" aria-expanded={finishOpen} aria-controls="specimen-finish" onClick={onToggleFinish}>
            Finish
            <ChevronDown size={14} aria-hidden="true" className="specimen-chevron" />
          </button>
        </div>

        {children}

        {/* Study grip opens the file at its grip lab; this link says what else the file holds */}
        <Link to={`/pitch/${display.slug}#variants`} className="specimen-rail-file">
          Master files and sources <span aria-hidden="true">→</span>
        </Link>

        {/* the dialog's description already says the keys to a screen reader */}
        <footer className="specimen-rail-keys">
          <p>Drag to turn the card.</p>
          <p className="specimen-hint-keys" aria-hidden="true">
            <span><kbd className="specimen-key-arrows">←→↑↓</kbd> tilt</span>
            <span><kbd>F</kbd> flip</span>
            {motionAvailable ? <span><kbd>Space</kbd> pause</span> : null}
            <span><kbd>R</kbd> reset</span>
          </p>
        </footer>
      </aside>
    </>
  )
}
