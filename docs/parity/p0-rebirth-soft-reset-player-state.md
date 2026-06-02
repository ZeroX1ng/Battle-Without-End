# P0 Rebirth Soft Reset Player State Parity

Last updated: 2026-06-02

## 中文

### 当前状态

Guarded. AS3 转生不是重新创建一个空白角色：转生按钮只进入 `RaceScene`、授予 reborn 称号进度并把 `Player.caculate = 0`；确认新年龄/种族后 `Player.burn()` 只重算出生相关状态，并保留装备、背包、金币、AP、宠物、技能、已装备技能和称号进度。React 已由 `assert:rebirth-soft-reset-player-state` 守住软重置保留和转生后保存；下一步只剩浏览器 smoke。

### 卡片范围

本卡只处理 `DO_REBIRTH` / `playerBurn()` 的转生软重置状态保留和转生后即时保存。不处理战斗、地图、UI 样式、读档连续性、完整存档导入导出或称号窗口展示。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - `Player.burn()` 设置 `age`、`race`、`lv = 1`，调用 `caculateInitStat()`，仅在 `leftHand` 为空时补初始武器，通过 `addSkill()` 补 12 个初始技能，执行 `updateAllInfo()`，最后 `save()`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/OtherWindow.as` - 转生按钮进入 `RaceScene`，调用 `TitleList.updateTitleInfo("reborn")`，并将 `Player.caculate = 0`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/RaceScene.as` - 确认年龄/种族后调用 `Player.burn(chosenAge, chosenRace)`。

### React Targets

- `src/core/models/Player.ts` - `playerBurn()`、`updateAllInfo()`、`equipItem()`、`addSkill()`。
- `src/state/GameContext.tsx` - `DO_REBIRTH` reducer 分支、转生后保存副作用、转生称号事件。
- `scripts/assertRebirthSoftResetPlayerStateParity.mjs` - 本卡 dedicated guard。
- `package.json` - `assert:rebirth-soft-reset-player-state` 脚本。

### Expected Behavior

- 转生后重算：`age`、`race`、`lv = 1`、`basicStatus`、`caculate = 0`，并重新计算 `skillStatus` / `equipStatus` 派生值。
- 转生后保留：`playerName`、`gold`、`xp`、`ap`、`apCost`、`storeLv`、`BAGMAX`、`PETMAX`、所有装备槽、`itemList`、`skillList`、`equipSkillList`、`pet`、`petList`、`title`、`titleList`。
- 只有 `leftHand` 为空时才补 AS3 初始武器；已有左手装备时不覆盖。
- 12 个 AS3 初始技能只补缺失项，不清空已有技能，也不重置已有技能等级。
- `DO_REBIRTH` 完成后必须写入当前存档槽或默认槽，呼应 AS3 `Player.burn()` 结尾的 `save()`。

### Forbidden Behavior

- 用 `createInitialPlayerState()` 的空白结果替代转生前玩家状态。
- 转生时覆盖已有 `leftHand` 或清空其他装备槽。
- 把已有技能列表重置成正好 12 个初始技能。
- 清空背包、金币、AP、宠物、已装备技能、当前称号或称号进度。
- `DO_REBIRTH` 后只切回主场景但不触发保存写入。

### Red Guard Contract

新增并注册 `npm run assert:rebirth-soft-reset-player-state`。首轮运行应证明当前实现会丢失或覆盖：

- 装备槽、背包物品、金币、XP、AP、AP 成本、商店等级、背包/宠物容量。
- 宠物、宠物列表、技能列表、已有技能等级、已装备技能。
- 当前称号选择和称号进度。
- `leftHand` 非空时仍被初始武器覆盖。
- `DO_REBIRTH` 后未写入保存。

### Acceptance Tests

- Dedicated: `npm run assert:rebirth-soft-reset-player-state`
- Adjacent: `npm run assert:start-burn-save`
- Adjacent: `npm run assert:title-state-ownership`
- Adjacent: `npm run assert:title-data-save-parity`
- Adjacent: `npm run assert:growth-skill-protection`
- Adjacent: `npm run assert:equipment-ownership`
- Adjacent: `npm run assert:save-persistence`
- Always run: `npx tsc -b`

### Manual Smoke Scenario

1. 使用已有角色准备金币、AP、背包物品、装备、宠物、技能进度、已装备技能和称号。
2. 年龄达到 20 后触发转生，重新选择年龄和种族。
3. 回到主场景后确认年龄/种族/等级/基础属性已刷新，装备、背包、技能进度、宠物和称号仍保留。
4. 刷新或重新打开存档，确认转生后的软重置状态已经保存。

## English

### Current Status

Guarded. AS3 rebirth is not a blank new-character reset. The rebirth button opens `RaceScene`, grants the reborn title progress, and sets `Player.caculate = 0`; after age/race confirmation, `Player.burn()` recalculates birth-related state while preserving accumulated equipment, inventory, currency, AP, pets, skills, equipped skills, and titles. React soft-reset preservation and post-rebirth save writes are guarded by `assert:rebirth-soft-reset-player-state`; the next step is browser smoke.

### Card Scope

This card only covers `DO_REBIRTH` / `playerBurn()` rebirth soft-reset state preservation and immediate post-rebirth save writes. It does not cover battle, map behavior, UI styling, save/load continuity, full import/export, or title-window presentation.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - `Player.burn()` sets `age`, `race`, `lv = 1`, calls `caculateInitStat()`, equips the starter weapon only when `leftHand` is empty, adds the 12 starter skills via `addSkill()`, runs `updateAllInfo()`, and calls `save()`.
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/OtherWindow.as` - the rebirth button opens `RaceScene`, calls `TitleList.updateTitleInfo("reborn")`, and sets `Player.caculate = 0`.
- `reference/as3/BOE-O/scripts/iPanel/iScene/RaceScene.as` - age/race confirmation calls `Player.burn(chosenAge, chosenRace)`.

### React Targets

- `src/core/models/Player.ts` - `playerBurn()`, `updateAllInfo()`, `equipItem()`, and `addSkill()`.
- `src/state/GameContext.tsx` - `DO_REBIRTH` reducer branch, save side effects after rebirth, and rebirth title events.
- `scripts/assertRebirthSoftResetPlayerStateParity.mjs` - dedicated guard for this card.
- `package.json` - `assert:rebirth-soft-reset-player-state` script.

### Expected Behavior

- Recalculate after rebirth: `age`, `race`, `lv = 1`, `basicStatus`, `caculate = 0`, and derived `skillStatus` / `equipStatus`.
- Preserve after rebirth: `playerName`, `gold`, `xp`, `ap`, `apCost`, `storeLv`, `BAGMAX`, `PETMAX`, all equipment slots, `itemList`, `skillList`, `equipSkillList`, `pet`, `petList`, `title`, and `titleList`.
- Add the AS3 starter weapon only when `leftHand` is empty; do not overwrite an existing left-hand item.
- Add only missing AS3 starter skills; do not clear existing skills or reset their levels.
- `DO_REBIRTH` must write the updated state to the active or fallback save slot, matching the final `save()` in AS3 `Player.burn()`.

### Acceptance Tests

- Dedicated: `npm run assert:rebirth-soft-reset-player-state`
- Adjacent: `npm run assert:start-burn-save`
- Adjacent: `npm run assert:title-state-ownership`
- Adjacent: `npm run assert:title-data-save-parity`
- Adjacent: `npm run assert:growth-skill-protection`
- Adjacent: `npm run assert:equipment-ownership`
- Adjacent: `npm run assert:save-persistence`
- Always run: `npx tsc -b`
