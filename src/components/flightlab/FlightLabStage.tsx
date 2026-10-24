import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'
import { FlightLabSchematic } from './FlightLabSchematic'
import type { CameraView, LabModel, ThrowRequest } from './model'

/*
  The Flight Lab's stage, built like the specimen BallStage: the 3D scene loads
  lazily behind the flat schematic (drawn from the same model), a thrown WebGL
  context falls back to the schematic instead of a blank box, and the scene stops
  drawing when it is scrolled away or its tab is hidden. With reduced motion a
  throw lands at once.
*/

const FlightLabScene = lazy(() => import('./three/FlightLabScene'))

/** Shows its children and reports that the stage has something to show. */
function ReadyOnMount({ onReady, children }: { onReady: () => void; children: ReactNode }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return <>{children}</>
}

/** True while the document is visible; a hidden tab pauses the scene. */
function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden')
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}

export function FlightLabStage({
  model,
  view,
  slow,
  throwRequest,
  onPlaying,
  insetTop = 0,
  insetBottom = 0,
  className = '',
}: {
  model: LabModel
  view: CameraView
  slow: boolean
  throwRequest?: ThrowRequest
  onPlaying?: (playing: boolean) => void
  /** Room the page's overlays take at the top and bottom of the stage, px (for the schematic). */
  insetTop?: number
  insetBottom?: number
  className?: string
}) {
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const visible = useDocumentVisible()
  const { ref, inView } = useInView<HTMLDivElement>()
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])

  // The schematic as the page: it throws, and reports when the ball is in the air.
  const fallback = (
    <FlightLabSchematic
      model={model}
      throwRequest={throwRequest}
      slow={slow}
      reduced={reduced}
      onPlaying={onPlaying}
      insetTop={insetTop}
      insetBottom={insetBottom}
    />
  )

  if (!webgl) {
    return (
      <div className={`relative ${className}`} data-stage-mode="schematic">
        {fallback}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`} data-stage-mode="scene" data-stage-ready={ready ? 'true' : 'false'}>
      {!ready ? (
        <div className="absolute inset-0" data-stage-loading="true">
          <FlightLabSchematic model={model} insetTop={insetTop} insetBottom={insetBottom} />
        </div>
      ) : null}
      <div className="relative h-full w-full" style={{ opacity: ready ? 1 : 0 }}>
        <SpecimenBoundary fallback={<ReadyOnMount onReady={markReady}>{fallback}</ReadyOnMount>}>
          <Suspense fallback={null}>
            <FlightLabScene
              model={model}
              view={view}
              slow={slow}
              reduced={reduced}
              active={inView && visible}
              throwRequest={throwRequest}
              onPlaying={onPlaying}
              onReady={markReady}
            />
          </Suspense>
        </SpecimenBoundary>
      </div>
    </div>
  )
}
