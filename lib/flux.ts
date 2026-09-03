'use client'

/**
 * The scroll engine.
 *
 * One requestAnimationFrame loop for the whole page. It measures every
 * registered section once per layout change, then on each frame writes a
 * single custom property (`--p`, 0 to 1) onto each section and publishes a
 * global scene value that the flux canvas draws from.
 *
 * Nothing here reads layout during the frame, so scrolling never thrashes.
 */

export type SceneName =
  | 'hero'
  | 'philosophy'
  | 'build'
  | 'process'
  | 'surface'
  | 'about'
  | 'contact'

export type Tone = 'dark' | 'light'

/** How a section's progress is mapped onto the scroll position. */
export type RangeKind = 'pin' | 'through' | 'sweep'

export interface FluxState {
  /** Scene owning the viewport right now. */
  scene: SceneName
  /** Progress within that scene, 0 to 1. */
  sceneT: number
  /** Seconds since the engine started. Frozen when motion is reduced. */
  time: number
  vw: number
  vh: number
  /** Pointer position in normalised viewport space, -1 to 1. */
  pointerX: number
  pointerY: number
  pointerActive: boolean
  reduced: boolean
}

interface Track {
  el: HTMLElement
  scene: SceneName | null
  tone: Tone | null
  kind: RangeKind
  /** Cached document-space geometry. */
  top: number
  height: number
}

/** Viewport-height offsets that define where progress starts and ends. */
const RANGES: Record<RangeKind, [number, number]> = {
  // Pinned wrapper: 0 when its top hits the top of the viewport, 1 when its
  // bottom does.
  pin: [0, 1],
  // Enters from the bottom of the viewport, finishes as it leaves the top.
  through: [1, 0],
  // Tighter window for word-by-word reveals.
  sweep: [0.8, 0.45],
}

const state: FluxState = {
  scene: 'hero',
  sceneT: 0,
  time: 0,
  vw: 0,
  vh: 0,
  pointerX: 0,
  pointerY: 0,
  pointerActive: false,
  reduced: false,
}

const subscribers = new Set<(s: FluxState) => void>()
let tracks: Track[] = []
let rafId = 0
let started = 0
let needsMeasure = true
/** How many callers currently want the loop alive. */
let starts = 0
let bound: (() => void) | null = null

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function measure(): void {
  const scrollY = window.scrollY
  state.vw = window.innerWidth
  state.vh = window.innerHeight
  for (const t of tracks) {
    const rect = t.el.getBoundingClientRect()
    t.top = rect.top + scrollY
    t.height = rect.height
  }
  // Furthest-down section first makes the tone lookup a simple scan.
  tracks.sort((a, b) => a.top - b.top)
  needsMeasure = false
}

function progressFor(track: Track, scrollY: number, vh: number): number {
  const [s0, s1] = RANGES[track.kind]
  const start = track.top - vh * s0
  const end = track.top + track.height - vh * s1
  const span = end - start
  if (span <= 0) return scrollY >= start ? 1 : 0
  return clamp01((scrollY - start) / span)
}

function tick(now: number): void {
  rafId = requestAnimationFrame(tick)
  if (needsMeasure) measure()

  const scrollY = window.scrollY
  const vh = state.vh
  state.time = state.reduced ? 0 : (now - started) / 1000

  // Anything crossing this line owns the tone and the scene.
  const focus = scrollY + vh * 0.5
  let scene: SceneName = 'hero'
  let sceneT = 0
  let tone: Tone = 'dark'

  for (const t of tracks) {
    const p = progressFor(t, scrollY, vh)
    t.el.style.setProperty('--p', p.toFixed(4))
    if (t.tone && t.top <= focus) tone = t.tone
    if (t.scene && t.top <= focus && t.top + t.height > focus) {
      scene = t.scene
      sceneT = p
    }
  }

  state.scene = scene
  state.sceneT = sceneT

  const root = document.documentElement
  if (root.dataset.tone !== tone) root.dataset.tone = tone

  for (const fn of subscribers) fn(state)
}

function onResize(): void {
  needsMeasure = true
}

function onPointerMove(e: PointerEvent): void {
  if (state.reduced || e.pointerType !== 'mouse') return
  state.pointerX = (e.clientX / state.vw) * 2 - 1
  state.pointerY = (e.clientY / state.vh) * 2 - 1
  state.pointerActive = true
}

function onPointerLeave(): void {
  state.pointerActive = false
}

/** Register a section. Returns an unregister function. */
export function registerTrack(
  el: HTMLElement,
  opts: { scene?: SceneName; tone?: Tone; kind?: RangeKind },
): () => void {
  const track: Track = {
    el,
    scene: opts.scene ?? null,
    tone: opts.tone ?? null,
    kind: opts.kind ?? 'through',
    top: 0,
    height: 0,
  }
  tracks.push(track)
  needsMeasure = true
  return () => {
    tracks = tracks.filter((t) => t !== track)
    needsMeasure = true
  }
}

/** Subscribe to the per-frame state. Returns an unsubscribe function. */
export function onFrame(fn: (s: FluxState) => void): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}

export function getFluxState(): FluxState {
  return state
}

function bindListeners(): () => void {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  state.reduced = motionQuery.matches
  const onMotionChange = () => {
    state.reduced = motionQuery.matches
    needsMeasure = true
  }
  motionQuery.addEventListener('change', onMotionChange)

  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('orientationchange', onResize, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerleave', onPointerLeave, { passive: true })

  // Fonts change metrics, so re-measure once they land.
  if (document.fonts?.ready) void document.fonts.ready.then(onResize)

  const observer = new ResizeObserver(onResize)
  observer.observe(document.body)

  return () => {
    observer.disconnect()
    motionQuery.removeEventListener('change', onMotionChange)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerleave', onPointerLeave)
  }
}

/**
 * Start the loop. Reference counted, so a remount — or a hot reload that
 * replaces the component but keeps this module — always leaves exactly one
 * loop scheduled rather than none.
 */
export function startFlux(): () => void {
  starts += 1
  if (!bound) bound = bindListeners()

  state.vw = window.innerWidth
  state.vh = window.innerHeight
  needsMeasure = true
  if (!started) started = performance.now()

  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)

  return () => {
    starts = Math.max(0, starts - 1)
    if (starts > 0) return
    cancelAnimationFrame(rafId)
    rafId = 0
    bound?.()
    bound = null
  }
}
