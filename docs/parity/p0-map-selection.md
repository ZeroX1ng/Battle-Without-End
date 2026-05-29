# P0 Map Selection Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:map-selection` 守住。下面的 Current Symptom 保留为原始回归场景说明；后续只在 guard 变红或出现新地图切换/默认地图症状时重新打开。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iMap/MapList.as`
- `reference/as3/BOE-O/scripts/iData/iMap/Map.as`
- `reference/as3/BOE-O/scripts/iData/iMap/MapData.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSystem/iMap/MapPanel.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSystem/iMap/MapCell.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iGlobal/Global.as`

### React Targets

- `src/core/data/mapData.ts`
- `src/core/models/Map.ts`
- `src/components/windows/MapWindow.tsx`
- `src/state/GameContext.tsx`
- `src/core/systems/SaveSystem.ts`

### Current Symptom

地图选择不可见或不可确认，当前默认地图来源不清楚；战斗使用哪个地图、怪物池和奖励倍率无法从界面上确认。

### Expected Behavior

- `MapList.as` 是地图表唯一来源，必须保留 `name`、`realName`、`x`、`y`、`modifier`、`monsterList`、`petList` 和列表顺序。
- 默认地图必须能追溯到 AS3 启动或存档加载流程。
- 地图窗口必须展示当前地图和可切换地图，点击后更新全局地图/战斗地图。
- 切换地图后，下一只怪物、掉落宠物池、经验金币倍率都来自新地图。
- 存档和读档保留 AS3 map name，而不是 UI 显示名或临时 id。

### Forbidden Behavior

- 通过怪物 CP 范围重新生成地图怪物池。
- 丢弃 `monsterList` 或 `petList` 中影响概率的重复项。
- 地图 UI 显示一个地图，但 `Battle.map` 使用另一个地图。
- 存档时写入 `unknown` 或 React 自创地图名。

### State Ownership

- AS3 的 `Global.map` 在 React 中对应当前 game/battle map。
- `mapData.ts` 只镜像静态表。
- `Map.ts` 负责根据地图表取怪物、Boss、平均 CP 和奖励倍率。
- `GameContext.tsx` 的 `MAP_SWITCH` 负责切换当前 battle map、刷新怪物、写日志和保持存档一致。

### Acceptance Tests

- Existing: `npm run assert:map-data`
- Existing: `npm run assert:monster-reward`
- Needed: `npm run assert:map-selection`
- Always run: `npx tsc -b`

`assert:map-selection` 应覆盖：

- 初始状态的默认地图等于 AS3 默认地图。
- `MAP_SWITCH` 后 `battle.map.mapData.name` 等于目标 AS3 map name。
- 切换后新怪物从目标地图 `monsterList` 中生成。
- 保存字符串中的 map 字段使用 AS3 map name。

### Manual Smoke Scenario

1. 新开游戏，打开地图窗口。
2. 确认当前地图有明确标识。
3. 切换到另一个地图，观察日志或当前地图显示。
4. 等待下一场战斗，确认怪物和奖励倍率来自新地图。
5. 保存并读取，确认地图保持不变。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:map-selection`. The Current Symptom below remains as original regression context; reopen it only if the guard turns red or a new map-switch/default-map symptom appears.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iMap/MapList.as`
- `reference/as3/BOE-O/scripts/iData/iMap/Map.as`
- `reference/as3/BOE-O/scripts/iData/iMap/MapData.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSystem/iMap/MapPanel.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSystem/iMap/MapCell.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iGlobal/Global.as`

### React Targets

- `src/core/data/mapData.ts`
- `src/core/models/Map.ts`
- `src/components/windows/MapWindow.tsx`
- `src/state/GameContext.tsx`
- `src/core/systems/SaveSystem.ts`

### Current Symptom

Map selection is not visible or confirmable, and the default map source is unclear. The player cannot verify which map, monster pool, or reward modifier battle is using.

### Expected Behavior

- `MapList.as` is the only map table source. Preserve `name`, `realName`, `x`, `y`, `modifier`, `monsterList`, `petList`, and order.
- The default map must be traceable to AS3 startup or save-load flow.
- The map window shows the current map and switchable maps; clicking updates the global/battle map.
- After switching maps, the next monster, pet drop pool, exp, and gold modifiers come from the new map.
- Save/load uses the AS3 map name, not a UI display name or generated React id.

### Forbidden Behavior

- Regenerating map monster pools from monster CP ranges.
- Removing duplicate `monsterList` or `petList` entries that affect probability.
- Showing one map in UI while `Battle.map` uses another.
- Saving `unknown` or a React-invented map name.

### State Ownership

- AS3 `Global.map` corresponds to current game/battle map in React.
- `mapData.ts` mirrors static table data only.
- `Map.ts` owns monster, boss, average CP, and reward modifier logic from map data.
- `GameContext.tsx` `MAP_SWITCH` switches current battle map, refreshes monster state, writes logs, and keeps save data consistent.

### Acceptance Tests

- Existing: `npm run assert:map-data`
- Existing: `npm run assert:monster-reward`
- Needed: `npm run assert:map-selection`
- Always run: `npx tsc -b`

`assert:map-selection` should cover:

- Initial state default map equals the AS3 default.
- After `MAP_SWITCH`, `battle.map.mapData.name` equals the target AS3 map name.
- After switching, new monsters come from the target map `monsterList`.
- Save strings write the AS3 map name in the map field.

### Manual Smoke Scenario

1. Start a new game and open the map window.
2. Confirm the current map is clearly marked.
3. Switch to another map and observe log or current map display.
4. Wait for the next battle and confirm monster/reward modifier comes from the new map.
5. Save and load, then confirm the map persists.
