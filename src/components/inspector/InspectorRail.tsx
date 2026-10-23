import { ChevronDown, Pause, Play, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { CompareButton } from '../compare/CompareButton'
import type { FinishFace } from './finishPrefs'

/*
  The compact control rail beside the enlarged specimen (below it on phones). Six
  jobs, in the brief's order: Front / Sources, Study grip, Compare, Finish, Export,
  Pause / Reset. Everything routes through what already exists: the grip lab anchor,
  the compare selection, the motion preference. The header says what the card does
  not: the pitch's family and its full name. Study grip is the one primary; the rest
  sit in an even grid, and the keys wait at the rail's foot.
*/
export function InspectorRail({
  entry,
  face,
  onFace,
  finishOpen,
  onToggleFinish,
  paused,
  onTogglePaused,
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
  paused: boolean
  onTogglePaused: () => void
  /** false under reduced motion, where there is no turn to pause */
  motionAvailable: boolean
  onReset: () => void
  onStudy: () => void
  children: ReactNode
}) {
  const { display, canonical } = entry
  const familyLabel = canonical.family === 'breaking' ? 'Breaking' : canonical.family === 'offspeed' ? 'Offspeed' : 'Fastball'
  return (
    <aside className="specimen-rail" aria-label="Inspector controls">
      <header className="specimen-rail-head">
        <p className="archive-eyebrow">{familyLabel}</p>
        <h2>{canonical.name}</h2>
      </header>

      <div className="specimen-seg" role="group" aria-label="Face">
        <button type="button" aria-pressed={face === 'front'} onClick={() => onFace('front')}>Front</button>
        <button type="button" aria-pressed={face === 'back'} onClick={() => onFace('back')}>Sources</button>
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
        {/* the label names the next action, so no pressed state rides on top of it */}
        <button type="button" className="specimen-action" data-state={paused ? 'paused' : 'live'} onClick={onTogglePaused} disabled={!motionAvailable}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="specimen-action" onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      </div>

      {children}

      <Link to={`/pitch/${display.slug}`} className="specimen-rail-file">
        Open the full file <span aria-hidden="true">→</span>
      </Link>

      {/* the dialog's description already says the keys to a screen reader */}
      <footer className="specimen-rail-keys">
        <p>Drag to turn the card.</p>
        <p className="specimen-hint-keys" aria-hidden="true">
          <span><kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> tilt</span>
          <span><kbd>F</kbd> flip</span>
          {motionAvailable ? <span><kbd>Space</kbd> pause</span> : null}
          <span><kbd>R</kbd> reset</span>
        </p>
      </footer>
    </aside>
  )
}
