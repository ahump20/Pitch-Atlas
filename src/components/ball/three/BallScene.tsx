import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Ball } from './Ball'
import { Vectors } from './Vectors'
import { SPIN_AXIS } from '../../../lib/seam'

/*
  The 3D specimen. frameloop is on-demand: the spin loop self-sustains by
  invalidating each frame while active, and halts the moment the ball is paused
  (reduced motion) or scrolled off screen. OrbitControls invalidates on drag, so
  inspection works with zero idle GPU cost.
*/
function SpinGroup({ active, children }: { active: boolean; children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  const axis = useMemo(
    () => new THREE.Vector3(SPIN_AXIS.x, SPIN_AXIS.y, SPIN_AXIS.z).normalize(),
    [],
  )
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    if (active) invalidate()
  }, [active, invalidate])

  useFrame((_, delta) => {
    if (!active) return
    const g = groupRef.current
    if (!g) return
    // clamp delta so a backgrounded tab does not snap the ball on return
    g.rotateOnWorldAxis(axis, Math.min(delta, 0.05) * 0.55)
    invalidate()
  })

  return <group ref={groupRef}>{children}</group>
}

export default function BallScene({ spin, active }: { spin: boolean; active: boolean }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 4.6], fov: 40 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={2.3} />
      <directionalLight position={[-5, 1, -4]} intensity={0.7} />

      <group scale={0.8}>
        <SpinGroup active={spin && active}>
          <Ball />
        </SpinGroup>
        <Vectors />
      </group>

      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
      />
    </Canvas>
  )
}
