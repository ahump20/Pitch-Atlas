/**
 * The pure viewport-gating decision: an entry that's intersecting plays, one
 * that isn't pauses. Extracted so the play/pause logic is testable under jsdom
 * (which ships no IntersectionObserver) without mocking the observer itself.
 */
type AutoplayObserverEntry = Pick<IntersectionObserverEntry, 'isIntersecting'> &
  Partial<Pick<IntersectionObserverEntry, 'time'>>

export function autoplayDecision(entries: AutoplayObserverEntry[]): 'play' | 'pause' | 'none' {
  if (entries.length === 0) return 'none'
  const latest = entries.reduce(
    (newest, entry, index) => {
      const entryTime = entry.time
      const newestTime = newest.entry.time

      if (entryTime !== undefined && newestTime !== undefined) {
        return entryTime >= newestTime ? { entry, index } : newest
      }
      if (entryTime !== undefined) return { entry, index }
      if (newestTime !== undefined) return newest
      return index > newest.index ? { entry, index } : newest
    },
    { entry: entries[0], index: 0 },
  ).entry

  return latest.isIntersecting ? 'play' : 'pause'
}
