import { useState, useEffect } from 'react'
import { createVisualFrameScheduler } from '../utils/visualFrame'

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const scheduler = createVisualFrameScheduler()

    const handleResize = () => {
      scheduler.cancel()
      scheduler.request(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      })
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      scheduler.cancel()
    }
  }, [])

  return size
}
