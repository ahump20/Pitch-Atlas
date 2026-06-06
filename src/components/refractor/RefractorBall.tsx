import { v, seamPoint, SEAM_VIEW_TILT, type Vec3 } from '../../lib/seam'

/*
  The hero artifact: a dramatic leather sphere with the real figure-eight seam,
  a spin-axis vector, a spin-burst halo, and a rim light in the card's accent.
  Ported from the prototype's ballSVG but driven by the shared seam math in
  lib/seam.ts, so the diagram and the 3D model can never disagree. Deterministic
  (no random / no Date) so it prerenders cleanly. The spin-burst animation is
  killed by the global reduced-motion rule. No player, ever — the ball is the
  subject. This is a seam-informed schematic, never a measured cover geometry.
*/

type P = { x: number; y: number; z: number }

function projectSeam(cx: number, cy: number, r: number, seg = 300): P[] {
  const out: P[] = []
  for (let i = 0; i <= seg; i++) {
    const p = v.rotateAxis(seamPoint((i / seg) * Math.PI * 2, 1), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
    out.push({ x: cx + p.x * r, y: cy - p.y * r, z: p.z })
  }
  return out
}
function pathOf(run: P[]) {
  return run.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
}
function splitRuns(points: P[]) {
  const runs: { front: boolean; d: string }[] = []
  let cur: P[] = []
  let cf: boolean | null = null
  for (const p of points) {
    const f = p.z >= 0
    if (cf === null) {
      cf = f
      cur = [p]
    } else if (f === cf) {
      cur.push(p)
    } else {
      cur.push(p)
      runs.push({ front: cf, d: pathOf(cur) })
      cf = f
      cur = [p]
    }
  }
  if (cur.length > 1) runs.push({ front: cf ?? true, d: pathOf(cur) })
  return runs
}
function buildStitches(points: P[], every = 6, len = 9) {
  const out: { x1: number; y1: number; x2: number; y2: number; front: boolean }[] = []
  for (let i = 0; i < points.length - 1; i += every) {
    const a = points[i]
    const b = points[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const L = Math.hypot(dx, dy) || 1
    const nx = -dy / L
    const ny = dx / L
    out.push({ x1: a.x - (nx * len) / 2, y1: a.y - (ny * len) / 2, x2: a.x + (nx * len) / 2, y2: a.y + (ny * len) / 2, front: a.z >= 0 })
  }
  return out
}

export function RefractorBall({
  spinAxis,
  gyro = false,
  accent,
  id,
}: {
  spinAxis: Vec3
  gyro?: boolean
  accent: { c1: string; c2: string; c3: string }
  id: string
}) {
  const W = 300
  const H = 300
  const cx = 150
  const cy = 148
  const r = 104

  const pts = projectSeam(cx, cy, r, 300)
  const runs = splitRuns(pts)
  const st = buildStitches(pts, 6, 10)

  const sa = v.rotateAxis(v.normalize(spinAxis), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
  const k = r * 0.98
  const ex = cx + sa.x * k
  const ey = cy - sa.y * k
  const sx = cx - sa.x * k
  const sy = cy + sa.y * k
  const ang = Math.atan2(ey - cy, ex - cx)

  const rays: { x1: number; y1: number; x2: number; y2: number; w: number; o: number }[] = []
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2
    const r0 = r + 10
    const r1 = r + (i % 4 === 0 ? 42 : i % 2 ? 22 : 14)
    rays.push({
      x1: cx + Math.cos(a) * r0,
      y1: cy + Math.sin(a) * r0,
      x2: cx + Math.cos(a) * r1,
      y2: cy + Math.sin(a) * r1,
      w: i % 4 === 0 ? 2.4 : 1,
      o: i % 4 === 0 ? 0.6 : 0.22,
    })
  }

  const arrow = (tx: number, ty: number, a: number) => {
    const L = 10
    const w = 0.42
    return `M ${tx} ${ty} L ${(tx - L * Math.cos(a - w)).toFixed(1)} ${(ty - L * Math.sin(a - w)).toFixed(1)} M ${tx} ${ty} L ${(tx - L * Math.cos(a + w)).toFixed(1)} ${(ty - L * Math.sin(a + w)).toFixed(1)}`
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Seam specimen and spin axis. The seam is the figure-eight curve the 3D model draws; the dashed vector is the spin axis."
      style={{ position: 'relative', zIndex: 2, display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id={`lea-${id}`} cx="40%" cy="28%" r="82%">
          <stop offset="0%" stopColor="#FFFCF4" />
          <stop offset="40%" stopColor="#F4EEDF" />
          <stop offset="78%" stopColor="#DDCFB4" />
          <stop offset="100%" stopColor="#B8A582" />
        </radialGradient>
        <radialGradient id={`rim-${id}`} cx="70%" cy="76%" r="62%">
          <stop offset="58%" stopColor={accent.c3} stopOpacity="0" />
          <stop offset="90%" stopColor={accent.c3} stopOpacity="0.72" />
          <stop offset="100%" stopColor={accent.c3} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`halo-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent.c3} stopOpacity="0.66" />
          <stop offset="60%" stopColor={accent.c3} stopOpacity="0.14" />
          <stop offset="100%" stopColor={accent.c3} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx={cx} cy={cy + r + 8} rx={r * 0.8} ry={12} fill="#000" opacity="0.45" filter={`url(#glow-${id})`} />
      <circle cx={cx} cy={cy} r={r + 46} fill={`url(#halo-${id})`} />
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'rfx-spin 26s linear infinite' }}>
        {rays.map((ry, i) => (
          <line key={i} x1={ry.x1.toFixed(1)} y1={ry.y1.toFixed(1)} x2={ry.x2.toFixed(1)} y2={ry.y2.toFixed(1)} stroke={accent.c3} strokeWidth={ry.w} strokeLinecap="round" opacity={ry.o} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#lea-${id})`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#rim-${id})`} />
      <circle cx={cx} cy={cy} r={r} fill="#000" opacity="0.12" style={{ mixBlendMode: 'multiply' }} />
      <ellipse cx={cx - 34} cy={cy - 42} rx={42} ry={27} fill="#fff" opacity="0.62" style={{ filter: 'blur(7px)' }} />
      <ellipse cx={cx - 44} cy={cy - 52} rx={13} ry={9} fill="#fff" opacity="0.9" style={{ filter: 'blur(2px)' }} />

      {runs.filter((x) => !x.front).map((x, i) => (
        <path key={`b${i}`} d={x.d} fill="none" stroke="#6f5036" strokeWidth="1.1" strokeDasharray="2 3" opacity="0.5" />
      ))}
      {st.filter((s) => !s.front).map((s, i) => (
        <line key={`sb${i}`} x1={s.x1.toFixed(1)} y1={s.y1.toFixed(1)} x2={s.x2.toFixed(1)} y2={s.y2.toFixed(1)} stroke="#FF3B55" strokeWidth="1.7" strokeLinecap="round" opacity="0.32" />
      ))}
      {runs.filter((x) => x.front).map((x, i) => (
        <path key={`f${i}`} d={x.d} fill="none" stroke="#5a3a23" strokeWidth="1.4" opacity="0.85" />
      ))}
      {st.filter((s) => s.front).map((s, i) => (
        <line key={`sf${i}`} x1={s.x1.toFixed(1)} y1={s.y1.toFixed(1)} x2={s.x2.toFixed(1)} y2={s.y2.toFixed(1)} stroke="#FF2433" strokeWidth="2.3" strokeLinecap="round" filter={`url(#glow-${id})`} />
      ))}

      <line x1={sx.toFixed(1)} y1={sy.toFixed(1)} x2={ex.toFixed(1)} y2={ey.toFixed(1)} stroke="#37D6FF" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.95" filter={`url(#glow-${id})`} />
      <path d={arrow(ex, ey, ang)} stroke="#37D6FF" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={arrow(sx, sy, ang + Math.PI)} stroke="#37D6FF" strokeWidth="2" fill="none" strokeLinecap="round" />
      {gyro ? (
        <>
          <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r="9" fill="#FF2433" filter={`url(#glow-${id})`} />
          <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r="9" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.9" />
        </>
      ) : null}
    </svg>
  )
}
