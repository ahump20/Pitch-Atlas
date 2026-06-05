import { lazy, Suspense } from 'react'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from './SpecimenBoundary'
import type { PitchAtlasEntry } from '../../data/types'

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
  vectors = false,
  faceGrip = false,
  autoSpin = true,
  className = '',
}: {
  entry: PitchAtlasEntry
  grip?: boolean
  vectors?: boolean
  faceGrip?: boolean
  autoSpin?: boolean
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
      grip={grip ? entry.canonical.fingerPlacement : undefined}
      title={`A ${entry.canonical.name} specimen. The seam is the closed figure-eight curve laid on the ball, oriented to the pitch's spin axis.`}
    />
  )

  if (!webgl) return schematic(className)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <SpecimenBoundary fallback={schematic('h-full w-full')}>
        <Suspense fallback={schematic('h-full w-full')}>
          <BallScene
            entry={entry}
            spin={autoSpin && !reduced}
            active={inView}
            grip={grip}
            vectors={vectors}
            faceGrip={faceGrip}
          />
        </Suspense>
      </SpecimenBoundary>
    </div>
  )
}
