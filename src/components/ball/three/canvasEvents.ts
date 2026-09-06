import { events, type RootStore } from '@react-three/fiber'

/** Canvas configuration can finish after its route or inspection was removed.
 * R3F then connects a cleared DOM ref (and may retry its detached canvas).
 * Keep the normal event manager, but never attach listeners to either target. */
export function canvasEvents(store: RootStore) {
  const manager = events(store)
  const connect = manager.connect
  manager.connect = (target) => {
    if (!target?.isConnected) return
    connect?.(target)
  }
  return manager
}
