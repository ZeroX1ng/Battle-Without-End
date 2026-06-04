# P2 Battle Pet Taunt Probability — 宠物 Taunt 技能缺少概率判定

Last updated: 2026-06-04

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。`Battle.monsterTurn()` 中宠物有 `Taunt` 技能时无条件使怪物攻击宠物，缺少概率判定。AS3 原版中 Taunt 应有触发概率。

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

当宠物有 `Taunt` 技能时，怪物 **总是** 攻击宠物。但 Taunt 技能数据中 `setList` 的第一个元素通常是触发概率（如 `getSetArray()[0]`），当前代码未检查此概率。

对比宠物 `Dodge` 技能（line 527-531）正确检查了概率：
```typescript
if (Math.random() * 100 < dodgeSkill.getSetArray()[0]) {
  // 闪避成功
}
```

### Expected Behavior

- Taunt 技能应按其 `setList` 参数中的概率触发
- 未触发时回退到正常的 50/50 随机选择攻击目标

### Forbidden Behavior

- 保持无条件触发（过于强大）

### State Ownership

- `Battle.ts` 负责怪物攻击目标选择逻辑
- `petSkillData.ts` 负责 Taunt 技能参数定义

### Acceptance Tests

- [ ] 对照 AS3 确认 Taunt 的触发概率参数
- [ ] 在 `monsterTurn()` 中添加 Taunt 概率判定
- [ ] Guard：验证有 Taunt 技能的宠物不会使怪物 100% 攻击宠物

### Related Cards

- [[p1-battle-pet-flow-logs]] — 宠物战斗日志总卡
