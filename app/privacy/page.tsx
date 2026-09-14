import type { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

import { site } from '@/content/site'

/**
 * The privacy page.
 *
 * Server rendered, no client JavaScript, no motion of its own: the page is a
 * reading column and should survive being read without anything running. It
 * shares the site's tokens rather than introducing a second visual language —
 * the same shell width, gutter, bay, micro type, rules, and focus treatment as
 * the chapters on the main page.
 */

const { privacy } = site
const privacyTitle = `Privacy — ${site.name}`

export const metadata: Metadata = {
  title: 'Privacy',
  description: privacy.metaDescription,
  alternates: { canonical: '/privacy' },
  openGraph: {
    type: 'website',
    url: '/privacy',
    siteName: site.name,
    title: privacyTitle,
    description: privacy.metaDescription,
    locale: 'en_GB',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: `${site.name} — ${privacy.heading}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: privacyTitle,
    description: privacy.metaDescription,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

/**
 * Renders a paragraph, linking the studio's own email wherever the copy
 * mentions it. The copy stays a plain string in `content/site.ts`; this is the
 * one transformation applied to it, and it only ever links a fixed address.
 */
function Paragraph({ text }: { text: string }) {
  const parts = text.split(site.email)

  if (parts.length === 1) return <p>{text}</p>

  return (
    <p>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <a className="link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          )}
        </Fragment>
      ))}
    </p>
  )
}

export default function PrivacyPage() {
  return (
    <main id="main" className="policy">
      <header className="policy__head">
        <p className="eyebrow">Privacy</p>
        <h1 className="policy__title">{privacy.heading}</h1>
        <p className="policy__intro">{privacy.intro}</p>
        <p className="policy__meta">
          {privacy.updated.label} — {privacy.updated.value}
        </p>
        <p className="policy__contact">
          <span className="policy__contact-label">{privacy.contactLabel}</span>
          <a className="link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
      </header>

      <div className="policy__body">
        {privacy.sections.map((section) => (
          <section className="policy__section" key={section.id} aria-labelledby={`${section.id}-h`}>
            <h2 className="policy__h" id={`${section.id}-h`}>
              {section.heading}
            </h2>
            {section.blocks.map((block, i) =>
              'list' in block ? (
                <ul key={i}>
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <Paragraph key={i} text={block.p} />
              ),
            )}
          </section>
        ))}
      </div>

      <p className="policy__back">
        <Link className="link" href="/">
          {privacy.back}
        </Link>
      </p>
    </main>
  )
}
