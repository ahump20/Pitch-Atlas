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
  const offset = window.innerWidth >= 768 ? 118 : 96
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
  if (focus) (el as HTMLElement).focus({ preventScroll: true })
}
