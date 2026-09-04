import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

import './globals.css'

import FluxRuntime from '@/components/FluxRuntime'
import Nav from '@/components/Nav'
import { site } from '@/content/site'
import { siteUrl } from '@/lib/siteUrl'

// Body copy is a single weight — headings are all Nohemi — so a static 400
// instance ships instead of the full variable font.
const inter = Inter({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-inter',
})

const url = siteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: site.seo.title,
    template: `%s — ${site.name}`,
  },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    locale: 'en_GB',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Fluxion Studios — websites that feel unmistakably yours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
}

const organisation = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  alternateName: site.shortName,
  url,
  logo: `${url}/brand/wordmark-dark.png`,
  image: `${url}/og.png`,
  description: site.seo.description,
  email: site.email,
  sameAs: [site.linkedin, ...site.about.people.map((person) => person.linkedin)],
  founder: site.about.people.map((person) => ({ '@type': 'Person', name: person.name })),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // `data-tone` drives the ground, `data-ink` the type. The engine moves the
  // second a beat after the first, so the ink never crossfades through the
  // ground's own colour. Both start dark, as the hero does.
  return (
    <html lang="en" data-tone="dark" data-ink="dark" className={inter.variable}>
      <head>
        <link
          rel="preload"
          href="/fonts/Nohemi-VF.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Without JavaScript nothing pins, nothing sweeps, and nothing stays
            hidden waiting to be revealed — the page reads straight down. */}
        <noscript>
          <style>{`
            [data-reveal]{-webkit-mask-image:none!important;mask-image:none!important}
            [data-reveal]::after{display:none!important}
            .hero,.depth,.process{height:auto!important}
            .hero__stage,.depth__stage,.process__stage{position:static!important;height:auto!important;padding-block:var(--bay)}
            .hero__inner{transform:none!important;opacity:1!important}
            .hero__cue{display:none}
            .philosophy{margin-top:0!important}
            .process__stages::before{display:none}
            .depth__field{overflow:visible}
            .planes{gap:clamp(40px,7vh,88px)}
            .plane{grid-area:auto!important;opacity:1!important;transform:none!important;align-items:start}
            .plane__frag{transform:none!important}
            .depth__meter,.process__meter{display:none}
            .process__stages{gap:clamp(36px,6vh,72px)}
            .stage{grid-area:auto!important;opacity:1!important;transform:none!important}
            .stage__name{font-size:clamp(2rem,5vw,4rem);font-variation-settings:'wght' 900}
            .sweep__w{opacity:1!important}
            .nav__toggle{display:none!important}
          `}</style>
        </noscript>
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <div className="ground" aria-hidden="true" />
        <FluxRuntime />
        <Nav />
        {children}
        <script
          type="application/ld+json"
          // Static, author-controlled data — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisation) }}
        />
      </body>
    </html>
  )
}
