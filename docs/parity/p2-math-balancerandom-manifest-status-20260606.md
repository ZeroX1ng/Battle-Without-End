# P2 Math BalanceRandom Manifest Status - 已 Guarded 的除零边界仍被路由为 Needs repair

Last updated: 2026-06-06

Current status: Guarded

## 中文

### 当前状态

2026-06-06 战斗系统审计新增。`P1-BALRAND-DIV0` 的原始风险已经由当前 React 实现和 `assert:battle-numeric-coercion` 覆盖：`balanceRandom(0)` / `balanceRandom(100)` 使用显式边界返回 `1`，不再依赖 `Math.pow(..., Infinity)`。但 manifest 和旧卡片仍把该项路由为 `Needs repair`，会误导后续修复顺序。

本卡是文档/路由修正卡，不要求运行时代码改动。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/tool/MyMath.as` - `balanceRandom()`，原作在 0/100 边界最终 fallthrough 到 `return 1`

### React Targets

- `src/core/math/MyMath.ts` - 当前显式处理 `_loc2_ <= 0 || _loc2_ >= 100`
- `scripts/assertBattleNumericCoercionParity.mjs` - 已验证 0/100 边界不依赖非有限指数
- `docs/parity/manifest.md` - 状态应改为 `Guarded`
- `docs/parity/p1-math-balancerandom-divzero-20260604.md` - 旧卡状态应补充 2026-06-06 复核结果

### Expected Behavior

- `P1-BALRAND-DIV0` 在 manifest 中标记为 `Guarded`，而不是继续出现在修复队列。
- 旧卡片记录当前 guard 名称和已通过的边界语义。
- 后续只有在 `assert:battle-numeric-coercion` 变红、AS3 对照改变，或新发现分布漂移时才重新打开。

### Forbidden Behavior

- 为了“修复” stale manifest 再次改动 `balanceRandom()` 运行时代码。
- 把该项继续排在 P0/P1 战斗修复顺序前面。
- 只更新 manifest，不更新旧卡片，导致卡片和路由状态继续冲突。

### Guard Evidence

现有 guard 覆盖：

- `balanceRandom(0)` 返回 `1`。
- `balanceRandom(100)` 返回 `1`。
- 两个边界都不调用 `Math.pow(..., Infinity)`。
- `balanceRandom(50)` / `balanceRandom(99)` 仍返回有限数值。
- Player、Monster、Pet 的 balance 入参按 AS3 `int` 语义截断。

### Acceptance Tests

- [x] `docs/parity/manifest.md` 将 `P1-BALRAND-DIV0` 标记为 `Guarded`。
- [x] `docs/parity/p1-math-balancerandom-divzero-20260604.md` 记录 2026-06-06 guard 结果。
- [x] Existing guard：`npm run assert:battle-numeric-coercion`。
- [ ] Doc hygiene：`git diff --check`。
- [ ] Doc/text hygiene：`npm run assert:source-encoding`、`npm run assert:text-resources`。

## English

### Summary

The `balanceRandom(0/100)` edge is already guarded by the current React code and `assert:battle-numeric-coercion`. The remaining problem is stale routing: manifest and the older card still marked it as `Needs repair`.

### Required Fix

Treat this as a documentation and routing correction only. Mark the original card as Guarded and keep it out of the active battle repair queue.
