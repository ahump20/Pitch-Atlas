import { useParams, Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import type { PitchAtlasEntry } from '../data/types'
import { PITCHES, pitchBySlug } from '../data/pitches'
import { SITE } from '../config/site'
import { PitchHero } from '../components/sections/PitchHero'
import { GripLab } from '../components/sections/GripLab'
import { ReleaseRoom } from '../components/sections/ReleaseRoom'
import { MovementTranslation } from '../components/sections/WhatItDoes'
import { MasterFiles } from '../components/sections/MasterFiles'
import { FieldNotes } from '../components/sections/FieldNotes'
import { NotFound } from './NotFound'

/*
  One pitch, one page. The chapter leads with the pitch hero, then flows through
  Grip Lab, Release Room, Movement, Master Files, and Field Notes, exactly the
  foundation -> masters -> field-notes arc, now scoped to a single specimen and a
  single URL. The chapter nav at the foot moves between specimens and out to the
  Craftsmen.
*/

function ChapterNav({ prev, next }: { prev?: PitchAtlasEntry; next?: PitchAtlasEntry }) {
  return (
    <nav aria-label="Pitch chapters" className="border-t border-navy/15 bg-paper-2/50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        <div className="md:justify-self-start">
          {prev ? (
            <Link
              to={`/pitch/${prev.display.slug}`}
              className="group flex flex-col gap-1 rounded-sm border-l-2 border-l-navy/40 px-4 py-3 transition-colors hover:border-l-seam hover:bg-paper-2"
            >
              <span className="mono-label text-ink-3">← Previous specimen</span>
              <span className="display text-lg text-ink">{prev.canonical.name}</span>
            </Link>
          ) : null}
        </div>

        <Link
          to="/craftsmen"
          className="flex flex-col items-center justify-center gap-1 rounded-sm border border-navy/20 px-4 py-3 text-center transition-colors hover:border-seam md:justify-self-center"
        >
          <span className="mono-label text-navy">The Craftsmen</span>
          <span className="text-sm leading-snug text-ink-2">The legends who defined the craft →</span>
        </Link>

        <div className="md:justify-self-end">
          {next ? (
            <Link
              to={`/pitch/${next.display.slug}`}
              className="group flex flex-col gap-1 rounded-sm border-r-2 border-r-navy/40 px-4 py-3 text-right transition-colors hover:border-r-seam hover:bg-paper-2"
            >
              <span className="mono-label text-ink-3">Next specimen →</span>
              <span className="display text-lg text-ink">{next.canonical.name}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export function PitchChapter() {
  const { slug } = useParams<{ slug: string }>()
  const entry = slug ? pitchBySlug(slug) : undefined

  const idx = entry ? PITCHES.findIndex((p) => p.display.slug === entry.display.slug) : -1
  const prev = idx > 0 ? PITCHES[idx - 1] : undefined
  const next = idx >= 0 && idx < PITCHES.length - 1 ? PITCHES[idx + 1] : undefined

  useSeoMeta(
    entry
      ? {
          title: `${entry.canonical.name}: grip, release, and movement | ${SITE.siteName}`,
          description: `${entry.display.heroIntro} ${entry.masterVariants.length} sourced master files. Sourced, not corrected.`,
          ogTitle: `${entry.canonical.name} | ${SITE.siteName}`,
          ogDescription: entry.display.heroIntro,
          ogUrl: `${SITE.canonicalDomain}/pitch/${entry.display.slug}`,
          twitterCard: 'summary_large_image',
        }
      : { title: `Pitch not found | ${SITE.siteName}` },
  )

  if (!entry) return <NotFound />

  return (
    <>
      <PitchHero entry={entry} />
      <GripLab entry={entry} />
      <ReleaseRoom entry={entry} />
      <MovementTranslation entry={entry} />
      <MasterFiles entry={entry} />
      <FieldNotes entry={entry} />
      <ChapterNav prev={prev} next={next} />
    </>
  )
}
