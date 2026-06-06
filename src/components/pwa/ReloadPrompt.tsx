import { useRegisterSW } from 'virtual:pwa-register/react'

/*
  The PWA update prompt. Mounted client-only from main.tsx, so the service-worker
  hook never runs during the build-time prerender. The live build always wins
  online (NetworkFirst navigation); this toast only appears when a new version is
  waiting, and that version installs only when the pitcher taps Reload — no
  stale-build trap, no auto-reload in the middle of reading a grip.
*/
export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const dismiss = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
    >
      <div className="flex w-full max-w-sm items-center gap-3 rounded-sm border border-navy/40 bg-press px-4 py-3 text-bone shadow-xl">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-powder">
            {needRefresh ? 'Update ready' : 'Saved offline'}
          </p>
          <p className="mt-0.5 text-sm text-bone-2">
            {needRefresh
              ? 'A new version of Pitch Atlas is ready.'
              : 'Pitch Atlas is saved for offline reading.'}
          </p>
        </div>
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="shrink-0 rounded-sm bg-seam px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-cta-text"
          >
            Reload
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-sm px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-bone-2 transition-colors hover:text-bone"
        >
          {needRefresh ? 'Later' : 'OK'}
        </button>
      </div>
    </div>
  )
}
