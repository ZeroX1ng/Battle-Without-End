import type React from 'react'
import { GameProvider, useGameContext } from './state/GameContext'
import { GameLayout } from './components/layout/GameLayout'
import { BeginScene } from './components/scenes/BeginScene'
import { RaceScene } from './components/scenes/RaceScene'
import { MainScene } from './components/scenes/MainScene'
import { SaveScene } from './components/scenes/SaveScene'
import { ConfirmScene } from './components/scenes/ConfirmScene'
import { InfoWindowProvider, GlobalMouseTracker } from './components/common/InfoWindow'
import './styles/variables.css'
import './styles/global.css'
import './styles/effects.css'

function AppContent() {
  const { state } = useGameContext();
  const sceneLayout = (children: React.ReactNode) => (
    <GameLayout themeMode={state.ui.themeMode}>{children}</GameLayout>
  );

  switch (state.scene) {
    case 'race':    return sceneLayout(<RaceScene />);
    case 'main':    return sceneLayout(<MainScene />);
    case 'save':    return sceneLayout(<SaveScene />);
    case 'confirm': return sceneLayout(<ConfirmScene />);
    default:        return sceneLayout(<BeginScene />);
  }
}

function App() {
  return (
    <GameProvider>
      <InfoWindowProvider>
        <GlobalMouseTracker />
        <AppContent />
      </InfoWindowProvider>
    </GameProvider>
  )
}

export default App
