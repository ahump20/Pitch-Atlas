import type { RightsStatus, Source } from '../types'
import { src } from '../sources'

/*
  Public-domain historical image plates for the Lost Pitches wing.
  These are derivative crops from the linked source files, cut to avoid using
  team marks as the visual subject. The source pages remain linked on the card.
*/

export interface ArchiveImage {
  id: string
  title: string
  label: string
  imageSrc: string
  alt: string
  caption: string
  source: Source
  rights: RightsStatus
  relatedSlug?: string
  relatedLabel?: string
}

export const LOST_PITCH_ARCHIVE_IMAGES: ArchiveImage[] = [
  {
    id: 'satchel-paige-1942-portrait',
    title: 'Satchel Paige, 1942',
    label: 'Portrait plate',
    imageSrc: '/archive/lost-pitches/satchel-paige-1942-portrait.jpg',
    alt: 'Public-domain black-and-white crop of Satchel Paige in profile.',
    caption:
      'A cropped public-domain portrait keeps Paige present without turning the hesitation pitch into a celebrity poster.',
    source: src('commons-satchel-paige-1942'),
    rights: 'public-domain',
    relatedSlug: 'satchel-paige-hesitation-pitch',
    relatedLabel: "Satchel Paige's Hesitation Pitch",
  },
  {
    id: 'rube-foster-1924',
    title: 'Rube Foster, 1924',
    label: 'Builder plate',
    imageSrc: '/archive/lost-pitches/rube-foster-1924-clean.jpg',
    alt: 'Public-domain photograph of Rube Foster standing in a suit and cap.',
    caption:
      'Foster belongs here twice: as the arm behind the fadeaway and as the organizer who built the league structure around the craft.',
    source: src('commons-rube-foster-1924'),
    rights: 'public-domain',
    relatedSlug: 'rube-foster-fadeaway',
    relatedLabel: "Rube Foster's Fadeaway",
  },
  {
    id: 'negro-league-all-star-1936-stands',
    title: 'Comiskey Park, 1936',
    label: 'Crowd strip',
    imageSrc: '/archive/lost-pitches/negro-league-all-star-1936-stands.jpg',
    alt: 'Public-domain crop of the grandstand crowd from the 1936 Negro League All-Star Game at Comiskey Park.',
    caption:
      'The visual layer stays on the recovered stage: crowd, venue, date. The pitch claims still come from the record cards below.',
    source: src('commons-negro-league-all-star-1936'),
    rights: 'public-domain',
    relatedSlug: 'doctored-ball-divergence-and-recovery',
    relatedLabel: 'The Doctored-Ball Divergence and the Recovery',
  },
]

export function archiveImageForLostPitch(slug: string): ArchiveImage | undefined {
  return LOST_PITCH_ARCHIVE_IMAGES.find((image) => image.relatedSlug === slug)
}
