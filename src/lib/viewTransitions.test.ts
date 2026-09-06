import { describe, expect, it, vi } from 'vitest'
import { handleViewTransitionCancellation } from './viewTransitions'

describe('view transition cancellation', () => {
  it('keeps interrupted navigation usable and preserves the transition object', async () => {
    const transition = { ready: Promise.reject(new DOMException('Transition was skipped', 'AbortError')) }
    const start = vi.fn(() => transition)
    const doc = { startViewTransition: start } as unknown as Document
    const report = vi.fn()
    handleViewTransitionCancellation(doc, report)
    const update = vi.fn()
    expect(doc.startViewTransition(update)).toBe(transition)
    expect(start).toHaveBeenCalledWith(update)
    await Promise.resolve()
    expect(report).not.toHaveBeenCalled()
  })

  it('reports invalid snapshots and update errors instead of hiding them', async () => {
    const error = new DOMException('Duplicate transition name', 'InvalidStateError')
    const doc = { startViewTransition: () => ({ ready: Promise.reject(error) }) } as unknown as Document
    const report = vi.fn()
    handleViewTransitionCancellation(doc, report)
    doc.startViewTransition(() => {})
    await Promise.resolve()
    expect(report).toHaveBeenCalledWith(error)
  })

  it('leaves browsers without the API untouched', () => {
    const doc = {} as Document
    handleViewTransitionCancellation(doc, vi.fn())
    expect(doc.startViewTransition).toBeUndefined()
  })
})
