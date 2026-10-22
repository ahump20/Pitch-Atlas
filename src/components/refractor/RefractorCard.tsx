import { accentInk } from './accents'
import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'
import { useCardTilt, type TiltEngine, type TiltMode } from '../../hooks/useCardTilt'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'
import { hexToTriple, type MaterialIdentity } from './material/cardMaterialProgram'
import { presetForEntry, type CardMaterial } from './material/materialPresets'
import { useAmbientMotion } from './material/useAmbientMotion'

/*
  The front-of-card job is narrow: name, grip face, one sourced cue, and the
  route into the full file. Detailed shape, family, grade, and source records
  live on the back or in the specimen.

  The material is the card's whole face. One canvas the size of the card sits
  between the stock and the print — under the header, the cue plate and the
  strip, over the field and the media — so the rim and the field carry the foil
  and only a thin lamination glaze crosses the window. Without WebGL2 the CSS
  ramp underneath is the same material at rest.
*/

export type RefractorAccent = {
  c1: string
  c2: string
  c3: string
  /** A throwback-uniform frame for a standard card: the foil ramp and bezel ring
      change, the stock and print stay the set's. Ignored on the ember 1/1. */
  finish?: 'powder' | 'teal'
}

const MaterialLayer = lazy(() => import('./material/MaterialLayer'))

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
  /** Mount the live material (hero, the filed set, the inspector). */
  foil?: boolean
  /** How the card is handled: `hero` turns slowly on its own, `inspector` can be grabbed on both axes. */
  mode?: TiltMode
  /** The finish; defaults to the pitch's own preset. */
  material?: CardMaterial
  /** Slow ambient turn. Defaults on for the hero; the inspector decides for itself. */
  ambient?: boolean
  /** Ambient tuning (the inspector's Finish panel). */
  ambientAmplitude?: number
  ambientSpeed?: number
  /** Hands the tilt engine to a parent that needs to drive it (the inspector's rail). */
  onEngine?: (engine: TiltEngine) => void
  className?: string
}

const BONE = hexToTriple('#f6f1e6')

/** The bezel ring the CSS draws with box-shadow, as the shader's colour. */
function ringTriple(accent: RefractorAccent, gold: boolean): [number, number, number] {
  if (gold) return hexToTriple('#bf5700')
  if (accent.finish === 'powder') return hexToTriple('#c41e3a')
  if (accent.finish === 'teal') return hexToTriple('#00b2a9')
  const c3 = hexToTriple(accent.c3)
  // color-mix(in srgb, c3 42%, rgba(246,241,230,.5)) composited over the near-black field
  return [0, 1, 2].map((i) => c3[i] * 0.42 + BONE[i] * 0.29 + 0.03 * 0.29) as [number, number, number]
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
  mode = 'rest',
  material,
  ambient,
  ambientAmplitude = 1,
  ambientSpeed = 1,
  onEngine,
  className,
}: RefractorCardProps) {
  const { ref: tiltRef, handlers, store, engine } = useCardTilt<HTMLElement>(mode)
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  const { ref: viewRef, inView } = useInView<HTMLDivElement>()
  const [foilArmed, setFoilArmed] = useState(false)

  useAmbientMotion(engine, {
    active: foil && (ambient ?? mode === 'hero'),
    inView,
    reduced,
    amplitude: ambientAmplitude,
    speed: ambientSpeed,
  })

  useEffect(() => {
    onEngine?.(engine)
  }, [engine, onEngine])

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

  const resolvedMaterial = useMemo(
    () => material ?? presetForEntry({ gold, finish: accent.finish }),
    [material, gold, accent.finish],
  )
  const identity = useMemo<MaterialIdentity>(
    () => ({ c2: hexToTriple(accent.c2), c3: hexToTriple(accent.c3), ring: ringTriple(accent, gold), seed: index }),
    [accent, gold, index],
  )

  const cardStyle = {
    '--c1': accent.c1,
    '--c2': accent.c2,
    '--c3': accent.c3,
    // small print on the card tints from this; burnt orange hands it bone instead
    '--c3-ink': accentInk(accent.c3),
    '--i': index,
  } as CSSProperties

  // reduced motion still mounts the material: it draws its one rest frame and holds
  const liveMaterial = foil && webgl && inView && foilArmed

  const inner = (
    <>
      {liveMaterial ? (
        <SpecimenBoundary fallback={null}>
          <Suspense fallback={null}>
            <MaterialLayer store={store} material={resolvedMaterial} identity={identity} />
          </Suspense>
        </SpecimenBoundary>
      ) : null}
      <div className="rfx-field">
        <div className="rfx-inner">
          <header className="rfx-head">
            <span className="rfx-titlelock">
              <span className="rfx-overline">Filed specimen</span>
              <span className="rfx-name">{name}</span>
            </span>
            <span className="rfx-head-meta">
              {vnum ? <><span className="rfx-filelabel">File</span><b className="rfx-no">{vnum}</b></> : null}
            </span>
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
              <div className="rfx-readmeta" aria-hidden="true">
                <span>Grip tell</span>
                <span>{vnum ? `PA—${vnum}` : 'Pitch Atlas'}</span>
              </div>
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
              <span className="rfx-serial" aria-hidden="true">Grip / release / shape</span>
              <span className="rfx-open">
                Open specimen <i aria-hidden="true">→</i>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )

  const cardClass = `rfx-card${gold ? ' is-gold' : accent.finish ? ` is-${accent.finish}` : ''}${foil ? ' has-foil' : ''}${mode !== 'rest' ? ` is-${mode}` : ''} ${className ?? ''}`

  return (
    <div ref={viewRef} className="rfx-holder" style={{ perspective: '1500px', width: '100%', maxWidth }}>
      {to ? (
        <Link
          to={to}
          viewTransition
          onClick={(event) => {
            if (event.defaultPrevented || reduced || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            const card = event.currentTarget
            card.style.viewTransitionName = 'active-specimen'
            // Also clear if navigation is interrupted and this element survives.
            window.setTimeout(() => { card.style.viewTransitionName = '' }, 1000)
          }}
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
