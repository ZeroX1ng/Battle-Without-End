import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { FPSDisplay } from '../../utils/effects'
import '../../styles/layout.css'

export const DESIGN_STAGE_WIDTH = 1280
export const DESIGN_STAGE_HEIGHT = 720

interface GameLayoutProps {
  children: ReactNode
}

function calculateStageScale(): number {
  if (typeof window === 'undefined') return 1

  const viewportWidth = Math.max(1, window.innerWidth)
  const viewportHeight = Math.max(1, window.innerHeight)
  const scale = Math.min(
    viewportWidth / DESIGN_STAGE_WIDTH,
    viewportHeight / DESIGN_STAGE_HEIGHT,
  )

  return Number(Math.max(0.1, scale).toFixed(4))
}

export function GameLayout({ children }: GameLayoutProps) {
  const [stageScale, setStageScale] = useState(() => calculateStageScale())
  const layoutStyle = {
    '--bwe-stage-width': `${DESIGN_STAGE_WIDTH}px`,
    '--bwe-stage-height': `${DESIGN_STAGE_HEIGHT}px`,
    '--bwe-stage-scale': stageScale,
  } as CSSProperties

  useEffect(() => {
    const updateStageScale = () => setStageScale(calculateStageScale())

    updateStageScale()
    window.addEventListener('resize', updateStageScale)
    window.visualViewport?.addEventListener('resize', updateStageScale)

    return () => {
      window.removeEventListener('resize', updateStageScale)
      window.visualViewport?.removeEventListener('resize', updateStageScale)
    }
  }, [])

  return (
    <div className="game-layout" style={layoutStyle}>
      <div className="game-stage-frame" data-bwe-stage-frame>
        <div className="game-shell" data-bwe-stage-shell>
          <FPSDisplay />
          {children}
        </div>
      </div>
    </div>
  )
}
