import type { RightsStatus, Source } from '../types'
import { src } from '../sources'

/*
  Historical and original image plates for the Lost Pitches wing.
  Public-domain plates are derivative crops from the linked source files. Original
  plates are first-party archive studies used when a clean historical likeness or
  grip image is not rights-safe enough to ship.
*/

export type ArchivePlateKind = 'portrait' | 'team' | 'venue' | 'original-study'

export interface ArchiveImage {
  id: string
  title: string
  label: string
  plateKind: ArchivePlateKind
  imageSrc: string
  alt: string
  caption: string
  source?: Source
  rights: RightsStatus
  width: number
  height: number
  qualityNote: string
  relatedSlug: string
  relatedLabel: string
}

export const LOST_PITCH_ARCHIVE_IMAGES: ArchiveImage[] = [
  {
    id: 'satchel-paige-1942-plate',
    title: 'Satchel Paige, 1942',
    label: 'Public-domain portrait plate',
    plateKind: 'portrait',
    imageSrc: '/archive/lost-pitches/satchel-paige-1942-plate.jpg',
    alt: 'Public-domain archive plate built from a black-and-white 1942 photograph of Satchel Paige.',
    caption: 'Paige is present as an archival subject, not a substitute for a recovered hesitation-pitch grip.',
    source: src('commons-satchel-paige-1942'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'High enough for a full plate; original source is 861 by 1545 pixels.',
    relatedSlug: 'satchel-paige-hesitation-pitch',
    relatedLabel: "Satchel Paige's Hesitation Pitch",
  },
  {
    id: 'hilton-smith-curveball-study',
    title: 'Hilton Smith curveball',
    label: 'Original archive study',
    plateKind: 'original-study',
    imageSrc: '/archive/lost-pitches/hilton-smith-curveball-study.jpg',
    alt: 'Original Pitch Atlas archive plate with a curve path study for Hilton Smith.',
    caption: 'The record keeps Smith tied to the curveball without pretending a clean public grip image was recovered.',
    rights: 'original',
    width: 960,
    height: 720,
    qualityNote: 'First-party plate used because this pass found no clean public-domain Smith image fit for reuse.',
    relatedSlug: 'hilton-smith-curveball',
    relatedLabel: "Hilton Smith's Curveball",
  },
  {
    id: 'rube-foster-1924-plate',
    title: 'Rube Foster, 1924',
    label: 'Public-domain builder plate',
    plateKind: 'portrait',
    imageSrc: '/archive/lost-pitches/rube-foster-1924-plate.jpg',
    alt: 'Public-domain archive plate built from a 1924 photograph of Rube Foster.',
    caption:
      'Foster belongs here twice: as the arm behind the fadeaway and as the organizer who built the league structure around the craft.',
    source: src('commons-rube-foster-1924'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Small source crop at 286 by 338 pixels, held inside a matte instead of blown full-bleed.',
    relatedSlug: 'rube-foster-fadeaway',
    relatedLabel: "Rube Foster's Fadeaway",
  },
  {
    id: 'bullet-rogan-1924-plate',
    title: 'Bullet Rogan, 1924',
    label: 'Public-domain arsenal plate',
    plateKind: 'portrait',
    imageSrc: '/archive/lost-pitches/bullet-rogan-1924-plate.jpg',
    alt: 'Public-domain archive plate built from a 1924 photograph crop of Bullet Joe Rogan.',
    caption: 'Rogan gets a physical file presence without turning the card into invented pitch-design detail.',
    source: src('commons-bullet-joe-rogan-1924'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Small source crop at 240 by 452 pixels, kept as an artifact plate.',
    relatedSlug: 'bullet-rogan-arsenal',
    relatedLabel: "Bullet Rogan's Arsenal",
  },
  {
    id: 'smokey-joe-williams-plate',
    title: 'Smokey Joe Williams',
    label: 'Public-domain portrait plate',
    plateKind: 'portrait',
    imageSrc: '/archive/lost-pitches/smokey-joe-williams-plate.jpg',
    alt: 'Public-domain archive plate built from a black-and-white portrait of Smokey Joe Williams.',
    caption: 'The fastball file gets a face, while the pitch claim still rests on the written record.',
    source: src('commons-smokey-joe-williams'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Medium source at 332 by 400 pixels, readable as a portrait artifact.',
    relatedSlug: 'smokey-joe-williams-fastball',
    relatedLabel: "Smokey Joe Williams' Fastball",
  },
  {
    id: 'chet-brewer-emery-study',
    title: 'Chet Brewer emery study',
    label: 'Original archive study',
    plateKind: 'original-study',
    imageSrc: '/archive/lost-pitches/chet-brewer-emery-study.jpg',
    alt: 'Original Pitch Atlas archive plate showing a seam path and scuff-study marks for Chet Brewer.',
    caption:
      'A legality-and-feel plate fits Brewer better than a weak likeness: the file is about a doctored-ball record, not portrait decoration.',
    rights: 'original',
    width: 960,
    height: 720,
    qualityNote: 'First-party plate used because this pass found no clean public-domain Brewer image fit for reuse.',
    relatedSlug: 'chet-brewer-emery-ball',
    relatedLabel: "Chet Brewer's Emery Ball",
  },
  {
    id: 'phil-cockrell-1924-plate',
    title: 'Phil Cockrell, 1924',
    label: 'Public-domain spitball plate',
    plateKind: 'portrait',
    imageSrc: '/archive/lost-pitches/phil-cockrell-1924-plate.jpg',
    alt: 'Public-domain archive plate built from a 1924 photograph crop of Phil Cockrell.',
    caption: "Cockrell's plate stays deliberately thin: a surviving likeness beside a record that names the pitch but not the grip.",
    source: src('commons-phil-cockrell-1924'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Small source crop at 230 by 329 pixels, held inside a matte.',
    relatedSlug: 'phil-cockrell-spitball',
    relatedLabel: "Phil Cockrell's Spitball",
  },
  {
    id: 'negro-league-all-star-1936-plate',
    title: 'Comiskey Park, 1936',
    label: 'Public-domain venue plate',
    plateKind: 'venue',
    imageSrc: '/archive/lost-pitches/negro-league-all-star-1936-plate.jpg',
    alt: 'Public-domain archive plate from the 1936 Negro League All-Star Game at Comiskey Park.',
    caption:
      'The doctored-ball recovery file gets the recovered stage: crowd, venue, date. The claims stay in the sourced record.',
    source: src('commons-negro-league-all-star-1936'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Strong source at 2912 by 1639 pixels, safe for a broad contextual crop.',
    relatedSlug: 'doctored-ball-divergence-and-recovery',
    relatedLabel: 'The Doctored-Ball Divergence and the Recovery',
  },
  {
    id: 'cannonball-redding-1912-plate',
    title: 'Lincoln Giants, 1912',
    label: 'Public-domain team plate',
    plateKind: 'team',
    imageSrc: '/archive/lost-pitches/cannonball-redding-1912-plate.jpg',
    alt: 'Public-domain archive plate from a 1912 Lincoln Giants team photograph connected to Cannonball Dick Redding.',
    caption: 'Redding is filed through his early Lincoln Giants context rather than a shaky individual crop.',
    source: src('commons-lincoln-giants-1912'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Good source at 960 by 689 pixels, presented as team context rather than individual portrait proof.',
    relatedSlug: 'cannonball-dick-redding',
    relatedLabel: 'Cannonball Dick Redding',
  },
  {
    id: 'leon-day-no-windup-study',
    title: 'Leon Day timing study',
    label: 'Original archive study',
    plateKind: 'original-study',
    imageSrc: '/archive/lost-pitches/leon-day-no-windup-study.jpg',
    alt: 'Original Pitch Atlas archive plate showing a clock and seam path for Leon Day no-windup timing.',
    caption:
      'The motion claim is about timing and delivery memory. The plate shows that gap without inventing release mechanics.',
    rights: 'original',
    width: 960,
    height: 720,
    qualityNote: 'First-party plate used because this pass found no clean public-domain Day image fit for reuse.',
    relatedSlug: 'leon-day-no-windup',
    relatedLabel: "Leon Day's No-Windup Delivery",
  },
  {
    id: 'dave-brown-1923-plate',
    title: 'Dave Brown, 1923',
    label: 'Public-domain card plate',
    plateKind: 'portrait',
    imageSrc: '/archive/lost-pitches/dave-brown-1923-plate.jpg',
    alt: 'Public-domain archive plate built from a 1923 Tomas Gutierrez baseball card image of Dave Brown.',
    caption: "Brown's left-handed file gets a card artifact, with the limits of the record still visible around it.",
    source: src('commons-dave-brown-1923'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Small source at 254 by 386 pixels, readable as a card artifact.',
    relatedSlug: 'dave-brown-lefty-ace',
    relatedLabel: 'Dave Brown, Lefty Ace',
  },
  {
    id: 'william-bell-1924-plate',
    title: 'William Bell, 1924',
    label: 'Public-domain workhorse plate',
    plateKind: 'portrait',
    imageSrc: '/archive/lost-pitches/william-bell-1924-plate.jpg',
    alt: 'Public-domain archive plate built from a 1924 photograph crop of William Bell Sr.',
    caption: "Bell's innings-heavy record gets a sourced artifact, not a fabricated mechanical profile.",
    source: src('commons-william-bell-1924'),
    rights: 'public-domain',
    width: 960,
    height: 720,
    qualityNote: 'Small source crop at 226 by 321 pixels, held inside a matte.',
    relatedSlug: 'william-bell-sr-workhorse',
    relatedLabel: 'William Bell Sr., Workhorse',
  },
  {
    id: 'paige-bee-ball-study',
    title: 'Paige Bee Ball',
    label: 'Original legend plate',
    plateKind: 'original-study',
    imageSrc: '/archive/lost-pitches/paige-bee-ball-study.jpg',
    alt: 'Original Pitch Atlas archive plate with a bee-ball seam study for a Satchel Paige legend pitch.',
    caption: 'The name is the artifact here. The plate marks the legend tier without inventing a grip.',
    rights: 'original',
    width: 960,
    height: 720,
    qualityNote: 'First-party legend plate used because no clean grip source survives in the filed record.',
    relatedSlug: 'paige-bee-ball',
    relatedLabel: "Paige's Bee Ball",
  },
  {
    id: 'paige-trouble-ball-study',
    title: 'Paige Trouble Ball',
    label: 'Original legend plate',
    plateKind: 'original-study',
    imageSrc: '/archive/lost-pitches/paige-trouble-ball-study.jpg',
    alt: 'Original Pitch Atlas archive plate with a trouble-ball seam study for a Satchel Paige legend pitch.',
    caption: 'A named-pitch plate keeps the surviving label visible and the missing grip visible too.',
    rights: 'original',
    width: 960,
    height: 720,
    qualityNote: 'First-party legend plate used because no clean grip source survives in the filed record.',
    relatedSlug: 'paige-trouble-ball',
    relatedLabel: "Paige's Trouble Ball",
  },
  {
    id: 'paige-showman-arsenal-study',
    title: 'Paige showman arsenal',
    label: 'Original legend plate',
    plateKind: 'original-study',
    imageSrc: '/archive/lost-pitches/paige-showman-arsenal-study.jpg',
    alt: 'Original Pitch Atlas archive plate with a showman-arsenal seam study for Satchel Paige legend pitches.',
    caption: 'The labels are filed as labels, not rebuilt mechanics.',
    rights: 'original',
    width: 960,
    height: 720,
    qualityNote: 'First-party legend plate used because no clean grip source survives in the filed record.',
    relatedSlug: 'paige-showman-arsenal',
    relatedLabel: "Paige's Showman Arsenal",
  },
]

export function archiveImageForLostPitch(slug: string): ArchiveImage | undefined {
  return LOST_PITCH_ARCHIVE_IMAGES.find((image) => image.relatedSlug === slug)
}
