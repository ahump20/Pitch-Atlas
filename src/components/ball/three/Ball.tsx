import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { seamSamples, seamPoint } from '../../../lib/seam'
import type { Handedness, SeamAnchoredPoint } from '../../../data/types'

/*
  The specimen geometry. Original, parametric, no downloaded model:
   - a warm aged-leather sphere (procedural albedo + normal, lit by the studio env)
   - a red seam tube swept along the shared figure-eight curve from seam.ts
   - 216 instanced stitches: 108 double-stitch pairs straddling the seam in the
     classic herringbone V
   - sourced grip pins anchored to seam parameters: a marker disc on the leather
     and a label that occludes behind the ball and opens its cue on hover/active
  No hand. The grip contacts ARE the information now — each pin carries the
  finger, the pressure role, and the sourced cue, exactly as the prose lists it.
  Real hands come from the real footage elsewhere on the page, never a fake model.
  The cover is one baseball for every pitch; only the grip contacts and the spin
  axis change. The 3D seam and the 2D schematic are the same math, so they can
  never disagree.
*/

const R = 1
const STITCH_PAIRS = 108

// Grip pins are data markers, not skin: powder-blue from the heritage palette.
const PIN = '#4B92DB'

const clampByte = (n: number) => Math.max(0, Math.min(255, n))

/** What the ball needs per contact. GripContactModel satisfies this superset. */
type GripContactPoint = SeamAnchoredPoint & {
  pressureRole?: string
  seamRelation?: string
  cue?: string
  curl?: number
}

interface PadModel {
  key: string
  label: string
  finger: SeamAnchoredPoint['finger']
  pressureRole?: string
  cue?: string
  normal: THREE.Vector3
  quaternion: THREE.Quaternion
  discPos: THREE.Vector3
  padPos: THREE.Vector3
  labelPos: THREE.Vector3
  discR: number
  scale: THREE.Vector3
}

function mirrorBasePoint(base: { x: number; y: number; z: number }, handedness: Handedness) {
  return new THREE.Vector3(handedness === 'left' ? -base.x : base.x, base.y, base.z)
}

/* The pin's DOM. A compact dot + finger label always; on hover or when its prose
   row is active, it opens the pressure role and the one-line cue. Only the pill
   is interactive so it never steals a drag from the ball. */
function GripPin({
  label,
  pressureRole,
  cue,
  active,
}: {
  label: string
  pressureRole?: string
  cue?: string
  active: boolean
}) {
  const [hover, setHover] = useState(false)
  const open = (hover || active) && Boolean(cue || pressureRole)

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={`pointer-events-auto flex items-center gap-1 whitespace-nowrap rounded-sm border bg-stage/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone transition-colors ${
          active ? 'border-powder/70' : 'border-bone/20'
        }`}
      >
        <span
          aria-hidden="true"
          className="rounded-full transition-all"
          style={{
            backgroundColor: PIN,
            width: active ? 8 : 6,
            height: active ? 8 : 6,
            boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${PIN} 30%, transparent)` : 'none',
          }}
        />
        {label}
      </span>
      {open ? (
        <span className="pointer-events-none max-w-[15rem] rounded-sm border border-powder/30 bg-stage/92 px-2 py-1 text-center">
          {pressureRole ? (
            <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-powder">
              {pressureRole}
            </span>
          ) : null}
          {cue ? (
            <span className="mt-0.5 block text-[11px] leading-snug text-bone-2">{cue}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

/* Procedural leather: a warm off-white albedo with faint mottling and a neutral
   normal map with fine pores and a few soft scuffs. Generated on a canvas so the
   ball isn't a sterile CG sphere, and never an external texture fetch. */
function makeLeatherTextures(): { albedo: THREE.CanvasTexture; normal: THREE.CanvasTexture } {
  const size = 1024

  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#EDE6D6'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 2.4 + 0.4
    ctx.globalAlpha = 0.05 + Math.random() * 0.06
    ctx.fillStyle = Math.random() > 0.5 ? '#FBF7EC' : '#D6CDB8'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  const albedo = new THREE.CanvasTexture(c)
  albedo.colorSpace = THREE.SRGBColorSpace
  albedo.anisotropy = 8

  const n = document.createElement('canvas')
  n.width = n.height = size
  const nx = n.getContext('2d')!
  nx.fillStyle = '#8080ff'
  nx.fillRect(0, 0, size, size)
  const img = nx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clampByte(128 + (Math.random() - 0.5) * 26)
    d[i + 1] = clampByte(128 + (Math.random() - 0.5) * 26)
  }
  nx.putImageData(img, 0, 0)
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 22 + 8
    const g = nx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(150,120,255,0.5)')
    g.addColorStop(1, 'rgba(128,128,255,0)')
    nx.fillStyle = g
    nx.beginPath()
    nx.arc(x, y, r, 0, Math.PI * 2)
    nx.fill()
  }
  const normal = new THREE.CanvasTexture(n)
  normal.anisotropy = 8

  return { albedo, normal }
}

export function Ball({
  fingerPlacement,
  showGrip = true,
  handedness = 'right',
  activeContact,
}: {
  fingerPlacement: GripContactPoint[]
  showGrip?: boolean
  handedness?: Handedness
  activeContact?: string
}) {
  const sphereRef = useRef<THREE.Mesh>(null)
  const stitchRef = useRef<THREE.InstancedMesh>(null)
  const occluders = useMemo<RefObject<THREE.Object3D>[]>(
    () => [sphereRef as RefObject<THREE.Object3D>],
    [],
  )

  const textures = useMemo(() => makeLeatherTextures(), [])
  useEffect(() => () => {
    textures.albedo.dispose()
    textures.normal.dispose()
  }, [textures])

  const seamCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        seamSamples(600, R).map((p) => new THREE.Vector3(p.x, p.y, p.z)),
        true,
        'catmullrom',
      ),
    [],
  )

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(seamCurve, 500, 0.012, 12, true),
    [seamCurve],
  )
  const stitchGeometry = useMemo(() => new THREE.CapsuleGeometry(0.011, 0.05, 4, 8), [])

  // Grip pins: each contact placed on the leather, oriented so its marker disc
  // sits on the surface, with the sourced cue carried up to the label.
  const pads = useMemo(
    () =>
      fingerPlacement.map((g) => {
        const base = mirrorBasePoint(seamPoint(g.seamT * Math.PI * 2, R), handedness)
        const nrm = base.clone().normalize()
        const isThumb = g.finger === 'thumb'
        const padQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm)
        const discPos = nrm.clone().multiplyScalar(R + g.lift + 0.005)
        const padPos = nrm.clone().multiplyScalar(R + g.lift + 0.045)
        const labelPos = nrm.clone().multiplyScalar(R + g.lift + 0.18)
        return {
          key: g.label,
          label: g.label,
          finger: g.finger,
          pressureRole: g.pressureRole,
          cue: g.cue,
          normal: nrm,
          quaternion: padQ,
          discPos,
          padPos,
          labelPos,
          discR: isThumb ? 0.34 : 0.27,
          scale: isThumb
            ? new THREE.Vector3(0.27, 0.34, 0.07)
            : new THREE.Vector3(0.18, 0.26, 0.07),
        } satisfies PadModel
      }),
    [fingerPlacement, handedness],
  )

  // 216 stitches: 108 pairs straddling the seam, each slanted into the herringbone V.
  useLayoutEffect(() => {
    const mesh = stitchRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const pos = new THREE.Vector3()
    const tan = new THREE.Vector3()
    const nrm = new THREE.Vector3()
    const bin = new THREE.Vector3()
    const yUp = new THREE.Vector3(0, 1, 0)
    const one = new THREE.Vector3(1, 1, 1)
    let idx = 0
    for (let i = 0; i < STITCH_PAIRS; i++) {
      const u = i / STITCH_PAIRS
      seamCurve.getPointAt(u, pos)
      seamCurve.getTangentAt(u, tan).normalize()
      nrm.copy(pos).normalize()
      bin.crossVectors(nrm, tan).normalize()
      for (let s = 0; s < 2; s++) {
        const side = s === 0 ? 1 : -1
        const center = pos.clone().multiplyScalar(1.004).add(bin.clone().multiplyScalar(0.034 * side))
        const slant = side * 0.62
        const dir = tan
          .clone()
          .multiplyScalar(Math.cos(slant))
          .add(bin.clone().multiplyScalar(Math.sin(slant) * side))
          .normalize()
        q.setFromUnitVectors(yUp, dir)
        m.compose(center, q, one)
        mesh.setMatrixAt(idx++, m)
      }
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [seamCurve])

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[R, 96, 72]} />
        <meshPhysicalMaterial
          map={textures.albedo}
          normalMap={textures.normal}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          color="#F1EADA"
          roughness={0.62}
          clearcoat={0.22}
          clearcoatRoughness={0.55}
          sheen={0.4}
          sheenRoughness={0.8}
          sheenColor="#FFFCF2"
          envMapIntensity={0.85}
        />
      </mesh>

      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial color="#C8102E" roughness={0.62} clearcoat={0.15} sheen={0.3} sheenColor="#E2544E" />
      </mesh>

      <instancedMesh ref={stitchRef} args={[stitchGeometry, undefined, STITCH_PAIRS * 2]}>
        <meshPhysicalMaterial color="#D11A33" roughness={0.5} clearcoat={0.25} sheen={0.5} sheenColor="#EC6A5C" />
      </instancedMesh>

      {showGrip
        ? pads.map((p) => (
            <group key={p.key}>
              {/* seating shadow — reads the marker as pressed in, not floating */}
              <mesh position={p.discPos} quaternion={p.quaternion}>
                <circleGeometry args={[p.discR, 40]} />
                <meshBasicMaterial color="#0B0B0D" transparent opacity={0.16} depthWrite={false} />
              </mesh>
              {/* the contact marker disc */}
              <mesh position={p.padPos} quaternion={p.quaternion} scale={p.scale}>
                <sphereGeometry args={[1, 40, 28]} />
                <meshPhysicalMaterial
                  color={PIN}
                  roughness={0.5}
                  clearcoat={0.35}
                  clearcoatRoughness={0.35}
                  sheen={0.6}
                  sheenColor="#DCE7F2"
                />
              </mesh>
              <Html
                position={p.labelPos}
                center
                occlude={occluders}
                zIndexRange={[20, 0]}
              >
                <GripPin
                  label={p.label}
                  pressureRole={p.pressureRole}
                  cue={p.cue}
                  active={activeContact === p.label}
                />
              </Html>
            </group>
          ))
        : null}
    </group>
  )
}
