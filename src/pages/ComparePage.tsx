import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import { PITCHES, pitchBySlug } from '../data/pitches'
import type { GripView, Handedness, PitchAtlasEntry } from '../data/types'
import { GripUnfiledState } from '../components/grip/GripUnfiledState'
import { GripSourceBadge } from '../components/grip/GripSourceBadge'
import { BallStage } from '../components/ball/BallStage'
import { TunnelPlot } from '../components/sections/TunnelPlot'
import { ClaimProse } from '../components/provenance/ClaimProse'
import { useCompare } from '../components/compare/compareContext'
import { EMPTY_SELECTION, type CompareView } from '../components/compare/selection'
import { canonicalUrl } from '../lib/seo'

const CUE_SECTIONS = ['The hold', 'Grip details', 'Release and mechanics', 'Master variants'] as const

function CueComparison({ entries }: { entries: PitchAtlasEntry[] }) {
  return <>{CUE_SECTIONS.map((label, section) => <section key={label} className="compare-cue-row">
    <h2>{label}</h2>
    <div className="compare-cue-cells">{entries.map((entry, index) => <article key={entry.display.slug}>
      <h3><span>{index === 0 ? 'A' : 'B'}</span> {entry.display.shortName}</h3>
      {section === 0 && <ClaimProse claim={entry.canonical.grip} />}
      {section === 1 && (entry.canonical.gripDetails.length ? entry.canonical.gripDetails.map((claim, i) => <ClaimProse key={i} claim={claim} />) : <p>Not documented.</p>)}
      {section === 2 && <ClaimProse claim={entry.canonical.mechanics} />}
      {section === 3 && (entry.masterVariants.length ? entry.masterVariants.map(variant => <div key={variant.pitcher}><h4>{variant.pitcher}</h4><ClaimProse claim={variant.distinction} /></div>) : <p>Not documented.</p>)}
    </article>)}</div>
  </section>)}</>
}

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
        {(['a', 'b'] as const).map((slot, i) => <label key={slot}><span id={`compare-label-${slot}`}>{i === 0 ? 'First pitch' : 'Second pitch'}</span><select aria-labelledby={`compare-label-${slot}`} className="rfx-select" value={selection[slot] ?? ''} onChange={(e) => update({ [slot]: e.target.value || null })}><option value="">Choose a filed pitch</option>{PITCHES.map((entry) => <option key={entry.display.slug} value={entry.display.slug} disabled={selection[slot === 'a' ? 'b' : 'a'] === entry.display.slug}>{entry.display.shortName}</option>)}</select></label>)}
        <button className="archive-icon-action" aria-label="Swap pitches" disabled={!a || !b} onClick={() => update({ a: selection.b, b: selection.a })}><ArrowLeftRight size={20} /></button>
        <button className="archive-icon-action" aria-label="Clear comparison" onClick={() => update({ a: null, b: null })}><RotateCcw size={18} /></button>
      </div>
      <div className="compare-toolbar">
        <div className="compare-tabs" role="group" aria-label="Comparison view">{(['grips', 'cues', 'movement'] as CompareView[]).map((view) => <button key={view} aria-pressed={selection.view === view} onClick={() => update({ view })}>{view === 'grips' ? 'Grips' : view === 'cues' ? 'Cues' : 'Movement'}</button>)}</div>
        {selection.view !== 'cues' && <div className="compare-toggles" role="group" aria-label="Schematic handedness">{(['right', 'left'] as Handedness[]).map((hand) => <button key={hand} aria-pressed={selection.hand === hand} onClick={() => update({ hand })}>{hand === 'right' ? 'RHP' : 'LHP'}</button>)}</div>}
      </div>
    </div>
    {!a || !b ? <section className="compare-empty"><span aria-hidden="true">A / B</span><h2>{a || b ? 'Bring another pitch to the table.' : 'Start with two pitches.'}</h2><p>Choose from the selectors above, or select Compare while exploring the Pitch Index. An unavailable pitch leaves its place open.</p><Link className="archive-action" to="/repertoire">Explore the index</Link></section> : <>
      {selection.view === 'grips' && <section className="compare-grips" aria-label="Grip comparison">
        <div className="compare-toggles" role="group" aria-label="View both grips">{(['top', 'side', 'thumb'] as GripView[]).map((orientation) => <button key={orientation} aria-pressed={selection.orientation === orientation} onClick={() => update({ orientation })}>{orientation === 'top' ? 'Top' : orientation === 'side' ? 'Side' : 'Thumb'}</button>)}</div>
        <div className="compare-pair compare-specimens">{[a, b].map((entry, i) => <article key={entry.display.slug}>
          <header><span>{i === 0 ? 'A' : 'B'}</span><h2>{entry.display.shortName}</h2></header>
          {entry.canonical.gripModel.status === 'unfiled' ? <GripUnfiledState entry={entry} accentColor="#c7a66b" /> : <div className="compare-ball"><BallStage entry={entry} grip faceGrip autoSpin={false} interactive={false} surface="stage" view={selection.orientation} handedness={selection.hand} className="h-full w-full" /></div>}
          <Link to={`/pitch/${entry.display.slug}#grip-lab`} viewTransition>Study {entry.display.shortName} <span aria-hidden="true">↗</span></Link>
        </article>)}</div>
        <p className="compare-note">Seam-informed schematics. View and handedness apply to both drawings; they do not transform real grip photographs.</p>
        <div className="compare-pair compare-grip-reading archive-paper">{[a, b].map((entry) => <article key={entry.display.slug}>
          <p className="archive-eyebrow">The hold</p><h2>{entry.display.shortName}</h2>
          <ClaimProse claim={entry.canonical.grip} proseClassName="compare-grip-prose" />
          {entry.canonical.gripModel.status === 'filed' && <details className="compare-model-note"><summary>About this reference</summary><GripSourceBadge provenance={entry.canonical.gripModel.provenance} /><p>{entry.canonical.gripModel.visualCaveat}</p></details>}
        </article>)}</div>
      </section>}
      {selection.view === 'cues' && <section className="compare-cues" aria-label="Sourced cue comparison"><CueComparison entries={[a, b]} /></section>}
      {selection.view === 'movement' && <section className="compare-movement"><p className="compare-note">Direction and character only. These paths illustrate a shared-release idea; they do not show measured flight, speed, distance or separation timing.</p><TunnelPlot selection={{ a: a.display.slug, b: b.display.slug, hand: selection.hand }} hideControls /></section>}
      <aside className="compare-next"><div><p className="archive-eyebrow">Put the difference in context</p><h2>What does the next pitch change?</h2><p>Keep this pair at the table while you explore how pitches work together.</p></div><Link to="/learn/sequencing" className="archive-text-link">Read the sequencing lesson <span aria-hidden="true">→</span></Link></aside>
    </>}
  </div>
}
