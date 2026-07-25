import { useEffect, useMemo, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { solveHand, type FingerSpine, type HandSolution } from '../../../lib/gripPose'
import type { GripContactModel, Handedness } from '../../../data/types'

/*
  The specimen hand. Fingers, knuckles, and a palm from the grip-pose solver,
  swept as warm soft-roughness flesh — a hand on a ball, not a skinless cast and
  not a literal portrait. The same solver feeds the 2D schematic, so the hand and
  the fallback can never disagree about where a finger sits.

  This used to render each contact as an independent tube, which is why it read
  as macaroni: nothing connected the fingers, so at any size above a card crop
  the eye found five loose sausages and no hand. solveHand now converges them on
  knuckles seated on a palm, and the fingers with no authored contact fold in
  beside them. Those parts carry no label and no claim — the labeled, sourced
  part of this render is still exactly the authored contacts.

  Pressure reads as emphasis, not a number: the primary finger runs slightly
  thicker, gets a pad-flatten cue where it meets the leather, and presses a
  softer, deeper contact shadow into the cover. Each fingertip carries its label
  pin; the pin opens the sourced pressure role and cue on hover, or when its
  prose chip is active.
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
  tube: THREE.BufferGeometry
  tipCap: { position: THREE.Vector3; radius: number }
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

/* A tube that changes width along its length. Three's TubeGeometry is a constant
   radius, which is what made every finger a uniform sausage — a real finger
   narrows at the tip and swells into its knuckle, and a thumb thickens into the
   thenar over its whole run. Sweep the solver's own per-point radii instead. */
function tubeFromSpine(
  curve: THREE.CatmullRomCurve3,
  radii: number[],
  segments: number,
  radial = 14,
  /** Round the ends off to a close instead of leaving them open. An open tube
      shows its hollow interior the moment whatever was meant to bury it moves a
      hair — which is what every finger did where it met the palm. */
  roundEnds = 0.06,
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(segments, false)
  const position: number[] = []
  const normal: number[] = []
  const index: number[] = []
  const last = radii.length - 1

  for (let i = 0; i <= segments; i++) {
    const u = i / segments
    // sample the authored radius profile at this arc-length fraction
    const f = u * last
    const lo = Math.min(last, Math.floor(f))
    const hi = Math.min(last, lo + 1)
    const taper = roundEnds
      ? Math.sin(Math.min(1, u / roundEnds) * (Math.PI / 2)) *
        Math.sin(Math.min(1, (1 - u) / roundEnds) * (Math.PI / 2))
      : 1
    const r = (radii[lo] + (radii[hi] - radii[lo]) * (f - lo)) * taper

    const p = curve.getPointAt(u)
    const N = frames.normals[Math.min(i, segments - 1)]
    const B = frames.binormals[Math.min(i, segments - 1)]
    for (let j = 0; j <= radial; j++) {
      const theta = (j / radial) * Math.PI * 2
      const nx = Math.cos(theta) * N.x + Math.sin(theta) * B.x
      const ny = Math.cos(theta) * N.y + Math.sin(theta) * B.y
      const nz = Math.cos(theta) * N.z + Math.sin(theta) * B.z
      position.push(p.x + nx * r, p.y + ny * r, p.z + nz * r)
      normal.push(nx, ny, nz)
    }
  }

  const stride = radial + 1
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * stride + j
      const b = a + stride
      index.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3))
  geo.setIndex(index)
  return geo
}

function buildFinger(contact: GripContactModel, spine: FingerSpine): FingerRender {
  const pts = spine.points.map(toV3)
  const curve = /* centripetal, not uniform: the spine's samples bunch tightly through the hug
     arc and stretch out over the reach, and a uniform Catmull-Rom overshoots at
     that change of spacing — enough of a loop to fold the swept tube through
     itself and show a notch out of the finger */
  new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const shaftRadius = spine.radii[Math.floor(spine.radii.length / 2)]
  const tipRadius = spine.radii[0]
  const tube = tubeFromSpine(curve, spine.radii, 48)

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
    pad: {
      // sit the pad on the cover and up into the fingertip, which now rides its
      // own radius above the leather — a pad left flat on the surface leaves a
      // dark nick between the two
      position: contactOnLeather.clone().multiplyScalar(1 + tipRadius * 0.34),
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

/* The back of the hand. A loft, not an extrusion: the solver's cross-sections
   swept knuckles-to-heel, each a superellipse so the mass stays flat like a hand
   with edges that roll instead of a slab's machined corner. Both ends round off
   and close, so the wrist reads as the heel of a hand rather than a cut. */
const PALM_RINGS = 26
const PALM_RADIAL = 22
/* 2/n on a superellipse: 1 is an ellipse, lower is squarer. A palm is flatter
   through the middle than an ellipse and still round at the edges. */
const PALM_SQUARE = 0.68

function buildPalm(palm: HandSolution['palm']): THREE.BufferGeometry {
  const across = toV3(palm.across)
  const wrist = toV3(palm.wrist)
  const out = toV3(palm.out)
  const origin = toV3(palm.origin)
  const sections = palm.sections
  const last = sections.length - 1

  const position: number[] = []
  const index: number[] = []
  const stride = PALM_RADIAL + 1
  const scratch = new THREE.Vector3()

  for (let i = 0; i <= PALM_RINGS; i++) {
    const t = i / PALM_RINGS
    const f = t * last
    const lo = Math.min(last, Math.floor(f))
    const hi = Math.min(last, lo + 1)
    const k = f - lo
    const lerp = (a: number, b: number) => a + (b - a) * k
    const y = lerp(sections[lo].y, sections[hi].y)
    const cup = lerp(sections[lo].cup, sections[hi].cup)
    // round both ends off instead of capping them flat
    // the knuckle edge stays nearly full — the fingers root there, and tapering
    // it to a point left them looking attached to nothing
    const close =
      Math.sin(Math.min(1, t / 0.04) * (Math.PI / 2)) *
      Math.sin(Math.min(1, (1 - t) / 0.16) * (Math.PI / 2))
    const hw = lerp(sections[lo].halfWidth, sections[hi].halfWidth) * close
    const ht = lerp(sections[lo].halfThickness, sections[hi].halfThickness) * close

    for (let j = 0; j <= PALM_RADIAL; j++) {
      const theta = (j / PALM_RADIAL) * Math.PI * 2
      const c = Math.cos(theta)
      const s = Math.sin(theta)
      const x = Math.sign(c) * Math.pow(Math.abs(c), PALM_SQUARE) * hw
      const z = Math.sign(s) * Math.pow(Math.abs(s), PALM_SQUARE) * ht
      scratch
        .copy(origin)
        .addScaledVector(across, x)
        .addScaledVector(wrist, y)
        .addScaledVector(out, z + cup)
      position.push(scratch.x, scratch.y, scratch.z)
    }
  }

  for (let i = 0; i < PALM_RINGS; i++) {
    for (let j = 0; j < PALM_RADIAL; j++) {
      const a = i * stride + j
      const b = a + stride
      index.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
  geo.setIndex(index)
  geo.computeVertexNormals()
  return geo
}

/* The palm's frame as a rotation. The third axis comes from the other two rather
   than from palm.out, so a mirrored left hand still hands Three a right-handed
   basis. */
function palmQuaternion(palm: HandSolution['palm']): THREE.Quaternion {
  const across = toV3(palm.across)
  const wrist = toV3(palm.wrist)
  const up = new THREE.Vector3().crossVectors(across, wrist).normalize()
  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(across, wrist, up),
  )
}

export function Hand({
  contacts,
  handedness = 'right',
  pins = true,
  activeContact,
  occluders,
}: {
  contacts: GripContactModel[]
  handedness?: Handedness
  /** Fingertip label pins. Off inside a card window, where three labels sit on
   *  top of the grip they are naming. */
  pins?: boolean
  activeContact?: string
  occluders?: RefObject<THREE.Object3D>[]
}) {
  const hand = useMemo(() => solveHand(contacts, { handedness }), [contacts, handedness])
  const fingers = useMemo(
    () => hand.fingers.map((spine, i) => buildFinger(contacts[i], spine)),
    [hand, contacts],
  )
  const palmGeo = useMemo(() => buildPalm(hand.palm), [hand])
  const thenar = useMemo(() => {
    if (!hand.thumbRoot) return null
    // The heel of the thumb, bridging the palm's thumb-side edge to where the
    // thumb leaves it.
    const heel = hand.palm.sections[hand.palm.sections.length - 3]
    const edge = toV3(hand.palm.origin)
      .addScaledVector(toV3(hand.palm.wrist), heel.y)
      .addScaledVector(toV3(hand.palm.across), -heel.halfWidth)
      .addScaledVector(toV3(hand.palm.out), heel.cup - 0.08)
    return { position: edge, quaternion: palmQuaternion(hand.palm) }
  }, [hand])

  const shadowTex = useMemo(() => makeContactShadowTexture(), [])

  useEffect(
    () => () => {
      fingers.forEach((f) => f.tube.dispose())
    },
    [fingers],
  )
  useEffect(() => () => palmGeo.dispose(), [palmGeo])
  useEffect(() => () => shadowTex.dispose(), [shadowTex])

  return (
    <group>
      {/* the back of the hand and the heel of the thumb — rendered mass, never
          labeled and never claimed */}
      <mesh geometry={palmGeo}>
        <meshPhysicalMaterial
          color={SKIN}
          roughness={0.68}
          metalness={0}
          sheen={0.45}
          sheenRoughness={0.7}
          sheenColor="#E8C7AE"
        />
      </mesh>

      {thenar ? (
        <mesh position={thenar.position} quaternion={thenar.quaternion} scale={[0.26, 0.4, 0.22]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshPhysicalMaterial
            color={SKIN}
            roughness={0.66}
            metalness={0}
            sheen={0.45}
            sheenRoughness={0.65}
            sheenColor="#E8C7AE"
          />
        </mesh>
      ) : null}

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

            {pins ? (
              <Html position={f.labelPos} center occlude={occluders} zIndexRange={[20, 0]}>
                <FingerPin label={f.label} pressureRole={f.pressureRole} cue={f.cue} active={active} />
              </Html>
            ) : null}
          </group>
        )
      })}
    </group>
  )
}
