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

  switch (state.scene) {
    case 'race':    return <GameLayout><RaceScene /></GameLayout>;
    case 'main':    return <GameLayout><MainScene /></GameLayout>;
    case 'save':    return <GameLayout><SaveScene /></GameLayout>;
    case 'confirm': return <GameLayout><ConfirmScene /></GameLayout>;
    default:        return <GameLayout><BeginScene /></GameLayout>;
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
