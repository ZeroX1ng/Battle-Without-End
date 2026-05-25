# P0 Map Data And Model Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:map-data` 守住。下面的 Original Symptom 和 Red Guard Contract 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。下一步只剩浏览器可见 smoke。

### 卡片范围

这张卡只处理地图静态表和 `Map` 模型行为，不处理地图窗口可见性、点击切换流程或存档字段流转。`p0-map-selection.md` 已覆盖地图切换和 UI/存档链路；本卡是更底层的数据与模型修复卡。

### AS3 Source of Truth

- `../BOE-O/scripts/iData/iMap/MapList.as` - 16 张地图的 `x`、`y`、`name`、`realName`、`modifier`、`monsterList`、`petList`
- `../BOE-O/scripts/iData/iMap/MapData.as` - `monsterList` 和 `petList` 均为构造参数和实例字段
- `../BOE-O/scripts/iData/iMap/Map.as` - `averageCp:int`、`setAverageCp()` 和 `getBoss()` 行为

### React Targets

- `src/core/data/mapData.ts` - `MapList` 静态表
- `src/core/models/Map.ts` - `averageCp`、`setAverageCp()`、`getBoss()`
- `src/core/types.ts` - `MapData` 接口
- `scripts/assertMapDataParity.mjs` - 已有 guard，但必须按 AS3 纠正期望值
- `package.json` - 复用已有 `assert:map-data`

### Original Symptom

修复前 React 地图表和模型有 AS3 偏差：第 15 张地图 `Vaith` 在 AS3 中 `realName` 是 `神墓`，React 和当时的 map-data guard 仍使用 `神墟`。`Map.ts` 还包含 AS3 没有的空列表 fallback/guard，`MapData.petList` 在类型上是可选字段，后续地图/宠物池修复容易绕开 AS3 结构。

### Red Guard Contract

修复代码前先更正或扩展 `npm run assert:map-data`，让 guard 以 AS3 为准。首次运行应至少暴露当前这些错误：

- `MapList[14].name === "Vaith"` 时，`realName` 应为 `神墓`。
- `scripts/assertMapDataParity.mjs` 的 Vaith 期望值不得继续写 `神墟`。
- 每张地图的 `monsterList` 和 `petList` 顺序必须与 `MapList.as` 构造参数一致。
- `MapData.petList` 应为必填字段。
- `Map.getBoss()` 不应在空 monsterList 时 fallback 到其他怪物。
- `Map.setAverageCp()` 不应通过 React 自创空列表守卫掩盖 AS3 行为；如需处理 JS 数值边界，必须在注释中说明与 AS3 `int` 语义的差异。

### Expected Behavior

- `MapList` 16 张地图数量、顺序、坐标、英文名、中文名、`modifier` 与 AS3 完全一致。
- `monsterList` 和 `petList` 保留 AS3 顺序，不去重、不排序、不用 CP 区间重建。
- `Vaith.realName` 为 `神墓`。
- `MapData.petList` 在 React 类型中为必填字段。
- `Map.averageCp` 对齐 AS3 的 `int` 结果语义；修复时要明确 JS/TS 中是否需要 `Math.trunc()`。
- `Map.getBoss()` 只从当前 `mapData.monsterList` 中随机创建 Boss。

### Forbidden Behavior

- 用 React 当前表或 guard 当前值反推 AS3 正确值。
- 自行翻译、润色或替换 `realName`。
- 删除 `monsterList` / `petList` 中的重复项。
- 让 UI 组件绕过 `Map` 模型直接计算业务字段。
- 在本卡修复里混入地图窗口布局、点击交互或存档读写修复。

### State Ownership

- `mapData.ts` 是 AS3 `MapList.as` 的静态镜像。
- `Map.ts` 持有 `MapData` 并负责平均 CP 与 Boss 创建。
- `Battle.map` 和地图切换链路消费 `Map` 实例，但本卡不改变 `MAP_SWITCH` 行为。
- `MapWindow.tsx` 只展示模型/状态提供的数据，不拥有地图业务计算。

### Acceptance Tests

- Existing, must correct/extend: `npm run assert:map-data`
- Adjacent: `npm run assert:map-selection`
- Adjacent: `npm run assert:monster-reward`
- Encoding guard: `npm run assert:source-encoding`
- Always run: `npx tsc -b`

`assert:map-data` 至少应覆盖：

- 16 张地图的数量和顺序。
- 每张地图的 `x`、`y`、`name`、`realName`、`modifier`。
- 每张地图的 `monsterList` 名称和顺序。
- 每张地图的 `petList` 名称和顺序。
- `Vaith.realName === "神墓"`。
- `MapData.petList` 必填。
- `Map.getBoss()` 不含非 AS3 fallback。

### Manual Smoke Scenario

1. 打开地图窗口并滚动到 `Vaith`。
2. 确认中文名显示为 `神墓`。
3. 切换到 `Vaith`，确认日志使用 `神墓`。
4. 等待下一场战斗，确认怪物池来自 Vaith 的 AS3 `monsterList`。
5. 切换其他地图，抽查中文名、怪物池和宠物池没有被重新排序或替换。

### 修复完成报告要求

- 列出实际读取的 AS3 文件。
- 列出修改的 React/脚本文件。
- 说明 `assert:map-data` 的 red/green 结果。
- 明确是否做了浏览器可见 smoke；未做时说明环境限制。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:map-data`. The Original Symptom and Red Guard Contract below remain as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again. The next step is browser-visible smoke only.

### Card Scope

This card only covers static map data and `Map` model behavior. It does not cover map-window visibility, click-to-switch flow, or save-field continuity. `p0-map-selection.md` already covers switching and the UI/save chain; this card is the lower-level data/model repair card.

### AS3 Source of Truth

- `../BOE-O/scripts/iData/iMap/MapList.as` - all 16 maps' `x`, `y`, `name`, `realName`, `modifier`, `monsterList`, and `petList`
- `../BOE-O/scripts/iData/iMap/MapData.as` - `monsterList` and `petList` as constructor parameters and instance fields
- `../BOE-O/scripts/iData/iMap/Map.as` - `averageCp:int`, `setAverageCp()`, and `getBoss()`

### React Targets

- `src/core/data/mapData.ts` - `MapList` static table
- `src/core/models/Map.ts` - `averageCp`, `setAverageCp()`, and `getBoss()`
- `src/core/types.ts` - `MapData` interface
- `scripts/assertMapDataParity.mjs` - existing guard, but its expectations must be corrected to AS3
- `package.json` - reuse existing `assert:map-data`

### Original Symptom

Before the repair, React map data and model behavior deviated from AS3. The 15th map `Vaith` has `realName` `神墓` in AS3, while React data and the then-existing map-data guard still used `神墟`. `Map.ts` also contained empty-list guards/fallbacks that AS3 does not have, and `MapData.petList` was optional in TypeScript, making future map/pet-pool repairs easy to route around the AS3 structure.

### Red Guard Contract

Before production edits, correct or extend `npm run assert:map-data` so it uses AS3 as the source of truth. Its first run should expose at least these current failures:

- When `MapList[14].name === "Vaith"`, `realName` should be `神墓`.
- `scripts/assertMapDataParity.mjs` must not keep expecting `神墟` for Vaith.
- Every map's `monsterList` and `petList` order must match the `MapList.as` constructor arguments.
- `MapData.petList` should be required.
- `Map.getBoss()` should not fallback to unrelated monsters on an empty `monsterList`.
- `Map.setAverageCp()` should not hide AS3 behavior with a React-only empty-list guard; if JS numeric edges need handling, document how they relate to AS3 `int` semantics.

### Expected Behavior

- `MapList` preserves AS3 count, order, coordinates, English names, Chinese names, and `modifier` values for all 16 maps.
- `monsterList` and `petList` preserve AS3 order with no dedupe, sorting, or CP-range reconstruction.
- `Vaith.realName` is `神墓`.
- `MapData.petList` is required in the React type.
- `Map.averageCp` aligns with AS3 `int` result semantics; decide explicitly whether JS/TS needs `Math.trunc()`.
- `Map.getBoss()` creates a Boss only from the current `mapData.monsterList`.

### Forbidden Behavior

- Deriving AS3 truth from current React data or the current guard expectation.
- Translating, polishing, or replacing `realName` manually.
- Removing duplicate `monsterList` / `petList` entries.
- Letting UI components bypass the `Map` model for business calculations.
- Mixing in map-window layout, click interaction, or save/load repairs in the same card.

### State Ownership

- `mapData.ts` is the static mirror of AS3 `MapList.as`.
- `Map.ts` owns `MapData`, average CP calculation, and Boss creation.
- `Battle.map` and the map-switching chain consume `Map` instances, but this card does not change `MAP_SWITCH`.
- `MapWindow.tsx` displays model/state data and does not own map business calculations.

### Acceptance Tests

- Existing, must correct/extend: `npm run assert:map-data`
- Adjacent: `npm run assert:map-selection`
- Adjacent: `npm run assert:monster-reward`
- Encoding guard: `npm run assert:source-encoding`
- Always run: `npx tsc -b`

`assert:map-data` should cover at least:

- 16-map count and order.
- Each map's `x`, `y`, `name`, `realName`, and `modifier`.
- Each map's `monsterList` names and order.
- Each map's `petList` names and order.
- `Vaith.realName === "神墓"`.
- Required `MapData.petList`.
- No non-AS3 fallback in `Map.getBoss()`.

### Manual Smoke Scenario

1. Open the map window and scroll to `Vaith`.
2. Confirm the Chinese name is `神墓`.
3. Switch to `Vaith` and confirm the log uses `神墓`.
4. Wait for the next battle and confirm the monster pool comes from Vaith's AS3 `monsterList`.
5. Switch through several other maps and spot-check that names, monster pools, and pet pools were not reordered or replaced.

### Completion Report Requirements

- List the AS3 files actually read.
- List React/script files changed.
- Report the `assert:map-data` red/green result.
- State whether browser-visible smoke was performed; if not, explain the environment limit.
