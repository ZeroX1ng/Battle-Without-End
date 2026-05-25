# P0 Save State Persistence

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:save-persistence` 守住。下面的 Original Symptom 和 Red Guard Contract 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。下一步只剩浏览器可见 smoke。

### 卡片范围

这张卡只处理存档写入生命周期、槽位选择缺失时的行为、角色命名后的元数据同步，以及手动导入 action 的 reducer 入口。不处理 `playerBurn()` 的初始装备/技能细节（见 `p0-start-burn-save.md`），也不处理读档后种族、日志开关、掉落开关、战斗实例连续性（见 `p0-save-load-runtime-continuity.md`）。

### AS3 Source of Truth

- `../BOE-O/scripts/iGlobal/Player.as` - `save()`、`manuallySave()`、`load()`、`manualLoad()`、`burn()` 结尾保存。
- `../BOE-O/scripts/iData/Battle.as` - 每 60 tick 自动调用 `Player.save()`。
- `../BOE-O/scripts/iPanel/iScene/SaveScene.as` - 槽位选择、角色名输入和进入主场景前的存档前置流程。

### React Targets

- `src/core/systems/SaveSystem.ts` - 序列化、反序列化、localStorage 写入、导出、导入。
- `src/state/GameContext.tsx` - `PLAYER_BURN`、`PLAYER_SET_NAME`、`BATTLE_TICK.shouldSave`、`SAVE_GAME`、`MANUAL_SAVE`、`MANUAL_LOAD`。
- `src/state/actions.ts` - save/load action type 定义。
- `src/components/scenes/SaveScene.tsx` / 相关导入 UI - 触发命名、槽位选择、文件导入的入口。
- `package.json` / `scripts/assertSavePersistenceParity.mjs` - 本卡新增或注册的 guard。

### Original Symptom

自动存档在 `activeSaveSlot === null` 时静默跳过，不产生任何玩家可见提示或开发者警告。玩家在战斗中长时间未手动存档后，刷新浏览器会导致进度丢失。角色创建后不自动持久化；`PLAYER_SET_NAME` 后名字元数据可能与 `player.playerName` 不同步；文件导入的后端逻辑存在但缺少 reducer action 入口。

### Red Guard Contract

修复代码前先新增并注册 `npm run assert:save-persistence`。首次运行应至少暴露当前这些错误：

- `BATTLE_TICK` 在 `shouldSave === true` 且 `activeSaveSlot === null` 时不应静默返回。
- `PLAYER_BURN` 完成后应写入存档，而不是等用户手动保存。
- `PLAYER_SET_NAME` 完成后应同步 slot metadata 与 `player.playerName`。
- `SAVE_GAME` / auto-save 前应拒绝空 `player.playerName`，或产生明确警告。
- `MANUAL_LOAD` action 应存在，并能把 `SaveSystem.fileImport()` 的结果还原为有效 `GameState`。

### Expected Behavior

- 自动存档与 AS3 一致：战斗每 60 tick 触发保存，不因缺少 `activeSaveSlot` 而静默丢弃。
- 若缺少 `activeSaveSlot`，React 必须选择明确策略：回退到默认槽位（例如 `slot1`）或阻止进入会产生自动存档的游戏流程，并给出可诊断提示。
- `PLAYER_BURN` 后立即保存，呼应 AS3 `Player.burn()` 结尾的 `save()`。
- `PLAYER_SET_NAME` 后立即保存，使槽位元数据与实际角色名一致。
- `MANUAL_LOAD` action 将文件导入数据接入 reducer，支持 `.boe` 文件恢复。
- `SAVE_GAME` / auto-save 前验证 `player.playerName` 非空，避免生成空名或 undefined 槽位。

### Forbidden Behavior

- `activeSaveSlot === null` 时无日志、无提示、无持久化地跳过保存。
- 角色创建后刷新丢失角色。
- 修改 `player.playerName` 后不更新槽位元数据。
- `fileImport()` 有实现但无 action/reducer/UI 路径触发。
- 在本卡里混入读档后 Battle 实例重建、种族恢复、日志/掉落开关恢复等运行时连续性修复。

### State Ownership

- `SaveSystem.ts` 负责序列化、反序列化、存储、导出和导入。
- `GameContext.tsx` reducer 负责在正确生命周期节点触发保存：`PLAYER_BURN`、`PLAYER_SET_NAME`、`BATTLE_TICK.shouldSave`、`SAVE_GAME`、`MANUAL_SAVE`、`MANUAL_LOAD`。
- `actions.ts` 负责声明所有 save/load action。
- `SaveScene.tsx` 负责玩家可见的槽位和名字输入流程，不拥有底层存储格式。

### Acceptance Tests

- Needed: `npm run assert:save-persistence`
- Adjacent: `npm run assert:start-burn-save`（若该 guard 已存在）
- Adjacent: `npm run assert:save-load-runtime-continuity`
- Adjacent: `npm run assert:architecture`
- Always run: `npx tsc -b`

`assert:save-persistence` 至少应覆盖：

- `BATTLE_TICK` 在 `shouldSave === true` 且 `activeSaveSlot === null` 时写入默认槽或产生可见警告，不能静默返回。
- `PLAYER_BURN` 后测试存储中存在当前角色的存档数据。
- `PLAYER_SET_NAME` 后 slot metadata 的 `userName` 与 `player.playerName` 一致。
- 空 `player.playerName` 不能生成正常存档。
- `MANUAL_LOAD` action 存在，且能把文件导入数据还原为有效 `GameState`。

### Manual Smoke Scenario

1. 清空 `localStorage`，启动新游戏。
2. 在 SaveScene 选择 `slot1` 并输入名字，进入主场景后刷新浏览器，确认名字和角色仍存在。
3. 进入战斗，等待自动存档触发（60 tick），刷新后确认进度保留。
4. 手动导出 `.boe` 存档，清除 `localStorage` 后通过文件导入恢复，确认状态一致。
5. 尝试空名字流程，确认 UI 或 reducer 阻止进入会产生无效存档的状态。

### 修复完成报告要求

- 列出实际读取的 AS3 文件和关键保存/读取函数。
- 列出修改的 React/脚本文件。
- 说明 `assert:save-persistence` 的 red/green 结果。
- 报告相邻 guard 与 `npx tsc -b` 结果。
- 明确浏览器 smoke 是否覆盖刷新、自动存档和文件导入。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:save-persistence`. The Original Symptom and Red Guard Contract below remain as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again. The next step is browser-visible smoke only.

### Card Scope

This card only covers save-write lifecycle behavior, missing-slot handling, name metadata synchronization, and the reducer entry for manual file import. It does not cover starter equipment/skill setup in `playerBurn()` (`p0-start-burn-save.md`) or post-load runtime continuity such as race, log toggles, drop toggles, and Battle instance restoration (`p0-save-load-runtime-continuity.md`).

### AS3 Source of Truth

- `../BOE-O/scripts/iGlobal/Player.as` - `save()`, `manuallySave()`, `load()`, `manualLoad()`, and the final save in `burn()`.
- `../BOE-O/scripts/iData/Battle.as` - automatic `Player.save()` every 60 ticks.
- `../BOE-O/scripts/iPanel/iScene/SaveScene.as` - slot selection, player-name entry, and the save prerequisites before entering the main scene.

### React Targets

- `src/core/systems/SaveSystem.ts` - serialization, deserialization, localStorage writes, export, and import.
- `src/state/GameContext.tsx` - `PLAYER_BURN`, `PLAYER_SET_NAME`, `BATTLE_TICK.shouldSave`, `SAVE_GAME`, `MANUAL_SAVE`, and `MANUAL_LOAD`.
- `src/state/actions.ts` - save/load action type declarations.
- `src/components/scenes/SaveScene.tsx` / related import UI - player-facing entry points for naming, slot selection, and file import.
- `package.json` / `scripts/assertSavePersistenceParity.mjs` - guard registration for this card.

### Original Symptom

Auto-save silently skips when `activeSaveSlot === null`, with no player-visible message or developer warning. Progress can be lost after refreshing during long battles without manual save. Character creation is not persisted immediately; `PLAYER_SET_NAME` can leave slot metadata out of sync with `player.playerName`; file-import backend logic exists but lacks a reducer action path.

### Red Guard Contract

Before production edits, add and register `npm run assert:save-persistence`. Its first run should expose at least these failures:

- `BATTLE_TICK` with `shouldSave === true` and `activeSaveSlot === null` must not silently return.
- `PLAYER_BURN` should write save data instead of waiting for manual save.
- `PLAYER_SET_NAME` should synchronize slot metadata with `player.playerName`.
- `SAVE_GAME` / auto-save should reject an empty `player.playerName` or emit an explicit warning.
- A `MANUAL_LOAD` action should exist and restore `SaveSystem.fileImport()` output into valid `GameState`.

### Expected Behavior

- Auto-save matches AS3: battle triggers save every 60 ticks and does not silently discard the write because `activeSaveSlot` is missing.
- If `activeSaveSlot` is missing, React must use an explicit strategy: fall back to a default slot such as `slot1`, or block entry into save-producing gameplay with a diagnosable message.
- `PLAYER_BURN` saves immediately, matching the final `save()` in AS3 `Player.burn()`.
- `PLAYER_SET_NAME` saves immediately so slot metadata and actual player name match.
- `MANUAL_LOAD` wires file import data into the reducer and supports `.boe` recovery.
- `SAVE_GAME` / auto-save validates non-empty `player.playerName` before writing.

### Forbidden Behavior

- Skipping save silently when `activeSaveSlot === null`.
- Losing the character on refresh after creation.
- Changing `player.playerName` without updating slot metadata.
- Leaving `fileImport()` implemented but unreachable from action/reducer/UI flow.
- Mixing in post-load Battle reconstruction, race restoration, or log/drop toggle restoration in this card.

### State Ownership

- `SaveSystem.ts` owns serialization, deserialization, storage, export, and import.
- `GameContext.tsx` reducer owns save triggers at lifecycle points: `PLAYER_BURN`, `PLAYER_SET_NAME`, `BATTLE_TICK.shouldSave`, `SAVE_GAME`, `MANUAL_SAVE`, and `MANUAL_LOAD`.
- `actions.ts` owns save/load action declarations.
- `SaveScene.tsx` owns player-facing slot and name input, not the storage format.

### Acceptance Tests

- Needed: `npm run assert:save-persistence`
- Adjacent: `npm run assert:start-burn-save` if that guard exists
- Adjacent: `npm run assert:save-load-runtime-continuity`
- Adjacent: `npm run assert:architecture`
- Always run: `npx tsc -b`

`assert:save-persistence` should cover at least:

- `BATTLE_TICK` with `shouldSave === true` and `activeSaveSlot === null` writes to a default slot or emits a visible warning; it must not silently return.
- After `PLAYER_BURN`, test storage contains save data for the current character.
- After `PLAYER_SET_NAME`, slot metadata `userName` matches `player.playerName`.
- Empty `player.playerName` cannot produce a normal save.
- A `MANUAL_LOAD` action exists and can restore file-import data into valid `GameState`.

### Manual Smoke Scenario

1. Clear `localStorage` and start a new game.
2. Choose `slot1` in SaveScene, enter a name, reach the main scene, refresh, and confirm the name and character persist.
3. Enter battle, wait for auto-save at 60 ticks, refresh, and confirm progress remains.
4. Export a `.boe` save, clear `localStorage`, import the file, and confirm state restoration.
5. Try the empty-name path and confirm UI or reducer prevents an invalid save-producing state.

### Completion Report Requirements

- List the AS3 files and save/load functions actually read.
- List React/script files changed.
- Report the `assert:save-persistence` red/green result.
- Report adjacent guards and `npx tsc -b`.
- State whether browser smoke covered refresh, auto-save, and file import.
