/*
  In-page navigation that leaves the pitch route (the hash) untouched. The hash
  carries the selected specimen (#/slider); jumping to a section must not
  overwrite it, so the skip link and the hero CTA scroll by id instead of by
  native anchor. Honors reduced motion.
*/
export function scrollToId(id: string, focus = false): void {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  if (focus) (el as HTMLElement).focus({ preventScroll: true })
}
