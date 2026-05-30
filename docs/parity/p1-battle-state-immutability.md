# P1 Battle State Immutability Parity

Last updated: 2026-05-30

## 中文

### 当前状态

Guard needed. `Battle` 是可变 class，`state.battle` 持有该实例，`BATTLE_TICK` 在 reducer 中直接调用 `battle.run(...)`。`withBattlePlayer()` 和 `switchBattleMap()` 用 `Object.create(Object.getPrototypeOf(...), Object.getOwnPropertyDescriptors(...))` 浅克隆保留原型。这个做法目前被 guard 局部保护，但仍是 reducer purity、战斗状态所有权和未来重构风险的共同来源。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as`

AS3 允许全局可变对象；React 只需要保持外部 tick、奖励、日志、死亡、年龄和存档行为一致。

### React Targets

- `src/core/models/Battle.ts`
- `src/state/GameContext.tsx`
- `src/state/actions.ts`
- `src/core/types.ts`
- `scripts/assertBattlePlayerStateParity.mjs`
- `scripts/assertArchitectureBoundaries.mjs`
- New guard: `scripts/assertBattleStateImmutabilityParity.mjs`

### Current Symptom

- `BATTLE_TICK` mutates `state.battle` through `battle.run(...)`.
- `Battle.run()` mutates `turn`, HP/MP fields, `playerState`, `_loot`, `_titleEvents`, monster state, pet state, and boss state.
- `withBattlePlayer()` shallow-clones the battle instance but nested references remain shared.
- Similar prototype-preserving clone logic appears in multiple reducer paths.

### Expected Behavior

- Reducer never mutates an object reachable from previous `GameState`.
- Battle transition can stay class-based internally, but reducer must operate on a fresh battle runtime or a pure transition result.
- `Battle.run()` effects are represented as return data before state is committed.
- Existing AS3-visible battle behavior remains unchanged.
- Existing `withBattlePlayer` coverage should either be replaced by a clearer boundary or guarded as an intentional transition helper.

### Forbidden Behavior

- Replacing `Battle` with a large unrelated rewrite in one pass.
- Changing battle formulas, random consumption order, reward order, or log text while only fixing state ownership.
- Adding deeper clone hacks without a guard that proves old state is not mutated.
- Treating this card as a UI task.

### Red Guard Contract

Add or extend `assert:battle-state-immutability` so it fails while:

- `BATTLE_TICK` calls `run()` on the `state.battle` instance directly.
- helper clones are shallow enough that previous battle HP/turn/playerState can change after reducer evaluation.
- a fixture can detect old `state.battle` mutation after one tick.

### Acceptance Tests

- Needed: `npm run assert:battle-state-immutability`
- Existing adjacent: `npm run assert:battle-player-state`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:architecture`
- Always run: `npx tsc -b`

## English

### Current Status

Guard needed. `Battle` is a mutable class stored in React state, and `BATTLE_TICK` calls `battle.run(...)` inside the reducer. Existing guards protect player sync, but the mutable class boundary remains a real architecture risk.

### Expected Behavior

- Reducer evaluation does not mutate objects reachable from previous `GameState`.
- Battle may stay class-based internally, but state commits use a fresh runtime or pure transition result.
- AS3-visible battle formulas, logs, rewards, and tick behavior remain unchanged.

### Acceptance Tests

- Needed: `npm run assert:battle-state-immutability`
- Existing adjacent: `npm run assert:battle-player-state`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:architecture`
- Always run: `npx tsc -b`
