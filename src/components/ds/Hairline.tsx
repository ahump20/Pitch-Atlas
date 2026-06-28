import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas Hairline — the 1px instrument-plate rule that marks every tier and
 * fades to the right (never a full box). One component over the app's existing,
 * proven rule treatments so adoption preserves parity rather than reskinning:
 *   default → .hairline       (machined-brown fade on the cream field)
 *   stage   → .hairline-stage (bone fade tuned for the dark stage)
 * Presentational and decorative: a self-closing separator with no children, so a
 * screen reader skips it. Rendered as a block <div> (not the inline <span> the
 * tier markers happen to use) so the gradient rule holds its 1px height and full
 * width even outside a flex row; inside one it still grows to fill the track.
 */
export interface HairlineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Render the bone-on-dark variant (.hairline-stage) for the dark stage. @default false */
  stage?: boolean
}

export function Hairline({ stage = false, className, ...rest }: HairlineProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      {...rest}
      className={cn(stage ? 'hairline-stage' : 'hairline', className)}
    />
  )
}
