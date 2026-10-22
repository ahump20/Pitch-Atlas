import { Pause, Play, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { CompareButton } from '../compare/CompareButton'
import type { FinishFace } from './finishPrefs'

/*
  The compact control rail beside the enlarged specimen (below it on phones). Six
  jobs, in the brief's order: Front / Sources, Study grip, Compare, Finish, Export,
  Pause / Reset. Everything routes through what already exists: the grip lab anchor,
  the compare selection, the motion preference.
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
  const { display } = entry
  return (
    <aside className="specimen-rail" aria-label="Inspector controls">
      <header>
        <p className="archive-eyebrow">Filed specimen {display.specimenNo}</p>
        <h2>{display.shortName}</h2>
      </header>

      <div className="specimen-seg" role="group" aria-label="Face">
        <button type="button" aria-pressed={face === 'front'} onClick={() => onFace('front')}>Front</button>
        <button type="button" aria-pressed={face === 'back'} onClick={() => onFace('back')}>Sources</button>
      </div>

      <div className="specimen-rail-actions">
        <Link to={`/pitch/${display.slug}#grip-lab`} viewTransition className="v2-cta" onClick={onStudy}>
          Study grip <span aria-hidden="true">→</span>
        </Link>
        <CompareButton slug={display.slug} />
        <button type="button" className="specimen-action" aria-expanded={finishOpen} aria-controls="specimen-finish" onClick={onToggleFinish}>
          Finish
        </button>
        <button type="button" className="specimen-action" aria-pressed={paused} onClick={onTogglePaused} disabled={!motionAvailable}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="specimen-action" onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      </div>

      {children}

      <Link to={`/pitch/${display.slug}`} className="archive-text-link specimen-rail-file">
        Open the full file <span aria-hidden="true">→</span>
      </Link>
      <p className="specimen-rail-hint">Drag to turn the card. Arrow keys tilt it, F flips it, Space pauses the turn, R resets.</p>
    </aside>
  )
}
