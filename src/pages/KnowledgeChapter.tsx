import { useParams } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
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
          ogUrl: canonicalUrl('/learn/' + wing.slug),
          ...ogImageMeta('learn', `Learn: ${wing.title}`),
        }
      : { title: `Wing not found | ${SITE.siteName}` },
  )

  if (!wing) return <NotFound />
  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'Article',
          url: canonicalUrl('/learn/' + wing.slug),
          name: wing.title,
          description: wing.summary,
          breadcrumb: [
            { name: 'The Atlas', to: '/' },
            { name: 'Learn', to: '/learn' },
            { name: wing.title },
          ],
        })}
      />
      <KnowledgePage wing={wing} />
    </>
  )
}
