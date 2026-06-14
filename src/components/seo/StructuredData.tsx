import { useHead } from '@unhead/react'

/*
  One reusable head-only injector for a schema.org JSON-LD graph. It renders
  nothing into the page body — useHead places a single <script
  type="application/ld+json"> in <head>, so a page opts in with one call right
  next to its useSeoMeta block. Every graph passed here is built from real page
  copy (see lib/seo.ts); no fabricated number ever reaches the markup.

  A `key` keeps the script stable across renders and lets a route replace its own
  node instead of stacking duplicates as the user navigates the SPA.
*/
export function StructuredData({ graph, id }: { graph: unknown; id?: string }) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(graph),
        key: id ?? 'page-jsonld',
      },
    ],
  })
  return null
}
