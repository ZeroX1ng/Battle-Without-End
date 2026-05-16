import type { ReactNode } from 'react'
import { FPSDisplay } from '../../utils/effects'
import '../../styles/layout.css'

interface GameLayoutProps {
  children: ReactNode
}

export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="game-layout">
      <div className="game-shell">
        <FPSDisplay />
        {children}
      </div>
    </div>
  )
}
