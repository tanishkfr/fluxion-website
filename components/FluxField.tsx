'use client'

import { useEffect, useRef } from 'react'

import { onFrame, type FluxState, type SceneName } from '@/lib/flux'

/**
 * The flux line.
 *
 * One fixed canvas behind the whole page, drawing three strands whose shape is
 * driven by which chapter of the story you are in. It drifts in the hero,
 * settles into a horizon for the philosophy, splits into three and carries a
 * request along itself as the page travels down through the layers, morphs
 * through scatter → curve → grid → point across the process, and resolves into
 * the signal dot at the end.
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
    [0, { y: 0.93, amp: 0.03, freq: 0.6, noise: 0.04, spread: 0.14, alpha: 0.3, pointer: 0.3 }],
    [1, { y: 0.95, amp: 0.02, freq: 0.5, noise: 0.02, spread: 0.09, alpha: 0.26, pointer: 0.2 }],
  ],
  // Travelling inward: the three strands open out as the surface layer passes,
  // then draw back together as the page arrives at the systems underneath. A
  // request runs along the core strand the whole way down. It all happens below
  // the planes — three of them cross the middle of the frame, and a line
  // through the middle of a paragraph is a strikethrough, not a background.
  depth: [
    [0, { y: 0.84, amp: 0.05, freq: 0.7, noise: 0.03, spread: 0.5, alpha: 0.34, pulse: 0.8, pointer: 0.3 }],
    [0.5, { y: 0.86, amp: 0.06, freq: 0.75, noise: 0.03, spread: 1, alpha: 0.42, pulse: 1, pointer: 0.25 }],
    [1, { y: 0.84, amp: 0.04, freq: 0.6, noise: 0.02, spread: 0.34, alpha: 0.36, pulse: 1, pointer: 0.2 }],
  ],
  // The four moves: scatter, curve, grid, point.
  process: [
    [0, { y: 0.5, amp: 0.125, freq: 1.55, noise: 0.5, spread: 0.55, alpha: 0.5, pointer: 0.3 }],
    [0.34, { y: 0.5, amp: 0.1, freq: 0.85, noise: 0.05, spread: 0.3, alpha: 0.58, pointer: 0.3 }],
    [0.68, { y: 0.5, amp: 0.09, freq: 0.8, noise: 0.02, spread: 0.26, grid: 1, alpha: 0.62 }],
    // Settles below the type as it collapses, so the dot lands in open space
    // under the last move rather than in the middle of the word.
    [1, { y: 0.79, amp: 0.035, freq: 0.8, noise: 0, spread: 0.07, grid: 0.5, converge: 1, dot: 0.028, alpha: 1 }],
  ],
  about: [
    [0, { y: 0.5, amp: 0.028, freq: 0.4, noise: 0.02, spread: 0.2, alpha: 0.3, pointer: 0.2 }],
    [1, { y: 0.5, amp: 0.025, freq: 0.35, noise: 0.02, spread: 0.14, alpha: 0.28, pointer: 0.2 }],
  ],
  // The closing beat. The dot has already landed on the headline, so instead of
  // resolving again the three strands draw together into one taut line and a
  // request runs out along it — the page's last motion is something leaving,
  // which is what the form beneath it is for.
  //
  // This chapter is the last one, so its progress never reaches 1: the scroll
  // runs out around 0.6. The beat has to be complete by the midpoint or nobody
  // ever sees it.
  contact: [
    [0, { y: 0.9, amp: 0.03, freq: 0.5, noise: 0.03, spread: 0.14, alpha: 0.32, pointer: 0.3 }],
    [0.5, { y: 0.91, amp: 0.018, freq: 0.45, noise: 0.015, spread: 0.05, alpha: 0.4, pulse: 1, pointer: 0.2 }],
    [1, { y: 0.92, amp: 0.012, freq: 0.4, noise: 0.01, spread: 0.03, alpha: 0.42, pulse: 1, pointer: 0.15 }],
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

    /*
      The line is a string, not a drawing of one.

      Each point carries a displacement from the curve the parameters describe,
      and a velocity. Three forces act on it every frame: a spring pulling it
      back to rest, damping so it settles instead of ringing forever, and
      tension coupling it to its neighbours — which is what makes a deflection
      travel along the line rather than denting it in one place.

      The pointer adds a fourth. Near the cursor the line is drawn toward it,
      capped so it bends rather than sticks. Move across it and it plucks:
      deflects, overshoots, comes back.
    */
    let disp = new Float32Array(0)
    let vel = new Float32Array(0)
    let lastTime = 0
    // Steady-state deflection is target * PULL / (SPRING + PULL), so the spring
    // has to be soft relative to the pull or the line barely acknowledges the
    // cursor. At 18 and 42 it commits to about seventy percent of the reach.
    // DAMP is deliberately under critical (2 * sqrt(SPRING + PULL) ≈ 15) so a
    // fast pluck overshoots once and rings back instead of gliding home.
    const SPRING = 18
    const DAMP = 9
    const TENSION = 60
    const PULL = 42
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
      if (s.pointerActive && !s.reduced) {
        pointerX = lerp(pointerX, s.pointerX, 0.16)
        pointerY = lerp(pointerY, s.pointerY, 0.16)
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

      // How hard the page is being scrolled feeds straight into the line:
      // flick through a chapter and it agitates, stop and it settles. The
      // studio is named after flow rate.
      const agitate = s.reduced ? 0 : s.scrollVel
      const waveAmp = ampPx * (1 + agitate * 0.28)
      const noiseAmt = noise * (1 + agitate * 1.4)

      if (!s.reduced) {
        if (disp.length !== points + 1) {
          disp = new Float32Array(points + 1)
          vel = new Float32Array(points + 1)
        }
        const dt = Math.min(0.022, Math.max(0.001, s.time - lastTime))
        lastTime = s.time
        const pull = current.pointer
        const pointerPy = ((pointerY + 1) / 2) * height
        // Bend, do not stick: the cursor can pull the line a tenth of the
        // viewport out of true and no further.
        const cap = height * 0.12
        const reachY = height * 0.22
        const raw = pointerPy - baseY
        const target = raw < -cap ? -cap : raw > cap ? cap : raw
        const live = s.pointerActive && pull > 0.001

        for (let i = 0; i <= points; i += 1) {
          const left = i > 0 ? disp[i - 1]! : disp[i]!
          const right = i < points ? disp[i + 1]! : disp[i]!
          const d0 = disp[i]!
          let force = -SPRING * d0 - DAMP * vel[i]! + TENSION * (left + right - 2 * d0)

          if (live) {
            // Radial, not just horizontal. With a falloff in x alone the line
            // reaches for a cursor sitting up in the masthead, and tension then
            // carries that kink along the whole string — the far end of the
            // line bending because the pointer is parked in a corner.
            const dx = ((i / points) * width - pointerPx) / reach
            const dy = (baseY + d0 - pointerPy) / reachY
            const r2 = dx * dx + dy * dy
            if (r2 < 1) {
              const f = (1 - r2) ** 2
              force += (target * f - d0) * PULL * pull
            }
          }

          vel[i]! += force * dt
          disp[i]! += vel[i]! * dt
        }
      }

      ctx.clearRect(0, 0, width, height)

      for (let strand = 0; strand < 3; strand += 1) {
        const offset = (strand - 1) * spread * waveAmp * 0.9
        const phase = strand * 0.9
        const isCore = strand === 1

        ctx.beginPath()
        for (let i = 0; i <= points; i += 1) {
          const u = i / points
          let x = u * width
          let y = baseY + offset
          y += Math.sin(u * TAU * current.freq + phase + time * 0.32) * waveAmp
          y += Math.sin(u * TAU * current.freq * 2.3 + phase * 1.7 - time * 0.21) * waveAmp * 0.28
          if (noiseAmt > 0.001) {
            y += wobble(u, strand, time) * noiseAmt * waveAmp * 1.5
          }
          // The outer strands take the deflection at a little under full, so
          // the bundle bends together without moving as one rigid shape.
          y += disp[i]! * (isCore ? 1 : 0.62)
          if (current.grid > 0.001) {
            y = lerp(y, Math.round(y / step) * step, current.grid)
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
        ctx.arc(x, y, 3.5 + current.pulse * 1.6, 0, TAU)
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
