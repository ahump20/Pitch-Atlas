import { lazy, Suspense, type ReactNode } from 'react'
import { pitchBySlug } from '../../data/pitches'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { InspectorContext } from './inspectorContext'
import { useInspectorParam } from './useInspector'

/*
  Mounts the inspector where cards offer it (the home page) and hands every card
  underneath the handle to open it. The inspector itself is a lazy chunk: nothing
  of it loads until a visitor opens a card or arrives on an ?inspect= link.

  If that chunk cannot be fetched (offline on a first visit, or a new deploy has
  replaced the file an open page still points at), the boundary keeps the page up
  and a small dialog says what happened. A reload fetches the current files and,
  because ?inspect= is still in the address, opens the card again.
*/
const SpecimenInspector = lazy(() => import('./SpecimenInspector'))

function InspectorUnavailable({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="compare-replacement">
        <DialogTitle>The inspector did not load</DialogTitle>
        <DialogDescription>
          It downloads the first time a card is opened, and that download failed. Check the connection, then reload the page to try again.
        </DialogDescription>
        <button type="button" className="archive-action" onClick={() => window.location.reload()}>
          Reload the page
        </button>
        <button type="button" className="archive-action archive-action--quiet" onClick={onClose}>
          Close
        </button>
      </DialogContent>
    </Dialog>
  )
}

export function SpecimenInspectorHost({ children }: { children: ReactNode }) {
  const api = useInspectorParam()
  const entry = api.slug ? pitchBySlug(api.slug) : undefined
  return (
    <InspectorContext.Provider value={api}>
      {children}
      {entry ? (
        <SpecimenBoundary key={entry.display.slug} fallback={<InspectorUnavailable onClose={api.close} />}>
          <Suspense fallback={null}>
            <SpecimenInspector entry={entry} onClose={api.close} />
          </Suspense>
        </SpecimenBoundary>
      ) : null}
    </InspectorContext.Provider>
  )
}
