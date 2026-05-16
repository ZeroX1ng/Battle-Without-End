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
import '../../styles/main-scene.css'

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
    <div className="main-scene">
      <section className="main-scene__player" aria-label="玩家状态">
        <PlayerInfoPanel />
      </section>

      <section className="main-scene__battle" aria-label="战斗状态">
        <div className="main-scene__battle-top">
          <MonsterInfoPanel />
          <PetInfoPanel />
        </div>

        <div className="main-scene__battle-bottom">
          <BattleSkillPanel />
          <LootPanel />
        </div>
      </section>

      <section className="main-scene__other" aria-label="功能窗口">
        <OtherPanel />
      </section>

      <section className="main-scene__log" aria-label="战斗日志">
        <AllInfoPanel />
      </section>
    </div>
  )
}
