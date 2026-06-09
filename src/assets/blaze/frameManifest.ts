import type { BlazeMood } from '../../components/companions/blazeMotion'

export const BLAZE_FRAME_WIDTH = 192
export const BLAZE_FRAME_HEIGHT = 208
export const BLAZE_SHEET_COLUMNS = 8
export const BLAZE_SHEET_ROWS = 9

interface BlazeFrame {
  row: number
  col: number
}

interface BlazeFrameSequence {
  label: string
  frames: readonly BlazeFrame[]
  durationMs: number
  loop: boolean
}

function rowFrames(row: number, startCol: number, frameCount: number): BlazeFrame[] {
  return Array.from({ length: frameCount }, (_, index) => ({ row, col: startCol + index }))
}

export const BLAZE_FRAME_MANIFEST: Record<Exclude<BlazeMood, 'hidden'>, BlazeFrameSequence> = {
  idle: {
    label: 'idle',
    frames: rowFrames(0, 0, 6),
    durationMs: 7600,
    loop: true,
  },
  chasing: {
    label: 'trot/chase',
    frames: rowFrames(1, 0, 8),
    durationMs: 980,
    loop: true,
  },
  caught: {
    label: 'catch',
    frames: rowFrames(3, 0, 4),
    durationMs: 860,
    loop: false,
  },
  sniffing: {
    label: 'sniff',
    frames: rowFrames(5, 0, 4),
    durationMs: 2200,
    loop: false,
  },
  napping: {
    label: 'nap',
    frames: rowFrames(7, 0, 6),
    durationMs: 5600,
    loop: true,
  },
  concerned: {
    label: 'concerned',
    frames: rowFrames(8, 0, 4),
    durationMs: 1100,
    loop: false,
  },
  still: {
    label: 'still',
    frames: rowFrames(0, 0, 1),
    durationMs: 0,
    loop: false,
  },
} as const
