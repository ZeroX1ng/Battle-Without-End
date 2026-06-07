# P1 Battle Pet Skill Protection Formula - 宠物技能护甲公式所有权不一致

Last updated: 2026-06-07

Current status: Guarded - shared-formula decision

## 中文

### 当前状态

2026-06-06 战斗系统审计新增。`P1-CALCPROT-DUP` 已经把玩家技能侧 `skillBehaviors.ts` 修到复用 `Battle.ts` 导出的 `caculateProtection()`，但宠物技能侧 `petSkillBehaviors.ts` 仍保留本地 `calcProtection()`，且负护甲阈值为 `p < -1000`。

这会造成同一只怪物在 `protection=-500` 时，玩家技能按 `Battle.as` / `Battle.ts` 的 `-100` 阈值走双倍伤害，而宠物技能走另一条指数增伤路径。

2026-06-07 修复：AS3 对照确认 `PetSkillList.as` 原作确实有本地 `caculateProtection()`，且负护甲阈值为 `param1 < -1000`；`Battle.as` 战斗层公式为 `param1 < -100`。本 repo 选择 shared-formula 决策：不保留宠物技能侧的本地分叉，`petSkillBehaviors.ts` 复用 `Battle.ts` 导出的 `caculateProtection()`，与玩家技能和宠物普通攻击的 React 战斗层公式 owner 保持一致。`assert:battle-calcprotection-duplicate` 已扩展静态断言和 `protection=-500` 宠物 Fireball 夹具，红灯证明旧行为为 `monsterHpDelta=-199`，修复后为 `monsterHpDelta=-200`。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as` - 战斗层 `caculateProtection(param1:int)`，负护甲阈值为 `param1 < -100`
- `reference/as3/BOE-O/scripts/iData/iPet/iPetSkill/PetSkillList.as` - 宠物技能本地 `calcProtection()`，需要确认这是原作刻意分叉还是迁移时应归一到战斗层公式
- `reference/as3/BOE-O/scripts/iData/iPet/iPetSkill/PetSkill.as` - 宠物技能行为入口

### React Targets

- `src/core/models/Battle.ts` - 共享 `caculateProtection()`
- `src/core/data/skillBehaviors.ts` - 已复用共享公式，作为当前 repo policy 参照
- `src/core/data/petSkillBehaviors.ts` - 复用 `Battle.ts` 的 `caculateProtection()`
- `scripts/assertBattleCalcProtectionDuplicateParity.mjs` - 覆盖玩家技能侧、宠物技能侧静态公式所有权，以及 `p=-500` Fireball 运行时夹具

### Audit Evidence

只读探针显示：

```json
{
  "sharedProtectionAtMinus500": -1,
  "petFireballMinus500": {
    "monsterHp": 801,
    "monsterHpDelta": -199
  }
}
```

含义：共享公式在 `p=-500` 时应产生 `1 - (-1) = 2` 的伤害倍率；但宠物 Fireball 在同一夹具下没有走共享公式的双倍伤害边界。

### Expected Behavior

- 先做 AS3/产品决策：宠物技能是否必须保留 `PetSkillList.as` 的本地 `-1000` 分叉。
- 默认修复方向：为了避免同一战斗层护甲语义分裂，`petSkillBehaviors.ts` 应复用 `Battle.ts` 的 `caculateProtection()`，与玩家技能侧保持同一公式 owner。
- 如果决定保留 AS3 宠物技能分叉，必须将其标记为 intentional divergence from shared React battle formula，并增加 guard 防止被误改。

### 2026-06-07 Decision

- AS3 evidence: `Battle.as` 的 `caculateProtection(param1:int)` 使用 `param1 < -100`；`PetSkillList.as` 的宠物技能 `monsterPro` 调用本地 `caculateProtection()`，其阈值为 `param1 < -1000`；`PetSkill.as` 仅负责技能数据入口和 `getSetArray()`，不拥有护甲公式。
- Shared-formula decision: React 不保留 `PetSkillList.as` 的本地护甲公式副本，宠物技能改为复用 `Battle.ts` 的共享 `caculateProtection()`。
- Guard result: `assert:battle-calcprotection-duplicate` 现在要求 `skillBehaviors.ts` 和 `petSkillBehaviors.ts` 都没有本地 `calcProtection()`，都 import 共享公式，并验证 `protection=-500` 下玩家 Smash 与宠物 Fireball 都造成 `-200` 伤害。

### Forbidden Behavior

- 只修玩家技能，不覆盖宠物技能。
- 保留两份同名/近似的护甲公式却不写明 ownership。
- 在没有 AS3 对照和产品决策的情况下，静默改变宠物技能伤害。
- 让 `assert:battle-calcprotection-duplicate` 继续只检查 `skillBehaviors.ts`，漏掉 `petSkillBehaviors.ts`。

### State Ownership

- `Battle.ts` 是 React 战斗层护甲公式的默认 owner。
- `skillBehaviors.ts` 和 `petSkillBehaviors.ts` 是公式消费者，不应各自维护隐式公式副本，除非文档明确标记 intentional divergence。

### Red Guard Contract

扩展 `assert:battle-calcprotection-duplicate`，或新增 `assert:battle-pet-skill-protection`，先在当前代码下红灯：

- 静态断言 `petSkillBehaviors.ts` 不应保留本地 `function calcProtection`，除非卡片被改为 intentional divergence。
- 静态断言宠物技能护甲计算 import 并调用 `Battle.ts` 的 `caculateProtection()`。
- 运行时使用 `protection=-500` 夹具，验证宠物 Fireball / Thunder 这类受护甲影响的技能与共享公式输出一致。
- 回归检查玩家技能侧仍通过 `assert:battle-calcprotection-duplicate`。

### Acceptance Tests

- [x] 对照 AS3 `Battle.as` 和 `PetSkillList.as`，记录宠物技能公式是否原作分叉。
- [x] 完成 shared-formula 或 intentional-divergence 决策，并写入本卡。
- [x] 新增或扩展 guard：`npm run assert:battle-calcprotection-duplicate` 或 `npm run assert:battle-pet-skill-protection`。
- [x] 相邻 guard：`npm run assert:battle-pet-flow-logs`。
- [x] 相邻 guard：`npm run assert:battle-pet-exp-reward`。
- [x] 相邻 guard：`npm run assert:battle-damage-log-death`。
- [x] Always：`npx tsc -b`。

## English

### Summary

Player skills and pet skills now reuse the shared `Battle.ts` protection formula. The guard covers the previous `protection=-500` pet Fireball drift where the local pet formula produced `monsterHpDelta=-199` instead of the shared formula's `-200`.

### Required Fix

AS3 confirms that `PetSkillList.as` had a local `param1 < -1000` branch while `Battle.as` uses `param1 < -100`. This card records a shared-formula decision for React: pet skill behaviors consume `Battle.ts` `caculateProtection()` and `assert:battle-calcprotection-duplicate` guards the `p=-500` fixture for both player and pet skills.
