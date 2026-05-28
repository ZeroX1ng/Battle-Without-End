import { useRef, useState, useCallback, useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createVisualFrameScheduler } from '../../utils/visualFrame'

interface ScrollPanelProps {
  height?: number
  enableBlur?: boolean
  children: ReactNode
  style?: CSSProperties
}

export function ScrollPanel({ height = 400, enableBlur = true, children, style }: ScrollPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const scrollYRef = useRef(0)
  const velocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragAnchorYRef = useRef(0)
  const dragAnchorScrollRef = useRef(0)

  const [scrollY, setScrollY] = useState(0)
  const [contentH, setContentH] = useState(0)
  const [scrollbarPercent, setScrollbarPercent] = useState(0)
  const [isScrollbarDrag, setIsScrollbarDrag] = useState(false)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  const maxScroll = Math.max(0, contentH - height)
  const canScroll = contentH > height

  const clamp = useCallback((y: number) => {
    return Math.max(-maxScroll, Math.min(0, y))
  }, [maxScroll])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setContentH(el.scrollHeight)
    })
    ro.observe(el)
    setContentH(el.scrollHeight)
    return () => ro.disconnect()
  }, [children])

  useEffect(() => {
    let active = true
    const scheduler = createVisualFrameScheduler()
    const tick = () => {
      if (!active) return

      if (!isDraggingRef.current) {
        const v = velocityRef.current
        if (Math.abs(v) > 0.5) {
          velocityRef.current = v * 0.9
          scrollYRef.current = clamp(scrollYRef.current + velocityRef.current)
        } else {
          velocityRef.current = 0
        }

        let y = scrollYRef.current
        if (y > 0) {
          y *= 0.9
          if (Math.abs(y) < 1) y = 0
          scrollYRef.current = y
        }
        if (!canScroll && y < 0) {
          y *= 0.9
          if (Math.abs(y) < 1) y = 0
          scrollYRef.current = y
        }
        if (canScroll && y < -maxScroll) {
          const target = -maxScroll
          y += (target - y) * 0.1
          scrollYRef.current = y
        }

        const sbPercent = maxScroll > 0 ? -scrollYRef.current / maxScroll : 0
        setScrollbarPercent(sbPercent)
      }

      setScrollY(Math.round(scrollYRef.current * 10) / 10)

      if (enableBlur && canScroll) {
        setShowTopFade(scrollYRef.current < -0.5)
        setShowBottomFade(scrollYRef.current > -(maxScroll - 0.5))
      }

      scheduler.request(tick)
    }
    scheduler.request(tick)
    return () => { active = false; scheduler.cancel() }
  }, [maxScroll, canScroll, clamp, enableBlur])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const flashDelta = -e.deltaY / (e.deltaMode === 1 ? 3 : 120)
    const delta = flashDelta * 5
    velocityRef.current = delta
    scrollYRef.current = clamp(scrollYRef.current + delta)
  }, [clamp])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    dragAnchorYRef.current = e.clientY
    dragAnchorScrollRef.current = scrollYRef.current
    velocityRef.current = 0
  }, [])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dy = e.clientY - dragAnchorYRef.current
      velocityRef.current = dy
      scrollYRef.current = clamp(dragAnchorScrollRef.current + dy)
      return
    }

    if (!canScroll || isScrollbarDrag) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const rx = e.clientX - rect.left
    const ry = e.clientY - rect.top

    if (rx >= 0 && rx < 200) {
      if (ry > height - 30 && ry < height && scrollYRef.current > -maxScroll) {
        velocityRef.current = (height - ry - 30) / 5
        scrollYRef.current = clamp(scrollYRef.current + velocityRef.current)
      }
      if (ry < 30 && ry > 0 && scrollYRef.current < 0) {
        velocityRef.current = -(30 - ry) / 5
        scrollYRef.current = clamp(scrollYRef.current + velocityRef.current)
      }
    }
  }, [canScroll, isScrollbarDrag, height, maxScroll, clamp])

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const sbHeight = canScroll ? Math.max(50, height * height / contentH) : 0
  const sbTop = canScroll ? scrollbarPercent * (height - sbHeight) : 0

  const handleScrollbarDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsScrollbarDrag(true)

    const moveThumbToPointer = (clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const localY = clientY - rect.top
      const nextTop = localY - sbHeight / 2
      const pct = Math.max(0, Math.min(1, nextTop / (height - sbHeight)))
      scrollYRef.current = -pct * maxScroll
    }
    moveThumbToPointer(e.clientY)

    const onMove = (ev: MouseEvent) => moveThumbToPointer(ev.clientY)
    const onUp = () => {
      setIsScrollbarDrag(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [maxScroll, height, sbHeight])

  return (
    <div
      ref={containerRef}
      style={{
        height,
        overflow: 'hidden',
        position: 'relative',
        cursor: isDraggingRef.current ? 'grabbing' : canScroll ? 'grab' : 'default',
        ...style,
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={contentRef}
        style={{
          transform: `translateY(${scrollY}px)`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {enableBlur && showTopFade && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: Math.min(60, height * 0.3),
          background: `linear-gradient(to bottom, var(--color-bg-dark), transparent)`,
          pointerEvents: 'none', zIndex: 2,
        }} />
      )}

      {enableBlur && showBottomFade && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: Math.min(60, height * 0.3),
          background: `linear-gradient(to top, var(--color-bg-dark), transparent)`,
          pointerEvents: 'none', zIndex: 2,
        }} />
      )}

      {canScroll && (
        <div style={{
          position: 'absolute', right: -10, top: 0, bottom: 0,
          width: 20, zIndex: 3,
        }}>
          <div
            onMouseDown={handleScrollbarDown}
            style={{
              position: 'absolute',
              right: 10,
              top: sbTop,
              width: 3,
              height: sbHeight,
              borderRadius: 2,
              background: isScrollbarDrag ? 'var(--color-text-dim)' : 'var(--color-border)',
              cursor: 'pointer',
              transition: isScrollbarDrag ? 'none' : 'background 0.2s',
            }}
          />
        </div>
      )}
    </div>
  )
}
