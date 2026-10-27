import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Ball } from './Ball'
import { Vectors } from './Vectors'
import { Studio } from './Studio'
import { FirstFrame } from './FirstFrame'
import { canvasEvents } from './canvasEvents'
import { v } from '../../../lib/seam'
import { gripViewQuaternion } from '../../../lib/gripView'
import { rigHand } from '../../../lib/handRig'
import type { GripView, Handedness, PitchAtlasEntry, SeamAnchoredPoint } from '../../../data/types'
import type { OrbitLink, StageId } from '../orbitLink'

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

function FaceGroup({
  faceGrip,
  view,
  placement,
  handedness,
  wrist,
  children,
}: {
  faceGrip: boolean
  view: GripView
  placement: SeamAnchoredPoint[]
  handedness: Handedness
  wrist?: THREE.Vector3
  children: ReactNode
}) {
  const quaternion = useMemo(
    () => new THREE.Quaternion(...gripViewQuaternion(placement, view, { faceGrip, handedness, wrist })),
    [faceGrip, placement, view, handedness, wrist],
  )
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

/* the orbit controls as the link uses them (drei's makeDefault puts them in the store) */
interface LinkedControls {
  target: THREE.Vector3
  getAzimuthalAngle(): number
  getPolarAngle(): number
  update(): void
  reset(): void
  addEventListener(type: 'start' | 'change', listener: () => void): void
  removeEventListener(type: 'start' | 'change', listener: () => void): void
}

/*
  Joins this stage's camera to the bench's other stage (orbitLink). A drag here is
  published as an angle; an angle from the other stage moves this camera, around the
  same target at the same distance, without publishing it back.
*/
function OrbitLinkBridge({ link, id }: { link: OrbitLink; id: StageId }) {
  const controls = useThree((s) => s.controls) as unknown as LinkedControls | null
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!controls) return
    let applying = false
    const onStart = () => link.drive(id)
    const onChange = () => {
      if (!applying) link.publish(id, { azimuth: controls.getAzimuthalAngle(), polar: controls.getPolarAngle() })
    }
    const quietly = (move: () => void) => {
      applying = true
      move()
      applying = false
      invalidate()
    }
    controls.addEventListener('start', onStart)
    controls.addEventListener('change', onChange)
    const offPose = link.subscribe(id, ({ azimuth, polar }) =>
      quietly(() => {
        const radius = camera.position.distanceTo(controls.target)
        camera.position.setFromSphericalCoords(radius, polar, azimuth).add(controls.target)
        controls.update()
      }),
    )
    const offReset = link.onReset(() => quietly(() => controls.reset()))
    return () => {
      controls.removeEventListener('start', onStart)
      controls.removeEventListener('change', onChange)
      offPose()
      offReset()
    }
  }, [controls, camera, invalidate, link, id])
  return null
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
  interactive = true,
  distance = 6.4,
  activeContact,
  link,
  linkId = 'a',
  onReady,
}: {
  entry: PitchAtlasEntry
  spin: boolean
  active: boolean
  grip?: boolean
  view?: GripView
  handedness?: Handedness
  vectors?: boolean
  faceGrip?: boolean
  /** Drag-to-turn. Off for a ball mounted inside a card: the card is a link, so a
   *  drag that ends on it would navigate, and the showpiece spin is the whole job
   *  there. Handling the ball is what the specimen page's Grip Lab is for. */
  interactive?: boolean
  /** Camera distance. The default frames the ball for the Grip Lab's wide stage;
   *  a square or card-shaped canvas needs more room or the fingers leave the top
   *  of the frustum. Larger = further back = more of the hand in frame. */
  distance?: number
  activeContact?: string
  /** the bench's shared camera: turning this ball turns the other stage's too */
  link?: OrbitLink
  linkId?: StageId
  onReady?: () => void
}) {
  const placement = entry.canonical.gripModel.contacts
  // the fitted hand is kept per pitch, so the Hand below reuses this fit
  const wrist = useMemo(() => {
    if (!grip || !placement.length) return undefined
    const w = rigHand(placement).position[0]
    return new THREE.Vector3(handedness === 'left' ? -w.x : w.x, w.y, w.z)
  }, [grip, placement, handedness])
  return (
    <Canvas
      events={canvasEvents}
      frameloop="demand"
      // Cap at 1.5x to match the foil shader's DPR_CAP — on a 2x/3x phone this
      // halves (or more) the rasterized pixel area of the spinning ball with no
      // visible difference at arm's length.
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.15, distance], fov: 32 }}
      onCreated={({ gl }) => {
        // The recipe's visual target. Set explicitly — do not rely on defaults.
        // Pulled up a touch to suit the studio's darker gradient env, so the warm
        // key still rolls a crisp specular across the leather.
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.14
      }}
    >
      <Studio />
      <FirstFrame onReady={onReady} />

      <group>
        <FaceGroup faceGrip={faceGrip} view={view} placement={placement} handedness={handedness} wrist={wrist}>
          <SpinGroup axis={entry.motion.spinAxis} active={spin && active}>
            <Ball
              fingerPlacement={placement}
              showGrip={grip}
              pins={interactive}
              handedness={handedness}
              activeContact={activeContact}
            />
          </SpinGroup>
        </FaceGroup>
        {vectors ? <Vectors motion={entry.motion} /> : null}
      </group>

      {interactive ? (
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
        />
      ) : null}
      {interactive && link ? <OrbitLinkBridge link={link} id={linkId} /> : null}
    </Canvas>
  )
}
