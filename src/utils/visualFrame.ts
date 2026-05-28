import { useEffect, useRef } from 'react'

export const DEFAULT_VISUAL_FPS = 30
export const DEFAULT_VISUAL_FRAME_MS = 1000 / DEFAULT_VISUAL_FPS

type VisualFrameCallback = (time: number) => void

export function createVisualFrameScheduler(fps: number = DEFAULT_VISUAL_FPS) {
  const frameMs = 1000 / Math.max(1, fps)
  let rafId = 0
  let lastTime = 0

  const request = (callback: VisualFrameCallback) => {
    const tick = (time: number) => {
      if (lastTime === 0) {
        lastTime = time
      }

      const elapsed = time - lastTime
      if (elapsed < frameMs) {
        rafId = requestAnimationFrame(tick)
        return
      }

      lastTime = time - (elapsed % frameMs)
      callback(time)
    }

    rafId = requestAnimationFrame(tick)
    return rafId
  }

  const cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  return { request, cancel, frameMs }
}

export function useVisualFrameScheduler(fps: number = DEFAULT_VISUAL_FPS) {
  const schedulerRef = useRef(createVisualFrameScheduler(fps))

  useEffect(() => {
    schedulerRef.current.cancel()
    schedulerRef.current = createVisualFrameScheduler(fps)
    return () => schedulerRef.current.cancel()
  }, [fps])

  return schedulerRef.current
}
