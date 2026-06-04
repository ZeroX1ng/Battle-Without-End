# P0 Battle Formula Title Truncation — `formula_title_stat` 过早截断压缩 min-max 差距

Last updated: 2026-06-04

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。`formula_title_stat()` 在应用称号倍数之前先调用 `as3Int(value)` 截断，使 `getAttMin`/`getAttMax` 中 `str/3` vs `str/2.5` 的小数差异被抹平，进一步压缩了攻击力的 min-max 差距。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` — `formula_title_stat()`, `get attMin()`, `get attMax()`

### React Targets

- `src/core/models/Player.ts:131-145` — `formula_title_stat()`
- `src/core/models/Player.ts:150-165` — `getAttMin()`, `getAttMax()`

### Original Symptom

当玩家没有称号时，`formula_title_stat` 直接返回 `as3Int(value)`，其中 `value = basicMin + skillMin + equipMin + str/3`。`str/3` 的小数部分被截断。`getAttMax` 同理截断 `str/2.5`。对于低 str 角色（如 str=15），`15/3=5` 与 `15/2.5=6` 差距仅 1 点。这个 1 点差距在后续 `getAttack` 的 `as3Int` 再次截断后可能完全消失。

当玩家有称号且称号包含 `ATTACK` 倍数时，`as3Int(value) * mul + add` 会放大截断后的整数差距，但小数部分的丢失已经被固化。

### Root Cause

```typescript
// Player.ts:131-145
export function formula_title_stat(state, value, name): number {
  value = as3Int(value);  // ← 在称号乘法前截断，丢失 str/3 等小数贡献
  if (state.title) {
    // ...
    value *= state.title.statMulList[_loc4_].mul;
    return as3Int(value + state.title.statMulList[_loc4_].add);
  }
  return value;
}
```

截断顺序是 AS3 原版行为（`int` 强制转换），但需确认 React 中的 `as3Int` 是否正确复刻了 AS3 `int()` 的语义。当前截断发生在称号乘法之前可能导致：当称号乘数较大时，`as3Int(min_raw) * mul` vs `as3Int(max_raw) * mul` 的差距被限定为最小 1 × mul，无法反映 str 贡献的连续差异。

### Expected Behavior

- `formula_title_stat` 的截断顺序和位置应与 AS3 原版完全一致
- 需以 AS3 源码为准确认 `int()` 的确切时机，不做"更精确"的改动

### Forbidden Behavior

- 未经 AS3 对照就修改截断顺序
- 不做任何"保留小数更合理"的优化

### State Ownership

- `Player.ts` 负责 `formula_title_stat` 的截断语义

### Acceptance Tests

- [ ] 对照 AS3 `Player.as` 逐行确认 `formula_title_stat` 中 `int()` 的确切时机
- [ ] 验证有称号 / 无称号两种路径下 `getAttMin`/`getAttMax` 返回值与 AS3 一致
- [ ] Guard 覆盖：str=15/30/100 三种档位，有/无称号，有/无 `ATTACK` 倍数称号

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p2-battle-getattack-double-trunc-20260604]] — `getAttack` 双重截断
- [[p0-battle-numeric-coercion]] — 数值截断总卡
