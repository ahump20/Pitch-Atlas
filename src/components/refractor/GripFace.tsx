import type { VisualReference } from '../../data/types'

/*
  The card face for a pitch Austin actually throws: his own grip photograph (a
  first-party VisualReference from the grip library), filling the arched specimen
  window. It replaces the seam-ball schematic only when a real photographed grip
  exists — the pitches he doesn't throw fall back to the seam ball + pins, so the
  card never implies a grip is his when it isn't. The image is decorative here (its
  meaning is named in the grip-source chip and on the detail page); alt text still
  ships for assistive tech. If the asset ever 404s, the dark window shows through —
  never a broken-image glyph or the word "undefined".
*/
export function GripFace({ photo, priority = false }: { photo: VisualReference; priority?: boolean }) {
  return (
    <figure className="rfx-grip">
      <img
        className="rfx-grip-img"
        src={photo.src}
        alt={photo.alt}
        // Hero-of-the-page faces load eagerly at high priority so the LCP grip
        // paints fast; everywhere else stays lazy.
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.opacity = '0'
        }}
      />
    </figure>
  )
}
