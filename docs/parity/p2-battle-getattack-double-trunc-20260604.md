# P2 Battle GetAttack Double Truncation — `getAttack` 双重截断降低精度

Last updated: 2026-06-04

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。`getAttack()` 返回值经 `as3Int` 截断，但其入参 `getAttMin()` 和 `getAttMax()` 内部已通过 `formula_title_stat` → `as3Int` 截断过一次。双重截断进一步降低了 `balanceRandom` 随机分布的精度。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` — `get attack():int`

### React Targets

- `src/core/models/Player.ts:171-176` — `getAttack()`
- `src/core/models/Player.ts:150-165` — `getAttMin()`, `getAttMax()`
- `src/core/models/Player.ts:131-145` — `formula_title_stat()`

### Original Symptom

当前截断链路：
```
str/2.5 = 6.4
  → as3Int(min_raw + 6.4) = as3Int(m_raw + 6.4)  // 第一层截断（formula_title_stat 内）
  → 若无称号，返回 as3Int(m_raw + 6.4)
  → getAttack: as3Int(getAttMin() + (getAttMax()-getAttMin()) * balanceRandom(...))  // 第二层截断
```

两层 `as3Int` 的累积效应：`formula_title_stat` 在 `getAttMin`/`getAttMax` 内部已经将入参截断为整数，然后 `getAttack` 再对最终结果截断。如果 AS3 原版中 `get attack()` 只做一次 `int()` 截断（在最终结果上），则 React 的双重截断会不必要地压缩 min-max 差距。

### Root Cause

每层截断独立来看是为了匹配 AS3 `int` 语义，但组合起来可能比 AS3 原版多了一次截断。需要对照 AS3 `Player.as` 中 `get attack()` 的完整实现来确认截断次数。

### Expected Behavior

- `getAttack()` 的截断次数和位置应与 AS3 原版 `get attack()` 完全一致
- 若 AS3 原版在 `attMin`/`attMax` getter 中已经做了 `int` 转换，则 React 行为正确
- 若 AS3 原版只在最终 `attack` getter 中做一次 `int`，则需要调整 React

### Forbidden Behavior

- 不先对照 AS3 就增删截断点

### State Ownership

- `Player.ts` 负责 `getAttack` 的截断语义

### Acceptance Tests

- [ ] 对照 AS3 `Player.as` 确认 `get attack()` 及其依赖的 `attMin`/`attMax` getter 中各 `int()` 的位置
- [ ] 验证 React 截断链路与 AS3 完全一致
- [ ] 如有差异，调整 React 以匹配 AS3

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p0-battle-formula-title-trunc-20260604]] — `formula_title_stat` 截断
- [[p0-battle-numeric-coercion]] — 数值截断总卡
