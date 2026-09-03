'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { site } from '@/content/site'

/**
 * The wordmark ships in two supplied variants whose fields match the two page
 * grounds, so switching between them as the tone changes keeps the mark
 * correct without ever recolouring it. Both are stacked and crossfaded.
 */
export default function Nav() {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    let last = false
    const onScroll = () => {
      const next = window.scrollY > 24
      if (next !== last) {
        last = next
        setStuck(next)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="nav" data-stuck={stuck ? 'true' : 'false'}>
      <a className="nav__brand" href="#top">
        <span className="brandmark">
          <Image
            className="brandmark__img brandmark__img--dark"
            src="/brand/mark-dark.png"
            alt=""
            width={145}
            height={62}
            priority
          />
          <Image
            className="brandmark__img brandmark__img--light"
            src="/brand/mark-light.png"
            alt=""
            width={145}
            height={62}
            priority
          />
        </span>
        <span className="sr-only">{site.name} — back to top</span>
      </a>

      <nav className="nav__links" aria-label="Page sections">
        {site.nav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="btn btn--solid btn--sm nav__cta" href="#contact">
        {site.hero.primary.label}
      </a>
    </header>
  )
}
