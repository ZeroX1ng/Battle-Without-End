import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_VISUAL_FRAME_MS, createVisualFrameScheduler } from './visualFrame'

export const DEFAULT_FADE_FRAME_COUNT = 10
export const DEFAULT_GRADIENT_FRAME_COUNT = 30
export const HIDE_MESSAGE_FADE_FRAME_COUNT = 30
export const HIDE_MESSAGE_FADE_THRESHOLD = 50
export const HIDE_MESSAGE_FINALIZE_THRESHOLD = 20
export const HIDE_MESSAGE_BLUR = 4

const FRAME_MS = DEFAULT_VISUAL_FRAME_MS

type FadeOptions = {
  frameCount?: number
  onComplete?: () => void
  restoreInteractivity?: boolean
}

export function framesToMs(frameCount: number): number {
  return Math.round(frameCount * FRAME_MS)
}

function setInteractivity(el: HTMLElement, enabled: boolean) {
  el.style.pointerEvents = enabled ? '' : 'none'
}

export function restoreInteractivity(el: HTMLElement) {
  setInteractivity(el, true)
}

export function requestFrameFade(
  el: HTMLElement,
  from: number,
  to: number,
  { frameCount = DEFAULT_FADE_FRAME_COUNT, onComplete, restoreInteractivity: shouldRestore = false }: FadeOptions = {},
) {
  let frame = 0
  const scheduler = createVisualFrameScheduler()
  const totalFrames = Math.max(1, frameCount)

  el.style.opacity = String(from)

  const step = () => {
    frame += 1
    const progress = Math.min(frame / totalFrames, 1)
    el.style.opacity = String(from + (to - from) * progress)

    if (progress < 1) {
      scheduler.request(step)
      return
    }

    if (shouldRestore) {
      restoreInteractivity(el)
    }
    onComplete?.()
  }

  scheduler.request(step)

  return () => scheduler.cancel()
}

export function useFadeIn(frameCount: number = DEFAULT_FADE_FRAME_COUNT) {
  const ref = useRef<HTMLElement | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelRef.current?.(), [])

  const trigger = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelRef.current?.()
    cancelRef.current = requestFrameFade(el, 0, 1, { frameCount })
  }, [frameCount])

  return { ref, trigger }
}

export function useFadeOut(
  frameCount: number = DEFAULT_FADE_FRAME_COUNT,
  onComplete?: () => void,
) {
  const ref = useRef<HTMLElement | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelRef.current?.(), [])

  const trigger = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelRef.current?.()
    setInteractivity(el, false)
    cancelRef.current = requestFrameFade(el, 1, 0, {
      frameCount,
      onComplete,
      restoreInteractivity: true,
    })
  }, [frameCount, onComplete])

  return { ref, trigger }
}

export function GradientIn({
  active,
  count = DEFAULT_GRADIENT_FRAME_COUNT,
  onComplete,
}: {
  active: boolean
  count?: number
  onComplete?: () => void
}) {
  const [phase, setPhase] = useState<'idle' | 'animating' | 'done'>('idle')

  useEffect(() => {
    if (!active) {
      setPhase('idle')
      return
    }

    setPhase('animating')
    const timer = window.setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, framesToMs(count))

    return () => window.clearTimeout(timer)
  }, [active, count, onComplete])

  if (phase === 'idle' || phase === 'done') return null

  return (
    <div
      className="effect-gradient-in"
      style={{
        '--gradient-count': count,
        animationDuration: `${framesToMs(count)}ms`,
      } as React.CSSProperties}
    />
  )
}

export function GradientInOutsideFirst({
  active,
  count,
  size,
  px,
  py,
  onComplete,
}: {
  active: boolean
  count: number
  size: number
  px: number
  py: number
  onComplete?: () => void
}) {
  const [phase, setPhase] = useState<'idle' | 'animating' | 'done'>('idle')

  useEffect(() => {
    if (!active) {
      setPhase('idle')
      return
    }

    setPhase('animating')
    const timer = window.setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, framesToMs(count))

    return () => window.clearTimeout(timer)
  }, [active, count, onComplete])

  if (phase === 'idle' || phase === 'done') return null

  return (
    <div
      className="effect-gradient-outside effect-gradient-outside-active"
      style={{
        '--gradient-count': count,
        '--gradient-size': `${size}px`,
        '--gradient-ox': `${px}px`,
        '--gradient-oy': `${py}px`,
        animationDuration: `${framesToMs(count)}ms`,
      } as React.CSSProperties}
    />
  )
}

export interface HideMessageParticleState {
  x: number
  y: number
  vx: number
  vy: number
  ax: number
  ay: number
  color: string
}

function colorToRgba(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a / 255})`
}

function pixelToUint32(r: number, g: number, b: number, a: number) {
  return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0
}

function parseIgnoreColor(ignoreColor: string | number) {
  if (typeof ignoreColor === 'number') return ignoreColor >>> 0
  const match = /^#?([a-f\d]{6}|[a-f\d]{8})$/i.exec(ignoreColor)
  if (!match) return 0
  const value = match[1]
  if (value.length === 8) {
    return parseInt(value, 16) >>> 0
  }
  return (0xff000000 | parseInt(value, 16)) >>> 0
}

export function createHideMessageParticle(
  x: number,
  y: number,
  color: string,
): HideMessageParticleState {
  const speed = Math.random() * 5
  const angle = Math.random() * Math.PI * 2

  return {
    x,
    y,
    ax: Math.cos(angle) * speed,
    ay: Math.sin(angle) * speed,
    vx: 0,
    vy: 0,
    color,
  }
}

export function sampleParticlesFromImageData(
  imgData: ImageData,
  ox: number,
  oy: number,
  gap: number,
  ignoreColor: string | number,
) {
  const particles: HideMessageParticleState[] = []
  const ignore = parseIgnoreColor(ignoreColor)
  const data = imgData.data

  for (let px = 0; px < imgData.width; px += gap) {
    for (let py = 0; py < imgData.height; py += gap) {
      const i = (py * imgData.width + px) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      const pixel = pixelToUint32(r, g, b, a)

      if (pixel === 0 || pixel === ignore) continue
      particles.push(createHideMessageParticle(ox + px, oy + py, colorToRgba(r, g, b, a)))
    }
  }

  return particles
}

export function stepHideMessageParticles(
  particles: HideMessageParticleState[],
  ctx: CanvasRenderingContext2D,
  bounds: { width: number; height: number },
) {
  let alive = 0

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i]
    particle.vx += particle.ax
    particle.vy += particle.ay
    particle.x += particle.vx
    particle.y += particle.vy

    if (
      particle.x < 0 ||
      particle.x > bounds.width ||
      particle.y < 0 ||
      particle.y > bounds.height
    ) {
      particles.splice(i, 1)
      continue
    }

    alive += 1
    ctx.fillStyle = particle.color
    ctx.fillRect(particle.x, particle.y, 1, 1)
  }

  return alive
}

function createSolidImageData(width: number, height: number, color = [255, 255, 255, 255]) {
  const fallbackCanvas = document.createElement('canvas')
  fallbackCanvas.width = Math.max(1, Math.ceil(width))
  fallbackCanvas.height = Math.max(1, Math.ceil(height))
  const ctx = fallbackCanvas.getContext('2d')
  if (!ctx) return null
  const [r, g, b, a] = color
  ctx.fillStyle = colorToRgba(r, g, b, a)
  ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height)
  return ctx.getImageData(0, 0, fallbackCanvas.width, fallbackCanvas.height)
}

export function ExplodeOut({
  active,
  targetRect,
  imageData,
  gap = 3,
  ignoreColor = 0,
  onComplete,
}: {
  active: boolean
  targetRect: { x: number; y: number; width: number; height: number } | null
  imageData?: ImageData | null
  gap?: number
  ignoreColor?: string | number
  onComplete?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fadeCancelRef = useRef<(() => void) | null>(null)
  const particlesRef = useRef<HideMessageParticleState[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active || !targetRect) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.width = `${canvas.width}px`
    canvas.style.height = `${canvas.height}px`
    canvas.style.opacity = '1'

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const source = imageData ?? createSolidImageData(targetRect.width, targetRect.height)
    if (!source) return

    particlesRef.current = sampleParticlesFromImageData(
      source,
      targetRect.x,
      targetRect.y,
      Math.max(1, gap),
      ignoreColor,
    )
    setVisible(true)

    let out = false
    const scheduler = createVisualFrameScheduler()

    const animate = () => {
      ctx.save()
      ctx.filter = `blur(${HIDE_MESSAGE_BLUR}px)`
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()

      const alive = stepHideMessageParticles(particlesRef.current, ctx, {
        width: canvas.width,
        height: canvas.height,
      })

      if (alive > HIDE_MESSAGE_FINALIZE_THRESHOLD) {
        if (alive < HIDE_MESSAGE_FADE_THRESHOLD && !out) {
          out = true
          fadeCancelRef.current = requestFrameFade(canvas, 1, 0, {
            frameCount: HIDE_MESSAGE_FADE_FRAME_COUNT,
            onComplete,
          })
        }
        scheduler.request(animate)
        return
      }

      scheduler.cancel()
      setVisible(false)
      if (!out) {
        onComplete?.()
      }
    }

    scheduler.request(animate)

    return () => {
      scheduler.cancel()
      fadeCancelRef.current?.()
      particlesRef.current = []
    }
  }, [active, targetRect, imageData, gap, ignoreColor, onComplete])

  if (!active && !visible) return null

  return <canvas ref={canvasRef} className="effect-explode-canvas" />
}

export function TextDisperse({
  active,
  text,
  x,
  y,
  fontSize = 24,
  fontFamily = 'sans-serif',
  color = '#ffffff',
  gap = 2,
  onComplete,
}: {
  active: boolean
  text: string
  x: number
  y: number
  fontSize?: number
  fontFamily?: string
  color?: string
  gap?: number
  onComplete?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fadeCancelRef = useRef<(() => void) | null>(null)
  const particlesRef = useRef<HideMessageParticleState[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active || !text) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.width = `${canvas.width}px`
    canvas.style.height = `${canvas.height}px`
    canvas.style.opacity = '1'

    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    offCtx.font = `${fontSize}px ${fontFamily}`
    const metrics = offCtx.measureText(text)
    const textWidth = Math.max(1, Math.ceil(metrics.width))
    const textHeight = Math.max(1, Math.ceil(fontSize * 1.4))
    offscreen.width = textWidth
    offscreen.height = textHeight

    offCtx.font = `${fontSize}px ${fontFamily}`
    offCtx.fillStyle = color
    offCtx.textBaseline = 'top'
    offCtx.fillText(text, 0, 0)

    const imgData = offCtx.getImageData(0, 0, textWidth, textHeight)
    particlesRef.current = sampleParticlesFromImageData(imgData, x, y, Math.max(1, gap), 0)
    setVisible(true)

    const ctx2 = canvas.getContext('2d')
    if (!ctx2) return

    let out = false
    const scheduler = createVisualFrameScheduler()

    const animate = () => {
      ctx2.save()
      ctx2.filter = `blur(${HIDE_MESSAGE_BLUR}px)`
      ctx2.drawImage(canvas, 0, 0)
      ctx2.restore()

      const alive = stepHideMessageParticles(particlesRef.current, ctx2, {
        width: canvas.width,
        height: canvas.height,
      })

      if (alive > HIDE_MESSAGE_FINALIZE_THRESHOLD) {
        if (alive < HIDE_MESSAGE_FADE_THRESHOLD && !out) {
          out = true
          fadeCancelRef.current = requestFrameFade(canvas, 1, 0, {
            frameCount: HIDE_MESSAGE_FADE_FRAME_COUNT,
            onComplete,
          })
        }
        scheduler.request(animate)
        return
      }

      scheduler.cancel()
      setVisible(false)
      if (!out) {
        onComplete?.()
      }
    }

    scheduler.request(animate)

    return () => {
      scheduler.cancel()
      fadeCancelRef.current?.()
      particlesRef.current = []
    }
  }, [active, text, x, y, fontSize, fontFamily, color, gap, onComplete])

  if (!active && !visible) return null

  return (
    <canvas
      ref={canvasRef}
      className="effect-text-disperse"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    />
  )
}

export function useFPSShow() {
  const [fps, setFps] = useState(0)
  const countRef = useRef(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFps(countRef.current)
      countRef.current = 0
    }, 1000)

    const scheduler = createVisualFrameScheduler()
    const onFrame = () => {
      countRef.current += 1
      scheduler.request(onFrame)
    }
    scheduler.request(onFrame)

    return () => {
      window.clearInterval(interval)
      scheduler.cancel()
    }
  }, [])

  return fps
}

export function FPSDisplay() {
  const fps = useFPSShow()

  return <div className="fps-display">FPS:{fps}</div>
}

export function cssFadeIn(el: HTMLElement, frameCount: number = DEFAULT_FADE_FRAME_COUNT): void {
  requestFrameFade(el, 0, 1, { frameCount })
}

export function cssFadeOut(
  el: HTMLElement,
  frameCount: number = DEFAULT_FADE_FRAME_COUNT,
  onComplete?: () => void,
): void {
  setInteractivity(el, false)
  requestFrameFade(el, 1, 0, {
    frameCount,
    onComplete,
    restoreInteractivity: true,
  })
}
