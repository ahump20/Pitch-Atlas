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

  Honesty line: the two endpoints are each pitch's sourced induced-vertical and
  horizontal break — real figures from the specimen records. The tunnel window and
  the connecting flight paths are an explicit schematic of the shared-release idea,
  not a measured trajectory. Handedness is a mirror, not new data: the toggle flips
  which physical side "arm-side" lands on and relabels the poles.
*/

const W = 520
const H = 470
const CX = W / 2
const CY = H / 2 + 18
const PX_PER_IN = 8.0
const CLAMP = 178
// the shared tunnel window sits a touch above the spinless center: where two
// well-tunneled pitches still look like one pitch out of the hand.
const TUNNEL_Y = CY - 150

const FAMILY_META: Record<PitchFamily, { label: string; color: string }> = {
  fastball: { label: 'Fastball', color: 'var(--color-navy)' },
  breaking: { label: 'Breaking', color: 'var(--color-seam)' },
  offspeed: { label: 'Offspeed', color: 'var(--color-powder)' },
}

function clamp(n: number): number {
  return Math.max(-CLAMP, Math.min(CLAMP, n))
}

interface Spot {
  entry: PitchAtlasEntry
  x: number
  y: number
  /** unclamped break in inches, for the separation math */
  hIn: number
  vIn: number
}

function plot(entry: PitchAtlasEntry, handFactor: number): Spot {
  const m = entry.motion
  const hSign = m.horizontalDir === 'arm-side' ? 1 : m.horizontalDir === 'glove-side' ? -1 : 0
  const hIn = m.horizontalInches * hSign * handFactor
  const vIn = m.ivbInches
  return {
    entry,
    x: CX + clamp(hIn * PX_PER_IN),
    y: CY + clamp(-vIn * PX_PER_IN),
    hIn,
    vIn,
  }
}

export function TunnelPlot() {
  const [hand, setHand] = useState<'RHP' | 'LHP'>('RHP')
  const [aSlug, setA] = useState('four-seam')
  const [bSlug, setB] = useState('slider')
  const handFactor = hand === 'RHP' ? 1 : -1

  const a = useMemo(() => PITCHES.find((p) => p.display.slug === aSlug) ?? PITCHES[0], [aSlug])
  const b = useMemo(() => PITCHES.find((p) => p.display.slug === bSlug) ?? PITCHES[1], [bSlug])
  const same = a.display.slug === b.display.slug

  const sa = useMemo(() => plot(a, handFactor), [a, handFactor])
  const sb = useMemo(() => plot(b, handFactor), [b, handFactor])

  // Late separation at the plate: euclidean distance between the two sourced
  // break vectors. This is real — both vectors come from the specimen records.
  const sepIn = useMemo(
    () => Math.hypot(sa.hIn - sb.hIn, sa.vIn - sb.vIn),
    [sa, sb],
  )

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
            className="mt-1.5 w-full rounded-sm border border-navy/25 bg-paper px-3 py-2 font-mono text-sm text-ink"
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
            className="mt-1.5 w-full rounded-sm border border-navy/25 bg-paper px-3 py-2 font-mono text-sm text-ink"
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
          <div className="mt-1.5 inline-flex overflow-hidden rounded-sm border border-navy/25">
            {(['RHP', 'LHP'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHand(h)}
                aria-pressed={hand === h}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                  hand === h ? 'bg-navy text-paper' : 'bg-paper text-ink-2 hover:text-seam'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {same ? (
        <p className="rounded-sm border-l-2 border-seam bg-paper-2 px-4 py-3 text-sm text-ink-2">
          Pick two different pitches to see the tunnel and the late separation between them.
        </p>
      ) : null}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Tunnel plot comparing a ${a.display.shortName} and a ${b.display.shortName} from a ${
          hand === 'RHP' ? 'right' : 'left'
        }-handed pitcher. Both share a tunnel window near center and separate to their own break locations, about ${sepIn.toFixed(
          0,
        )} inches apart at the plate. A schematic: the endpoints are sourced break figures, the shared paths illustrate the tunnel.`}
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

            {/* the late-separation gap */}
            <line x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y} stroke="var(--color-seam)" strokeWidth="1.3" strokeDasharray="4 3" />
            <text
              x={(sa.x + sb.x) / 2 + 8}
              y={(sa.y + sb.y) / 2 - 6}
              fill="var(--color-seam)"
              fontFamily="var(--font-mono)"
              fontSize="11"
              fontWeight="600"
            >
              {sepIn.toFixed(0)} in
            </text>

            {/* endpoints */}
            {[sa, sb].map((s, i) => {
              const c = i === 0 ? colorA : colorB
              return (
                <g key={s.entry.display.slug}>
                  <circle cx={s.x} cy={s.y} r="8" fill={c} fillOpacity="0.92" />
                  <circle cx={s.x} cy={s.y} r="8" fill="none" stroke="var(--color-paper)" strokeWidth="1.2" />
                  <text x={s.x} y={s.y + (s.y > CY ? 22 : -14)} fill="var(--color-ink)" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle">
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
        <div className="grid gap-px overflow-hidden rounded-sm border border-navy/15 bg-navy/10 sm:grid-cols-3">
          <div className="bg-paper px-4 py-3">
            <p className="mono-label" style={{ color: colorA }}>{a.display.shortName}</p>
            <p className="mt-1 text-sm text-ink-2">
              {a.motion.ivbInches >= 0 ? '+' : ''}{a.motion.ivbInches}&Prime; vert · {a.motion.horizontalInches}&Prime;{' '}
              {a.motion.horizontalDir === 'none' ? '' : a.motion.horizontalDir}
            </p>
          </div>
          <div className="bg-paper px-4 py-3">
            <p className="mono-label text-seam">Separation at the plate</p>
            <p className="display mt-1 text-2xl text-ink tabular-nums">{sepIn.toFixed(0)} in</p>
          </div>
          <div className="bg-paper px-4 py-3">
            <p className="mono-label" style={{ color: colorB }}>{b.display.shortName}</p>
            <p className="mt-1 text-sm text-ink-2">
              {b.motion.ivbInches >= 0 ? '+' : ''}{b.motion.ivbInches}&Prime; vert · {b.motion.horizontalInches}&Prime;{' '}
              {b.motion.horizontalDir === 'none' ? '' : b.motion.horizontalDir}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Link to={`/pitch/${a.display.slug}`} className="mono-label text-ink-3 transition-colors hover:text-seam">
          {a.display.shortName} specimen →
        </Link>
        <Link to={`/pitch/${b.display.slug}`} className="mono-label text-ink-3 transition-colors hover:text-seam">
          {b.display.shortName} specimen →
        </Link>
        <Link to="/learn/sequencing" className="mono-label text-ink-3 transition-colors hover:text-seam">
          Why tunneling works →
        </Link>
      </div>
    </div>
  )
}
