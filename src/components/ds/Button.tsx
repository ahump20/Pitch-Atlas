import { createElement } from 'react'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas Button — one component over the app's existing, proven button
 * treatments, so adoption preserves parity rather than reskinning:
 *   chrome / ghost → the home chrome-lipped CTA (.v2-cta)
 *   foil   / ink   → the wax-seal button (.btn-foil)
 *   link           → a quiet mono text link (.ds-btn-link)
 * Polymorphic via `as` (use a router Link or 'a' for navigation). The optional
 * arrow rides the existing flex `gap` for spacing.
 */
export type ButtonVariant = 'chrome' | 'ghost' | 'foil' | 'ink' | 'link'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  chrome: 'v2-cta',
  ghost: 'v2-cta is-ghost',
  foil: 'btn-foil',
  ink: 'btn-foil is-ink',
  link: 'ds-btn-link',
}

export type ButtonProps<E extends ElementType = 'button'> = {
  /** Element/component to render as. Use a router Link or 'a' for navigation. @default 'button' */
  as?: E
  /** Visual register, mapped to an existing Pitch Atlas button class. @default 'chrome' */
  variant?: ButtonVariant
  /** Append a → glyph (decorative, aria-hidden). @default false */
  arrow?: boolean
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'variant' | 'arrow' | 'className' | 'children'>

export function Button<E extends ElementType = 'button'>({
  as,
  variant = 'chrome',
  arrow = false,
  className,
  children,
  ...rest
}: ButtonProps<E>) {
  const Comp = (as ?? 'button') as ElementType
  return createElement(
    Comp,
    { className: cn(VARIANT_CLASS[variant], className), ...rest },
    children,
    arrow ? (
      <span aria-hidden="true" key="arrow">
        →
      </span>
    ) : null,
  )
}
