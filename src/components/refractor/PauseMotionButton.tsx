import { Pause, Play } from 'lucide-react'
import { setMotionPref, useMotionPref } from './material/motionPref'

/*
  The visitor's switch on the hero's ambient turn. A real toggle (aria-pressed), kept
  on the device, honoured by every ambient driver on the page. Not shown under
  reduced motion, where there is nothing to pause.
*/
export function PauseMotionButton({ className = '' }: { className?: string }) {
  const paused = useMotionPref() === 'paused'
  return (
    <button
      type="button"
      className={`specimen-action ${className}`}
      aria-pressed={paused}
      onClick={() => setMotionPref(paused ? 'live' : 'paused')}
    >
      {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      {paused ? 'Resume motion' : 'Pause motion'}
    </button>
  )
}
