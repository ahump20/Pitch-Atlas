import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { seamSamples } from '../../../lib/seam'
import { Hand } from './Hand'
import type { GripContactModel, Handedness } from '../../../data/types'

/*
  The specimen geometry. Original, parametric, no downloaded model:
   - a warm pebbled-cowhide sphere (procedural albedo + multi-octave grain normal +
     a roughness map, all lit by the studio env). The seam's own channel and
     contact shadow are baked into those maps so the thread reads as set into the
     leather, not painted on top.
   - a raised red waxed-thread seam tube swept along the shared figure-eight curve
     from seam.ts
   - 216 instanced stitches: 108 double-stitch pairs straddling the seam in the
     classic herringbone V, given a flatter waxed cross-section with a brighter top
   - the specimen hand: solved finger spines from gripPose.ts rendered by Hand.tsx,
     each fingertip carrying its sourced label pin
  The hand is a cast of the authored, sourced contacts, so "hold it like this"
  finally shows a hold. The cover is one baseball for every pitch; only the grip
  and the spin axis change. The 3D seam and the 2D schematic are the same math, so
  they can never disagree — and the leather, light, and thread are 3D finish only,
  so the schematic never needs to follow them.
*/

const R = 1
const STITCH_PAIRS = 108
const TEX = 1024

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)))

/** Equirectangular UV of a unit point under three's SphereGeometry mapping:
    vertex = (-cos(phi)sin(theta), cos(theta), sin(phi)sin(theta)), so phi reads
    off (z, -x) and theta off y. This is how the seam channel lands exactly under
    the tube — same point, same surface. */
function pointToUV(p: { x: number; y: number; z: number }): { u: number; v: number } {
  const len = Math.hypot(p.x, p.y, p.z) || 1
  const y = p.y / len
  let u = Math.atan2(p.z / len, -p.x / len) / (Math.PI * 2)
  if (u < 0) u += 1
  const vv = Math.acos(Math.max(-1, Math.min(1, y))) / Math.PI
  return { u, v: vv }
}

/* fractional Brownian value noise, seeded and tileable on the U axis so the
   leather grain has no visible wrap seam. Cheap, deterministic, no deps. */
function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
    return s - Math.floor(s)
  }
  const smooth = (t: number) => t * t * (3 - 2 * t)
  const valueNoise = (x: number, y: number, period: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    // wrap X across `period` so the texture tiles seamlessly left-to-right
    const wrap = (n: number) => ((n % period) + period) % period
    const a = hash(wrap(xi), yi)
    const b = hash(wrap(xi + 1), yi)
    const c = hash(wrap(xi), yi + 1)
    const d = hash(wrap(xi + 1), yi + 1)
    const ux = smooth(xf)
    const uy = smooth(yf)
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
  }
  return (u: number, v: number, baseFreq: number, octaves: number) => {
    let amp = 0.5
    let freq = baseFreq
    let sum = 0
    let norm = 0
    for (let o = 0; o < octaves; o++) {
      sum += amp * valueNoise(u * freq, v * freq, freq)
      norm += amp
      amp *= 0.5
      freq *= 2
    }
    return sum / norm
  }
}

interface LeatherMaps {
  albedo: THREE.CanvasTexture
  normal: THREE.CanvasTexture
  roughness: THREE.CanvasTexture
}

/* Procedural pebbled cowhide. Three maps, baked together so they agree:
   - albedo: warm off-white hide with low-frequency mottling and a faint seam-side
     soiling band (where a real ball darkens along the stitching)
   - normal: multi-octave grain that reads as visible pebble, plus a recessed seam
     channel carved along the seam path (the thread sits down in leather)
   - roughness: believable variation — the pebble tops are a touch glossier than
     the valleys, and the seam channel is rougher (waxed thread aside, the leather
     lip is matte). All <=1024px, generated once, reused. */
function makeLeatherMaps(): LeatherMaps {
  const size = TEX
  const grain = makeNoise(11)
  const blotch = makeNoise(29)

  // Precompute a per-texel seam-distance field (in UV-ish units) so the channel,
  // its AO, and its roughness all read from one source of truth.
  const seam = seamSamples(900, 1)
  const seamUV = seam.map(pointToUV)
  // bucket seam UVs into a coarse grid for a fast nearest-distance lookup
  const GRID = 64
  const buckets: number[][] = Array.from({ length: GRID * GRID }, () => [])
  seamUV.forEach((p, i) => {
    const gx = Math.min(GRID - 1, Math.floor(p.u * GRID))
    const gy = Math.min(GRID - 1, Math.floor(p.v * GRID))
    buckets[gy * GRID + gx].push(i)
  })
  const seamDistAt = (u: number, vv: number): number => {
    const gx = Math.floor(u * GRID)
    const gy = Math.floor(vv * GRID)
    let best = 1
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const bx = ((gx + dx) % GRID + GRID) % GRID // wrap U
        const by = gy + dy
        if (by < 0 || by >= GRID) continue
        for (const i of buckets[by * GRID + bx]) {
          const s = seamUV[i]
          let du = Math.abs(s.u - u)
          if (du > 0.5) du = 1 - du // shortest path around the wrap
          const dv = s.v - vv
          const d = Math.hypot(du, dv)
          if (d < best) best = d
        }
      }
    }
    return best
  }

  const CHANNEL = 0.018 // half-width of the recessed seam lane, in UV units

  // ── albedo ────────────────────────────────────────────────────────────────
  const ca = document.createElement('canvas')
  ca.width = ca.height = size
  const ax = ca.getContext('2d')!
  const aimg = ax.createImageData(size, size)
  const ad = aimg.data
  // base warm hide
  const baseR = 238
  const baseG = 230
  const baseB = 214
  for (let y = 0; y < size; y++) {
    const vv = y / size
    for (let x = 0; x < size; x++) {
      const u = x / size
      const idx = (y * size + x) * 4
      const fine = grain(u, vv, 220, 4) // pebble-scale
      const wide = blotch(u, vv, 7, 3) // slow mottle
      const tone = (fine - 0.5) * 16 + (wide - 0.5) * 14
      // soiling that hugs the seam channel — real covers gray along the stitches
      const sd = seamDistAt(u, vv)
      const soil = sd < CHANNEL * 3 ? (1 - sd / (CHANNEL * 3)) * 12 : 0
      // recessed channel reads slightly darker (less light reaches the groove)
      const groove = sd < CHANNEL ? (1 - sd / CHANNEL) * 26 : 0
      ad[idx] = clampByte(baseR + tone - soil * 1.1 - groove)
      ad[idx + 1] = clampByte(baseG + tone - soil - groove)
      ad[idx + 2] = clampByte(baseB + tone * 0.9 - soil * 0.8 - groove * 0.9)
      ad[idx + 3] = 255
    }
  }
  ax.putImageData(aimg, 0, 0)
  const albedo = new THREE.CanvasTexture(ca)
  albedo.colorSpace = THREE.SRGBColorSpace
  albedo.anisotropy = 8
  albedo.wrapS = THREE.RepeatWrapping

  // ── normal ────────────────────────────────────────────────────────────────
  // height field -> tangent-space normal by finite differences, so the pebble
  // and the seam groove are lit consistently with the albedo above.
  const cn = document.createElement('canvas')
  cn.width = cn.height = size
  const nx = cn.getContext('2d')!
  const nimg = nx.createImageData(size, size)
  const nd = nimg.data
  const heightAt = (u: number, vv: number): number => {
    // pebble grain (multi-octave) minus a carved seam channel
    const pebble = grain(u, vv, 200, 5)
    const sd = seamDistAt(u, vv)
    const channel = sd < CHANNEL ? Math.cos((sd / CHANNEL) * Math.PI * 0.5) : 0
    return pebble - channel * 1.4
  }
  const eps = 1 / size
  const STRENGTH = 2.1
  for (let y = 0; y < size; y++) {
    const vv = y / size
    for (let x = 0; x < size; x++) {
      const u = x / size
      const idx = (y * size + x) * 4
      const hL = heightAt((u - eps + 1) % 1, vv)
      const hR = heightAt((u + eps) % 1, vv)
      const hD = heightAt(u, Math.max(0, vv - eps))
      const hU = heightAt(u, Math.min(1, vv + eps))
      const dx = (hL - hR) * STRENGTH
      const dy = (hD - hU) * STRENGTH
      const nz = 1
      const inv = 1 / Math.hypot(dx, dy, nz)
      nd[idx] = clampByte(128 + (dx * inv) * 127)
      nd[idx + 1] = clampByte(128 + (dy * inv) * 127)
      nd[idx + 2] = clampByte(128 + (nz * inv) * 127)
      nd[idx + 3] = 255
    }
  }
  nx.putImageData(nimg, 0, 0)
  const normal = new THREE.CanvasTexture(cn)
  normal.anisotropy = 8
  normal.wrapS = THREE.RepeatWrapping

  // ── roughness ───────────────────────────────────────────────────────────────
  const cr = document.createElement('canvas')
  cr.width = cr.height = size
  const rx = cr.getContext('2d')!
  const rimg = rx.createImageData(size, size)
  const rd = rimg.data
  for (let y = 0; y < size; y++) {
    const vv = y / size
    for (let x = 0; x < size; x++) {
      const u = x / size
      const idx = (y * size + x) * 4
      const fine = grain(u, vv, 200, 5)
      // pebble tops a touch glossier (lower roughness), valleys matte
      let rough = 0.52 + (0.5 - fine) * 0.22
      const sd = seamDistAt(u, vv)
      if (sd < CHANNEL) rough += (1 - sd / CHANNEL) * 0.16 // matte leather lip
      const r8 = clampByte(rough * 255)
      rd[idx] = r8
      rd[idx + 1] = r8
      rd[idx + 2] = r8
      rd[idx + 3] = 255
    }
  }
  rx.putImageData(rimg, 0, 0)
  const roughness = new THREE.CanvasTexture(cr)
  roughness.anisotropy = 4
  roughness.wrapS = THREE.RepeatWrapping

  return { albedo, normal, roughness }
}

export function Ball({
  fingerPlacement,
  showGrip = true,
  handedness = 'right',
  activeContact,
}: {
  fingerPlacement: GripContactModel[]
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

  const textures = useMemo(() => makeLeatherMaps(), [])
  useEffect(
    () => () => {
      textures.albedo.dispose()
      textures.normal.dispose()
      textures.roughness.dispose()
    },
    [textures],
  )

  const seamCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        seamSamples(600, R).map((p) => new THREE.Vector3(p.x, p.y, p.z)),
        true,
        'catmullrom',
      ),
    [],
  )

  // raised waxed thread: a hair fatter than before and seated in the leather
  // channel baked into the maps above, so it reads proud of a groove, not glued
  // onto a flat surface.
  const tubeGeometry = useMemo(
    // 18 radial segments (up from 14): a rounder cross-section so the raised
    // waxed thread keeps its bead under the raking key light at large scale.
    () => new THREE.TubeGeometry(seamCurve, 500, 0.0135, 18, true),
    [seamCurve],
  )
  // flatter cross-section than a round bead: a wide, low waxed stitch. The
  // instance transform below scales it thin in the radial axis after orienting.
  const stitchGeometry = useMemo(() => new THREE.CapsuleGeometry(0.0125, 0.05, 5, 10), [])

  // Free the imperatively-built seam geometries on unmount. R3F auto-disposes
  // JSX-declared geometries, but these two are made with useMemo and handed in by
  // ref, so they leak GPU memory across pitch-to-pitch navigations unless freed
  // here — the same cleanup the leather maps get above and the finger tubes get
  // in Hand.tsx.
  useEffect(
    () => () => {
      tubeGeometry.dispose()
      stitchGeometry.dispose()
    },
    [tubeGeometry, stitchGeometry],
  )

  // 216 stitches: 108 pairs straddling the seam, each slanted into the herringbone
  // V and flattened against the leather so it reads as waxed thread, not a bead.
  useLayoutEffect(() => {
    const mesh = stitchRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const qFlat = new THREE.Quaternion()
    const pos = new THREE.Vector3()
    const tan = new THREE.Vector3()
    const nrm = new THREE.Vector3()
    const bin = new THREE.Vector3()
    const yUp = new THREE.Vector3(0, 1, 0)
    // press the capsule down toward the leather: thin along the surface normal,
    // a touch wider across, full length along the thread.
    const flatten = new THREE.Vector3(1.25, 1, 0.55)
    let idx = 0
    for (let i = 0; i < STITCH_PAIRS; i++) {
      const u = i / STITCH_PAIRS
      seamCurve.getPointAt(u, pos)
      seamCurve.getTangentAt(u, tan).normalize()
      nrm.copy(pos).normalize()
      bin.crossVectors(nrm, tan).normalize()
      for (let s = 0; s < 2; s++) {
        const side = s === 0 ? 1 : -1
        const center = pos
          .clone()
          .multiplyScalar(1.005)
          .add(bin.clone().multiplyScalar(0.034 * side))
        const slant = side * 0.62
        const dir = tan
          .clone()
          .multiplyScalar(Math.cos(slant))
          .add(bin.clone().multiplyScalar(Math.sin(slant) * side))
          .normalize()
        q.setFromUnitVectors(yUp, dir)
        // align the capsule's "thin" local axis with the surface normal so the
        // flatten scale presses it into the leather rather than sideways.
        qFlat.setFromUnitVectors(yUp, nrm)
        q.multiply(qFlat.invert())
        m.compose(center, q, flatten)
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
          normalScale={new THREE.Vector2(0.85, 0.85)}
          roughnessMap={textures.roughness}
          color="#F1EADA"
          roughness={1}
          clearcoat={0.35}
          clearcoatRoughness={0.42}
          sheen={0.55}
          sheenRoughness={0.7}
          sheenColor="#FFF7E6"
          envMapIntensity={1.0}
        />
      </mesh>

      {/* the seam: raised waxed red thread, glossier than the matte leather lip.
          tighter clearcoat roughness sharpens the specular line the rim light rakes. */}
      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial
          color="#B81127"
          roughness={0.42}
          clearcoat={0.5}
          clearcoatRoughness={0.22}
          sheen={0.4}
          sheenColor="#E2544E"
        />
      </mesh>

      {/* 216 waxed stitches: flatter, glossier on top, brighter than the seam line.
          a low deep-red emissive reads as the waxed crown catching rim light — a
          glint, not a glow — and the sharper clearcoat crisps the thread's specular. */}
      <instancedMesh ref={stitchRef} args={[stitchGeometry, undefined, STITCH_PAIRS * 2]}>
        <meshPhysicalMaterial
          color="#D6213B"
          roughness={0.34}
          clearcoat={0.6}
          clearcoatRoughness={0.16}
          sheen={0.5}
          sheenColor="#F39C92"
          emissive="#3a0810"
          emissiveIntensity={0.15}
        />
      </instancedMesh>

      {showGrip && fingerPlacement.length > 0 ? (
        <Hand
          contacts={fingerPlacement}
          handedness={handedness}
          activeContact={activeContact}
          occluders={occluders}
        />
      ) : null}
    </group>
  )
}
