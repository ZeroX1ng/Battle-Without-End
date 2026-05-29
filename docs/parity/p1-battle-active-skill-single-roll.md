# P1 Battle Active Skill Single Roll Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:battle-active-skill-single-roll` 守住。下面的 Original Symptom 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iData/iSkill/SkillDataList.as`
- `reference/as3/BOE-O/scripts/iData/iSkill/ActiveSkillData.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Player.ts`
- `src/core/data/skillBehaviors.ts`
- `scripts/assertSkillEligibilityEffectsParity.mjs`

### Original Symptom

修复前的 React 问题是：AS3 `Battle.playerTurn()` 在施法概率通过后，只从 `Player.attackSkillList` 中随机取一个攻击技能并调用一次 `behaveFunction()`；如果这个技能因为 MP 不足等原因返回 `false`，该回合直接回落到普通攻击。React `Battle.playerTurn()` 会把攻击技能洗牌，然后循环尝试多个技能，直到某个技能成功。这会提高多技能角色的实际技能触发率，并绕过 AS3 的“随机到失败技能就普通攻击”语义。

### Reviewed Evidence

- AS3 `Battle.as` `playerTurn()` 计算 `Player.spellChance + 20 + attackSkillList.length * 5`，上限 95。
- AS3 概率命中后执行 `_loc4_ = Player.attackSkillList[Math.random() * _loc2_ >> 0]`，只选择一个技能。
- AS3 只有该单个技能 `behaveFunction(_loc4_)` 返回 true 时，才阻止普通攻击。
- 修复前 React `Battle.ts` `playerTurn()` 先 `sort(() => Math.random() - 0.5)`，再 `for` 循环尝试整个列表，成功即停止。
- 现有 `assert:skill-eligibility-effects` 只验证列表过滤和 Battle 消费同一列表，不验证每回合只尝试一个攻击技能。

### Expected Behavior

- 攻击技能触发概率仍为 AS3 公式：`spellChance + 20 + attackSkillList.length * 5`，上限 95。
- 概率命中后，每个玩家攻击回合只随机选择一个攻击技能尝试。
- 若该技能返回失败，回合应执行普通攻击，不继续尝试其他攻击技能。
- 防御技能当前已经是单次随机选择，仍应保持与 AS3 `monsterAttackPlayer()` 一致。

### Forbidden Behavior

- 在一个玩家回合内连续尝试多个攻击技能。
- 用 shuffle 或重试机制提高技能实际生效率。
- 只验证技能列表过滤，不验证战斗内随机选择与失败回退。

### State Ownership

- `Player.ts` 继续拥有 `attackSkillList` 过滤规则。
- `Battle.ts` 负责 AS3 回合内随机选择与普通攻击回退。
- `skillBehaviors.ts` 只返回该技能是否成功，不决定是否重试其他技能。

### Acceptance Tests

- Needed: `npm run assert:battle-active-skill-single-roll`
- Existing adjacent: `npm run assert:skill-eligibility-effects`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-active-skill-single-roll` should cover:

- 构造两个攻击技能：第一个返回失败，第二个返回成功。
- 固定随机序列让 AS3 会抽到失败技能。
- 验证 React 同一回合不会继续尝试第二个技能，而是执行普通攻击。
- 验证防御技能路径仍保持单次随机尝试。

### Manual Smoke Scenario

1. 装备两个以上攻击技能，其中一个因 MP 不足会失败。
2. 观察多回合战斗日志，确认失败技能回合会普通攻击，而不是自动改用另一个可用技能。
3. 对照 AS3 行为确认触发率没有被多技能重试放大。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:battle-active-skill-single-roll`. The Original Symptom below remains as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iData/iSkill/SkillDataList.as`
- `reference/as3/BOE-O/scripts/iData/iSkill/ActiveSkillData.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Player.ts`
- `src/core/data/skillBehaviors.ts`
- `scripts/assertSkillEligibilityEffectsParity.mjs`

### Original Symptom

Before the repair, React had this issue: AS3 `Battle.playerTurn()` rolls the attack-skill chance, then randomly selects exactly one skill from `Player.attackSkillList` and calls that single `behaveFunction()`. If that skill fails, for example because MP is insufficient, the turn falls back to a normal attack. React shuffled the full attack-skill list and tried multiple skills until one succeeded. Characters with several equipped attack skills therefore got a higher effective skill success rate than AS3.

### Reviewed Evidence

- AS3 `Battle.as` computes `Player.spellChance + 20 + attackSkillList.length * 5`, capped at 95.
- AS3 picks one skill with `_loc4_ = Player.attackSkillList[Math.random() * _loc2_ >> 0]`.
- AS3 skips the normal attack only if that single skill succeeds.
- React `Battle.ts` shuffles the skill list, then loops through it until a skill succeeds.
- Existing `assert:skill-eligibility-effects` verifies filtering and shared list consumption, but not the one-skill-per-turn selection rule.

### Expected Behavior

- Attack skill chance remains `spellChance + 20 + attackSkillList.length * 5`, capped at 95.
- Once the chance passes, the player turn randomly selects and tries exactly one attack skill.
- If that skill fails, the same turn performs a normal attack and does not retry other attack skills.
- The defence-skill path should remain a single random selection, matching AS3 `monsterAttackPlayer()`.

### Forbidden Behavior

- Trying multiple attack skills in one player turn.
- Using shuffle or retry behavior to improve skill success rate.
- Testing only skill-list filtering without testing battle-time selection and failure fallback.

### State Ownership

- `Player.ts` owns `attackSkillList` filtering.
- `Battle.ts` owns per-turn random selection and normal attack fallback.
- `skillBehaviors.ts` only reports whether the selected skill succeeded.

### Acceptance Tests

- Needed: `npm run assert:battle-active-skill-single-roll`
- Existing adjacent: `npm run assert:skill-eligibility-effects`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-active-skill-single-roll` should cover:

- Two attack skills where the first fails and the second succeeds.
- A fixed random sequence that selects the failing skill under AS3.
- React must not continue to the second skill in the same turn; it must perform a normal attack.
- The defence skill path remains a single random attempt.

### Manual Smoke Scenario

1. Equip two or more attack skills, including one that can fail due to insufficient MP.
2. Watch battle logs and confirm failed-skill turns fall back to normal attack instead of automatically using another available skill.
3. Compare against AS3 so multi-skill retry does not inflate trigger rate.
