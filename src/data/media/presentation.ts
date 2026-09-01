export type PresentationOrigin = 'first-party' | 'unsplash' | 'generated'
export type PresentationPlacement = 'home-hero' | 'home-heritage' | 'repertoire-atmosphere'

export interface PresentationVariant {
  src: string
  width: number
  height: number
  bytes: number
}

export interface PresentationMediaAsset {
  id: string
  title: string
  alt: string
  origin: PresentationOrigin
  rights: 'original' | 'licensed'
  /** Atmosphere can support the reading experience; it can never prove a grip or pitch claim. */
  evidenceUse: 'presentation-only'
  placements: PresentationPlacement[]
  variants: {
    mobile: PresentationVariant
    desktop: PresentationVariant
  }
  fallback: string
  credit: {
    label: string
    sourceUrl?: string
    licenseUrl?: string
  }
  generated?: {
    provider: string
    model: string
    generatedAt: string
    promptSummary: string
  }
}

export const PRESENTATION_MEDIA = {
  homeGripStill: {
    id: 'home-grip-still',
    title: 'Four-seam grip, first-party still',
    alt: 'Austin holding a baseball with index and middle fingertips crossing the wide horseshoe seam.',
    origin: 'first-party',
    rights: 'original',
    evidenceUse: 'presentation-only',
    placements: ['home-hero'],
    variants: {
      mobile: { src: '/presentation/four-seam-hero-33dc9dcf.webp', width: 900, height: 900, bytes: 60966 },
      desktop: { src: '/presentation/four-seam-hero-33dc9dcf.webp', width: 900, height: 900, bytes: 60966 },
    },
    fallback: '/brand/seal-128.webp',
    credit: { label: 'Austin H. / Pitch Atlas' },
  },
  homeThreadAtmosphere: {
    id: 'home-thread-atmosphere',
    title: 'Leather and thread material study',
    alt: '',
    origin: 'generated',
    rights: 'original',
    evidenceUse: 'presentation-only',
    placements: ['home-hero'],
    variants: {
      mobile: {
        src: '/presentation/thread-atmosphere-7ff14289.webp',
        width: 800,
        height: 451,
        bytes: 21174,
      },
      desktop: {
        src: '/presentation/thread-atmosphere-30c8088c.webp',
        width: 1600,
        height: 901,
        bytes: 68656,
      },
    },
    fallback: '/atmosphere/leather.webp',
    credit: { label: 'Pitch Atlas original material study' },
    generated: {
      provider: 'OpenAI built-in image generation',
      model: 'imagegen',
      generatedAt: '2026-08-31',
      promptSummary:
        'Abstract matte-black letterpress stock, aged leather, crimson thread fibers, and restrained cyan and amber foil; no complete baseball, seam path, person, logo, or text.',
    },
  },
  homePlateHeritage: {
    id: 'home-plate-heritage',
    title: 'Scuffed home plate',
    alt: 'A worn white home plate set into reddish infield dirt, marked by game use.',
    origin: 'unsplash',
    rights: 'licensed',
    evidenceUse: 'presentation-only',
    placements: ['home-heritage'],
    variants: {
      mobile: {
        src: '/presentation/home-plate-a7d9ae3d.webp',
        width: 900,
        height: 900,
        bytes: 82338,
      },
      desktop: {
        src: '/presentation/home-plate-d3067ee4.webp',
        width: 1800,
        height: 900,
        bytes: 183194,
      },
    },
    fallback: '/atmosphere/archive-paper.webp',
    credit: {
      label: 'Mick Haupt / Unsplash',
      sourceUrl: 'https://unsplash.com/photos/a-close-up-of-a-wooden-board-1ttDmCobFQo',
      licenseUrl: 'https://unsplash.com/license',
    },
  },
  repertoireWornSeam: {
    id: 'repertoire-worn-seam',
    title: 'Worn baseball seam',
    alt: 'A close crop of a game-used baseball with scuffed leather and raised red stitching.',
    origin: 'unsplash',
    rights: 'licensed',
    evidenceUse: 'presentation-only',
    placements: ['repertoire-atmosphere'],
    variants: {
      mobile: {
        src: '/presentation/worn-seam-22034e2b.webp',
        width: 800,
        height: 800,
        bytes: 43860,
      },
      desktop: {
        src: '/presentation/worn-seam-c2d0a58d.webp',
        width: 1600,
        height: 960,
        bytes: 77264,
      },
    },
    fallback: '/atmosphere/seam-macro.webp',
    credit: {
      label: 'Mick Haupt / Unsplash',
      sourceUrl: 'https://unsplash.com/photos/a-close-up-of-a-baseball-game-1za_Ddp_Xfs',
      licenseUrl: 'https://unsplash.com/license',
    },
  },
} as const satisfies Record<string, PresentationMediaAsset>

export type PresentationMediaId = (typeof PRESENTATION_MEDIA)[keyof typeof PRESENTATION_MEDIA]['id']
