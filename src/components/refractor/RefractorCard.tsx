import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useRefractorTilt } from '../../hooks/useRefractorTilt'

/*
  The signature artifact: a holographic refractor specimen card. Foil + tilt are
  decoration; the scouting rows and the confidence dot carry the sourced reading.
  The `face` slot holds the leather-ball SVG (a static SeamSchematic in a grid, a
  live BallStage in the hero) — never a player likeness. The card sets its accent
  triad (--c1/--c2/--c3) and reveal index (--i) from props, so every consumer
  drives the look from data. Gold is the 1/1 chase.

  Accessibility: the whole card is one link when `to` is set; the face is
  decorative (the scouting text is the content), and reduced motion freezes the
  reveal, tilt, and foil via the rules in index.css.
*/
export type ScoutRow = { label: string; value: string; num?: boolean }
export type RefractorAccent = { c1: string; c2: string; c3: string }

export interface RefractorCardProps {
  to?: string
  index?: number
  gold?: boolean
  accent: RefractorAccent
  /** Specimen number, e.g. "00". */
  vnum?: string
  /** Banner nameplate. */
  name: string
  tagline?: string
  bigStat?: { value: string; unit?: string; label: string }
  face: ReactNode
  scout?: ScoutRow[]
  note?: ReactNode
  /** The provenance dot under the note: a sourced confidence tier. */
  confidence?: { label: string; color: string; approx?: boolean }
  pills?: string[]
  /** Top-right micro-tab. Defaults to "SPECIMEN". */
  wmTab?: string
  className?: string
}

export function RefractorCard({
  to,
  index = 0,
  gold = false,
  accent,
  vnum,
  name,
  tagline,
  bigStat,
  face,
  scout,
  note,
  confidence,
  pills,
  wmTab = 'SPECIMEN',
  className,
}: RefractorCardProps) {
  const tilt = useRefractorTilt<HTMLElement>()

  const cardStyle = {
    '--c1': accent.c1,
    '--c2': accent.c2,
    '--c3': accent.c3,
    '--i': index,
  } as React.CSSProperties

  const inner = (
    <div className="rfx-field">
      <div className="rfx-inner">
        <div className="rfx-cardtop">
          <span
            className="rfx-diamond"
            aria-hidden="true"
            style={{ width: 24, height: 24, borderRadius: 5, position: 'absolute', left: 2, top: 0 }}
          >
            <b style={{ fontSize: 7 }}>PA</b>
          </span>
          <span className="rfx-wm">Pitch Atlas</span>
          <span
            className="absolute right-1 top-[5px] font-mono text-bone-2"
            style={{ fontSize: '7.5px', letterSpacing: '0.22em' }}
          >
            {wmTab}
          </span>
        </div>

        <div className="rfx-window">
          <div className="rfx-halftone" aria-hidden="true" />
          {vnum ? <span className="rfx-vnum">{vnum}</span> : null}
          {face}
          {bigStat ? (
            <span className="rfx-bigstat">
              {bigStat.value}
              {bigStat.unit ? <small>{bigStat.unit}</small> : null}
              <span className="rfx-lab">{bigStat.label}</span>
            </span>
          ) : null}
        </div>

        <div className="rfx-banner">{name}</div>
        {tagline ? <div className="rfx-tagline">{tagline}</div> : null}

        {scout && scout.length ? (
          <div className="rfx-scout">
            <div className="rfx-scout-hd">Scouting</div>
            {scout.map((r) => (
              <div className="rfx-row" key={r.label}>
                <div className="rfx-lab">{r.label}</div>
                <div className={`rfx-val${r.num ? ' is-num' : ''}`}>{r.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {note || confidence ? (
          <div className="mt-2 text-[9.5px] leading-[1.42] text-bone-2">
            {note}
            {confidence ? (
              <span className="mt-1.5 inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.08em] text-bone-2" style={{ fontSize: '8px' }}>
                <i className="rfx-dot" style={{ background: confidence.color, color: confidence.color }} />
                {confidence.label}
                {confidence.approx ? (
                  <span className="ml-1 rounded-full border px-1.5 py-px text-[7px]" style={{ borderColor: 'var(--color-sand-bright)', color: 'var(--color-sand-bright)' }}>
                    ≈ approx
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="rfx-strip">
          <span className="inline-flex items-center gap-1">
            pitch-atlas.com
            <span className="mx-1 inline-block h-[11px] w-[11px] rotate-45 rounded-[3px] align-middle rfx-diamond" aria-hidden="true" />
            {to ? 'OPEN SPECIMEN' : 'SOURCED SPECIMEN'}
          </span>
          {pills && pills.length ? (
            <span className="flex gap-1.5">
              {pills.map((p) => (
                <span className="rfx-pill" key={p}>
                  {p}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )

  const cardClass = `rfx-card${gold ? ' is-gold' : ''} ${className ?? ''}`

  return (
    <div style={{ perspective: '1500px', width: '100%', maxWidth: 360 }}>
      {to ? (
        <Link
          to={to}
          ref={tilt.ref as React.Ref<HTMLAnchorElement>}
          onPointerMove={tilt.onPointerMove as unknown as React.PointerEventHandler<HTMLAnchorElement>}
          onPointerLeave={tilt.onPointerLeave}
          className={`block ${cardClass}`}
          aria-label={`${name} specimen`}
          style={cardStyle}
        >
          {inner}
        </Link>
      ) : (
        <article
          ref={tilt.ref as React.Ref<HTMLElement>}
          onPointerMove={tilt.onPointerMove}
          onPointerLeave={tilt.onPointerLeave}
          className={cardClass}
          style={cardStyle}
        >
          {inner}
        </article>
      )}
    </div>
  )
}
