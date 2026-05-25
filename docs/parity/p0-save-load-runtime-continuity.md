# P0 Save/Load Runtime Continuity Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:save-load-runtime-continuity` 守住。下面的 Original Symptom 和 Red Guard Contract 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。下一步只剩浏览器可见 smoke。

### AS3 Source of Truth

- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iPanel/iScene/SaveScene.as`
- `../BOE-O/scripts/iPanel/iScene/MainScene.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iAllInfo/AllInfoInnerPanel.as`
- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iData/RaceList.as`
- `../BOE-O/scripts/iData/iItem/Equipment.as`
- `../BOE-O/scripts/iData/iMonster/Monster.as`
- `../BOE-O/scripts/iData/iMonster/Boss.as`

### React Targets

- `src/core/systems/SaveSystem.ts`
- `src/core/utils/Base64.ts`
- `src/state/GameContext.tsx`
- `src/state/actions.ts`
- `src/core/types.ts`
- `src/core/systems/SystemConfig.ts`
- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/components/scenes/SaveScene.tsx`

### Original Symptom

修复前的 React 问题是：读取存档后，玩家选择的非人类种族会回退为“人类”；同时存档里的日志和物品过滤开关会从 `true` 读成 `false`，导致战斗日志被 `shouldDisplayLog()` 过滤，装备掉落被 `shouldKeepDroppedItem()` 拒绝，挂机战斗看起来不再获得装备收益。

修复前 React 也没有按 AS3 语义把每 60 次战斗 tick 自动保存回当前存档槽。`BATTLE_TICK` 虽然有保存分支，但写入隐藏的 `auto` 槽；`GameState` 没有记录当前 `SaveScene.slot`，所以玩家在 `slot1`/`slot2`/`slot3` 中读取或新建后，原槽不会像 AS3 一样自动刷新。

### Reviewed Evidence

- AS3 `Player.save()` 写入 `@RACE:` 后接 `race.name`，并把 `battle`、`battleIntro`、`item*`、装备类型和 `sound` 等 toggle 写成 `true`/`false` 字符串。
- AS3 `Player.load()` 按 `RaceList.list[_].name` 恢复 `Player.race`，并按字符串 `"true"` / `"false"` 恢复 `Global.*_toggle`。
- AS3 `SaveScene.as` 读取旧槽时设置 `SaveScene.slot = "slot" + num`，调用 `Player.load()` 后创建新的 `MainScene`。
- AS3 `MainScene.as` 创建新的 `AllInfoPanel` 后立即创建 `Battle` 并调用 `battle.init()`；旧日志面板会随场景重建，但后续遭遇、伤害、奖励日志必须继续出现。
- AS3 `Battle.run()` 每 500ms 执行，递增 `Player.caculate`，并在 `Player.caculate % 60 == 0` 时调用 `Player.save()`，保存目标就是当前 `SaveScene.slot`。
- AS3 `Battle.giveTrophy()` 调用 `Player.addExp()`、`Player.addMoney()`、`monster.dropItem()` 和 `monster.dropPet()`；`Monster.dropItem()`/`Boss.dropItem()` 依赖保存恢复后的全局掉落 toggle 决定是否加入背包或转金币。
- 修复前 React `SaveSystem.deserializeSave()` 用 `RaceList.find(r => r.name === raceName) ?? RaceList[0]`，当中文 race name 经 Base64 往返变成损坏字符时会静默回退到“人类”。
- 修复前 React `SaveSystem.deserializeSave()` 读取 toggle 时只接受 `val === '1'`，但 `serializeSave()` 写出的是 `true` / `false`，因此读取后 `battle_toggle`、`battleIntro_toggle`、`item_toggle`、`item1_toggle` 等会变成 `false`。
- 修复前 React `GameContext.tsx` `BATTLE_TICK` 在 `result.shouldSave` 时写入 `localSave(..., 'auto', ...)`，不是当前读取/新建的槽位。

### Expected Behavior

- 保存和读取必须保留 AS3 `@RACE:` 中的中文种族名；非人类角色读取后仍保持原先选择的种族。
- `undeath` 兼容分支需要保留，未知种族不应静默伪装成“人类”并掩盖存档解析错误。
- `@GLOBAL:` 中的 `true` / `false` toggle 必须按 AS3 恢复，读取后日志、物品质量、武器/防具类型和声音开关保持玩家保存时的值。
- 读取存档进入主场景后，新的遭遇日志、伤害日志、奖励日志和掉落日志继续按开关显示。
- 装备掉落在开关允许时继续加入背包并更新 loot 统计；开关禁止或背包满时才按 AS3 逻辑转金币。
- 自动保存必须对应 AS3 `Player.caculate % 60 == 0`，并保存回当前槽位，而不是一个玩家无法从存档界面看到的隐藏槽。

### Forbidden Behavior

- 因编码损坏或名称不匹配而静默回退到 `RaceList[0]`。
- 把所有 `true` / `false` toggle 当作 `false`。
- 用隐藏 `auto` 槽替代 AS3 当前槽自动保存。
- 只验证 `PLAYER_BURN` 种族正确，却不验证 `serializeSave()` / `deserializeSave()` 往返后的种族正确。
- 只验证普通战斗奖励，不验证读取存档后的 config 仍允许日志和装备掉落。

### State Ownership

- `SaveSystem.ts` 负责 AS3 存档 DSL、编码和反序列化兼容。
- `GameContext.tsx` 负责当前存档槽、读取后的 battle 重建、日志分发、loot 合并和自动保存触发。
- `SystemConfig.ts` 负责读取后 config 对日志与掉落过滤的实际消费。
- `Battle.ts` / `Monster.ts` 继续拥有奖励、掉落和 loot 统计语义，不应在 UI 层补假日志或假掉落。

### Acceptance Tests

- Needed: `npm run assert:save-load-runtime-continuity`
- Existing adjacent: `npm run assert:start-character-age`
- Existing adjacent: `npm run assert:map-selection`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:system-window`
- Always run: `npx tsc -b`

`assert:save-load-runtime-continuity` should cover:

- `serializeSave()` / `deserializeSave()` preserves every `RaceList` race name, including non-human Chinese names.
- Saved `true` / `false` config toggles round-trip without changing truthiness.
- A loaded config still allows `shouldDisplayLog(config, 'battle')` and `shouldDisplayLog(config, 'item')` when the saved toggles were enabled.
- A loaded config still lets an allowed equipment drop pass `shouldKeepDroppedItem()`.
- `LOAD_GAME` rebuilds a `Battle` with the restored player, map, and config, then subsequent `BATTLE_TICK` can emit logs and loot.
- Auto-save writes to the current active slot every 60 battle ticks.

### Manual Smoke Scenario

1. Start a new character with a non-human race, save in `slot1`, then read `slot1`.
2. Confirm the player info panel still shows the chosen race instead of “人类”.
3. Keep battle running after load and confirm new encounter, damage, reward, and item-drop logs appear.
4. Let battle defeat enough monsters to produce equipment drops; confirm allowed drops can enter the bag and loot counters change.
5. Wait at least 60 battle ticks, refresh or return to the save scene, and confirm `slot1` metadata/state changed without using a hidden `auto` slot.

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:save-load-runtime-continuity`. The Original Symptom and Red Guard Contract below remain as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again. The next step is browser-visible smoke only.

### AS3 Source of Truth

- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iPanel/iScene/SaveScene.as`
- `../BOE-O/scripts/iPanel/iScene/MainScene.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iAllInfo/AllInfoInnerPanel.as`
- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iData/RaceList.as`
- `../BOE-O/scripts/iData/iItem/Equipment.as`
- `../BOE-O/scripts/iData/iMonster/Monster.as`
- `../BOE-O/scripts/iData/iMonster/Boss.as`

### React Targets

- `src/core/systems/SaveSystem.ts`
- `src/core/utils/Base64.ts`
- `src/state/GameContext.tsx`
- `src/state/actions.ts`
- `src/core/types.ts`
- `src/core/systems/SystemConfig.ts`
- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/components/scenes/SaveScene.tsx`

### Original Symptom

Before the repair, React had this issue: after loading a save, a non-human selected race fell back to Human. Saved log and item filter toggles also round-tripped from `true` to `false`, so `shouldDisplayLog()` hid battle logs and `shouldKeepDroppedItem()` rejected equipment drops. Idle battle therefore appeared to stop producing equipment rewards after load.

Before the repair, React also did not match the AS3 current-slot auto-save behavior. `BATTLE_TICK` had a save branch, but it wrote to a hidden `auto` slot. `GameState` did not remember the active `SaveScene.slot`, so loading or creating `slot1`/`slot2`/`slot3` did not auto-refresh that same slot like AS3 does.

### Reviewed Evidence

- AS3 `Player.save()` writes `@RACE:` followed by `race.name`, and writes `battle`, `battleIntro`, `item*`, equipment-type toggles, and `sound` as `true`/`false` strings.
- AS3 `Player.load()` restores `Player.race` by matching `RaceList.list[_].name`, and restores `Global.*_toggle` from string `"true"` / `"false"`.
- AS3 `SaveScene.as` sets `SaveScene.slot = "slot" + num`, calls `Player.load()`, then creates a new `MainScene`.
- AS3 `MainScene.as` creates a new `AllInfoPanel`, then creates `Battle` and calls `battle.init()`. The old log panel is reset by scene construction, but new encounter, damage, and reward logs must continue.
- AS3 `Battle.run()` executes every 500ms, increments `Player.caculate`, and calls `Player.save()` when `Player.caculate % 60 == 0`. The save target is the current `SaveScene.slot`.
- AS3 `Battle.giveTrophy()` calls `Player.addExp()`, `Player.addMoney()`, `monster.dropItem()`, and `monster.dropPet()`. `Monster.dropItem()` / `Boss.dropItem()` rely on restored global drop toggles.
- React `SaveSystem.deserializeSave()` uses `RaceList.find(r => r.name === raceName) ?? RaceList[0]`, so a corrupted Chinese race name silently becomes Human.
- React `SaveSystem.deserializeSave()` treats only `val === '1'` as true, while `serializeSave()` writes `true` / `false`; loaded `battle_toggle`, `battleIntro_toggle`, `item_toggle`, `item1_toggle`, and similar flags become false.
- React `GameContext.tsx` saves to `localSave(..., 'auto', ...)` on `result.shouldSave`, not to the active load/new-game slot.

### Expected Behavior

- Save/load preserves the Chinese AS3 race name in `@RACE:`; non-human characters remain the selected race after load.
- Keep the `undeath` compatibility branch, and do not silently mask unknown race parsing as Human.
- `@GLOBAL:` `true` / `false` toggles restore exactly, preserving log, quality, equipment-type, and sound settings.
- After loading a save into the main scene, new encounter, damage, reward, and item-drop logs continue according to the restored toggles.
- Equipment drops enter the bag and update loot stats when saved toggles allow them; only disabled filters or full bags convert them to gold.
- Auto-save follows AS3 `Player.caculate % 60 == 0` and writes to the current active slot, not an invisible replacement slot.

### Forbidden Behavior

- Falling back to `RaceList[0]` when encoding or name matching fails.
- Parsing all `true` / `false` toggles as false.
- Replacing current-slot auto-save with a hidden `auto` slot.
- Testing only `PLAYER_BURN` race selection without save/load round-trip coverage.
- Testing only ordinary battle rewards without a loaded config consuming log and drop toggles.

### State Ownership

- `SaveSystem.ts` owns the AS3 save DSL, encoding, and deserialization compatibility.
- `GameContext.tsx` owns the active save slot, post-load battle rebuild, log dispatch, loot merge, and auto-save trigger.
- `SystemConfig.ts` owns real consumption of restored config for logs and drop filters.
- `Battle.ts` / `Monster.ts` keep reward, drop, and loot accounting semantics; UI must not fake missing logs or drops.

### Acceptance Tests

- Needed: `npm run assert:save-load-runtime-continuity`
- Existing adjacent: `npm run assert:start-character-age`
- Existing adjacent: `npm run assert:map-selection`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:system-window`
- Always run: `npx tsc -b`

`assert:save-load-runtime-continuity` should cover:

- `serializeSave()` / `deserializeSave()` preserves every `RaceList` race name, including non-human Chinese names.
- Saved `true` / `false` config toggles round-trip without changing truthiness.
- A loaded config still allows `shouldDisplayLog(config, 'battle')` and `shouldDisplayLog(config, 'item')` when saved toggles were enabled.
- A loaded config still lets an allowed equipment drop pass `shouldKeepDroppedItem()`.
- `LOAD_GAME` rebuilds a `Battle` with the restored player, map, and config, then subsequent `BATTLE_TICK` can emit logs and loot.
- Auto-save writes to the current active slot every 60 battle ticks.

### Manual Smoke Scenario

1. Start a new character with a non-human race, save in `slot1`, then load `slot1`.
2. Confirm the player info panel still shows the chosen race instead of Human.
3. Keep battle running after load and confirm new encounter, damage, reward, and item-drop logs appear.
4. Defeat enough monsters to produce equipment drops; confirm allowed drops can enter the bag and loot counters change.
5. Wait at least 60 battle ticks, refresh or return to the save scene, and confirm `slot1` metadata/state changed without using a hidden `auto` slot.
