import { cn } from '@/lib/utils'

/**
 * Pitch Atlas SegmentedToggle — one component over the app's existing mono
 * segmented control (the RHP/LHP and view switches in MovementMap, GripCompare,
 * and TunnelPlot), so adoption preserves parity rather than reskinning. Renders
 * the existing shell (inline-flex, clipped corners, hairline border) with one
 * `.rfx-seg` <button> per option; the option whose value matches `value` carries
 * the on-state via `aria-pressed="true"`, which the `.rfx-seg` CSS keys on for
 * the accent fill. Controlled via value / onChange. The 44px coarse-pointer
 * target is handled by the CSS. Pass `className` to retune the shell (for
 * example `border-cyan/30` for the GripCompare register).
 */
export type SegmentedToggleOption = string | { value: string; label: string }

export interface SegmentedToggleProps {
  /** Segments, as bare strings (value = label) or { value, label } pairs. */
  options: SegmentedToggleOption[]
  /** The currently-selected option value (controlled). */
  value?: string
  /** Called with the option value when a segment is clicked. */
  onChange?: (value: string) => void
  /** Class merged onto the outer shell. */
  className?: string
}

export function SegmentedToggle({ options, value, onChange, className }: SegmentedToggleProps) {
  return (
    <div className={cn('inline-flex overflow-hidden rounded-lg border border-ink/25', className)}>
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value
        const optionLabel = typeof option === 'string' ? option : option.label
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange?.(optionValue)}
            aria-pressed={optionValue === value}
            className="rfx-seg"
          >
            {optionLabel}
          </button>
        )
      })}
    </div>
  )
}
