import { lazy, Suspense } from 'react'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from './SpecimenBoundary'
import type { PitchAtlasEntry } from '../../data/types'

/*
  The hero specimen with the signature dissolve. Two stacked layers in one stage:
  the 3D ball, and the 2D schematic of the same seam. As the hero scrolls out of
  view, native scroll-driven CSS dissolves the ball into the schematic, which
  also carries the accessible description for screen readers (a canvas cannot).
  No WebGL: the schematic alone. Reduced motion: a static, drag-rotatable ball.
  The selected pitch supplies the spin axis the schematic and the 3D ball share.
*/

const BallScene = lazy(() => import('./three/BallScene'))

export function HeroSpecimen({ entry, className = '' }: { entry: PitchAtlasEntry; className?: string }) {
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>()

  const schematicTitle = `A ${entry.canonical.name} specimen. The seam is the closed figure-eight curve laid on the ball, oriented to the pitch's spin axis.`
  const schematic = (className: string) => (
    <SeamSchematic
      className={className}
      spinAxis={entry.motion.spinAxis}
      gyro={entry.motion.gyro}
      title={schematicTitle}
    />
  )

  if (!webgl) return schematic(className)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="dissolve-layer dissolve-ball" aria-hidden="true">
        <SpecimenBoundary fallback={schematic('h-full w-full')}>
          <Suspense fallback={schematic('h-full w-full')}>
            <BallScene entry={entry} spin={!reduced} active={inView} />
          </Suspense>
        </SpecimenBoundary>
      </div>
      <div className="dissolve-layer dissolve-schem">{schematic('h-full w-full')}</div>
    </div>
  )
}
