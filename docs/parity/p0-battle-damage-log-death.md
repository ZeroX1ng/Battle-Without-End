# P0 Battle Damage Log And Death Parity

Last updated: 2026-05-19

## 中文

### AS3 Source of Truth

- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iPanel/iScene/MainScene.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/MonsterInfoPanel.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/state/GameContext.tsx`
- `src/components/scenes/MainScene.tsx`
- `src/components/panels/PlayerInfoPanel.tsx`

### Current Symptom

开始战斗后，日志缺少玩家受到伤害的记录；玩家 HP/死亡流程不透明，表现像是玩家没有逐次受伤而是直接死亡。

### Expected Behavior

- 战斗 tick 按 AS3 `Battle.run()`、`fight()`、`playerTurn()`、`monsterTurn()` 的顺序推进。
- 怪物攻击玩家时，先计算伤害，再扣 HP，再写玩家可见日志，再检查死亡。
- 玩家死亡、经验/金币惩罚、怪物刷新、宠物相关分支和奖励发放必须与 AS3 对应。
- 战斗日志必须覆盖玩家造成伤害、玩家受到伤害、宠物行动、技能触发、死亡和奖励。
- `BATTLE_TICK` 结束后，React `state.player` 和 live `battle.playerState` 保持一致。

### Forbidden Behavior

- 没有伤害日志就直接修改死亡状态。
- 在 UI 层伪造日志，而不是从战斗结算结果输出。
- 只同步最终 HP，不保留每个 turn 的可见事件。
- 让 `state.player` 和 `battle.playerState` 互相覆盖导致上一 tick 的状态回滚。

### State Ownership

- `Battle.ts` 负责战斗结算、伤害数字、死亡检查和 pending log。
- `GameContext.tsx` 的 `BATTLE_TICK` 负责消费 battle 结果、同步 live player、追加 UI 日志。
- UI 面板只展示状态，不计算战斗规则。

### Acceptance Tests

- Existing: `npm run assert:battle-player-state`
- Existing: `npm run assert:monster-reward`
- Existing script file to review: `scripts/assertBattleDefenceSkill.mjs`
- Needed: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-damage-log-death` 应覆盖：

- 固定随机数或构造战斗状态后，怪物攻击玩家会减少 HP。
- 同一 tick 产生玩家受伤日志，日志中含攻击者、目标、伤害数值或 AS3 等价文本。
- HP 归零前不触发死亡；HP 归零后触发 AS3 对应死亡流程。
- `BATTLE_TICK` 后 `state.player.hp` 与 `battle.playerState.hp` 一致。

### Manual Smoke Scenario

1. 新开一局并进入战斗。
2. 观察 10 到 20 个 tick 的日志，确认玩家受伤有文字记录。
3. 在低血量场景下继续战斗，确认死亡前有连续伤害和 HP 变化。
4. 死亡后确认惩罚、刷新和日志语义与 AS3 相符。

## English

### AS3 Source of Truth

- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iPanel/iScene/MainScene.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/MonsterInfoPanel.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/state/GameContext.tsx`
- `src/components/scenes/MainScene.tsx`
- `src/components/panels/PlayerInfoPanel.tsx`

### Current Symptom

Battle logs do not record damage taken by the player. Player HP and death flow are opaque, making death look instant instead of turn-based.

### Expected Behavior

- Battle ticks follow the AS3 order from `Battle.run()`, `fight()`, `playerTurn()`, and `monsterTurn()`.
- When a monster attacks the player, damage is calculated, HP is reduced, visible logs are emitted, then death is checked.
- Player death, exp/gold penalties, monster refresh, pet branches, and rewards match AS3.
- Battle logs cover player damage dealt, player damage taken, pet actions, skill triggers, death, and rewards.
- After `BATTLE_TICK`, React `state.player` and live `battle.playerState` stay synchronized.

### Forbidden Behavior

- Updating death state without a damage log.
- Faking logs in UI instead of emitting them from battle resolution.
- Syncing only final HP while losing turn-visible events.
- Letting `state.player` and `battle.playerState` overwrite each other and revert previous tick state.

### State Ownership

- `Battle.ts` owns battle resolution, damage numbers, death checks, and pending logs.
- `GameContext.tsx` `BATTLE_TICK` consumes battle results, syncs live player, and appends UI logs.
- UI panels display state only; they must not compute battle rules.

### Acceptance Tests

- Existing: `npm run assert:battle-player-state`
- Existing: `npm run assert:monster-reward`
- Existing script file to review: `scripts/assertBattleDefenceSkill.mjs`
- Needed: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-damage-log-death` should cover:

- With deterministic randomness or constructed state, monster attacks reduce player HP.
- The same tick emits a player damage log containing attacker, target, damage amount, or AS3-equivalent text.
- Death does not trigger before HP reaches zero; once HP reaches zero, AS3-equivalent death flow triggers.
- After `BATTLE_TICK`, `state.player.hp` and `battle.playerState.hp` match.

### Manual Smoke Scenario

1. Start a new game and enter battle.
2. Watch 10 to 20 ticks of logs and confirm player damage is visible.
3. Continue at low HP and confirm death is preceded by damage and HP changes.
4. After death, verify penalties, refresh behavior, and log meaning against AS3.
