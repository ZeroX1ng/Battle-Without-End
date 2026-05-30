# P0 Reducer Purity and StrictMode Parity

Last updated: 2026-05-30

## 中文

### 当前状态

Guarded. `src/main.tsx` 继续启用 React 18 `StrictMode`；`gameReducer` 已改为接收预先准备好的随机数、时间戳、读档数据和商店状态，并把写盘、音效、称号 mutation、音效开关等动作排入 commit 后 effect layer。手动锻造会先克隆旧装备实例再改等级，避免 StrictMode 双调用放大旧 state mutation。

### AS3 Source of Truth

- 无强制 AS3 源。此卡是 React architecture review。
- 行为语义仍需保持现有 AS3 parity guard 绿色，尤其是锻造、存档、称号和战斗 tick。

### React Targets

- `src/main.tsx`
- `src/state/GameContext.tsx`
- `src/state/actions.ts`
- `src/core/models/Equipment.ts`
- `src/core/models/Skill.ts`
- `src/core/data/titleData.ts`
- `src/core/systems/SaveSystem.ts`
- `src/core/systems/SoundSystem.ts`
- `src/core/systems/ForgeSystem.ts`
- `scripts/assertArchitectureBoundaries.mjs`
- New guard: `scripts/assertReducerPurityStrictMode.mjs`

### Current Symptom

- `gameReducer` calls `localSave(...)`.
- `gameReducer` calls `Math.random()` for shop and forge outcomes.
- `gameReducer` calls `updateTitleInfo(...)`, mutating module-level title state.
- `gameReducer` calls `equip.levelup()` / `equip.setLevel()`, mutating an instance reachable from old state.
- `gameReducer` calls `playForgeSound(...)`, `Date.now()`, and increments module-level `_msgId`.
- In dev StrictMode, a forge success can be applied twice, title progress can double count, and side effects can fire twice.

### Expected Behavior

- `gameReducer` is deterministic for the same `(state, action)` input.
- Reducer returns next state plus an explicit effect description, or side effects are moved to a post-reducer effect layer.
- Random values, timestamps, save writes, sound playback, and global title updates happen outside reducer evaluation.
- Equipment and skill level changes do not mutate objects reachable from the previous state.
- AS3-visible behavior remains unchanged: forge odds, failure downgrade/destroy behavior, save timing, title unlocks, and player-visible logs match existing guards.

### Forbidden Behavior

- Removing `React.StrictMode` as the primary fix.
- Keeping IO, sound, random, or `Date.now()` inside `gameReducer`.
- Shallow-cloning arrays while mutating the old item/skill object inside them.
- Changing AS3 forge formulas or title thresholds while repairing architecture.
- Broadly rewriting unrelated battle, shop, save, or UI behavior in the same pass.

### Red Guard Contract

Add or extend `assert:reducer-purity-strictmode` so it fails while:

- `gameReducer` contains direct `localSave`, `manuallySave`, `playForgeSound`, `Date.now`, or raw `Math.random`.
- `FORGE_EQUIPMENT` mutates an equipment instance from `state.player.itemList`.
- title progress mutation is dispatched directly inside reducer branches instead of through an isolated effect boundary.
- a StrictMode-style double invocation fixture can increase an equipment level or title count twice.

### Acceptance Tests

- Needed: `npm run assert:reducer-purity-strictmode`
- Existing adjacent: `npm run assert:architecture`
- Existing adjacent: `npm run assert:forge-logic`
- Existing adjacent: `npm run assert:start-burn-save`
- Existing adjacent: `npm run assert:save-persistence`
- Existing adjacent: `npm run assert:title-data-save-parity`
- Always run: `npx tsc -b`

### Guard Evidence

- `assert:reducer-purity-strictmode` 覆盖 reducer 内禁止 `localSave` / `manuallySave` / `localLoad` / `playForgeSound` / `Date.now` / `Math.random` / `updateTitleInfo` / `setSoundEnabled`，并禁止 `FORGE_EQUIPMENT` 直接修改旧装备实例。
- `assert:architecture`、`assert:start-burn-save` 和 `assert:save-persistence` 已改为检查 queue effect 边界，同时确认 commit 后 effect layer 仍调用 `SaveSystem.localSave` / `SaveSystem.manuallySave`。

### Manual Smoke Scenario

1. Run the dev app with `React.StrictMode` still enabled.
2. Create or load a character with enough gold and blacksmith level for one visible forge attempt.
3. Trigger one forge action and confirm the item changes by exactly one outcome, not a duplicated dev-only outcome.
4. Confirm save/log/sound/title behavior still appears once per player action.

## English

### Current Status

Guarded. `src/main.tsx` still enables React 18 `StrictMode`. `gameReducer` now consumes precomputed random/time/load/shop metadata and queues disk writes, sounds, title mutation, and sound toggles for a post-commit effect layer. Manual forge clones the previous equipment instance before changing its level, so StrictMode double invocation no longer mutates old state in place.

### AS3 Source of Truth

- No mandatory AS3 source. This is a React architecture review card.
- Existing AS3 parity guards for forge, save, title, and battle tick behavior must remain green.

### React Targets

- `src/main.tsx`
- `src/state/GameContext.tsx`
- `src/state/actions.ts`
- `src/core/models/Equipment.ts`
- `src/core/models/Skill.ts`
- `src/core/data/titleData.ts`
- `src/core/systems/SaveSystem.ts`
- `src/core/systems/SoundSystem.ts`
- `src/core/systems/ForgeSystem.ts`
- `scripts/assertArchitectureBoundaries.mjs`
- New guard: `scripts/assertReducerPurityStrictMode.mjs`

### Expected Behavior

- `gameReducer` is deterministic for the same `(state, action)`.
- Effects are described explicitly or handled after reducer evaluation.
- Random values, timestamps, save writes, sound playback, and title mutations happen outside the reducer.
- Equipment and skill level updates do not mutate objects reachable from previous state.
- AS3-visible forge, save, title, and log behavior remains unchanged.

### Acceptance Tests

- Needed: `npm run assert:reducer-purity-strictmode`
- Existing adjacent: `npm run assert:architecture`
- Existing adjacent: `npm run assert:forge-logic`
- Existing adjacent: `npm run assert:start-burn-save`
- Existing adjacent: `npm run assert:save-persistence`
- Existing adjacent: `npm run assert:title-data-save-parity`
- Always run: `npx tsc -b`

### Guard Evidence

- `assert:reducer-purity-strictmode` forbids `localSave` / `manuallySave` / `localLoad` / `playForgeSound` / `Date.now` / `Math.random` / `updateTitleInfo` / `setSoundEnabled` inside `gameReducer`, and forbids direct old-equipment mutation in `FORGE_EQUIPMENT`.
- `assert:architecture`, `assert:start-burn-save`, and `assert:save-persistence` now verify the queued effect boundary while keeping `SaveSystem.localSave` / `SaveSystem.manuallySave` as the post-commit persistence path.
