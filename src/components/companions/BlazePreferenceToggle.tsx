import { useId } from 'react'
import { useBlazePreference } from './useBlazePreference'

export function BlazePreferenceToggle() {
  const id = useId()
  const { enabled, setEnabled } = useBlazePreference()

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={enabled}
        onChange={(event) => setEnabled(event.target.checked)}
        className="h-4 w-4 rounded-sm border border-bone/30 bg-transparent accent-cyan"
      />
      <label htmlFor={id} className="mono-label-stage cursor-pointer select-none">
        Show Blaze companion
      </label>
    </div>
  )
}
