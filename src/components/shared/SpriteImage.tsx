import { useState, useEffect, useRef } from 'react'
import { spriteRegistry } from '../../core/utils/spriteRegistry'

interface SpriteImageProps {
  name: string
  fps?: number
  autoPlay?: boolean
  loop?: boolean
  onComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

export function SpriteImage({
  name,
  fps = 12,
  autoPlay = true,
  loop = true,
  onComplete,
  className,
  style,
}: SpriteImageProps) {
  const entry = spriteRegistry[name]
  const dir = entry?.dir
  const frames = entry?.frames ?? 1

  const [currentFrame, setCurrentFrame] = useState(1)
  const intervalRef = useRef<number>(0)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!dir || frames <= 1 || !autoPlay) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = 0
      }
      return
    }

    setCurrentFrame(1)
    completedRef.current = false

    const intervalMs = 1000 / fps
    intervalRef.current = window.setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1
        if (next > frames) {
          if (loop) {
            return 1
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = 0
          }
          if (!completedRef.current) {
            completedRef.current = true
            onCompleteRef.current?.()
          }
          return frames
        }
        return next
      })
    }, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = 0
      }
    }
  }, [name, dir, frames, fps, autoPlay, loop])

  if (!entry) {
    return null
  }

  const frameIndex = frames > 1 ? currentFrame : 1

  return (
    <img
      src={`/sprites/${dir}/${frameIndex}.png`}
      className={className}
      style={style}
      alt={name}
    />
  )
}
