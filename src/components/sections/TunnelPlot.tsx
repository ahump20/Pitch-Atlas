import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PITCHES } from '../../data/pitches'
import type { PitchAtlasEntry, PitchFamily } from '../../data/types'

/*
  The tunnel plot. Two pitches, one release window. Tunneling is the deception of
  shared early flight: from the same arm slot and release point, two pitches look
  identical until the hitter has to commit, then they separate late. This view
  shows that on one catcher's-eye frame — both pitches enter through a shared
  tunnel window near center and travel to their own sourced break locations, with
  the gap between those endpoints (the late separation the hitter must cover after
  committing) measured in inches.

  Honesty line: each endpoint sits in the DIRECTION that pitch breaks — no measured
  magnitude. The tunnel window and the connecting flight paths are an explicit schematic
  of the shared-release idea. Handedness is a mirror, not new data: the toggle flips which
  physical side "arm-side" lands on and relabels the poles.
*/

const W = 520
const H = 470
const CX = W / 2
const CY = H / 2 + 18
const COL = 130 // horizontal direction offset
const ROW = 118 // vertical direction offset
const CLAMP = 178
// the shared tunnel window sits a touch above the spinless center: where two
// well-tunneled pitches still look like one pitch out of the hand.
const TUNNEL_Y = CY - 150

const FAMILY_META: Record<PitchFamily, { label: string; color: string }> = {
  fastball: { label: 'Fastball', color: '#37D6FF' },
  breaking: { label: 'Breaking', color: '#8A6BFF' },
  offspeed: { label: 'Offspeed', color: '#7CFF52' },
}

interface Spot {
  entry: PitchAtlasEntry
  x: number
  y: number
}

function shapeWords(entry: PitchAtlasEntry): string {
  const m = entry.motion
  const v = m.verticalShape === 'ride' ? 'rides' : m.verticalShape === 'drop' ? 'drops' : 'holds flat'
  const h =
    m.horizontalDir === 'arm-side' ? 'runs arm-side' : m.horizontalDir === 'glove-side' ? 'sweeps glove-side' : 'stays true'
  return `${v}, ${h}`
}

function plot(entry: PitchAtlasEntry, handFactor: number, nudge: number): Spot {
  const m = entry.motion
  const hSign = m.horizontalDir === 'arm-side' ? 1 : m.horizontalDir === 'glove-side' ? -1 : 0
  const x = CX + hSign * handFactor * COL + nudge
  const y = CY + (m.verticalShape === 'ride' ? -ROW : m.verticalShape === 'drop' ? ROW : 0)
  return { entry, x: Math.max(CX - CLAMP, Math.min(CX + CLAMP, x)), y }
}

export function TunnelPlot() {
  const [hand, setHand] = useState<'RHP' | 'LHP'>('RHP')
  const [aSlug, setA] = useState('four-seam')
  const [bSlug, setB] = useState('slider')
  const handFactor = hand === 'RHP' ? 1 : -1

  const a = useMemo(() => PITCHES.find((p) => p.display.slug === aSlug) ?? PITCHES[0], [aSlug])
  const b = useMemo(() => PITCHES.find((p) => p.display.slug === bSlug) ?? PITCHES[1], [bSlug])
  const same = a.display.slug === b.display.slug

  // nudge A and B apart slightly when they break the same direction, so both read.
  const sameCell =
    a.motion.verticalShape === b.motion.verticalShape && a.motion.horizontalDir === b.motion.horizontalDir
  const sa = useMemo(() => plot(a, handFactor, sameCell ? -34 : 0), [a, handFactor, sameCell])
  const sb = useMemo(() => plot(b, handFactor, sameCell ? 34 : 0), [b, handFactor, sameCell])

  const rightPole = hand === 'RHP' ? 'ARM' : 'GLOVE'
  const leftPole = hand === 'RHP' ? 'GLOVE' : 'ARM'

  const colorA = FAMILY_META[a.canonical.family].color
  const colorB = FAMILY_META[b.canonical.family].color

  // a gentle shared-then-splitting path: both leave the tunnel window together,
  // then curve to their own endpoints. The control point is the tunnel window, so
  // the two paths overlap near the top and diverge toward the break.
  const pathA = `M ${CX} ${TUNNEL_Y} Q ${CX} ${(TUNNEL_Y + sa.y) / 2} ${sa.x} ${sa.y}`
  const pathB = `M ${CX} ${TUNNEL_Y} Q ${CX} ${(TUNNEL_Y + sb.y) / 2} ${sb.x} ${sb.y}`

  return (
    <div className="flex flex-col gap-6">
      {/* pickers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mono-label text-ink-3">Pitch A</span>
          <select
            value={aSlug}
            onChange={(e) => setA(e.target.value)}
            className="rfx-select mt-1.5"
            aria-label="First pitch to compare"
          >
            {PITCHES.map((p) => (
              <option key={p.display.slug} value={p.display.slug}>
                {p.display.shortName}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mono-label text-ink-3">Pitch B</span>
          <select
            value={bSlug}
            onChange={(e) => setB(e.target.value)}
            className="rfx-select mt-1.5"
            aria-label="Second pitch to compare"
          >
            {PITCHES.map((p) => (
              <option key={p.display.slug} value={p.display.slug}>
                {p.display.shortName}
              </option>
            ))}
          </select>
        </label>
        <div className="block">
          <span className="mono-label text-ink-3">Handedness</span>
          <div className="mt-1.5 inline-flex overflow-hidden rounded-lg border border-cyan/30">
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
      </div>

      {same ? (
        <p className="rfx-panel rounded-sm border-l-2 border-l-seam px-4 py-3 text-sm text-ink-2">
          Pick two different pitches to see the tunnel and the late separation between them.
        </p>
      ) : null}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Tunnel plot comparing a ${a.display.shortName} and a ${b.display.shortName} from a ${
          hand === 'RHP' ? 'right' : 'left'
        }-handed pitcher. Both share a tunnel window near center, then split toward how each one breaks: the ${a.display.shortName} ${shapeWords(a)}, the ${b.display.shortName} ${shapeWords(b)}. A schematic of direction, not a measured magnitude.`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* axis guides */}
        <line x1={CX} y1={CY - CLAMP - 14} x2={CX} y2={CY + CLAMP + 14} stroke="var(--color-ink-3)" strokeWidth="1" />
        <line x1={CX - CLAMP - 14} y1={CY} x2={CX + CLAMP + 14} y2={CY} stroke="var(--color-ink-3)" strokeWidth="1" />

        {/* pole labels */}
        <text x={CX} y={CY - CLAMP - 20} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">RIDE</text>
        <text x={CX} y={CY + CLAMP + 28} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">DROP</text>
        <text x={CX - CLAMP - 18} y={CY - 8} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">{leftPole}</text>
        <text x={CX + CLAMP + 18} y={CY - 8} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" textAnchor="middle">{rightPole}</text>

        {/* spinless reference */}
        <circle cx={CX} cy={CY} r="6" fill="none" stroke="var(--color-ink-2)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {!same ? (
          <>
            {/* shared tunnel window */}
            <circle cx={CX} cy={TUNNEL_Y} r="13" fill="none" stroke="var(--color-ink-2)" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={CX} y={TUNNEL_Y - 20} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5" textAnchor="middle">
              TUNNEL
            </text>

            {/* the two flight paths: shared near the window, splitting late */}
            <path d={pathA} fill="none" stroke={colorA} strokeWidth="2" opacity="0.7" />
            <path d={pathB} fill="none" stroke={colorB} strokeWidth="2" opacity="0.7" />

            {/* the late split: the gap the hitter must cover after committing */}
            <line x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y} stroke="var(--color-seam)" strokeWidth="1.3" strokeDasharray="4 3" />
            <text
              x={(sa.x + sb.x) / 2 + 8}
              y={(sa.y + sb.y) / 2 - 6}
              fill="var(--color-seam)"
              fontFamily="var(--font-mono)"
              fontSize="9"
              letterSpacing="1.5"
              fontWeight="600"
            >
              LATE SPLIT
            </text>

            {/* endpoints */}
            {[sa, sb].map((s, i) => {
              const c = i === 0 ? colorA : colorB
              return (
                <g key={s.entry.display.slug}>
                  <circle cx={s.x} cy={s.y} r="8" fill={c} fillOpacity="0.92" />
                  <circle cx={s.x} cy={s.y} r="8" fill="none" stroke="var(--color-void)" strokeWidth="1.2" />
                  <text x={s.x} y={s.y + (s.y > CY ? 22 : -14)} fill="var(--color-bone)" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle">
                    {s.entry.display.shortName}
                  </text>
                </g>
              )
            })}
          </>
        ) : null}
      </svg>

      {/* readout */}
      {!same ? (
        <div className="grid gap-px overflow-hidden rounded-sm border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.12)] sm:grid-cols-3">
          <div className="bg-[rgba(5,7,12,0.84)] px-4 py-3">
            <p className="mono-label" style={{ color: colorA }}>{a.display.shortName}</p>
            <p className="mt-1 text-sm capitalize text-bone-2">{shapeWords(a)}</p>
          </div>
          <div className="bg-[rgba(5,7,12,0.84)] px-4 py-3">
            <p className="mono-label text-seam">The late split</p>
            <p className="mt-1 text-sm text-bone-2">Same window out of the hand, then each breaks its own way.</p>
          </div>
          <div className="bg-[rgba(5,7,12,0.84)] px-4 py-3">
            <p className="mono-label" style={{ color: colorB }}>{b.display.shortName}</p>
            <p className="mt-1 text-sm capitalize text-bone-2">{shapeWords(b)}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Link to={`/pitch/${a.display.slug}`} className="mono-label text-cyan transition-colors hover:text-bone">
          {a.display.shortName} specimen →
        </Link>
        <Link to={`/pitch/${b.display.slug}`} className="mono-label text-cyan transition-colors hover:text-bone">
          {b.display.shortName} specimen →
        </Link>
        <Link to="/learn/sequencing" className="mono-label text-cyan transition-colors hover:text-bone">
          Why tunneling works →
        </Link>
      </div>
    </div>
  )
}
