import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl } from '../lib/seo'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { SectionHero } from '../components/layout/SectionHero'

/*
  The privacy policy, in the same register as the rest of the archive: plain,
  factual, and scoped to what the product actually does. Every claim here is
  checked against the code. The static site runs no analytics scripts, and the
  only data the product holds is what a contributor chooses to file through the
  community layer. The policy date below is the date this text was written, not
  a freshness claim.
*/

const POLICY_DATE = '2026-06-09'

const COLLECTED_ROWS = [
  {
    label: 'Account',
    text: 'A random account ID. If you claim the account: your email address, or your Apple identifier if you used Sign in with Apple in the iOS app. Nothing else identifies you.',
  },
  {
    label: 'Handle',
    text: 'The display name you choose for your posts. It can be anything; it is shown next to what you file.',
  },
  {
    label: 'Submissions',
    text: 'Field notes, discussion posts and replies, the images or clips you attach to them, your Tried This and Helpful marks, reports you file, and your acceptance of the upload terms.',
  },
]

const NOT_COLLECTED_ROWS = [
  { label: 'No ads', text: 'There are no ad networks and no ad identifiers anywhere in the product.' },
  {
    label: 'No tracking',
    text: 'The site runs no analytics scripts and sets no tracking cookies. Reading the archive sends nothing about you to us.',
  },
  { label: 'No sale of data', text: 'Nothing you file is sold, rented, or shared with data brokers. Ever.' },
  {
    label: 'No background collection',
    text: 'No location, no contacts, no camera or microphone access, no reading anything beyond the file you explicitly choose to upload.',
  },
]

export function PrivacyPage() {
  useSeoMeta({
    title: `Privacy | ${SITE.siteName}`,
    description:
      'What Pitch Atlas collects, what it never collects, and how to delete your account. No ads, no tracking analytics, no sale of data.',
    ogTitle: `Privacy | ${SITE.siteName}`,
    ogDescription: 'No ads, no tracking analytics, no sale of data. The community layer holds only what you choose to file.',
    ogUrl: canonicalUrl('/privacy'),
    twitterCard: 'summary_large_image',
  })

  return (
    <>
      <SectionHero
        eyebrow={`Privacy policy / ${POLICY_DATE}`}
        title={
          <>
            What the atlas holds, and what it <span className="rfx-holo">never</span> touches.
          </>
        }
        sub={
          <p>
            Pitch Atlas is a reference first. Reading it requires no account and sends no tracking
            data. The only personal data the product ever holds is what you choose to file through
            the community layer.
          </p>
        }
        breadcrumb={<Breadcrumb trail={[{ label: 'Pitch Atlas', to: '/' }, { label: 'Privacy' }]} />}
      />

      <section className="border-t border-ink/15">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">Reading the archive</p>
            <h2 className="rfx-stitle mt-3 max-w-[15ch] text-[clamp(28px,5vw,52px)]">
              Browsing is anonymous.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
              The archive is a set of static pages. No analytics scripts run, no advertising loads,
              and no tracking cookies are set. The pages you open may be cached on your own device
              so they read offline; that cache lives on your device and is never reported back.
            </p>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
              The same is true in the Pitch Atlas iOS app: the reference archive works fully logged
              out, with no advertising identifiers and no tracking.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">Community accounts</p>
            <h2 className="rfx-stitle mt-3 max-w-[15ch] text-[clamp(28px,5vw,52px)]">
              An account exists only if you post.
            </h2>
            <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-ink-2">
              Field Notes and the discussion threads are optional. Accounts and submissions are
              stored with Supabase, the database service behind the community layer.
            </p>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
              Reading notes and threads needs no account. The first time you post, mark a note, or
              file a report, an anonymous account is created for you: a random ID with no email
              behind it. You can later claim that account with your email so your notes follow you
              across devices; in the iOS app you can also sign in with an emailed link or with
              Sign in with Apple.
            </p>
            <div className="mt-8 border-t border-ink/15">
              {COLLECTED_ROWS.map((row) => (
                <div key={row.label} className="grid gap-3 border-b border-ink/15 py-5 sm:grid-cols-[10rem_1fr]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-seam">{row.label}</p>
                  <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-2">{row.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-skick">What is never collected</p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {NOT_COLLECTED_ROWS.map((row) => (
              <div key={row.label} className="rounded-xl border border-ink/15 bg-paper-2 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-seam">{row.label}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{row.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">Retention and deletion</p>
            <h2 className="rfx-stitle mt-3 max-w-[15ch] text-[clamp(28px,5vw,52px)]">
              Your record, your call.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
              What you file stays in the community record until you remove it, you delete your
              account, or moderation removes it. You can delete your own discussion posts from the
              page where they appear.
            </p>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
              To delete your account entirely, use the Pitch Atlas iOS app. Open Account, then
              choose delete account. That removes your community posts, your uploaded media files,
              and the account itself.
            </p>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
              Moderation works on reports: every note and post carries a Report action, reports go
              to a review queue, and a post reported by enough separate accounts is hidden pending
              review. Abusive language and rapid-fire posting are blocked at the database, not just
              the form. The iOS app additionally lets you block another contributor.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-skick">Contact</p>
          <p className="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-ink-2">
            Report a problem with any note or post through its in-product Report action. That is
            the fastest route to a human review. Questions about how the archive itself is built and
            sourced are answered on the{' '}
            <Link to="/about" className="text-seam transition-colors hover:text-ink">
              About page
            </Link>{' '}
            and the{' '}
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
