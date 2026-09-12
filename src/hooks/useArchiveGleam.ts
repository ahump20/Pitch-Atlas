import { useEffect } from 'react'

/** Finite light passes replay on re-entry; no timers or idle animation loop. */
export function useArchiveGleam() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const targets = document.querySelectorAll('.brand-lockup, .v2-cta, .rfx-holder, .archive-discovery-folio, main section h2')
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle('gleam-in-view', entry.isIntersecting)
    }, { threshold: 0.15 })
    targets.forEach((target) => observer.observe(target))
    const visibility = () => document.documentElement.classList.toggle('gleam-paused', document.hidden)
    document.addEventListener('visibilitychange', visibility)
    visibility()
    return () => {
      observer.disconnect()
      targets.forEach((target) => target.classList.remove('gleam-in-view'))
      document.removeEventListener('visibilitychange', visibility)
      document.documentElement.classList.remove('gleam-paused')
    }
  }, [])
}
