# P0 Game Loop And Hook Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:game-loop` 守住。下面的 Original Symptom 和 Red Guard Contract 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。下一步只剩浏览器后台 smoke。

### 卡片范围

这张卡只处理 AS3 `Battle.run()` 心跳与 React `GameLoop` / `useGameLoop` / reducer tick 链路的生命周期一致性。不处理具体战斗公式、技能触发、怪物奖励、死亡惩罚或日志文案；这些应继续由各自 battle parity 卡片负责。

### AS3 Source of Truth

- `../BOE-O/scripts/iData/Battle.as` - 500ms `Timer`、`run()`、`caculate` 累加、60/600/2401 tick 信号与怪物重生。
- `../BOE-O/scripts/iPanel/iScene/MainScene.as` - 主场景创建 Battle 并保持战斗循环运行。
- `../BOE-O/scripts/iGlobal/Player.as` - `ageUp()`、`save()` 等由 tick 信号触发的玩家状态变化。

### React Targets

- `src/core/systems/GameLoop.ts` - tick 分发边界和 `gameTick()`。
- `src/hooks/useGameLoop.ts` - 500ms 调度实现、后台标签页行为、闭包状态。
- `src/components/scenes/MainScene.tsx` - `stateRef` 更新、hook callback、Battle 生命周期入口。
- `src/state/GameContext.tsx` - `BATTLE_TICK` / `GAME_TICK` reducer 分支。
- `src/core/models/Battle.ts` - `run()`、`caculate`、save/shop/ageup 信号。
- `package.json` / `scripts/assertGameLoopHeartbeatParity.mjs` 或后续 `scripts/assertGameLoopParity.mjs` - 本卡 guard。

### Original Symptom

修复前核心 tick 调度（500ms、战斗回合、`caculate` 累加、信号触发）已经接近 AS3 `Battle.run()`，但仍存在两个 P0 偏差：后台标签页中 React 使用 `requestAnimationFrame` 会暂停，AS3 Timer 则持续运行；现有 `GAME_TICK` 回退分支和 `assert:game-loop` 还编码了“无 battle 时仍有非战斗心跳”的 React 架构假设，与 AS3 Battle Timer 生命周期不一致。

### Red Guard Contract

修复代码前先更正或替换现有 `npm run assert:game-loop`，也可以新增并注册 `npm run assert:game-loop-parity`。首次运行应至少暴露当前这些错误：

- `useGameLoop.ts` 不应声明或依赖“页面隐藏自动暂停”作为游戏逻辑特性。
- 心跳实现不能因后台标签页 `requestAnimationFrame` 暂停而丢失 AS3 tick；若浏览器限制导致真实 500ms 不可达，必须补偿 elapsed time 或累计 missed ticks。
- 正常游戏流程中 `state.battle` 不应为 `null`，也不应需要 `GAME_TICK` 作为主路径。
- `MainScene.tsx` 的 tick callback 必须读取最新 `stateRef.current`，不能捕获旧 state。
- `BATTLE_TICK` 应继续消费 `Battle.run()` 的结果并触发 save/shop/ageup，不把业务状态放进 hook。

### Expected Behavior

- 游戏循环以 AS3 语义持续驱动：每个逻辑 tick 对应一次 `Battle.run()`，目标间隔为 500ms。
- 浏览器标签页不可见时，React 不应冻结逻辑时间；返回前台后应补齐或等价反映后台期间应发生的 tick。
- `caculate` 计数器持续递增，并在 60/600/2401 tick 触发自动存档、商店刷新、年龄增长。
- Battle 实例创建后在主场景生命周期内持续存在；玩家/怪物死亡通过 Battle 内部逻辑生成下一轮状态，而不是让主循环进入“无 battle”常态。
- Hook 和 reducer 边界清晰：hook 只调度，`GameLoop.ts` 只分发，`GameContext.tsx` 和 `Battle.ts` 拥有业务状态变化。

### Forbidden Behavior

- 因标签页不可见而暂停或冻结游戏逻辑。
- 把 `requestAnimationFrame` 的节能暂停当成与 AS3 等价的 Timer 行为。
- 让 `GAME_TICK` 成为正常主路径，掩盖 Battle 实例缺失。
- 在 hook 内保存或修改玩家、怪物、商店、存档等业务状态。
- 用构造新 Battle 的临时方案绕过 `withBattlePlayer()` 或现有状态所有权。

### State Ownership

- `useGameLoop.ts` 只负责调度和清理 timer/loop，不拥有业务状态。
- `GameLoop.ts` 负责把最新 `GameState` 转换成 reducer action，不直接改 state。
- `Battle.ts` 在 `run()` 中直接操作 `this.playerState`，再由 reducer 通过 `withBattlePlayer()` 同步不可变状态。
- `GameContext.tsx` 的 `BATTLE_TICK` reducer 负责日志分发、ageup、存档写入、商店刷新。
- `MainScene.tsx` 的 `stateRef` 必须在每次渲染后指向最新 state。

### Acceptance Tests

- Existing, must correct/extend: `npm run assert:game-loop`
- Needed if renamed: `npm run assert:game-loop-parity`
- Adjacent: `npm run assert:battle-player-state`
- Adjacent: `npm run assert:battle-damage-log-death`
- Adjacent: `npm run assert:save-persistence`（若该 guard 已存在）
- Always run: `npx tsc -b`

`assert:game-loop` / `assert:game-loop-parity` 至少应覆盖：

- AS3 `Battle.as` 的 500ms Timer、`caculate`、60/600/2401 tick 触发点已被 guard 明确读取。
- `useGameLoop.ts` 不再把页面隐藏暂停作为游戏逻辑语义。
- tick callback 使用最新 `stateRef.current`。
- 每个逻辑 tick 只通过 Battle 主路径进入 `BATTLE_TICK`。
- `caculate === 60` 触发 auto-save 信号，`600` 触发商店刷新，`2401` 触发 ageup。
- 后台时间流逝的测试 fixture 能证明 missed ticks 被补偿或等价处理。

### Manual Smoke Scenario

1. 启动游戏进入主场景，确认战斗自动进行。
2. 观察日志节奏约每 500ms 更新一次。
3. 打开开发者工具或另一个标签页，让游戏标签页在后台停留约 2 分钟。
4. 切回游戏，确认 `caculate`、自动存档、商店刷新倒计时没有停在切出前。
5. 长时间挂机后确认 ageup 日志正常出现。
6. 若浏览器后台节流导致真实 500ms 不可达，记录补偿策略和玩家可见结果。

### 修复完成报告要求

- 列出实际读取的 AS3 文件和 tick/save/shop/ageup 分支。
- 列出修改的 React/脚本文件。
- 说明旧 `assert:game-loop` 如何被更正，以及新 guard 的 red/green 结果。
- 报告相邻 guard 与 `npx tsc -b` 结果。
- 明确浏览器后台 smoke 是否完成；未做时说明环境限制。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:game-loop`. The Original Symptom and Red Guard Contract below remain as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again. The next step is browser background smoke only.

### Card Scope

This card only covers lifecycle parity between AS3 `Battle.run()` heartbeat behavior and the React `GameLoop` / `useGameLoop` / reducer tick chain. It does not cover battle formulas, skill triggers, monster rewards, death penalties, or log wording; those remain in their own battle parity cards.

### AS3 Source of Truth

- `../BOE-O/scripts/iData/Battle.as` - 500ms `Timer`, `run()`, `caculate`, 60/600/2401 tick signals, and monster respawn.
- `../BOE-O/scripts/iPanel/iScene/MainScene.as` - main-scene Battle creation and continuous battle loop.
- `../BOE-O/scripts/iGlobal/Player.as` - player changes triggered by tick signals, such as `ageUp()` and `save()`.

### React Targets

- `src/core/systems/GameLoop.ts` - tick dispatch boundary and `gameTick()`.
- `src/hooks/useGameLoop.ts` - 500ms scheduling implementation, background-tab behavior, and closure state.
- `src/components/scenes/MainScene.tsx` - `stateRef` updates, hook callback, and Battle lifecycle entry.
- `src/state/GameContext.tsx` - `BATTLE_TICK` / `GAME_TICK` reducer branches.
- `src/core/models/Battle.ts` - `run()`, `caculate`, save/shop/ageup signals.
- `package.json` / `scripts/assertGameLoopHeartbeatParity.mjs` or future `scripts/assertGameLoopParity.mjs` - guard for this card.

### Original Symptom

Before the repair, core tick dispatch (500ms, battle turns, `caculate`, and signal emission) was close to AS3 `Battle.run()`, but two P0 deviations remained: React used `requestAnimationFrame`, which pauses in background tabs, while AS3 Timer keeps running; the existing `GAME_TICK` fallback and `assert:game-loop` still encoded a React assumption that a non-battle heartbeat is a normal path, which conflicts with AS3 Battle Timer lifecycle.

### Red Guard Contract

Before production edits, correct or replace the existing `npm run assert:game-loop`, or add and register `npm run assert:game-loop-parity`. Its first run should expose at least these failures:

- `useGameLoop.ts` should not describe or rely on hidden-page auto-pause as gameplay semantics.
- The heartbeat must not lose AS3 ticks when background-tab `requestAnimationFrame` pauses; if browser limits make real 500ms impossible, elapsed time or missed ticks must be compensated.
- In normal gameplay, `state.battle` should not be `null`, and `GAME_TICK` should not be the main path.
- `MainScene.tsx` tick callback must read the latest `stateRef.current`, not stale captured state.
- `BATTLE_TICK` must keep consuming `Battle.run()` output and triggering save/shop/ageup without moving business state into the hook.

### Expected Behavior

- The game loop drives AS3-equivalent logic ticks: each logical tick corresponds to one `Battle.run()`, targeting a 500ms interval.
- Hidden browser tabs should not freeze logic time; when returning to the foreground, React should catch up or otherwise represent ticks that should have happened in the background.
- `caculate` continues increasing and triggers auto-save, shop refresh, and ageup at 60/600/2401 ticks.
- Once a Battle instance exists in the main-scene lifecycle, it remains the normal heartbeat owner. Player or monster death is handled inside Battle flow instead of making the main loop normally battle-less.
- Hook/reducer boundaries remain clear: hook schedules, `GameLoop.ts` dispatches, `GameContext.tsx` and `Battle.ts` own business changes.

### Forbidden Behavior

- Pausing or freezing game logic because the tab is hidden.
- Treating `requestAnimationFrame` energy-saving pause as equivalent to AS3 Timer behavior.
- Making `GAME_TICK` the normal main path and hiding missing Battle instances.
- Storing or mutating player, monster, shop, or save state inside the hook.
- Constructing temporary Battle instances to bypass `withBattlePlayer()` or existing state ownership.

### State Ownership

- `useGameLoop.ts` only schedules and cleans up timer/loop state; it owns no business state.
- `GameLoop.ts` converts the latest `GameState` into reducer actions and does not mutate state.
- `Battle.ts` mutates `this.playerState` during `run()`, and the reducer synchronizes immutable state via `withBattlePlayer()`.
- `GameContext.tsx` `BATTLE_TICK` reducer owns log dispatch, ageup, save writes, and shop refresh.
- `MainScene.tsx` `stateRef` must point to the latest state after each render.

### Acceptance Tests

- Existing, must correct/extend: `npm run assert:game-loop`
- Needed if renamed: `npm run assert:game-loop-parity`
- Adjacent: `npm run assert:battle-player-state`
- Adjacent: `npm run assert:battle-damage-log-death`
- Adjacent: `npm run assert:save-persistence` if that guard exists
- Always run: `npx tsc -b`

`assert:game-loop` / `assert:game-loop-parity` should cover at least:

- AS3 `Battle.as` 500ms Timer, `caculate`, and 60/600/2401 trigger points are explicitly read by the guard.
- `useGameLoop.ts` no longer treats hidden-page pause as gameplay semantics.
- The tick callback uses the latest `stateRef.current`.
- Each logical tick enters the Battle main path through `BATTLE_TICK`.
- `caculate === 60` emits auto-save, `600` emits shop refresh, and `2401` emits ageup.
- A background-elapsed-time fixture proves missed ticks are compensated or equivalently handled.

### Manual Smoke Scenario

1. Start the game and enter the main scene; confirm battle proceeds automatically.
2. Observe log rhythm at roughly one update every 500ms.
3. Open DevTools or another tab and leave the game tab in the background for about 2 minutes.
4. Return to the game and confirm `caculate`, auto-save, and shop countdown did not remain stuck at the value from before switching away.
5. After extended idling, confirm the ageup log appears.
6. If browser throttling prevents true 500ms background ticks, record the compensation strategy and player-visible result.

### Completion Report Requirements

- List the AS3 files and tick/save/shop/ageup branches actually read.
- List React/script files changed.
- Explain how the old `assert:game-loop` was corrected and report the new guard red/green result.
- Report adjacent guards and `npx tsc -b`.
- State whether browser background smoke was performed; if not, explain the environment limit.
