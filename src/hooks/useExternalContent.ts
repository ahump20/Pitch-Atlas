import { useEffect, useMemo, useState } from 'react'
import { externalContentFor, type ExternalContentItem, type ExternalContentQuery } from '../data/media/external'
import { listExternalContent } from '../lib/external-content'

export function useExternalContent(query: ExternalContentQuery): {
  items: ExternalContentItem[]
  loading: boolean
} {
  const key = JSON.stringify(query)
  const stableQuery = useMemo(() => JSON.parse(key) as ExternalContentQuery, [key])
  const [result, setResult] = useState(() => ({
    key,
    items: externalContentFor(query),
    settled: false,
  }))

  useEffect(() => {
    let live = true
    void listExternalContent(stableQuery)
      .then((next) => {
        if (!live) return
        setResult({ key, items: next, settled: true })
      })
      .catch(() => {
        // A rejected read still has to settle. Without this the rail keeps
        // aria-busy="true" for the rest of the visit — a screen reader is told the
        // region is loading forever — and the rejection goes unhandled. The
        // committed seed ledger is the honest fallback, same as the initial state.
        if (!live) return
        setResult({ key, items: externalContentFor(stableQuery), settled: true })
      })
    return () => {
      live = false
    }
  }, [key, stableQuery])

  if (result.key !== key) {
    return { items: externalContentFor(stableQuery), loading: true }
  }
  return { items: result.items, loading: !result.settled }
}
