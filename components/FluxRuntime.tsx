'use client'

import { useEffect } from 'react'

import FluxField from '@/components/FluxField'
import { startFlux } from '@/lib/flux'

/**
 * Starts the scroll engine, draws the flux line, and reveals anything marked
 * `data-reveal` as it comes into view. Everything here is an enhancement: the
 * page is complete and readable without it.
 */
export default function FluxRuntime() {
  useEffect(() => startFlux(), [])

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!targets.length) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      targets.forEach((el) => {
        el.dataset.in = 'true'
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.in = 'true'
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return <FluxField />
}
