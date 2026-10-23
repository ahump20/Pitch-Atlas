/*
  The slice of mediabunny the WebM export uses. exportWebm imports this module lazily,
  so the encoder (only the parts of it the export touches) is a chunk of its own,
  fetched on the first WebM rather than with the inspector.
*/
export { BufferTarget, CanvasSource, Output, Quality, WebMOutputFormat, canEncodeVideo } from 'mediabunny'
