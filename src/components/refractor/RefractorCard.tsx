import { lazy, Suspense, useEffect, useId, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'
import { useCardTilt } from '../../hooks/useCardTilt'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useInView } from '../../hooks/useInView'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'
import type { FamilyCrumb } from './familyCrumb'

/*
  The signature artifact: a holographic refractor specimen card. The foil + tilt are
  decoration; the read is a front-of-card summary on a dark matte plate — never body
  copy on the patterned foil. The `face` slot holds the grip read (an Austin grip
  photo where he throws the pitch, otherwise the seam ball with its grip pins), never
  a player likeness. The card sets its accent triad (--c1/--c2/--c3) and reveal index
  (--i) from props, so every consumer drives the look from data. Gold is the 1/1 chase.

  Tilt now moves through a spring (useCardTilt — same CSS-var contract as the old
  pointer hook, plus a frame-rate store), and a card can opt into the live WebGL
  foil with the `foil` prop: a lazy canvas layer behind the DOM content whose
  houndstooth catches light per-pixel as the card tilts — the physical reference
  card's behavior, digitized. The gate runs BEFORE Suspense, so the prerender, the
  jsdom tests, reduced-motion visitors, no-GL devices, and cards scrolled well off
  screen never request the chunk or hold a GL context: for all of them this card
  renders exactly the static CSS card below.

  Two provenance signals, kept apart on purpose: the crumb (top-right of the window)
  says WHAT KIND of pitch this is; the confidence dot (in the plate) says how well sourced
  the shape read is. The grip-source chip (bottom of the window) says whose grip the face
  shows. There is no stat rail and no movement number by design: the card leads with the
  grip and the shape, in words, never a fabricated figure.

  Accessibility: the whole card is one link when `to` is set; the face is decorative
  (the plate carries the content), the canvas is aria-hidden with no pointer events,
  and reduced motion freezes the reveal and tilt via the rules in index.css.
*/
export type RefractorAccent = { c1: string; c2: string; c3: string }

const FoilLayer = lazy(() => import('./foil/FoilLayer'))

export interface RefractorCardProps {
  to?: string
  index?: number
  gold?: boolean
  accent: RefractorAccent
  /** Specimen number, e.g. "00". */
  vnum?: string
  /** Banner nameplate. */
  name: string
  /** The arched-window visual: a seam ball (with grip pins) or an Austin grip photo. */
  face: ReactNode
  /** The shape read — how the pitch moves, in words. The card's lead read. */
  shape?: string
  /** One short read: the pitcher's grip cue (his words) or the pitch's tagline. */
  cue?: string
  /** The provenance dot for the shape read: how well sourced it is. */
  confidence?: { label: string; color: string; approx?: boolean }
  /** What kind of pitch — family icon + word. A different job from confidence. */
  crumb?: FamilyCrumb
  /** Whose grip the face shows: Austin's first-party grip, or a reference schematic. */
  gripSource?: { label: string; color: string }
  /** Top-right micro-tab. Defaults to "SPECIMEN". */
  wmTab?: string
  /** Override the outer max width (px). Defaults to 360; the hero uses a larger card. */
  maxWidth?: number
  /** Mount the live WebGL foil layer (hero-tier cards only). Default off. */
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
  shape,
  cue,
  confidence,
  crumb,
  gripSource,
  wmTab = 'SPECIMEN',
  maxWidth = 360,
  foil = false,
  className,
}: RefractorCardProps) {
  const { ref: tiltRef, handlers, store } = useCardTilt<HTMLElement>()
  const webgl = useWebGLSupport()
  const reduced = useReducedMotion()
  /* Context budget. Browsers keep ~16 live WebGL contexts; a binder of foil
     cards would blow through that on its own. Each card opens its context only
     near the viewport and surrenders it when scrolled well away (FoilLayer's
     cleanup loses the context, freeing the slot). */
  const { ref: viewRef, inView } = useInView<HTMLDivElement>()
  /* useInView reports in-view until its observer attaches — optimistic for
     content, wrong for a GL budget: every offscreen card would open a context
     for one frame at load. Arm the foil only after a real answer: while the
     report is the optimistic "on", confirm with one geometry read a frame
     later; a report of "off" proves the observer is live, so arm and let
     inView rule from there. Once armed, armed for good — inView alone mounts
     and unmounts the layer. */
  const [foilArmed, setFoilArmed] = useState(false)
  useEffect(() => {
    if (!foil || foilArmed) return
    if (inView) {
      const el = viewRef.current
      if (!el) return
      const id = window.requestAnimationFrame(() => {
        const margin = 160 // match the hook's default rootMargin
        const r = el.getBoundingClientRect()
        if (r.bottom >= -margin && r.top <= window.innerHeight + margin) setFoilArmed(true)
      })
      return () => window.cancelAnimationFrame(id)
    }
    const id = window.setTimeout(() => setFoilArmed(true), 0)
    return () => window.clearTimeout(id)
  }, [foil, foilArmed, inView, viewRef])
  // unique arc-path id per card instance (several cards render per page)
  const arcId = `wmarc-${useId().replace(/:/g, '')}`

  const cardStyle = {
    '--c1': accent.c1,
    '--c2': accent.c2,
    '--c3': accent.c3,
    '--i': index,
  } as CSSProperties

  const CrumbIcon = crumb?.Icon

  /* the live foil mounts only when it can actually run AND is near the
     viewport; everyone else keeps the CSS card untouched (it is the
     prerendered DOM and the test DOM) */
  const liveFoil =
    foil && webgl && !reduced && inView && foilArmed ? (
      <SpecimenBoundary fallback={null}>
        <Suspense fallback={null}>
          <FoilLayer store={store} accent={accent} gold={gold} />
        </Suspense>
      </SpecimenBoundary>
    ) : null

  const inner = (
    <div className="rfx-field">
      {liveFoil}
      <div className="rfx-inner">
        <div className="rfx-cardtop">
          <span
            className="rfx-diamond"
            aria-hidden="true"
            style={{ width: 24, height: 24, borderRadius: 5, position: 'absolute', left: 2, top: 0 }}
          >
            <b style={{ fontSize: 7 }}>PA</b>
          </span>
          {/* the brand arches over the field, like the reference card's script */}
          <svg className="rfx-wmarc" viewBox="0 0 200 34" aria-hidden="true">
            <defs>
              <path id={arcId} d="M 8 30 Q 100 4 192 30" fill="none" />
            </defs>
            <text>
              <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                PITCH ATLAS
              </textPath>
            </text>
          </svg>
          <span
            className="absolute right-1 top-[5px] font-mono text-bone-2"
            style={{ fontSize: '7.5px', letterSpacing: '0.22em' }}
          >
            {wmTab}
          </span>
        </div>

        {/* vnum + crumb live OUTSIDE the window so its arched overflow clip can't
            slice them — they share the window's box via the unclipped wrap. */}
        <div className="rfx-windowwrap">
          <div className="rfx-window">
            <div className="rfx-halftone" aria-hidden="true" />
            {face}
            {gripSource ? (
              <span className="rfx-gripchip">
                <i className="rfx-dot" style={{ background: gripSource.color, color: gripSource.color }} />
                {gripSource.label}
              </span>
            ) : null}
          </div>
          {vnum ? <span className="rfx-vnum">{vnum}</span> : null}
          {crumb && CrumbIcon ? (
            <span className="rfx-crumb">
              <CrumbIcon />
              {crumb.label}
            </span>
          ) : null}
        </div>

        <div className="rfx-banner">{name}</div>

        <div className="rfx-content">
          {shape || cue ? (
            <div className="rfx-summary">
              {shape ? (
                <div className="rfx-shape">
                  <span className="rfx-k">Shape</span>
                  <span className="rfx-v">{shape}</span>
                </div>
              ) : null}
              {cue ? <p className="rfx-cue">{cue}</p> : null}
            </div>
          ) : null}

          {confidence ? (
            <span className="rfx-srcbadge">
              <i className="rfx-dot" style={{ background: confidence.color, color: confidence.color }} />
              {confidence.label}
              {confidence.approx ? <span className="rfx-approx">≈ approx</span> : null}
            </span>
          ) : null}
        </div>

        <div className="rfx-strip">
          <span className="inline-flex items-center gap-1">
            pitch-atlas.com
            <span className="mx-1 inline-block h-[11px] w-[11px] rotate-45 rounded-[3px] align-middle rfx-diamond" aria-hidden="true" />
            {to ? 'OPEN SPECIMEN' : 'SOURCED SPECIMEN'}
          </span>
        </div>
      </div>
    </div>
  )

  const cardClass = `rfx-card${gold ? ' is-gold' : ''}${foil ? ' has-foil' : ''} ${className ?? ''}`

  return (
    <div ref={viewRef} style={{ perspective: '1500px', width: '100%', maxWidth }}>
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
