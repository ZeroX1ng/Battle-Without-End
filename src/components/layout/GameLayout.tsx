import type { ReactNode } from 'react'
import { useWindowSize } from '../../hooks/useWindowSize'
import { FPSDisplay } from '../../utils/effects'

interface GameLayoutProps {
  children: ReactNode
}

export function GameLayout({ children }: GameLayoutProps) {
  const { width: vw, height: vh } = useWindowSize()
  const scale = Math.min(vw / 800, vh / 600)

  return (
    <div style={{
      width: 800,
      height: 600,
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) scale(${scale})`,
      background: '#16213e',
      border: '1px solid #2a2a4a',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      <FPSDisplay />
      {children}
    </div>
  )
}
