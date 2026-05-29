# P0 Start Burn Flow And Auto-Save Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:start-burn-save` 守住。下面的 Original Symptom 和 Red Guard Contract 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。下一步只剩浏览器可见 smoke。

### 卡片范围

这张卡只处理角色创建/重生时的 `Player.burn()` / `playerBurn()` 初始状态流程，以及创建完成后的即时自动存档。不处理种族/年龄选择 UI 本身（见 `p0-start-character-age.md`），也不处理完整存档槽、导入导出、读取后运行时连续性（分别见 `p0-save-persistence.md`、`p0-save-load-runtime-continuity.md`）。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - `burn()` 中初始属性、12 个初始技能、初始斧头装备和结尾 `save()` 调用。
- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - `equipItem()` / `unEquip()` 中装备槽、双手武器和 `updateSkillInfo()` / `updateEquipInfo()` 流程。
- `reference/as3/BOE-O/scripts/iPanel/iScene/RaceScene.as` - 角色确认后调用 `Player.burn()` 并进入主场景的流程。

### React Targets

- `src/core/models/Player.ts` - `playerBurn()`、`equipItem()`、`unequipItem()`、`updateSkillInfo()`、`updateEquipInfo()`。
- `src/state/GameContext.tsx` - `PLAYER_BURN`、`DO_REBIRTH`、`SAVE_GAME` reducer 分支与保存副作用。
- `src/core/systems/SaveSystem.ts` - 创建后写入持久化存储的目标 API。
- `src/state/actions.ts` - 与角色创建/存档相关的 action type。
- `package.json` / `scripts/assertStartBurnSaveParity.mjs` - 本卡新增或注册的 guard。

### Original Symptom

角色创建后没有自动存档，刷新页面会丢失新创建的角色。同时 `playerBurn()` 在初始化装备时绕过 `equipItem()` 的完整流程，直接写入 `leftHand`，容易漏掉旧槽清理、TWOHAND 双手处理、技能/装备状态刷新和重生时的旧副手清理。

### Red Guard Contract

修复代码前先新增并注册 `npm run assert:start-burn-save`。首次运行应至少暴露当前这些错误：

- `playerBurn()` 不应通过直接赋值 `leftHand` / `rightHand` 安装初始武器，而应走 `equipItem()`。
- `playerBurn()` 后初始斧头应进入 `leftHand`，`rightHand` 应为 `null`，且 `equipStatus` 包含斧头带来的属性加成。
- `playerBurn()` 后 `skillList` 应包含 AS3 初始 12 个技能，顺序和名称与 `Player.as` 一致。
- `DO_REBIRTH` 场景中，旧 `rightHand` 装备不应残留。
- `PLAYER_BURN` reducer 完成后必须写入当前槽或默认槽的持久化存档，不能刷新后丢失角色。

### Expected Behavior

- `Player.burn()` 对应的 React 创建流程结束后立即触发保存，与 AS3 `burn()` 末尾 `save()` 一致。
- 初始装备通过 `equipItem()` 完整执行：卸下旧槽位、处理 TWOHAND/ONEHAND/OFFHAND 分支、刷新技能状态、刷新装备状态。
- `PLAYER_BURN` action 在状态更新后触发持久化写入，保证新角色不会因页面刷新丢失。
- `DO_REBIRTH` 复用同一创建流程，不保留上一个角色的手部装备、派生属性或旧技能状态。

### Forbidden Behavior

- 角色创建后依赖用户手动保存才持久化。
- 在 `playerBurn()` 中直接改装备槽位来绕过 `equipItem()`。
- 为了让 UI 显示正确而临时补写 `equipStatus`，但没有走装备所有权流程。
- 在 `DO_REBIRTH` 后保留旧 `rightHand`、旧派生属性或旧技能状态。
- 在本卡里扩大到完整存档导入导出、读档后运行时连续性或种族/年龄 UI 修复。

### State Ownership

- `Player.ts` 的 `playerBurn()` 负责初始属性、技能、装备和派生状态生成。
- `equipItem()` / `unequipItem()` 是装备槽所有权的唯一入口，创建流程也不能绕过。
- `GameContext.tsx` 的 `PLAYER_BURN` 负责衔接状态更新和保存写入。
- `SaveSystem.ts` 负责将 reducer 产出的 React state 写入持久存储。

### Acceptance Tests

- Needed: `npm run assert:start-burn-save`
- Adjacent: `npm run assert:growth-skill-protection`
- Adjacent: `npm run assert:equipment-ownership`
- Adjacent: `npm run assert:save-persistence`（若该 guard 已存在）
- Always run: `npx tsc -b`

`assert:start-burn-save` 至少应覆盖：

- AS3 `Player.as` 中 `burn()` 的 12 个初始技能、初始武器和结尾 `save()` 调用已被 guard 明确读取。
- `playerBurn()` 后 `state.player.leftHand` 为 AS3 初始斧头，`state.player.rightHand === null`。
- `playerBurn()` 后 `equipStatus` 包含初始斧头的 qualityStat/basicStat/levelStat 加成。
- `playerBurn()` 后 `state.player.skillList.length === 12`，并包含全部 12 个初始技能。
- `DO_REBIRTH` 夹带旧副手装备的 fixture 在 `playerBurn()` 后清空旧 `rightHand`。
- `PLAYER_BURN` action 后，测试存储中存在新写入的存档数据。

### Manual Smoke Scenario

1. 清空 `localStorage`，新开游戏，选择人类、年龄 10 岁并确认开始。
2. 进入主场景后，确认角色已持有初始斧头，背包没有复制出的额外斧头。
3. 打开技能窗口，确认有 12 个初始技能。
4. 关闭标签页重新打开，确认角色仍存在，说明创建后自动存档生效。
5. 触发重生并选择不同种族，确认装备槽、派生属性和技能列表均来自新角色。

### 修复完成报告要求

- 列出实际读取的 AS3 文件和关键函数。
- 列出修改的 React/脚本文件。
- 说明 `assert:start-burn-save` 的 red/green 结果。
- 报告相邻 guard 与 `npx tsc -b` 结果。
- 明确是否完成浏览器可见 smoke；未做时说明环境限制。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:start-burn-save`. The Original Symptom and Red Guard Contract below remain as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again. The next step is browser-visible smoke only.

### Card Scope

This card only covers the `Player.burn()` / `playerBurn()` startup state flow during character creation or rebirth, plus immediate auto-save after creation. It does not cover the race/age selection UI itself (`p0-start-character-age.md`) or the full save-slot/import/load-continuity chain (`p0-save-persistence.md`, `p0-save-load-runtime-continuity.md`).

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - starter stats, 12 starter skills, starter axe equipment, and the final `save()` call in `burn()`.
- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - equipment slot, two-handed weapon, `updateSkillInfo()`, and `updateEquipInfo()` behavior in `equipItem()` / `unEquip()`.
- `reference/as3/BOE-O/scripts/iPanel/iScene/RaceScene.as` - confirming character creation, calling `Player.burn()`, and entering the main scene.

### React Targets

- `src/core/models/Player.ts` - `playerBurn()`, `equipItem()`, `unequipItem()`, `updateSkillInfo()`, and `updateEquipInfo()`.
- `src/state/GameContext.tsx` - `PLAYER_BURN`, `DO_REBIRTH`, and `SAVE_GAME` reducer branches and save side effects.
- `src/core/systems/SaveSystem.ts` - target API for writing persistent state after creation.
- `src/state/actions.ts` - character-creation and save-related action types.
- `package.json` / `scripts/assertStartBurnSaveParity.mjs` - guard registration for this card.

### Original Symptom

No automatic save occurs after character creation, so refreshing the page loses the new character. `playerBurn()` also bypasses the full `equipItem()` path by writing directly to `leftHand`, which can skip old-slot cleanup, TWOHAND handling, skill/equipment recalculation, and stale off-hand cleanup during rebirth.

### Red Guard Contract

Before production edits, add and register `npm run assert:start-burn-save`. Its first run should expose at least these failures:

- `playerBurn()` should not install starter weapons through direct `leftHand` / `rightHand` assignment; it should use `equipItem()`.
- After `playerBurn()`, the starter axe should be in `leftHand`, `rightHand` should be `null`, and `equipStatus` should include the axe bonuses.
- After `playerBurn()`, `skillList` should contain the 12 AS3 starter skills in AS3 order.
- In the `DO_REBIRTH` scenario, stale old `rightHand` equipment should not remain.
- After the `PLAYER_BURN` reducer completes, persistent save data should be written to the active slot or fallback slot.

### Expected Behavior

- The React creation flow corresponding to `Player.burn()` saves immediately, matching the AS3 `save()` call at the end of `burn()`.
- Starter equipment goes through the full `equipItem()` flow: unequip old slots, handle TWOHAND/ONEHAND/OFFHAND branches, refresh skill status, and refresh equipment status.
- `PLAYER_BURN` triggers a persistent write after state update so a new character survives refresh.
- `DO_REBIRTH` reuses the same creation path and does not preserve old hand equipment, derived stats, or stale skill state.

### Forbidden Behavior

- Requiring manual save before a newly created character is persisted.
- Bypassing `equipItem()` with direct equipment-slot writes in `playerBurn()`.
- Patching `equipStatus` only for display without using the equipment ownership flow.
- Keeping old `rightHand`, derived stats, or skill state after `DO_REBIRTH`.
- Mixing this card with full save import/export, load-continuity, or race/age UI repairs.

### State Ownership

- `Player.ts` `playerBurn()` owns starter stats, skills, equipment, and derived state.
- `equipItem()` / `unequipItem()` are the single ownership boundary for equipment slots, including startup equipment.
- `GameContext.tsx` `PLAYER_BURN` bridges state update and save writing.
- `SaveSystem.ts` writes reducer-produced React state to persistent storage.

### Acceptance Tests

- Needed: `npm run assert:start-burn-save`
- Adjacent: `npm run assert:growth-skill-protection`
- Adjacent: `npm run assert:equipment-ownership`
- Adjacent: `npm run assert:save-persistence` if that guard exists
- Always run: `npx tsc -b`

`assert:start-burn-save` should cover at least:

- AS3 `Player.as` `burn()` starter skills, starter weapon, and final `save()` call are explicitly read by the guard.
- After `playerBurn()`, `state.player.leftHand` is the AS3 starter axe and `state.player.rightHand === null`.
- After `playerBurn()`, `equipStatus` includes the starter axe qualityStat/basicStat/levelStat bonuses.
- After `playerBurn()`, `state.player.skillList.length === 12` with all starter skills present.
- A rebirth fixture with stale old off-hand equipment clears `rightHand` after `playerBurn()`.
- After the `PLAYER_BURN` action, test storage contains newly written save data.

### Manual Smoke Scenario

1. Clear `localStorage`, start a new game, choose Human at age 10, and confirm.
2. After entering the main scene, confirm the character holds the starter axe and no duplicated axe appears in inventory.
3. Open the skill window and confirm 12 starter skills are present.
4. Close and reopen the tab; confirm the character still exists.
5. Trigger rebirth with a different race and confirm equipment slots, derived stats, and skills come from the new character.

### Completion Report Requirements

- List the AS3 files and key functions actually read.
- List React/script files changed.
- Report the `assert:start-burn-save` red/green result.
- Report adjacent guards and `npx tsc -b`.
- State whether browser-visible smoke was performed; if not, explain the environment limit.
