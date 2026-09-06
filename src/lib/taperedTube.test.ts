import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { tubeFromSpine } from './taperedTube'

describe('finger surface visibility', () => {
  it('faces its triangles outward so front-face culling retains the finger exterior', () => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, .2), new THREE.Vector3(.2, 2, .5),
    ])
    const geometry = tubeFromSpine(curve, [.12, .18, .14], 24)
    const positions = geometry.getAttribute('position')
    const normals = geometry.getAttribute('normal')
    const indices = geometry.index!
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
    const surface = new THREE.Vector3(), expected = new THREE.Vector3()
    let checked = 0
    for (let i = 0; i < indices.count; i += 3) {
      const ia = indices.getX(i), ib = indices.getX(i + 1), ic = indices.getX(i + 2)
      a.fromBufferAttribute(positions, ia)
      b.fromBufferAttribute(positions, ib).sub(a)
      c.fromBufferAttribute(positions, ic).sub(a)
      surface.crossVectors(b, c)
      if (surface.lengthSq() < 1e-12) continue // rounded tips converge to a point
      expected.fromBufferAttribute(normals, ia)
      expect(surface.dot(expected)).toBeGreaterThan(0)
      checked++
    }
    expect(checked).toBeGreaterThan(100)
    geometry.dispose()
  })
})
