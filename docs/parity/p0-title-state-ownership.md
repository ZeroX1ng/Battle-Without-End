# P0 Title State Ownership Parity

Last updated: 2026-05-30

## 中文

### 当前状态

Needs repair. 称号进度目前由模块级 `TitleList` 和 `_pendingUnlocks` 持有，`updateTitleInfo()` 直接修改全局称号对象。存档加载会创建一份 `player.titleList`，但运行时称号进度仍主要写入全局表，TitleWindow 又混用全局表和玩家表。这会让多存档、多周目、读档后称号进度和技能解锁队列的所有权变得含糊。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iPlayer/Title.as`
- `reference/as3/BOE-O/scripts/iData/iPlayer/TitleList.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`

AS3 static 形态只作为外部行为参考；React 不需要保留全局可变称号表。

### React Targets

- `src/core/data/titleData.ts`
- `src/core/models/Player.ts`
- `src/core/systems/SaveSystem.ts`
- `src/state/GameContext.tsx`
- `src/core/data/skillBehaviors.ts`
- `src/components/panels/TitleWindow.tsx`
- `scripts/assertTitleDataSaveParity.mjs`
- New guard: `scripts/assertTitleStateOwnershipParity.mjs`

### Current Symptom

- `TitleList` 是模块级可变数组。
- `updateTitleInfo()` 修改 `TitleList` 中对象的 `max/count/isGot`。
- `_pendingUnlocks` 是模块级队列。
- `player.titleList` 在初始角色中为空，在读档后变成独立 title 实例数组。
- `TitleWindow` 通过 `player.titleList` 判断已获得数量，同时又把 `TitleList.def.isGot` 当可获得来源。
- `SaveSystem.serializeSave()` 在玩家表缺失 title 时回退到全局 `TitleList`，可能把会话级进度写进当前存档。

### Expected Behavior

- 一个玩家的称号进度属于 `GameState.player.titleList`。
- `updateTitleInfo` 或替代函数应接收玩家称号状态并返回新的玩家称号状态与待解锁技能事件。
- 每个存档、每次新建/转生、每次读档都拥有隔离的 title progress。
- `TitleWindow` 只从当前玩家称号状态派生渲染，不从全局 `TitleList.isGot` 推断获得状态。
- AS3 的称号阈值、保存顺序、当前称号选择、技能解锁行为保持不变。

### Forbidden Behavior

- 继续让运行时进度写入模块级 `TitleList`。
- 通过清空全局 `TitleList` 掩盖问题，而不是把所有权放回玩家状态。
- 破坏 `@TITLE` 全表顺序保存。
- 读档后让当前称号引用全局 title 对象。
- 把技能解锁队列留在模块级全局状态中。

### Red Guard Contract

Add or extend `assert:title-state-ownership` so it fails while:

- `titleData.ts` exposes mutable runtime progress through `TitleList`.
- `updateTitleInfo(...)` returns `void` and mutates module-level title objects.
- `_pendingUnlocks` is module-level mutable state.
- two simulated players can observe each other's title progress.
- TitleWindow availability depends on `def.isGot` from global `TitleList`.

### Acceptance Tests

- Needed: `npm run assert:title-state-ownership`
- Existing adjacent: `npm run assert:title-data-save-parity`
- Existing adjacent: `npm run assert:title-window`
- Existing adjacent: `npm run assert:save-load-runtime-continuity`
- Existing adjacent: `npm run assert:architecture`
- Always run: `npx tsc -b`

### Manual Smoke Scenario

1. Start a new game and unlock or force one simple title path.
2. Save, then start or load another slot.
3. Confirm the second slot does not inherit the first slot's title progress.
4. Load the first slot again and confirm title progress, selected title, and title tooltip records remain correct.

## English

### Current Status

Needs repair. Title progress is held by module-level `TitleList` and `_pendingUnlocks`. Runtime updates mutate global title objects, while loaded saves create player-local title instances. This makes multi-save and multi-run ownership ambiguous.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iPlayer/Title.as`
- `reference/as3/BOE-O/scripts/iData/iPlayer/TitleList.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`

AS3 static state is an external behavior reference, not a required React architecture.

### Expected Behavior

- Title progress belongs to `GameState.player.titleList`.
- Title updates return new player title state and explicit skill-unlock events.
- Save slots, new games, rebirth, and load flows isolate title progress.
- TitleWindow derives availability from the current player state only.
- AS3 thresholds, save order, selected-title behavior, and skill unlocks remain unchanged.

### Acceptance Tests

- Needed: `npm run assert:title-state-ownership`
- Existing adjacent: `npm run assert:title-data-save-parity`
- Existing adjacent: `npm run assert:title-window`
- Existing adjacent: `npm run assert:save-load-runtime-continuity`
- Existing adjacent: `npm run assert:architecture`
- Always run: `npx tsc -b`
