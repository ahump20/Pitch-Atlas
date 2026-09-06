import { createSelectionStore } from './selectionStore'
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { pitchBySlug } from '../../data/pitches'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { CompareContext } from './compareContext'
import { compareUrl, normalizeSelection, parseSelection, validSlug, type CompareSelection } from './selection'
import '../../styles/compare.css'

export function CompareProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [store] = useState(createSelectionStore)
  const saved = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  const [pending, setPending] = useState<string | null>(null)
  const isCompare = location.pathname.replace(/\/+$/, '') === '/compare'
  const explicit = isCompare && location.search.length > 0
  // The URL is authoritative on /compare. Back/Forward immediately restores it.
  const selection = explicit ? parseSelection(location.search) : saved

  useEffect(() => {
    if (explicit) store.set(parseSelection(location.search))
  }, [explicit, location.search, store])

  function update(patch: Partial<CompareSelection>) {
    const next = normalizeSelection({ ...selection, ...patch })
    store.set(next)
    if (isCompare) navigate(compareUrl(next), { replace: true, preventScrollReset: true })
  }
  function add(slug: string) {
    if (!validSlug(slug) || selection.a === slug || selection.b === slug) return
    if (!selection.a) update({ a: slug })
    else if (!selection.b) update({ b: slug })
    else setPending(slug)
  }
  return (
    <CompareContext.Provider value={{ selection, update, add, clear: () => update({ a: null, b: null }) }}>
      {children}
      <Dialog open={Boolean(pending)} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <DialogContent className="compare-replacement">
          <DialogTitle>Make room for {pending ? pitchBySlug(pending)?.display.shortName : 'a pitch'}</DialogTitle>
          <DialogDescription>Choose which pitch to replace. Your other selection stays in place.</DialogDescription>
          {(['a', 'b'] as const).map((slot) => <button key={slot} className="archive-action" onClick={() => { update({ [slot]: pending }); setPending(null) }}>Replace {pitchBySlug(selection[slot] ?? '')?.display.shortName}</button>)}
          <button className="archive-action archive-action--quiet" onClick={() => setPending(null)}>Keep current pair</button>
        </DialogContent>
      </Dialog>
    </CompareContext.Provider>
  )
}
