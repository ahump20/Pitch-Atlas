import { lazy, Suspense, useEffect, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'
import { useCardTilt } from '../../hooks/useCardTilt'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'

/*
  The front-of-card job is narrow: name, grip face, one sourced cue, and the
  route into the full file. The foil and spring tilt stay decorative. Detailed
  shape, family, grade, and source records live on the back or in the specimen.
*/

export type RefractorAccent = { c1: string; c2: string; c3: string }

const FoilLayer = lazy(() => import('./foil/FoilLayer'))

export interface RefractorCardProps {
  to?: string
  index?: number
  gold?: boolean
  accent: RefractorAccent
  vnum?: string
  name: string
  face: ReactNode
  /** Visible provenance for the grip face, separate from the cue's claim tier. */
  faceSource?: { label: string; color: string }
  cue?: string
  confidence?: { label: string; color: string; approx?: boolean }
  maxWidth?: number
  foil?: boolean
  className?: string
}

export function RefractorCard({
  to,
  index = 0,
  gold = false,
  accent,
  vnum,
  name,
  face,
  faceSource,
  cue,
  confidence,
  maxWidth = 360,
  foil = false,
  className,
}: RefractorCardProps) {
  const { ref: tiltRef, handlers, store } = useCardTilt<HTMLElement>()
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const { ref: viewRef, inView } = useInView<HTMLDivElement>()
  const [foilArmed, setFoilArmed] = useState(false)

  useEffect(() => {
    if (!foil || foilArmed) return
    if (inView) {
      const element = viewRef.current
      if (!element) return
      const frame = window.requestAnimationFrame(() => {
        const margin = 160
        const rect = element.getBoundingClientRect()
        if (rect.bottom >= -margin && rect.top <= window.innerHeight + margin) setFoilArmed(true)
      })
      return () => window.cancelAnimationFrame(frame)
    }
    const timeout = window.setTimeout(() => setFoilArmed(true), 0)
    return () => window.clearTimeout(timeout)
  }, [foil, foilArmed, inView, viewRef])

  const cardStyle = {
    '--c1': accent.c1,
    '--c2': accent.c2,
    '--c3': accent.c3,
    '--i': index,
  } as CSSProperties

  const inner = (
    <div className="rfx-field">
      {foil && webgl && !reduced && inView && foilArmed ? (
        <SpecimenBoundary fallback={null}>
          <Suspense fallback={null}>
            <FoilLayer store={store} accent={accent} gold={gold} />
          </Suspense>
        </SpecimenBoundary>
      ) : null}
      <div className="rfx-inner">
        <header className="rfx-head">
          <span className="rfx-name">{name}</span>
          <span className="rfx-head-meta">{vnum ? <b className="rfx-no">{vnum}</b> : null}</span>
        </header>

        <div className="rfx-stage">
          <div className="rfx-halftone" aria-hidden="true" />
          {face}
          {faceSource ? (
            <span className="rfx-gripchip">
              <i
                className="rfx-dot"
                style={{ background: faceSource.color, color: faceSource.color }}
                aria-hidden="true"
              />
              {faceSource.label}
            </span>
          ) : null}
        </div>

        {cue || confidence ? (
          <div className="rfx-read">
            {cue ? <p className="rfx-cue">{cue}</p> : null}
            {confidence ? (
              <ul className="rfx-facts">
                <li className="rfx-fact">
                  <i
                    className="rfx-dot"
                    style={{ background: confidence.color, color: confidence.color }}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Source: </span>
                  {confidence.label}
                  {confidence.approx ? <span className="rfx-approx">≈ approx</span> : null}
                </li>
              </ul>
            ) : null}
          </div>
        ) : null}

        {to ? (
          <div className="rfx-strip">
            <span className="rfx-open">
              Open specimen <i aria-hidden="true">→</i>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )

  const cardClass = `rfx-card${gold ? ' is-gold' : ''}${foil ? ' has-foil' : ''} ${className ?? ''}`

  return (
    <div ref={viewRef} className="rfx-holder" style={{ perspective: '1500px', width: '100%', maxWidth }}>
      {to ? (
        <Link
          to={to}
          ref={tiltRef as Ref<HTMLAnchorElement>}
          {...handlers}
          className={`block ${cardClass}`}
          aria-label={`${name} specimen`}
          style={cardStyle}
        >
          {inner}
        </Link>
      ) : (
        <article ref={tiltRef as Ref<HTMLElement>} {...handlers} className={cardClass} style={cardStyle}>
          {inner}
        </article>
      )}
    </div>
  )
}
