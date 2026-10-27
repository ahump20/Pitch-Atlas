import type { Handedness, PitchAtlasEntry } from '../../data/types'
import { AXIS, CLAMP, CX, CY, H, plot, RELEASE_Y, TUNNEL_Y, W, type Spot } from '../../lib/flightPath'
import { accentForSlug } from '../refractor/accents'

/*
  The flight figure, drawn as the pitcher sees it from the mound: the release at the
  top, the plate below, the pitcher's arm side on the right for a right-hander. One
  pitch draws its own path; two share one release and one early leg (the tunnel)
  before each splits toward its own side.

  Honesty line: each endpoint sits in the DIRECTION that pitch breaks — the sourced
  verticalShape / horizontalDir on its specimen record, never a magnitude. The SIDE a
  path bends toward comes from those same words; the authored spin vector supplies
  only how late it leaves the shared line (magnusStrength), a near-pure gyro holding
  it longest. The vector's own sideways sign is not trusted for a side: it disagrees
  with horizontalDir on most of the filed set. Handedness is a mirror, not new data.
  Direction and character, never a trajectory or a number.
*/

/** From the release down the spinless line, breaking late toward the endpoint. */
function pathFor(s: Spot): string {
  return `M ${CX} ${RELEASE_Y} C ${s.c1x} ${s.c1y} ${s.c2x} ${s.c2y} ${s.x} ${s.y}`
}

const INK = 'var(--color-bone-2)'
const RULE = 'var(--color-bone-3)'
const HALO = '#0b0a09'
const label = { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.5, fill: INK } as const

export function TunnelPlot({ a, b, hand }: { a: PitchAtlasEntry; b?: PitchAtlasEntry; hand: Handedness }) {
  const handFactor = hand === 'right' ? 1 : -1
  // nudge a pair apart when both break the same way, so both read
  const sameCell = !!b && a.motion.verticalShape === b.motion.verticalShape && a.motion.horizontalDir === b.motion.horizontalDir
  const spots = [plot(a, handFactor, sameCell ? -26 : 0), ...(b ? [plot(b, handFactor, sameCell ? 26 : 0)] : [])]
  const rightPole = hand === 'right' ? 'ARM SIDE →' : 'GLOVE SIDE →'
  const leftPole = hand === 'right' ? '← GLOVE SIDE' : '← ARM SIDE'
  const names = spots.map((s) => s.entry.display.shortName).join(' and ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Illustrative flight of the ${names}, drawn from the mound for a ${hand}-handed pitcher: ${spots
        .map((s) => `${s.entry.display.shortName} ${shapeWords(s.entry)}`)
        .join('; ')}. Direction only, not a measured path.`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* axis guides. Every name sits under its endpoint, away from the path that
          arrives from above; the sides go to the bottom corners, where no path or
          name reaches, so no two words ever land on each other. */}
      <line x1={CX} y1={CY - AXIS} x2={CX} y2={CY + AXIS} stroke={RULE} strokeOpacity="0.5" strokeWidth="1" />
      <line x1={CX - CLAMP - 16} y1={CY} x2={CX + CLAMP + 16} y2={CY} stroke={RULE} strokeOpacity="0.5" strokeWidth="1" />
      <text {...label} x={CX + 8} y={CY - AXIS + 9}>RIDE</text>
      <text {...label} x={CX + 8} y={CY + AXIS - 2}>DROP</text>
      <text {...label} x={6} y={H - 8}>{leftPole}</text>
      <text {...label} x={W - 6} y={H - 8} textAnchor="end">{rightPole}</text>

      {/* a spinless ball's path ends here */}
      <circle cx={CX} cy={CY} r="6" fill="none" stroke={INK} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

      {/* the early leg: one line for one pitch, the shared tunnel for two */}
      <line x1={CX} y1={RELEASE_Y} x2={CX} y2={TUNNEL_Y} stroke={INK} strokeOpacity="0.35" strokeWidth={b ? 9 : 3} strokeLinecap="round" />
      <circle cx={CX} cy={RELEASE_Y} r="5.5" fill={INK} />
      <text {...label} fontSize="10" letterSpacing="1.2" x={CX + 12} y={RELEASE_Y + 4}>RELEASE · MOUND</text>
      {b ? (
        <>
          <circle cx={CX} cy={TUNNEL_Y} r="12" fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="3 3" />
          <text {...label} fontSize="10" letterSpacing="1.2" x={CX + 18} y={TUNNEL_Y + 4}>TUNNEL</text>
        </>
      ) : null}

      {spots.map((s, i) => {
        const color = accentForSlug(s.entry.display.slug).c3
        return (
          <g key={s.entry.display.slug} data-flight={s.entry.display.slug}>
            {/* B is dashed, so the pair still reads apart where two accents run close */}
            <path d={pathFor(s)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={i === 1 ? '7 5' : undefined} />
            <circle cx={s.x} cy={s.y} r="8" fill={color} />
            <circle cx={s.x} cy={s.y} r="8" fill="none" stroke={HALO} strokeWidth="1.2" />
            <text
              x={s.x}
              // a pair sharing one endpoint stacks its names instead of overlapping them
              y={s.y + 23 + (i === 1 && sameCell ? 16 : 0)}
              fill="var(--color-bone)"
              stroke={HALO}
              strokeWidth="5"
              paintOrder="stroke"
              fontFamily="var(--font-mono)"
              fontSize="12"
              textAnchor="middle"
            >
              {b ? `${i === 0 ? 'A' : 'B'} · ` : ''}
              {s.entry.display.shortName}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** The direction words the figure draws, for its accessible name. */
function shapeWords(entry: PitchAtlasEntry): string {
  const m = entry.motion
  if (m.indeterminateBreak) return 'with no fixed direction'
  const v = m.verticalShape === 'ride' ? 'riding' : m.verticalShape === 'drop' ? 'dropping' : 'holding flat'
  const h = m.horizontalDir === 'arm-side' ? ' toward the arm side' : m.horizontalDir === 'glove-side' ? ' toward the glove side' : ''
  return v + h
}
