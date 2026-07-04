import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCwIcon } from 'lucide-react'
import { Button } from '../ui/button'

/** The minimal slice of the data router this needs: navigations + current path. */
type RouterLike = {
  subscribe: (fn: (state: { location: { pathname: string } }) => void) => () => void
  state: { location: { pathname: string } }
}

const DISMISS_KEY = 'pa-sw-update-dismissed'

function sessionDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}
function persistDismissed(): void {
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    /* private mode / storage off — dismissal is best-effort */
  }
}

/*
  The PWA update handoff. Mounted client-only from main.tsx (the service-worker
  hook never runs during the build-time prerender). The whole point is to stop
  nagging:

  - First install is silent — that path fires offlineReady, never needRefresh, so
    no prompt on a fresh first visit.
  - When a new build is waiting, it activates itself on the visitor's NEXT route
    navigation — a natural break — and the page lands fresh on the route they
    asked for. No reload mid-grip, and no bottom-center bar sitting over the
    spin-tilt explainer, the compare labels, or the mobile search it used to cover.
  - If they linger on one page, a single slim TOP banner offers the reload once per
    session; "Later" is remembered for the session, and the next navigation still
    applies the update silently. Offline caching (NetworkFirst navigation) is
    unchanged — this only changes WHEN the waiting worker is activated, never THAT
    the immutable bundles are precached.
*/
export function ReloadPrompt({ router }: { router?: RouterLike }) {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const [dismissed, setDismissed] = useState(sessionDismissed)

  // The saved-offline event is silent plumbing, not a visitor choice.
  useEffect(() => {
    if (offlineReady && !needRefresh) setOfflineReady(false)
  }, [offlineReady, needRefresh, setOfflineReady])

  // Auto-activate a waiting build on the next route navigation. The waiting flag
  // lives in a ref so the single subscription always reads the latest value
  // without resubscribing, and an activation guard makes the reload fire once.
  const waitingRef = useRef(needRefresh)
  waitingRef.current = needRefresh
  const activatedRef = useRef(false)
  useEffect(() => {
    if (!router) return
    let last = router.state.location.pathname
    return router.subscribe((state) => {
      const next = state.location.pathname
      if (next === last) return
      last = next
      if (waitingRef.current && !activatedRef.current) {
        activatedRef.current = true
        updateServiceWorker(true)
      }
    })
  }, [router, updateServiceWorker])

  if (!needRefresh || dismissed) return null

  const dismiss = () => {
    persistDismissed()
    setDismissed(true)
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-blaze-reserved-top=""
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 border-b border-cyan/25 bg-popover/95 px-4 py-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] text-popover-foreground shadow-lg shadow-black/40 backdrop-blur"
    >
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-cyan">Update ready</span>
      <span className="hidden text-xs text-bone-2 sm:inline">A new version of Pitch Atlas is ready.</span>
      <Button
        type="button"
        onClick={() => updateServiceWorker(true)}
        size="sm"
        className="h-7 shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.12em]"
      >
        <RefreshCwIcon data-icon="inline-start" />
        Reload
      </Button>
      <Button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss update prompt"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 text-bone-2 hover:text-bone"
      >
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em]">Later</span>
        <span className="sr-only">Dismiss update prompt</span>
      </Button>
    </div>
  )
}
