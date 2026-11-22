import {
  FT,
  IN,
  PLATE,
  RELEASE,
  compareBats,
  contactPivot,
  judgePitch,
  landmarks,
  meetBall,
  reachHeatMap,
  solveLob,
  sweetSpotReach,
  withPitch,
  zoneBounds,
  type BatComparison,
  type BatterContact,
  type Flight,
  type Landmarks,
  type LobParams,
  type PitchKind,
  type PitchReading,
  type ReachHeatMap,
  type RuleKey,
  type Stance,
} from '../../lib/slowpitch'
import {
  EXAMPLE_LOBS,
  FLIGHT_LAB_RULEBOOKS,
  SLOWPITCH_ARSENAL,
  type FlightLabLob,
  type FlightLabPitch,
  type FlightLabRulebook,
} from '../../data/softball'

/*
  The Flight Lab's one model. The page text, the 3D scene and the 2D schematic
  all read this object, and it reads only `src/lib/slowpitch`, so the three can
  never disagree about where a lob crosses or where the barrel meets it.

  Pure: no React, no three, no DOM. It runs at build time for the prerender too.
*/

export type LobKey = FlightLabLob['key']
export type CameraView = 'zone' | 'catcher' | 'arc' | 'reach' | 'ball'

export const CAMERA_VIEWS: { value: CameraView; label: string }[] = [
  { value: 'zone', label: 'Zone' },
  { value: 'catcher', label: 'Catcher' },
  { value: 'arc', label: 'Arc' },
  { value: 'reach', label: 'Reach' },
  { value: 'ball', label: 'Ball' },
]

/** A request to throw: a new `id` starts it; `indices` are the lobs to throw. */
export interface ThrowRequest {
  id: number
  indices: number[]
}

/**
 * How fast the clock runs near the plate, 0.22..1: the throw slows as the ball
 * comes into the zone so the eye can follow the last few feet. `z` is the
 * ball's depth in metres.
 */
export function nearPlateTimeScale(z: number): number {
  const k = Math.min(1, Math.max(0, (Math.abs(z) - 1) / 1.6))
  return 0.22 + 0.78 * (k * k * (3 - 2 * k))
}

/** How fast a drawn ball turns against its modelled spin: slowed so the eye can read the seams. */
export const SPIN_VIEW_RATE = 0.25

/**
 * The ball's turning as seen from the side (the schematic's view, the Zone
 * camera's, looking in from the first-base side): the ring it turns in and the
 * bead riding that ring, after `t` seconds of flight, in ball radii, as (z, y):
 * depth toward the catcher and height. `bead[2]` is how far the bead sits
 * toward the viewer, -1..1.
 */
export function sideSpinGlyph(flight: Flight, t: number): { ring: [number, number][]; bead: [number, number, number] } {
  const [ax, ay, az] = flight.spinAxis
  // two unit vectors square to the axis and to each other
  const ref = Math.abs(ay) > 0.9 ? [1, 0, 0] : [0, 1, 0]
  const ux = ay * ref[2] - az * ref[1]
  const uy = az * ref[0] - ax * ref[2]
  const uz = ax * ref[1] - ay * ref[0]
  const ul = Math.hypot(ux, uy, uz) || 1
  const u = [ux / ul, uy / ul, uz / ul]
  const w = [ay * u[2] - az * u[1], az * u[0] - ax * u[2], ax * u[1] - ay * u[0]]
  const at = (a: number) => [Math.cos(a) * u[0] + Math.sin(a) * w[0], Math.cos(a) * u[1] + Math.sin(a) * w[1], Math.cos(a) * u[2] + Math.sin(a) * w[2]]
  const ring: [number, number][] = []
  for (let i = 0; i <= 24; i++) {
    const p = at((i / 24) * Math.PI * 2)
    ring.push([p[2], p[1]])
  }
  const b = at(flight.spinRate * t * SPIN_VIEW_RATE)
  return { ring, bead: [b[2], b[1], b[0]] }
}

/** Slow motion's clock rate. */
export const SLOW_RATE = 0.35

/** Bat lengths the compare switch offers; 0 is off. */
export const COMPARE_OPTIONS = [0, 31, 32, 33] as const

export const HEIGHT_RANGE = { min: 50, max: 80 } as const
export const TOES_RANGE = { min: 4, max: 36 } as const

export interface LabLob {
  key: LobKey
  name: string
  color: string
  params: LobParams
  flight: Flight
  reading: PitchReading
}

export interface LabModel {
  rule: RuleKey
  rulebook: FlightLabRulebook
  /** The pitch every lob is thrown as. */
  pitch: FlightLabPitch
  stance: Stance
  /** The bat being compared against, inches; 0 when the compare is off. */
  compareIn: number
  lobs: LabLob[]
  selectedIndex: number
  selected: LabLob
  marks: Landmarks
  zone: { bottom: number; top: number }
  /** Where the swing turns at contact, (x, z) metres. */
  pivot: { x: number; z: number }
  /** Hands to sweet spot at contact, metres: this bat and the compared one (0 when off). */
  reach: number
  reachOld: number
  /** The look-for landing window along z, metres, or null when nothing reaches the barrel. */
  hotZ: [number, number] | null
  /** The strike lane along z, metres (zone rules only). */
  laneZ: [number, number] | null
  heat: ReachHeatMap
  comparison: BatComparison | null
  /** Where the compared bat would meet the selected lob. */
  compareContact: BatterContact | null
}

/** The example lobs' hand-set params, keyed for state. */
export function defaultLobParams(): Record<LobKey, LobParams> {
  return Object.fromEntries(EXAMPLE_LOBS.map((l) => [l.key, { ...l.params.value }])) as Record<LobKey, LobParams>
}

// Solving a lob is the expensive step (Newton on a full integration), and only
// the params decide it, so solved flights are kept by their params.
const flightCache = new Map<string, Flight>()
export function flightFor(params: LobParams): Flight {
  const key = `${params.apex}|${params.land}|${params.side}|${params.rpm}|${params.push}|${params.knuckle ?? 0}|${params.seam ?? 0}`
  let f = flightCache.get(key)
  if (!f) {
    if (flightCache.size > 120) flightCache.clear()
    f = solveLob(params)
    flightCache.set(key, f)
  }
  return f
}

export function rulebookFor(rule: RuleKey): FlightLabRulebook {
  return FLIGHT_LAB_RULEBOOKS.find((r) => r.key === rule) ?? FLIGHT_LAB_RULEBOOKS[0]
}

export function pitchFor(kind: PitchKind): FlightLabPitch {
  return SLOWPITCH_ARSENAL.find((p) => p.key === kind) ?? SLOWPITCH_ARSENAL[0]
}

export function isRuleKey(value: string | null): value is RuleKey {
  return value === 'usssa' || value === 'usa' || value === 'senior'
}

/** Inches past the plate's front edge, as a depth z in metres. */
export function zFromInchesPastFront(inches: number): number {
  return PLATE.front + inches * IN
}

export function buildLabModel(input: {
  rule: RuleKey
  stance: Stance
  compareIn: number
  params: Record<LobKey, LobParams>
  selected: LobKey
  /** The pitch to throw every lob as; a plain lob when absent. */
  pitch?: PitchKind
  /** Where a knuckler's seams start, radians. */
  seam?: number
}): LabModel {
  const { rule, stance, compareIn, params } = input
  const pitch = pitchFor(input.pitch ?? 'lob')
  const lobs: LabLob[] = EXAMPLE_LOBS.map((l) => {
    const p = withPitch(params[l.key] ?? l.params.value, pitch.key, input.seam ?? 0)
    const flight = flightFor(p)
    return { key: l.key, name: l.name, color: l.color, params: p, flight, reading: judgePitch(flight, rule, stance) }
  })
  const selectedIndex = Math.max(
    0,
    lobs.findIndex((l) => l.key === input.selected),
  )
  const selected = lobs[selectedIndex]
  const hot = selected.reading.lookFor.hot
  const senior = rule === 'senior'
  const compareOn = compareIn > 0 && compareIn !== stance.batIn
  return {
    rule,
    rulebook: rulebookFor(rule),
    pitch,
    stance,
    compareIn: compareOn ? compareIn : 0,
    lobs,
    selectedIndex,
    selected,
    marks: landmarks(stance.heightIn),
    zone: zoneBounds(stance.heightIn),
    pivot: contactPivot(stance),
    reach: sweetSpotReach(stance.heightIn, stance.batIn),
    reachOld: compareOn ? sweetSpotReach(stance.heightIn, compareIn) : 0,
    hotZ: hot ? [zFromInchesPastFront(hot[0]), zFromInchesPastFront(hot[1])] : null,
    laneZ: senior ? null : [selected.reading.call.lane.min, selected.reading.call.lane.max],
    heat: reachHeatMap(selected.flight, stance),
    comparison: compareOn ? compareBats(stance, compareIn) : null,
    compareContact: compareOn ? meetBall(selected.flight, { ...stance, batIn: compareIn }) : null,
  }
}

/* ── words ─────────────────────────────────────────────────────────────── */

export const round = (n: number) => String(Math.round(n))
export const fixed = (n: number, digits = 1) => n.toFixed(digits)

export function heightLabel(heightIn: number): string {
  return `${Math.floor(heightIn / 12)} ft ${heightIn % 12} in`
}

export function sideLabel(sideIn: number): string {
  if (sideIn === 0) return 'middle'
  return `${Math.abs(sideIn)} in ${sideIn < 0 ? 'inside' : 'outside'}`
}

/** A signed one-decimal figure: "+2.0", "-0.4". */
export function signed(n: number): string {
  const v = Math.abs(n) < 0.05 ? 0 : n
  return `${v >= 0 ? '+' : '-'}${Math.abs(v).toFixed(1)}`
}

/** The release height in feet, for the "Release" stat and tag. */
export const RELEASE_FT = RELEASE.y / FT

/** "6–37", or null when nothing at this arc reaches the barrel. */
export function lookForRange(model: LabModel): string | null {
  const hot = model.selected.reading.lookFor.hot
  return hot ? `${round(hot[0])}–${round(hot[1])}` : null
}
