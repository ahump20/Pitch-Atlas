import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PITCHES } from '../../data/pitches'
import type { PitchAtlasEntry, PitchFamily } from '../../data/types'
import { magnusForceRender, magnusStrength } from '../../lib/physics'

/*
  The tunnel plot. Two pitches, one release window. Tunneling is the deception of
  shared early flight: from the same arm slot and release point, two pitches look
  identical until the hitter has to commit, then they separate late. This view
  shows that on one catcher's-eye frame — both pitches leave a shared release at
  the top, run together through a tunnel window, and only after that window split
  toward their own sourced break directions.

  Honesty line: each endpoint sits in the DIRECTION that pitch breaks — the sourced
  verticalShape / horizontalDir read from its specimen record, no measured magnitude.
  The bow of each path and HOW LATE it splits are derived from the pitch's authored
  Magnus force (magnusForceRender) and its transverse fraction (magnusStrength): a
  near-pure gyro holds the line and splits last, a full-Magnus pitch curves and
  commits earlier. The tunnel window and the connecting flight paths remain an
  explicit schematic of the shared-release idea — direction and character, never a
  trajectory or a number. Handedness is a mirror, not new data: the toggle flips
  which physical side "arm-side" lands on and relabels the poles.
*/

const W = 520
const H = 470
const CX = W / 2
const CY = H / 2 + 18
const COL = 130 // horizontal direction offset
const ROW = 118 // vertical direction offset
const CLAMP = 178
// the shared release sits at the top of the frame: one point both pitches leave from.
const RELEASE_Y = CY - CLAMP - 6
// the tunnel window sits where two well-tunneled pitches still look like one pitch:
// below the release, above center, on the line every path shares before it splits.
const TUNNEL_Y = CY - 150

const FAMILY_META: Record<PitchFamily, { label: string; color: string }> = {
  fastball: { label: 'Fastball', color: '#37D6FF' },
  breaking: { label: 'Breaking', color: '#8A6BFF' },
  offspeed: { label: 'Offspeed', color: '#7CFF52' },
}

interface Spot {
  entry: PitchAtlasEntry
  /** endpoint, in the sourced break direction. */
  x: number
  y: number
  /** the control point of the late-splitting path (where it bows away from the shared line). */
  ctrlX: number
  ctrlY: number
  /** transverse Magnus fraction, 0..1 — how committed the curve is. No magnitude leaks. */
  strength: number
}

function shapeWords(entry: PitchAtlasEntry): string {
  const m = entry.motion
  const v = m.verticalShape === 'ride' ? 'rides' : m.verticalShape === 'drop' ? 'drops' : 'holds flat'
  const h =
    m.horizontalDir === 'arm-side' ? 'runs arm-side' : m.horizontalDir === 'glove-side' ? 'sweeps glove-side' : 'stays true'
  return `${v}, ${h}`
}

/*
  Build one pitch's late-splitting path geometry.

  Endpoint: the sourced shape bucket (verticalShape / horizontalDir), mirrored for
  handedness — exactly the honest direction the old plot used.

  Curvature: read the pitch's authored Magnus force in render space. magnusForceRender
  returns the unit direction the force pushes (+x camera-right, +y up); magnusStrength
  returns the transverse fraction (1 = all Magnus like a four-seam, ~0.1 = nearly all
  gyro like a knuckler). A high-strength pitch commits to its bow earlier and splits
  sooner from the shared line; a gyro holds the tunnel longer and splits late and short.
  The control point that shapes the Bezier is pulled off the straight shared line in the
  Magnus direction, by an amount that scales with strength — so the path's bend reads the
  real physics character without ever drawing a measured break.
*/
function plot(entry: PitchAtlasEntry, handFactor: number, nudge: number): Spot {
  const m = entry.motion
  const hSign = m.horizontalDir === 'arm-side' ? 1 : m.horizontalDir === 'glove-side' ? -1 : 0
  const endX = Math.max(CX - CLAMP, Math.min(CX + CLAMP, CX + hSign * handFactor * COL + nudge))
  const endY = CY + (m.verticalShape === 'ride' ? -ROW : m.verticalShape === 'drop' ? ROW : 0)

  // Magnus character: direction the force bows the path, and how committed that bow is.
  const force = magnusForceRender(m.spinAxis)
  const strength = Math.max(0, Math.min(1, magnusStrength(m.spinAxis)))

  // The straight shared line runs release -> endpoint. The split begins below the
  // tunnel window: a strong-Magnus pitch leaves the line sooner (split fraction nearer
  // the window), a gyro stays on it longer (split nearer the endpoint).
  const splitT = 0.52 + (1 - strength) * 0.26 // 0.52 (full Magnus) .. ~0.78 (pure gyro)
  const baseX = CX + (endX - CX) * splitT
  const baseY = TUNNEL_Y + (endY - TUNNEL_Y) * splitT

  // Bow the control point off that base point in the Magnus direction. Render +y is up,
  // so flip it into SVG's down-positive y. Mirror horizontal for handedness. The bow
  // length scales with strength only — a schematic emphasis, not a measured inch.
  const bow = 26 + strength * 30
  const ctrlX = baseX + force.x * handFactor * bow
  const ctrlY = baseY - force.y * bow

  return { entry, x: endX, y: endY, ctrlX, ctrlY, strength }
}

/** The shared-then-splitting path: straight down the tunnel from release through the
    window, then a quadratic bow to the endpoint whose control point carries the Magnus
    character. The first leg is identical for both pitches — that is the tunnel. */
function pathFor(s: Spot): string {
  return `M ${CX} ${RELEASE_Y} L ${CX} ${TUNNEL_Y} Q ${s.ctrlX} ${s.ctrlY} ${s.x} ${s.y}`
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

  const pathA = pathFor(sa)
  const pathB = pathFor(sb)

  return (
    <div className="flex flex-col gap-6">
      {/* scoped keyframes: a ball runs each path on hover only. Reduced motion stops it.
          The animation never gates the paths' visibility — the SVG renders fully without it,
          so the headless prerender shows complete paths and endpoints. */}
      <style>{`
        .tunnel-runner { opacity: 0; }
        @media (hover: hover) {
          .tunnel-stage:hover .tunnel-runner { opacity: 1; animation: tunnel-travel 1.5s ease-in both; }
        }
        @keyframes tunnel-travel {
          from { offset-distance: 0%; }
          to { offset-distance: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tunnel-stage:hover .tunnel-runner { opacity: 0; animation: none; }
        }
      `}</style>

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
          <span className="mono-label block text-ink-3">Handedness</span>
          <div className="mt-1.5 inline-flex overflow-hidden rounded-lg border border-ink/25">
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
        className="tunnel-stage w-full"
        role="img"
        aria-label={`Tunnel plot comparing a ${a.display.shortName} and a ${b.display.shortName} from a ${
          hand === 'RHP' ? 'right' : 'left'
        }-handed pitcher. Both leave a shared release at the top and run together through a tunnel window, then split late toward how each one breaks: the ${a.display.shortName} ${shapeWords(a)}, the ${b.display.shortName} ${shapeWords(b)}. A schematic of direction and character, not a measured trajectory.`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* a soft depth gradient down the shared tunnel, so the early flight reads as
              coming toward the plate before the late split. Presentation only. */}
          <linearGradient id="tunnel-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink-2)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-ink-3)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

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
            {/* the shared tunnel corridor: release at the top, down through the window,
                drawn once because every path shares this leg. This IS the deception. */}
            <line
              x1={CX}
              y1={RELEASE_Y}
              x2={CX}
              y2={TUNNEL_Y}
              stroke="url(#tunnel-depth)"
              strokeWidth="9"
              strokeLinecap="round"
            />

            {/* shared release point */}
            <circle cx={CX} cy={RELEASE_Y} r="5.5" fill="var(--color-ink-2)" />
            <circle cx={CX} cy={RELEASE_Y} r="9" fill="none" stroke="var(--color-ink-2)" strokeWidth="1" opacity="0.5" />
            <text x={CX + 14} y={RELEASE_Y - 2} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5" textAnchor="start">
              RELEASE
            </text>

            {/* the tunnel window: where they still look like one pitch */}
            <circle cx={CX} cy={TUNNEL_Y} r="13" fill="none" stroke="var(--color-ink-2)" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={CX + 22} y={TUNNEL_Y + 3} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5" textAnchor="start">
              TUNNEL
            </text>

            {/* the two flight paths: identical down the corridor, splitting late toward
                each pitch's sourced break, bowed by its Magnus character. */}
            <path d={pathA} fill="none" stroke={colorA} strokeWidth="2" opacity="0.75" strokeLinecap="round" />
            <path d={pathB} fill="none" stroke={colorB} strokeWidth="2" opacity="0.75" strokeLinecap="round" />

            {/* a ball running each path, hover-only and reduced-motion-safe. offset-path
                follows the exact path string; the static paths above never depend on it. */}
            <circle className="tunnel-runner" r="4.5" fill={colorA} style={{ offsetPath: `path('${pathA}')` } as CSSProperties} aria-hidden="true" />
            <circle className="tunnel-runner" r="4.5" fill={colorB} style={{ offsetPath: `path('${pathB}')` } as CSSProperties} aria-hidden="true" />

            {/* the late split: the gap the hitter must cover after committing */}
            <line x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y} stroke="var(--color-seam)" strokeWidth="1.3" strokeDasharray="4 3" />
            <text
              x={(sa.x + sb.x) / 2 + 8}
              y={(sa.y + sb.y) / 2 - 6}
              fill="var(--color-seam)"
              stroke="var(--color-paper)"
              strokeWidth="5"
              paintOrder="stroke"
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
                  <text x={s.x} y={s.y + (s.y > CY ? 22 : -14)} fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth="5" paintOrder="stroke" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle">
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
        <div className="grid gap-px overflow-hidden rounded-sm border border-ink/15 bg-ink/15 sm:grid-cols-3">
          <div className="bg-paper-2 px-4 py-3">
            <p className="mono-label inline-flex items-center gap-2 text-ink">
              <i className="inline-block h-2 w-2 rounded-full" style={{ background: colorA }} aria-hidden="true" />
              {a.display.shortName}
            </p>
            <p className="mt-1 text-sm capitalize text-ink-2">{shapeWords(a)}</p>
          </div>
          <div className="bg-paper-2 px-4 py-3">
            <p className="mono-label text-seam">The late split</p>
            <p className="mt-1 text-sm text-ink-2">Same release and tunnel, then each breaks its own way late.</p>
          </div>
          <div className="bg-paper-2 px-4 py-3">
            <p className="mono-label inline-flex items-center gap-2 text-ink">
              <i className="inline-block h-2 w-2 rounded-full" style={{ background: colorB }} aria-hidden="true" />
              {b.display.shortName}
            </p>
            <p className="mt-1 text-sm capitalize text-ink-2">{shapeWords(b)}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Link to={`/pitch/${a.display.slug}`} className="mono-label text-seam transition-colors hover:text-ink">
          {a.display.shortName} specimen →
        </Link>
        <Link to={`/pitch/${b.display.slug}`} className="mono-label text-seam transition-colors hover:text-ink">
          {b.display.shortName} specimen →
        </Link>
        <Link to="/learn/sequencing" className="mono-label text-seam transition-colors hover:text-ink">
          Why tunneling works →
        </Link>
      </div>
    </div>
  )
}
