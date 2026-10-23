import { Pause, Play } from 'lucide-react'
import { setMotionPref, useMotionPref } from './material/motionPref'

/*
  The visitor's switch on the hero's ambient turn, kept on the device and honoured by
  every ambient driver on the page. The label names the action the press will take
  ("Pause motion", then "Resume motion"), so the button carries no pressed state: a
  toggle whose name changes as well would announce "Resume motion, pressed". The
  paused look rides on data-state. Not shown under reduced motion, where there is
  nothing to pause.
*/
export function PauseMotionButton({ className = '' }: { className?: string }) {
  const paused = useMotionPref() === 'paused'
  return (
    <button
      type="button"
      className={`specimen-action ${className}`}
      data-state={paused ? 'paused' : 'live'}
      onClick={() => setMotionPref(paused ? 'live' : 'paused')}
    >
      {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      {paused ? 'Resume motion' : 'Pause motion'}
    </button>
  )
}
