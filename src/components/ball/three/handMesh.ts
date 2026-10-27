import * as THREE from 'three'
import type { Handedness } from '../../../data/types'
import { DIGIT_WEIGHTS, HAND_INDICES, HAND_TONE, skinHand, type RiggedHand } from '../../../lib/handRig'
import { loopSubdivide } from '../../../lib/loopSubdivide'

/*
  The hand as it is drawn: the fitted pose skinned onto the mesh, smoothed one Loop
  step so no facet shows at the silhouette, pressed out of the ball where flesh
  meets leather, and mirrored for a lefty. Tone lives in vertex colours: a warm mid
  skin, the palm side lighter and pinker, the fingertips flushed, and a nail on each
  end joint that the skin material makes glossier than the skin around it.
*/

const SKIN = new THREE.Color('#C99880')
const PALM = new THREE.Color('#DDB09D')
const FLUSH = new THREE.Color('#BD7466')
const NAIL = new THREE.Color('#E6C4BA')
const CUTICLE = new THREE.Color('#A86B5C')

export const DIGIT_ORDER = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const
export type Digit = (typeof DIGIT_ORDER)[number]

export interface HandMesh {
  geometry: THREE.BufferGeometry
  /** How much each digit moves each vertex (5 per vertex), for the active tint. */
  digits: Float32Array
  /** Flush, palm side and nail (3 per vertex). */
  tone: Float32Array
}

export function buildHandMesh(hand: RiggedHand, handedness: Handedness): HandMesh {
  const {
    positions,
    indices,
    channels: [digits, tone],
  } = loopSubdivide(skinHand(hand), HAND_INDICES, [
    { data: DIGIT_WEIGHTS, size: 5 },
    { data: HAND_TONE, size: 3 },
  ])
  // flesh flattens against the leather instead of passing into it
  for (let v = 0; v < positions.length; v += 3) {
    const r = Math.hypot(positions[v], positions[v + 1], positions[v + 2])
    if (r < 1.003) {
      const k = 1.003 / r
      positions[v] *= k
      positions[v + 1] *= k
      positions[v + 2] *= k
    }
  }
  if (handedness === 'left') {
    for (let v = 0; v < positions.length; v += 3) positions[v] = -positions[v]
    for (let t = 0; t < indices.length; t += 3) {
      const b = indices[t + 1]
      indices[t + 1] = indices[t + 2]
      indices[t + 2] = b
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(positions.length), 3))
  const nail = new Float32Array(positions.length / 3)
  for (let v = 0; v < nail.length; v++) nail[v] = tone[v * 3 + 2]
  geometry.setAttribute('nail', new THREE.BufferAttribute(nail, 1))
  return { geometry, digits, tone }
}

/** Writes the skin tone, tinting one digit (by DIGIT_ORDER index, or -1) toward `tint`. */
export function paintHand({ geometry, digits, tone }: HandMesh, active: number, tint: THREE.Color) {
  const color = geometry.getAttribute('color') as THREE.BufferAttribute
  const c = new THREE.Color()
  for (let v = 0; v < color.count; v++) {
    const nail = tone[v * 3 + 2]
    c.copy(SKIN)
      .lerp(PALM, 0.55 * tone[v * 3 + 1])
      .lerp(FLUSH, 0.38 * Math.min(1, tone[v * 3]))
      // a darker rim where the nail meets the skin, then the nail itself
      .lerp(CUTICLE, 0.7 * nail * (1 - nail))
      .lerp(NAIL, 0.8 * nail)
    if (active >= 0) c.lerp(tint, 0.45 * Math.min(1, digits[v * 5 + active]))
    color.setXYZ(v, c.r, c.g, c.b)
  }
  color.needsUpdate = true
}

/** Matte skin with a soft sheen; the nails (the `nail` attribute) glossier, with a coat. */
export function makeSkinMaterial(): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.62,
    metalness: 0,
    sheen: 0.12,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#D99A80'),
    clearcoat: 0.05,
    clearcoatRoughness: 0.6,
  })
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float nail;\nvarying float vNail;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvNail = nail;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vNail;')
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.32, vNail);',
      )
      .replace(
        '#include <lights_physical_fragment>',
        '#include <lights_physical_fragment>\nmaterial.clearcoat = mix(material.clearcoat, 0.6, vNail);\nmaterial.clearcoatRoughness = mix(material.clearcoatRoughness, 0.22, vNail);',
      )
  }
  material.customProgramCacheKey = () => 'pitch-atlas-skin'
  return material
}
