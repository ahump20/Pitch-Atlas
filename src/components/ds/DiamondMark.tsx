import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas DiamondMark — the compact PA diamond device, rendered over the
 * app's existing `.rfx-diamond` brand mark so adoption preserves parity with the
 * refractor card rather than reskinning it. The class tilts the diamond 45° and
 * counter-rotates its single child back upright, so the glyph has to be a real
 * child element — a bare text node would ride the 45° tilt. `gold` swaps to the
 * 1/1-chase gold face via `.is-gold`; `size` drives both width and height;
 * everything else (style, aria-*, title, handlers) forwards to the span.
 */
export interface DiamondMarkProps extends HTMLAttributes<HTMLSpanElement> {
  /** Glyph set upright inside the diamond. @default 'PA' */
  label?: string
  /** Wear the gold (1/1 chase) face via `.is-gold`. @default false */
  gold?: boolean
  /** Square edge length in px, applied to both width and height. @default 48 */
  size?: number
}

export function DiamondMark({
  label = 'PA',
  gold = false,
  size = 48,
  className,
  style,
  ...rest
}: DiamondMarkProps) {
  return (
    <span
      className={cn('rfx-diamond', gold && 'is-gold', className)}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <b>{label}</b>
    </span>
  )
}
