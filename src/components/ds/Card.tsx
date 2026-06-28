import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas Card — the app's lifted leather panel on the void, rendered over
 * the existing `.rfx-panel` treatment so adoption is parity, not a reskin.
 * Children are placed as direct children: the stylesheet's `.rfx-panel > *` rule
 * lifts them above the raking-light catch (`.rfx-panel::before`), which is how
 * every existing `.rfx-panel` usage is built — so the Card wraps nothing in the
 * default register.
 *
 * `foil` swaps to the existing foil-edged sibling `.rfx-panel-foil`. That class
 * draws its bright edge as a 1px gradient frame and fills a single inner wrapper
 * (`.rfx-panel-foil > *`), so the foil register nests exactly one bare inner
 * `<div>` — the markup that class's CSS contract requires.
 *
 * There is deliberately no `interactive` prop. `.rfx-panel` defines no hover /
 * focus / active / interactive state anywhere in the stylesheet, so there is no
 * real class to wire to; exposing one would mean inventing CSS, which this
 * consolidation does not do.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Render the foil-edged panel (`.rfx-panel-foil`, which fills one bare inner
   * `<div>`) instead of the default leather panel (`.rfx-panel`).
   * @default false
   */
  foil?: boolean
}

export function Card({ foil = false, className, children, ...rest }: CardProps) {
  if (foil) {
    return (
      <div className={cn('rfx-panel-foil', className)} {...rest}>
        <div>{children}</div>
      </div>
    )
  }

  return (
    <div className={cn('rfx-panel', className)} {...rest}>
      {children}
    </div>
  )
}
