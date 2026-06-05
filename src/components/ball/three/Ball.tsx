import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { seamSamples, seamPoint } from '../../../lib/seam'
import type { SeamAnchoredPoint } from '../../../data/types'

/*
  The specimen geometry. Original, parametric, no downloaded model:
   - leather sphere
   - seam tube swept along the shared figure-eight curve from seam.ts
   - 108 instanced stitches placed and slanted along that same curve
   - grip markers anchored to seam parameters, with labels that occlude behind
     the ball (Phase C)
  The cover is one baseball for every pitch; only the grip contacts and the spin
  axis change. The 3D seam and the 2D schematic are the same math, so they can
  never disagree.
*/

const R = 1
const STITCHES = 108
const SEAM_SAMPLES = 256

export function Ball({
  fingerPlacement,
  showGrip = true,
}: {
  fingerPlacement: SeamAnchoredPoint[]
  showGrip?: boolean
}) {
  const sphereRef = useRef<THREE.Mesh>(null)
  const stitchRef = useRef<THREE.InstancedMesh>(null)
  const occluders = useMemo<RefObject<THREE.Object3D>[]>(
    () => [sphereRef as RefObject<THREE.Object3D>],
    [],
  )

  const seamCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        seamSamples(SEAM_SAMPLES, R).map((p) => new THREE.Vector3(p.x, p.y, p.z)),
        true,
        'catmullrom',
      ),
    [],
  )

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(seamCurve, 360, 0.021, 10, true),
    [seamCurve],
  )
  const stitchGeometry = useMemo(() => new THREE.BoxGeometry(0.014, 0.072, 0.012), [])
  const stitchMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b5392f', roughness: 0.55, metalness: 0.05 }),
    [],
  )

  const grips = useMemo(
    () =>
      fingerPlacement.map((g) => {
        const t = g.seamT * Math.PI * 2
        const base = seamPoint(t, R)
        const lift = 1 + g.lift + 0.05
        return {
          key: g.label,
          label: g.label,
          position: new THREE.Vector3(base.x * lift, base.y * lift, base.z * lift),
        }
      }),
    [fingerPlacement],
  )

  useLayoutEffect(() => {
    const mesh = stitchRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const pos = new THREE.Vector3()
    const tan = new THREE.Vector3()
    const nrm = new THREE.Vector3()
    const bin = new THREE.Vector3()
    for (let i = 0; i < STITCHES; i++) {
      const u = i / STITCHES
      seamCurve.getPointAt(u, pos)
      seamCurve.getTangentAt(u, tan).normalize()
      nrm.copy(pos).normalize()
      bin.crossVectors(nrm, tan).normalize()
      const slant = (i % 2 === 0 ? 1 : -1) * 0.5
      q.setFromAxisAngle(nrm, slant)
      tan.applyQuaternion(q)
      bin.applyQuaternion(q)
      m.makeBasis(tan, bin, nrm)
      m.setPosition(pos.multiplyScalar(1.006))
      mesh.setMatrixAt(i, m)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [seamCurve])

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[R, 64, 48]} />
        <meshStandardMaterial color="#14161c" roughness={0.82} metalness={0.04} />
      </mesh>

      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color="#a8322d" roughness={0.45} metalness={0.06} emissive="#3a1411" emissiveIntensity={0.35} />
      </mesh>

      <instancedMesh ref={stitchRef} args={[stitchGeometry, stitchMaterial, STITCHES]} />

      {showGrip
        ? grips.map((g) => (
            <group key={g.key} position={g.position}>
              <mesh>
                <sphereGeometry args={[0.05, 20, 20]} />
                <meshStandardMaterial color="#d8b4a0" roughness={0.4} emissive="#a8322d" emissiveIntensity={0.2} />
              </mesh>
              <Html
                center
                occlude={occluders}
                zIndexRange={[20, 0]}
                wrapperClass="pointer-events-none"
              >
                <span className="pointer-events-none select-none whitespace-nowrap rounded-sm border border-machined bg-stage/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink">
                  {g.label}
                </span>
              </Html>
            </group>
          ))
        : null}
    </group>
  )
}
