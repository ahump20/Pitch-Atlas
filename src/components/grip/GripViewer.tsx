import { useCallback, useState, type KeyboardEvent } from 'react'
import { BallStage } from '../ball/BallStage'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { GripSourceBadge } from './GripSourceBadge'
import { GripUnfiledState } from './GripUnfiledState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import type { GripView, Handedness, PitchAtlasEntry } from '../../data/types'

/*
  The Grip Lab's visual panel, whole. One component owns the contract that no
  pitch page ever shows a naked generic baseball under "hold it like this":

   - filed grip + WebGL + motion OK  -> the 3D specimen hand on the ball
   - filed grip, no WebGL or reduced -> the 2D finger silhouettes, same solver
   - unfiled grip (the eephus)       -> the explicit no-canonical-grip state

  The seven-tier source badge sits inside the panel in every branch, because the
  hand itself is a sourced claim. View and hand controls live here too, plus
  keyboard access: arrow keys walk the three views, F flips the hand, H lifts it
  off the ball to study the seam under it.
*/

const VIEW_ORDER: GripView[] = ['top', 'side', 'thumb']
const VIEW_OPTIONS: { id: GripView; label: string; note: string }[] = [
  { id: 'top', label: 'Top', note: 'finger pads' },
  { id: 'side', label: 'Side', note: 'palm gap' },
  { id: 'thumb', label: 'Thumb', note: 'under support' },
]
const HAND_OPTIONS: { id: Handedness; label: string }[] = [
  { id: 'right', label: 'Right' },
  { id: 'left', label: 'Left' },
]

export function GripViewer({
  entry,
  accentColor,
  activeContact,
  className = '',
}: {
  entry: PitchAtlasEntry
  accentColor: string
  activeContact?: string
  className?: string
}) {
  const gm = entry.canonical.gripModel
  const [view, setView] = useState<GripView>(gm.defaultView)
  const [hand, setHand] = useState<Handedness>('right')
  const [showHand, setShowHand] = useState(true)
  const reduced = useReducedMotion()
  const webgl = useWebGLSupport()

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const step = e.key === 'ArrowRight' ? 1 : -1
        setView((current) => {
          const i = VIEW_ORDER.indexOf(current)
          return VIEW_ORDER[(i + step + VIEW_ORDER.length) % VIEW_ORDER.length]
        })
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setHand((h) => (h === 'right' ? 'left' : 'right'))
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        setShowHand((s) => !s)
      }
    },
    [],
  )

  if (gm.status === 'unfiled') {
    return (
      <div className={className}>
        <GripUnfiledState entry={entry} accentColor={accentColor} />
      </div>
    )
  }

  // Reduced motion and no-WebGL read the same solved geometry as the 3D hand,
  // drawn still: silhouettes from gripPose.ts on the 2D seam schematic.
  const useSchematic = reduced || !webgl

  return (
    <div className={className}>
      <div
        role="group"
        tabIndex={0}
        aria-label={`${entry.canonical.name} grip viewer. Arrow keys switch the view. F flips the hand. H lifts the hand off the ball.`}
        onKeyDown={onKeyDown}
        className="relative mx-auto aspect-square w-full max-w-[480px] rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-cyan/70"
        data-grip-viewer={entry.display.slug}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-[10%] bottom-[3%] h-[16%] rounded-[50%]"
          style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.42), transparent)' }}
        />
        {useSchematic ? (
          <SeamSchematic
            className="h-full w-full"
            spinAxis={entry.motion.spinAxis}
            gyro={entry.motion.gyro}
            grip={showHand ? gm.contacts : undefined}
            handedness={hand}
            surface="stage"
            title={`A ${entry.canonical.name} held ${hand}-handed: the solved finger silhouettes drawn on the seam schematic.`}
          />
        ) : (
          <BallStage
            entry={entry}
            grip={showHand}
            view={view}
            handedness={hand}
            surface="stage"
            faceGrip
            autoSpin={false}
            activeContact={activeContact}
            className="h-full w-full"
          />
        )}
        {/* the hand is a claim; its badge lives inside the panel */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex justify-start">
          <GripSourceBadge provenance={gm.provenance} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2">View</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Grip view">
            {VIEW_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={view === o.id}
                onClick={() => setView(o.id)}
                className="rfx-chip"
                title={o.note}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2">Hand</p>
          <div className="flex gap-2" role="group" aria-label="Handedness">
            {HAND_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={hand === o.id}
                onClick={() => setHand(o.id)}
                className="rfx-chip"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-pressed={!showHand}
          onClick={() => setShowHand((s) => !s)}
          className="rfx-chip inline-flex items-center gap-2"
        >
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${showHand ? 'bg-cyan' : 'bg-bone/35'}`} />
          {showHand ? 'Lift the hand' : 'Show the hand'}
        </button>
      </div>

      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
        Keyboard: arrows switch views · F flips the hand · H lifts it
      </p>
    </div>
  )
}
