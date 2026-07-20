import { useEffect, useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** The minimal slice of the data router this needs: navigations + current path. */
type RouterLike = {
  subscribe: (fn: (state: { location: { pathname: string } }) => void) => () => void
  state: { location: { pathname: string } }
}

/*
  Silent PWA update handoff. A waiting build activates at the next route change,
  which is a natural break in the visit. Nothing renders and nothing interrupts
  somebody studying a grip. The new worker then reloads the route the visitor
  asked for, while NetworkFirst navigation and the immutable bundle precache stay
  unchanged.

  A fresh install only raises offlineReady. Clear that bookkeeping signal without
  showing a toast. `registerType: 'prompt'` is intentional: unlike `autoUpdate`, it
  lets us choose the route boundary instead of reloading the current page mid-read.
*/
export function ServiceWorkerUpdateController({ router }: { router?: RouterLike }) {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (offlineReady && !needRefresh) setOfflineReady(false)
  }, [offlineReady, needRefresh, setOfflineReady])

  const waitingRef = useRef(needRefresh)
  useEffect(() => {
    waitingRef.current = needRefresh
  }, [needRefresh])

  const activatedRef = useRef(false)
  useEffect(() => {
    if (!router) return
    let last = router.state.location.pathname
    return router.subscribe((state) => {
      const next = state.location.pathname
      if (next === last) return
      last = next
      if (!waitingRef.current || activatedRef.current) return
      activatedRef.current = true
      void updateServiceWorker(true)
    })
  }, [router, updateServiceWorker])

  return null
}
