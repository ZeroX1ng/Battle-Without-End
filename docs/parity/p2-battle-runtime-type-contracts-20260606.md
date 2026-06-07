# P2 Battle Runtime Type Contracts - runBuff 返回值和行为 any 边界

Last updated: 2026-06-07

Current status: Guarded

## 中文

### 当前状态

2026-06-06 战斗系统审计新增。战斗运行时有一层类型契约不够硬：`src/core/types.ts` 中 `MonsterInstance.runBuff(): void` 与 `Monster.runBuff(): string[]` 的真实实现不一致；同时 `skillBehaviors.ts`、`petSkillBehaviors.ts` 中仍有大量 `any`，隐藏了 HP delta、日志返回、buff tick 和战斗上下文的边界问题。

本卡不直接要求一次性消灭所有 `any`，而是把战斗公式和战斗状态最关键的契约先钉住，避免后续 DOT、宠物技能、伤害日志修复再次被类型层漏掉。

### AS3 Source of Truth

- No AS3; React architecture review.
- 行为语义仍需参考对应 AS3 文件，但本卡的主要目标是 React/TypeScript 合约健康，不改变 AS3 外部行为。

### React Targets

- `src/core/types.ts` - `MonsterInstance.runBuff()` 与战斗相关接口
- `src/core/models/Monster.ts` - `runBuff()` 返回日志数组的真实实现
- `src/core/models/Buff.ts` - buff tick 的返回值、日志、HP delta 边界
- `src/core/models/Battle.ts` - 战斗层 HP owner 和日志 owner
- `src/core/data/skillBehaviors.ts` - 玩家技能行为结果类型
- `src/core/data/petSkillBehaviors.ts` - 宠物技能行为结果类型
- `scripts/assertDomainTypeBoundaries.mjs` - 可扩展静态 guard

### Current Symptom

- `MonsterInstance.runBuff(): void` 让调用方看不到日志返回契约。
- `Monster.runBuff()` 实际返回 `string[]`，但接口不保护这个行为。
- 技能行为文件中的 `any` 让 `monsterHp`、`monsterHpDelta`、`logs`、`buffList` 等字段漂移时不容易被 TypeScript 捕获。
- DOT 漏扣 HP 和宠物护甲公式分叉这类问题，都说明当前类型边界没有帮忙挡住关键运行时漂移。

### Expected Behavior

- `MonsterInstance.runBuff()` 类型必须与真实实现一致，或重构为明确的结构化 tick 结果。
- 战斗行为函数应使用已有的行为结果类型，不再通过宽泛 `any` 隐藏 HP/log/buff 合约。
- 如果某处必须保留动态 AS3 边界，应有局部注释或 guard 白名单说明原因。
- 类型修复应分战斗领域小步推进，避免一次性大重构改变运行时行为。

### Forbidden Behavior

- 用 `as any` 或更宽的类型把当前问题压下去。
- 为了类型清理移动战斗所有权边界，顺手改 DOT、宠物技能或伤害公式行为。
- 新增泛化抽象，扩大修复范围到 UI、背包、地图等无关领域。
- 让 `assert:domain-type-boundaries` 继续只保护旧的 player/title/equipment 边界，不覆盖战斗运行时契约。

### Red Guard Contract

新增 `assert:battle-runtime-type-contracts`，或扩展 `assert:domain-type-boundaries`：

- 静态断言 `MonsterInstance.runBuff()` 不得声明为 `void`，除非 `Monster.runBuff()` 也改为不返回日志且调用方另有结构化日志来源。
- 静态断言 `Monster.runBuff()`、`Buff.run()`、战斗行为结果的返回契约在类型层可见。
- 统计 `skillBehaviors.ts` / `petSkillBehaviors.ts` 中战斗关键路径的 broad `any`，防止新增。
- 对 `monsterHp`、`monsterHpDelta`、`logs`、`buffList` 等字段建立最小接口，避免后续修复靠约定传递。

### Acceptance Tests

- [x] 新增或扩展 guard：`npm run assert:battle-runtime-type-contracts` 或 `npm run assert:domain-type-boundaries`。
- [x] `MonsterInstance.runBuff()` 与真实实现保持一致。
- [x] 玩家技能和宠物技能行为结果使用明确类型，关键 HP/log/buff 字段不再靠 broad `any`。
- [x] 相邻 guard：`npm run assert:battle-state-immutability`。
- [x] 相邻 guard：`npm run assert:battle-player-state`。
- [x] 相邻 guard：`npm run assert:domain-type-boundaries`。
- [x] Always：`npx tsc -b`。

### 2026-06-07 Guarded Result

- Added `assert:battle-runtime-type-contracts` to pin `MonsterInstance.runBuff(): string[]`, `Monster.runBuff(): string[]`, `Buff.run(): string | null`, `BattleBehaviorResult`, and the player/pet skill behavior context types.
- `MonsterInstance.runBuff()` was already aligned to `string[]` in the live checkout; the red guard exposed the remaining `Monster.buffList: any[]` and skill behavior `battle: any` / `pet: any` boundaries.
- Runtime behavior was not changed: formulas, DOT effects, final damage output, and pet protection behavior remain routed to their own cards.

## English

### Summary

The battle runtime type boundary is too loose: `MonsterInstance.runBuff()` is typed as `void`, while the implementation returns `string[]`, and broad `any` in skill behavior files hides HP/log/buff contracts.

### Required Fix

Add or extend a static guard, align `runBuff` contracts, and type the battle behavior result boundary narrowly enough to catch HP/log/buff drift without changing runtime behavior.

### Guarded Result

`assert:battle-runtime-type-contracts` now covers the runtime type contract. `Monster` buff ownership uses `BuffData`, battle skill behavior functions use `Skill` / `Battle`, and pet skill behavior functions use `PetSkillInstance` / `Battle` / `Pet`.
