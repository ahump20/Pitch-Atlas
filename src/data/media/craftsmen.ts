import { craftsmanBySlug } from '../craftsmen'
import { TEACHING_CLIPS, type TeachingClip } from './tiktok'

/*
  Media filed to Craftsmen. Embeds stay source-owned: TikTok player for TikTok
  rows, baked react-tweet JSON for the existing Rivera row. No raw clip files.
*/

export type CraftsmanMediaItem =
  | {
      kind: 'tiktok'
      id: string
      title: string
      lede: string
      author: string
      authorUrl: string
      url: string
      retrievedAt: string
      craftsmanSlug: string
      craftsmanName: string
      clip: TeachingClip
    }
  | {
      kind: 'x-rivera'
      id: 'rivera-cutter-teaching'
      title: string
      lede: string
      author: '@PitchingNinja'
      authorUrl: 'https://x.com/PitchingNinja'
      url: 'https://x.com/PitchingNinja/status/1061649568847269889'
      retrievedAt: '2026-06-09'
      craftsmanSlug: 'mariano-rivera'
      craftsmanName: 'Mariano Rivera'
    }

const RIVERA: CraftsmanMediaItem = {
  kind: 'x-rivera',
  id: 'rivera-cutter-teaching',
  title: 'Rivera teaches the cutter',
  lede:
    'Rivera walks Roy Halladay and Scott Kazmir through the cutter grip itself: hand to hand, one pitch passed down instead of flattened into a stat sheet.',
  author: '@PitchingNinja',
  authorUrl: 'https://x.com/PitchingNinja',
  url: 'https://x.com/PitchingNinja/status/1061649568847269889',
  retrievedAt: '2026-06-09',
  craftsmanSlug: 'mariano-rivera',
  craftsmanName: 'Mariano Rivera',
}

function tiktokItems(): CraftsmanMediaItem[] {
  return TEACHING_CLIPS.flatMap((clip) =>
    (clip.craftsmanSlugs ?? []).flatMap((slug) => {
      const craftsman = craftsmanBySlug(slug)
      if (!craftsman) return []
      return [
        {
          kind: 'tiktok' as const,
          id: clip.id,
          title: clip.title,
          lede: clip.lede,
          author: clip.author,
          authorUrl: clip.authorUrl,
          url: clip.url,
          retrievedAt: clip.retrievedAt,
          craftsmanSlug: slug,
          craftsmanName: craftsman.name,
          clip,
        },
      ]
    }),
  )
}

export function craftsmanMediaForSlug(slug: string): CraftsmanMediaItem[] {
  return allCraftsmanMedia().filter((item) => item.craftsmanSlug === slug)
}

export function craftsmanMediaCount(slug: string): number {
  return craftsmanMediaForSlug(slug).length
}

export function allCraftsmanMedia(): CraftsmanMediaItem[] {
  return [...tiktokItems(), RIVERA]
}

export function featuredCraftsmanMedia(): CraftsmanMediaItem[] {
  const order = ['nolan-ryan', 'mariano-rivera', 'paul-skenes']
  return order.flatMap((slug) => craftsmanMediaForSlug(slug).slice(0, 1))
}
