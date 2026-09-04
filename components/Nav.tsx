'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { nav as chapters, site } from '@/content/site'
import { onFrame, onStuck, type SceneName } from '@/lib/flux'

/** Nav href → the scene the engine reports while that chapter owns the screen. */
const SCENE_FOR: Record<string, SceneName> = {
  '#philosophy': 'philosophy',
  '#depth': 'depth',
  '#process': 'process',
  '#about': 'about',
}

/** Reading order, so a chapter knows whether it is behind or ahead of you. */
const SCENE_ORDER: SceneName[] = ['hero', 'philosophy', 'depth', 'process', 'about', 'contact']

/**
 * The wordmark ships in two supplied variants whose fields match the two page
 * grounds, so switching between them as the tone changes keeps the mark
 * correct without ever recolouring it. Both are stacked and crossfaded.
 */
export default function Nav() {
  const [stuck, setStuck] = useState(false)
  const [scene, setScene] = useState<SceneName>('hero')
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const barRef = useRef<HTMLElement>(null)

  // The engine already tracks scroll every frame; a second scroll listener here
  // would do the same work twice.
  useEffect(() => onStuck(setStuck), [])

  useEffect(
    () =>
      onFrame((s) => {
        setScene((prev) => (prev === s.scene ? prev : s.scene))
      }),
    [],
  )

  /*
    Each chapter's numeral fills with red as you move through that chapter, so
    the nav doubles as a progress spine rather than only saying which chapter
    you are in. Written straight to the element: this changes every frame, and
    running it through React state would re-render the masthead sixty times a
    second to move a gradient stop.
  */
  useEffect(
    () =>
      onFrame((s) => {
        const bar = barRef.current
        if (!bar) return
        const active = SCENE_ORDER.indexOf(s.scene)
        const marks = bar.querySelectorAll<HTMLElement>('[data-chapter]')
        for (const el of marks) {
          const i = SCENE_ORDER.indexOf(el.dataset.chapter as SceneName)
          const fill = i < active ? 1 : i > active ? 0 : s.sceneT
          const next = fill.toFixed(3)
          if (el.dataset.fill !== next) {
            el.dataset.fill = next
            el.style.setProperty('--fill', next)
          }
        }
      }),
    [],
  )

  // The narrow-screen panel is a menu, so it closes on Escape and on a click
  // outside it, and hands focus back to the control that opened it.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const links = chapters.map((item) => ({
    ...item,
    current: SCENE_FOR[item.href] === scene,
  }))

  return (
    <header
      ref={barRef}
      className="nav"
      data-stuck={stuck ? 'true' : 'false'}
      data-open={open ? 'true' : 'false'}
    >
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
        {links.map((item) => (
          <a key={item.href} href={item.href} aria-current={item.current ? 'true' : undefined}>
            <span className="nav__n" aria-hidden="true" data-chapter={SCENE_FOR[item.href]}>
              {item.mark}
            </span>
            {item.label}
            <span className="nav__mark" aria-hidden="true" />
          </a>
        ))}
      </nav>

      <a className="btn btn--solid btn--sm nav__cta" href="#contact">
        {site.hero.primary.label}
      </a>

      <button
        ref={toggleRef}
        type="button"
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="nav-panel"
        aria-label={open ? 'Close sections menu' : 'Open sections menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav__bars" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <div className="nav__panel" id="nav-panel" ref={panelRef} hidden={!open}>
        <ul>
          {links.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={item.current ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="nav__n" aria-hidden="true" data-chapter={SCENE_FOR[item.href]}>
                  {item.mark}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
