import * as THREE from 'three'

/* A tube that changes width along its length. Three's TubeGeometry is a constant
   radius, which is what made every finger a uniform sausage — a real finger
   narrows at the tip and swells into its knuckle, and a thumb thickens into the
   thenar over its whole run. Sweep the solver's own per-point radii instead. */
export function tubeFromSpine(
  curve: THREE.CatmullRomCurve3,
  radii: number[],
  segments: number,
  radial = 14,
  /** Round the ends off to a close instead of leaving them open. An open tube
      shows its hollow interior the moment whatever was meant to bury it moves a
      hair — which is what every finger did where it met the palm. */
  roundEnds = 0.06,
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(segments, false)
  const position: number[] = []
  const normal: number[] = []
  const index: number[] = []
  const last = radii.length - 1

  for (let i = 0; i <= segments; i++) {
    const u = i / segments
    // sample the authored radius profile at this arc-length fraction
    const f = u * last
    const lo = Math.min(last, Math.floor(f))
    const hi = Math.min(last, lo + 1)
    const taper = roundEnds
      ? Math.sin(Math.min(1, u / roundEnds) * (Math.PI / 2)) *
        Math.sin(Math.min(1, (1 - u) / roundEnds) * (Math.PI / 2))
      : 1
    const r = (radii[lo] + (radii[hi] - radii[lo]) * (f - lo)) * taper

    const p = curve.getPointAt(u)
    const N = frames.normals[Math.min(i, segments - 1)]
    const B = frames.binormals[Math.min(i, segments - 1)]
    for (let j = 0; j <= radial; j++) {
      const theta = (j / radial) * Math.PI * 2
      const nx = Math.cos(theta) * N.x + Math.sin(theta) * B.x
      const ny = Math.cos(theta) * N.y + Math.sin(theta) * B.y
      const nz = Math.cos(theta) * N.z + Math.sin(theta) * B.z
      position.push(p.x + nx * r, p.y + ny * r, p.z + nz * r)
      normal.push(nx, ny, nz)
    }
  }

  const stride = radial + 1
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * stride + j
      const b = a + stride
      // Positive cos follows N toward B; reverse the legacy inward winding.
      index.push(a, a + 1, b, b, a + 1, b + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3))
  geo.setIndex(index)
  return geo
}
