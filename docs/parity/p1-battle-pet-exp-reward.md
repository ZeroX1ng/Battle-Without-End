# P1 Battle Pet Exp Reward Recalculation Parity

Last updated: 2026-06-02

## 中文

### 当前状态

2026-06-02 试玩回归复核：本卡继续由 `npm run assert:battle-pet-exp-reward` 守住，并扩展覆盖 transition cloning 后的当前宠物所有权。奖励结算必须给 `playerState.pet` 中的当前宠物，而不是旧 `battle.pet` 克隆；但若战斗内宠物已经死亡并让 `battle.pet` 变为 `null`，奖励分支仍必须按 AS3 跳过，不得从 `playerState.pet` 复活发奖。`npm run assert:pet-window` 另行覆盖主动宠物取消出战时回到可用列表。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as`
- `reference/as3/BOE-O/scripts/iData/iMonster/Monster.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iData/iPet/Pet.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/core/models/Player.ts`
- `src/core/models/Pet.ts`
- `scripts/assertMonsterRewardParity.mjs`
- `scripts/assertPetWindowParity.mjs`

### Original Symptom

修复前的 React 问题是：AS3 `Battle.giveTrophy()` 对玩家调用 `Player.addExp(this.monster.exp)` 后，在宠物奖励处再次读取 `this.monster.exp`。由于 `Monster.exp` 依赖当前 `Player.combatPower`、地图 modifier 和幸运值，若玩家获得经验后升级并改变战斗力，宠物获得的经验会按升级后的玩家状态重新计算。React 先缓存 `expGain`，玩家和宠物都使用同一个旧值，因此在击杀导致玩家升级时，宠物经验可能与 AS3 不同。

### Reviewed Evidence

- AS3 `Battle.as` 先执行 `Player.addExp(this.monster.exp)`，后续宠物分支又执行 `this.pet.addExp(this.monster.exp)`。
- AS3 `Monster.as` 的 `exp` getter 每次读取都会用当前 `Player.combatPower`、`Global.map.mapData.modifier` 和 `Player.luck` 重新计算。
- AS3 `Pet.as` `addExp()` 使用传入经验值，并根据 `this.level - Player.lv > 5` 限制升级。
- 修复前 React `Battle.ts` 在 `giveTrophy()` 中先 `const expGain = this.monster.getExp(...)`，玩家加经验后仍用 `this.pet.addExp(expGain, this.playerState.lv)`。
- 现有 `assert:monster-reward` 只确认宠物收到 defeated-monster exp，不区分 AS3 的“第二次读取 monster.exp”语义。
- AS3 `Battle.as` 初始化时从 `Player.pet` 读取 `this.pet`，`checkDead()` 在宠物 HP 归零后设置 `this.pet = null`，`giveTrophy()` 只在 `if(this.pet)` 内给宠物经验。
- React 的 battle transition cloning 会让 `battle.pet` 旧克隆和 `battle.playerState.pet` 当前宠物实例分离，因此奖励目标需要在仍有战斗宠物时重新绑定到当前玩家宠物。

### Expected Behavior

- 玩家经验奖励使用击杀瞬间的 AS3 `monster.exp`。
- 玩家经验结算完成后，宠物经验应按 AS3 顺序再次读取/计算 `monster.exp`。
- 若玩家升级改变 `combatPower` 或等级门槛，宠物经验和升级限制应使用更新后的玩家状态。
- 日志和 loot 汇总需要明确玩家经验和宠物经验可能不是同一个数值。
- battle transition cloning 后，仍在战斗中的当前宠物获得经验，旧 `battle.pet` 克隆不获得经验。
- 宠物已在战斗中倒下时，`battle.pet = null` 必须继续阻止宠物奖励。
- 主动宠物取消出战后仍应保留在 `petList`，玩家可以再次选择。

### Forbidden Behavior

- 把玩家经验缓存值无条件复用给宠物。
- 在玩家升级后仍用升级前 `combatPower` 计算宠物经验。
- 只用不会升级的夹具验证奖励流。
- 把经验发给 transition 前的旧宠物克隆。
- 从 `playerState.pet` 复活已经在战斗中倒下的宠物并补发奖励。
- 取消出战时清空主动宠物但不把它放回可用列表。

### State Ownership

- `Monster.ts` 继续拥有经验公式。
- `Battle.ts` 负责按 AS3 `giveTrophy()` 顺序读取玩家经验与宠物经验。
- `Pet.ts` 负责宠物经验、等级上限和宠物升级。

### Acceptance Tests

- Needed: `npm run assert:battle-pet-exp-reward`
- Needed: `npm run assert:pet-window`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-pet-exp-reward` should cover:

- 击杀怪物让玩家刚好升级。
- 玩家升级前后的 `getCombatPower()` 不同。
- 玩家经验使用第一次 `monster.getExp()`。
- 宠物经验使用玩家升级后的第二次 `monster.getExp()`。
- 宠物等级门槛使用更新后的玩家等级。
- transition cloning 后旧 `battle.pet` 克隆不获得奖励，当前 `playerState.pet` 获得奖励。
- `battle.pet = null` 时不会从 `playerState.pet` 复活宠物奖励分支。
- 主动宠物取消出战会清空 active slot，并把宠物保留在 `petList`。

### Manual Smoke Scenario

1. 让玩家接近升级阈值并携带宠物。
2. 击杀一个会触发玩家升级的怪物。
3. 对照 AS3 计算玩家经验、宠物经验和宠物是否升级。
4. 打开宠物页取消当前出战宠物，确认宠物回到列表且可以再次出战。

## English

### Current Status

2026-06-02 playtest regression review: this card remains guarded by `npm run assert:battle-pet-exp-reward`, now extended for current-pet ownership after transition cloning. Reward settlement must target the current pet in `playerState.pet`, not the old `battle.pet` clone; however, if the battle pet has already died and `battle.pet` is `null`, the reward branch must still be skipped in AS3 order. `npm run assert:pet-window` separately guards that canceling the active pet returns it to the available list.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/Battle.as`
- `reference/as3/BOE-O/scripts/iData/iMonster/Monster.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/iData/iPet/Pet.as`

### React Targets

- `src/core/models/Battle.ts`
- `src/core/models/Monster.ts`
- `src/core/models/Player.ts`
- `src/core/models/Pet.ts`
- `scripts/assertMonsterRewardParity.mjs`
- `scripts/assertPetWindowParity.mjs`

### Original Symptom

Before the repair, React had this issue: AS3 `Battle.giveTrophy()` calls `Player.addExp(this.monster.exp)`, then later reads `this.monster.exp` again for the active pet. Since `Monster.exp` depends on current `Player.combatPower`, map modifier, and luck, a kill that levels up the player can change the pet's reward value. React cached `expGain` once and gave that same stale value to both player and pet.

### Reviewed Evidence

- AS3 `Battle.as` reads `this.monster.exp` for the player and then reads it again for the pet.
- AS3 `Monster.as` recalculates `exp` on every getter read from current player and map state.
- AS3 `Pet.as` `addExp()` consumes the provided exp and gates leveling by `this.level - Player.lv > 5`.
- React `Battle.ts` stores `const expGain = this.monster.getExp(...)`, then later calls `this.pet.addExp(expGain, this.playerState.lv)`.
- Existing `assert:monster-reward` confirms pet exp forwarding but not the second-read AS3 reward order.
- AS3 `Battle.as` initializes `this.pet` from `Player.pet`, sets `this.pet = null` when the pet HP reaches zero, and awards pet exp only inside `if(this.pet)`.
- React battle transition cloning can split the old `battle.pet` clone from the current pet on `battle.playerState.pet`, so the reward target must be rebound only while a battle pet is still alive.

### Expected Behavior

- Player reward uses the AS3 monster exp value at kill time.
- After player exp settlement, pet reward reads or computes monster exp again in AS3 order.
- If player level-up changes `combatPower` or level gating, pet exp and pet leveling use the updated player state.
- Logs and loot accounting distinguish player exp from pet exp when the values differ.
- After battle transition cloning, the current active pet receives the reward and the stale `battle.pet` clone does not.
- If the pet has fallen in battle, `battle.pet = null` continues to block the pet reward branch.
- Canceling the active pet keeps it in `petList` so the player can equip it again.

### Forbidden Behavior

- Reusing the cached player exp value for the pet unconditionally.
- Computing pet exp from pre-level-up `combatPower` after the player has leveled.
- Testing only non-level-up reward fixtures.
- Awarding exp to the stale pre-transition pet clone.
- Reviving a defeated battle pet from `playerState.pet` during reward settlement.
- Clearing the active pet on cancel without returning it to the available list.

### State Ownership

- `Monster.ts` owns the exp formula.
- `Battle.ts` owns AS3 `giveTrophy()` reward order.
- `Pet.ts` owns pet exp, level caps, and pet leveling.

### Acceptance Tests

- Needed: `npm run assert:battle-pet-exp-reward`
- Needed: `npm run assert:pet-window`
- Existing adjacent: `npm run assert:monster-reward`
- Existing adjacent: `npm run assert:battle-damage-log-death`
- Always run: `npx tsc -b`

`assert:battle-pet-exp-reward` should cover:

- A kill that levels up the player.
- `getCombatPower()` differs before and after the player level-up.
- Player exp uses the first `monster.getExp()` value.
- Pet exp uses the second `monster.getExp()` value after the player state changes.
- Pet level gating uses the updated player level.
- The stale `battle.pet` clone does not receive reward after transition cloning; the current `playerState.pet` does.
- `battle.pet = null` does not revive a pet reward from `playerState.pet`.
- Canceling the active pet clears the active slot and keeps the pet in `petList`.

### Manual Smoke Scenario

1. Put the player close to the next level and equip an active pet.
2. Kill a monster that triggers player level-up.
3. Compare player exp, pet exp, and pet leveling against AS3.
4. Open the pet window, cancel the active pet, and confirm the pet returns to the list and can be equipped again.
