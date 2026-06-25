import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCwIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'

/*
  The PWA update prompt. Mounted client-only from main.tsx, so the service-worker
  hook never runs during the build-time prerender. The live build always wins
  online (NetworkFirst navigation); this toast only appears when a new version is
  waiting, and that version installs only when the pitcher taps Reload — no
  stale-build trap, no auto-reload in the middle of reading a grip.

  The saved-offline event is silent. It is useful plumbing, not a visitor choice,
  and it should not cover pitch copy. Only the update prompt waits for a tap.
*/
export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (offlineReady && !needRefresh) setOfflineReady(false)
  }, [offlineReady, needRefresh, setOfflineReady])

  if (!needRefresh) return null

  const dismiss = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-blaze-reserved-bottom=""
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
    >
      <Alert className="flex w-full max-w-sm items-center gap-3 border-cyan/30 bg-popover px-4 py-3 text-popover-foreground shadow-2xl shadow-black/60">
        <div className="min-w-0 flex-1">
          <AlertTitle className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-cyan">
            Update ready
          </AlertTitle>
          <AlertDescription className="mt-0.5 text-sm text-bone-2">
            A new version of Pitch Atlas is ready.
          </AlertDescription>
        </div>
        <Button
          type="button"
          onClick={() => updateServiceWorker(true)}
          size="sm"
          className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.12em]"
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
          className="shrink-0 text-bone-2 hover:text-bone"
        >
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em]">Later</span>
          <span className="sr-only">Dismiss update prompt</span>
        </Button>
      </Alert>
    </div>
  )
}
