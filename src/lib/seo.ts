import { SITE } from '../config/site'

/*
  Canonical URLs follow the generated sitemap: production origin, no query
  string, trailing slash for every published route. Search and filters are UI
  state, not alternate canonical documents.
*/
export function canonicalUrl(pathname: string): string {
  if (!pathname || pathname === '/') return `${SITE.canonicalDomain}/`
  const clean = `/${pathname.split('/').filter(Boolean).join('/')}`
  return `${SITE.canonicalDomain}${clean}/`
}

export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE.canonicalDomain}/#website`,
        name: SITE.siteName,
        url: `${SITE.canonicalDomain}/`,
        description:
          'A grip-first field manual for pitching grips, variants, craftsmen, and sourced community notes.',
        inLanguage: 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE.canonicalDomain}/repertoire/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'CreativeWork',
        '@id': `${SITE.canonicalDomain}/#field-manual`,
        name: `${SITE.siteName}: The Living Field Manual for Pitching Grips`,
        url: `${SITE.canonicalDomain}/`,
        headline: 'How pitchers grip and shape the baseball, labeled by source.',
        abstract:
          'Grip-first reference for pitch specimens, variants, craftsmen, lost pitches, and community field notes. Sourced, not corrected.',
        isAccessibleForFree: true,
        inLanguage: 'en',
        creator: { '@type': 'Organization', name: SITE.siteName },
        isPartOf: { '@id': `${SITE.canonicalDomain}/#website` },
      },
    ],
  }
}
