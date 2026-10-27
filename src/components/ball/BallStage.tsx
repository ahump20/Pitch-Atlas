import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from './SpecimenBoundary'
import type { GripView, Handedness, PitchAtlasEntry } from '../../data/types'
import type { OrbitLink, StageId } from './orbitLink'

/*
  A 3D specimen stage that degrades safely: no WebGL, a thrown context or a lost
  one falls back to the 2D seam schematic drawn from the same seam-point function,
  and the canvas pauses when scrolled off screen. Used by the Grip Lab (faced, grip on)
  and the physics disclosure (spin + vectors, mounted only when open). The hero
  keeps its own dissolve wrapper.
*/

const BallScene = lazy(() => import('./three/BallScene'))

export function BallStage({
  entry,
  grip = false,
  view = entry.canonical.gripModel.defaultView,
  handedness = 'right',
  surface = 'paper',
  vectors = false,
  faceGrip = false,
  autoSpin = true,
  interactive = true,
  distance,
  activeContact,
  link,
  linkId,
  onDrawn,
  className = '',
}: {
  entry: PitchAtlasEntry
  grip?: boolean
  view?: GripView
  handedness?: Handedness
  surface?: 'paper' | 'stage'
  vectors?: boolean
  faceGrip?: boolean
  autoSpin?: boolean
  /** Drag-to-turn. Off inside a card window, where the card itself is the link —
   *  the stage also stops swallowing pointer events so the card's tilt and click
   *  still reach it. */
  interactive?: boolean
  /** Camera distance — pull back on square or card-shaped canvases so the whole
   *  hand stays in frame. Defaults to the Grip Lab's framing. */
  distance?: number
  activeContact?: string
  link?: OrbitLink
  linkId?: StageId
  /** true once the model's first frame is on screen, false if it fails; until the first frame the visitor sees the schematic */
  onDrawn?: (drawn: boolean) => void
  className?: string
}) {
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>()
  const [ready, setReady] = useState(false)
  // three.js takes a lost context without throwing, so no boundary sees it: show the
  // schematic, and build the scene afresh once the browser hands the context back
  const [build, setBuild] = useState(0)
  const contextLost = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const lost = () => {
      contextLost.current = true
      setReady(false)
      onDrawn?.(false)
    }
    // a fresh boundary too, so a scene that threw while the context was gone gets its retry
    const restored = () => {
      contextLost.current = false
      setReady(false)
      setBuild((n) => n + 1)
    }
    // the canvas's context events do not bubble; the capture phase still passes here
    el.addEventListener('webglcontextlost', lost, true)
    el.addEventListener('webglcontextrestored', restored, true)
    return () => {
      el.removeEventListener('webglcontextlost', lost, true)
      el.removeEventListener('webglcontextrestored', restored, true)
    }
  }, [ref, onDrawn])

  const schematic = (cn: string) => (
    <SeamSchematic
      className={cn}
      showAxis={vectors}
      showLabels={interactive}
      spinAxis={entry.motion.spinAxis}
      gyro={entry.motion.gyro}
      grip={grip ? entry.canonical.gripModel.contacts : undefined}
      handedness={handedness}
      view={faceGrip ? view : undefined}
      referenceContacts={entry.canonical.gripModel.contacts}
      surface={surface}
      activeContact={activeContact}
      title={`A ${entry.canonical.name} specimen. The seam is the closed figure-eight curve laid on the ball, the same cover for every pitch.`}
    />
  )

  if (!webgl) return schematic(className)

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`relative ${interactive ? '' : 'pointer-events-none '}${className}`}
    >
      {!ready && <div className="absolute inset-0" data-stage-loading="true">{schematic('h-full w-full')}</div>}
      <div className="relative h-full w-full" style={{ opacity: ready ? 1 : 0 }}>
      <SpecimenBoundary key={build} fallback={schematic('h-full w-full')} onFail={() => onDrawn?.(false)}>
        <Suspense fallback={schematic('h-full w-full')}>
          <BallScene
            entry={entry}
            spin={autoSpin && !reduced}
            active={inView}
            grip={grip}
            view={view}
            handedness={handedness}
            vectors={vectors}
            faceGrip={faceGrip}
            interactive={interactive}
            distance={distance}
            activeContact={activeContact}
            link={link}
            linkId={linkId}
            onReady={() => {
              // a first frame already on its way when the context went draws nothing
              if (contextLost.current) return
              setReady(true)
              onDrawn?.(true)
            }}
          />
        </Suspense>
      </SpecimenBoundary>
      </div>
    </div>
  )
}
