# P1 Equipment Attack MinMax Fix — 装备生成时 min>max 修复过于粗暴

Last updated: 2026-06-04

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。装备生成基础属性时，若 `attackMin > attackMax`（可能因精灵族等低敏捷种族属性计算导致），当前修复方式是将 `attackMin` 直接覆盖为 `attackMax` 的值，导致 min==max，完全消除该装备的伤害波动。

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

- 若 AS3 原版也是将 min 设为 max 值，则保持 AS3 行为不变
- 若 AS3 原版是交换两者或其他处理方式，则应与 AS3 一致
- 无论如何，需对照 AS3 `Equipment.as` 确认原版行为

### Forbidden Behavior

- 不经 AS3 对照就自行"改进"修复逻辑
- 保留 min==max 导致伤害零波动的行为（除非 AS3 原版如此）

### State Ownership

- `Equipment.ts` 负责装备属性生成的边界修正

### Acceptance Tests

- [ ] 对照 AS3 `Equipment.as.generateBasicStat()` 确认 min>max 的原版处理逻辑
- [ ] 若 AS3 原版行为不同，修改 React 实现以匹配
- [ ] Guard：构造 min>max 的装备属性场景，验证修复行为与 AS3 一致

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p0-battle-numeric-coercion]] — 数值截断总卡
