'use client'

import { useEffect, useRef } from 'react'

import { onFrame, type FluxState, type SceneName } from '@/lib/flux'

/**
 * The flux line.
 *
 * One fixed canvas behind the whole page, drawing three strands whose shape is
 * driven by which chapter of the story you are in. It drifts in the hero,
 * settles for the philosophy, splits into three for what we build, morphs
 * through scatter → curve → grid → point across the process, carries a pulse
 * under the surface, and resolves into the signal dot at the end.
 *
 * Parameters are eased toward their target every frame rather than snapped, so
 * chapter changes read as one continuous movement.
 */

interface Params {
  /** Baseline height as a fraction of the viewport. */
  y: number
  /** Wave amplitude as a fraction of the viewport height. */
  amp: number
  /** Cycles across the viewport width. */
  freq: number
  /** Amount of organic chaos, 0 to 1. */
  noise: number
  /** Separation between the three strands, 0 to 1. */
  spread: number
  /** How strongly the curve snaps to a step grid, 0 to 1. */
  grid: number
  /** Collapse toward a single point, 0 to 1. */
  converge: number
  /** Radius of the terminal signal dot, as a fraction of the viewport height. */
  dot: number
  /** A bright segment travelling along the line, 0 to 1. */
  pulse: number
  alpha: number
  /** Pointer responsiveness, 0 to 1. */
  pointer: number
}

type Keyframe = [number, Partial<Params>]

const BASE: Params = {
  y: 0.5,
  amp: 0.08,
  freq: 0.8,
  noise: 0.04,
  spread: 0.4,
  grid: 0,
  converge: 0,
  dot: 0,
  pulse: 0,
  alpha: 0.8,
  pointer: 0,
}

/**
 * Per-chapter shape of the line. Where a chapter lists more than one keyframe,
 * the line morphs across it as you scroll.
 */
const SCENES: Record<SceneName, Keyframe[]> = {
  hero: [
    // Sits behind the headline, where type is large enough to carry it.
    [0, { y: 0.43, amp: 0.115, freq: 1.15, noise: 0.3, spread: 0.5, alpha: 0.95, pointer: 1 }],
    [1, { y: 0.46, amp: 0.08, freq: 0.9, noise: 0.14, spread: 0.32, alpha: 0.75, pointer: 0.6 }],
  ],
  // Sits low, like a horizon, so the statement and the body copy stay clean.
  philosophy: [
    [0, { y: 0.86, amp: 0.045, freq: 0.65, noise: 0.05, spread: 0.16, alpha: 0.45, pointer: 0.3 }],
    [1, { y: 0.88, amp: 0.03, freq: 0.5, noise: 0.03, spread: 0.1, alpha: 0.4, pointer: 0.2 }],
  ],
  build: [
    [0, { y: 0.5, amp: 0.075, freq: 0.75, noise: 0.04, spread: 0.85, alpha: 0.7, pointer: 0.35 }],
    [1, { y: 0.5, amp: 0.08, freq: 0.8, noise: 0.04, spread: 1, alpha: 0.7, pointer: 0.35 }],
  ],
  // The four moves: scatter, curve, grid, point.
  process: [
    [0, { y: 0.5, amp: 0.19, freq: 1.7, noise: 0.6, spread: 0.7, alpha: 0.85, pointer: 0.3 }],
    [0.34, { y: 0.5, amp: 0.13, freq: 0.85, noise: 0.05, spread: 0.34, alpha: 0.85, pointer: 0.3 }],
    [0.68, { y: 0.5, amp: 0.11, freq: 0.8, noise: 0.02, spread: 0.3, grid: 1, alpha: 0.85 }],
    [1, { y: 0.5, amp: 0.04, freq: 0.8, noise: 0, spread: 0.08, grid: 0.5, converge: 1, dot: 0.03, alpha: 1 }],
  ],
  surface: [
    [0, { y: 0.5, amp: 0.03, freq: 0.45, noise: 0.02, spread: 0.5, alpha: 0.45, pulse: 1 }],
    [1, { y: 0.5, amp: 0.03, freq: 0.45, noise: 0.02, spread: 0.6, alpha: 0.45, pulse: 1 }],
  ],
  about: [
    [0, { y: 0.5, amp: 0.028, freq: 0.4, noise: 0.02, spread: 0.2, alpha: 0.3, pointer: 0.2 }],
    [1, { y: 0.5, amp: 0.025, freq: 0.35, noise: 0.02, spread: 0.14, alpha: 0.28, pointer: 0.2 }],
  ],
  // The dot has already landed on the headline, so the line just settles.
  contact: [
    [0, { y: 0.9, amp: 0.03, freq: 0.5, noise: 0.03, spread: 0.14, alpha: 0.32, pointer: 0.3 }],
    [1, { y: 0.92, amp: 0.012, freq: 0.4, noise: 0.01, spread: 0.06, alpha: 0.28, pointer: 0.15 }],
  ],
}

const RED = [245, 20, 31] as const
const CORNSILK = [255, 246, 226] as const
const INK_DARK = [0, 0, 0] as const
const TAU = Math.PI * 2

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function resolve(scene: SceneName, t: number): Params {
  const frames = SCENES[scene]
  let lo = frames[0]!
  let hi = frames[frames.length - 1]!
  for (let i = 0; i < frames.length - 1; i += 1) {
    const a = frames[i]!
    const b = frames[i + 1]!
    if (t >= a[0] && t <= b[0]) {
      lo = a
      hi = b
      break
    }
  }
  const span = hi[0] - lo[0]
  const k = span <= 0 ? 0 : (t - lo[0]) / span
  const out = { ...BASE }
  for (const key of Object.keys(BASE) as (keyof Params)[]) {
    const a = lo[1][key] ?? BASE[key]
    const b = hi[1][key] ?? BASE[key]
    out[key] = lerp(a, b, k)
  }
  return out
}

/** Smooth, deterministic wobble. Continuous in u so the polyline stays whole. */
function wobble(u: number, strand: number, time: number): number {
  return (
    Math.sin(u * 12.99 + strand * 3.7 + time * 0.6) * 0.5 +
    Math.sin(u * 27.71 + strand * 1.3 - time * 0.9) * 0.3 +
    Math.sin(u * 47.3 + strand * 5.1 + time * 1.4) * 0.2
  )
}

export default function FluxField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Eased copies of the target parameters, so chapter changes glide.
    const current: Params = { ...resolve('hero', 0) }
    let toneMix = document.documentElement.dataset.tone === 'light' ? 1 : 0
    let width = 0
    let height = 0
    let dpr = 1
    let pointerX = 0
    let pointerY = 0

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    window.addEventListener('resize', size, { passive: true })

    let lastKey = ''

    const draw = (s: FluxState) => {
      // With motion reduced the line is static, so only redraw when the scroll
      // position, chapter or viewport actually changes.
      if (s.reduced) {
        const key = `${s.scene}|${s.sceneT.toFixed(3)}|${width}x${height}|${document.documentElement.dataset.tone}`
        if (key === lastKey) return
        lastKey = key
      }

      const target = resolve(s.scene, s.sceneT)

      // Reduced motion gets one calm, static line and no easing.
      const ease = s.reduced ? 1 : 0.055
      for (const key of Object.keys(current) as (keyof Params)[]) {
        current[key] = lerp(current[key], target[key], ease)
      }

      const toneTarget = document.documentElement.dataset.tone === 'light' ? 1 : 0
      toneMix = s.reduced ? toneTarget : lerp(toneMix, toneTarget, 0.06)

      const time = s.reduced ? 0 : s.time
      const p = s.reduced ? 0 : current.pointer
      if (s.pointerActive && !s.reduced) {
        pointerX = lerp(pointerX, s.pointerX, 0.07)
        pointerY = lerp(pointerY, s.pointerY, 0.07)
      } else {
        pointerX = lerp(pointerX, 0, 0.05)
        pointerY = lerp(pointerY, 0, 0.05)
      }

      // A narrow screen gives the line far less room, so it holds back rather
      // than competing with the type.
      const narrow = width < 700
      const spread = narrow ? current.spread * 0.55 : current.spread
      const noise = narrow ? current.noise * 0.55 : current.noise
      const alpha = narrow ? current.alpha * 0.8 : current.alpha

      const points = Math.max(48, Math.min(150, Math.round(width / 9)))
      const baseY = height * current.y
      const ampPx = current.amp * height * (narrow ? 0.8 : 1)
      const step = height * 0.055
      const cx = width * 0.5
      const cy = baseY
      const pointerPx = ((pointerX + 1) / 2) * width
      const reach = width * 0.22

      const ink: [number, number, number] = [
        lerp(CORNSILK[0], INK_DARK[0], toneMix) | 0,
        lerp(CORNSILK[1], INK_DARK[1], toneMix) | 0,
        lerp(CORNSILK[2], INK_DARK[2], toneMix) | 0,
      ]

      ctx.clearRect(0, 0, width, height)

      for (let strand = 0; strand < 3; strand += 1) {
        const offset = (strand - 1) * spread * ampPx * 0.9
        const phase = strand * 0.9
        const isCore = strand === 1

        ctx.beginPath()
        for (let i = 0; i <= points; i += 1) {
          const u = i / points
          let x = u * width
          let y = baseY + offset
          y += Math.sin(u * TAU * current.freq + phase + time * 0.32) * ampPx
          y += Math.sin(u * TAU * current.freq * 2.3 + phase * 1.7 - time * 0.21) * ampPx * 0.28
          if (noise > 0.001) {
            y += wobble(u, strand, time) * noise * ampPx * 1.5
          }
          if (current.grid > 0.001) {
            y = lerp(y, Math.round(y / step) * step, current.grid)
          }
          if (p > 0.001) {
            const d = Math.abs(x - pointerPx) / reach
            if (d < 1) {
              const f = (1 - d * d) ** 2
              y += pointerY * height * 0.07 * f * p
            }
          }
          if (current.converge > 0.001) {
            x = lerp(x, cx, current.converge)
            y = lerp(y, cy, current.converge)
          }
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        // Every chapter sets its type on the left, so the line keeps its
        // energy on the open right side and thins out under the copy.
        const base = isCore ? alpha : alpha * 0.13
        const rgb = isCore ? RED : ink
        const ramp = ctx.createLinearGradient(0, 0, width, 0)
        ramp.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${base * 0.16})`)
        ramp.addColorStop(0.3, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${base * 0.42})`)
        ramp.addColorStop(0.58, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${base})`)
        ramp.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${base})`)
        ctx.strokeStyle = ramp
        ctx.lineWidth = isCore ? 1.5 : 1
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // A request travelling along the core strand, under the surface.
      if (current.pulse > 0.01 && !s.reduced) {
        const u = (time * 0.16) % 1
        const x = u * width
        const y =
          baseY +
          Math.sin(u * TAU * current.freq + 0.9 + time * 0.32) * ampPx +
          Math.sin(u * TAU * current.freq * 2.3 + 1.53 - time * 0.21) * ampPx * 0.28
        const fade = Math.sin(u * Math.PI)
        ctx.beginPath()
        ctx.arc(x, y, 3.5, 0, TAU)
        ctx.fillStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${current.pulse * fade})`
        ctx.fill()
      }

      // The signal dot: where the line finally resolves.
      if (current.dot > 0.0005) {
        const r = current.dot * height
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, TAU)
        ctx.fillStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${Math.min(1, current.alpha + 0.2)})`
        ctx.fill()
      }
    }

    const off = onFrame(draw)
    return () => {
      off()
      window.removeEventListener('resize', size)
    }
  }, [])

  return <canvas ref={canvasRef} className="flux-field" aria-hidden="true" />
}
