/*
  One step of Loop subdivision over a triangle mesh: every triangle becomes four,
  and every vertex is pulled toward a smooth surface through its neighbours, so a
  low-poly mesh loses its facets at the silhouette. Extra per-vertex channels (for
  the hand, how much each digit moves a vertex) are carried along by averaging.
*/

export interface Subdivided {
  positions: Float32Array
  indices: Uint32Array
  channels: Float32Array[]
}

export function loopSubdivide(
  positions: Float32Array,
  indices: ArrayLike<number>,
  channels: { data: Float32Array; size: number }[] = [],
): Subdivided {
  const vCount = positions.length / 3
  const fCount = indices.length / 3
  // each edge once: its two ends, the vertices across it, and its new midpoint index
  const edgeOf = new Map<number, number>()
  const ends: number[] = []
  const across: number[][] = []
  const neighbours: Set<number>[] = Array.from({ length: vCount }, () => new Set())
  const edgeIndex = (a: number, b: number, c: number) => {
    const key = a < b ? a * vCount + b : b * vCount + a
    let e = edgeOf.get(key)
    if (e === undefined) {
      e = ends.length / 2
      edgeOf.set(key, e)
      ends.push(a, b)
      across.push([])
      neighbours[a].add(b)
      neighbours[b].add(a)
    }
    across[e].push(c)
    return e
  }
  const faceEdges = new Uint32Array(fCount * 3)
  for (let f = 0; f < fCount; f++) {
    const a = indices[f * 3]
    const b = indices[f * 3 + 1]
    const c = indices[f * 3 + 2]
    faceEdges[f * 3] = edgeIndex(a, b, c)
    faceEdges[f * 3 + 1] = edgeIndex(b, c, a)
    faceEdges[f * 3 + 2] = edgeIndex(c, a, b)
  }
  const eCount = ends.length / 2
  const total = vCount + eCount
  const out = new Float32Array(total * 3)
  const boundary = new Uint8Array(vCount)
  for (let e = 0; e < eCount; e++) {
    if (across[e].length === 1) {
      boundary[ends[e * 2]] = 1
      boundary[ends[e * 2 + 1]] = 1
    }
  }

  // the old vertices, smoothed toward their ring
  for (let v = 0; v < vCount; v++) {
    const ring = [...neighbours[v]]
    for (let k = 0; k < 3; k++) {
      const own = positions[v * 3 + k]
      if (boundary[v]) {
        out[v * 3 + k] = own
        continue
      }
      const n = ring.length
      const beta = n > 3 ? 3 / (8 * n) : 3 / 16
      let sum = 0
      for (const u of ring) sum += positions[u * 3 + k]
      out[v * 3 + k] = (1 - n * beta) * own + beta * sum
    }
  }
  // the new edge points
  for (let e = 0; e < eCount; e++) {
    const a = ends[e * 2]
    const b = ends[e * 2 + 1]
    const opp = across[e]
    for (let k = 0; k < 3; k++) {
      const mid = positions[a * 3 + k] + positions[b * 3 + k]
      out[(vCount + e) * 3 + k] =
        opp.length === 2 ? 0.375 * mid + 0.125 * (positions[opp[0] * 3 + k] + positions[opp[1] * 3 + k]) : 0.5 * mid
    }
  }

  const carried = channels.map(({ data, size }) => {
    const next = new Float32Array(total * size)
    next.set(data.subarray(0, vCount * size))
    for (let e = 0; e < eCount; e++) {
      for (let k = 0; k < size; k++) {
        next[(vCount + e) * size + k] = 0.5 * (data[ends[e * 2] * size + k] + data[ends[e * 2 + 1] * size + k])
      }
    }
    return next
  })

  const tris = new Uint32Array(fCount * 12)
  for (let f = 0; f < fCount; f++) {
    const a = indices[f * 3]
    const b = indices[f * 3 + 1]
    const c = indices[f * 3 + 2]
    const ab = vCount + faceEdges[f * 3]
    const bc = vCount + faceEdges[f * 3 + 1]
    const ca = vCount + faceEdges[f * 3 + 2]
    tris.set([a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca], f * 12)
  }
  return { positions: out, indices: tris, channels: carried }
}
