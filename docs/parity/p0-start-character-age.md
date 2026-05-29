# P0 Start Character And Age Parity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:start-character-age` 守住。下面的 Current Symptom 保留为原始回归场景说明；后续只在 guard 变红或出现新角色/年龄选择症状时重新打开。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/RaceList.as`
- `reference/as3/BOE-O/scripts/iData/Race.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/Main_fla/MainTimeline.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as`

### React Targets

- `src/components/scenes/RaceScene.tsx`
- `src/core/data/raceData.ts`
- `src/core/models/Race.ts`
- `src/core/models/Player.ts`
- `src/state/GameContext.tsx`

### Current Symptom

进入游戏后的角色/年龄选择界面与原作明显不同；年龄选择、种族顺序、初始属性预览、确认后的开局状态都需要重新按 AS3 对照。

### Expected Behavior

- 种族列表、顺序、名称、基础属性和成长表来自 `RaceList.list`。
- 年龄范围、初始属性计算、升级成长和 AP 获得逻辑必须与 `Player.burn()`、`Player.ageup()`、`Player.levelUp()` 一致。
- 开局后玩家状态、初始装备、技能列表、背包容量、宠物容量、地图和战斗启动顺序必须能追溯到 AS3。
- UI 可以用 React 表达，但不能改变玩家可见选择流程和确认语义。

### Forbidden Behavior

- 用新设计的角色创建流程替代 AS3 流程。
- 允许 AS3 不存在的年龄范围、种族顺序或默认种族。
- 只更新 `state.player`，但没有同步战斗中的玩家副本。
- 根据 React 组件现状倒推规则。

### State Ownership

- `RaceScene.tsx` 只负责展示选择和发出动作。
- `Player.ts` 负责年龄、种族、初始属性和成长公式。
- `GameContext.tsx` 负责场景切换、`PLAYER_BURN`/`DO_REBIRTH`、战斗同步和玩家可见日志。

### Acceptance Tests

- Existing: `npm run assert:growth-skill-protection`
- Existing: `npm run assert:architecture`
- Needed: `npm run assert:start-character-age`
- Always run: `npx tsc -b`

`assert:start-character-age` 应覆盖：

- `RaceList` 数量、顺序、名称和每个年龄的属性预览。
- 10 到 17 岁边界。
- 选择某个种族/年龄后，玩家基础属性、年龄、种族名、初始装备和场景切换符合 AS3。

### Manual Smoke Scenario

1. 新开游戏，进入角色选择。
2. 逐个切换种族，确认顺序、名称和属性预览。
3. 调整年龄到 10、14、17 岁，确认属性变化。
4. 开始游戏，检查玩家年龄、种族、初始装备和第一场战斗状态。
5. 检查玩家的年龄成长是否生效
## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:start-character-age`. The Current Symptom below remains as original regression context; reopen it only if the guard turns red or a new character/age-selection symptom appears.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/RaceList.as`
- `reference/as3/BOE-O/scripts/iData/Race.as`
- `reference/as3/BOE-O/scripts/iGlobal/Player.as`
- `reference/as3/BOE-O/scripts/Main_fla/MainTimeline.as`
- `reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as`

### React Targets

- `src/components/scenes/RaceScene.tsx`
- `src/core/data/raceData.ts`
- `src/core/models/Race.ts`
- `src/core/models/Player.ts`
- `src/state/GameContext.tsx`

### Current Symptom

The character and age selection screen differs from the original. Age selection, race order, stat preview, and post-confirm start state must be rechecked against AS3.

### Expected Behavior

- Race list, order, names, base stats, and growth tables come from `RaceList.list`.
- Age range, initial stat calculation, age growth, and AP gain match `Player.burn()`, `Player.ageup()`, and `Player.levelUp()`.
- Player state, starter equipment, skill list, inventory capacity, pet capacity, map, and battle startup must be traceable to AS3.
- React may express the UI differently internally, but must not change the player-visible selection flow or confirmation meaning.

### Forbidden Behavior

- Replacing the AS3 character creation flow with a new design.
- Allowing ages, race order, or default races that do not exist in AS3.
- Updating only `state.player` without synchronizing the live battle player copy.
- Inferring rules from current React components instead of AS3.

### State Ownership

- `RaceScene.tsx` renders choices and dispatches actions.
- `Player.ts` owns age, race, initial stats, and growth formulas.
- `GameContext.tsx` owns scene transitions, `PLAYER_BURN`/`DO_REBIRTH`, battle synchronization, and visible logs.

### Acceptance Tests

- Existing: `npm run assert:growth-skill-protection`
- Existing: `npm run assert:architecture`
- Needed: `npm run assert:start-character-age`
- Always run: `npx tsc -b`

`assert:start-character-age` should cover:

- `RaceList` count, order, names, and stat previews for each age.
- Age boundaries from 10 to 17.
- After choosing a race and age, player base stats, age, race name, starter equipment, and scene transition match AS3.

### Manual Smoke Scenario

1. Start a new game and enter character selection.
2. Switch through every race and confirm order, names, and stat preview.
3. Move age to 10, 14, and 17, then confirm stat changes.
4. Start the game and inspect player age, race, starter equipment, and first battle state.
5. Check if the player's age growth is in effect.
