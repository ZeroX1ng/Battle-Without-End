import { useEffect, useRef } from 'react'
import { useGameContext } from '../../state/GameContext'
import { useGameLoop } from '../../hooks/useGameLoop'
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
      if (stateRef.current.battle) {
        dispatch({ type: 'BATTLE_TICK' })
      }
    },
    intervalMs: 500,
    enabled: true,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 12, gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <PlayerInfoPanel />
        <MonsterInfoPanel />
        <PetInfoPanel />
        <LootPanel />
      </div>

      <BattleSkillPanel />

      <div style={{
        flex: 1,
        minHeight: 0,
        background: 'var(--color-bg-dark)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        display: 'flex',
      }}>
        <OtherPanel />
      </div>

      <AllInfoPanel />
    </div>
  )
}
