import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDiscussion } from './useDiscussion'
import { createPost, uploadMedia } from '../lib/discussion'
vi.mock('../lib/discussion', () => ({ createPost: vi.fn(), uploadMedia: vi.fn(), acceptMediaTerms: vi.fn(), deletePost: vi.fn(), hasAcceptedMediaTerms: vi.fn(), listThread: vi.fn(), reportMedia: vi.fn(), reportPost: vi.fn() }))
vi.mock('../components/companions/blazeMotion', () => ({ dispatchBlazeEvent: vi.fn() }))
beforeEach(() => vi.resetAllMocks())
describe('discussion transaction progress', () => {
  it('reports actual media completions and preserves a saved note after partial upload failure', async () => {
    vi.mocked(createPost).mockResolvedValue('saved-post')
    vi.mocked(uploadMedia).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Upload unavailable'))
    const progress = vi.fn()
    const { result } = renderHook(() => useDiscussion('four-seam', false))
    let response
    await act(async () => { response = await result.current.submit({ displayName: 'Reader', body: 'A grip note.', files: [new File(['a'], 'a.jpg'), new File(['b'], 'b.jpg')], onProgress: progress }) })
    expect(createPost).toHaveBeenCalledTimes(1)
    expect(uploadMedia).toHaveBeenCalledTimes(2)
    expect(progress.mock.calls.map(([value]) => value)).toEqual([
      { phase: 'saving', completed: 0, total: 2 },
      { phase: 'uploading', completed: 0, total: 2 },
      { phase: 'uploading', completed: 1, total: 2 },
      { phase: 'uploading', completed: 1, total: 2 },
      { phase: 'uploading', completed: 2, total: 2 },
    ])
    expect(response).toEqual({ ok: true, mediaError: expect.stringContaining('1 of 2 media files did not attach') })
  })
})
