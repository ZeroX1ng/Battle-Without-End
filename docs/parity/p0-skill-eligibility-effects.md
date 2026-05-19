# P0 Skill Eligibility And Effects Parity

Last updated: 2026-05-19

## 中文

### AS3 Source of Truth

- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/SkillWindow.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSkill/CombatInnerPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSkill/MagicInnerPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSkill/PassiveInnerPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iBattleSkill/BattleSkillInnerPanel.as`
- `../BOE-O/scripts/iData/iSkill/SkillDataList.as`
- `../BOE-O/scripts/iData/iSkill/ActiveSkill.as`
- `../BOE-O/scripts/iData/iSkill/PassiveSkill.as`
- `../BOE-O/scripts/iData/iSkill/SkillType.as`
- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iData/iItem/WeaponType.as`

### React Targets

- `src/components/windows/SkillWindow.tsx`
- `src/components/panels/BattleSkillPanel.tsx`
- `src/core/data/skillData.ts`
- `src/core/models/Skill.ts`
- `src/core/models/Player.ts`
- `src/core/models/Battle.ts`
- `src/state/GameContext.tsx`

### Current Symptom

角色技能可以乱选、全部随意装备，而且装备后不一定在战斗中生效；没有远程武器时仍能使用远程技能。

### Expected Behavior

- 技能列表、分类、Rank/AP、升级消耗和描述来自 AS3 技能数据。
- 战斗技能装备/卸下语义来自 `Player.equipSkill()` 和 `Player.unequipSkill()`。
- 攻击技能和防御技能在战斗中通过 AS3 的 `Player.attackSkillList` 和 `Player.defenceSkillList` 派生。
- 技能是否能进入实际战斗列表，要受当前左手武器类别约束；没有武器时按 AS3 默认近战类别处理。
- 魔法、全类别、近战、远程技能的过滤逻辑必须与 `Player.as` 一致。
- 被动技能不应作为主动战斗技能装备，但其属性/效果应按 AS3 更新到 `skillStatus`。

### Forbidden Behavior

- 所有主动技能都能无条件装备并触发。
- 远程技能在没有远程武器时进入实际攻击/防御技能列表。
- UI 显示已装备，但 `Battle.ts` 使用的列表为空或不一致。
- 技能升级只改变等级，不刷新属性、战斗副本和面板。

### State Ownership

- `Player.ts` 负责 `skillList`、`equipSkillList`、`attackSkillList`、`defenceSkillList` 和 `skillStatus` 派生规则。
- `SkillWindow.tsx` 只展示可学习、可升级、可装备状态，并派发用户操作。
- `Battle.ts` 只消费已通过 `Player.ts` 过滤的战斗技能，不在 UI 里重新判断。
- `GameContext.tsx` 负责技能动作后同步 live battle player。

### Acceptance Tests

- Existing: `npm run assert:skill-window`
- Existing: `npm run assert:growth-skill-protection`
- Existing script file to review: `scripts/assertBattleDefenceSkill.mjs`
- Needed: `npm run assert:skill-eligibility-effects`
- Always run: `npx tsc -b`

`assert:skill-eligibility-effects` 应覆盖：

- 没有左手武器时，远程技能不会进入实际 `attackSkillList`/`defenceSkillList`。
- 装备远程武器后，远程技能按 AS3 分类进入对应列表。
- 魔法和 ALL 类别技能按 AS3 规则可用。
- 被动技能不能被当成主动技能装备，但升级后属性效果刷新。
- `SKILL_EQUIP`、`SKILL_UNEQUIP`、`SKILL_LEVELUP` 后，`battle.playerState` 同步。

### Manual Smoke Scenario

1. 新开游戏，打开技能窗口。
2. 学习或获得一个近战、远程、魔法、被动技能。
3. 不装备远程武器，尝试装备远程技能并进入战斗，确认它不会实际触发。
4. 装备远程武器，再确认远程技能可以按 AS3 触发。
5. 升级被动技能，确认面板属性和战斗属性同步变化。

## English

### AS3 Source of Truth

- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/SkillWindow.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSkill/CombatInnerPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSkill/MagicInnerPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSkill/PassiveInnerPanel.as`
- `../BOE-O/scripts/iPanel/iScene/iPanel/iBattleSkill/BattleSkillInnerPanel.as`
- `../BOE-O/scripts/iData/iSkill/SkillDataList.as`
- `../BOE-O/scripts/iData/iSkill/ActiveSkill.as`
- `../BOE-O/scripts/iData/iSkill/PassiveSkill.as`
- `../BOE-O/scripts/iData/iSkill/SkillType.as`
- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iData/iItem/WeaponType.as`

### React Targets

- `src/components/windows/SkillWindow.tsx`
- `src/components/panels/BattleSkillPanel.tsx`
- `src/core/data/skillData.ts`
- `src/core/models/Skill.ts`
- `src/core/models/Player.ts`
- `src/core/models/Battle.ts`
- `src/state/GameContext.tsx`

### Current Symptom

Character skills can be selected arbitrarily, all can be equipped freely, and equipped skills do not reliably take effect in battle. Ranged skills can be used without a ranged weapon.

### Expected Behavior

- Skill list, categories, Rank/AP, level-up cost, and descriptions come from AS3 skill data.
- Battle skill equip/unequip semantics come from `Player.equipSkill()` and `Player.unequipSkill()`.
- Attack and defence skills used in battle are derived through AS3 `Player.attackSkillList` and `Player.defenceSkillList`.
- Skill eligibility for actual battle lists is constrained by current left-hand weapon category; without a weapon, AS3 defaults to melee.
- Magic, all-category, melee, and ranged filtering must match `Player.as`.
- Passive skills should not be equipped as active battle skills, but their stats/effects should update `skillStatus` according to AS3.

### Forbidden Behavior

- Every active skill can be equipped and triggered unconditionally.
- Ranged skills enter actual attack/defence lists without a ranged weapon.
- UI shows a skill as equipped while `Battle.ts` uses an empty or inconsistent list.
- Skill level-up changes only level without refreshing stats, battle copy, and panels.

### State Ownership

- `Player.ts` owns `skillList`, `equipSkillList`, `attackSkillList`, `defenceSkillList`, and `skillStatus` derivation.
- `SkillWindow.tsx` displays learnable, upgradeable, and equippable state, then dispatches user actions.
- `Battle.ts` consumes battle skills already filtered by `Player.ts`; UI must not recompute battle eligibility.
- `GameContext.tsx` syncs the live battle player after skill actions.

### Acceptance Tests

- Existing: `npm run assert:skill-window`
- Existing: `npm run assert:growth-skill-protection`
- Existing script file to review: `scripts/assertBattleDefenceSkill.mjs`
- Needed: `npm run assert:skill-eligibility-effects`
- Always run: `npx tsc -b`

`assert:skill-eligibility-effects` should cover:

- Without a left-hand weapon, ranged skills do not enter actual `attackSkillList`/`defenceSkillList`.
- With a ranged weapon, ranged skills enter the matching list according to AS3 categories.
- Magic and ALL category skills are available according to AS3 rules.
- Passive skills cannot be equipped as active skills, but level-up refreshes stat effects.
- After `SKILL_EQUIP`, `SKILL_UNEQUIP`, and `SKILL_LEVELUP`, `battle.playerState` is synchronized.

### Manual Smoke Scenario

1. Start a new game and open the skill window.
2. Learn or obtain one melee, ranged, magic, and passive skill.
3. Without a ranged weapon, try equipping a ranged skill and enter battle; confirm it does not actually trigger.
4. Equip a ranged weapon, then confirm ranged skills can trigger according to AS3.
5. Upgrade a passive skill and confirm panel stats and battle stats update together.
