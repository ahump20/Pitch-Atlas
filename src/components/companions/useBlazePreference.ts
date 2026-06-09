import { useCallback, useEffect, useState } from 'react'
import {
  BLAZE_PREFERENCE_EVENT_NAME,
  BLAZE_STORAGE_KEY,
  dispatchBlazePreference,
  initialBlazePreference,
} from './blazeMotion'

export function useBlazePreference() {
  const [enabled, setEnabledState] = useState(() =>
    initialBlazePreference(typeof window === 'undefined' ? undefined : window.localStorage),
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const onStorage = (event: StorageEvent) => {
      if (event.key !== BLAZE_STORAGE_KEY) return
      setEnabledState(event.newValue === null ? true : event.newValue !== 'false')
    }

    const onPreference = (event: WindowEventMap[typeof BLAZE_PREFERENCE_EVENT_NAME]) => {
      setEnabledState(event.detail.enabled)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(BLAZE_PREFERENCE_EVENT_NAME, onPreference)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(BLAZE_PREFERENCE_EVENT_NAME, onPreference)
    }
  }, [])

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BLAZE_STORAGE_KEY, String(next))
      dispatchBlazePreference(next)
    }
  }, [])

  return { enabled, setEnabled }
}
