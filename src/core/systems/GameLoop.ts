// ═══ 游戏主循环系统 ═══
// AS3 原始: iData.Battle.as + Global.as (定时器相关)
//
// 组合 Battle 模型与 Player 模型，管理每 tick 需要执行的逻辑：
// 1. 执行战斗回合
// 2. 累加 caculate 计数器
// 3. 处理年龄增长
// 4. 处理自动存档

import type { GameState } from '../types';
import type { GameAction } from '../../state/actions';

/**
 * 执行一个游戏 tick
 * AS3 原始: Battle.run() — Timer(500)回调
 *
 * @param state 当前游戏状态
 * @param dispatch Reducer dispatch 函数
 */
export function gameTick(
  state: GameState,
  dispatch: React.Dispatch<GameAction>
): void {
  // 战斗进行中
  if (state.battle) {
    dispatch({ type: 'BATTLE_TICK' });
    return;
  }

  // 非战斗状态只累加计数器
  dispatch({ type: 'GAME_TICK' });
}

/**
 * 检查是否需要年龄增长
 * AS3 原始: Player.ageup() — caculate > 2400 触发
 */
export function checkAgeup(playerTick: number): boolean {
  return playerTick > 2400;
}
