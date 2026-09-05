import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Ball } from '../ball/three/Ball'
import { Studio } from '../ball/three/Studio'
import { SEAM_VIEW_TILT } from '../../lib/seam'

/** The diagram uses a radius of 86 in a 240 square. Match that orthographic
 * projection exactly, without the study camera's additional grip-facing roll. */
export default function AlignedSeamScene() {
  const orientation = useMemo(() => new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(SEAM_VIEW_TILT.axis.x, SEAM_VIEW_TILT.axis.y, SEAM_VIEW_TILT.axis.z),
    SEAM_VIEW_TILT.angle,
  ), [])
  return (
    <Canvas orthographic frameloop="demand" dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true }}>
      <OrthographicCamera makeDefault manual position={[0, 0, 5]} near={0.1} far={20}
        left={-120 / 86} right={120 / 86} top={120 / 86} bottom={-120 / 86} />
      <Studio />
      <group quaternion={orientation}>
        <Ball fingerPlacement={[]} showGrip={false} pins={false} />
      </group>
    </Canvas>
  )
}
