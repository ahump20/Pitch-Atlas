// Regenerates src/lib/handModel.ts: the rigged hand the 3D grip view poses on the ball.
// Source: generic-hand/right.glb from @webxr-input-profiles/assets (MIT, (c) 2019 Amazon;
// the output carries the notice in a comment the minifier keeps, so it ships with the
// site). Run: node scripts/build-hand-model.mjs [path/to/right.glb]
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Matrix4, Quaternion, Vector3 } from 'three'

const SOURCE = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0.20/dist/profiles/generic-hand/right.glb'
const OUT = fileURLToPath(new URL('../src/lib/handModel.ts', import.meta.url))

const buf = process.argv[2]
  ? readFileSync(process.argv[2])
  : Buffer.from(await (await fetch(SOURCE)).arrayBuffer())
const jsonLen = buf.readUInt32LE(12)
const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString())
const bin = buf.subarray(20 + jsonLen + 8)

function read(accessorIndex) {
  const a = gltf.accessors[accessorIndex]
  const view = gltf.bufferViews[a.bufferView]
  const width = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }[a.type]
  const Ctor = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }[a.componentType]
  const start = (view.byteOffset ?? 0) + (a.byteOffset ?? 0)
  const stride = view.byteStride ?? width * Ctor.BYTES_PER_ELEMENT
  const out = []
  for (let i = 0; i < a.count; i++) {
    const row = new Ctor(bin.buffer.slice(bin.byteOffset + start + i * stride, bin.byteOffset + start + i * stride + width * Ctor.BYTES_PER_ELEMENT))
    const scale = a.normalized ? { 5121: 255, 5123: 65535 }[a.componentType] : 1
    out.push(Array.from(row, (x) => x / scale))
  }
  return out
}

const skin = gltf.skins[0]
const jointNames = skin.joints.map((j) => gltf.nodes[j].name)
// Every joint node is a direct child of an untransformed Armature, so each inverse
// bind matrix inverts to that joint's rest transform in the mesh's own frame.
const rest = read(skin.inverseBindMatrices).map((m) => {
  const p = new Vector3()
  const q = new Quaternion()
  new Matrix4().fromArray(m).invert().decompose(p, q, new Vector3())
  return { p, q }
})

const prim = gltf.meshes[0].primitives[0]
const pos = read(prim.attributes.POSITION)
const joints = read(prim.attributes.JOINTS_0)
const weights = read(prim.attributes.WEIGHTS_0)
const tris = read(prim.indices).flat()

// Weld the copies a UV seam leaves behind: shading and subdivision want one vertex per point.
const key = (p) => p.map((x) => Math.round(x * 1e6)).join(',')
const welded = new Map()
const remap = []
const P = []
const J = []
const W = []
pos.forEach((p, i) => {
  const k = key(p)
  if (!welded.has(k)) {
    welded.set(k, P.length)
    P.push(p)
    J.push(joints[i])
    W.push(weights[i])
  }
  remap.push(welded.get(k))
})
// The model stops at a flat cap just past the wrist, which reads as a severed hand
// whenever the wrist is in frame. Lift the cap off, carry the forearm on off the
// stage, and close it again out there.
const arm = new Vector3(0, 1, 0) // the rest hand hangs fingers-down: the forearm runs +y
const T = []
for (let t = 0; t < tris.length; t += 3) {
  const [a, b, c] = [tris[t], tris[t + 1], tris[t + 2]].map((i) => remap[i])
  const [pa, pb, pc] = [a, b, c].map((i) => new Vector3(...P[i]))
  const n = pb.clone().sub(pa).cross(pc.clone().sub(pa)).normalize()
  if (n.dot(arm) > 0.8 && Math.min(pa.y, pb.y, pc.y) > 0.04) continue
  T.push(a, b, c)
}

const edges = new Map()
for (let t = 0; t < T.length; t += 3) {
  for (let e = 0; e < 3; e++) {
    const a = T[t + e]
    const b = T[t + ((e + 1) % 3)]
    const k = a < b ? `${a}_${b}` : `${b}_${a}`
    const rec = edges.get(k) ?? { a, b, n: 0 }
    rec.n++
    edges.set(k, rec)
  }
}
const boundary = [...edges.values()].filter((e) => e.n === 1)
const next = new Map(boundary.map((e) => [e.a, e.b]))
const loops = []
const seen = new Set()
for (const e of boundary) {
  if (seen.has(e.a)) continue
  const loop = []
  let v = e.a
  while (!seen.has(v)) {
    seen.add(v)
    loop.push(v)
    v = next.get(v)
  }
  loops.push(loop)
}
if (loops.length !== 1) throw new Error(`expected one open edge loop (the wrist cut), found ${loops.length}`)
const cut = loops[0]
const centre = cut.reduce((c, i) => c.add(new Vector3(...P[i])), new Vector3()).divideScalar(cut.length)
const RINGS = 4
const REACH = 0.1 // metres of forearm past the cut
const WIDEN = 0.16 // a forearm thickens away from the wrist
const wristJoint = jointNames.indexOf('wrist')
let ring = cut
for (let r = 1; r <= RINGS; r++) {
  const t = r / RINGS
  const fresh = cut.map((i) => {
    const off = new Vector3(...P[i]).sub(centre).multiplyScalar(1 + WIDEN * Math.sqrt(t))
    const p = centre.clone().add(off).addScaledVector(arm, REACH * t)
    P.push(p.toArray())
    J.push([wristJoint, 0, 0, 0])
    W.push([1, 0, 0, 0])
    return P.length - 1
  })
  // each open edge runs a→b inside its triangle; the new quad takes it b→a
  for (let k = 0; k < ring.length; k++) {
    const a = ring[k]
    const b = ring[(k + 1) % ring.length]
    const a2 = fresh[k]
    const b2 = fresh[(k + 1) % ring.length]
    T.push(b, a, a2, b, a2, b2)
  }
  ring = fresh
}
const end = centre.clone().addScaledVector(arm, REACH)
P.push(end.toArray())
J.push([wristJoint, 0, 0, 0])
W.push([1, 0, 0, 0])
const cap = P.length - 1
for (let k = 0; k < ring.length; k++) T.push(ring[(k + 1) % ring.length], ring[k], cap)

// Per-joint skin depth, measured off the mesh in each bone's own frame (forward -z,
// back of the finger +y): how far the palmar skin, the back and the sides sit off
// the bone, and how far the fingertip runs past the tip joint.
const local = (vi, j) => new Vector3(...P[vi]).sub(rest[j].p).applyQuaternion(rest[j].q.clone().invert())
const owned = (j, min = 0.5) =>
  P.map((_, vi) => vi).filter((vi) => J[vi].reduce((s, jj, k) => s + (jj === j ? W[vi][k] : 0), 0) >= min)
const depth = jointNames.map((name, j) => {
  const verts = owned(j, 0.5)
  if (!verts.length) return [0, 0, 0, 0]
  const pts = verts.map((vi) => local(vi, j))
  const along = (p) => -p.z
  // a distal bone is measured at its pad, under the tip joint; the rest at their root
  const at = name.endsWith('distal') ? rest[j + 1].p.distanceTo(rest[j].p) : 0
  const near = pts.filter((p) => Math.abs(along(p) - at) < 0.004)
  const band = near.length >= 6 ? near : pts
  const palmar = Math.max(...band.map((p) => -p.y))
  const back = Math.max(...band.map((p) => p.y))
  const side = Math.max(...band.map((p) => Math.abs(p.x)))
  const reach = Math.max(...pts.map(along))
  return [palmar, back, side, reach].map((x) => +x.toFixed(4))
})

const b64 = (Typed, rows) => Buffer.from(new Typed(rows.flat()).buffer).toString('base64')
const weightBytes = W.map((w) => {
  const sum = w.reduce((a, b) => a + b, 0)
  const q = w.map((x) => Math.round((x / sum) * 255))
  q[0] += 255 - q.reduce((a, b) => a + b, 0)
  return q
})

const fmt = (xs) => `[${xs.map((x) => +x.toFixed(6)).join(', ')}]`
writeFileSync(
  OUT,
  `/*! The hand mesh and rig below are generic-hand/right.glb from
@webxr-input-profiles/assets 1.0.20, under this licence:

MIT License

Copyright (c) 2019 Amazon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next
paragraph) shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF
OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// Generated by scripts/build-hand-model.mjs — do not edit by hand. Welded at its UV
// seams and given a closed forearm; everything else is the source geometry. Units
// are metres.

/** Joint names in WebXR hand order: each joint's -z runs down the bone toward the
    fingertip and its +y out of the back of the hand. */
export const HAND_JOINTS = ${JSON.stringify(jointNames)} as const

export type HandJoint = (typeof HAND_JOINTS)[number]

/** Rest pose (the open hand, fingers hanging down -y, back of the hand +x), per
    joint: position xyz then rotation quaternion xyzw. */
export const HAND_REST: readonly (readonly number[])[] = [
${rest.map(({ p, q }) => `  ${fmt([...p.toArray(), q.x, q.y, q.z, q.w])},`).join('\n')}
]

/** Skin depth off each bone, measured from the mesh in the bone's frame: palmar
    side, back, half-width (at the bone's root, or for a distal bone at the pad under
    its tip joint), and how far the skin runs on down the bone. */
export const HAND_DEPTH: readonly (readonly number[])[] = [
${depth.map((d) => `  ${fmt(d)},`).join('\n')}
]

export const HAND_MESH = {
  vertexCount: ${P.length},
  /** Float32 xyz per vertex. */
  positions: '${b64(Float32Array, P)}',
  /** Uint16 triangle list. */
  indices: '${b64(Uint16Array, [T])}',
  /** Uint8 x4 joint indices per vertex. */
  joints: '${b64(Uint8Array, J)}',
  /** Uint8 x4 weights per vertex, summing to 255. */
  weights: '${b64(Uint8Array, weightBytes)}',
}
`,
)
console.log(`wrote ${OUT}: ${P.length} vertices, ${T.length / 3} triangles (from ${pos.length} / ${tris.length / 3})`)
console.table(jointNames.map((n, j) => ({ n, palmar: depth[j][0], back: depth[j][1], side: depth[j][2], reach: depth[j][3] })))
