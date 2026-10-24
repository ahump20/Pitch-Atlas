import { afterEach, describe, expect, it, vi } from 'vitest'
import { canEncodeVideo, Quality } from 'mediabunny'
import { WEBM_BITRATE, WEBM_FPS, WEBM_PROBE_CODECS, webmFrameSize } from './exportWebm'

/*
  The support check asks the browser about a WebM codec before the visitor clicks,
  without downloading the encoder library. Its VP9 question must be the one the
  library itself asks when the export runs, or the two could disagree about a
  browser. The real library runs here against an encoder stand-in that records
  what it is asked.
*/

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the support check and the encoder library', () => {
  it('ask the browser for the same VP9 at the frame size the export writes', async () => {
    const asked: string[] = []
    vi.stubGlobal(
      'VideoEncoder',
      Object.assign(function VideoEncoder() {}, {
        isConfigSupported: async (config: VideoEncoderConfig) => {
          asked.push(config.codec)
          return { supported: true, config }
        },
      }),
    )
    const { width, height } = webmFrameSize()
    await canEncodeVideo('vp9', { width, height, frameRate: WEBM_FPS, quality: new Quality({ bitrate: WEBM_BITRATE }) })
    expect(asked).toContain(WEBM_PROBE_CODECS[0])
  })
})
