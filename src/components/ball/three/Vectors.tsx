import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { SPIN_AXIS } from '../../../lib/seam'

/*
  The measured story, fixed in world space while the ball spins beneath it:
   - the near-horizontal backspin axis (the ball turns about this)
   - the Magnus force, straight up, the reason the pitch rides
  Labels are billboarded HTML so they stay legible at any camera angle.
*/

function Arrow({
  dir,
  length,
  color,
  glow = false,
  radius = 0.013,
}: {
  dir: THREE.Vector3
  length: number
  color: string
  glow?: boolean
  radius?: number
}) {
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()),
    [dir],
  )
  const head = 0.15
  const shaft = Math.max(0.001, length - head)
  const emissiveIntensity = glow ? 0.4 : 0
  return (
    <group quaternion={quaternion}>
      <mesh position={[0, shaft / 2, 0]}>
        <cylinderGeometry args={[radius, radius, shaft, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} roughness={0.5} />
      </mesh>
      <mesh position={[0, shaft + head / 2, 0]}>
        <coneGeometry args={[radius * 3, head, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} roughness={0.5} />
      </mesh>
    </group>
  )
}

const LABEL =
  'pointer-events-none select-none whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em]'

export function Vectors() {
  const axisDir = useMemo(() => new THREE.Vector3(SPIN_AXIS.x, SPIN_AXIS.y, SPIN_AXIS.z).normalize(), [])
  const axisNeg = useMemo(() => axisDir.clone().multiplyScalar(-1), [axisDir])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const axisLabelPos = useMemo(
    () => axisDir.clone().multiplyScalar(1.62).toArray() as [number, number, number],
    [axisDir],
  )

  return (
    <group>
      <Arrow dir={axisDir} length={1.5} color="#9aa0ab" />
      <Arrow dir={axisNeg} length={1.5} color="#9aa0ab" />

      <group position={[0, 1, 0]}>
        <Arrow dir={up} length={0.74} color="#a8322d" glow radius={0.016} />
      </group>

      <Html position={axisLabelPos} center zIndexRange={[15, 0]} wrapperClass="pointer-events-none">
        <span className={`${LABEL} text-dim`}>Backspin axis</span>
      </Html>
      <Html position={[0, 1.92, 0]} center zIndexRange={[15, 0]} wrapperClass="pointer-events-none">
        <span className={`${LABEL} text-seam`}>Magnus</span>
      </Html>
    </group>
  )
}
