import { seamPoint, v, type Vec3 } from './seam'
import type { GripView, SeamAnchoredPoint } from '../data/types'

type Quaternion = [number, number, number, number]
const multiply = (a: Quaternion, b: Quaternion): Quaternion => [
  a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
  a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
  a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
  a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2],
]
const turn = (axis: Vec3, angle: number): Quaternion => [axis.x*Math.sin(angle/2), axis.y*Math.sin(angle/2), axis.z*Math.sin(angle/2), Math.cos(angle/2)]

/** Presentation only. SVG and Three consume the same rotation; no seam/contact data changes. */
export function gripViewQuaternion(placement: SeamAnchoredPoint[], view: GripView, faceGrip = true): Quaternion {
  let faced: Quaternion = [0, 0, 0, 1]
  if (faceGrip && placement.length) {
    const lead = placement.filter(p => p.finger !== 'thumb')
    const mean = (lead.length ? lead : placement).reduce((sum, p) => v.add(sum, seamPoint(p.seamT * Math.PI * 2)), { x: 0, y: 0, z: 0 })
    if (v.length(mean) > 1e-6) {
      const from = v.normalize(mean), to = v.normalize({ x: 0, y: .22, z: 1 })
      const axis = v.cross(from, to), w = 1 + v.dot(from, to)
      if (w < 1e-6) {
        const perpendicular = v.normalize(v.cross(from, Math.abs(from.x) < .9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 }))
        faced = [perpendicular.x, perpendicular.y, perpendicular.z, 0]
      } else {
        const length = Math.hypot(axis.x, axis.y, axis.z, w)
        faced = [axis.x/length, axis.y/length, axis.z/length, w/length]
      }
      faced = multiply(turn({ x: 0, y: 0, z: 1 }, .05), faced)
    }
  }
  const [x,y,z] = view === 'side' ? [-.2,-.64,.03] : view === 'thumb' ? [.78,.16,.04] : [-.08,.02,.04]
  return multiply(multiply(multiply(turn({x:1,y:0,z:0},x), turn({x:0,y:1,z:0},y)), turn({x:0,y:0,z:1},z)), faced)
}
export function rotateByQuaternion(point: Vec3, q: Quaternion): Vec3 {
  const axis = { x: q[0], y: q[1], z: q[2] }
  const twice = v.scale(v.cross(axis, point), 2)
  return v.add(point, v.add(v.scale(twice, q[3]), v.cross(axis, twice)))
}
