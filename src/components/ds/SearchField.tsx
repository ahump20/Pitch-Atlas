import type { InputHTMLAttributes, KeyboardEvent } from 'react'
import { SearchIcon } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas SearchField — the Pitch Index search, extracted into one reusable
 * primitive. Renders the existing InputGroup + leading lucide search glyph +
 * type="search" composition verbatim (so adoption is a pure refactor), with
 * Escape-to-clear wired through `onClear`. Controlled via the standard
 * value / onChange input props.
 */
export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Called when Escape is pressed while the field is non-empty. */
  onClear?: () => void
  /** Class applied to the outer field shell (the InputGroup). */
  groupClassName?: string
}

export function SearchField({ onClear, className, groupClassName, onKeyDown, ...rest }: SearchFieldProps) {
  return (
    <InputGroup className={cn('h-11 rounded-xl border-cyan/40 bg-[#1D1710] text-bone', groupClassName)}>
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        className={cn('h-full text-[15px] placeholder:text-ink-3', className)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Escape' && e.currentTarget.value !== '') onClear?.()
          onKeyDown?.(e)
        }}
        {...rest}
      />
    </InputGroup>
  )
}
