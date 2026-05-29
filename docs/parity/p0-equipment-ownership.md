# P0 Equipment Ownership Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:equipment-ownership` 守住。下面的 Current Symptom 保留为原始回归场景说明；后续只在 guard 变红或出现新装备所有权症状时重新打开。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iData/iItem/Equipment.as`
- `reference/as3/BOE-O/scripts/iData/iItem/Weapon.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as`
- `reference/as3/BOE-O/scripts/iPanel/iCell/EquipmentCell.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iEquip/EquipCell.as`

### React Targets

- `src/core/models/Player.ts`
- `src/core/models/Equipment.ts`
- `src/components/windows/EquipWindow.tsx`
- `src/state/GameContext.tsx`

### Current Symptom

切换装备后，脱下的装备像是直接复制了一份进入仓库/背包，导致同一件装备可能同时出现在装备槽和物品列表，或物品数量异常增加。

### Expected Behavior

- 装备是一个有归属的对象，只能位于装备槽、背包、商店或掉落结果中的一个位置。
- 从背包装备物品时，该物品从 `itemList` 移除，并进入对应装备槽。
- 如果装备槽已有物品，被替换下来的物品最多回到背包一次，并受背包容量限制。
- 卸下装备时，装备槽清空，原装备作为同一个对象进入背包；不能克隆出额外副本。
- 装备、卸下、替换后必须刷新装备属性、技能效果、战斗 live player 和相关窗口。

### Forbidden Behavior

- 装备切换时复制 `Equipment` 对象造成数量增加。
- 背包满时仍然卸下或替换装备。
- UI 本地维护装备状态，绕过 `Player.ts`。
- 装备属性更新后没有同步 `battle.playerState`。

### State Ownership

- `Player.ts` 负责 `itemList`、装备槽、`equipStatus` 和移动/替换语义。
- `GameContext.tsx` 只通过 `EQUIP_ITEM`、`UNEQUIP_ITEM` 等动作写入玩家状态，并用 `withBattlePlayer(...)` 同步 live battle。
- `EquipWindow.tsx` 只发出用户意图，不复制装备对象。

### Acceptance Tests

- Existing: `npm run assert:equip-window`
- Existing: `npm run assert:equipment-data`
- Existing: `npm run assert:stat-list`
- Needed: `npm run assert:equipment-ownership`
- Always run: `npx tsc -b`

`assert:equipment-ownership` 应覆盖：

- 从背包装备一件武器后，背包数量减少 1，装备槽引用该物品。
- 替换同槽位装备后，旧装备只回到背包一次，新装备不再留在背包。
- 卸下装备后，装备槽为空，背包数量增加 1，不能出现重复引用或重复保存名。
- 背包满时，AS3 对应行为被保留，不允许静默复制或丢失装备。

### Manual Smoke Scenario

1. 准备两件同槽位装备。
2. 装备第一件，记录背包数量和装备槽。
3. 装备第二件，确认第一件只回背包一次。
4. 反复切换 5 次，确认物品总数不增长。
5. 开始战斗后切换装备，确认下一 tick 不回滚。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:equipment-ownership`. The Current Symptom below remains as original regression context; reopen it only if the guard turns red or a new equipment-ownership symptom appears.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iData/iItem/Equipment.as`
- `reference/as3/BOE-O/scripts/iData/iItem/Weapon.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as`
- `reference/as3/BOE-O/scripts/iPanel/iCell/EquipmentCell.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iEquip/EquipCell.as`

### React Targets

- `src/core/models/Player.ts`
- `src/core/models/Equipment.ts`
- `src/components/windows/EquipWindow.tsx`
- `src/state/GameContext.tsx`

### Current Symptom

After switching equipment, the unequipped item appears to be copied into inventory, so one item may exist in both an equipment slot and the item list, or item counts grow unexpectedly.

### Expected Behavior

- Equipment is an owned object that can exist in only one place: equipment slot, inventory, shop, or drop result.
- Equipping an inventory item removes it from `itemList` and places it into the target slot.
- If the target slot already has an item, the replaced item returns to inventory at most once and must respect bag capacity.
- Unequipping clears the slot and moves the same item object into inventory; it must not clone an extra copy.
- Equipment changes refresh equipment stats, skill effects, live battle player state, and related windows.

### Forbidden Behavior

- Copying `Equipment` objects during switch and increasing item count.
- Unequipping or replacing when the bag is full if AS3 would reject it.
- Keeping local equipment state in UI instead of using `Player.ts`.
- Updating equipment stats without syncing `battle.playerState`.

### State Ownership

- `Player.ts` owns `itemList`, equipment slots, `equipStatus`, and movement/replacement semantics.
- `GameContext.tsx` writes player state only through actions such as `EQUIP_ITEM` and `UNEQUIP_ITEM`, then syncs live battle with `withBattlePlayer(...)`.
- `EquipWindow.tsx` emits user intent only; it must not duplicate equipment objects.

### Acceptance Tests

- Existing: `npm run assert:equip-window`
- Existing: `npm run assert:equipment-data`
- Existing: `npm run assert:stat-list`
- Needed: `npm run assert:equipment-ownership`
- Always run: `npx tsc -b`

`assert:equipment-ownership` should cover:

- Equipping one weapon from inventory reduces inventory count by 1 and puts that object in the slot.
- Replacing same-slot equipment returns the old item to inventory exactly once and removes the new item from inventory.
- Unequipping clears the slot, increases inventory count by 1, and creates no duplicate references or duplicate save names.
- Full inventory preserves AS3 behavior and never silently copies or drops equipment.

### Manual Smoke Scenario

1. Prepare two items for the same slot.
2. Equip the first item and record inventory count and slot state.
3. Equip the second item and confirm the first returns once.
4. Repeat switching 5 times and confirm total item count does not grow.
5. Switch equipment during battle and confirm the next tick does not revert it.
