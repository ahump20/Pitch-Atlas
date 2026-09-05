import { describe, expect, it } from 'vitest'
import { craftsmanForVariant } from './archiveConnections'

describe('Documented variant connections', () => {
  it('links the matching person and signature pitch', () => {
    expect(craftsmanForVariant('twelve-six', 'Adam Wainwright')?.slug).toBe('adam-wainwright')
    expect(craftsmanForVariant('circle-change', 'Johan Santana')?.slug).toBe('johan-santana')
  })
  it('does not infer a relationship from a familiar name or shared family', () => {
    expect(craftsmanForVariant('four-seam', 'Adam Wainwright')).toBeUndefined()
    expect(craftsmanForVariant('twelve-six', 'Adam')).toBeUndefined()
    expect(craftsmanForVariant('unknown', 'Adam Wainwright')).toBeUndefined()
  })
})
