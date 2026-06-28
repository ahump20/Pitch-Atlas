import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas Input — the bare archival text field, one component over the
 * app's existing `.rfx-input` control treatment (search bars, tool controls)
 * so adoption preserves parity rather than reskinning. `SearchField` owns the
 * icon-led search shell; this is the plain field on the same control tokens.
 * When `label` is set, a `.mono-label` field label is rendered above the input
 * and wired to it via htmlFor/id — a generated id (React `useId`) is used when
 * no `id` prop is passed, so the association always holds.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional mono field-label, rendered above the field and associated with it. */
  label?: string
}

export function Input({ label, id, className, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const field = (
    <input id={label != null ? inputId : id} className={cn('rfx-input', className)} {...rest} />
  )
  if (label == null) return field
  return (
    <div>
      <label className="mono-label" htmlFor={inputId}>
        {label}
      </label>
      {field}
    </div>
  )
}
