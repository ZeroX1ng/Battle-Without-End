# P1 Start Custom Player Name

Last updated: 2026-06-20

Current status: Verified

## Chinese

### Verified Notes

2026-06-20: `npm run assert:start-custom-player-name` now guards the AS3 empty-slot naming contract and the React chain from `PLAYER_SET_NAME` through `PLAYER_BURN`, `PlayerInfoPanel`, local save/load, and manual export/import. Browser smoke passed with `DearMasterSmoke`: empty slot custom name -> RaceScene -> main panel -> refresh/load preserved the same name. No production code change was needed.

### 当前状态

本卡来自 2026-06-20 实时浏览器标注 Comment 5。主界面左上角玩家名显示为 `Jason`，Dear Master 指出当前游戏无法在主界面修改角色名，并期望像 AS3 原版一样在创建角色时由玩家自定义。

AS3 证据显示，自定义姓名入口不在 `RaceScene.as`，而是在 `SaveScene.as` 的空存档槽 `drawNew()`：玩家输入名字，`新建` 按钮才可见，点击后设置 `Player.playerName = text.text` 并进入 `RaceScene`。因此本卡应守住「创建前命名」和「姓名保存/读取/显示」，不要做主界面即时改名功能。

### 玩家可见症状

- 已进入主场景后，左上角名称固定显示当前存档名或默认 `Jason`，没有主界面改名入口。
- 如果新建角色入口没有清晰要求输入名字，玩家会误以为角色名不可自定义。
- 自定义名字必须在创建角色流程中进入 `PlayerInfoPanel`、本地存档和手动导出文件名。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iPanel/iScene/SaveScene.as` - `drawNew()` 创建输入框 `text.type = TextFieldType.INPUT`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/SaveScene.as` - 输入非空时 `start.visible = true`，空字符串时隐藏新建按钮。
- `reference/as3/BOE-O/scripts/iPanel/iScene/SaveScene.as` - 点击新建后 `slot = "slot" + num; Player.playerName = text.text;`，再进入 `RaceScene`。
- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - `playerName` 默认 `Jason`，`save()` 写入 `SharedObject.data.userName`，`load()` 读回。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as` - 主界面显示 `Player.title.realName + Player.playerName` 或 `Player.playerName`。

### React Targets

- `src/components/scenes/SaveScene.tsx` - 空槽输入框、新建按钮、`handleNewGame()`。
- `src/components/scenes/RaceScene.tsx` - 选择种族/年龄后触发 `PLAYER_BURN`。
- `src/state/GameContext.tsx` - `PLAYER_SET_NAME`、`PLAYER_BURN`、`activeSaveSlot`、保存副作用。
- `src/core/models/Player.ts` - `createInitialPlayerState()` 默认名与 `createNewPlayerState(age, race, playerName)`。
- `src/core/systems/SaveSystem.ts` - `localSave()`、`fileExport()`、`deserializeSave()` 对 `playerName/userName` 的处理。
- `src/components/panels/PlayerInfoPanel.tsx` - 主界面显示名称与称号前缀。

### Expected Behavior

- 空存档槽必须显示角色名输入框，非空后才允许新建。
- 点击新建后，输入名被写入临时 player state 和 active save slot；随后 RaceScene 的种族/年龄确认不能把名字重置为 `Jason`。
- 进入主场景后，PlayerInfoPanel 显示输入名；如果有称号，仍按 AS3 在名字前拼接称号 realName。
- 本地保存、读档、手动导出和手动导入都保留该名字。

### Forbidden Behavior

- 不要在主场景 PlayerInfoPanel 上添加随时改名功能。
- 不要允许空名字创建角色。
- 不要在 `PLAYER_BURN` 或 `createNewPlayerState()` 中把用户输入覆盖回 `Jason`。
- 不要只改显示层而不更新 save/load 数据。

### Red Guard Contract

新增 `assert:start-custom-player-name`：

- 静态读取 AS3 `SaveScene.as` 和 `Player.as`，确认输入框、非空才新建、`Player.playerName = text.text`、`save/load userName`。
- React 静态断言 `SaveScene.tsx` 空槽输入非空才 enable 新建，并 dispatch `PLAYER_SET_NAME` 后进入 `race`。
- 状态级 fixture：从空 state 设置名字 `DearMaster` 到 `slot2`，再 `PLAYER_BURN`，断言 `state.player.playerName === 'DearMaster'` 且保存数据 userName 为同名。
- 读档/导入 fixture：`deserializeSave()` 和 `LOAD_GAME` 后仍显示同名。
- Browser smoke 可选但建议：新建空槽输入自定义名，进入主场景，左上角显示该名。

### Acceptance Tests

- Dedicated: `npm run assert:start-custom-player-name`
- Nearby: `npm run assert:start-character-age`
- Nearby: `npm run assert:start-burn-save`
- Nearby: `npm run assert:save-persistence`
- Nearby: `npm run assert:save-load-runtime-continuity`
- Always: `npx tsc -b`

2026-06-20: dedicated guard and browser creation smoke passed.

### Manual Smoke

清空或选择一个空存档槽，输入自定义名字，确认新建按钮从禁用/隐藏变为可用。选择种族和年龄进入主场景，确认左上角显示输入名而不是 `Jason`。刷新后读取该槽，确认名称仍然保留。手动导出再导入，确认导入名一致。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p1-start-custom-player-name.md 这一张卡。
要求：
1. 先运行 git status --short，不要回滚无关改动。
2. 读取 docs/ai/00-working-rules.md、docs/parity/manifest.md、本卡、p0-start-character-age.md、p0-start-burn-save.md。
3. 对照 AS3：reference/as3/BOE-O/scripts/iPanel/iScene/SaveScene.as、reference/as3/BOE-O/scripts/iGlobal/Player.as、reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as。
4. 对照 React：src/components/scenes/SaveScene.tsx、src/components/scenes/RaceScene.tsx、src/state/GameContext.tsx、src/core/models/Player.ts、src/core/systems/SaveSystem.ts、src/components/panels/PlayerInfoPanel.tsx。
5. 先新增 assert:start-custom-player-name，证明自定义名必须在空存档槽创建前输入，并贯穿 PLAYER_SET_NAME -> PLAYER_BURN -> PlayerInfoPanel -> save/load。
6. 如果 guard 已经通过，只更新卡片状态和 manifest，补 browser smoke；不要强行改代码。
7. 如果 guard 失败，做最小修复：确保空名不能新建，输入名不会被 PLAYER_BURN/createNewPlayerState 重置，local save/manual export/load/import 都保留 userName。
8. 不要添加主界面随时改名入口，不要改称号显示规则，不要改种族/年龄公式。
9. 修复后运行：npm run assert:start-custom-player-name、npm run assert:start-character-age、npm run assert:start-burn-save、npm run assert:save-persistence、npm run assert:save-load-runtime-continuity、npx tsc -b。
10. 做 browser smoke：空槽输入自定义名 -> 选种族年龄 -> 主场景左上角显示该名 -> 刷新读档仍显示该名。
```

## English

### Current Status

Verified on 2026-06-20. The dedicated guard covers the AS3 creation-time naming flow plus React display and persistence. Browser smoke confirmed refresh/load preserves `DearMasterSmoke`; no production code change was needed.

### Required Fix

Preserve AS3's creation-time naming flow: empty save slots ask for a non-empty name before entering RaceScene, then that name survives player creation, display, save, load, export, and import. Do not add a main-scene rename feature.

### Acceptance Tests

- `npm run assert:start-custom-player-name`
- `npm run assert:start-character-age`
- `npm run assert:start-burn-save`
- `npm run assert:save-persistence`
- `npm run assert:save-load-runtime-continuity`
- `npx tsc -b`
