# P2 Battle GetAttack Double Truncation — `getAttack` 双重截断 AS3 一致

Last updated: 2026-06-05

Current status: AS3-identical（2026-06-05 纠偏）

## 中文

### 当前状态

2026-06-05 纠偏：对照 AS3 `Player.as` 后确认，原版 `attMin` / `attMax` getter 返回 `int`，`get attack():int` 又把随机结果赋给 `var _loc1_:int` 后返回。React `getAttMin()` / `getAttMax()` 与 `getAttack()` 的截断链路匹配 AS3；本卡不应继续停留在 `Needs AS3 verification`。

补充说明：本卡的 `AS3-identical` 只表示 `getAttack()` 截断链路没有 React 漂移，不表示最终战斗日志固定伤害合理。若 `Player.attack` 的多个离散值经过怪物防御、护甲和最终 `floor` 后仍显示为同一非 1 数字，应继续走 `p0-battle-damage-flat-20260604.md`，必要时作为 intentional divergence 处理。

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

- [x] 对照 AS3 `Player.as get attack()` 与 `attMin`/`attMax` getter 确认双重截断位置
- [x] 对照 React `Player.ts getAttack()` 与 `getAttMin()` / `getAttMax()` 确认链路一致
- [x] 状态纠偏为 `AS3-identical`；不需要 React 逻辑修复

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p0-battle-formula-title-trunc-20260604]] — `formula_title_stat` 截断
- [[p0-battle-numeric-coercion]] — 数值截断总卡
