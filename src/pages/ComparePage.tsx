import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import { PITCHES, pitchBySlug } from '../data/pitches'
import { BenchBody, type BenchAspect } from '../components/inspector/BenchBody'
import { useCompare } from '../components/compare/compareContext'
import { EMPTY_SELECTION, type CompareView } from '../components/compare/selection'
import { canonicalUrl } from '../lib/seo'

/*
  The full-page bench for a pair: the same body the inspector opens over a list, here
  with its own pickers and a shareable address (a, b, view, hand, orientation; the
  view names are the address's and stay as they were).
*/
const ASPECT_OF: Record<CompareView, BenchAspect> = { grips: 'grip', cues: 'release', movement: 'flight' }
const VIEW_LABEL: Record<CompareView, string> = { grips: 'Grip', cues: 'Release', movement: 'Flight' }

export function ComparePage() {
  const compare = useCompare()
  const selection = compare?.selection ?? EMPTY_SELECTION
  const update = compare?.update ?? (() => {})
  const a = selection.a ? pitchBySlug(selection.a) : undefined
  const b = selection.b ? pitchBySlug(selection.b) : undefined
  useSeoMeta({ title: 'Compare grips, cues, and movement | Pitch Atlas', description: 'Study two filed pitches together. Compare their grips, sourced cues and schematic movement without losing your place.', ogUrl: canonicalUrl('/compare') })
  return <div className="archive-compare">
    <header className="archive-compare-header">
      <Link to="/repertoire" className="archive-back">Back to the Pitch Index</Link>
      <div className="compare-heading-line"><h1>Look at <span>the difference.</span></h1>
      <p>Two grips on the same table.<br />{' '}Turn them together. Follow what changes.</p></div>
    </header>
    <div className="compare-controls">
      <div className="compare-pickers">
        {(['a', 'b'] as const).map((slot, i) => <label key={slot}><span id={`compare-label-${slot}`}>{i === 0 ? 'First pitch' : 'Second pitch'}</span><select aria-labelledby={`compare-label-${slot}`} className="rfx-select" value={selection[slot] ?? ''} onChange={(e) => update({ [slot]: e.target.value || null })}><option value="">Choose…</option>{PITCHES.map((entry) => <option key={entry.display.slug} value={entry.display.slug} disabled={selection[slot === 'a' ? 'b' : 'a'] === entry.display.slug}>{entry.display.shortName}</option>)}</select></label>)}
        <button className="archive-icon-action" aria-label="Swap pitches" disabled={!a || !b} onClick={() => update({ a: selection.b, b: selection.a })}><ArrowLeftRight size={20} /></button>
        <button className="archive-icon-action" aria-label="Clear comparison" onClick={() => update({ a: null, b: null })}><RotateCcw size={18} /></button>
      </div>
      <div className="compare-toolbar">
        <div className="compare-tabs" role="group" aria-label="Aspect">{(['grips', 'cues', 'movement'] as CompareView[]).map((view) => <button key={view} aria-pressed={selection.view === view} onClick={() => update({ view })}>{VIEW_LABEL[view]}</button>)}</div>
      </div>
    </div>
    {!a || !b ? <section className="compare-empty"><span aria-hidden="true">A / B</span><h2>{a || b ? 'Bring another pitch to the table.' : 'Start with two pitches.'}</h2><p>Choose from the selectors above, or select Compare while exploring the Pitch Index. An unavailable pitch leaves its place open.</p><Link className="archive-action" to="/repertoire">Explore the index</Link></section> : <>
      <div className="bench bench--page" data-count={2}>
        <BenchBody entries={[a, b]} aspect={ASPECT_OF[selection.view]} orientation={selection.orientation} hand={selection.hand} onChange={(change) => update(change)} />
      </div>
      <aside className="compare-next"><div><p className="archive-eyebrow">Put the difference in context</p><h2>What does the next pitch change?</h2><p>Keep this pair at the table while you explore how pitches work together.</p></div><Link to="/learn/sequencing" className="archive-text-link">Read the sequencing lesson <span aria-hidden="true">→</span></Link></aside>
    </>}
  </div>
}
