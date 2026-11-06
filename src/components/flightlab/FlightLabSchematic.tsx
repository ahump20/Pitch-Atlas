import { useEffect, useRef, useState } from 'react'
import { BALL_RADIUS, IN, MAT, PLATE, positionAt, progressAt, type Flight } from '../../lib/slowpitch'
import { useElementSize } from './useElementSize'
import { nearPlateTimeScale, round, sideSpinGlyph, SLOW_RATE, type LabModel, type ThrowRequest } from './model'

/*
  The Flight Lab, drawn flat: a side view of the zone, the batter's landmarks,
  an inch ruler, the selected lob's fall, where it crosses the plate, where the
  barrel meets it, and the landing window to look for. Every coordinate comes
  from the same `src/lib/slowpitch` functions the 3D scene and the page text
  read, so the drawing cannot disagree with them.

  It is the page for a browser without WebGL and the stage while the 3D scene
  loads. It lays itself out in real pixels (measured), so its text stays at 12px
  and the ruler's numbers at 14px at any width.

  Orientation matches the Zone camera: the pitcher is to the right, the catcher
  to the left, height is up.
*/

const AMBER = '#FFC23C'
const BONE = '#F6F1E6'
const BONE_DIM = 'rgba(246,241,230,0.55)'
const PANEL = 'rgba(7,5,9,0.82)'
/** Martian Mono's advance, as a fraction of the font size (for tag widths). */
const MONO_ADVANCE = 0.8

function tagWidth(text: string, size = 12) {
  return text.length * size * MONO_ADVANCE + 14
}

function Tag({
  x,
  y,
  text,
  anchor = 'start',
  color = BONE,
  size = 12,
}: {
  x: number
  y: number
  text: string
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
}) {
  const w = tagWidth(text, size)
  const left = anchor === 'start' ? x : anchor === 'middle' ? x - w / 2 : x - w
  return (
    <g>
      <rect x={left} y={y - size * 0.95} width={w} height={size * 1.9} rx={2} fill={PANEL} stroke={color} strokeOpacity={0.35} />
      <text
        x={left + 7}
        y={y}
        dominantBaseline="central"
        fill={color}
        fontFamily="var(--font-mono)"
        fontSize={size}
        letterSpacing="0.04em"
      >
        {text.toUpperCase()}
      </text>
    </g>
  )
}

/** The ball turning, as the side view sees it: the ring it spins in and a bead riding it. */
function SpinBall({ flight, t, cx, cy, r, color }: { flight: Flight; t: number; cx: number; cy: number; r: number; color: string }) {
  const { ring, bead } = sideSpinGlyph(flight, t)
  const k = r * 1.42
  // z runs toward the catcher, which is screen left
  const ringPts = ring.map(([z, y]) => `${(cx - z * k).toFixed(1)},${(cy - y * k).toFixed(1)}`).join(' ')
  const front = bead[2] >= 0
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#E8EE6A" stroke="#1a1a0a" strokeOpacity={0.4} />
      <polyline points={ringPts} fill="none" stroke={color} strokeWidth={Math.max(1.25, r * 0.12)} strokeOpacity={0.85} />
      <line
        x1={cx + bead[0] * r}
        y1={cy + bead[1] * r}
        x2={cx - bead[0] * r}
        y2={cy - bead[1] * r}
        stroke="#c62d28"
        strokeWidth={Math.max(1.5, r * 0.18)}
        strokeLinecap="round"
      />
      <circle cx={cx - bead[0] * k} cy={cy - bead[1] * k} r={Math.max(2, r * 0.2)} fill={color} fillOpacity={front ? 1 : 0.35} />
    </g>
  )
}

/** Throw the requested lobs along the drawing: elapsed flight time, or null when idle. */
function useSchematicThrow(
  model: LabModel,
  request: ThrowRequest | undefined,
  slow: boolean,
  reduced: boolean,
  onPlaying?: (playing: boolean) => void,
) {
  const [state, setState] = useState<{ id: number; t: number; indices: number[] } | null>(null)
  const lobsRef = useRef(model.lobs)
  const slowRef = useRef(slow)
  const playingRef = useRef(onPlaying)
  useEffect(() => {
    lobsRef.current = model.lobs
    slowRef.current = slow
    playingRef.current = onPlaying
  })

  useEffect(() => {
    if (!request || request.id === 0) return
    const lobs = lobsRef.current
    const flights = request.indices.map((i) => lobs[i]?.flight).filter((f): f is Flight => Boolean(f))
    if (flights.length === 0) return
    const end = Math.max(...flights.map((f) => f.duration))
    if (reduced) {
      // No animation: the throw lands at once.
      const id = requestAnimationFrame(() => setState({ id: request.id, t: end, indices: request.indices }))
      return () => cancelAnimationFrame(id)
    }
    playingRef.current?.(true)
    let t = 0
    let last = performance.now()
    let raf = 0
    const lead = flights[0]
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const z = positionAt(lead, Math.min(t, lead.duration))[2]
      t += dt * (slowRef.current ? SLOW_RATE : 1) * nearPlateTimeScale(z)
      setState({ id: request.id, t: Math.min(t, end), indices: request.indices })
      if (t < end) raf = requestAnimationFrame(tick)
      else playingRef.current?.(false)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      playingRef.current?.(false)
    }
  }, [request, reduced])

  // A changed pitch or batter clears the old throw.
  const stale = !state || !request || state.id !== request.id
  return stale ? null : state
}

export function FlightLabSchematic({
  model,
  throwRequest,
  slow = false,
  reduced = false,
  onPlaying,
  insetTop = 0,
  insetBottom = 0,
  className = '',
}: {
  model: LabModel
  /** When set, Throw animates the ball along the drawing (the no-WebGL page). */
  throwRequest?: ThrowRequest
  slow?: boolean
  reduced?: boolean
  onPlaying?: (playing: boolean) => void
  /** Room to leave for the page's own overlays, px. */
  insetTop?: number
  insetBottom?: number
  className?: string
}) {
  const { ref, size } = useElementSize<HTMLDivElement>({ width: 820, height: 560 })
  const thrown = useSchematicThrow(model, throwRequest, slow, reduced, onPlaying)
  const W = size.width
  const H = size.height
  const narrow = W < 560

  const { selected, zone, marks, rule } = model
  const flight = selected.flight
  const reading = selected.reading
  const senior = rule === 'senior'
  const contact = reading.contact.contact
  const R = BALL_RADIUS

  // The window of the field to draw, metres: depth z (catcher to the left) and height.
  const zNear = Math.min(2.4, Math.max(PLATE.back + 0.55, (model.hotZ?.[1] ?? 0) + 0.2, senior ? MAT.length + 0.3 : 0))
  const zFar = Math.min(-1.25, (contact?.z ?? -0.8) - 0.45, (model.hotZ?.[0] ?? 0) - 0.25)
  const yTop = Math.max(zone.top + 0.3, (contact?.y ?? 0) + 0.22)

  const rulerW = 52
  const padL = rulerW + 4
  const padR = 18
  const padT = insetTop + 18
  const padB = insetBottom + 66
  const s = Math.max(
    10,
    Math.min((W - padL - padR) / (zNear - zFar), (H - padT - padB) / yTop),
  )
  const plotW = (zNear - zFar) * s
  // centre the plot in the room right of the ruler, and vertically in the room left
  const x0 = padL + Math.max(0, (W - padL - padR - plotW) / 2)
  const spare = Math.max(0, H - padT - padB - yTop * s)
  const groundY = H - padB - spare / 2
  const X = (z: number) => x0 + (zNear - z) * s
  const Y = (y: number) => groundY - y * s
  const xMin = X(zNear)
  const xMax = X(zFar)

  // The lob, clipped to the window.
  const pts: string[] = []
  const p = flight.positions
  for (let i = 0; i < flight.count; i++) {
    const z = p[i * 3 + 2]
    if (z < zFar - 2 || z > zNear + 0.5) continue
    pts.push(`${X(z).toFixed(1)},${Y(p[i * 3 + 1]).toFixed(1)}`)
  }

  // The same throw with no spin, where this pitch's spin bent it from.
  const ghostPts: string[] = []
  if (model.pitch.key !== 'lob') {
    const g = flight.ghost
    for (let i = 0; i < g.length / 3; i += 2) {
      const z = g[i * 3 + 2]
      if (z < zFar - 2 || z > zNear + 0.5) continue
      ghostPts.push(`${X(z).toFixed(1)},${Y(g[i * 3 + 1]).toFixed(1)}`)
    }
  }

  const tagX = x0 + 6
  const landmarkTags: { y: number; text: string; color: string }[] = [
    ...(senior ? [] : [{ y: zone.top, text: narrow ? `Shoulder ${round(zone.top / IN)}` : `Shoulder · ${round(zone.top / IN)} in`, color: BONE }]),
    { y: marks.chest, text: narrow ? `Chest ${round(marks.chest / IN)}` : `Chest · ${round(marks.chest / IN)} in`, color: AMBER },
    { y: marks.belt, text: narrow ? `Belt ${round(marks.belt / IN)}` : `Belt · ${round(marks.belt / IN)} in`, color: AMBER },
    ...(senior ? [] : [{ y: zone.bottom, text: narrow ? `Knee ${round(zone.bottom / IN)}` : `Front knee · ${round(zone.bottom / IN)} in`, color: BONE }]),
  ]

  const crossing = flight.land.z > 0 ? flight.crossing : null
  const crossingText = crossing ? (narrow ? `Plate ${round(crossing.y / IN)}` : `Over the plate · ${round(crossing.y / IN)} in`) : ''
  const barrel = reading.barrel
  const barrelText = barrel
    ? narrow
      ? `Barrel ${round(barrel.heightIn)} in`
      : `Barrel · ${round(barrel.heightIn)} in high · ${round(barrel.outFrontIn)} in out front`
    : ''

  // Ruler: every inch, long ticks at 6.
  const rulerTop = Math.min(yTop, zone.top + 0.12)
  const ticks: { y: number; len: number; label?: string }[] = []
  for (let inch = 0; inch * IN <= rulerTop + 1e-6; inch++) {
    ticks.push({
      y: Y(inch * IN),
      len: inch % 6 === 0 ? 16 : inch % 3 === 0 ? 10 : 5,
      label: inch % 6 === 0 && inch > 0 ? String(inch) : undefined,
    })
  }

  const hot = reading.lookFor.hot
  const lane = model.laneZ
  const strike = reading.strikeWindowIn

  // Thrown balls and their trails.
  const thrownBalls = thrown
    ? thrown.indices
        .map((i) => model.lobs[i])
        .filter(Boolean)
        .map((lob) => {
          const at = positionAt(lob.flight, Math.min(thrown.t, lob.flight.duration))
          const prog = progressAt(lob.flight, Math.min(thrown.t, lob.flight.duration))
          const n = Math.max(2, Math.floor(prog * (lob.flight.count - 1)))
          const trail: string[] = []
          for (let i = 0; i <= n; i++) {
            const z = lob.flight.positions[i * 3 + 2]
            if (z < zFar - 2 || z > zNear + 0.5) continue
            trail.push(`${X(z).toFixed(1)},${Y(lob.flight.positions[i * 3 + 1]).toFixed(1)}`)
          }
          return { key: lob.key, color: lob.color, flight: lob.flight, t: Math.min(thrown.t, lob.flight.duration), x: X(at[2]), y: Y(at[1]), trail: trail.join(' ') }
        })
    : []

  const label = `Side view of the strike zone for a ${Math.floor(model.stance.heightIn / 12)} ft ${model.stance.heightIn % 12} in batter: the ${selected.name.toLowerCase()} falls through it${
    crossing ? `, ${round(crossing.y / IN)} in high over the plate` : ''
  }${barrel ? `, and the barrel meets it ${round(barrel.heightIn)} in high, ${round(barrel.outFrontIn)} in out front` : ''}.`

  const clipId = `fl-clip-${selected.key}`

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden ${className}`} data-flight-schematic="true">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-full w-full">
        <defs>
          <clipPath id={clipId}>
            <rect x={xMin} y={0} width={Math.max(0, xMax - xMin)} height={Math.max(0, groundY + 2)} />
          </clipPath>
          <pattern id="fl-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="rgba(246,241,230,0.10)" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(246,241,230,0.55)" strokeWidth="2" />
          </pattern>
          <linearGradient id="fl-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1d12" />
            <stop offset="1" stopColor="#120d09" />
          </linearGradient>
        </defs>

        {/* ground */}
        <rect x={0} y={groundY} width={W} height={Math.max(0, H - groundY)} fill="url(#fl-ground)" />
        <line x1={0} x2={W} y1={groundY} y2={groundY} stroke="rgba(246,241,230,0.25)" />

        {/* landmark lines across the view */}
        {!senior ? (
          <>
            <line x1={xMin} x2={xMax} y1={Y(zone.top)} y2={Y(zone.top)} stroke={BONE} strokeOpacity={0.45} />
            <line x1={xMin} x2={xMax} y1={Y(zone.bottom)} y2={Y(zone.bottom)} stroke={BONE} strokeOpacity={0.45} />
          </>
        ) : null}
        <line x1={xMin} x2={xMax} y1={Y(marks.chest)} y2={Y(marks.chest)} stroke={AMBER} strokeOpacity={0.5} />
        <line x1={xMin} x2={xMax} y1={Y(marks.belt)} y2={Y(marks.belt)} stroke={AMBER} strokeOpacity={0.5} />

        {/* the zone over the plate, and the ball's-edge margin */}
        {!senior ? (
          <>
            <rect
              x={X(PLATE.back)}
              y={Y(zone.top)}
              width={(PLATE.back - PLATE.front) * s}
              height={(zone.top - zone.bottom) * s}
              fill="rgba(246,241,230,0.09)"
              stroke={BONE}
              strokeOpacity={0.7}
            />
            <rect
              x={X(PLATE.back + R)}
              y={Y(zone.top + R)}
              width={(PLATE.back - PLATE.front + 2 * R) * s}
              height={(zone.top - zone.bottom + 2 * R) * s}
              fill="none"
              stroke={BONE}
              strokeOpacity={0.6}
              strokeDasharray="5 4"
            />
          </>
        ) : null}

        {/* the barrel's sweet band, belt to chest, where it meets the ball */}
        {contact ? (
          <rect
            x={X(contact.z) - 4}
            y={Y(marks.chest)}
            width={8}
            height={(marks.chest - marks.belt) * s}
            fill={AMBER}
            fillOpacity={0.28}
            stroke={AMBER}
            strokeOpacity={0.8}
          />
        ) : null}

        {/* plate and mat on the ground */}
        {senior ? (
          <rect x={X(MAT.length)} y={groundY - 3} width={MAT.length * s} height={4} fill="#3E6B4C" />
        ) : null}
        <rect x={X(PLATE.back)} y={groundY - 3} width={(PLATE.back - PLATE.front) * s} height={4} fill={BONE} />

        {/* the strike lane and the look-for window, on the ground */}
        {lane ? (
          <rect
            x={Math.max(xMin, X(lane[1]))}
            y={groundY + 8}
            width={Math.max(2, Math.min(xMax, X(lane[0])) - Math.max(xMin, X(lane[1])))}
            height={7}
            fill="url(#fl-hatch)"
          />
        ) : null}
        {model.hotZ ? (
          <rect
            x={Math.max(xMin, X(model.hotZ[1]))}
            y={groundY + 18}
            width={Math.max(2, Math.min(xMax, X(model.hotZ[0])) - Math.max(xMin, X(model.hotZ[1])))}
            height={7}
            fill={AMBER}
            fillOpacity={0.75}
          />
        ) : null}

        {/* the lob, and the same throw with no spin */}
        <g clipPath={`url(#${clipId})`}>
          {ghostPts.length > 1 ? (
            <polyline
              points={ghostPts.join(' ')}
              fill="none"
              stroke={model.pitch.color}
              strokeOpacity={0.7}
              strokeWidth={2}
              strokeDasharray="6 5"
              data-flight-ghost="true"
            />
          ) : null}
          <polyline
            points={pts.join(' ')}
            fill="none"
            stroke={selected.color}
            strokeOpacity={thrownBalls.length ? 0.3 : 0.95}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {thrownBalls.map((b) => (
            <g key={b.key}>
              <polyline points={b.trail} fill="none" stroke={b.color} strokeWidth={3.5} strokeLinecap="round" />
              <SpinBall flight={b.flight} t={b.t} cx={b.x} cy={b.y} r={Math.max(6, R * s)} color={model.pitch.color} />
            </g>
          ))}
        </g>

        {/* marks: over the plate, and the barrel */}
        {crossing ? (
          <circle cx={X(0)} cy={Y(crossing.y)} r={9} fill="none" stroke={BONE} strokeWidth={2} />
        ) : null}
        {contact ? (
          <g>
            <circle cx={X(contact.z)} cy={Y(contact.y)} r={13} fill="none" stroke={AMBER} strokeWidth={3} />
            <circle cx={X(contact.z)} cy={Y(contact.y)} r={3.5} fill={AMBER} />
          </g>
        ) : null}

        {/* the pitch's spin, big enough to read */}
        <g data-flight-spin-dial={model.pitch.key}>
          <SpinBall
            flight={flight}
            t={thrownBalls.find((b) => b.key === selected.key)?.t ?? 0}
            cx={W - padR - 30}
            cy={padT + 34}
            r={22}
            color={model.pitch.color}
          />
        </g>

        {/* ruler */}
        <g>
          <rect x={0} y={Y(rulerTop) - 6} width={rulerW} height={Math.max(0, groundY - Y(rulerTop) + 6)} fill="rgba(7,5,9,0.55)" />
          <line x1={rulerW} x2={rulerW} y1={Y(rulerTop)} y2={groundY} stroke={BONE} strokeOpacity={0.9} strokeWidth={1.5} />
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={rulerW - t.len} x2={rulerW} y1={t.y} y2={t.y} stroke={BONE} strokeOpacity={0.85} strokeWidth={t.len >= 16 ? 1.5 : 1} />
              {t.label ? (
                <text
                  x={rulerW - 20}
                  y={t.y}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill={BONE}
                  fontFamily="var(--font-mono)"
                  fontSize={14}
                >
                  {t.label}
                </text>
              ) : null}
            </g>
          ))}
        </g>

        {/* tags */}
        {landmarkTags.map((t) => (
          <Tag key={t.text} x={tagX} y={Y(t.y)} text={t.text} color={t.color} />
        ))}
        {crossing ? (
          <Tag
            x={Math.min(X(0) + 16, W - tagWidth(crossingText) - 6)}
            y={Math.min(Y(crossing.y) + 22, groundY - 14)}
            text={crossingText}
          />
        ) : null}
        {contact && barrelText ? (
          <Tag
            x={Math.min(W - 6 - tagWidth(barrelText) / 2, Math.max(x0 + 6 + tagWidth(barrelText) / 2, X(contact.z)))}
            y={Math.max(padT + 8, Y(contact.y) - 32)}
            text={barrelText}
            anchor="middle"
            color={AMBER}
          />
        ) : null}
        {lane ? (
          <text x={x0 + 6} y={groundY + 34} fill={BONE_DIM} fontFamily="var(--font-mono)" fontSize={12} dominantBaseline="hanging">
            {`STRIKE · ${round(strike[0])}–${round(strike[1])} IN`}
          </text>
        ) : null}
        {hot ? (
          <text x={x0 + 6} y={groundY + (lane ? 50 : 34)} fill={AMBER} fontFamily="var(--font-mono)" fontSize={12} dominantBaseline="hanging">
            {`YOUR PITCH · ${round(hot[0])}–${round(hot[1])} IN`}
          </text>
        ) : null}
      </svg>
    </div>
  )
}
