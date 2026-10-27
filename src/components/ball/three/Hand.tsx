import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { declutterLabels, lineNearBox, plateSide } from '../../../lib/labelLayout'
import { Html } from '@react-three/drei'
import { rigHand } from '../../../lib/handRig'
import { buildHandMesh, DIGIT_ORDER, makeSkinMaterial, paintHand, type Digit } from './handMesh'
import type { GripContactModel, Handedness } from '../../../data/types'

/*
  The specimen hand: a real, rigged human hand (wrist, palm, three bones a finger),
  bent by the grip fit in handRig.ts so each authored contact sits under the right
  part of the right finger — the pad, the inside edge, the nail. The fit decides
  everything behind the contacts (wrist, palm, the fingers nothing holds); none of
  that is labelled or claimed. The labelled, sourced part of this render is still
  exactly the authored contacts: each one's dot sits on the leather where gripPose
  puts it, and the flat fallback draws the same points.

  Pressure reads as emphasis, not a number: the pressing finger presses a softer,
  deeper contact shadow into the cover. Each fingertip carries its label pin; the
  pin opens the sourced pressure role and cue on hover, or when its prose chip is
  active.
*/

const ACTIVE_TINT = '#4B92DB'
const ACTIVE = new THREE.Color(ACTIVE_TINT)
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
  digit: Digit
  pressureRole?: string
  cue?: string
  /** Where the finger meets the leather: the authored contact. */
  dot: THREE.Vector3
  shadow: { position: THREE.Vector3; quaternion: THREE.Quaternion; radius: number; opacity: number }
  labelPos: THREE.Vector3
  /** A point back up the finger: with the dot it says which way the finger points on screen. */
  reach: THREE.Vector3
  /** The finger's line, fingertip first: what a label must not lie across. */
  spine: THREE.Vector3[]
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
  const hand = useMemo(() => rigHand(contacts), [contacts])
  const handMesh = useMemo(() => buildHandMesh(hand, handedness), [hand, handedness])
  const material = useMemo(() => makeSkinMaterial(), [])
  const mirror = useMemo(
    () => (p: THREE.Vector3) => (handedness === 'left' ? new THREE.Vector3(-p.x, p.y, p.z) : p.clone()),
    [handedness],
  )
  const fingers = useMemo<FingerRender[]>(
    () =>
      hand.contacts.map((c, i) => {
        const contact = contacts[i]
        const normal = mirror(c.normal)
        const tier = contact.pressureTier ?? 'support'
        const spine = c.line.map(mirror)
        return {
          key: contact.label,
          label: contact.label,
          digit: c.digit,
          pressureRole: contact.pressureRole,
          cue: contact.cue,
          dot: normal.clone().multiplyScalar(1.004),
          shadow: {
            position: normal.clone().multiplyScalar(1.004),
            quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal),
            radius: 0.3,
            opacity: SHADOW_OPACITY[tier] ?? 0.22,
          },
          labelPos: normal.clone().multiplyScalar(1.3),
          reach: spine[2] ?? spine[spine.length - 1],
          spine,
        }
      }),
    [hand, contacts, mirror],
  )
  // the digits no label names, and the back of the hand: still nothing a plate may cover
  const others = useMemo(
    () => [...hand.free.map((line) => line.map(mirror)), [hand.position[0], hand.position[11]].map(mirror)],
    [hand, mirror],
  )

  // skin tone, with the chosen finger tinted the way its prose chip is
  useLayoutEffect(() => {
    const digit = fingers.find((f) => f.label === activeContact)?.digit
    paintHand(handMesh, digit ? DIGIT_ORDER.indexOf(digit) : -1, ACTIVE)
  }, [handMesh, fingers, activeContact])

  const shadowTex = useMemo(() => makeContactShadowTexture(), [])

  /* Each label's dot sits on its fingertip, where the finger meets the leather,
     and the plate runs on past the tip the way the finger points (back over the
     finger when the stage has no room, and the other way when it would lie across
     another finger and that side is clear; when both sides would, it sits above or
     below the dot instead). Every frame the plates are pulled apart
     up and down and kept inside the stage; the dots hold still, so no plate
     covers a fingertip, and a plate pushed off its dot keeps a hairline to it. */
  const invalidate = useThree((s) => s.invalidate)
  // One fixed home for the pins, the canvas's own box. Left to itself drei re-homes a
  // pin once the canvas connects its events, and since React 19.3 that remount can
  // leave the first pin's root empty: its label never shows.
  const gl = useThree((s) => s.gl)
  const pinHome = useMemo(() => ({ current: gl.domElement.parentElement! }), [gl])
  const handGroup = useRef<THREE.Group>(null)
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
    const group = handGroup.current
    if (!pins || !group) return
    camera.updateMatrixWorld()
    group.updateWorldMatrix(true, false)
    const onScreen = (v: THREE.Vector3) => {
      projected.copy(v).applyMatrix4(group.matrixWorld).project(camera)
      return { x: ((projected.x + 1) / 2) * size.width, y: ((1 - projected.y) / 2) * size.height }
    }
    // every finger as it shows on screen: a stretch the ball hides is not in a plate's way
    const eye = group.worldToLocal(camera.getWorldPosition(new THREE.Vector3()))
    // hidden where the line from the eye meets the ball (a hair inside the cover, so a
    // contact on the rim still shows) before the point
    const behindBall = (p: THREE.Vector3) => {
      const d = p.clone().sub(eye)
      const a = d.lengthSq()
      const b = 2 * eye.dot(d)
      const disc = b * b - 4 * a * (eye.lengthSq() - 0.97)
      const t = (-b - Math.sqrt(disc)) / (2 * a)
      return disc > 0 && t > 0 && t < 1
    }
    const drawn = [...fingers.map((f) => f.spine), ...others].map((line) => ({
      points: line.map(onScreen),
      shows: line.map((p) => !behindBall(p)),
    }))
    const fit = (v: number, half: number, span: number) => Math.min(Math.max(v, 4 + half), span - 4 - half)
    const seen = fingers.map((f, i) => {
      const el = pinEls.current[i]
      if (!el) return null
      // a contact round the far side of the ball has nothing to point at from here
      const hidden = behindBall(f.dot)
      el.style.visibility = hidden ? 'hidden' : ''
      // an occluded pin is display:none and measures 0: it is left out
      if (hidden || !el.offsetWidth) return null
      const origin = onScreen(f.labelPos)
      const tip = onScreen(f.dot)
      const back = onScreen(f.reach)
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

  useEffect(() => () => handMesh.geometry.dispose(), [handMesh])
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => () => shadowTex.dispose(), [shadowTex])

  return (
    <group ref={handGroup}>
      <mesh geometry={handMesh.geometry} material={material} />

      {fingers.map((f, i) => {
        const active = activeContact === f.label
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

            {pins ? (
              <Html position={f.labelPos} occlude={occluders} zIndexRange={[20, 0]} portal={pinHome}>
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
