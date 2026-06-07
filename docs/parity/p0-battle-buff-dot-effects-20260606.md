# P0 Battle Buff DOT Effects - 灼伤/中毒没有扣减战斗层 monsterHp

Last updated: 2026-06-06

Current status: Needs repair

## 中文

### 当前状态

2026-06-06 战斗系统审计新增。`BuffBurn` 和 `BuffPoison` 的 React 实现只有在 `Buff.run()` 收到隐藏 `context` 时才会扣减怪物 HP；但 `Monster.runBuff()` 只调用 `buff.run()`，`Battle.ts` 又通过 `this.monster.runBuff()` 驱动 buff tick，导致灼伤/中毒可以留在怪物身上，却不会扣减实时 `Battle.monsterHp`，也不会产生日志。

这类问题试玩时很容易漏掉：技能命中、buff 图标或状态都可能看起来存在，但真实 HP 没有变化。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iSkill/iBuff/BuffBurn.as` - 灼伤 tick 直接扣减 `MainScene.battle.monsterHp`
- `reference/as3/BOE-O/scripts/iData/iSkill/iBuff/BuffPoison.as` - 中毒 tick 直接扣减 `MainScene.battle.monsterHp`
- `reference/as3/BOE-O/scripts/iData/iSkill/iBuff/BuffFrozen.as` - 冰冻只改变回合行为，不应扣 HP
- `reference/as3/BOE-O/scripts/iData/iSkill/iBuff/BuffCorrosion.as` - 腐蚀改变护甲状态，不应冒充 DOT 伤害
- `reference/as3/BOE-O/scripts/iData/Battle.as` - 战斗层持有 `monsterHp` 并负责死亡结算
- `reference/as3/BOE-O/scripts/iData/iSkill/SkillDataList.as` - 玩家技能添加 burn/poison buff 的入口
- `reference/as3/BOE-O/scripts/iData/iPet/iPetSkill/PetSkillList.as` - 宠物技能添加 burn/poison buff 的入口

### React Targets

- `src/core/models/Buff.ts` - `BuffBurn.run()` / `BuffPoison.run()` 的 HP 扣减和日志返回
- `src/core/models/Monster.ts` - `Monster.runBuff()` 的调用边界和返回日志
- `src/core/models/Battle.ts` - 战斗层 `monsterHp` 所有权、buff tick 调度和 `checkDead()` 时机
- `src/core/data/skillBehaviors.ts` - 玩家技能添加 DOT buff 的行为路径
- `src/core/data/petSkillBehaviors.ts` - 宠物技能添加 DOT buff 的行为路径
- `src/core/types.ts` - `MonsterInstance.runBuff()` 的类型签名

### Audit Evidence

审计时的只读运行时探针显示：

```json
{
  "burnNoContext": { "result": null },
  "burnWithContext": {
    "result": "<font color='#ff4040'>灼伤</font>造成了<font color='#ff4040'>10</font>伤害",
    "monsterHp": 90
  },
  "monsterRunBuff": { "logs": [], "remainingBuffs": 1 }
}
```

含义：`BuffBurn` 本身知道如何扣血，但当前真实战斗路径没有把战斗层 HP 上下文传进去。

### Expected Behavior

- 灼伤/中毒 tick 必须扣减当前战斗的实时 `Battle.monsterHp`。
- DOT tick 必须返回玩家可见日志，日志伤害值应与实际 HP delta 一致。
- DOT 可以击杀怪物时，死亡检查、奖励、宠物经验、日志顺序必须与普通伤害击杀走同一套结算边界。
- 冰冻、腐蚀等非 DOT buff 不应被误改成 HP 扣减。

### Forbidden Behavior

- 只让 `Buff.run()` 在孤立 context 下通过，而真实 `Battle` 路径仍不扣血。
- 在 `Monster` 内复制一份独立 HP，造成 `Monster.hp` 与 `Battle.monsterHp` 分叉。
- 只补日志不补 HP，或只扣 HP 不补日志。
- 为了修复 DOT tick 改变玩家普通攻击、主动技能、宠物技能的伤害公式。

### State Ownership

- `Battle.ts` 拥有实时战斗 HP、死亡检查和奖励结算。
- `Monster.ts` 拥有 buff 列表和 buff 生命周期，但不应成为第二个实时 HP owner。
- `Buff.ts` 可以计算单个 buff 的 tick 结果，但需要由战斗层提供可写 HP 边界，或返回结构化 delta 交给战斗层应用。

### Red Guard Contract

新增 `assert:battle-buff-dot-effects`，先在当前代码下红灯：

- 构造带 `BuffBurn` 的怪物，触发真实 `Battle` buff tick，断言 `monsterHp` 减少且日志包含灼伤伤害。
- 构造带 `BuffPoison` 的怪物，触发真实 `Battle` buff tick，断言 `monsterHp` 减少且日志包含中毒伤害。
- 构造 DOT 击杀夹具，断言 `checkDead()`、奖励、战斗重置和日志顺序与普通击杀一致。
- 断言 `Monster.runBuff()` 不再静默吞掉 DOT 日志。

### Acceptance Tests

- [ ] AS3 对照 `BuffBurn.as` / `BuffPoison.as`，确认 DOT 直接影响战斗层 `monsterHp`。
- [ ] 新增或复用 guard：`npm run assert:battle-buff-dot-effects`。
- [ ] 相邻 guard：`npm run assert:battle-damage-log-death`。
- [ ] 相邻 guard：`npm run assert:skill-eligibility-effects`。
- [ ] 相邻 guard：`npm run assert:battle-pet-flow-logs`。
- [ ] 相邻 guard：`npm run assert:monster-reward`。
- [ ] Always：`npx tsc -b`。
- [ ] 玩家可见 smoke：触发灼伤/中毒后，确认日志伤害、怪物 HP 条和死亡奖励一致。

## English

### Summary

Burn and poison currently damage the monster only when `Buff.run()` receives a hidden context. The real battle path calls `Monster.runBuff()` without that context, so DOT buffs can exist without reducing live `Battle.monsterHp` or producing logs.

### Required Fix

Route DOT ticks through the battle-owned HP boundary, keep logs and HP deltas consistent, and guard DOT kills through the same death/reward settlement used by normal damage.
