# P1 Battle CalcProtection Duplicate — 护甲公式重复实现且负护甲阈值不一致

Last updated: 2026-06-04

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。护甲减伤公式 `calcProtection` 在两个文件中各自实现了一份，且负护甲阈值参数不同（-100 vs -1000）。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as` — `caculateProtection()`

### React Targets

- `src/core/models/Battle.ts:91-99` — `caculateProtection()`（导出）
- `src/core/data/skillBehaviors.ts:34-38` — `calcProtection()`（局部重复）

### Original Symptom

**Battle.ts:91-99** — 导出函数：
```typescript
export function caculateProtection(p: number): number {
  if (p >= 0) return 0.06 * p / (1 + 0.06 * p);
  if (p < -100) return -1;       // ← 阈值 -100
  return -(1 - Math.pow(0.94, -p));
}
```

**skillBehaviors.ts:34-38** — 局部重复：
```typescript
function calcProtection(p: number): number {
  if (p >= 0) return 0.06 * p / (1 + 0.06 * p);
  if (p < -1000) return -1;      // ← 阈值 -1000！
  return -(1 - Math.pow(0.94, -p));
}
```

两处负护甲阈值不同（-100 vs -1000），可能导致：
- 技能伤害计算（使用 `skillBehaviors.ts` 版本）在负护甲区间与普攻伤害计算（使用 `Battle.ts` 版本）产生不一致
- 当怪物护甲在 -500 时，普攻公式判定为双倍伤害（`return -1`），但技能公式继续走指数增伤路径

### Root Cause

`skillBehaviors.ts` 在迁移时独立实现了一份 `calcProtection`，未复用 `Battle.ts` 中已导出的 `caculateProtection`。

### Expected Behavior

- 全局只存在一份 `caculateProtection` 实现
- 技能行为函数通过 import 使用 `Battle.ts` 的导出版本
- 负护甲阈值应与 AS3 原版一致（需对照 AS3 `Battle.as` 确认真实阈值）

### Forbidden Behavior

- 保留两份不一致的实现
- 不先对照 AS3 就随意选定一个阈值

### State Ownership

- `Battle.ts` 负责 `caculateProtection` 的唯一实现
- `skillBehaviors.ts` 应删除局部 `calcProtection`，改为 import

### Acceptance Tests

- [ ] 对照 AS3 `Battle.as` 确认正确的负护甲阈值
- [ ] 删除 `skillBehaviors.ts:34-38` 的局部实现，改为 `import { caculateProtection } from '../models/Battle'`
- [ ] Guard：验证普攻和技能在负护甲区间的伤害计算一致
- [ ] 技能行为函数中 `monsterPro()` 也应复用 `caculateProtection`

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p0-battle-numeric-coercion]] — 数值截断总卡
