import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for {@link Kicker}. Extends the standard paragraph attributes, so `id`,
 * `aria-*`, `data-*`, event handlers, etc. forward straight through to the `<p>`.
 */
export interface KickerProps extends HTMLAttributes<HTMLParagraphElement> {
  /**
   * Reserved for a future no-rule treatment. `.rfx-skick` always draws its short
   * leading rule through a `::before`, and the design system ships **no** no-rule
   * modifier class — so this prop is currently a documented no-op kept so the API
   * stays stable if such a modifier is added later. `rule={false}` does NOT hide
   * the rule today; doing so would require new CSS, which is out of scope for this
   * parity consolidation. The prop is pulled out of the spread so it never lands
   * on the DOM as an attribute.
   * @default true
   */
  rule?: boolean
}

/**
 * Kicker — the mono section eyebrow (`.rfx-skick`): small uppercase, wide-tracked
 * mono text with a short leading rule drawn by the class's `::before`. Renders the
 * exact element `SectionHero` uses for its eyebrow — a `<p className="rfx-skick">`.
 *
 * Color comes entirely from the class: leather ink on the cream field, re-toning to
 * the cyan glow inside a `.scene-coal` scene via the scoped `--kicker` token.
 * Override the tone with a `text-*` utility through `className` (as the app does
 * with `rfx-skick text-cyan`), never with a literal here.
 */
export function Kicker({ children, rule: _rule = true, className, ...props }: KickerProps) {
  return (
    <p className={cn('rfx-skick', className)} {...props}>
      {children}
    </p>
  )
}
