/*
  Pitch classifier. A faithful TypeScript port of the pitching-coach skill's
  classify_pitch.py: turn a tracking line (velocity + movement, optionally spin and
  efficiency) into a labeled pitch family with honest confidence and a runner-up.

  Movement alone places a pitch in a family far more reliably than the eye, but it
  is a REASONED read, not a verified pitch ID — grip and high-speed video are what
  confirm the exact pitch. The result says so. Centroids are the midpoints of the
  bands in the pitch taxonomy; horizontal break is arm-side-positive for both
  hands, so the classifier is handedness-agnostic.
*/

export interface ClassifyInput {
  /** Velocity, mph. */
  velo: number
  /** Induced vertical break, inches: + ride/carry, - drop. */
  ivb: number
  /** Horizontal break, inches: + arm-side run, - glove-side. */
  hb: number
  /** Total spin, rpm (optional; enables knuckleball detection). */
  spin?: number | null
  /** Spin efficiency / active spin, percent 0-100 (optional; enables gyro-slider detection). */
  eff?: number | null
  /** Pitcher handedness (optional; only enriches the notes). */
  hand?: 'R' | 'L' | null
}

export type Confidence = 'high' | 'medium' | 'low'

export interface ClassifyResult {
  best: string
  confidence: Confidence
  alternates: { type: string; distance: number }[]
  notes: string[]
}

// Centroid = [velocity_mph, induced_vertical_break_in, horizontal_break_in].
// HB is arm-side-positive. Midpoints of the taxonomy bands; pro-level (scale the
// velocity down for college/HS, the movement shapes hold).
const CENTROIDS: Record<string, [number, number, number]> = {
  'four-seam fastball': [95, 15, 6],
  'two-seam fastball': [93, 8, 13],
  sinker: [93, 4, 14],
  cutter: [89, 8, -4],
  splitter: [86, -4, 5],
  changeup: [85, 2, 12],
  screwball: [76, -4, 12],
  slider: [85, -2, -7],
  sweeper: [82, -2, -16],
  slurve: [81, -7, -12],
  curveball: [78, -14, -6],
}

// ~6 mph ~ 5 inches ~ 5 inches counts as one unit of wrong.
const SCALE = { velo: 6.0, ivb: 5.0, hb: 5.0 }

function distance(velo: number, ivb: number, hb: number, c: [number, number, number]): number {
  return Math.sqrt(
    ((velo - c[0]) / SCALE.velo) ** 2 +
      ((ivb - c[1]) / SCALE.ivb) ** 2 +
      ((hb - c[2]) / SCALE.hb) ** 2,
  )
}

/** Slug of a filed specimen for a classified family, when the atlas has one on file. */
export function filedSlugFor(name: string): string | null {
  const map: Record<string, string> = {
    'four-seam fastball': 'four-seam',
    'two-seam fastball': 'two-seam',
    sinker: 'two-seam',
    cutter: 'cutter',
    splitter: 'splitter',
    changeup: 'circle-change',
    slider: 'slider',
    'gyro slider': 'slider',
    sweeper: 'sweeper',
    curveball: 'twelve-six',
    knuckleball: 'knuckleball',
    eephus: 'eephus',
  }
  return map[name] ?? null
}

export function classifyPitch({ velo, ivb, hb, spin = null, eff = null, hand = null }: ClassifyInput): ClassifyResult {
  const notes: string[] = []

  // --- Hard overrides: things velo + break alone can't catch ---
  if (velo < 65) {
    return {
      best: 'eephus',
      confidence: 'high',
      alternates: [],
      notes: ['Velocity under 65 mph: this is a lob, not a power pitch.'],
    }
  }
  if (spin !== null && spin < 1500 && velo < 80) {
    return {
      best: 'knuckleball',
      confidence: 'high',
      alternates: [],
      notes: [
        'Near-zero spin (under 1,500 rpm) at low velocity: a knuckleball, whose path is set by seams and air, not by the arm.',
      ],
    }
  }

  // --- Nearest-centroid scoring ---
  const ranked = Object.entries(CENTROIDS)
    .map(([name, c]) => ({ name, d: distance(velo, ivb, hb, c) }))
    .sort((a, b) => a.d - b.d)

  let bestName = ranked[0].name
  const bestD = ranked[0].d
  const secondD = ranked[1].d

  // Gyro slider: a slider/cutter shape with very low spin efficiency.
  if (eff !== null && eff < 25 && (bestName === 'slider' || bestName === 'cutter')) {
    notes.push(
      `Spin efficiency ${Math.round(eff)}% is gyro-dominant: read this as a GYRO SLIDER ("bullet slider"), shaped like a ${bestName} but breaking late and tight rather than sweeping.`,
    )
    bestName = 'gyro slider'
  }

  // Changeup-variant hint: a changeup shape with splitter-like drop.
  if (bestName === 'changeup' && ivb < -2) {
    notes.push(
      'Changeup shape with extra drop: could be a kick change or split-change (vulcan), the modern drop-changeup variants.',
    )
  }

  // Confidence from how cleanly the best beats the runner-up.
  const gap = secondD - bestD
  let confidence: Confidence
  if (bestD > 2.2) {
    confidence = 'low'
    notes.push('Far from every archetype: an unusual shape, a bad input, or a pitch between two families.')
  } else if (gap < 0.4) {
    confidence = 'low'
  } else if (gap < 0.9) {
    confidence = 'medium'
  } else {
    confidence = 'high'
  }

  if (hand === 'R' || hand === 'L') {
    let note: string
    if (Math.abs(hb) <= 1) {
      note = 'stays fairly true (little horizontal break)'
    } else if (hb > 1) {
      note = hand === 'R' ? 'runs arm-side: in on a RHH, away from a LHH' : 'runs arm-side: in on a LHH, away from a RHH'
    } else {
      note = hand === 'R' ? 'breaks glove-side: away from a RHH, in on a LHH' : 'breaks glove-side: away from a LHH, in on a RHH'
    }
    notes.push(`For a ${hand}HP this ${note}.`)
  }

  notes.push('Reasoned, not verified: movement places the family; grip and high-speed video confirm the exact pitch.')

  return {
    best: bestName,
    confidence,
    alternates: ranked.slice(1, 4).map((r) => ({ type: r.name, distance: Math.round(r.d * 100) / 100 })),
    notes,
  }
}
