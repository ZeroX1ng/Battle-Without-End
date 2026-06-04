# P1 Battle Monster Attack Getter — `Monster.attack` / `Pet.attack` getter 隐藏随机副作用

Last updated: 2026-06-04

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。`Monster.attack` 和 `Pet.attack` 实现为 JavaScript getter，每次属性访问都会调用 `balanceRandom()` 生成新的随机攻击值。如果一个回合内多次访问该 getter，将得到不同的攻击力值，行为不够可预测。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iMonster/Monster.as` — `get attack():int`
- `reference/as3/BOE-O/scripts/iData/iPet/Pet.as` — `get attack():int`

### React Targets

- `src/core/models/Monster.ts:179-181` — `get attack()`
- `src/core/models/Pet.ts:149-151` — `get attack()`
- `src/core/models/Battle.ts:490,520,560` — 消费 `mon.attack` 和 `pet.attack` 的位置

### Original Symptom

AS3 中 `Monster.attack` 和 `Pet.attack` 也是 getter，每次访问返回基于 `balanceRandom` 的随机值。这是 AS3 原版设计。但目前 React 中的多个消费点可能在同一个逻辑分支中多次访问 getter：

- `Battle.monsterAttackPlayer()` (line 454)：先检查防御技能（技能行为函数中可能访问 `mon.attack`），再在 `monsterAttack()` (line 490) 中再次访问
- `Battle.monsterAttackPet()` (line 508)：同理，且宠物反击 (line 560) 也访问 `pet.attack`
- 在 `monsterAttackPet()` 中，如果宠物有 `Dodge` 技能且闪避成功，则 `mon.attack` 的随机访问是浪费的（因为 `mon.attack` getter 已在条件判断前被求值）

注意：AS3 原版也有同样的 getter 设计，这不是 React 新增的 bug。但在 AS3 中 `mon.attack` 是直接内联在伤害公式中的 `int` 局部变量，访问次数是确定的。React 的实现应确保每个攻击 action 中只随机一次。

### Root Cause

`get attack()` 的实现将随机化隐藏在属性访问中：
```typescript
// Monster.ts:179
get attack(): number {
  return as3Int(this.data.attack.min + (this.data.attack.max - this.data.attack.min) * balanceRandom(this.balance));
}
```

每次读取 `mon.attack` 都执行一次 `balanceRandom`，是"有副作用的 getter"反模式。

### Expected Behavior

- 每个攻击 action 中，攻击方的攻击力应在该 action 开始时确定一次，同一 action 内多次使用应得到相同值
- 或者：确认 AS3 原版中每次访问 getter 确实都重新随机，且这是有意为之的行为（不做修改）

### Forbidden Behavior

- 不先对照 AS3 就擅自将 getter 改为缓存值
- 不确认 AS3 行为就修改随机调用次数

### State Ownership

- `Monster.ts` 和 `Pet.ts` 负责 `attack` getter 的随机语义
- `Battle.ts` 负责在正确的时机消费攻击力值

### Acceptance Tests

- [ ] 对照 AS3 `Monster.as` / `Pet.as` 确认原版 `attack` getter 是否每次访问都重新随机
- [ ] 对照 AS3 `Battle.as` 确认每个回合中 `mon.attack` 的访问次数和时机
- [ ] Guard：同一回合内多次访问 `mon.attack`，确认行为与 AS3 一致

### Related Cards

- [[p0-battle-damage-flat-20260604]] — 伤害固定值总卡
- [[p0-battle-numeric-coercion]] — 数值截断总卡
