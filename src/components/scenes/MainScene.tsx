import { useEffect, useRef } from 'react'
import { useGameContext } from '../../state/GameContext'
import { useGameLoop } from '../../hooks/useGameLoop'
import { gameTick } from '../../core/systems/GameLoop'
import { Map } from '../../core/models/Map'
import { MapList } from '../../core/data/mapData'
import { PlayerInfoPanel } from '../panels/PlayerInfoPanel'
import { MonsterInfoPanel } from '../panels/MonsterInfoPanel'
import { PetInfoPanel } from '../panels/PetInfoPanel'
import { AllInfoPanel } from '../panels/AllInfoPanel'
import { BattleSkillPanel } from '../panels/BattleSkillPanel'
import { LootPanel } from '../panels/LootPanel'
import { OtherPanel } from '../panels/OtherPanel'

export function MainScene() {
  const { state, dispatch } = useGameContext()
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (!stateRef.current.battle) {
      const map = new Map(MapList[0])
      dispatch({ type: 'BATTLE_START', map })
    }
  }, [dispatch])

  useGameLoop({
    callback: () => {
      gameTick(stateRef.current, dispatch)
    },
    intervalMs: 500,
    enabled: true,
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <PlayerInfoPanel />
      </div>

      <div style={{ position: 'absolute', top: 10, left: 400 }}>
        <MonsterInfoPanel />
      </div>

      <div style={{ position: 'absolute', top: 150, left: 400 }}>
        <PetInfoPanel />
      </div>

      <div style={{ position: 'absolute', top: 10, left: 590, width: 200, bottom: 10 }}>
        <OtherPanel />
      </div>

      <div style={{ position: 'absolute', top: 235, left: 415 }}>
        <BattleSkillPanel />
      </div>

      <div style={{ position: 'absolute', top: 235, left: 10 }}>
        <AllInfoPanel />
      </div>

      <div style={{ position: 'absolute', top: 405, left: 415 }}>
        <LootPanel />
      </div>
    </div>
  )
}
