# P1 Battle Pet Flow Logs And Random Order Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:battle-pet-flow-logs` 守住。下面的 Original Symptom 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。下一步只剩宠物战斗浏览器 smoke。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as`
- `reference/as3/BOE-O/scripts/iData/iPet/Pet.as`
- `reference/as3/BOE-O/scripts/iData/iPet/iPetSkill/PetSkillList.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Pet.ts`
- `src/core/data/petSkillData.ts`
- `src/core/data/petSkillBehaviors.ts`
- `scripts/assertBattleDamageLogDeathParity.mjs`

### Original Symptom

修复前的 React 问题是：宠物参与战斗的数值流和日志未完全覆盖 AS3：怪物攻击宠物、宠物普通攻击、宠物反伤、宠物反击、吸血等路径在 AS3 都会写玩家可见日志；React 多个宠物路径只改 HP，不写对应伤害/吸血日志，且若干模板字符串缺少 `${...}`。另外，AS3 怪物攻击宠物时先计算暴击和伤害，再执行 Dodge 判定；React 在 Dodge 成功时提前返回，不消耗 AS3 中的攻击/暴击随机序列。

### Reviewed Evidence

- AS3 `Battle.as` `monsterAttackPet()` 先计算 `monster.crit`、`monster.attack`、宠物防御/护甲伤害，再检查 `PetSkillList.dodge`。
- AS3 `monsterAttackPet()` 在怪物对宠物造成伤害、宠物反伤、宠物反击时均调用 `MainScene.allInfoPanel.addText()`。
- AS3 `petAttack()` 在宠物治疗怪物、宠物造成伤害、宠物吸血时均写日志。
- 修复前 React `Battle.ts` `monsterAttackPet()` 在 Dodge 成功时先于伤害/暴击计算返回，随机消耗顺序不同。
- 修复前 React `Battle.ts` `monsterAttackPet()` 扣 `petHp` 后没有输出“怪物对宠物造成伤害”的基础日志。
- 修复前 React `Battle.ts` `petAttack()` 扣 `monsterHp` 后没有输出宠物普通攻击伤害日志，吸血只改 `petHp` 不写日志。
- 修复前 React `Battle.ts` 多处日志为 ``... {mon.getNameHtml(...)} ...``，缺少 `$`，玩家会看到字面量模板片段。

### Expected Behavior

- 宠物战斗路径应按 AS3 顺序消耗随机数：怪物攻击宠物时先完成暴击/攻击伤害计算，再执行 Dodge。
- 怪物攻击宠物、宠物回避、宠物受到伤害、宠物反伤、宠物反击、宠物普通攻击、Good or Evil、Life Drain、Meditation、Heal 都应有 AS3 等价的可见日志。
- 宠物 HP/MP、怪物 HP 和玩家 HP/MP 的变化应与日志同 tick 对齐。
- 模板字符串必须插值真实怪物名，不允许输出 `{mon.getNameHtml(...)}` 字面量。

### Forbidden Behavior

- 只更新宠物或怪物 HP，不写 AS3 等价战斗事件。
- Dodge 成功时跳过 AS3 本会消耗的暴击/攻击随机序列。
- 用 DOM/UI 层补日志，而不是从 `Battle.ts` 结算路径发出。
- 让玩家可见日志包含未插值模板片段。

### State Ownership

- `Battle.ts` 拥有宠物回合、怪物攻击宠物、日志和随机顺序。
- `Pet.ts` 拥有宠物属性 getter。
- `petSkillData.ts` / `petSkillBehaviors.ts` 拥有宠物技能参数和技能行为。

### Acceptance Tests

- Needed: `npm run assert:battle-pet-flow-logs`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:text-resources`
- Always run: `npx tsc -b`

`assert:battle-pet-flow-logs` should cover:

- 怪物攻击宠物会减少 `petHp` 并产生包含怪物名、宠物目标和伤害数值的日志。
- 宠物 Dodge 成功路径仍按 AS3 消耗攻击/暴击相关随机序列。
- 宠物普通攻击会减少 `monsterHp` 并产生伤害日志。
- Life Drain 会增加 `petHp` 并产生恢复日志。
- 反伤和反击日志不包含未插值的 `{mon...}` 片段。

### Manual Smoke Scenario

1. 携带带有 Dodge、Life Drain、Counterattack 或 Injury Resile 的宠物进入战斗。
2. 观察怪物攻击宠物、宠物攻击和宠物恢复数个回合。
3. 确认日志能解释每个 HP 变化，并且没有未插值模板片段。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:battle-pet-flow-logs`. The Original Symptom below remains as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again. The next step is pet-combat browser smoke only.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as`
- `reference/as3/BOE-O/scripts/iData/iPet/Pet.as`
- `reference/as3/BOE-O/scripts/iData/iPet/iPetSkill/PetSkillList.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Pet.ts`
- `src/core/data/petSkillData.ts`
- `src/core/data/petSkillBehaviors.ts`
- `scripts/assertBattleDamageLogDeathParity.mjs`

### Original Symptom

Before the repair, React had this issue: pet combat flow and logs were not fully AS3-equivalent. AS3 emits player-visible logs for monster damage to pet, pet normal attacks, pet reflection, pet counterattack, and pet life drain. React updated HP on several pet paths without the matching visible logs, and several template strings were missing `${...}` interpolation. React also checked Dodge before consuming the crit/attack damage sequence that AS3 consumes before the Dodge branch.

### Reviewed Evidence

- AS3 `Battle.as` `monsterAttackPet()` computes monster crit, monster attack, pet defence, and protection damage before checking `PetSkillList.dodge`.
- AS3 `monsterAttackPet()` logs monster damage to pet, pet reflection, and pet counterattack.
- AS3 `petAttack()` logs pet healing the monster, pet damage, and pet life drain.
- React `Battle.ts` returns early on Dodge before AS3-equivalent damage and crit random consumption.
- React `Battle.ts` subtracts `petHp` without the base monster-to-pet damage log.
- React `Battle.ts` subtracts `monsterHp` for pet normal attacks without a pet damage log, and life drain heals without a log.
- React `Battle.ts` contains player-visible logs with literal `{mon.getNameHtml(...)}` because interpolation is missing `$`.

### Expected Behavior

- Pet combat consumes randomness in AS3 order: monster crit and attack damage are calculated before Dodge.
- Monster attacks on pet, pet dodge, pet damage taken, reflection, counterattack, pet normal attack, Good or Evil, Life Drain, Meditation, and Heal all emit AS3-equivalent visible logs.
- Pet HP/MP, monster HP, and player HP/MP changes align with same-tick logs.
- Template strings interpolate real monster names; literal `{mon.getNameHtml(...)}` must not appear.

### Forbidden Behavior

- Updating pet or monster HP without emitting AS3-equivalent battle events.
- Skipping AS3 crit/attack random consumption on successful Dodge.
- Patching logs in the UI layer instead of emitting them from `Battle.ts`.
- Showing unexpanded template fragments to the player.

### State Ownership

- `Battle.ts` owns pet turns, monster attacks on pets, logs, and random order.
- `Pet.ts` owns pet stat getters.
- `petSkillData.ts` / `petSkillBehaviors.ts` own pet skill parameters and behavior.

### Acceptance Tests

- Needed: `npm run assert:battle-pet-flow-logs`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:text-resources`
- Always run: `npx tsc -b`

`assert:battle-pet-flow-logs` should cover:

- Monster attacks on pet reduce `petHp` and emit logs with monster name, pet target, and damage.
- Successful pet Dodge still consumes AS3-equivalent attack and crit randomness.
- Pet normal attack reduces `monsterHp` and emits a damage log.
- Life Drain increases `petHp` and emits a heal log.
- Reflection and counterattack logs do not contain unexpanded `{mon...}` fragments.

### Manual Smoke Scenario

1. Enter battle with a pet that has Dodge, Life Drain, Counterattack, or Injury Resile.
2. Watch several monster-on-pet and pet attack turns.
3. Confirm logs explain every HP change and contain no unexpanded template fragments.
