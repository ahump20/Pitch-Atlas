import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PITCHES } from '../../data/pitches'
import type { PitchAtlasEntry, PitchFamily } from '../../data/types'

/*
  The global shape map: every filed specimen on one catcher's-eye quadrant, placed by
  the DIRECTION it breaks — ride up top, drop below, arm-side and glove-side across —
  against a spinless ball at the origin. Aggregated so the families separate visually:
  fastballs ride, breaking balls drop and sweep, offspeed fades arm-side and down.

  This is a map of direction, never a measured magnitude. Pitches that break the same
  way fan out within their zone so each stays readable. Handedness is a mirror, not new
  data: the toggle flips which physical side "arm-side" lands on and relabels the poles,
  so a right-hander's slider and a left-hander's slider read as mirror images.
*/

const W = 640
const H = 500
const CX = W / 2
const CY = H / 2
const COL = 180 // horizontal zone offset (arm-side / glove-side)
const ROW = 132 // vertical zone offset (ride / drop)
const CLAMP = 220 // axis-guide half-extent

const FAMILY_META: Record<PitchFamily, { label: string; color: string }> = {
  fastball: { label: 'Fastball', color: '#37D6FF' },
  breaking: { label: 'Breaking', color: '#8A6BFF' },
  offspeed: { label: 'Offspeed', color: '#7CFF52' },
}

interface Plotted {
  entry: PitchAtlasEntry
  x: number
  y: number
  family: PitchFamily
}

const LABELS: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  'two-seam': { dx: 0, dy: -24, anchor: 'middle' },
  'circle-change': { dx: 16, dy: 2, anchor: 'start' },
  splitter: { dx: 16, dy: 18, anchor: 'start' },
  splinker: { dx: -16, dy: 22, anchor: 'end' },
  forkball: { dx: -16, dy: -16, anchor: 'end' },
  eephus: { dx: 14, dy: 6, anchor: 'start' },
}

/* Shape words from the pitch's own sourced motion fields — no measured magnitude,
   the same read the tunnel plot uses. Feeds the marker tooltip and its aria-label. */
function shapeWords(entry: PitchAtlasEntry): string {
  const m = entry.motion
  const v = m.verticalShape === 'ride' ? 'rides' : m.verticalShape === 'drop' ? 'drops' : 'holds flat'
  const h =
    m.horizontalDir === 'arm-side'
      ? 'runs arm-side'
      : m.horizontalDir === 'glove-side'
        ? 'sweeps glove-side'
        : 'stays true'
  return `${v}, ${h}`
}

export function MovementMap() {
  const [hand, setHand] = useState<'RHP' | 'LHP'>('RHP')
  const [active, setActive] = useState<string | null>(null)
  const navigate = useNavigate()
  const handFactor = hand === 'RHP' ? 1 : -1

  const plotted = useMemo<Plotted[]>(() => {
    const cellCounts: Record<string, number> = {}
    return PITCHES.map((entry) => {
      const m = entry.motion
      const hSign = m.horizontalDir === 'arm-side' ? 1 : m.horizontalDir === 'glove-side' ? -1 : 0
      const baseX = CX + hSign * handFactor * COL
      const baseY = CY + (m.verticalShape === 'ride' ? -ROW : m.verticalShape === 'drop' ? ROW : 0)
      const key = `${m.verticalShape}|${m.horizontalDir}`
      const i = cellCounts[key] ?? 0
      cellCounts[key] = i + 1
      // fan pitches that share a direction so labels stay legible
      const ang = (i % 6) * (Math.PI / 3)
      const rad = i === 0 ? 0 : 38 + Math.floor((i - 1) / 6) * 24
      const x = baseX + Math.cos(ang) * rad
      const y = baseY + Math.sin(ang) * rad
      return { entry, x, y, family: entry.canonical.family }
    })
  }, [handFactor])

  // pole labels follow the handedness mirror
  const rightPole = hand === 'RHP' ? 'ARM' : 'GLOVE'
  const leftPole = hand === 'RHP' ? 'GLOVE' : 'ARM'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="mono-label text-ink-3">Handedness</span>
        <div className="inline-flex overflow-hidden rounded-lg border border-ink/25">
          {(['RHP', 'LHP'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHand(h)}
              aria-pressed={hand === h}
              className="rfx-seg"
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Shape map of the filed pitches from a ${hand === 'RHP' ? 'right-handed' : 'left-handed'} pitcher's catcher's-eye view. Each pitch sits in the direction it breaks (ride up top, drop below, arm-side and glove-side across) against a spinless ball at center. A map of direction, not a measured magnitude.`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* axis guides */}
        <line x1={CX} y1={CY - CLAMP - 16} x2={CX} y2={CY + CLAMP + 16} stroke="var(--color-ink-3)" strokeWidth="1" />
        <line x1={CX - CLAMP - 16} y1={CY} x2={CX + CLAMP + 16} y2={CY} stroke="var(--color-ink-3)" strokeWidth="1" />

        {/* pole labels */}
        <text x={CX} y={CY - CLAMP - 22} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">RIDE</text>
        <text x={CX} y={CY + CLAMP + 30} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">DROP</text>
        <text x={CX - CLAMP - 20} y={CY - 8} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">{leftPole}</text>
        <text x={CX + CLAMP + 20} y={CY - 8} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">{rightPole}</text>

        {/* spinless reference */}
        <circle cx={CX} cy={CY} r="6" fill="none" stroke="var(--color-ink-2)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />

        {/* the pitches — each marker is a real link to its specimen: pointer + keyboard
            (role=link, tabbable, Enter/Space), with a hover/focus tooltip. The connector
            to the origin stays decorative; the text-link row below is the no-JS fallback. */}
        {plotted.map(({ entry, x, y, family }) => {
          const c = FAMILY_META[family].color
          const label = LABELS[entry.display.slug] ?? { dx: 0, dy: -14, anchor: 'middle' as const }
          const slug = entry.display.slug
          const open = () => navigate(`/pitch/${slug}`)
          return (
            <g key={slug}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke={c} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.32" />
              <g
                className="mm-dot"
                role="link"
                tabIndex={0}
                aria-label={`${entry.canonical.name}. ${FAMILY_META[family].label}, ${shapeWords(entry)}. Open specimen.`}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    open()
                  }
                }}
                onMouseEnter={() => setActive(slug)}
                onMouseLeave={() => setActive((s) => (s === slug ? null : s))}
                onFocus={() => setActive(slug)}
                onBlur={() => setActive((s) => (s === slug ? null : s))}
              >
                {/* a comfortable, invisible hit + touch target around the 7px dot */}
                <circle cx={x} cy={y} r="16" fill="transparent" />
                <circle className="mm-focus-ring" cx={x} cy={y} r="12" fill="none" stroke="var(--color-seam)" strokeWidth="2" />
                <circle cx={x} cy={y} r="7" fill={c} fillOpacity="0.9" />
                <circle cx={x} cy={y} r="7" fill="none" stroke="var(--color-void)" strokeWidth="1" />
                <text
                  x={x + label.dx}
                  y={y + label.dy}
                  fill="var(--color-ink)"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  textAnchor={label.anchor}
                  dominantBaseline="middle"
                  paintOrder="stroke"
                  stroke="var(--color-void)"
                  strokeWidth="3"
                >
                  {entry.display.shortName}
                </text>
              </g>
            </g>
          )
        })}

        {/* the hover/focus tooltip, drawn last so it sits above every marker. Its copy
            is the pitch's own name, family, and sourced shape words — never a number. */}
        {(() => {
          const p = plotted.find((q) => q.entry.display.slug === active)
          if (!p) return null
          const name = p.entry.canonical.name
          const meta = `${FAMILY_META[p.family].label} · ${shapeWords(p.entry)}`
          const padX = 10
          const w = Math.max(name.length * 6.4, meta.length * 5.4) + padX * 2
          const h = 36
          const above = p.y - 14 - h > 4
          const ty = above ? p.y - 14 - h : p.y + 16
          const tx = Math.min(Math.max(p.x - w / 2, 4), W - w - 4)
          return (
            <g pointerEvents="none" aria-hidden="true">
              <rect x={tx} y={ty} width={w} height={h} rx="7" fill="#14120C" stroke={FAMILY_META[p.family].color} strokeOpacity="0.5" />
              <text x={tx + padX} y={ty + 15} fill="var(--color-bone)" fontFamily="var(--font-mono)" fontSize="11">
                {name}
              </text>
              <text x={tx + padX} y={ty + 28} fill="var(--color-bone-2)" fontFamily="var(--font-mono)" fontSize="9.5">
                {meta}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* legend + links to each filed pitch */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {(Object.keys(FAMILY_META) as PitchFamily[]).map((f) => (
          <span key={f} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: FAMILY_META[f].color }} />
            <span className="mono-label text-ink-2">{FAMILY_META[f].label}</span>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {PITCHES.map((p) => (
          <Link
            key={p.display.slug}
            to={`/pitch/${p.display.slug}`}
            className="mono-label text-seam transition-colors hover:text-ink"
          >
            {p.display.shortName} →
          </Link>
        ))}
      </div>
    </div>
  )
}
