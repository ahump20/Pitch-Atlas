import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { FirstFrame } from '../../ball/three/FirstFrame'
import { canvasEvents } from '../../ball/three/canvasEvents'
import {
  BALL_RADIUS,
  IN,
  MAT,
  PITCHERS_PLATE_Z,
  PLATE,
  PLATE_POLYGON,
  RELEASE,
  distanceToPlate,
  positionAt,
  progressAt,
  stanceSpot,
  type Flight,
} from '../../../lib/slowpitch'
import {
  SLOW_RATE,
  SPIN_VIEW_RATE,
  fixed,
  nearPlateTimeScale,
  round,
  type CameraView,
  type LabModel,
  type ThrowRequest,
} from '../model'

/*
  The Flight Lab in 3D: a night field, the plate and boxes, a faceless mannequin
  at the measured batter's proportions, the zone slab, the lobs, the barrel's
  sweet band, the catcher's heat grid and the reach arcs. Every position is read
  from the lab model, which reads `src/lib/slowpitch`, so the scene and the page
  text cannot disagree.

  This is the only Flight Lab file that imports three or @react-three. The
  frameloop is on demand: it draws while a throw is in the air or the camera is
  still settling, then stops. Off screen or in a hidden tab it does not draw.
*/

const AMBER = '#ffc23c'
const BONE = '#f6f1e6'
/** The ball drawn at a readable size away from the zone close-up, metres. */
const BALL_SHOW = 0.105
/** Ring and bead, in ball radii: the ring lies in the plane the ball turns in, the bead rides it. */
const RING_R = 1.42
const LIVE_SEGMENTS = 110
const RADIAL = 6

type Anchor = 'start' | 'mid' | 'end'

/* ── small helpers ─────────────────────────────────────────────────────── */

function mulberry(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (ctx) draw(ctx)
  const tex = new THREE.CanvasTexture(canvas)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Dispose GPU resources when they are replaced or the scene unmounts. `dep`
    is the one input that, when it changes, rebuilds the resource. */
function useDisposable<T extends { dispose: () => void }>(make: () => T, dep: unknown = null): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => make(), [dep])
  useEffect(() => () => value.dispose(), [value])
  return value
}

function plateShape() {
  // The plate's outline in the ground plane. The shape is drawn in (x, -z) and
  // laid flat by rotating -90 degrees about x.
  const s = new THREE.Shape()
  PLATE_POLYGON.forEach(([x, z], i) => (i === 0 ? s.moveTo(x, -z) : s.lineTo(x, -z)))
  s.closePath()
  return s
}

/* ── labels ────────────────────────────────────────────────────────────── */

interface Placement {
  anchor?: Anchor
  dx?: number
  dy?: number
}

function translate({ anchor = 'mid', dx = 0, dy = 0 }: Placement) {
  const shift = anchor === 'start' ? '0%' : anchor === 'mid' ? '-50%' : '-100%'
  return `translate(calc(${shift} + ${dx}px), calc(-50% + ${dy}px))`
}

/**
 * A tag pinned to a point in the scene. `narrow` re-places it on a phone-width
 * stage (below 640 px), or hides it there with `{ hide: true }`.
 */
function Label({
  position,
  anchor = 'mid',
  dx = 0,
  dy = 0,
  narrow,
  tone = 'bone',
  children,
}: Placement & {
  position: [number, number, number]
  narrow?: Placement & { hide?: boolean }
  tone?: 'bone' | 'amber' | 'bad' | 'plain'
  children: ReactNode
}) {
  const wide = translate({ anchor, dx, dy })
  const small = narrow ? translate({ anchor, dx, dy, ...narrow }) : wide
  const toneClass =
    tone === 'amber'
      ? 'bg-[rgba(7,5,9,0.8)] text-[#FFC23C] border-[#FFC23C]/45'
      : tone === 'bad'
        ? 'bg-[rgba(7,5,9,0.8)] text-[#FF5A6B] border-[#FF5A6B]/50'
        : tone === 'plain'
          ? 'text-bone border-transparent px-0'
          : 'bg-[rgba(7,5,9,0.8)] text-bone border-bone/30'
  return (
    <Html position={position} zIndexRange={[20, 0]} wrapperClass="pointer-events-none" style={{ pointerEvents: 'none' }}>
      <span
        className={`fl-tag ${narrow?.hide ? 'hidden sm:block' : 'block'} select-none whitespace-nowrap rounded-[3px] border px-2 py-[3px] font-mono text-[12px] uppercase leading-none tracking-[0.06em] [transform:var(--fl-tn)] sm:[transform:var(--fl-t)] ${toneClass}`}
        style={{ '--fl-t': wide, '--fl-tn': small } as CSSProperties}
      >
        {children}
      </span>
    </Html>
  )
}

/** A label with a long form and a short form for narrow stages. */
function Two({ long, short }: { long: string; short: string }) {
  return (
    <>
      <span className="hidden sm:inline">{long}</span>
      <span className="sm:hidden">{short}</span>
    </>
  )
}

/* ── the field ─────────────────────────────────────────────────────────── */

function Sky() {
  const material = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: `
          varying vec3 vDir;
          void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: `
          varying vec3 vDir;
          void main(){
            vec3 d = normalize(vDir);
            float h = d.y;
            vec3 zenith = vec3(0.018, 0.016, 0.026);
            vec3 mid = vec3(0.045, 0.038, 0.050);
            vec3 low = vec3(0.230, 0.120, 0.070);
            vec3 ember = vec3(0.750, 0.340, 0.000);
            vec3 c = mix(ember, low, smoothstep(0.0, 0.055, h));
            c = mix(c, mid, smoothstep(0.03, 0.30, h));
            c = mix(c, zenith, smoothstep(0.22, 0.85, h));
            float az = max(dot(normalize(vec3(d.x, 0.0, d.z)), vec3(0.0, 0.0, -1.0)), 0.0);
            c += ember * 0.42 * pow(az, 5.0) * exp(-max(h, 0.0) * 9.0);
            c = mix(vec3(0.020, 0.016, 0.016), c, smoothstep(-0.12, 0.0, h));
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
  )
  return (
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[400, 32, 20]} />
    </mesh>
  )
}

function Field() {
  const grass = useDisposable(() => {
    const t = canvasTexture(512, 512, (ctx) => {
      const r = mulberry(3)
      ctx.fillStyle = '#141911'
      ctx.fillRect(0, 0, 256, 512)
      ctx.fillStyle = '#181f14'
      ctx.fillRect(256, 0, 256, 512)
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.06)'
        ctx.fillRect(r() * 512, r() * 512, 1 + r() * 2, 2 + r() * 4)
      }
    })
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(34, 34)
    t.anisotropy = 4
    return t
  })
  const trees = useDisposable(() => {
    const t = canvasTexture(1024, 128, (ctx) => {
      const r = mulberry(21)
      ctx.fillStyle = '#0a0808'
      for (let i = 0; i < 720; i++) {
        const x = r() * 1024
        const hgt = 26 + r() * 70 * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.011)))
        const w = 5 + r() * 13
        ctx.beginPath()
        ctx.ellipse(x, 128 - hgt * 0.45, w, hgt * 0.6, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillRect(0, 118, 1024, 10)
    })
    t.wrapS = THREE.RepeatWrapping
    t.repeat.set(3, 1)
    return t
  })
  const plate = useMemo(() => plateShape(), [])

  const boxLine = (x: number, z: number, w: number, d: number, key: string) => (
    <mesh key={key} position={[x, 0.011, z]}>
      <boxGeometry args={[w, 0.006, d]} />
      <meshBasicMaterial color={BONE} />
    </mesh>
  )
  const boxes: ReactNode[] = []
  for (const side of [-1, 1]) {
    const inner = PLATE.halfWidth + 6 * IN
    const outer = inner + 36 * IN
    const half = 42 * IN
    boxes.push(
      boxLine(side * inner, 0, 0.05, half * 2, `i${side}`),
      boxLine(side * outer, 0, 0.05, half * 2, `o${side}`),
      boxLine((side * (inner + outer)) / 2, -half, outer - inner, 0.05, `f${side}`),
      boxLine((side * (inner + outer)) / 2, half, outer - inner, 0.05, `b${side}`),
    )
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[340, 340]} />
        <meshLambertMaterial map={grass} />
      </mesh>
      {/* the dirt around the plate and the pitcher's circle */}
      <mesh position={[0, 0.004, 0.5]}>
        <cylinderGeometry args={[4.6, 4.6, 0.01, 48]} />
        <meshLambertMaterial color="#43311f" />
      </mesh>
      <mesh position={[0, 0.004, PITCHERS_PLATE_Z]}>
        <cylinderGeometry args={[2.44, 2.44, 0.01, 48]} />
        <meshLambertMaterial color="#43311f" />
      </mesh>
      <mesh position={[0, 0.02, PITCHERS_PLATE_Z]}>
        <boxGeometry args={[0.61, 0.03, 0.152]} />
        <meshBasicMaterial color={BONE} />
      </mesh>
      {/* foul lines from the back point */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[side * 9.2, 0.008, PLATE.back - 9.2]} rotation={[0, side * Math.PI * 0.25, 0]}>
          <boxGeometry args={[0.08, 0.006, 26]} />
          <meshBasicMaterial color={BONE} />
        </mesh>
      ))}
      {boxes}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <shapeGeometry args={[plate]} />
        <meshBasicMaterial color={BONE} side={THREE.DoubleSide} />
      </mesh>
      {/* outfield fence and the treeline */}
      <mesh position={[0, 0.915, 0]}>
        <cylinderGeometry args={[84, 84, 1.83, 96, 1, true]} />
        <meshBasicMaterial color="#100c0b" side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 1.86, 0]}>
        <cylinderGeometry args={[84, 84, 0.14, 96, 1, true]} />
        <meshBasicMaterial color="#3a2414" side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 17, 0]}>
        <cylinderGeometry args={[132, 132, 34, 72, 1, true]} />
        <meshBasicMaterial map={trees} side={THREE.BackSide} transparent />
      </mesh>
      {/* backstop posts behind the catcher */}
      {[-7, -3.5, 0, 3.5, 7].map((x) => (
        <mesh key={x} position={[x, 3, 8.6]}>
          <boxGeometry args={[0.12, 6, 0.12]} />
          <meshBasicMaterial color="#0c0a09" />
        </mesh>
      ))}
    </group>
  )
}

/* ── the batter ────────────────────────────────────────────────────────── */

function Limb({ a, b, r, material }: { a: THREE.Vector3; b: THREE.Vector3; r: number; material: THREE.Material }) {
  const { position, quaternion, len } = useMemo(() => {
    const d = b.clone().sub(a)
    const len = d.length()
    return {
      position: a.clone().addScaledVector(d, 0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()),
      len,
    }
  }, [a, b])
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <capsuleGeometry args={[r, Math.max(0.001, len - 2 * r), 4, 10]} />
    </mesh>
  )
}

/**
 * A faceless mannequin at the measured batter's proportions, in the stance
 * before the swing. Built in a local frame where +x faces the plate and +z is
 * toward the catcher; the ratios are fractions of a 70 in figure, scaled to the
 * stance's height, and the bat is drawn at its real length.
 */
function Mannequin({ model }: { model: LabModel }) {
  const { stance, marks } = model
  const body = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#3b352c', roughness: 0.85 }))
  const head = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#4b443a', roughness: 0.8 }))
  const helmet = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#1a1714', roughness: 0.5 }))
  const bat = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#c9a36a', roughness: 0.55 }))

  const parts = useMemo(() => {
    const k = (stance.heightIn * IN) / 1.778
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x * k, y * k, z * k)
    const front = (-14 * IN) / 1.575 * 1.778
    const back = (17 * IN) / 1.575 * 1.778
    const hip = 0.774
    const knee = marks.knee / k
    const hands = v(0.31, 1.208, 0.22)
    const batDir = new THREE.Vector3(-0.11, 0.8, 0.26).normalize()
    return {
      legs: [
        [v(0, hip, -0.12), v(0.08, knee, front * 0.75), 0.078],
        [v(0.08, knee, front * 0.75), v(0, 0.08, front), 0.06],
        [v(0, hip, 0.12), v(0.05, knee, back * 0.7), 0.078],
        [v(0.05, knee, back * 0.7), v(0, 0.08, back), 0.06],
      ] as [THREE.Vector3, THREE.Vector3, number][],
      feet: [v(5.5 * 0.0287 - 0.135, 0.035, front), v(5.5 * 0.0287 - 0.135, 0.035, back)],
      arms: [
        [v(0.06, 1.348, 0.19), v(0.25, 1.168, 0.22), 0.05],
        [v(0.25, 1.168, 0.22), v(0.33, 1.288, 0.2), 0.045],
        [v(0.06, 1.348, -0.19), v(0.26, 1.188, -0.06), 0.05],
        [v(0.26, 1.188, -0.06), v(0.33, 1.288, 0.17), 0.045],
      ] as [THREE.Vector3, THREE.Vector3, number][],
      bat: [hands, hands.clone().addScaledVector(batDir, stance.batIn * IN)] as [THREE.Vector3, THREE.Vector3],
      torso: { position: v(0.03, 1.081, 0), scale: v(0.12, 0.347, 0.2) },
      pelvis: { position: v(0, 0.794, 0), scale: v(0.11, 0.13, 0.18) },
      head: { position: v(0.07, 1.588, 0), r: 0.105 * k },
      k,
    }
  }, [stance.heightIn, stance.batIn, marks.knee])

  const spot = useMemo(() => {
    const s = stanceSpot(stance)
    return [s.x, 0, s.z] as [number, number, number]
  }, [stance])

  return (
    <group position={spot}>
      {parts.legs.map(([a, b, r], i) => (
        <Limb key={`l${i}`} a={a} b={b} r={r * parts.k} material={body} />
      ))}
      {parts.feet.map((p, i) => (
        <mesh key={`f${i}`} position={p} material={body}>
          <boxGeometry args={[0.27 * parts.k, 0.07 * parts.k, 0.11 * parts.k]} />
        </mesh>
      ))}
      <mesh position={parts.torso.position} scale={parts.torso.scale} material={body}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      <mesh position={parts.pelvis.position} scale={parts.pelvis.scale} material={body}>
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
      <mesh position={parts.head.position} material={head}>
        <sphereGeometry args={[parts.head.r, 24, 16]} />
      </mesh>
      <mesh position={parts.head.position} material={helmet}>
        <sphereGeometry args={[parts.head.r * 1.1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
      {parts.arms.map(([a, b, r], i) => (
        <Limb key={`a${i}`} a={a} b={b} r={r * parts.k} material={body} />
      ))}
      <Limb a={parts.bat[0]} b={parts.bat[1]} r={0.028} material={bat} />
    </group>
  )
}

/* ── the zone ──────────────────────────────────────────────────────────── */

function DashedLoop({ points, color, opacity = 0.9, dash = 0.045, gap = 0.035 }: { points: THREE.Vector3[]; color: string; opacity?: number; dash?: number; gap?: number }) {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points)
    const m = new THREE.LineDashedMaterial({ color, dashSize: dash, gapSize: gap, transparent: true, opacity, depthWrite: false })
    const l = new THREE.LineLoop(g, m)
    l.computeLineDistances()
    return l
  }, [points, color, opacity, dash, gap])
  useEffect(
    () => () => {
      line.geometry.dispose()
      ;(line.material as THREE.Material).dispose()
    },
    [line],
  )
  return <primitive object={line} />
}

function ZoneSlab({ model, view }: { model: LabModel; view: CameraView }) {
  const { zone } = model
  const geometry = useDisposable(() => new THREE.ExtrudeGeometry(plateShape(), { depth: 1, bevelEnabled: false }))
  const edges = useDisposable(() => new THREE.EdgesGeometry(geometry), geometry)
  if (model.rule === 'senior' || view === 'reach') return null
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, zone.bottom, 0]} scale={[1, 1, zone.top - zone.bottom]} renderOrder={2}>
      <meshBasicMaterial color={BONE} transparent opacity={view === 'zone' ? 0.16 : 0.08} depthWrite={false} side={THREE.DoubleSide} />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#f0ead6" transparent opacity={0.85} />
      </lineSegments>
    </mesh>
  )
}

function Mat({ model }: { model: LabModel }) {
  const outline = useMemo(
    () => [
      new THREE.Vector3(-MAT.halfWidth, 0.013, 0),
      new THREE.Vector3(MAT.halfWidth, 0.013, 0),
      new THREE.Vector3(MAT.halfWidth, 0.013, MAT.length),
      new THREE.Vector3(-MAT.halfWidth, 0.013, MAT.length),
    ],
    [],
  )
  if (model.rule !== 'senior') return null
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, MAT.length / 2]}>
        <planeGeometry args={[MAT.halfWidth * 2, MAT.length]} />
        <meshBasicMaterial color="#3E6B4C" />
      </mesh>
      <DashedLoop points={outline} color="#f0ead6" dash={10} gap={0} />
      <Label position={[0, 0.02, MAT.length]} dy={18}>
        Strike mat
      </Label>
    </group>
  )
}

/** Long horizontal lines at the landmarks, and the ball's-edge margin round the zone. */
function ZoneLines({ model }: { model: LabModel }) {
  const { zone, marks } = model
  const R = BALL_RADIUS
  const grace = useMemo(() => {
    const x = PLATE.halfWidth + R + 0.004
    return [
      new THREE.Vector3(x, zone.bottom - R, PLATE.front - R),
      new THREE.Vector3(x, zone.bottom - R, PLATE.back + R),
      new THREE.Vector3(x, zone.top + R, PLATE.back + R),
      new THREE.Vector3(x, zone.top + R, PLATE.front - R),
    ]
  }, [zone.bottom, zone.top, R])
  const lines: { y: number; color: string; opacity: number; show: boolean }[] = [
    { y: zone.top, color: '#f0ead6', opacity: 0.62, show: model.rule !== 'senior' },
    { y: zone.bottom, color: '#f0ead6', opacity: 0.62, show: model.rule !== 'senior' },
    { y: marks.chest, color: AMBER, opacity: 0.5, show: true },
    { y: marks.belt, color: AMBER, opacity: 0.5, show: true },
  ]
  return (
    <group>
      {lines.map((l, i) =>
        l.show ? (
          <mesh key={i} position={[0, l.y, 0]}>
            <boxGeometry args={[0.008, 0.01, 6]} />
            <meshBasicMaterial color={l.color} transparent opacity={l.opacity} depthWrite={false} toneMapped={false} />
          </mesh>
        ) : null,
      )}
      {model.rule !== 'senior' ? <DashedLoop points={grace} color={BONE} opacity={0.75} /> : null}
    </group>
  )
}

/**
 * The inch ruler and the landmark tags, pinned to the left edge of the Zone
 * view. The group's depth follows the camera every frame so the ruler stays on
 * the screen's edge while the camera settles.
 */
function Ruler({ model }: { model: LabModel }) {
  const group = useRef<THREE.Group>(null)
  const { zone, marks } = model
  const top = Math.min(2, zone.top + 0.12)
  // The spine at z = 0, ticks running right (toward the pitcher, -z).
  const ticks = useMemo(() => {
    const pts: THREE.Vector3[] = []
    pts.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, top, 0))
    for (let inch = 0; inch * IN <= top + 1e-6; inch++) {
      const len = inch % 6 === 0 ? 0.06 : inch % 3 === 0 ? 0.036 : 0.018
      pts.push(new THREE.Vector3(0, inch * IN, 0), new THREE.Vector3(0, inch * IN, -len))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [top])
  useEffect(() => () => ticks.dispose(), [ticks])
  const numbers: number[] = []
  for (let inch = 6; inch * IN <= top + 1e-6; inch += 6) numbers.push(inch)

  useFrame(({ camera, size, invalidate }) => {
    const g = group.current
    if (!g) return
    const cam = camera as THREE.PerspectiveCamera
    // Keep the spine a fixed 48 px in from the stage's left edge.
    const dist = Math.max(0.1, cam.position.x - 0.03)
    const halfH = Math.tan((cam.fov * Math.PI) / 360) * dist
    const perPx = (2 * halfH) / Math.max(1, size.height)
    const z = cam.position.z + halfH * (size.width / Math.max(1, size.height)) - 48 * perPx
    // The tags place themselves before this moves the group, so a move asks for
    // one more frame; otherwise they freeze a step behind once the camera settles.
    if (Math.abs(g.position.z - z) > 1e-5 || g.position.x !== 0.03) invalidate()
    g.position.set(0.03, 0, z)
  })

  const senior = model.rule === 'senior'
  const tag = (y: number, long: string, short: string, tone: 'bone' | 'amber') => (
    <Label key={long} position={[0, y, 0]} anchor="start" dx={30} tone={tone}>
      <Two long={long} short={short} />
    </Label>
  )
  return (
    <group ref={group}>
      <lineSegments geometry={ticks}>
        <lineBasicMaterial color={BONE} transparent opacity={0.9} toneMapped={false} />
      </lineSegments>
      {numbers.map((n) => (
        <Label key={n} position={[0, n * IN, 0]} anchor="end" dx={-8} tone="plain">
          {/* on desktop the look-for panel covers the stage's foot, so the lowest mark steps aside */}
          <span className={`text-[14px] [text-shadow:0_1px_3px_#000]${n < 12 ? ' xl:hidden' : ''}`}>{n}</span>
        </Label>
      ))}
      {!senior ? tag(zone.top, `Shoulder · ${round(zone.top / IN)} in`, `Shoulder ${round(zone.top / IN)}`, 'bone') : null}
      {tag(marks.chest, `Chest · ${round(marks.chest / IN)} in`, `Chest ${round(marks.chest / IN)}`, 'amber')}
      {tag(marks.belt, `Belt · ${round(marks.belt / IN)} in`, `Belt ${round(marks.belt / IN)}`, 'amber')}
      {!senior ? tag(zone.bottom, `Front knee · ${round(zone.bottom / IN)} in`, `Knee ${round(zone.bottom / IN)}`, 'bone') : null}
    </group>
  )
}

/* ── the lobs ──────────────────────────────────────────────────────────── */

function softballParts() {
  // The ball's seam: the classic closed curve on a sphere.
  const pts: THREE.Vector3[] = []
  const t = 0.4
  const n = 1 - t
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2
    pts.push(
      new THREE.Vector3(
        n * Math.cos(a) - t * Math.cos(3 * a),
        n * Math.sin(a) + t * Math.sin(3 * a),
        2 * Math.sqrt(n * t) * Math.cos(2 * a),
      ).multiplyScalar(1.004),
    )
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal')
  return {
    skin: new THREE.SphereGeometry(1, 40, 28),
    seam: new THREE.TubeGeometry(curve, 200, 0.024, 6, true),
    skinMat: new THREE.MeshStandardMaterial({ color: '#d9e83a', roughness: 0.6 }),
    seamMat: new THREE.MeshStandardMaterial({ color: '#c62d28', roughness: 0.75 }),
    ring: new THREE.TorusGeometry(RING_R, 0.045, 6, 64),
    bead: new THREE.SphereGeometry(0.17, 12, 8),
    dispose() {
      this.skin.dispose()
      this.seam.dispose()
      this.ring.dispose()
      this.bead.dispose()
      this.skinMat.dispose()
      this.seamMat.dispose()
    },
  }
}

function pathCurve(flight: Flight) {
  const p = flight.positions
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < flight.count; i += 6) pts.push(new THREE.Vector3(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]))
  const last = flight.count - 1
  const end = new THREE.Vector3(p[last * 3], p[last * 3 + 1], p[last * 3 + 2])
  if (pts[pts.length - 1].distanceTo(end) > 1e-4) pts.push(end)
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal')
}

/** The same throw with no spin, dashed: the path this pitch's spin bent away from. */
function GhostPath({ flight, color }: { flight: Flight; color: string }) {
  const line = useMemo(() => {
    const g = flight.ghost
    const pts: THREE.Vector3[] = []
    const n = g.length / 3
    for (let i = 0; i < n; i += 4) pts.push(new THREE.Vector3(g[i * 3], g[i * 3 + 1], g[i * 3 + 2]))
    pts.push(new THREE.Vector3(g[(n - 1) * 3], g[(n - 1) * 3 + 1], g[(n - 1) * 3 + 2]))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.09, gapSize: 0.07, transparent: true, opacity: 0.7, depthWrite: false })
    const l = new THREE.Line(geo, mat)
    l.computeLineDistances()
    l.renderOrder = 2
    return l
  }, [flight, color])
  useEffect(
    () => () => {
      line.geometry.dispose()
      ;(line.material as THREE.Material).dispose()
    },
    [line],
  )
  return <primitive object={line} />
}

interface ThrowState {
  id: number
  indices: Set<number>
  playhead: number
  playing: boolean
  hold: number
}

function LobPath({
  index,
  model,
  view,
  ball,
  throwStateRef,
  ballScaleRef,
}: {
  index: number
  model: LabModel
  view: CameraView
  ball: ReturnType<typeof softballParts>
  throwStateRef: RefObject<ThrowState>
  ballScaleRef: RefObject<number>
}) {
  const lob = model.lobs[index]
  const flight = lob.flight
  const selected = index === model.selectedIndex
  const curve = useMemo(() => pathCurve(flight), [flight])
  const ghostGeo = useDisposable(() => new THREE.TubeGeometry(curve, LIVE_SEGMENTS, 0.016, RADIAL, false), curve)
  const liveGeo = useDisposable(() => new THREE.TubeGeometry(curve, LIVE_SEGMENTS, 0.021, RADIAL, false), curve)
  const ballGroup = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const live = useRef<THREE.Mesh>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const shadowTex = useDisposable(
    () =>
      canvasTexture(64, 64, (ctx) => {
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
        g.addColorStop(0, 'rgba(0,0,0,0.75)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 64, 64)
      }),
  )
  const axis = useMemo(() => new THREE.Vector3(...flight.spinAxis), [flight])
  // the ring faces along the spin axis; the bead starts on it, square to the axis
  const ringQ = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis), [axis])
  const bead = useMemo(() => {
    const ref = Math.abs(axis.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    return new THREE.Vector3().crossVectors(axis, ref).normalize().multiplyScalar(RING_R)
  }, [axis])
  useEffect(() => {
    spin.current?.quaternion.identity()
  }, [flight])
  const tmpQ = useMemo(() => new THREE.Quaternion(), [])
  const at = useMemo<[number, number, number]>(() => [0, 0, 0], [])

  // Riding the ball, its own tubes would fill the frame; the dashed no-spin line stays.
  const ghostVisible = view === 'ball' ? false : view === 'zone' ? selected : true

  useFrame((_, delta) => {
    const g = ballGroup.current
    const st = throwStateRef.current
    if (!g || !st) return
    const thrown = st.indices.has(index)
    const visible = thrown || (selected && st.id === 0)
    g.visible = visible
    if (shadow.current) shadow.current.visible = visible
    if (live.current) live.current.visible = thrown && view !== 'ball'
    if (!visible) return
    const t = thrown ? Math.min(st.playhead, flight.duration) : 0
    positionAt(flight, t, at)
    g.position.set(at[0], at[1], at[2])
    g.scale.setScalar(ballScaleRef.current ?? BALL_SHOW)
    if (thrown && t < flight.duration && flight.spinRate > 0 && spin.current) {
      tmpQ.setFromAxisAngle(axis, flight.spinRate * Math.min(delta, 0.05) * SPIN_VIEW_RATE)
      spin.current.quaternion.premultiply(tmpQ)
    }
    if (thrown && live.current) {
      const segs = Math.floor(progressAt(flight, t) * LIVE_SEGMENTS)
      live.current.geometry.setDrawRange(0, segs * RADIAL * 6)
    }
    if (shadow.current) {
      const y = Math.max(0, at[1])
      const d = BALL_SHOW * 2.6 * (1 + y * 0.18)
      shadow.current.position.set(at[0], 0.025, at[2])
      shadow.current.scale.set(d, d, 1)
      ;(shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.55 / (1 + y * 0.9)
    }
  })

  return (
    <group>
      <mesh geometry={ghostGeo} visible={ghostVisible} renderOrder={3}>
        <meshBasicMaterial
          color={lob.color}
          transparent
          opacity={selected ? 0.75 : 0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={live} geometry={liveGeo} visible={false} renderOrder={4}>
        <meshBasicMaterial color={lob.color} transparent opacity={0.92} depthWrite={false} toneMapped={false} />
      </mesh>
      {selected && model.pitch.key !== 'lob' ? <GhostPath flight={flight} color={model.pitch.color} /> : null}
      <group ref={ballGroup} visible={false}>
        <mesh geometry={ball.ring} quaternion={ringQ} renderOrder={5}>
          <meshBasicMaterial color={model.pitch.color} transparent opacity={0.85} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={spin}>
          <mesh geometry={ball.skin} material={ball.skinMat} />
          <mesh geometry={ball.seam} material={ball.seamMat} />
          <mesh geometry={ball.bead} position={bead} renderOrder={6}>
            <meshBasicMaterial color={model.pitch.color} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.5} />
      </mesh>
      {/* where it lands */}
      {view !== 'zone' || selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[flight.land.x, 0.02, flight.land.z]} scale={selected ? 1.25 : 0.8}>
          <ringGeometry args={[0.1, 0.135, 40]} />
          <meshBasicMaterial color={lob.color} transparent opacity={selected ? 1 : 0.55} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  )
}

/** The stretch of the selected lob that is inside the zone, drawn brighter. */
function InZone({ model }: { model: LabModel }) {
  const { selected, zone } = model
  const R = BALL_RADIUS
  const geometry = useMemo(() => {
    const f = selected.flight
    const pts: THREE.Vector3[] = []
    for (let i = f.apexIndex; i < f.count; i++) {
      const x = f.positions[i * 3]
      const y = f.positions[i * 3 + 1]
      const z = f.positions[i * 3 + 2]
      if (y >= zone.bottom - R && y <= zone.top + R && distanceToPlate(x, z) <= R) pts.push(new THREE.Vector3(x, y, z))
    }
    if (pts.length < 2) return null
    const curve = new THREE.CatmullRomCurve3(
      pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1),
      false,
      'centripetal',
    )
    return new THREE.TubeGeometry(curve, 48, 0.026, 8, false)
  }, [selected.flight, zone.bottom, zone.top, R])
  useEffect(() => () => geometry?.dispose(), [geometry])
  const color = useMemo(() => new THREE.Color(selected.color).lerp(new THREE.Color('#ffffff'), 0.45), [selected.color])
  if (!geometry || model.rule === 'senior') return null
  return (
    <mesh geometry={geometry} renderOrder={5}>
      <meshBasicMaterial color={color} toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

/* ── the batter's side: sweet band, marks, heat, reach ─────────────────── */

function ringSprite(color: string, width: number) {
  return canvasTexture(128, 128, (ctx) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.arc(64, 64, 52, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(64, 64, 12, 0, Math.PI * 2)
    ctx.fill()
  })
}

function hatchTexture() {
  const t = canvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(-8, 72)
    ctx.lineTo(72, -8)
    ctx.moveTo(-40, 72)
    ctx.lineTo(40, -8)
    ctx.moveTo(24, 72)
    ctx.lineTo(104, -8)
    ctx.stroke()
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function GroundWindows({ model, view }: { model: LabModel; view: CameraView }) {
  const hatch = useDisposable(() => hatchTexture())
  const width = (PLATE.halfWidth + BALL_RADIUS) * 2
  const lane = model.laneZ
  const hot = model.hotZ
  useEffect(() => {
    if (lane) hatch.repeat.set(width / 0.16, Math.max(0.01, lane[1] - lane[0]) / 0.16)
  }, [hatch, lane, width])
  const reading = model.selected.reading
  const sideX = PLATE.halfWidth + BALL_RADIUS + 0.08
  return (
    <group>
      {lane ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, (lane[0] + lane[1]) / 2]}>
          <planeGeometry args={[width, Math.max(0.01, lane[1] - lane[0])]} />
          <meshBasicMaterial map={hatch} color={BONE} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
      {hot ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.017, (hot[0] + hot[1]) / 2]}>
          <planeGeometry args={[width, Math.max(0.01, hot[1] - hot[0])]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0.34} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
      {view === 'arc' && lane ? (
        <Label position={[sideX, 0.02, (lane[0] + lane[1]) / 2]} anchor="end" dx={-10} dy={22} narrow={{ hide: true }}>
          {`Strike · ${round(reading.strikeWindowIn[0])}–${round(reading.strikeWindowIn[1])} in`}
        </Label>
      ) : null}
      {view === 'arc' && hot && reading.lookFor.hot ? (
        <Label position={[-sideX, 0.02, (hot[0] + hot[1]) / 2]} anchor="end" dx={-10} dy={-16} tone="amber">
          {`Your pitch · ${round(reading.lookFor.hot[0])}–${round(reading.lookFor.hot[1])} in`}
        </Label>
      ) : null}
    </group>
  )
}

function BarrelMarks({ model }: { model: LabModel }) {
  const amber = useDisposable(() => ringSprite(AMBER, 12))
  const bone = useDisposable(() => ringSprite(BONE, 9))
  const contact = model.selected.reading.contact.contact
  const barrel = model.selected.reading.barrel
  const flight = model.selected.flight
  const crossing = flight.land.z > 0 ? flight.crossing : null
  const { marks } = model
  return (
    <group>
      {contact ? (
        <>
          <mesh position={[contact.x, (marks.belt + marks.chest) / 2, contact.z]} rotation={[0, Math.PI / 2, 0]} renderOrder={6}>
            <planeGeometry args={[0.12, marks.chest - marks.belt]} />
            <meshBasicMaterial color={AMBER} transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <sprite position={[contact.x, contact.y, contact.z]} scale={[0.17, 0.17, 1]} renderOrder={10}>
            <spriteMaterial map={amber} transparent depthWrite={false} depthTest={false} toneMapped={false} />
          </sprite>
          {barrel ? (
            <Label position={[contact.x, contact.y, contact.z]} anchor="end" dx={-22} dy={-20} narrow={{ anchor: 'mid', dx: 0, dy: -32 }} tone="amber">
              <Two
                long={`Barrel · ${round(barrel.heightIn)} in high · ${round(barrel.outFrontIn)} in out front`}
                short={`Barrel ${round(barrel.heightIn)} in`}
              />
            </Label>
          ) : null}
        </>
      ) : null}
      {crossing ? (
        <>
          <sprite position={[crossing.x, crossing.y, 0]} scale={[0.12, 0.12, 1]} renderOrder={10}>
            <spriteMaterial map={bone} transparent depthWrite={false} depthTest={false} toneMapped={false} />
          </sprite>
          <Label position={[crossing.x, crossing.y, 0]} anchor="start" dx={16} dy={22} narrow={{ dx: 14, dy: -24 }}>
            <Two long={`Over the plate · ${round(crossing.y / IN)} in`} short={`Plate ${round(crossing.y / IN)}`} />
          </Label>
        </>
      ) : null}
    </group>
  )
}

/** The barrel's reach over the plate face, seen from the catcher: amber where it is your pitch. */
function HeatGrid({ model }: { model: LabModel }) {
  const heat = model.heat
  const { texture, hotAt, jamAt } = useMemo(() => {
    const W = 120
    const H = Math.max(8, Math.round((W * (heat.y[1] - heat.y[0])) / (heat.x[1] - heat.x[0])))
    const sample = (fx: number, fy: number) => {
      const x = Math.max(0, Math.min(heat.nx - 1.001, fx))
      const y = Math.max(0, Math.min(heat.ny - 1.001, fy))
      const x0 = Math.floor(x)
      const y0 = Math.floor(y)
      const tx = x - x0
      const ty = y - y0
      const v = (i: number, j: number) => heat.values[j * heat.nx + i]
      return (v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx) * (1 - ty) + (v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx) * ty
    }
    const pixels = new Uint8ClampedArray(W * H * 4)
    let sx = 0
    let sy = 0
    let n = 0
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const v = sample(((px + 0.5) / W) * heat.nx - 0.5, (1 - (py + 0.5) / H) * heat.ny - 0.5)
        let a = 0
        if (v >= 0.8) a = 0.5
        else if (v >= 0.5) a = (0.26 * (v - 0.5)) / 0.3
        if (Math.abs(v - 0.8) < 0.022) a = 0.95
        if (v >= 0.8) {
          sx += px
          sy += py
          n++
        }
        const o = (py * W + px) * 4
        pixels[o] = 255
        pixels[o + 1] = 194
        pixels[o + 2] = 60
        pixels[o + 3] = Math.round(a * 255)
      }
    }
    const tex = canvasTexture(W, H, (ctx) => ctx.putImageData(new ImageData(pixels, W, H), 0, 0))
    const w = heat.x[1] - heat.x[0]
    const h = heat.y[1] - heat.y[0]
    const hotAt = n ? ([heat.x[0] + ((sx / n + 0.5) / W) * w, heat.y[1] - ((sy / n + 0.5) / H) * h, 0] as [number, number, number]) : null
    // the inside columns the barrel cannot reach well: they jam the hands
    let jamAt: [number, number, number] | null = null
    for (let i = 0; i < heat.nx; i++) {
      const x = heat.x[0] + ((i + 0.5) / heat.nx) * w
      if (x < -PLATE.halfWidth) continue
      let best = 0
      for (let j = 0; j < heat.ny; j++) best = Math.max(best, heat.values[j * heat.nx + i])
      if (best < 0.5) jamAt = [x, (model.zone.bottom + model.zone.top) / 2, 0]
      else break
    }
    return { texture: tex, hotAt, jamAt }
  }, [heat, model.zone.bottom, model.zone.top])
  useEffect(() => () => texture.dispose(), [texture])
  const sideX = PLATE.halfWidth + 0.14
  return (
    <group>
      <mesh position={[(heat.x[0] + heat.x[1]) / 2, (heat.y[0] + heat.y[1]) / 2, 0]} renderOrder={7}>
        <planeGeometry args={[heat.x[1] - heat.x[0], heat.y[1] - heat.y[0]]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {model.rule !== 'senior' ? (
        <>
          <Label position={[sideX, model.zone.top, 0]} anchor="start">
            <Two long={`Shoulder · ${round(model.zone.top / IN)} in`} short={`Shoulder ${round(model.zone.top / IN)}`} />
          </Label>
          <Label position={[sideX, model.zone.bottom, 0]} anchor="start">
            <Two long={`Knee · ${round(model.zone.bottom / IN)} in`} short={`Knee ${round(model.zone.bottom / IN)}`} />
          </Label>
        </>
      ) : null}
      {hotAt ? (
        <Label position={hotAt} tone="amber">
          Your pitch
        </Label>
      ) : null}
      {jamAt ? (
        <Label position={jamAt} anchor="end" tone="bad">
          Jams you
        </Label>
      ) : null}
    </group>
  )
}

const ARC_START = -0.3
const ARC_SWEEP = 1.92

function ReachArcs({ model }: { model: LabModel }) {
  const { pivot, reach, reachOld } = model
  const start = ARC_START
  const sweep = ARC_SWEEP
  const arcPoint = (r: number, a: number): [number, number, number] => [pivot.x + r * Math.cos(a), 0.03, pivot.z - r * Math.sin(a)]
  const dashes = useMemo(() => {
    if (!reachOld) return []
    const step = ARC_SWEEP / 30
    return Array.from({ length: 30 }, (_, i) => ARC_START + i * step)
  }, [reachOld])
  const contact = model.selected.reading.contact.contact
  const old = model.compareContact?.contact
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pivot.x, 0.03, pivot.z]}>
        <ringGeometry args={[reach - 0.009, reach + 0.009, 120, 1, start, sweep]} />
        <meshBasicMaterial color={AMBER} side={THREE.DoubleSide} transparent opacity={0.95} depthWrite={false} toneMapped={false} />
      </mesh>
      {dashes.map((a) => (
        <mesh key={a} rotation={[-Math.PI / 2, 0, 0]} position={[pivot.x, 0.028, pivot.z]}>
          <ringGeometry args={[reachOld - 0.006, reachOld + 0.006, 6, 1, a, (sweep / 30) * 0.55]} />
          <meshBasicMaterial color={BONE} side={THREE.DoubleSide} transparent opacity={0.8} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      <Label position={arcPoint(reach, 1.18)} anchor="start" dx={12} dy={-8} tone="amber">
        {`${model.stance.batIn} in bat`}
      </Label>
      {reachOld ? (
        <Label position={arcPoint(reachOld, 1.18)} anchor="end" dx={-12} dy={10}>
          {`${model.compareIn} in bat`}
        </Label>
      ) : null}
      {contact ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[contact.x, 0.032, contact.z]}>
          <circleGeometry args={[0.045, 28]} />
          <meshBasicMaterial color={AMBER} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
      {old ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[old.x, 0.03, old.z]}>
          <circleGeometry args={[0.045, 28]} />
          <meshBasicMaterial color={BONE} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
      {contact ? (
        <Label position={[contact.x, 0.03, contact.z]} anchor="start" dx={16} narrow={{ anchor: 'end', dx: -14, dy: 20 }} tone="amber">
          Barrel meets it
        </Label>
      ) : null}
    </group>
  )
}

function ArcMarks({ model }: { model: LabModel }) {
  const f = model.selected.flight
  const [ax, ay, az] = f.apex
  const drop = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ax, ay, az), new THREE.Vector3(ax, 0.02, az)])
    const m = new THREE.LineDashedMaterial({ color: model.selected.color, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0.7 })
    const l = new THREE.Line(g, m)
    l.computeLineDistances()
    return l
  }, [ax, ay, az, model.selected.color])
  useEffect(
    () => () => {
      drop.geometry.dispose()
      ;(drop.material as THREE.Material).dispose()
    },
    [drop],
  )
  return (
    <group>
      <primitive object={drop} />
      <mesh position={[ax, ay, az]}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshBasicMaterial color={model.selected.color} toneMapped={false} />
      </mesh>
      <Label position={[ax, ay, az]} anchor="start" dx={12} dy={-12}>
        {`Peak · ${fixed(f.apex[1] / 0.3048)} ft`}
      </Label>
      <Label position={[RELEASE.x, RELEASE.y, RELEASE.z]} anchor="start" dx={12} narrow={{ hide: true }}>
        Release
      </Label>
    </group>
  )
}

/* ── camera ────────────────────────────────────────────────────────────── */

interface CamTarget {
  pos: THREE.Vector3
  look: THREE.Vector3
  up: THREE.Vector3
  fov: number
  k: number
}

/** Fractions of the stage height the page's overlays cover, top and bottom. */
interface Inset {
  top: number
  bottom: number
}

function cameraTarget(
  view: CameraView,
  model: LabModel,
  aspect: number,
  inset: Inset = { top: 0, bottom: 0 },
  ballAt?: THREE.Vector3,
): CamTarget {
  const portrait = aspect < 1
  const up = new THREE.Vector3(0, 1, 0)
  switch (view) {
    case 'ball': {
      // Ride beside the ball, a step ahead of it and a touch above, so it comes at you turning.
      const at = ballAt ?? new THREE.Vector3(RELEASE.x, RELEASE.y, RELEASE.z)
      const off = portrait ? new THREE.Vector3(0.42, 0.14, 0.72) : new THREE.Vector3(0.5, 0.12, 0.62)
      return { pos: at.clone().add(off), look: at.clone(), up, fov: portrait ? 30 : 22, k: 14 }
    }
    case 'zone': {
      const top = model.zone.top + 0.34
      const bottom = -0.08
      const dist = 3.2
      const cz = model.selected.reading.contact.contact?.z ?? -0.7
      const far = Math.min(-0.45, cz - 0.3)
      // under Senior rules the strike is called on the mat, so the frame runs past its back edge
      const near = Math.max(portrait ? 0.4 : 0.62, model.rule === 'senior' ? MAT.length + 0.12 : 0)
      const halfW = (near - far) / 2
      let halfH = Math.max((top - bottom) / 2, halfW / Math.max(0.3, aspect), portrait ? 0 : 1.11)
      let midY = (top + bottom) / 2 + (portrait ? 0.16 * halfH : 0)
      if (inset.bottom > 0) {
        // A panel covers the stage's foot (the desktop look-for): fit the zone, from
        // the knee (the ground under Senior rules, for the mat) to the shoulder, into
        // the band the overlays leave clear.
        const lo = model.rule === 'senior' ? -0.1 : model.zone.bottom - 0.1
        const hi = model.zone.top + 0.12
        const clear = Math.max(0.3, 1 - inset.top - inset.bottom)
        halfH = Math.max(halfH, (hi - lo) / 2 / clear)
        const bandMid = (inset.top + 1 - inset.bottom) / 2
        midY = (hi + lo) / 2 - (0.5 - bandMid) * 2 * halfH
      }
      const midZ = (near + far) / 2
      return {
        pos: new THREE.Vector3(dist, midY, midZ),
        look: new THREE.Vector3(0, midY, midZ),
        up,
        fov: (2 * Math.atan(halfH / dist) * 180) / Math.PI,
        k: 4,
      }
    }
    case 'arc':
      return {
        pos: new THREE.Vector3(portrait ? -19 : -27, portrait ? 1.7 : 1.9, -6.5),
        look: new THREE.Vector3(0, portrait ? 1.7 : 3, -6.5),
        up,
        fov: portrait ? 68 : 33,
        k: 3,
      }
    case 'reach': {
      const x0 = model.pivot.x - 0.35
      const x1 = PLATE.halfWidth + 0.45
      const z0 = model.pivot.z - model.reach - 0.4
      const z1 = portrait
        ? Math.max(0.45, model.pivot.z + 0.4)
        : Math.max(0.95, model.pivot.z + 0.55, (model.hotZ?.[1] ?? 0) + 0.15)
      const cx = (x0 + x1) / 2
      const cz = (z0 + z1) / 2
      const t = Math.tan((40 * Math.PI) / 360)
      const k = portrait ? 0.5 : 1
      const h = Math.max((z1 - z0) / k / 2 / t, (x1 - x0) / 2 / (t * Math.max(0.3, aspect))) * 1.12
      const lookZ = portrait ? cz + 0.1 * h * t : cz
      return {
        pos: new THREE.Vector3(cx, h, lookZ + 0.001),
        look: new THREE.Vector3(cx, 0, lookZ),
        up: new THREE.Vector3(0, 0, -1),
        fov: 40,
        k: 3,
      }
    }
    default:
      return {
        pos: new THREE.Vector3(portrait ? -0.05 : 0.32, 0.98, portrait ? 5 : 3.6),
        look: new THREE.Vector3(portrait ? -0.05 : 0.12, 0.74, -2),
        up,
        fov: portrait ? 40 : 30,
        k: 3,
      }
  }
}

/**
 * Drives the camera toward the view's framing, the throw clock, and the ball
 * size; requests frames only while something is still moving.
 */
function Director({
  model,
  view,
  slow,
  reduced,
  active,
  throwRequest,
  throwStateRef,
  ballScaleRef,
  onPlaying,
  insetTop,
  insetBottom,
}: {
  model: LabModel
  view: CameraView
  slow: boolean
  reduced: boolean
  active: boolean
  throwRequest?: ThrowRequest
  throwStateRef: RefObject<ThrowState>
  ballScaleRef: RefObject<number>
  onPlaying?: (playing: boolean) => void
  insetTop: number
  insetBottom: number
}) {
  const invalidate = useThree((s) => s.invalidate)
  const size = useThree((s) => s.size)
  const cam = useRef<{ pos: THREE.Vector3; look: THREE.Vector3; up: THREE.Vector3; fov: number } | null>(null)
  const playingCb = useRef(onPlaying)
  const live = useRef({ model, view, slow, active })
  const insetRef = useRef<Inset>({ top: 0, bottom: 0 })
  const ballTmp = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => {
    playingCb.current = onPlaying
    live.current = { model, view, slow, active }
    insetRef.current = { top: insetTop / Math.max(1, size.height), bottom: insetBottom / Math.max(1, size.height) }
  })

  // Snap to the first framing, then ease from there.
  useEffect(() => {
    if (cam.current) return
    const t = cameraTarget(view, model, size.width / Math.max(1, size.height), insetRef.current)
    cam.current = { pos: t.pos.clone(), look: t.look.clone(), up: t.up.clone(), fov: t.fov }
    ballScaleRef.current = view === 'zone' || view === 'ball' ? BALL_RADIUS : BALL_SHOW
  }, [view, model, size, ballScaleRef])

  // A new throw request starts the clock; clearing it puts the ball back in the hand.
  useEffect(() => {
    const st = throwStateRef.current
    if (!st) return
    if (!throwRequest || throwRequest.id === 0) {
      st.id = 0
      st.indices = new Set()
      st.playhead = 0
      if (st.playing) {
        st.playing = false
        playingCb.current?.(false)
      }
    } else if (throwRequest.id !== st.id) {
      st.id = throwRequest.id
      st.indices = new Set(throwRequest.indices)
      st.hold = 0
      if (reduced) {
        // No animation: land it at once.
        st.playhead = 1e3
        st.playing = false
      } else {
        st.playhead = 0
        st.playing = true
        playingCb.current?.(true)
      }
    }
    invalidate()
  }, [throwRequest, reduced, throwStateRef, invalidate])

  useEffect(() => {
    if (active) invalidate()
  }, [active, model, view, size, invalidate])

  useFrame((state, rawDelta) => {
    const camera = state.camera as THREE.PerspectiveCamera
    const { model: m, view: v, slow: s, active: on } = live.current
    const st = throwStateRef.current
    const c = cam.current
    if (!st || !c) return
    const delta = Math.min(rawDelta, 0.05)
    let moving = false
    // The balls drew this frame at the playhead as it stood before this step; the Ball camera aims there.
    const drawnAt = st.playhead

    if (st.playing) {
      const lead = m.lobs[m.selectedIndex]
      const leadIndex = st.indices.has(m.selectedIndex) ? m.selectedIndex : [...st.indices][0]
      const leadFlight = m.lobs[leadIndex]?.flight ?? lead.flight
      const z = positionAt(leadFlight, Math.min(st.playhead, leadFlight.duration))[2]
      const dilation = v === 'zone' ? nearPlateTimeScale(z) : 1
      st.playhead += delta * (s ? SLOW_RATE : 1) * dilation
      const end = Math.max(...[...st.indices].map((i) => m.lobs[i]?.flight.duration ?? 0))
      if (st.playhead >= end) {
        st.hold += delta
        if (st.hold > 0.35) {
          st.playing = false
          playingCb.current?.(false)
        }
      }
      moving = true
    }

    let ballAt: THREE.Vector3 | undefined
    if (v === 'ball') {
      const leadIndex = st.indices.has(m.selectedIndex) || st.indices.size === 0 ? m.selectedIndex : [...st.indices][0]
      const leadFlight = m.lobs[leadIndex]?.flight ?? m.lobs[m.selectedIndex].flight
      const t = st.id === 0 ? 0 : Math.min(drawnAt, leadFlight.duration)
      const p = positionAt(leadFlight, t)
      ballAt = ballTmp.set(p[0], p[1], p[2])
    }
    const target = cameraTarget(v, m, size.width / Math.max(1, size.height), insetRef.current, ballAt)
    const k = 1 - Math.exp(-delta * target.k)
    const before = c.pos.distanceTo(target.pos) + c.look.distanceTo(target.look) + c.up.distanceTo(target.up) + Math.abs(c.fov - target.fov) * 0.01
    if (v === 'ball' && st.playing) {
      // A ball in flight outruns any easing: ride it exactly.
      c.pos.copy(target.pos)
      c.look.copy(target.look)
    } else {
      c.pos.lerp(target.pos, k)
      c.look.lerp(target.look, k)
    }
    c.up.lerp(target.up, k)
    c.fov += (target.fov - c.fov) * (1 - Math.exp(-delta * 3))
    if (before > 1e-4) moving = true

    const wantBall = v === 'zone' || v === 'ball' ? BALL_RADIUS : BALL_SHOW
    const b = ballScaleRef.current ?? wantBall
    if (Math.abs(b - wantBall) > 1e-5) {
      ballScaleRef.current = b + (wantBall - b) * (1 - Math.exp(-delta * 5))
      moving = true
    }

    camera.position.copy(c.pos)
    camera.up.copy(c.up).normalize()
    camera.lookAt(c.look)
    if (Math.abs(camera.fov - c.fov) > 0.01) {
      camera.fov = c.fov
      camera.updateProjectionMatrix()
    }

    if (moving && on) invalidate()
  })
  return null
}

/* ── the scene ─────────────────────────────────────────────────────────── */

function Lobs({
  model,
  view,
  throwStateRef,
  ballScaleRef,
}: {
  model: LabModel
  view: CameraView
  throwStateRef: RefObject<ThrowState>
  ballScaleRef: RefObject<number>
}) {
  const ball = useDisposable(() => softballParts())
  return (
    <group>
      {model.lobs.map((lob, i) => (
        <LobPath key={lob.key} index={i} model={model} view={view} ball={ball} throwStateRef={throwStateRef} ballScaleRef={ballScaleRef} />
      ))}
    </group>
  )
}

export default function FlightLabScene({
  model,
  view,
  slow,
  reduced,
  active,
  throwRequest,
  onPlaying,
  onReady,
  insetTop = 0,
  insetBottom = 0,
}: {
  model: LabModel
  view: CameraView
  slow: boolean
  reduced: boolean
  /** On screen and the tab visible: only then does the scene draw. */
  active: boolean
  throwRequest?: ThrowRequest
  onPlaying?: (playing: boolean) => void
  onReady?: () => void
  /** Room the page's overlays take at the top and bottom of the stage, px. */
  insetTop?: number
  insetBottom?: number
}) {
  const throwStateRef = useRef<ThrowState>({ id: 0, indices: new Set(), playhead: 0, playing: false, hold: 0 })
  const ballScaleRef = useRef<number>(BALL_RADIUS)
  return (
    <Canvas
      events={canvasEvents}
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [3.2, 1, 0], fov: 36, near: 0.05, far: 900 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1
      }}
    >
      <fogExp2 attach="fog" args={['#150f0d', 0.0075]} />
      <hemisphereLight args={['#d8d0c0', '#1a1409', 0.9]} />
      <directionalLight position={[-10, 18, 22]} intensity={2.3} color="#fff0dc" />
      <directionalLight position={[8, 9, -26]} intensity={1.6} color="#ffa860" />
      <Sky />
      <Field />
      <Mannequin model={model} />
      <Mat model={model} />
      <ZoneSlab model={model} view={view} />
      {view === 'zone' ? (
        <>
          <ZoneLines model={model} />
          <InZone model={model} />
          <Ruler model={model} />
          <BarrelMarks model={model} />
        </>
      ) : null}
      <GroundWindows model={model} view={view} />
      <Lobs model={model} view={view} throwStateRef={throwStateRef} ballScaleRef={ballScaleRef} />
      {view === 'arc' ? <ArcMarks model={model} /> : null}
      {view === 'catcher' ? <HeatGrid model={model} /> : null}
      {view === 'reach' ? <ReachArcs model={model} /> : null}
      <Director
        model={model}
        view={view}
        slow={slow}
        reduced={reduced}
        active={active}
        throwRequest={throwRequest}
        throwStateRef={throwStateRef}
        ballScaleRef={ballScaleRef}
        onPlaying={onPlaying}
        insetTop={insetTop}
        insetBottom={insetBottom}
      />
      <FirstFrame onReady={onReady} />
    </Canvas>
  )
}
