import { describe, expect, it, vi } from 'vitest'
import type { EventManager, RootStore } from '@react-three/fiber'
import { canvasEvents } from './canvasEvents'

function setup() {
  // The real R3F event manager only needs these store operations to connect and
  // disconnect DOM listeners; no renderer or mocked event manager is involved.
  type State = { events: EventManager<HTMLElement>; set: (update: (state: State) => Partial<State>) => void }
  const state = {} as State
  state.set = (update) => { Object.assign(state, update(state)) }
  const store = { getState: () => state } as unknown as RootStore
  state.events = canvasEvents(store)
  return state
}

describe('Canvas event connection lifecycle', () => {
  it('ignores a cleared ref and the detached canvas after async initialization', () => {
    const state = setup()
    const canvas = document.createElement('canvas')
    const add = vi.spyOn(canvas, 'addEventListener')
    expect(() => state.events.connect!(null as unknown as HTMLElement)).not.toThrow()
    state.events.connect!(canvas)
    expect(add).not.toHaveBeenCalled()
    expect(state.events.connected).toBeUndefined()
  })

  it('preserves real R3F listeners and cleanup on an attached target', () => {
    const state = setup()
    const target = document.createElement('div')
    document.body.append(target)
    const add = vi.spyOn(target, 'addEventListener')
    const remove = vi.spyOn(target, 'removeEventListener')
    state.events.connect!(target)
    expect(state.events.connected).toBe(target)
    expect(add).toHaveBeenCalledWith('pointerdown', expect.any(Function), { passive: true })
    target.remove()
    state.events.disconnect!()
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    expect(state.events.connected).toBeUndefined()
    const calls = add.mock.calls.length
    state.events.connect!(target)
    expect(add).toHaveBeenCalledTimes(calls)
  })
})
