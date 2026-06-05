# P0 Battle Damage Flat — min-max 差距压缩导致伤害固定值

Last updated: 2026-06-05

## 中文

### 当前状态

2026-06-04 新增：来自战斗公式代码审阅。核心症状是玩家物理普攻和物理技能造成的伤害表现为固定值（或在极小范围内仅 1~2 个离散值），缺少武器 min-max 应有的玩家可见波动。

2026-06-05 复核：`P1-EQUIP-MINMAX` 与 `P2-ATK-DBL-TRUNC` 作为孤立公式片段与 AS3 一致，但这不能关闭本卡。数值复现显示，+15 剑仍有 7 个 `Player.attack` 离散值（743~749），但打 `defence=200` / `protection=85` 的怪物时最终日志伤害会全部压成 89。也就是说，固定输出可发生在最终伤害层：`(attack - defence) * (1 - caculateProtection(protection))` 的可见差距小于 1 后，被最终 `floor`/`int` 压成同一个数字。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` — `get attack()` getter
- `reference/as3/BOE-O/scripts/iData/Battle.as` — `playerAttack()`, `monsterAttack()`, `petAttack()`
- `reference/as3/BOE-O/scripts/tool/MyMath.as` — `balanceRandom()`
- `reference/as3/BOE-O/scripts/iData/iItem/Equipment.as` — `generateBasicStat()`, `generateLevelStat()`
- `reference/as3/BOE-O/scripts/iData/iItem/WeaponType.as` — `SWORD_BASE` 等武器升级基准

### React Targets

- `src/core/models/Player.ts` — `getAttack()`, `getAttMin()`, `getAttMax()`, `formula_title_stat()`
- `src/core/models/Battle.ts` — `playerAttack()`, `monsterAttack()`, `petAttack()`
- `src/core/math/MyMath.ts` — `balanceRandom()`
- `src/core/constants.ts` — `WeaponTypeBase`（`Stat.ATTACK` 等量加到 min/max）
- `src/core/models/Equipment.ts` — `generateBasicStat()`（min>max 处理）

### Original Symptom

玩家在战斗中造成的伤害始终是固定值（例如始终 47），不会在武器标注的最小攻击 ~ 最大攻击之间波动。即使更换武器或升级后，伤害仍然表现为固定值。

### Root Cause Analysis

经完整链路追踪，根因是 **多个环节协同压缩了玩家可见的最终伤害差距**，导致 `balanceRandom` 的 0.01 步进、`Math.trunc`/`Math.floor` 与怪物防御/护甲缩放叠加后只能产生极少甚至唯一最终值：

1. **武器升级 `Stat.ATTACK` 等量加到 min 和 max**（`constants.ts:120-123`, `Player.ts:592-594`）
   - `WeaponTypeBase` 中所有武器升级基准使用 `Stat.ATTACK`
   - `addEquipStats()` 对 `Stat.ATTACK` 同时 `target.attack.min += value` 和 `target.attack.max += value`
   - 升级到 +15 时贡献数百点，但 min-max 差距完全不变

2. **`formula_title_stat()` 在运算前做 `as3Int(value)` 截断**（`Player.ts:132`）
   - `getAttMin` 和 `getAttMax` 分别调用 `formula_title_stat(state, _loc1_, Stat.ATTACK)`
   - 其中 `getStr(state)/3` vs `getStr(state)/2.5` 是 min/max 差异的主要来源之一
   - 但 `as3Int` 截断发生在乘法之前，小数差异被抹平

3. **`getAttack()` 的 `as3Int` + `balanceRandom` 离散化**（`Player.ts:171-176`）
   - `balanceRandom` 返回值为 0.01 步进
   - `as3Int(min + (max-min) * balanceRandom(...))` 在 `(max-min)` 较小时，`Math.trunc` 将所有结果截断为同一整数
   - 当 `(max-min) < 1` 时结果永远为 `min`

4. **攻击力绝对增长淹没了相对波动**
   - 中后期攻击力几百到上千，而 min-max 差距仅来自初始装备差异和 str 贡献（约 2~10 点）
   - 波动比例 < 2%，玩家完全无法感知

5. **最终伤害层继续压缩可见差距**
   - 怪物防御先做线性扣减，护甲再把剩余差距按 `1 - caculateProtection(protection)` 缩放
   - 当 `floor((attMax - attMin) * protectionScale) < 1` 时，即使 `Player.attack` 有多个离散值，战斗日志也会显示固定伤害
   - 这类固定值不是单纯的 AS3 抄写错误，更像 AS3 原公式在现代试玩体验中的 intentional-divergence 候选点

### Expected Behavior

- 每次物理普攻应从 `attMin ~ attMax` 范围内随机取值，且波动应能产生多个可感知的离散伤害值
- 平衡值应改变抽样分布，使高平衡更接近上限，但不应让最终日志长期固定为单一数字
- 武器升级、高护甲和防御修正后，仍应保留合理的最终伤害离散值，除非攻击完全被压到最低 1 点

### Forbidden Behavior

- 依赖单一的 `Stat.ATTACK` 同时等量增加 min/max 从而消除波动
- 在 `formula_title_stat` 中过早截断小数导致 min-max 差距丢失
- 只用“某个中间公式与 AS3 一致”来关闭最终玩家可见固定伤害问题

### State Ownership

- `Player.ts` 负责 `getAttack()` 的随机取值逻辑
- `constants.ts` 负责 `WeaponTypeBase` 的升级加成向量
- `MyMath.ts` 负责 `balanceRandom()` 的分布质量
- `Equipment.ts` 负责基础属性 min/max 的生成与修正
- `Battle.ts` 负责最终伤害层的防御、护甲缩放和取整

### Acceptance Tests

- [ ] 验证连续 100 次普攻伤害产生至少 5 个不同的伤害值（在合理 min-max 差距下）
- [ ] 验证高护甲/高防御但非最低 1 点伤害场景下，最终日志不应固定为单一非 1 数字
- [ ] 验证平衡值升高时输出分布向上限偏移，而不是直接消除全部波动
- [ ] 验证 `getAttack()` 在 min ≠ max 时能返回多个不同值，并验证这些差异能穿透到最终伤害层
- [ ] 若决定偏离 AS3，文档必须标记 intentional divergence，并说明玩家可见原因

### Related Cards

- [[p0-battle-formula-title-trunc-20260604]] — `formula_title_stat` 截断放大
- [[p1-equip-attack-minmax-fix-20260604]] — 装备生成 min>max 修复
- [[p2-battle-getattack-double-trunc-20260604]] — `getAttack` 双重截断
- [[p0-battle-numeric-coercion]] — 数值截断总卡
