import { useEffect, useRef, type ReactNode } from 'react'

/*
  A small accessible overlay shell for the easter-egg reveals and the found-index.
  Focus moves into the panel on open and returns to the trigger on close; Escape
  and a backdrop click both close it; Tab is kept inside the panel. No entrance
  animation, so it is reduced-motion-safe by construction.
*/
export function EggDialog({
  onClose,
  labelledBy,
  children,
  className = '',
}: {
  onClose: () => void
  labelledBy: string
  children: ReactNode
  className?: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-void/82 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full max-w-lg rounded-md border border-bone/15 bg-[#0b0a12] p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] outline-none md:p-7 ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
