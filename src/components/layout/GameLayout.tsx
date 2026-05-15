import type { ReactNode } from 'react'
import { FPSDisplay } from '../../utils/effects'

interface GameLayoutProps {
  children: ReactNode
}

export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div style={{
      width: 800,
      height: 600,
      margin: '0 auto',
      marginTop: 'calc(50vh - 300px)',
      background: '#16213e',
      border: '1px solid #2a2a4a',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <FPSDisplay />
      {children}
    </div>
  )
}
