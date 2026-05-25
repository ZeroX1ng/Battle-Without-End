# P0 Battle Numeric Coercion Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:battle-numeric-coercion` 守住。下面的 Original Symptom 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。

### AS3 Source of Truth

- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iData/iMonster/Monster.as`
- `../BOE-O/scripts/iData/iPet/Pet.as`
- `../BOE-O/scripts/tool/MyMath.as`

### React Targets

- `src/core/models/Player.ts`
- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/core/models/Pet.ts`
- `src/core/math/MyMath.ts`
- `src/core/data/skillBehaviors.ts`

### Original Symptom

修复前的 React 问题是：AS3 的核心战斗属性大多以 `int` getter 或 `int` 局部变量进入伤害、暴击、平衡、魔法平衡、宠物属性与怪物攻击计算；React 对这些中间值大量保留 `number` 浮点结果，只有部分最终伤害使用 `Math.floor()`。这会让低等级、带小数装备/称号/技能加成、魔法伤害和平衡随机分布的实际数值偏离 AS3。

### Reviewed Evidence

- AS3 `Player.as` 中 `formula_StatAddUp()` 和 `formula_title_stat()` 返回 `int`，`attMin`、`attMax`、`balance`、`crit`、`spellChance`、`magicDamage`、`magicBalance` 等 getter 也返回 `int`。
- AS3 `Battle.as` 将普通攻击、怪物攻击、宠物攻击的伤害写入 `int` 局部变量后再扣血。
- AS3 `Monster.as` 的 `attack`、`hp`、`balance`、`crit`、`crit_mul`、`defence`、`protection` getter 返回 `int`。
- AS3 `Pet.as` 的 `hp`、`mp`、`attmin`、`attmax`、`defence`、`pro`、`balance`、`cri`、`crimul`、`magicatt`、`attack` getter 返回 `int`。
- 修复前 React `Player.ts` 的 `formula_title_stat()` 在没有称号匹配时直接返回浮点 `value`；`getAttMin()`、`getAttMax()`、`getBalance()`、`getCrit()`、`getSpellChance()`、`getMagicDamage()`、`getMagicBalance()` 等继续返回 `number`。
- 修复前 React `Monster.ts` 和 `Pet.ts` 的攻击/属性 getter 也返回 `number`，未统一复刻 AS3 `int` 截断边界。

### Expected Behavior

- 所有进入战斗公式的 AS3 `int` getter 和 `int` 局部变量都应有明确的 React 等价截断点。
- 普通攻击、主动技能、魔法技能、怪物攻击、宠物攻击的中间值截断顺序应与 AS3 一致。
- `balanceRandom()` 的入参应与 AS3 `int` 参数一致，避免小数平衡值改变随机分布。
- 守卫应覆盖普通物理攻击、魔法攻击、怪物攻击、宠物攻击、负护甲与称号/装备小数加成场景。

### Forbidden Behavior

- 只在最终伤害处 `Math.floor()`，但保留 AS3 中本应先转 `int` 的中间值。
- 用“JavaScript number 更精确”替代 AS3 的截断语义。
- 只验证整数夹具，导致小数装备/称号/技能加成的漂移继续存在。

### State Ownership

- `Player.ts`、`Monster.ts`、`Pet.ts` 负责属性派生和 AS3 数值截断边界。
- `Battle.ts` 和 `skillBehaviors.ts` 负责按 AS3 顺序消费这些属性并结算伤害。
- UI 只能展示结果，不参与数值修正。

### Acceptance Tests

- Needed: `npm run assert:battle-numeric-coercion`
- Adjacent: `npm run assert:growth-skill-protection`
- Adjacent: `npm run assert:skill-eligibility-effects`
- Adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-numeric-coercion` should cover:

- `getAttMin()` / `getAttMax()` truncate the same way AS3 `int` locals do before attack rolls.
- `getBalance()` and `getMagicBalance()` pass integer values to `balanceRandom()`.
- `Monster.attack` and `Pet.attack` truncate at AS3-equivalent points.
- Active magic skills match AS3 when `magicDamage`, `intelligence`, and equipment stats create fractional intermediate values.

### Manual Smoke Scenario

1. Create or load a character with equipment/title/skill bonuses that include fractional or non-divisible stat contributions.
2. Compare several deterministic combat rolls against AS3-derived expectations.
3. Confirm battle logs and HP changes use the guarded integer values.

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:battle-numeric-coercion`. The Original Symptom below remains as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again.

### AS3 Source of Truth

- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iData/iMonster/Monster.as`
- `../BOE-O/scripts/iData/iPet/Pet.as`
- `../BOE-O/scripts/tool/MyMath.as`

### React Targets

- `src/core/models/Player.ts`
- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/core/models/Pet.ts`
- `src/core/math/MyMath.ts`
- `src/core/data/skillBehaviors.ts`

### Original Symptom

Before the repair, React had this issue: AS3 feeds most battle attributes through `int` getters or `int` locals before damage, crit, balance, magic balance, pet stats, and monster attack calculations. React kept many of those values as floating-point `number`s and only floored some final damage values. Low-level combat, fractional equipment/title/skill bonuses, magic damage, and balance distributions could therefore drift from AS3.

### Reviewed Evidence

- AS3 `Player.as` returns `int` from `formula_StatAddUp()` and `formula_title_stat()`, and from battle-facing getters such as `attMin`, `attMax`, `balance`, `crit`, `spellChance`, `magicDamage`, and `magicBalance`.
- AS3 `Battle.as` stores normal attack, monster attack, and pet attack damage into `int` locals before HP changes.
- AS3 `Monster.as` returns `int` from attack-facing getters.
- AS3 `Pet.as` returns `int` from battle stat getters.
- React `Player.ts` returns floating-point values from `formula_title_stat()` when no title matches, and battle stat getters continue to return `number`.
- React `Monster.ts` and `Pet.ts` also expose numeric battle getters without a unified AS3 integer boundary.

### Expected Behavior

- Every AS3 `int` getter and `int` local that feeds battle formulas has an explicit React-equivalent truncation point.
- Normal attacks, active skills, magic skills, monster attacks, and pet attacks truncate intermediates in the AS3 order.
- `balanceRandom()` receives AS3-equivalent integer input.
- Guards cover normal physical attack, magic attack, monster attack, pet attack, negative protection, and fractional bonus scenarios.

### Forbidden Behavior

- Flooring only final damage while preserving intermediates that AS3 already converted to `int`.
- Replacing AS3 truncation semantics with JavaScript floating-point precision.
- Testing only integer fixtures and missing fractional stat drift.

### State Ownership

- `Player.ts`, `Monster.ts`, and `Pet.ts` own stat derivation and AS3 numeric coercion boundaries.
- `Battle.ts` and `skillBehaviors.ts` consume those stats in AS3 order.
- UI displays results only and must not patch combat numbers.

### Acceptance Tests

- Needed: `npm run assert:battle-numeric-coercion`
- Adjacent: `npm run assert:growth-skill-protection`
- Adjacent: `npm run assert:skill-eligibility-effects`
- Adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-numeric-coercion` should cover:

- `getAttMin()` / `getAttMax()` truncate like AS3 `int` locals before attack rolls.
- `getBalance()` and `getMagicBalance()` pass integer values to `balanceRandom()`.
- `Monster.attack` and `Pet.attack` truncate at AS3-equivalent points.
- Active magic skills match AS3 with fractional `magicDamage`, `intelligence`, and equipment stat intermediates.

### Manual Smoke Scenario

1. Create or load a character with equipment/title/skill bonuses that create fractional stat contributions.
2. Compare deterministic combat rolls against AS3-derived expectations.
3. Confirm battle logs and HP changes use the guarded integer values.
