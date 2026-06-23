import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { FPSDisplay } from '../../utils/effects'
import '../../styles/layout.css'

export const DESIGN_STAGE_WIDTH = 1280
export const DESIGN_STAGE_HEIGHT = 720

interface GameLayoutProps {
  children: ReactNode
  themeMode?: 'dark' | 'light'
}

type StageMetrics = {
  scale: number
  width: number
  height: number
}

function calculateStageMetrics(): StageMetrics {
  if (typeof window === 'undefined') {
    return {
      scale: 1,
      width: DESIGN_STAGE_WIDTH,
      height: DESIGN_STAGE_HEIGHT,
    }
  }

  const viewportWidth = Math.max(1, window.innerWidth)
  const viewportHeight = Math.max(1, window.innerHeight)
  const scale = Math.min(
    viewportWidth / DESIGN_STAGE_WIDTH,
    viewportHeight / DESIGN_STAGE_HEIGHT,
  )
  const stageScale = Number(Math.max(0.1, scale).toFixed(4))

  return {
    scale: stageScale,
    width: Number(Math.max(DESIGN_STAGE_WIDTH, viewportWidth / stageScale).toFixed(2)),
    height: Number(Math.max(DESIGN_STAGE_HEIGHT, viewportHeight / stageScale).toFixed(2)),
  }
}

export function GameLayout({ children, themeMode = 'dark' }: GameLayoutProps) {
  const [stageMetrics, setStageMetrics] = useState(() => calculateStageMetrics())
  const layoutStyle = {
    '--bwe-stage-width': `${stageMetrics.width}px`,
    '--bwe-stage-height': `${stageMetrics.height}px`,
    '--bwe-stage-scale': stageMetrics.scale,
  } as CSSProperties

  useEffect(() => {
    const updateStageScale = () => setStageMetrics(calculateStageMetrics())

    updateStageScale()
    window.addEventListener('resize', updateStageScale)
    window.visualViewport?.addEventListener('resize', updateStageScale)

    return () => {
      window.removeEventListener('resize', updateStageScale)
      window.visualViewport?.removeEventListener('resize', updateStageScale)
    }
  }, [])

  return (
    <div className="game-layout" data-bwe-theme={themeMode} style={layoutStyle}>
      <div className="game-stage-frame" data-bwe-stage-frame>
        <div className="game-shell" data-bwe-stage-shell>
          <FPSDisplay />
          {children}
        </div>
      </div>
    </div>
  )
}
