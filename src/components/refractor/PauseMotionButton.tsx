import { Pause, Play } from 'lucide-react'
import { setMotionPref, useMotionPref } from './material/motionPref'

/*
  The visitor's switch on ambient motion: the hero's turn and every looping grip clip.
  It is kept on the device, so a Pause pressed on one page still holds the clips on
  the next; every page that shows a loop carries one of these, so the way back is
  always on the page. The label names the action the press will take
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
