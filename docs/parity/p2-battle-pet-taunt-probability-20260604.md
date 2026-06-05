# P2 Battle Pet Taunt Probability — 宠物 Taunt 目标选择 AS3 一致

Last updated: 2026-06-05

Current status: AS3-identical（2026-06-05 纠偏）

## 中文

### 当前状态

2026-06-05 纠偏：对照 AS3 `Battle.as` 后确认，原版 `monsterTurn()` 在宠物拥有 `PetSkillList.taunt` 时同样无条件调用 `monsterAttackPet()`，没有读取 `Taunt` 的 `setList` 概率参数。React 当前行为与 AS3 一致，本卡不应进入 `Needs repair`。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as` — `monsterTurn()`
- `reference/as3/BOE-O/scripts/iData/iPet/iPetSkill/` — Taunt 技能数据

### React Targets

- `src/core/models/Battle.ts:439-443` — `monsterTurn()` 中 Taunt 处理
- `src/core/data/petSkillData.ts` — Taunt 技能静态数据（确认 setList 参数含义）

### Original Symptom

```typescript
// Battle.ts:439-443
if (this.pet && this.petHp > 0) {
  const tauntSkill = this.pet.getSkill(PetSkillDataMap['Taunt']);
  if (tauntSkill) {
    this.monsterAttackPet();          // ← 无条件攻击宠物
  } else if (Math.random() < 0.5) {
    this.monsterAttackPlayer();
  } else {
    this.monsterAttackPet();
  }
}
```

2026-06-04 原始审阅曾把 Taunt `setList` 的第一个元素推断为触发概率，因此怀疑 React 无条件攻击宠物过强。2026-06-05 复核后确认：AS3 `monsterTurn()` 也只检查 `this.pet.getSkill(PetSkillList.taunt)` 是否存在，存在时立即攻击宠物；`PetSkillList.taunt` 参数不参与目标选择。

对比宠物 `Dodge` 技能（line 527-531）正确检查了概率：
```typescript
if (Math.random() * 100 < dodgeSkill.getSetArray()[0]) {
  // 闪避成功
}
```

### Expected Behavior

- Taunt 技能存在时，怪物应无条件攻击宠物，与 AS3 `Battle.monsterTurn()` 一致
- 未装备 Taunt 时，保留 AS3 的普通 50/50 玩家/宠物目标选择

### Forbidden Behavior

- 未经新的 AS3 证据就给 Taunt 增加概率判定
- 把 `PetSkillList.taunt` / `petSkillData.ts` 的 `setList` 参数推断为目标选择概率

### State Ownership

- `Battle.ts` 负责怪物攻击目标选择逻辑
- `petSkillData.ts` 负责 Taunt 技能参数定义

### Acceptance Tests

- [x] 对照 AS3 `Battle.as monsterTurn()` 确认 Taunt 无概率判定
- [x] 对照 React `Battle.ts monsterTurn()` 确认目标选择行为一致
- [x] 状态纠偏为 `AS3-identical`；不需要 React 逻辑修复

### Related Cards

- [[p1-battle-pet-flow-logs]] — 宠物战斗日志总卡
