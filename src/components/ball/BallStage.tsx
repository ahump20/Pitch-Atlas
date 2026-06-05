import { lazy, Suspense } from 'react'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from './SpecimenBoundary'
import type { GripView, Handedness, PitchAtlasEntry } from '../../data/types'

/*
  A 3D specimen stage that degrades safely: no WebGL or a thrown context falls
  back to the 2D seam schematic drawn from the same seam-point function, and the
  canvas pauses when scrolled off screen. Used by the Grip Lab (faced, grip on)
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
  activeContact,
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
  activeContact?: string
  className?: string
}) {
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>()

  const schematic = (cn: string) => (
    <SeamSchematic
      className={cn}
      spinAxis={entry.motion.spinAxis}
      gyro={entry.motion.gyro}
      grip={grip ? entry.canonical.gripModel.contacts : undefined}
      surface={surface}
      title={`A ${entry.canonical.name} specimen. The seam is the closed figure-eight curve laid on the ball, oriented to the pitch's spin axis.`}
    />
  )

  if (!webgl) return schematic(className)

  return (
    <div ref={ref} aria-hidden="true" className={`relative ${className}`}>
      <SpecimenBoundary fallback={schematic('h-full w-full')}>
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
            activeContact={activeContact}
          />
        </Suspense>
      </SpecimenBoundary>
    </div>
  )
}
