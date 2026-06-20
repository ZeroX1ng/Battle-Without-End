# P1 Shop Stock Progression Product Override

Last updated: 2026-06-19

Current status: Needs product decision

## Chinese

### 当前状态

本卡来自 2026-06-19 装备商店/赌博审阅。当前 React 商店售卖和赌博装备的生成公式基本匹配 AS3：都用基础 `combatPower`、`luck` 和随机 `ratio` 生成装备，且新装备默认强化等级 `level = 0`。所以“角色已经转生很多次、能挂机 1000+ 战力地图，但商店/赌博仍刷新低等级装备”的体验问题，不应直接判定为 AS3 parity bug。

这更像产品体验覆盖：继续保留 AS3 内部 `combatPower` 语义，同时为商店/赌博新增一个明确的“库存成长目标”或“装备后实战力估算”输入。

### 玩家可见症状

- 已多次转生、实战可以挂机高 CP 地图时，商店售卖和赌博刷新仍经常出现低等级、低成长感装备。
- 玩家会期待商店库存跟随当前角色成长、地图推进或装备后实际强度提升。
- 当前 UI 没有说明这些装备是按 AS3 基础 CP 刷新，而不是按装备后实战力、历史最高地图或转生次数刷新。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/ShopPanel.as` - 售卖装备 ratio：`Math.random() * 3 * (1 + Player.luck / 400) * (1 + Player.combatPower / 1000)`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/ShopPanel.as` - 赌博装备 ratio：`Math.random() * 6 * (1 + Player.luck / 200) * (1 + Player.combatPower / 700)`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iShop/GambleCell.as` - 赌博价格使用 `10000 + Math.random() * 100000 * (1 + Player.combatPower / 700)`。
- `reference/as3/BOE-O/scripts/iData/iItem/Equipment.as` - 新装备构造默认 `level = 0`，强化等级不是商店直接随成长生成。
- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - `combatPower` 使用 `basicStatus + skillStatus + apCost`，不包含 `equipStatus`。

### React Targets

- `src/state/GameContext.tsx` - `generateShopState(playerState)` 当前用 `getCombatPower(playerState)`、`luck` 和 AS3 ratio 生成售卖/赌博装备。
- `src/core/models/Equipment.ts` - 新装备默认 `level = 0`，并用传入 `combatPower` 调整品质生成。
- `src/core/models/Player.ts` - `getCombatPower()` 保持 AS3 基础 CP，不含装备。
- `src/components/windows/ShopWindow.tsx` - 显示商店/赌博刷新结果和价格。
- `docs/parity/playtest-followups-2026-06-08.md#p1-combat-power-equipless-readout` - 已记录基础 CP 与装备实战力脱钩属于 product decision 边界。

### Product Boundary

- 不要把 `equipStatus` 直接加进 `getCombatPower()` 并称为 parity 修复。这个函数已被怪物称号、掉落、价格、地图风险等 AS3 规则复用。
- 如果 Dear Master 决定改善商店成长感，应新增独立 helper，例如 `getShopStockPower()`、`getEquipmentInclusivePower()` 或 `getProgressionStockPower()`，只供商店/赌博库存刷新使用。
- override 输入可以考虑：基础 CP、装备后攻击/防御/护甲、转生次数、历史最高可挂机地图、当前地图 CP、玩家 luck。具体公式必须单独 guard，不能影响 AS3 `combatPower`。

### Expected Behavior

在产品 override 被批准后：

- 商店售卖和赌博库存的目标强度能随角色实际成长提升。
- AS3 `combatPower` 语义保持不变，仍供原始规则使用。
- UI 或文档能清楚区分“AS3 基础 CP”和“商店库存成长目标/实战估算”。
- 新公式有 deterministic fixture guard，证明高成长角色的库存下限/中位数显著高于低成长角色，同时不破坏现有 `assert:shop-window`。

### Forbidden Behavior

- 不要直接替换 `getCombatPower()`。
- 不要把装备强化等级默认改成高等级来掩盖 ratio 问题，除非 AS3/product card 明确批准。
- 不要让商店 override 影响怪物 CP 颜色、称号触发、掉落经验、金币或战斗公式。
- 不要把本卡和 `P1-COMBAT-POWER-EQUIPLESS-READOUT` 合并成一个大改。

### Red Guard Contract

先新增一个 product-boundary guard，例如 `scripts/assertShopStockProgressionOverride.mjs`，并在 `package.json` 暴露 `assert:shop-stock-progression-override`：

- 证明 AS3 ratio 公式仍有可追溯实现或注释，不被静默删除。
- 证明 `getCombatPower()` 不包含 `equipStatus`。
- 如果 override 已实现，构造低成长和高成长 fixture，固定随机序列后比较商店售卖/赌博装备生成的目标强度或品质分布。
- 证明 override 只被 `generateShopState` 或明确商店 helper 消费，不被怪物、掉落、战斗称号等 AS3 CP 路径消费。

### Acceptance Tests

- Product guard: `npm run assert:shop-stock-progression-override`
- Existing shop guard: `npm run assert:shop-window`
- Existing CP boundary guard if present/added: `npm run assert:combat-power-readout-parity`
- Nearby stat guard: `npm run assert:stat-list`
- Nearby equipment guard: `npm run assert:equipment-data`
- Always: `npx tsc -b`

### Manual Smoke

准备两个存档或 debug fixture：一个低基础 CP/低装备角色，一个多次转生且可挂机 1000+ CP 地图的高成长角色。刷新商店和赌博多轮，记录装备名称、ratio/品质、价格和可用性。确认高成长角色库存明显更贴近当前进度，同时怪物颜色、称号触发、掉落和基础 CP 读数没有被 override 污染。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只处理 docs/parity/p1-shop-stock-progression-override.md 这一张 product override 卡。

要求：
1. 先读 docs/ai/00-working-rules.md、docs/parity/manifest.md、本卡，以及 docs/parity/playtest-followups-2026-06-08.md#p1-combat-power-equipless-readout。
2. 先对照 AS3：reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/ShopPanel.as、reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iShop/GambleCell.as、reference/as3/BOE-O/scripts/iData/iItem/Equipment.as、reference/as3/BOE-O/scripts/iGlobal/Player.as。
3. 对照 React：src/state/GameContext.tsx、src/core/models/Equipment.ts、src/core/models/Player.ts、src/components/windows/ShopWindow.tsx。
4. 注意：当前 AS3/React 公式基本一致，本卡不是普通 parity bug。先确认是否采用 product override；不要直接把 equipStatus 加进 getCombatPower()。
5. 先新增 red guard：assert:shop-stock-progression-override，证明 getCombatPower 仍是 AS3 基础 CP，并为商店/赌博新增的库存成长 helper 提供低成长/高成长 fixture。
6. 若实现 override，只让 generateShopState 或商店专用 helper 使用新库存目标强度；不要影响怪物颜色、称号、掉落、战斗公式和基础 CP 显示。
7. 修复后运行：npm run assert:shop-stock-progression-override、npm run assert:shop-window；如存在/新增则运行 npm run assert:combat-power-readout-parity；再运行 npm run assert:stat-list、npm run assert:equipment-data、npx tsc -b。
8. 做 browser/manual smoke：低成长角色与多次转生高成长角色各刷新商店/赌博多轮，报告库存品质/价格变化，并确认基础 CP 与 AS3 路径未被污染。
```

## English

### Current Status

React shop and gamble generation currently match AS3 closely: both use base `combatPower`, `luck`, and random ratio formulas, while new equipment starts at `level = 0`. The reported low-stock feeling is therefore a product override candidate, not a silent AS3 parity bug.

### Required Decision

Keep `getCombatPower()` AS3-compatible and add a separate shop-stock power helper only if the product decision approves progression-aware inventory. Guard the override so it is consumed only by shop/gamble generation and never leaks into monster color, title, drop, or battle CP paths.

### Acceptance Tests

- `npm run assert:shop-stock-progression-override`
- `npm run assert:shop-window`
- `npm run assert:combat-power-readout-parity` if present or added
- `npm run assert:stat-list`
- `npm run assert:equipment-data`
- `npx tsc -b`
