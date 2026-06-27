import type { ReactNode } from 'react'
import { useEgg } from './EggProvider'

/*
  A hidden-in-plain-sight trigger. It wraps an element that already belongs on the
  surface (a date, a specimen number, a seam glyph) and quietly makes it the egg.
  Visually it stays part of the design; it is a real, keyboard-reachable button with
  an aria-label, so the screen-reader and keyboard paths can find it too. Once the
  tidbit is found, a faint cyan underline hints the spot is special.
*/
export function EggButton({
  tidbitId,
  label,
  className = '',
  children,
}: {
  tidbitId: string
  label: string
  className?: string
  children: ReactNode
}) {
  const { reveal, has } = useEgg()
  const found = has(tidbitId)

  return (
    <button
      type="button"
      onClick={() => reveal(tidbitId)}
      aria-label={label}
      className={`cursor-pointer rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/70 ${
        found ? 'underline decoration-cyan/40 underline-offset-2' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}
