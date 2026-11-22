import type { LobParams } from './flight'

/*
  The slow-pitch arsenal: how each pitch spins, as the flight model's inputs.

  A pitch here is a spin, laid over one of the lab's lobs: the lob says where it
  peaks and lands, the pitch says how the ball turns on the way. Every number is
  a model input set by hand. Spin rates are never shown to a visitor; what they
  see is the ball turning, the plane it turns in, and how far its path bends
  from the same throw with no spin.
*/

export type PitchKind = 'lob' | 'knuckler' | 'backspin' | 'topspin' | 'sidespin'

export const PITCH_KINDS: readonly PitchKind[] = ['lob', 'knuckler', 'backspin', 'topspin', 'sidespin']

/** What a pitch does to a lob's spin. `rpm: null` keeps the lob's own hand-set spin. */
export interface PitchSpinInput {
  rpm: number | null
  /** Spin-axis tilt off backspin, degrees: 180 turns it into topspin, 90 into side spin. */
  push: number
  /** Seam-force coefficient; 0 for every pitch but the knuckler. */
  knuckle: number
}

export const PITCH_SPIN: Record<PitchKind, PitchSpinInput> = {
  lob: { rpm: null, push: 0, knuckle: 0 },
  // Under half a turn on the way in: the knuckleball model's dance needs the ball nearly still.
  knuckler: { rpm: 12, push: 0, knuckle: 0.25 },
  backspin: { rpm: 500, push: 0, knuckle: 0 },
  topspin: { rpm: 400, push: 180, knuckle: 0 },
  sidespin: { rpm: 450, push: 90, knuckle: 0 },
}

export function isPitchKind(value: string | null | undefined): value is PitchKind {
  return (PITCH_KINDS as readonly string[]).includes(value ?? '')
}

/** A lob thrown as `kind`; `seam` is where a knuckler's seams start. */
export function withPitch(lob: LobParams, kind: PitchKind, seam = 0): LobParams {
  const spin = PITCH_SPIN[kind]
  const out: LobParams = { apex: lob.apex, land: lob.land, side: lob.side, rpm: spin.rpm ?? lob.rpm, push: spin.rpm === null ? lob.push : spin.push }
  if (spin.knuckle > 0) {
    out.knuckle = spin.knuckle
    out.seam = seam
  }
  return out
}

/** The golden angle. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/**
 * Where the seams start on the `n`th knuckler thrown: spread evenly, never
 * random. The seam force beats four times a turn, so the step is a quarter of
 * the golden angle: the beat itself walks by the golden angle, and no two
 * throws in a row come out as mirror images.
 */
export function seamFor(n: number): number {
  const turn = 2 * Math.PI
  return (((n * GOLDEN) / 4) % turn + turn) % turn
}
