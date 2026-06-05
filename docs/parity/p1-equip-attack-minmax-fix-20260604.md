# P1 Equipment Attack MinMax Fix — 装备生成 min>max 处理 AS3 一致

Last updated: 2026-06-05

Current status: AS3-identical（2026-06-05 纠偏）

## 中文

### 当前状态

2026-06-05 纠偏：对照 AS3 `Equipment.as generateBasicStat()` 后确认，原版在 `attackMin > attackMax` 时同样将 `attackMin` 直接设为 `attackMax`。React 当前实现与 AS3 一致，本卡不应继续停留在 `Needs AS3 verification` 或升级为待修复项。

补充说明：本卡的 `AS3-identical` 只表示 `generateBasicStat()` 这一处边界处理没有 React 漂移，不表示“玩家最终伤害固定”可以接受。若试玩输出长期固定，应继续走 `p0-battle-damage-flat-20260604.md` 的最终伤害波动修复，而不是在本卡里单独改装备生成逻辑。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iItem/Equipment.as` — `generateBasicStat()`

### React Targets

- `src/core/models/Equipment.ts:117-133` — `generateBasicStat()`
- `src/core/models/Player.ts:171-176` — `getAttack()`（已有 min>max 的 fallback 分支）

### Original Symptom

```typescript
// Equipment.ts:126-131
if (this.basicStat[0].name === Stat.attackMin) {
  if (this.basicStat[0].value > this.basicStat[1].value) {
    this.basicStat[0] = new StatImpl(Stat.attackMin, this.basicStat[1].value);
    // ↑ 将 min 设为 max 的值 → min == max → getAttack() 永远返回固定值
  }
}
```

同时 `Player.ts` 中 `getAttack()` 已有一个处理 min>max 的分支：
```typescript
if (min > max) return as3Int(max + (min - max) * balanceRandom(getBalance(state)));
```
但这个分支实际上只是反转了范围（结果在 max~min 之间），语义上等同于交换了 min/max。

### Expected Behavior

- `generateBasicStat()` 在 `attackMin > attackMax` 时应将 `attackMin` 设为当前 `attackMax`，与 AS3 一致
- 不为“保留波动”而自行改成交换 min/max 或其他现代化修正

### Forbidden Behavior

- 不经 AS3 对照就自行“改进”修复逻辑
- 在没有新 AS3 证据的情况下移除 `min == max` 的原作行为

### State Ownership

- `Equipment.ts` 负责装备属性生成的边界修正

### Acceptance Tests

- [x] 对照 AS3 `Equipment.as.generateBasicStat()` 确认 min>max 的原版处理逻辑
- [x] 对照 React `Equipment.ts generateBasicStat()` 确认实现一致
- [x] 状态纠偏为 `AS3-identical`；不需要 React 逻辑修复

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p0-battle-numeric-coercion]] — 数值截断总卡
