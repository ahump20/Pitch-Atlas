import { Link, useLocation } from 'react-router-dom'
import { Columns2, X } from 'lucide-react'
import { pitchBySlug } from '../../data/pitches'
import { useCompare } from './compareContext'
import { compareUrl } from './selection'
export function CompareTray() {
  const compare = useCompare()
  const location = useLocation()
  if (!compare || location.pathname.replace(/\/+$/, '') === '/compare' || (!compare.selection.a && !compare.selection.b)) return null
  const { selection, update } = compare
  return <aside className="compare-tray" aria-label="Selected pitches">
    <Columns2 size={20} aria-hidden="true" />
    <div className="compare-tray-slots">
      {(['a', 'b'] as const).map((slot) => <div key={slot} className="compare-tray-slot">{selection[slot] ? <><span>{pitchBySlug(selection[slot]!)?.display.shortName}</span><button aria-label={`Remove ${pitchBySlug(selection[slot]!)?.display.shortName}`} onClick={() => update({ [slot]: null })}><X size={14} /></button></> : <span className="compare-empty-slot">Choose another pitch</span>}</div>)}
    </div>
    <Link to={compareUrl(selection)} className="archive-action">{selection.a && selection.b ? 'Compare pair' : 'Choose second pitch'}</Link>
    <span className="sr-only" role="status">{[selection.a, selection.b].filter(Boolean).length} of 2 pitches selected</span>
  </aside>
}
