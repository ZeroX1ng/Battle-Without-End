import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameContext } from '../../state/GameContext'
import { useGameLoop } from '../../hooks/useGameLoop'
import { gameTick } from '../../core/systems/GameLoop'
import { FlickerButton } from '../common/Common'
import {
  DEFAULT_TEST_ONE_HIT_KILL_ENABLED,
  DEFAULT_TEST_SPEED_MULTIPLIER,
  TEST_SPEED_CONTROL_ENABLED,
  getTestSpeedIntervalMs,
  type TestSpeedMultiplier,
} from '../../core/debug/testSpeedControl'
import { Map } from '../../core/models/Map'
import { MapList } from '../../core/data/mapData'
import { PlayerInfoPanel } from '../panels/PlayerInfoPanel'
import { MonsterInfoPanel } from '../panels/MonsterInfoPanel'
import { PetInfoPanel } from '../panels/PetInfoPanel'
import { AllInfoPanel } from '../panels/AllInfoPanel'
import { BattleSkillPanel } from '../panels/BattleSkillPanel'
import { LootPanel } from '../panels/LootPanel'
import { OtherPanel } from '../panels/OtherPanel'
import { HelpWindow } from '../windows/HelpWindow'
import { MapWindow } from '../windows/MapWindow'
import { SaveWindow } from '../windows/SaveWindow'
import { ShopWindow } from '../windows/ShopWindow'
import { SpecialShopWindow } from '../windows/SpecialShopWindow'
import { TestSpeedControl } from '../debug/TestSpeedControl'
import '../../styles/main-scene.css'

const overlayWindows: Record<string, JSX.Element> = {
  map: <MapWindow />,
  help: <HelpWindow />,
  shop: <ShopWindow />,
  specialshop: <SpecialShopWindow />,
  save: <SaveWindow />,
}

export function MainScene() {
  const { state, dispatch } = useGameContext()
  const [testSpeedMultiplier, setTestSpeedMultiplier] = useState<TestSpeedMultiplier>(DEFAULT_TEST_SPEED_MULTIPLIER)
  const [testOneHitKillEnabled, setTestOneHitKillEnabled] = useState(DEFAULT_TEST_ONE_HIT_KILL_ENABLED)
  const stateRef = useRef(state)
  const testOneHitKillEnabledRef = useRef(testOneHitKillEnabled)
  stateRef.current = state
  testOneHitKillEnabledRef.current = testOneHitKillEnabled
  const overlay = state.ui.activeWindow ? overlayWindows[state.ui.activeWindow] : null
  const gameLoopIntervalMs = useMemo(
    () => getTestSpeedIntervalMs(500, testSpeedMultiplier),
    [testSpeedMultiplier],
  )
  const toggleTestOneHitKill = useCallback(() => {
    setTestOneHitKillEnabled(enabled => !enabled)
  }, [])

  useEffect(() => {
    if (!stateRef.current.battle) {
      const map = new Map(MapList[0])
      dispatch({ type: 'BATTLE_START', map })
    }
  }, [dispatch])

  useGameLoop({
    callback: () => {
      const battleDebugOptions = testOneHitKillEnabledRef.current ? { oneHitKill: true } : undefined
      gameTick(stateRef.current, dispatch, battleDebugOptions)
    },
    intervalMs: gameLoopIntervalMs,
    enabled: true,
  })

  return (
    <div className="main-scene">
      <section className="main-scene__player" aria-label="玩家状态">
        <PlayerInfoPanel
          testSpeedControl={TEST_SPEED_CONTROL_ENABLED ? (
            <TestSpeedControl
              value={testSpeedMultiplier}
              onChange={setTestSpeedMultiplier}
              oneHitKillEnabled={testOneHitKillEnabled}
              onOneHitKillToggle={toggleTestOneHitKill}
            />
          ) : undefined}
        />
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

      {overlay && (
        <div className="main-scene__overlay">
          <div className="main-scene__overlay-panel">
            <FlickerButton
              onClick={() => dispatch({ type: 'UI_CLOSE_WINDOW' })}
              size="sm"
              glowColor="rgba(255, 120, 100, 0.55)"
              aria-label="Close overlay"
              style={{ position: 'absolute', top: 6, right: 8, zIndex: 1 }}
            >
              退出
            </FlickerButton>
            {overlay}
          </div>
        </div>
      )}
    </div>
  )
}
