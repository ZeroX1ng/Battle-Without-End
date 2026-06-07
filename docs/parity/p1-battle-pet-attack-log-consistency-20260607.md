# P1 Battle Pet Attack Log Consistency - Life Drain and normal attack text

Last updated: 2026-06-07

Current status: Verified

## Chinese

### 当前状态

2026-06-07 宠物模块审阅新增。本卡只处理 `Battle.ts` 中宠物普通攻击的玩家可见日志自洽，不改宠物伤害公式、吸血公式、随机顺序、主动宠物技能或怪物攻击宠物路径。

本问题不是普通 AS3 漂移：AS3 `Battle.as` 的 `petAttack()` 同样把 Life Drain 恢复日志写成原始伤害值，并且非暴击宠物普攻日志末尾也拼接了一次怪物名。React 当前复刻了这两个玩家可见怪异文本。若修复本卡，应作为小范围 intentional divergence 记录，目标是让日志显示与同 tick HP delta 对齐。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as` - `petAttack()` 中宠物普攻、Good or Evil、Life Drain 日志和 HP 修改顺序。
- `reference/as3/BOE-O/scripts/iData/iPet/iPetSkill/PetSkillList.as` - `life_drain` 参数为 `[20]` / `[30]`。

### React Targets

- `src/core/models/Battle.ts` - `petAttack()` 普攻日志与 Life Drain 恢复日志。
- `scripts/assertBattlePetFlowLogsParity.mjs` - 现有 guard 已覆盖宠物普攻与 Life Drain HP delta，但没有断言恢复日志的具体数值，也没有拒绝非暴击日志末尾多余怪物名。
- `docs/parity/p1-battle-pet-flow-logs.md` - 相邻总卡，已 Guarded；不要把旧症状重新打开。

### Reviewed Evidence

- React `Battle.ts` 先计算 `lifeDrainHeal = Math.floor(finalDamage * percent / 100)` 并增加 `this.petHp`，但日志仍显示 `${finalDamage}`。
- React `Battle.ts` 非暴击宠物普攻日志为 `... ${finalDamage}</font> 伤害${monsterName}`，导致尾部多出怪物名。
- AS3 `Battle.as` 中 `this.petHp += _loc3_ * percent / 100` 后，恢复日志显示的是 `_loc3_` 原始伤害。
- AS3 `Battle.as` 非暴击分支同样在 `" 伤害"` 后追加 `this.monster.nameHtml`。
- `npm run assert:battle-pet-flow-logs` 当前通过，说明现有 guard 没有捕获这两个更细的玩家可见文本问题。

### Expected Behavior

- Life Drain 日志中的数值应等于本 tick 实际增加的宠物 HP，即 `lifeDrainHeal`，而不是 `finalDamage`。
- 宠物普攻非暴击日志应以伤害描述结束，不应在末尾再次追加怪物名。
- 宠物普攻伤害、暴击、Good or Evil、Life Drain 的随机消耗和 HP 修改顺序保持现状。
- 由于 AS3 也存在该文本问题，修复说明必须明确这是玩家可见日志自洽的 intentional divergence。

### Forbidden Behavior

- 不要修改 `caculateProtection()`、宠物 attack getter、暴击概率、Good or Evil 概率或 Life Drain 恢复公式。
- 不要把修复扩散到主动宠物技能 `petSkillBehaviors.ts`。
- 不要只改 UI 层文本；日志必须继续由 `Battle.ts` 的结算路径发出。
- 不要把 `p1-battle-pet-flow-logs.md` 的旧缺日志问题重新改回 `Needs repair`。

### Red Guard Contract

先扩展 `assert:battle-pet-flow-logs`，让它在生产代码修复前失败：

- 构造宠物普通攻击 `finalDamage = 8`、Life Drain 百分比 `50` 的夹具，断言 `petHp` 增加 `4`，并断言恢复日志显示 `4` 而不是 `8`。
- 构造非暴击宠物普攻夹具，断言日志包含一次怪物名和伤害数值，但不匹配 `伤害` 后再次出现怪物名的尾巴。
- 保留现有 Dodge 随机消耗、怪物攻击宠物、宠物主动技能 MP gate、反伤和反击断言。

### Acceptance Tests

- [x] Dedicated guard: `npm run assert:battle-pet-flow-logs`。
- [x] Adjacent guard: `npm run assert:battle-damage-log-death`。
- [x] Adjacent guard: `npm run assert:monster-reward`。
- [x] Text guard: `npm run assert:text-resources`。
- [x] Always: `npx tsc -b`。
- [x] Browser smoke: 携带 Life Drain 宠物进入战斗，确认恢复日志显示的数值等于宠物 HP 实际增加量，非暴击宠物普攻日志末尾没有重复怪物名。

### 2026-06-07 修复记录

- 状态更新为 `Verified`。`assert:battle-pet-flow-logs` 已扩展 Life Drain 恢复日志数值和非暴击宠物普攻尾部文本断言；`Battle.ts` 仅将 Life Drain 日志显示改为 `lifeDrainHeal`，并移除非暴击普攻日志尾部多余怪物名。
- 这是玩家可见日志自洽的 narrow intentional divergence；伤害公式、吸血公式、随机顺序、Good or Evil、主动宠物技能和 UI 层日志均未改动。
- Browser smoke 使用临时 Life Drain 宠物存档读档进入真实页面，确认可见恢复日志数值等于本次宠物伤害按 Life Drain 百分比计算的 HP delta，且非暴击宠物普攻日志尾部不重复怪物名。

## English

### Current Status

Added by the 2026-06-07 pet-module review. This card only covers player-visible pet normal-attack log consistency in `Battle.ts`; it must not change pet damage formulas, Life Drain formulas, random order, active pet skills, or monster-on-pet paths.

This is not a normal AS3 drift. AS3 `Battle.as` has the same two odd visible strings: Life Drain logs raw damage instead of the actual heal delta, and non-critical pet normal attacks append the monster name again after the damage text. If this card is repaired, document it as a narrow intentional divergence for log/HP self-consistency.

### Required Fix

Extend `assert:battle-pet-flow-logs` first so it fails on the current code. Then change the Life Drain heal log from `finalDamage` to `lifeDrainHeal`, and remove the trailing monster name from the non-critical pet normal-attack log.

### 2026-06-07 Repair Notes

- Status updated to `Verified`. `assert:battle-pet-flow-logs` now checks the Life Drain visible heal amount and rejects a repeated monster name after non-critical pet normal-attack damage text.
- `Battle.ts` only changes the Life Drain log interpolation to `lifeDrainHeal` and removes the trailing monster name from the non-critical pet normal attack. Damage formulas, Life Drain formulas, random order, Good or Evil, active pet skills, and UI-layer logging are unchanged.
- Browser smoke loaded a temporary Life Drain pet save in the real page and confirmed the visible heal amount equals the current pet damage times the Life Drain percent, while the non-critical pet normal-attack line ends at the damage text.

### Acceptance Tests

- [x] `npm run assert:battle-pet-flow-logs`
- [x] `npm run assert:battle-damage-log-death`
- [x] `npm run assert:monster-reward`
- [x] `npm run assert:text-resources`
- [x] `npx tsc -b`
- [x] Browser smoke with a Life Drain pet.
