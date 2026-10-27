import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { tubeFromSpine } from '../../../lib/taperedTube'
import { declutterLabels, lineNearBox, plateSide } from '../../../lib/labelLayout'
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
// a label's plate starts this far (px) from its fingertip dot's centre; no plate
// comes within half of PIN_CLEAR of a dot
const PIN_GAP = 8
const PIN_CLEAR = 12

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
  /** A point back up the finger: with the tip it says which way the finger points on screen. */
  reach: THREE.Vector3
  /** The finger's spine, tip first: what a label must not lie across. */
  spine: THREE.Vector3[]
  primary: boolean
}

function toV3(p: { x: number; y: number; z: number }): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.y, p.z)
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
    reach: pts[Math.min(4, pts.length - 1)],
    spine: pts,
    primary: tier === 'primary',
  }
}

/* The fingertip label: a compact plate that opens the sourced pressure role and
   one-line cue on hover, or when its prose chip is active. Its dot is drawn on
   the fingertip itself (see the pins in Hand). */
function FingerPin({
  label,
  pressureRole,
  cue,
  active,
  onResize,
}: {
  label: string
  pressureRole?: string
  cue?: string
  active: boolean
  /** The pin grew or shrank: the scene draws a frame so the pins re-space. */
  onResize?: () => void
}) {
  const [hover, setHover] = useState(false)
  const open = (hover || active) && Boolean(cue || pressureRole)
  useLayoutEffect(() => onResize?.(), [open, onResize])

  return (
    <>
      <span
        data-finger-pin={label}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={`pointer-events-auto whitespace-nowrap rounded-sm border bg-stage/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone transition-colors ${
          active ? 'border-powder/70' : 'border-bone/20'
        }`}
      >
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
    </>
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
  const outward = new THREE.Vector3().crossVectors(wrist, out).dot(across) > 0
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
      // Mirroring the hand can reverse its frame; keep the outer skin visible.
      if (outward) index.push(a, b, a + 1, b, b + 1, a + 1)
      else index.push(a, a + 1, b, b, a + 1, b + 1)
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

  /* Each label's dot sits on its fingertip, where the finger meets the leather,
     and the plate runs on past the tip the way the finger points (back over the
     finger when the stage has no room, and the other way when it would lie across
     another finger and that side is clear; when both sides would, it sits above or
     below the dot instead). Every frame the plates are pulled apart
     up and down and kept inside the stage; the dots hold still, so no plate
     covers a fingertip, and a plate pushed off its dot keeps a hairline to it. */
  const invalidate = useThree((s) => s.invalidate)
  const fingerGroups = useRef<(THREE.Group | null)[]>([])
  const pinEls = useRef<(HTMLDivElement | null)[]>([])
  const dotEls = useRef<(HTMLSpanElement | null)[]>([])
  const tetherEls = useRef<(SVGLineElement | null)[]>([])
  const projected = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => {
    if (!pins) return
    let live = true
    // the label font lands after the first frame and widens every pin
    document.fonts?.ready.then(() => live && invalidate())
    return () => {
      live = false
    }
  }, [pins, invalidate])
  useFrame(({ camera, size }) => {
    if (!pins) return
    camera.updateMatrixWorld()
    const onScreen = (v: THREE.Vector3, group: THREE.Group) => {
      projected.copy(v).applyMatrix4(group.matrixWorld).project(camera)
      return { x: ((projected.x + 1) / 2) * size.width, y: ((1 - projected.y) / 2) * size.height }
    }
    // every finger as it shows on screen: a stretch the ball hides is not in a plate's way
    const eye = new THREE.Vector3()
    const drawn = fingers.map((f, i) => {
      const group = fingerGroups.current[i]
      if (!group) return { points: [], shows: [] }
      group.updateWorldMatrix(true, false)
      group.worldToLocal(camera.getWorldPosition(eye))
      // hidden where the line from the eye meets the ball (the unit sphere) before the point
      const shows = f.spine.map((p) => {
        const d = p.clone().sub(eye)
        const a = d.lengthSq()
        const b = 2 * eye.dot(d)
        const disc = b * b - 4 * a * (eye.lengthSq() - 1)
        const t = (-b - Math.sqrt(disc)) / (2 * a)
        return !(disc > 0 && t > 0 && t < 1)
      })
      return { points: f.spine.map((p) => onScreen(p, group)), shows }
    })
    const fit = (v: number, half: number, span: number) => Math.min(Math.max(v, 4 + half), span - 4 - half)
    const seen = fingers.map((f, i) => {
      const el = pinEls.current[i]
      const group = fingerGroups.current[i]
      // an occluded pin is display:none and measures 0: it is left out
      if (!el || !group || !el.offsetWidth) return null
      group.updateWorldMatrix(true, false)
      const origin = onScreen(f.labelPos, group)
      const tip = onScreen(f.pad.position, group)
      const back = onScreen(f.reach, group)
      const w = el.offsetWidth
      const h = el.offsetHeight
      const name = el.querySelector<HTMLElement>('[data-finger-pin]')
      const row = name?.offsetHeight ?? h
      const nameW = name?.offsetWidth ?? w
      const lean = Math.abs(tip.x - back.x) > 1 ? Math.sign(tip.x - back.x) : tip.x < size.width / 2 ? -1 : 1
      // which way the finger points up or down the screen; above when it runs level
      const drop = Math.abs(tip.y - back.y) > 1 ? Math.sign(tip.y - back.y) : -1
      // a plate this size beside its dot on `side` (rise 0), its card hanging below, or
      // above (rise -1) or below (1) the dot, running from it toward `side` (0 centres it)
      const at = (side: number, rise: number, pw = nameW, ph = row) =>
        rise
          ? { x: fit(tip.x + side * Math.max(0, pw / 2 - PIN_CLEAR), pw / 2, size.width), y: tip.y + rise * (PIN_CLEAR + ph / 2) }
          : { x: tip.x + side * (PIN_GAP + pw / 2), y: tip.y + (ph - row) / 2 }
      // the open card of the chosen finger has its say in where its plate goes; a card
      // opened by hovering has none, so it never moves its name out from under the pointer
      const [dw, dh] = activeContact === f.label ? [w, h] : [nameW, row]
      // as on the flat drawing: only just missing room past the tip still beats
      // crossing the hand, and a plate moves off another finger when the other side is clear
      const spill = (side: number) => Math.abs(tip.x + side * (PIN_GAP + dw) - size.width / 2) - (size.width / 2 - 4)
      const crossed = (side: number, rise = 0) =>
        drawn.some(
          (d, k) =>
            k !== i &&
            lineNearBox(d.points, { ...at(side, rise, dw, dh), w: dw, h: dh }, PIN_CLEAR / 2, (j) => d.shows[j]),
        )
      let side = plateSide(lean, spill, PIN_GAP + PIN_CLEAR / 2, crossed)
      let rise = 0
      // both sides lie across another finger: above or below the dot instead, past the tip first
      if (crossed(side)) {
        const room = (r: number) => (r < 0 ? tip.y - PIN_CLEAR - dh >= 4 : tip.y + PIN_CLEAR + dh <= size.height - 4)
        const spot = [drop, -drop]
          .flatMap((r) => [0, lean, -lean].map((s) => ({ s, r })))
          .find(({ s, r }) => room(r) && !crossed(s, r))
        if (spot) {
          side = spot.s
          rise = spot.r
        }
      }
      // an open card hangs off its name, away from the dot (above the name when there
      // is no room below), and runs whichever way fits the stage
      const spot = at(side, rise)
      const up = rise < 0 || (!rise && tip.y - row / 2 + h > size.height - 4)
      const from = (a: number) => spot.x + (a > 0 ? -nameW / 2 : a < 0 ? nameW / 2 - w : -w / 2)
      const align = (side ? [side, -side, 0] : [0, 1, -1]).find((a) => from(a) >= 4 && from(a) + w <= size.width - 4) ?? side
      const want = { x: from(align) + w / 2, y: spot.y + (up ? row - h : h - row) / 2 }
      return { origin, tip, w, h, row, align, up, want }
    })
    const none = { x: 0, y: 0, w: 0, h: 0 }
    const placed = declutterLabels(
      [
        // a plate with its card open holds still, inside the stage, and the rest make way
        ...seen.map((p) =>
          !p
            ? none
            : p.h > p.row
              ? { x: fit(p.want.x, p.w / 2, size.width), y: fit(p.want.y, p.h / 2, size.height), w: p.w, h: p.h, fixed: true }
              : { ...p.want, w: p.w, h: p.h },
        ),
        ...seen.map((p) => (p ? { ...p.tip, w: PIN_CLEAR, h: PIN_CLEAR, fixed: true } : none)),
      ],
      size,
    )
    seen.forEach((p, i) => {
      const el = pinEls.current[i]
      if (!p || !el) return
      const left = placed[i].x - p.w / 2
      const top = placed[i].y - p.h / 2
      el.style.transform = `translate(${(left - p.origin.x).toFixed(1)}px, ${(top - p.origin.y).toFixed(1)}px)`
      el.style.alignItems = p.align > 0 ? 'flex-start' : p.align < 0 ? 'flex-end' : 'center'
      // a card above its name puts the name at the bottom of the plate
      el.style.flexDirection = p.up ? 'column-reverse' : ''
      // the dot and the hairline are drawn from the plate's corner
      const dot = { x: p.tip.x - left, y: p.tip.y - top }
      const dotEl = dotEls.current[i]
      if (dotEl) dotEl.style.transform = `translate(${(dot.x - dotEl.offsetWidth / 2).toFixed(1)}px, ${(dot.y - dotEl.offsetHeight / 2).toFixed(1)}px)`
      const line = tetherEls.current[i]
      if (!line) return
      const moved = Math.abs(placed[i].x - p.want.x) > 0.5 || Math.abs(placed[i].y - p.want.y) > 0.5
      line.style.visibility = moved ? 'visible' : 'hidden'
      if (!moved) return
      const mid = p.up ? p.h - p.row / 2 : p.row / 2
      const end =
        dot.x <= 0 ? { x: 0, y: mid } : dot.x >= p.w ? { x: p.w, y: mid } : { x: dot.x, y: dot.y < 0 ? 0 : p.h }
      line.setAttribute('x1', dot.x.toFixed(1))
      line.setAttribute('y1', dot.y.toFixed(1))
      line.setAttribute('x2', end.x.toFixed(1))
      line.setAttribute('y2', end.y.toFixed(1))
    })
  })

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

      {fingers.map((f, i) => {
        const active = activeContact === f.label
        const skin = f.primary ? SKIN_DEEP : SKIN
        return (
          <group
            key={f.key}
            ref={(g) => {
              fingerGroups.current[i] = g
            }}
          >
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
              <Html position={f.labelPos} occlude={occluders} zIndexRange={[20, 0]}>
                <div
                  ref={(el) => {
                    pinEls.current[i] = el
                    if (el) invalidate()
                  }}
                  className="relative flex w-max select-none flex-col gap-1"
                >
                  <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
                    <line
                      ref={(el) => {
                        tetherEls.current[i] = el
                      }}
                      stroke="#F6F1E6"
                      strokeOpacity="0.55"
                      strokeWidth="1"
                      style={{ visibility: 'hidden' }}
                    />
                  </svg>
                  <FingerPin
                    label={f.label}
                    pressureRole={f.pressureRole}
                    cue={f.cue}
                    active={active}
                    onResize={invalidate}
                  />
                  <span
                    ref={(el) => {
                      dotEls.current[i] = el
                    }}
                    data-finger-anchor={f.label}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 rounded-full transition-[width,height,box-shadow]"
                    style={{
                      backgroundColor: ACTIVE_TINT,
                      width: active ? 8 : 6,
                      height: active ? 8 : 6,
                      boxShadow: `0 0 0 1.5px var(--color-stage)${active ? `, 0 0 0 4.5px color-mix(in srgb, ${ACTIVE_TINT} 30%, transparent)` : ''}`,
                    }}
                  />
                </div>
              </Html>
            ) : null}
          </group>
        )
      })}
    </group>
  )
}
