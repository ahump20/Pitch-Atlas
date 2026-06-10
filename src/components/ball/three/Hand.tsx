import { useEffect, useMemo, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { solveGripPose, type FingerSpine } from '../../../lib/gripPose'
import type { GripContactModel, Handedness } from '../../../data/types'

/*
  The specimen hand. Finger spines from the grip-pose solver, swept as matte
  plaster tubes with fingertip caps — a field-manual cast, deliberately not skin.
  The same solver feeds the 2D schematic, so the hand and the fallback can never
  disagree about where a finger sits. Pressure reads as emphasis, not a number:
  the primary finger runs slightly thicker and presses a darker contact shadow
  into the leather. Each fingertip still carries its label pin; the pin opens the
  sourced pressure role and cue on hover or when its prose chip is active.
*/

// Matte plaster, the cast-specimen material. Never a skin tone by design.
const PLASTER = '#C8BEAC'
const PLASTER_DEEP = '#B4A892'
const ACTIVE_TINT = '#4B92DB'

const SHADOW_OPACITY: Record<string, number> = {
  primary: 0.34,
  support: 0.22,
  light: 0.13,
}

interface FingerRender {
  key: string
  label: string
  pressureRole?: string
  cue?: string
  tube: THREE.TubeGeometry
  tipCap: { position: THREE.Vector3; radius: number }
  baseCap: { position: THREE.Vector3; radius: number }
  shadow: { position: THREE.Vector3; quaternion: THREE.Quaternion; radius: number; opacity: number }
  labelPos: THREE.Vector3
  primary: boolean
}

function toV3(p: { x: number; y: number; z: number }): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.y, p.z)
}

function buildFinger(contact: GripContactModel, handedness: Handedness): FingerRender {
  const spine: FingerSpine = solveGripPose(contact, { handedness })
  const pts = spine.points.map(toV3)
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4)
  const shaftRadius = spine.radii[Math.floor(spine.radii.length / 2)]
  const tipRadius = spine.radii[0]
  const tube = new THREE.TubeGeometry(curve, 36, shaftRadius, 12, false)

  const normal = toV3(spine.contactNormal)
  const shadowQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
  const tier = contact.pressureTier ?? 'support'

  return {
    key: contact.label,
    label: contact.label,
    pressureRole: contact.pressureRole,
    cue: contact.cue,
    tube,
    tipCap: { position: pts[0], radius: tipRadius },
    baseCap: { position: pts[pts.length - 1], radius: spine.radii[spine.radii.length - 1] },
    shadow: {
      position: normal.clone().multiplyScalar(1.004),
      quaternion: shadowQ,
      radius: shaftRadius * 1.7,
      opacity: SHADOW_OPACITY[tier] ?? 0.22,
    },
    labelPos: pts[0].clone().add(normal.clone().multiplyScalar(0.3)),
    primary: tier === 'primary',
  }
}

/* The fingertip label pin: a compact finger label that opens the sourced
   pressure role and one-line cue on hover, or when its prose chip is active. */
function FingerPin({
  label,
  pressureRole,
  cue,
  active,
}: {
  label: string
  pressureRole?: string
  cue?: string
  active: boolean
}) {
  const [hover, setHover] = useState(false)
  const open = (hover || active) && Boolean(cue || pressureRole)

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={`pointer-events-auto flex items-center gap-1 whitespace-nowrap rounded-sm border bg-stage/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone transition-colors ${
          active ? 'border-powder/70' : 'border-bone/20'
        }`}
      >
        <span
          aria-hidden="true"
          className="rounded-full transition-all"
          style={{
            backgroundColor: ACTIVE_TINT,
            width: active ? 8 : 6,
            height: active ? 8 : 6,
            boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${ACTIVE_TINT} 30%, transparent)` : 'none',
          }}
        />
        {label}
      </span>
      {open ? (
        <span className="pointer-events-none max-w-[15rem] rounded-sm border border-powder/30 bg-stage/92 px-2 py-1 text-center">
          {pressureRole ? (
            <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-powder">
              {pressureRole}
            </span>
          ) : null}
          {cue ? (
            <span className="mt-0.5 block text-[11px] leading-snug text-bone-2">{cue}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

export function Hand({
  contacts,
  handedness = 'right',
  activeContact,
  occluders,
}: {
  contacts: GripContactModel[]
  handedness?: Handedness
  activeContact?: string
  occluders?: RefObject<THREE.Object3D>[]
}) {
  const fingers = useMemo(
    () => contacts.map((c) => buildFinger(c, handedness)),
    [contacts, handedness],
  )

  useEffect(
    () => () => {
      fingers.forEach((f) => f.tube.dispose())
    },
    [fingers],
  )

  return (
    <group>
      {fingers.map((f) => {
        const active = activeContact === f.label
        return (
          <group key={f.key}>
            {/* contact shadow pressed into the leather — pressure as emphasis */}
            <mesh position={f.shadow.position} quaternion={f.shadow.quaternion}>
              <circleGeometry args={[f.shadow.radius, 32]} />
              <meshBasicMaterial
                color="#0B0B0D"
                transparent
                opacity={active ? f.shadow.opacity + 0.08 : f.shadow.opacity}
                depthWrite={false}
              />
            </mesh>

            {/* the finger: one matte plaster tube along the solved spine */}
            <mesh geometry={f.tube}>
              <meshStandardMaterial
                color={f.primary ? PLASTER_DEEP : PLASTER}
                roughness={0.93}
                metalness={0}
                emissive={active ? ACTIVE_TINT : '#000000'}
                emissiveIntensity={active ? 0.16 : 0}
              />
            </mesh>
            <mesh position={f.tipCap.position}>
              <sphereGeometry args={[f.tipCap.radius, 20, 14]} />
              <meshStandardMaterial
                color={f.primary ? PLASTER_DEEP : PLASTER}
                roughness={0.93}
                metalness={0}
                emissive={active ? ACTIVE_TINT : '#000000'}
                emissiveIntensity={active ? 0.16 : 0}
              />
            </mesh>
            <mesh position={f.baseCap.position}>
              <sphereGeometry args={[f.baseCap.radius, 16, 12]} />
              <meshStandardMaterial color={f.primary ? PLASTER_DEEP : PLASTER} roughness={0.93} metalness={0} />
            </mesh>

            <Html position={f.labelPos} center occlude={occluders} zIndexRange={[20, 0]}>
              <FingerPin label={f.label} pressureRole={f.pressureRole} cue={f.cue} active={active} />
            </Html>
          </group>
        )
      })}
    </group>
  )
}
