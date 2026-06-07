# P0 Battle Damage Flat Output Guard - 最终日志伤害波动压缩

Last updated: 2026-06-07

Current status: Guarded (intentional divergence)

Parent card: `p0-battle-damage-flat-20260604.md`

## 中文

### 当前状态

2026-06-06 战斗系统审计新增。`P0-DMG-FLAT` 仍不能因为若干孤立公式片段 AS3-identical 而关闭。审计确认：`Player.attack` 本身可以产生多个离散值，但经过怪物防御、护甲缩放和最终取整后，玩家实际看到的战斗日志伤害仍可能压成单一固定值。

这张卡不是替代父卡，而是把父卡拆成更容易开工的输出层 guard 卡：先证明“中间攻击有波动，但最终可见伤害没有波动”，再决定是否按现代试玩体验做 intentional divergence。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` - `get attack()`、`getAttMin()`、`getAttMax()`
- `reference/as3/BOE-O/scripts/iData/Battle.as` - `playerAttack()`、防御/护甲缩放、最终伤害取整
- `reference/as3/BOE-O/scripts/tool/MyMath.as` - `balanceRandom()`
- `reference/as3/BOE-O/scripts/iData/iItem/Equipment.as` - 装备 min/max 生成
- `reference/as3/BOE-O/scripts/iData/iItem/WeaponType.as` - 武器升级基础数值

### React Targets

- `src/core/models/Player.ts` - `getAttack()`、`getAttMin()`、`getAttMax()`
- `src/core/models/Battle.ts` - `playerAttack()`、`caculateProtection()`、最终日志伤害
- `src/core/math/MyMath.ts` - `balanceRandom()`
- `src/core/models/Equipment.ts` - 装备 min/max 生成
- `src/core/constants.ts` - 武器升级基础数值
- `scripts/` - 新增输出层伤害波动 guard

### Audit Evidence

已知数值复现：+15 剑仍可产生 7 个 `Player.attack` 离散值（743 到 749），但面对 `defence=200` / `protection=85` 的怪物时，最终日志伤害可全部压成 89。

核心链路：

```text
Player.attack variance
  -> subtract monster.defence
  -> multiply by 1 - caculateProtection(monster.protection)
  -> final floor/int
  -> visible battle log damage
```

当最终取整前的可见差距小于 1 时，多个攻击离散值会映射到同一个日志数字。

### 2026-06-07 修复结论

- AS3 对照：同一夹具 `attMin=743`、`attMax=750`、`balance=50`、`defence=200`、`protection=85` 下，`Player.attack` 采样集合为 `743..749`，但 AS3 等价最终日志伤害集合为 `[89]`。
- React 红灯：修复前同一夹具的最终日志伤害集合同样为 `[89]`，取整前范围为 `89.01639344262293..89.99999999999997`。
- intentional divergence：React 保留 AS3 的攻击采样、装备 min/max、`balanceRandom()`、防御和护甲公式；只在玩家普通攻击最终可见伤害层使用 nearest rounding，避免真实攻击波动被最终 `int/floor` 完全抹平。
- Guard：`npm run assert:battle-damage-flat-output` 同时输出攻击采样集合、AS3 最终伤害集合、React 日志伤害集合、防御值、护甲值和取整前范围。

### Expected Behavior

- Guard 必须同时观察中间 `Player.attack` 离散值和最终日志伤害离散值。
- 如果 AS3 在同一夹具下也完全压平最终日志伤害，必须把产品目标标成 intentional divergence，再继续改现代体验。
- 如果 AS3 仍保留可见最终波动，React 必须修复到 AS3 可见输出。
- 修复不能只证明 `getAttack()` 有随机值，必须证明最终玩家可见日志也有合理波动。

### Forbidden Behavior

- 用 `P1-EQUIP-MINMAX`、`P2-ATK-DBL-TRUNC` 等孤立 AS3-identical 结论关闭玩家可见固定伤害。
- 只修改 UI 文案或日志展示，不改变真实伤害结算。
- 在没有 AS3 输出对照或 intentional-divergence 文档的情况下改变核心伤害公式。
- 让最小 1 点伤害场景误报为本卡问题；本卡只针对非最小伤害且理论上存在波动的夹具。

### Red Guard Contract

新增 `assert:battle-damage-flat-output`，先在当前代码下红灯：

- 构造一个代表性玩家/装备/怪物夹具，使 `Player.attack` 在 100 次采样中至少出现多个离散值。
- 在同一夹具下执行真实 `Battle.playerAttack()` 或等价战斗路径，收集最终日志伤害。
- 断言最终日志伤害不应长期压成单一非 1 数值。
- 输出诊断信息必须同时包含攻击采样集合、最终伤害集合、防御值、护甲值和取整前范围，方便后续判断 AS3 parity 还是 intentional divergence。

### Acceptance Tests

- [ ] AS3 对照同一数值夹具，记录原作最终日志伤害是否压平。
- [ ] 新增或复用 guard：`npm run assert:battle-damage-flat-output`。
- [ ] 父卡 `p0-battle-damage-flat-20260604.md` 更新修复结论或 intentional-divergence 结论。
- [ ] 相邻 guard：`npm run assert:battle-numeric-coercion`。
- [ ] 相邻 guard：`npm run assert:battle-damage-log-death`。
- [ ] 相邻 guard：`npm run assert:battle-active-skill-single-roll`。
- [ ] Always：`npx tsc -b`。
- [ ] 玩家可见 smoke：连续战斗日志不再长期显示同一个非 1 伤害值，或文档明确说明为何保持原作固定输出。

## English

### Summary

This is the executable child card for `P0-DMG-FLAT`. The bug is not merely whether `Player.attack` varies; it is whether that variance survives defence, protection scaling, integer rounding, and reaches the visible battle log.

### Required Fix

Add an output-layer guard that captures both intermediate attack variance and final logged damage variance, then repair React to AS3 output parity or document an intentional divergence if the original also collapses.

### 2026-06-07 Resolution

- AS3 comparison: with `attMin=743`, `attMax=750`, `balance=50`, `defence=200`, and `protection=85`, `Player.attack` samples `743..749`, while the AS3-equivalent final logged damage collapses to `[89]`.
- React red guard: before the repair, the same fixture also logged only `[89]`; the pre-round range was `89.01639344262293..89.99999999999997`.
- Intentional divergence: React keeps AS3 attack sampling, equipment min/max, `balanceRandom()`, defence, and protection formulas. Only the player normal-attack final visible damage layer uses nearest rounding so real attack variance can reach the battle log.
- Guard: `npm run assert:battle-damage-flat-output` prints the attack sample set, AS3 final damage set, React logged damage set, defence, protection, and pre-round range.
