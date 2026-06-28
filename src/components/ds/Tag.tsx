import { createElement } from 'react'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas Tag — one component over the app's existing filter-chip treatment
 * (`.rfx-chip`), so adoption preserves parity rather than reskinning. A small
 * mono pill for a pitch family or a filter: uppercase mono, transparent by
 * default, filling with the scene accent when on.
 *
 * The on-state is driven entirely by `aria-pressed="true"` — the only hook the
 * class exposes (`.rfx-chip[aria-pressed="true"]`); there is **no** modifier
 * class. So `active` maps straight to `aria-pressed`, exactly as the live filter
 * chips in `GripViewer` do (`aria-pressed={view === id}`). Render it `as="button"`
 * for an interactive toggle so the ARIA is valid; the default `span` suits a
 * non-interactive family label, where omitting `active` reads as an off chip.
 *
 * The optional `glyph` renders as a direct child *before* the label — matching
 * the live "show the hand" chip, whose status dot is a direct flex child so it
 * keeps its own sizing. It is rendered as-is (not wrapped), so a sized glyph
 * stays a direct flex child; the glyph is decorative, so mark it `aria-hidden`
 * at the call site as the app does. Polymorphic via `as`.
 */
export type TagProps<E extends ElementType = 'span'> = {
  /** Element/component to render as. Use `'button'` for an interactive filter toggle. @default 'span' */
  as?: E
  /** On-state. Maps to `aria-pressed="true"`, the class's only on-state hook. @default undefined (off) */
  active?: boolean
  /** Optional decorative glyph rendered before the label, kept a direct child. */
  glyph?: ReactNode
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'active' | 'glyph' | 'className' | 'children'>

export function Tag<E extends ElementType = 'span'>({
  as,
  active,
  glyph,
  className,
  children,
  ...rest
}: TagProps<E>) {
  const Comp = (as ?? 'span') as ElementType
  return createElement(
    Comp,
    {
      ...rest,
      className: cn('rfx-chip', className),
      // active drives the existing on-state, which keys off aria-pressed="true".
      // Set it only when supplied, so a caller's own aria-pressed survives otherwise.
      ...(active === undefined ? null : { 'aria-pressed': active }),
    },
    glyph ?? null,
    children,
  )
}
