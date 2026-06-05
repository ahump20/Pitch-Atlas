import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { v } from '../../../lib/seam'
import { magnusForceRender, magnusStrength } from '../../../lib/physics'
import type { PitchMotion } from '../../../data/types'

/*
  The measured story, fixed in world space while the ball spins beneath it:
   - the spin axis (the ball turns about this; the defining feature of any pitch)
   - the Magnus force, computed as spin x velocity, drawn in its true direction
     and scaled by the transverse-spin fraction. A four-seam's arrow points up
     and runs full length; a gyro slider's points weakly and short, because most
     of its spin does no Magnus work. The arrow is physics, not decoration.
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
  const head = Math.min(0.15, length * 0.5)
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

export function Vectors({ motion }: { motion: PitchMotion }) {
  const spin = motion.spinAxis

  const axisDir = useMemo(() => {
    const n = v.normalize(spin)
    return new THREE.Vector3(n.x, n.y, n.z)
  }, [spin])
  const axisNeg = useMemo(() => axisDir.clone().multiplyScalar(-1), [axisDir])

  // Magnus force: direction and length both derived from the spin axis.
  const force = useMemo(() => {
    const f = magnusForceRender(spin)
    const strength = magnusStrength(spin) // 0..1 transverse fraction
    return {
      dir: new THREE.Vector3(f.x, f.y, f.z),
      base: new THREE.Vector3(f.x, f.y, f.z), // emerges from the ball surface
      length: 0.34 + 0.5 * strength, // short for gyro, long for pure backspin
    }
  }, [spin])

  const axisLabelPos = useMemo(
    () => axisDir.clone().multiplyScalar(1.62).toArray() as [number, number, number],
    [axisDir],
  )
  const forceLabelPos = useMemo(
    () => force.base.clone().add(force.dir.clone().multiplyScalar(force.length + 0.22)).toArray() as [number, number, number],
    [force],
  )

  // Gyro red dot: where the spin axis points toward the viewer, the dot a hitter
  // would see in flight. Placed on the camera-facing axis pole.
  const redDotPos = useMemo(() => {
    const pole = axisDir.z >= 0 ? axisDir : axisNeg
    return pole.clone().multiplyScalar(1.02).toArray() as [number, number, number]
  }, [axisDir, axisNeg])

  return (
    <group>
      <Arrow dir={axisDir} length={1.5} color="#C7BEA8" />
      <Arrow dir={axisNeg} length={1.5} color="#C7BEA8" />

      <group position={force.base}>
        <Arrow dir={force.dir} length={force.length} color="#C8102E" glow radius={0.016} />
      </group>

      {motion.gyro ? (
        <mesh position={redDotPos}>
          <sphereGeometry args={[0.07, 18, 18]} />
          <meshStandardMaterial color="#C8102E" emissive="#C8102E" emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      ) : null}

      {/* For a gyro pitch the axis points at the viewer and reads as the red dot,
          so the separate axis label is suppressed to avoid colliding with it. */}
      {!motion.gyro ? (
        <Html position={axisLabelPos} center zIndexRange={[15, 0]} wrapperClass="pointer-events-none">
          <span className={`${LABEL} text-bone-2`}>Spin axis</span>
        </Html>
      ) : null}
      <Html position={forceLabelPos} center zIndexRange={[15, 0]} wrapperClass="pointer-events-none">
        <span className={`${LABEL} text-bone`}>{motion.forceLabel}</span>
      </Html>
      {motion.gyro ? (
        <Html position={redDotPos} center zIndexRange={[16, 0]} wrapperClass="pointer-events-none">
          <span className={`${LABEL} text-bone mt-7 block`}>Red dot</span>
        </Html>
      ) : null}
    </group>
  )
}
