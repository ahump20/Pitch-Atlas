import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { SectionHero } from '../components/layout/SectionHero'

/*
  The support page the iOS app's Account screen links to. Short and factual:
  what the product is, how to flag a problem, how to delete an account. The
  contact route is the in-product Report flow. No invented email, phone, or
  address appears here.
*/

const HELP_ROWS = [
  {
    label: 'Report a problem with a note or post',
    text: 'Every field note and discussion post carries a Report action. Use it. Reports go to a moderation queue, and a post reported by enough separate accounts is hidden pending review. In the iOS app you can also block a contributor outright.',
  },
  {
    label: 'Delete your account',
    text: 'In the Pitch Atlas iOS app, open the Account screen and choose delete account. That removes your community posts, your uploaded media, and the account itself. On the web you can delete your own discussion posts from the page where they appear.',
  },
  {
    label: 'Question a claim in the archive',
    text: 'Every figure on a specimen page is labeled with where it came from. Start at the source registry. If a claim looks wrong, the source link is one click away, and the label tells you how much weight it was ever meant to carry.',
  },
]

export function SupportPage() {
  useSeoMeta({
    title: `Support | ${SITE.siteName}`,
    description:
      'How to report a problem, delete your account, or question a claim in Pitch Atlas, the sourced archive of pitch craft.',
    ogTitle: `Support | ${SITE.siteName}`,
    ogDescription: 'Report a problem, delete your account, or question a claim in the archive.',
    ogUrl: canonicalUrl('/support'),
    twitterCard: 'summary_large_image',
  })

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/support'),
          name: 'Support',
          description:
            'How to report a problem, delete your account, or question a claim in Pitch Atlas, the sourced archive of pitch craft.',
          breadcrumb: [{ name: 'Pitch Atlas', to: '/' }, { name: 'Support' }],
        })}
      />
      <SectionHero
        eyebrow="Support"
        title={
          <>
            Something off? <span className="rfx-holo">Flag it.</span>
          </>
        }
        sub={
          <p>
            Pitch Atlas is a sourced archive for how pitchers grip and shape a baseball. It is
            a reference site and an iOS app, with an optional community layer for field notes and
            discussion. This page covers the three help routes people need most.
          </p>
        }
        breadcrumb={<Breadcrumb trail={[{ label: 'Pitch Atlas', to: '/' }, { label: 'Support' }]} />}
      />

      <section className="border-t border-ink/15">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <div className="border-t border-ink/15">
            {HELP_ROWS.map((row, i) => (
              <div key={row.label} className="grid gap-4 border-b border-ink/15 py-6 sm:grid-cols-[4.25rem_1fr]">
                <span
                  className="h-fit w-fit rounded border border-seam/50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-seam"
                  style={{ transform: `rotate(${i % 2 ? -2 : 2}deg)` }}
                >
                  {i + 1}
                </span>
                <div>
                  <h2 className="rfx-athletic rfx-skew text-ink" style={{ fontSize: 'clamp(20px,3vw,30px)' }}>
                    {row.label}
                  </h2>
                  <p className="mt-2 max-w-[64ch] text-[15px] leading-relaxed text-ink-2">{row.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-skick">Contact</p>
          <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
            Report issues through the in-product Report flow on any note or post. Every report is
            reviewed. For how the archive handles your data, read the{' '}
            <Link to="/privacy" className="text-seam transition-colors hover:text-ink">
              privacy policy
            </Link>
            ; for how archive claims are sourced, read the{' '}
            <Link to="/sources" className="text-seam transition-colors hover:text-ink">
              source registry
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
