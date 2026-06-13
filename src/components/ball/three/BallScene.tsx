import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Ball } from './Ball'
import { Vectors } from './Vectors'
import { Studio } from './Studio'
import { v, seamPoint } from '../../../lib/seam'
import type { GripView, Handedness, PitchAtlasEntry, SeamAnchoredPoint } from '../../../data/types'

/*
  The 3D specimen. frameloop is on-demand: while the spin is active a ~30 fps
  interval requests repaints (capped — never the raw 120 Hz ProMotion rAF), and
  the loop halts the moment the ball is paused (reduced motion / faced for
  study) or scrolled off screen. OrbitControls invalidates on drag at full
  rate, so inspection stays smooth with zero idle GPU cost.

  Three presentations, one component:
    - hero    : auto-spinning showpiece, no grip, no vectors.
    - grip lab: grip pads on, faced toward the camera, static + draggable.
    - physics : spin + the Magnus/axis vectors, mounted only when the
                "if you want it" disclosure is open (vectors === true).
*/

/* Present the grip to the camera. Rotate the ball so the mean of the non-thumb
   contact normals points at the viewer (+z, lifted slightly). Verified per pitch
   in Phase 7; if a convention flip ever points the grip away, negate `target`. */
function faceGripQuaternion(placement: SeamAnchoredPoint[]): THREE.Quaternion {
  const lead = placement.filter((p) => p.finger !== 'thumb')
  const pts = lead.length ? lead : placement
  const mean = new THREE.Vector3()
  for (const p of pts) {
    const s = seamPoint(p.seamT * Math.PI * 2, 1)
    mean.add(new THREE.Vector3(s.x, s.y, s.z).normalize())
  }
  if (mean.lengthSq() < 1e-6) return new THREE.Quaternion()
  mean.normalize()
  const target = new THREE.Vector3(0, 0.22, 1).normalize()
  const q = new THREE.Quaternion().setFromUnitVectors(mean, target)
  // a small world-space roll so the grip never reads dead-on flat
  const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.05)
  return q.premultiply(tilt)
}

function viewQuaternion(view: GripView): THREE.Quaternion {
  const q = new THREE.Quaternion()
  if (view === 'side') {
    q.setFromEuler(new THREE.Euler(-0.2, -0.64, 0.03))
    return q
  }
  if (view === 'thumb') {
    q.setFromEuler(new THREE.Euler(0.78, 0.16, 0.04))
    return q
  }
  q.setFromEuler(new THREE.Euler(-0.08, 0.02, 0.04))
  return q
}

function FaceGroup({
  faceGrip,
  view,
  placement,
  children,
}: {
  faceGrip: boolean
  view: GripView
  placement: SeamAnchoredPoint[]
  children: ReactNode
}) {
  const quaternion = useMemo(() => {
    const faced = faceGrip ? faceGripQuaternion(placement) : new THREE.Quaternion()
    return viewQuaternion(view).multiply(faced)
  }, [faceGrip, placement, view])
  return <group quaternion={quaternion}>{children}</group>
}

function SpinGroup({
  axis: axisVec,
  active,
  children,
}: {
  axis: { x: number; y: number; z: number }
  active: boolean
  children: ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)
  const axis = useMemo(() => {
    const n = v.normalize(axisVec)
    return new THREE.Vector3(n.x, n.y, n.z).normalize()
  }, [axisVec])
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    // demand-mode: repaint once whenever the active state flips (spin on/off,
    // disclosure open, pitch change), so a static faced ball still draws.
    invalidate()
    if (!active) return
    // The idle spin's metronome. Self-invalidating from useFrame rides the raw
    // rAF — 120 Hz on ProMotion — for a slow showcase spin that reads identically
    // at 30. Tick the repaint at ~30 fps instead; the rotation below advances by
    // real elapsed time, so the ball covers the same arc either way. Pointer
    // interaction stays full-rate: OrbitControls invalidates per drag event on
    // its own, outside this clock.
    const id = window.setInterval(() => invalidate(), 33)
    return () => window.clearInterval(id)
  }, [active, invalidate])

  useFrame((_, delta) => {
    if (!active) return
    const g = groupRef.current
    if (!g) return
    // clamp delta so a backgrounded tab does not snap the ball on return
    g.rotateOnWorldAxis(axis, Math.min(delta, 0.05) * 0.55)
  })

  return <group ref={groupRef}>{children}</group>
}

export default function BallScene({
  entry,
  spin,
  active,
  grip = false,
  view = entry.canonical.gripModel.defaultView,
  handedness = 'right',
  vectors = false,
  faceGrip = false,
  activeContact,
}: {
  entry: PitchAtlasEntry
  spin: boolean
  active: boolean
  grip?: boolean
  view?: GripView
  handedness?: Handedness
  vectors?: boolean
  faceGrip?: boolean
  activeContact?: string
}) {
  const placement = entry.canonical.gripModel.contacts
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.15, 6.4], fov: 32 }}
      onCreated={({ gl }) => {
        // The recipe's visual target. Set explicitly — do not rely on defaults.
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
      }}
    >
      <Studio />

      <group>
        <FaceGroup faceGrip={faceGrip} view={view} placement={placement}>
          <SpinGroup axis={entry.motion.spinAxis} active={spin && active}>
            <Ball fingerPlacement={placement} showGrip={grip} handedness={handedness} activeContact={activeContact} />
          </SpinGroup>
        </FaceGroup>
        {vectors ? <Vectors motion={entry.motion} /> : null}
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
