import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { seamSamples, seamPoint } from '../../../lib/seam'
import type { SeamAnchoredPoint } from '../../../data/types'

/*
  The specimen geometry. Original, parametric, no downloaded model:
   - a warm aged-leather sphere (procedural albedo + normal, lit by the studio env)
   - a red seam tube swept along the shared figure-eight curve from seam.ts
   - 216 instanced stitches: 108 double-stitch pairs straddling the seam in the
     classic herringbone V
   - pressed fingertip pads anchored to seam parameters, each on a soft seating
     disc, with labels that occlude behind the ball
  The cover is one baseball for every pitch; only the grip contacts and the spin
  axis change. The 3D seam and the 2D schematic are the same math, so they can
  never disagree. The prettier stitches are still a seam-informed schematic — the
  cover geometry is not calibrated (docs/seam-calibration.md).
*/

const R = 1
const STITCH_PAIRS = 108

// Skin tones per finger for the pressed pads.
const SKIN: Record<SeamAnchoredPoint['finger'], string> = {
  index: '#e7b48d',
  middle: '#e3ad84',
  ring: '#dba87f',
  thumb: '#e1a87c',
  pinky: '#e3ad84',
}

const clampByte = (n: number) => Math.max(0, Math.min(255, n))

/* Procedural leather: a warm off-white albedo with faint mottling and a neutral
   normal map with fine pores and a few soft scuffs. Generated on a canvas so the
   ball isn't a sterile CG sphere, and never an external texture fetch. */
function makeLeatherTextures(): { albedo: THREE.CanvasTexture; normal: THREE.CanvasTexture } {
  const size = 1024

  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#efe8d8'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 2.4 + 0.4
    ctx.globalAlpha = 0.05 + Math.random() * 0.06
    ctx.fillStyle = Math.random() > 0.5 ? '#fffaf0' : '#d8cdb6'
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
}: {
  fingerPlacement: SeamAnchoredPoint[]
  showGrip?: boolean
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

  // Grip pads: each contact placed on the leather, oriented so its flat face sits
  // on the surface and its long axis runs along the finger's approach.
  const pads = useMemo(
    () =>
      fingerPlacement.map((g) => {
        const base = seamPoint(g.seamT * Math.PI * 2, R)
        const nrm = new THREE.Vector3(base.x, base.y, base.z).normalize()
        const isThumb = g.finger === 'thumb'
        const padQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm)
        const discPos = nrm.clone().multiplyScalar(R + g.lift + 0.005)
        const padPos = nrm.clone().multiplyScalar(R + g.lift + 0.045)
        const labelPos = nrm.clone().multiplyScalar(R + g.lift + 0.18)
        return {
          key: g.label,
          label: g.label,
          color: SKIN[g.finger] ?? '#e3ad84',
          quaternion: padQ,
          discPos,
          padPos,
          labelPos,
          discR: isThumb ? 0.34 : 0.27,
          scale: isThumb
            ? new THREE.Vector3(0.27, 0.34, 0.07)
            : new THREE.Vector3(0.18, 0.26, 0.07),
        }
      }),
    [fingerPlacement],
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
          color="#f4eee0"
          roughness={0.62}
          clearcoat={0.22}
          clearcoatRoughness={0.55}
          sheen={0.4}
          sheenRoughness={0.8}
          sheenColor="#fff6e8"
          envMapIntensity={0.85}
        />
      </mesh>

      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial color="#9e2b22" roughness={0.62} clearcoat={0.15} sheen={0.3} sheenColor="#c75046" />
      </mesh>

      <instancedMesh ref={stitchRef} args={[stitchGeometry, undefined, STITCH_PAIRS * 2]}>
        <meshPhysicalMaterial color="#c0392b" roughness={0.5} clearcoat={0.25} sheen={0.5} sheenColor="#e0685a" />
      </instancedMesh>

      {showGrip
        ? pads.map((p) => (
            <group key={p.key}>
              {/* seating shadow — reads the pad as pressed in, not floating */}
              <mesh position={p.discPos} quaternion={p.quaternion}>
                <circleGeometry args={[p.discR, 40]} />
                <meshBasicMaterial color="#2a1d10" transparent opacity={0.16} depthWrite={false} />
              </mesh>
              {/* the pressed fingertip pad */}
              <mesh position={p.padPos} quaternion={p.quaternion} scale={p.scale}>
                <sphereGeometry args={[1, 40, 28]} />
                <meshPhysicalMaterial
                  color={p.color}
                  roughness={0.5}
                  clearcoat={0.35}
                  clearcoatRoughness={0.35}
                  sheen={0.6}
                  sheenColor="#ffd9c0"
                />
              </mesh>
              <Html
                position={p.labelPos}
                center
                occlude={occluders}
                zIndexRange={[20, 0]}
                wrapperClass="pointer-events-none"
              >
                <span className="pointer-events-none flex select-none items-center gap-1 whitespace-nowrap rounded-sm border border-bone/20 bg-stage/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.label}
                </span>
              </Html>
            </group>
          ))
        : null}
    </group>
  )
}
