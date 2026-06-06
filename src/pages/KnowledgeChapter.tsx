import { useParams } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { wingBySlug } from '../data/knowledge'
import { KnowledgePage } from '../components/sections/KnowledgePage'
import { NotFound } from './NotFound'

/*
  One knowledge wing, by slug. The build-time prerender lists every wing slug, so
  each gets its own static HTML file. A bad slug falls through to the 404, never a
  blank page.
*/
export function KnowledgeChapter() {
  const { slug } = useParams<{ slug: string }>()
  const wing = slug ? wingBySlug(slug) : undefined

  useSeoMeta(
    wing
      ? {
          title: `${wing.title} | Learn | ${SITE.siteName}`,
          description: wing.summary,
          ogTitle: `${wing.navLabel || wing.title} | ${SITE.siteName}`,
          ogDescription: wing.summary,
          ogUrl: `${SITE.canonicalDomain}/learn/${wing.slug}`,
        }
      : { title: `Wing not found | ${SITE.siteName}` },
  )

  if (!wing) return <NotFound />
  return <KnowledgePage wing={wing} />
}
