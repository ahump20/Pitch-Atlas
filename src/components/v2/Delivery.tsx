import { useEffect, useState, type CSSProperties } from 'react'
import { useReveal } from '../motion/Reveal'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { PLATE_273 } from '../../data/media/plate273'

/*
  One pitch, thrown across the home page. Each chapter mark holds a frame of
  Muybridge's plate 273 and, the first time it is seen, steps the delivery
  forward to its own phase: set, break, cock, release, finish. The close lays
  the whole plate out as the record. Reduced motion lands on each chapter's
  phase without stepping. Decorative: every mark and section reads without it.
*/
const STEP_MS = 90

export function PlateFrame({ n, className = '', style }: { n: number; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox={PLATE_273.viewBox} fill="currentColor" aria-hidden="true" focusable="false">
      <use href={`${PLATE_273.src}#f${n}`} />
    </svg>
  )
}

export function DeliveryFigure({ from, to, className = '', style }: { from: number; to: number; className?: string; style?: CSSProperties }) {
  const { ref, shown } = useReveal<HTMLSpanElement>('0px 0px -12% 0px')
  const reduced = useReducedMotion()
  const [frame, setFrame] = useState(from)

  // the first render is always `from`, so the prerendered page and the hydrated one agree
  useEffect(() => {
    if (!shown || frame >= to) return
    const id = window.setTimeout(() => setFrame((n) => (reduced ? to : Math.min(n + 1, to))), reduced ? 0 : STEP_MS)
    return () => window.clearTimeout(id)
  }, [reduced, shown, frame, to])

  return (
    <span ref={ref} className={`delivery-figure ${className}`} style={style} aria-hidden="true">
      <PlateFrame n={frame} />
    </span>
  )
}

export function DeliveryPlate() {
  const { ref, shown } = useReveal<HTMLElement>('0px 0px -10% 0px')
  return (
    <figure ref={ref} className={`delivery-plate${shown ? ' is-landed' : ''}`}>
      <div className="delivery-plate-strip" aria-hidden="true">
        {Array.from({ length: PLATE_273.frames }, (_, i) => (
          <PlateFrame key={i} n={i + 1} className="delivery-plate-frame" style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      <figcaption>
        <span className="delivery-plate-title">
          Plate {PLATE_273.plate}, {PLATE_273.title} ({PLATE_273.year})
        </span>
        <span className="delivery-plate-credit">
          {PLATE_273.maker} photographed this delivery for <cite>{PLATE_273.work}</cite>. The pitcher at each
          chapter mark above is traced from it. Public domain.{' '}
          <a href={PLATE_273.source.url} title={PLATE_273.source.label} target="_blank" rel="noreferrer">
            Source<span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </span>
      </figcaption>
    </figure>
  )
}
