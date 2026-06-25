import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCwIcon, XIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'

/*
  The PWA update prompt. Mounted client-only from main.tsx, so the service-worker
  hook never runs during the build-time prerender. The live build always wins
  online (NetworkFirst navigation); this toast only appears when a new version is
  waiting, and that version installs only when the pitcher taps Reload — no
  stale-build trap, no auto-reload in the middle of reading a grip.

  The saved-offline notice is a courtesy, not a decision: it says its piece and
  leaves on its own. Only the update prompt (a real choice) waits for a tap.
*/
const OFFLINE_NOTICE_MS = 4500

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!offlineReady || needRefresh) return
    const timer = window.setTimeout(() => setOfflineReady(false), OFFLINE_NOTICE_MS)
    return () => window.clearTimeout(timer)
  }, [offlineReady, needRefresh, setOfflineReady])

  if (!offlineReady && !needRefresh) return null

  const dismiss = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-blaze-reserved-bottom={needRefresh ? '' : undefined}
      className={`fixed z-50 flex ${
        needRefresh
          ? 'inset-x-0 bottom-0 justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]'
          : 'left-0 right-0 top-16 justify-center px-4 pt-3 md:left-auto md:right-4 md:top-20 md:w-[min(24rem,calc(100vw-2rem))] md:px-0'
      }`}
    >
      <Alert className="flex w-full max-w-sm items-center gap-3 border-cyan/30 bg-popover px-4 py-3 text-popover-foreground shadow-2xl shadow-black/60">
        <div className="min-w-0 flex-1">
          <AlertTitle className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-cyan">
            {needRefresh ? 'Update ready' : 'Saved offline'}
          </AlertTitle>
          <AlertDescription className="mt-0.5 text-sm text-bone-2">
            {needRefresh
              ? 'A new version of Pitch Atlas is ready.'
              : 'Pitch Atlas is saved for offline reading.'}
          </AlertDescription>
        </div>
        {needRefresh && (
          <Button
            type="button"
            onClick={() => updateServiceWorker(true)}
            size="sm"
            className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.12em]"
          >
            <RefreshCwIcon data-icon="inline-start" />
            Reload
          </Button>
        )}
        <Button
          type="button"
          onClick={dismiss}
          aria-label={needRefresh ? 'Dismiss update prompt' : 'Dismiss offline notification'}
          variant="ghost"
          size={needRefresh ? 'sm' : 'icon-sm'}
          className="shrink-0 text-bone-2 hover:text-bone"
        >
          {needRefresh ? <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em]">Later</span> : <XIcon data-icon="icon" aria-hidden="true" />}
          <span className="sr-only">{needRefresh ? 'Dismiss update prompt' : 'Dismiss offline notification'}</span>
        </Button>
      </Alert>
    </div>
  )
}
