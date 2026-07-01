import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

export function MovementMap() {
  const [hand, setHand] = useState<'RHP' | 'LHP'>('RHP')
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

        {/* the pitches */}
        {plotted.map(({ entry, x, y, family }) => {
          const c = FAMILY_META[family].color
          const label = LABELS[entry.display.slug] ?? { dx: 0, dy: -14, anchor: 'middle' as const }
          return (
            <g key={entry.display.slug}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke={c} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.32" />
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
          )
        })}
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
