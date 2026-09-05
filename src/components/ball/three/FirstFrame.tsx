import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/** Canvas creation precedes its first draw. Keep the SVG visible until then. */
export function FirstFrame({ onReady }: { onReady?: () => void }) {
  const sent = useRef(false)
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  useFrame(() => {
    if (sent.current) return
    sent.current = true
    // useFrame precedes R3F's render; the following frame follows that draw.
    frame.current = requestAnimationFrame(() => onReady?.())
  })
  return null
}
