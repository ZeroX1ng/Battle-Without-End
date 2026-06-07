# P1 Math BalanceRandom DivZero — `balanceRandom(100)` 除零风险

Last updated: 2026-06-06

Current status: Guarded（2026-06-06 复核）

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。`balanceRandom(100)` 时，分母 `(100 - _loc2_)` 为 0，产生 `Infinity`，导致 CDF 数组异常。虽然 AS3 中 `Number/0 = Infinity` 且 `Math.pow(x, Infinity)` 有确定行为，但这是一处隐性边界 bug，应显式处理。

2026-06-06 复核：当前 React `MyMath.ts` 已显式处理 `_loc2_ <= 0 || _loc2_ >= 100`，返回 AS3 fallthrough 等价的 `1`，并由 `assert:battle-numeric-coercion` 覆盖。此卡不再排入 active repair queue；manifest 状态应为 `Guarded`。路由修正记录见 `p2-math-balancerandom-manifest-status-20260606.md`。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/tool/MyMath.as` — `balanceRandom()`

### React Targets

- `src/core/math/MyMath.ts:28-73` — `balanceRandom()`

### Original Symptom

```typescript
// MyMath.ts:33-39
let _loc2_: number = param1;
if (param1 < 50) {
  _loc2_ = 100 - param1;
}
const _loc3_: number = (3 * _loc2_ - 100) / (100 - _loc2_);
//                                      ^^^^^^^^^^^^
//                                      当 _loc2_ = 100 时，分母为 0
```

当 `param1 = 100` 时：
- `param1 >= 50`，不取补 → `_loc2_ = 100`
- `_loc3_ = (3*100 - 100) / (100 - 100) = 200 / 0 = Infinity`
- PDF: `(1 - x) * pow(x, Infinity)`
  - `x < 1` → `pow → 0`，PDF 全为 0，CDF 全为 0
  - `x = 1`（最后一个采样点 `_loc9_ = 99` → `_loc11_ = 0.99`，不是 1）
- `Math.random() * 0 = 0`，while 循环中 `0 < _loc5_[_loc9_]` 永远不会为 true
- 最终 fallthrough 到 `return 1`

所以 `balanceRandom(100)` 总是返回 `1`。这意味着 balance=100 的角色总是打出最大攻击力，符合"高平衡 = 高伤害倾向"的设计意图。但依赖 `Infinity` 除零是脆弱的实现。

### Expected Behavior

- 对 `_loc2_ >= 100`（或 `_loc2_ >= 99`）做显式边界处理，返回 `1`（最大攻击倾向）
- 或者：限制 `_loc2_` 最大为 99，使公式不触发除零
- 需确认 AS3 原版对此边界的处理方式

### Forbidden Behavior

- 修改 `balanceRandom` 的行为语义（应保持与 AS3 的分布一致）
- 仅在边界做 safe guard，不改变正常输入下的输出

### State Ownership

- `MyMath.ts` 负责 `balanceRandom` 的数值安全

### Acceptance Tests

- [x] 对照 AS3 `MyMath.as` 确认 `balanceRandom(100)` 的原版行为：边界最终 fallthrough 到 `return 1`
- [x] 添加边界 guard：`balanceRandom(0)`, `balanceRandom(50)`, `balanceRandom(99)`, `balanceRandom(100)`
- [x] 验证修复后 `balanceRandom(100)` 仍然返回 `1`，且不依赖 `Math.pow(..., Infinity)`
- [x] Existing guard：`npm run assert:battle-numeric-coercion`

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p0-battle-numeric-coercion]] — 数值截断总卡
