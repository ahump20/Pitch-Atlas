import { lazy, Suspense } from 'react'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from './SpecimenBoundary'

/*
  The hero specimen with the signature dissolve. Two stacked layers in one stage:
  the 3D ball, and the 2D schematic of the same seam. As the hero scrolls out of
  view, native scroll-driven CSS dissolves the ball into the schematic, which
  also carries the accessible description for screen readers (a canvas cannot).
  No WebGL: the schematic alone. Reduced motion: a static, drag-rotatable ball.
*/

const BallScene = lazy(() => import('./three/BallScene'))

export function HeroSpecimen({ className = '' }: { className?: string }) {
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>()

  if (!webgl) return <SeamSchematic className={className} />

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="dissolve-layer dissolve-ball" aria-hidden="true">
        <SpecimenBoundary fallback={<SeamSchematic className="h-full w-full" />}>
          <Suspense fallback={<SeamSchematic className="h-full w-full" />}>
            <BallScene spin={!reduced} active={inView} />
          </Suspense>
        </SpecimenBoundary>
      </div>
      <div className="dissolve-layer dissolve-schem">
        <SeamSchematic className="h-full w-full" />
      </div>
    </div>
  )
}
