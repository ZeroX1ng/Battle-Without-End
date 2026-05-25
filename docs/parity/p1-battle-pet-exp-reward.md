# P1 Battle Pet Exp Reward Recalculation Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:battle-pet-exp-reward` 守住。下面的 Original Symptom 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。

### AS3 Source of Truth

- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iData/iMonster/Monster.as`
- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iData/iPet/Pet.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/core/models/Player.ts`
- `src/core/models/Pet.ts`
- `scripts/assertMonsterRewardParity.mjs`

### Original Symptom

修复前的 React 问题是：AS3 `Battle.giveTrophy()` 对玩家调用 `Player.addExp(this.monster.exp)` 后，在宠物奖励处再次读取 `this.monster.exp`。由于 `Monster.exp` 依赖当前 `Player.combatPower`、地图 modifier 和幸运值，若玩家获得经验后升级并改变战斗力，宠物获得的经验会按升级后的玩家状态重新计算。React 先缓存 `expGain`，玩家和宠物都使用同一个旧值，因此在击杀导致玩家升级时，宠物经验可能与 AS3 不同。

### Reviewed Evidence

- AS3 `Battle.as` 先执行 `Player.addExp(this.monster.exp)`，后续宠物分支又执行 `this.pet.addExp(this.monster.exp)`。
- AS3 `Monster.as` 的 `exp` getter 每次读取都会用当前 `Player.combatPower`、`Global.map.mapData.modifier` 和 `Player.luck` 重新计算。
- AS3 `Pet.as` `addExp()` 使用传入经验值，并根据 `this.level - Player.lv > 5` 限制升级。
- 修复前 React `Battle.ts` 在 `giveTrophy()` 中先 `const expGain = this.monster.getExp(...)`，玩家加经验后仍用 `this.pet.addExp(expGain, this.playerState.lv)`。
- 现有 `assert:monster-reward` 只确认宠物收到 defeated-monster exp，不区分 AS3 的“第二次读取 monster.exp”语义。

### Expected Behavior

- 玩家经验奖励使用击杀瞬间的 AS3 `monster.exp`。
- 玩家经验结算完成后，宠物经验应按 AS3 顺序再次读取/计算 `monster.exp`。
- 若玩家升级改变 `combatPower` 或等级门槛，宠物经验和升级限制应使用更新后的玩家状态。
- 日志和 loot 汇总需要明确玩家经验和宠物经验可能不是同一个数值。

### Forbidden Behavior

- 把玩家经验缓存值无条件复用给宠物。
- 在玩家升级后仍用升级前 `combatPower` 计算宠物经验。
- 只用不会升级的夹具验证奖励流。

### State Ownership

- `Monster.ts` 继续拥有经验公式。
- `Battle.ts` 负责按 AS3 `giveTrophy()` 顺序读取玩家经验与宠物经验。
- `Pet.ts` 负责宠物经验、等级上限和宠物升级。

### Acceptance Tests

- Needed: `npm run assert:battle-pet-exp-reward`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-pet-exp-reward` should cover:

- 击杀怪物让玩家刚好升级。
- 玩家升级前后的 `getCombatPower()` 不同。
- 玩家经验使用第一次 `monster.getExp()`。
- 宠物经验使用玩家升级后的第二次 `monster.getExp()`。
- 宠物等级门槛使用更新后的玩家等级。

### Manual Smoke Scenario

1. 让玩家接近升级阈值并携带宠物。
2. 击杀一个会触发玩家升级的怪物。
3. 对照 AS3 计算玩家经验、宠物经验和宠物是否升级。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:battle-pet-exp-reward`. The Original Symptom below remains as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again.

### AS3 Source of Truth

- `../BOE-O/scripts/iData/Battle.as`
- `../BOE-O/scripts/iData/iMonster/Monster.as`
- `../BOE-O/scripts/iGlobal/Player.as`
- `../BOE-O/scripts/iData/iPet/Pet.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/core/models/Player.ts`
- `src/core/models/Pet.ts`
- `scripts/assertMonsterRewardParity.mjs`

### Original Symptom

Before the repair, React had this issue: AS3 `Battle.giveTrophy()` calls `Player.addExp(this.monster.exp)`, then later reads `this.monster.exp` again for the active pet. Since `Monster.exp` depends on current `Player.combatPower`, map modifier, and luck, a kill that levels up the player can change the pet's reward value. React cached `expGain` once and gave that same stale value to both player and pet.

### Reviewed Evidence

- AS3 `Battle.as` reads `this.monster.exp` for the player and then reads it again for the pet.
- AS3 `Monster.as` recalculates `exp` on every getter read from current player and map state.
- AS3 `Pet.as` `addExp()` consumes the provided exp and gates leveling by `this.level - Player.lv > 5`.
- React `Battle.ts` stores `const expGain = this.monster.getExp(...)`, then later calls `this.pet.addExp(expGain, this.playerState.lv)`.
- Existing `assert:monster-reward` confirms pet exp forwarding but not the second-read AS3 reward order.

### Expected Behavior

- Player reward uses the AS3 monster exp value at kill time.
- After player exp settlement, pet reward reads or computes monster exp again in AS3 order.
- If player level-up changes `combatPower` or level gating, pet exp and pet leveling use the updated player state.
- Logs and loot accounting distinguish player exp from pet exp when the values differ.

### Forbidden Behavior

- Reusing the cached player exp value for the pet unconditionally.
- Computing pet exp from pre-level-up `combatPower` after the player has leveled.
- Testing only non-level-up reward fixtures.

### State Ownership

- `Monster.ts` owns the exp formula.
- `Battle.ts` owns AS3 `giveTrophy()` reward order.
- `Pet.ts` owns pet exp, level caps, and pet leveling.

### Acceptance Tests

- Needed: `npm run assert:battle-pet-exp-reward`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-pet-exp-reward` should cover:

- A kill that levels up the player.
- `getCombatPower()` differs before and after the player level-up.
- Player exp uses the first `monster.getExp()` value.
- Pet exp uses the second `monster.getExp()` value after the player state changes.
- Pet level gating uses the updated player level.

### Manual Smoke Scenario

1. Put the player close to the next level and equip an active pet.
2. Kill a monster that triggers player level-up.
3. Compare player exp, pet exp, and pet leveling against AS3.
