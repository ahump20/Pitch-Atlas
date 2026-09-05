/** React Router owns route transitions, so observe cancellation at their shared entry point. */
export function handleViewTransitionCancellation(doc: Document, report: (error: unknown) => void = globalThis.reportError) {
  if (typeof doc.startViewTransition !== 'function') return
  const start = doc.startViewTransition.bind(doc)
  doc.startViewTransition = (...args) => {
    const transition = start(...args)
    // A second navigation may skip the first transition before its snapshot is
    // ready. The DOM update still completes; other failures must stay visible.
    void transition.ready.catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return
      report(error)
    })
    return transition
  }
}
