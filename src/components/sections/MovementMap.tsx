import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PITCHES } from '../../data/pitches'
import type { PitchAtlasEntry, PitchFamily } from '../../data/types'

/*
  The global movement map: every filed specimen on one catcher's-eye quadrant,
  induced vertical break up the y-axis, horizontal break across the x-axis, against
  a spinless ball at the origin. The classic movement plot — but aggregated, so the
  families separate visually: fastballs ride, breaking balls drop and sweep, offspeed
  fades arm-side and down.

  Handedness is a mirror, not new data. Every pitch's break is stored relative to the
  arm side; the toggle just flips which physical side "arm-side" lands on and relabels
  the poles, so a right-hander's slider and a left-hander's slider read as the mirror
  images they are. A schematic scaled from each pitch's sourced break figures —
  approximate, never a measured trajectory.
*/

const W = 520
const H = 460
const CX = W / 2
const CY = H / 2
const PX_PER_IN = 8.2
const CLAMP = 188

const FAMILY_META: Record<PitchFamily, { label: string; color: string }> = {
  fastball: { label: 'Fastball', color: '#37D6FF' },
  breaking: { label: 'Breaking', color: '#8A6BFF' },
  offspeed: { label: 'Offspeed', color: '#7CFF52' },
}

function clamp(n: number): number {
  return Math.max(-CLAMP, Math.min(CLAMP, n))
}

interface Plotted {
  entry: PitchAtlasEntry
  x: number
  y: number
  family: PitchFamily
}

export function MovementMap() {
  const [hand, setHand] = useState<'RHP' | 'LHP'>('RHP')
  const handFactor = hand === 'RHP' ? 1 : -1

  const plotted = useMemo<Plotted[]>(() => {
    return PITCHES.map((entry) => {
      const m = entry.motion
      const hSign = m.horizontalDir === 'arm-side' ? 1 : m.horizontalDir === 'glove-side' ? -1 : 0
      const x = CX + clamp(m.horizontalInches * PX_PER_IN * hSign * handFactor)
      const y = CY + clamp(-m.ivbInches * PX_PER_IN) // screen y grows down; +ivb rides up
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
        <div className="inline-flex overflow-hidden rounded-lg border border-cyan/30">
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
        aria-label={`Movement map of ${plotted.length} filed pitches from a ${hand === 'RHP' ? 'right-handed' : 'left-handed'} pitcher's catcher's-eye view. Each pitch is placed by its induced vertical break and horizontal break against a spinless ball at center. A schematic scaled from sourced break figures, approximate.`}
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
          return (
            <g key={entry.display.slug}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke={c} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.32" />
              <circle cx={x} cy={y} r="7" fill={c} fillOpacity="0.9" />
              <circle cx={x} cy={y} r="7" fill="none" stroke="var(--color-void)" strokeWidth="1" />
              <text
                x={x}
                y={y - 12}
                fill="var(--color-bone)"
                fontFamily="var(--font-mono)"
                fontSize="10"
                textAnchor="middle"
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
            className="mono-label text-cyan transition-colors hover:text-bone"
          >
            {p.display.shortName} →
          </Link>
        ))}
      </div>
    </div>
  )
}
