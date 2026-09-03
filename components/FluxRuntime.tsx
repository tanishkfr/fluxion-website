'use client'

import { useEffect } from 'react'

import FluxField from '@/components/FluxField'
import { startFlux } from '@/lib/flux'

/**
 * Starts the scroll engine, draws the flux line, reveals anything marked
 * `data-reveal` as it comes into view, and owns in-page anchor navigation.
 * Everything here is an enhancement: the page is complete and readable
 * without it.
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

  /**
   * Anchor navigation.
   *
   * `scroll-behavior: smooth` used to be set globally on <html>. That also
   * animates the browser's own scroll restoration, which on a page this tall
   * gets cancelled part way and dumps you back at the top after a reload.
   * Smoothing is applied per click instead, so a reload lands exactly where it
   * left off. `scrollIntoView` is used rather than `scrollTo` because it
   * honours `scroll-margin-top`, which keeps the target clear of the masthead.
   */
  useEffect(() => {
    const go = (hash: string, smooth: boolean) => {
      const el = document.querySelector<HTMLElement>(hash)
      if (!el) return false
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
      // Move the reading position too, not just the viewport, so a keyboard or
      // screen reader user carries on from the target rather than from the top.
      if (!el.matches('a, button, input, select, textarea, [tabindex]')) {
        el.setAttribute('tabindex', '-1')
      }
      el.focus({ preventScroll: true })
      return true
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const anchor = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      const hash = anchor.getAttribute('href')
      if (!hash || hash === '#') return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!go(hash, !reduced)) return
      e.preventDefault()
      history.pushState(null, '', hash)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return <FluxField />
}
