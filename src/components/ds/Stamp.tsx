import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas Stamp — the rarity-index ink stamp: blocky uppercase mono in a
 * thin box, set a degree off-square like a hand stamp. One component over the
 * app's existing `.rfx-stamp` treatment, so adoption preserves parity rather
 * than reskinning.
 *
 * Color rides on `currentColor`: the stamp inherits its ink (text and the box
 * border alike) from whatever sets `color` on or above it — it never hardcodes
 * one. `.rfx-stamp` is a leaf label with no inner structure or active/on-state,
 * so the markup is a single `<span>` with the text directly inside. Pass
 * positioning/utility classes through `className` exactly as the live call
 * sites do (absolute placement, rotation overrides, and so on).
 */
export type StampProps = HTMLAttributes<HTMLSpanElement>

export function Stamp({ className, children, ...rest }: StampProps) {
  return (
    <span className={cn('rfx-stamp', className)} {...rest}>
      {children}
    </span>
  )
}
