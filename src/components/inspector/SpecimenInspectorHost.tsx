import { lazy, Suspense, useCallback, useRef, type ReactNode } from 'react'
import { pitchBySlug } from '../../data/pitches'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { InspectorContext, type OpenOptions } from './inspectorContext'
import { useInspectorParam } from './useInspector'

/*
  Mounts the bench on every page (RootLayout) and hands everything underneath the
  handle to open it. The bench itself is a lazy chunk: nothing of it loads until a
  visitor opens a pitch or arrives on an ?inspect= link.

  If that chunk cannot be fetched (offline on a first visit, or a new deploy has
  replaced the file an open page still points at), the boundary keeps the page up
  and a small dialog says what happened. A reload fetches the current files and,
  because ?inspect= is still in the address, opens the card again.
*/
const SpecimenInspector = lazy(() => import('./SpecimenInspector'))

function InspectorUnavailable({ onClose, onCloseAutoFocus }: { onClose: () => void; onCloseAutoFocus: (event: Event) => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="compare-replacement" onCloseAutoFocus={onCloseAutoFocus}>
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
  const openerRef = useRef<HTMLElement | null>(null)
  const open = (slug: string, options: OpenOptions = {}) => {
    // a control inside the open bench (no opener) leaves the way back where it was
    if (options.opener || !api.slug) openerRef.current = options.opener ?? null
    api.open(slug, options)
  }
  // These URL-driven dialogs have no Radix DialogTrigger. Keep the actual card's
  // button so Escape, Close and browser Back return to the collection in place.
  // A study link unmounts that button; it must never pull focus off the new route.
  const restoreFocus = useCallback((event: Event) => {
    const opener = openerRef.current
    if (!opener?.isConnected) return
    event.preventDefault()
    opener.focus({ preventScroll: true })
  }, [])
  const entry = api.slug ? pitchBySlug(api.slug) : undefined
  return (
    <InspectorContext.Provider value={{ ...api, open }}>
      {children}
      {entry ? (
        <SpecimenBoundary fallback={<InspectorUnavailable onClose={api.close} onCloseAutoFocus={restoreFocus} />}>
          <Suspense fallback={null}>
            <SpecimenInspector entry={entry} onClose={api.close} onCloseAutoFocus={restoreFocus} />
          </Suspense>
        </SpecimenBoundary>
      ) : null}
    </InspectorContext.Provider>
  )
}
