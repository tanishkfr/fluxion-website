'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

import { registerTrack, type RangeKind, type SceneName, type Tone } from '@/lib/flux'

/**
 * Registers its element with the scroll engine, which writes `--p` (0 to 1)
 * onto it every frame. Children read that variable in CSS. The children
 * themselves stay server-rendered.
 */

interface TrackProps {
  as?: 'section' | 'div'
  id?: string
  className?: string
  style?: CSSProperties
  scene?: SceneName
  tone?: Tone
  kind?: RangeKind
  labelledBy?: string
  children: ReactNode
}

export default function Track({
  as = 'section',
  id,
  className,
  style,
  scene,
  tone,
  kind,
  labelledBy,
  children,
}: TrackProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerTrack(el, { scene, tone, kind })
  }, [scene, tone, kind])

  const Tag = as

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      id={id}
      className={className}
      style={style}
      aria-labelledby={labelledBy}
    >
      {children}
    </Tag>
  )
}
