import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { pitchBySlug } from '../../data/pitches'
import type { InspectorApi } from './inspectorContext'

/*
  `?inspect=<slug>` is the inspector's state, so Back closes it and the link shares
  it. Opening pushes a history entry; closing after a push goes back, closing a deep
  link rewrites the URL in place. An unknown slug is ignored.
*/
export function useInspectorParam(): InspectorApi {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const raw = params.get('inspect')
  // a filed pitch only: the entry's own slug must match, so no crafted key is honoured
  const slug = raw && pitchBySlug(raw)?.display?.slug === raw ? raw : null
  const pushed = useRef(false)

  useEffect(() => {
    if (!slug) pushed.current = false
  }, [slug])

  const open = useCallback(
    (next: string) => {
      if (pitchBySlug(next)?.display?.slug !== next) return
      const p = new URLSearchParams(params)
      p.set('inspect', next)
      pushed.current = true
      setParams(p, { preventScrollReset: true })
    },
    [params, setParams],
  )

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false
      navigate(-1)
      return
    }
    const p = new URLSearchParams(params)
    p.delete('inspect')
    setParams(p, { replace: true, preventScrollReset: true })
  }, [navigate, params, setParams])

  return { slug, open, close }
}
