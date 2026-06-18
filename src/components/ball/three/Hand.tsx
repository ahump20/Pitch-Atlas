import { useEffect, useMemo, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { solveGripPose, type FingerSpine } from '../../../lib/gripPose'
import type { GripContactModel, Handedness } from '../../../data/types'

/*
  The specimen hand. Finger spines from the grip-pose solver, swept as warm,
  soft-roughness fingers with fingertip caps — a hand on a ball, not a skinless
  cast and not a literal portrait. The same solver feeds the 2D schematic, so the
  hand and the fallback can never disagree about where a finger sits. Pressure
  reads as emphasis, not a number: the primary finger runs slightly thicker, gets
  a subtle pad-flatten cue where it meets the leather, and presses a softer, deeper
  contact shadow into the cover. Each fingertip still carries its label pin; the pin
  opens the sourced pressure role and cue on hover or when its prose chip is active.
*/

// Warm skin tone, soft and a little ruddy on the pressing finger. Faint warmth
// comes from a sheen tint, not literal subsurface.
const SKIN = '#D7B79A'
const SKIN_DEEP = '#C99E80'
const ACTIVE_TINT = '#4B92DB'

const SHADOW_OPACITY: Record<string, number> = {
  primary: 0.36,
  support: 0.24,
  light: 0.15,
}

/* A soft radial contact AO: one shared alpha disc, dark at the center and fading
   to nothing at the rim, so the fingertip's shadow falls off into the leather
   instead of ending on a hard circle edge. Generated once, reused on every
   contact, disposed with the hand. */
function makeContactShadowTexture(): THREE.CanvasTexture {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(10,10,12,1)')
  g.addColorStop(0.45, 'rgba(10,10,12,0.78)')
  g.addColorStop(0.78, 'rgba(10,10,12,0.22)')
  g.addColorStop(1, 'rgba(10,10,12,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  return tex
}

interface FingerRender {
  key: string
  label: string
  pressureRole?: string
  cue?: string
  tube: THREE.TubeGeometry
  tipCap: { position: THREE.Vector3; radius: number }
  baseCap: { position: THREE.Vector3; radius: number }
  /** The pad-flatten cue: a squashed cap right at the contact, so the pressing
      fingertip reads as flesh giving against the leather instead of a hard ball. */
  pad: { position: THREE.Vector3; quaternion: THREE.Quaternion; radius: number }
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
  const padQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
  const tier = contact.pressureTier ?? 'support'
  // the pressing finger flattens harder against the leather than a light one
  const padRadius = tipRadius * (tier === 'primary' ? 1.18 : tier === 'light' ? 0.86 : 1.0)
  const contactOnLeather = toV3(spine.contact)

  return {
    key: contact.label,
    label: contact.label,
    pressureRole: contact.pressureRole,
    cue: contact.cue,
    tube,
    tipCap: { position: pts[0], radius: tipRadius },
    baseCap: { position: pts[pts.length - 1], radius: spine.radii[spine.radii.length - 1] },
    pad: {
      // sit the pad just on the cover, between the fingertip and the leather
      position: contactOnLeather.clone().multiplyScalar(1.012),
      quaternion: padQ,
      radius: padRadius,
    },
    shadow: {
      position: normal.clone().multiplyScalar(1.004),
      quaternion: shadowQ,
      radius: shaftRadius * 1.9,
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

  const shadowTex = useMemo(() => makeContactShadowTexture(), [])

  useEffect(
    () => () => {
      fingers.forEach((f) => f.tube.dispose())
    },
    [fingers],
  )
  useEffect(() => () => shadowTex.dispose(), [shadowTex])

  return (
    <group>
      {fingers.map((f) => {
        const active = activeContact === f.label
        const skin = f.primary ? SKIN_DEEP : SKIN
        return (
          <group key={f.key}>
            {/* soft radial contact shadow pressed into the leather — pressure as
                emphasis, falling off into the cover instead of a hard edge */}
            <mesh position={f.shadow.position} quaternion={f.shadow.quaternion}>
              <circleGeometry args={[f.shadow.radius, 40]} />
              <meshBasicMaterial
                map={shadowTex}
                transparent
                opacity={active ? f.shadow.opacity + 0.08 : f.shadow.opacity}
                depthWrite={false}
              />
            </mesh>

            {/* the finger: a warm soft-skin tube along the solved spine */}
            <mesh geometry={f.tube}>
              <meshPhysicalMaterial
                color={skin}
                roughness={0.62}
                metalness={0}
                sheen={0.5}
                sheenRoughness={0.6}
                sheenColor="#E8C7AE"
                clearcoat={0.06}
                emissive={active ? ACTIVE_TINT : '#000000'}
                emissiveIntensity={active ? 0.16 : 0}
              />
            </mesh>
            <mesh position={f.tipCap.position}>
              <sphereGeometry args={[f.tipCap.radius, 20, 14]} />
              <meshPhysicalMaterial
                color={skin}
                roughness={0.62}
                metalness={0}
                sheen={0.5}
                sheenRoughness={0.6}
                sheenColor="#E8C7AE"
                emissive={active ? ACTIVE_TINT : '#000000'}
                emissiveIntensity={active ? 0.16 : 0}
              />
            </mesh>
            <mesh position={f.baseCap.position}>
              <sphereGeometry args={[f.baseCap.radius, 16, 12]} />
              <meshPhysicalMaterial color={skin} roughness={0.62} metalness={0} sheen={0.4} sheenColor="#E8C7AE" />
            </mesh>

            {/* pad-flatten cue: a squashed cap where the fingertip presses, so the
                flesh reads as giving against the leather */}
            <mesh
              position={f.pad.position}
              quaternion={f.pad.quaternion}
              scale={[f.pad.radius, f.pad.radius * 0.4, f.pad.radius]}
            >
              <sphereGeometry args={[1, 18, 12]} />
              <meshPhysicalMaterial
                color={skin}
                roughness={0.55}
                metalness={0}
                sheen={0.55}
                sheenColor="#EBCBB2"
                emissive={active ? ACTIVE_TINT : '#000000'}
                emissiveIntensity={active ? 0.12 : 0}
              />
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
