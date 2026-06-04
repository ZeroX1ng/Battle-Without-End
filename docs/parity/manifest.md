# BWE AS3 Parity Manifest

Last updated: 2026-06-04 (battle formula code review)

## 中文

### 使用方式

这是 AI 修复和审阅顺序的总表。P0 条目当前已有 guard 保护；后续如果出现新问题、guard 变红或需要浏览器 smoke，只选一个条目，先读 AS3，再补/确认 guard，再做最小修复。

**2026-06-04 重要提示：** 2026-06-04 战斗公式代码审阅已完成。8 张卡中 P1-MON-ATK-GET 经确认与 AS3 原版行为一致（getter 每次重新随机是原版设计），已标记为 AS3-identical。剩余 7 张：P0-DMG-FLAT（伤害固定值根因）和 P1-CALCPROT-DUP（护甲公式重复）为最高优先级，P0-TITLE-TRUNC / P1-EQUIP-MINMAX / P2-ATK-DBL-TRUNC 需先对照 AS3 确认原版行为，P1-BALRAND-DIV0 和 P2-TAUNT-PROB 为明确的边界/逻辑缺陷。建议顺序：P0-DMG-FLAT → P1-CALCPROT-DUP → P2-TAUNT-PROB，每张卡必须先对照 AS3 源码再动手。

| ID | 优先级 | 模块 | 状态 | 规格卡 | AS3 源 | React 目标 | 当前症状 | 验收 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0-START | P0 | 角色与年龄选择 | Guarded | `p0-start-character-age.md` | `RaceList.as`, `Player.as`, `MainTimeline.as`, `MainScene.as` | `RaceScene.tsx`, `raceData.ts`, `Player.ts`, `GameContext.tsx` | 进入游戏后的角色和年龄选择界面/流程与原作不同 | Existing: `assert:growth-skill-protection`, `assert:start-character-age`; Next: browser smoke |
| P0-START-BURN | P0 | 创建初始状态与自动存档 | Guarded | `p0-start-burn-save.md` | `Player.as`, `RaceScene.as` | `Player.ts`, `GameContext.tsx`, `SaveSystem.ts`, `actions.ts` | 新建角色初始装备、12 个初始技能和创建后即时存档已由 guard 覆盖；转生软重置另见 `p0-rebirth-soft-reset-player-state.md` | Existing: `assert:start-burn-save`; Adjacent: `assert:growth-skill-protection`, `assert:equipment-ownership`, `assert:save-persistence`; Always: `npx tsc -b` |
| P0-REBIRTH-SOFT | P0 | 转生软重置状态保留 | Guarded | `p0-rebirth-soft-reset-player-state.md` | `Player.as`, `OtherWindow.as`, `RaceScene.as` | `Player.ts`, `GameContext.tsx`, `SaveSystem.ts`, `actions.ts` | `DO_REBIRTH` 只重算年龄/种族/等级/基础和派生状态，并保留装备、背包、金币、AP、宠物、技能、已装备技能和称号；转生后保存已由 guard 覆盖；Next: browser smoke | Existing: `assert:rebirth-soft-reset-player-state`; Adjacent: `assert:start-burn-save`, `assert:title-state-ownership`, `assert:title-data-save-parity`, `assert:growth-skill-protection`, `assert:equipment-ownership`, `assert:save-persistence`; Always: `npx tsc -b` |
| P0-BATTLE | P0 | 战斗伤害、日志、死亡 | Guarded | `p0-battle-damage-log-death.md` | `Battle.as`, `Player.as`, `MainScene.as` | `Battle.ts`, `GameContext.tsx`, `MainScene.tsx` | 战斗日志缺少玩家受到伤害记录，玩家看起来直接死亡 | Existing: `assert:battle-player-state`, `assert:monster-reward`, `assert:battle-damage-log-death`; Next: review queue |
| P0-LOOP | P0 | 游戏循环与 Hook 心跳 | Guarded | `p0-game-loop-hook-parity.md` | `Battle.as`, `MainScene.as`, `Player.as` | `GameLoop.ts`, `useGameLoop.ts`, `MainScene.tsx`, `GameContext.tsx`, `Battle.ts` | Hook 已用 elapsed time 补偿后台期间错过的逻辑 tick，主心跳不再把 `GAME_TICK` 当正常路径；Next: browser background smoke | Existing: `assert:game-loop`; Adjacent: `assert:battle-player-state`, `assert:battle-damage-log-death`, `assert:save-persistence`; Always: `npx tsc -b` |
| P0-EQUIP | P0 | 装备所有权 | Guarded | `p0-equipment-ownership.md` | `Player.as`, `Equipment.as`, `EquipWindow.as`, `EquipCell.as` | `Player.ts`, `Equipment.ts`, `EquipWindow.tsx`, `GameContext.tsx` | 切换装备后，脱下装备像是复制了一份进仓库 | Existing: `assert:equip-window`, `assert:equipment-data`, `assert:stat-list`, `assert:equipment-ownership`; Next: browser smoke |
| P0-MAP | P0 | 地图默认值与切换 | Guarded | `p0-map-selection.md` | `MapList.as`, `Map.as`, `MapPanel.as`, `Player.as` | `mapData.ts`, `Map.ts`, `MapWindow.tsx`, `GameContext.tsx` | 地图选择不可见或不可确认，默认地图来源不清楚 | Existing: `assert:map-data`, `assert:map-selection`; Next: browser smoke |
| P0-MAP-DATA | P0 | 地图静态表与 Map 模型 | Guarded | `p0-map-data-model-parity.md` | `MapList.as`, `MapData.as`, `Map.as` | `mapData.ts`, `Map.ts`, `types.ts`, `assertMapDataParity.mjs` | 地图静态表、Vaith 中文名、`petList` 类型边界和 `Map` 模型 guard 已对齐 AS3；Next: browser smoke | Existing: `assert:map-data`; Adjacent: `assert:map-selection`, `assert:monster-reward`; Always: `npx tsc -b` |
| P0-MONSTER-DATA | P0 | 怪物静态表与宠物类型完整性 | Guarded | `p0-monster-data-integrity.md` | `MonsterList.as`, `MonsterData.as`, `MonsterTitleList.as`, `PetDataList.as`, `MapList.as` | `monsterData.ts`, `petData.ts`, `mapData.ts`, `constants.ts`, `types.ts` | 119 个 AS3 怪物、22 个标题、PetTypes 和地图怪物引用已由 guard 覆盖；Next: browser smoke | Existing: `assert:monster-data-integrity`; Adjacent: `assert:monster-data-immutable`, `assert:monster-reward`, `assert:map-data`; Always: `npx tsc -b` |
| P0-SAVE-PERSIST | P0 | 存档写入生命周期 | Guarded | `p0-save-persistence.md` | `Player.as`, `Battle.as`, `SaveScene.as` | `SaveSystem.ts`, `GameContext.tsx`, `actions.ts`, `SaveScene.tsx` | 创建、命名、缺少 active slot 时的保存策略和手动导入入口已由 guard 覆盖；Next: browser smoke | Existing: `assert:save-persistence`; Adjacent: `assert:start-burn-save`, `assert:save-load-runtime-continuity`, `assert:architecture`; Always: `npx tsc -b` |
| P0-SAVELOAD | P0 | 存档读取与运行时连续性 | Guarded | `p0-save-load-runtime-continuity.md` | `Player.as`, `SaveScene.as`, `MainScene.as`, `Battle.as`, `RaceList.as`, `Equipment.as`, `Monster.as`, `Boss.as` | `SaveSystem.ts`, `Base64.ts`, `GameContext.tsx`, `SystemConfig.ts`, `Battle.ts`, `Monster.ts`, `SaveScene.tsx` | 种族、true/false 开关、读档后 Battle 重建和当前槽自动保存已由 guard 覆盖；Next: browser smoke | Existing: `assert:save-load-runtime-continuity`; Adjacent: `assert:start-character-age`, `assert:map-selection`, `assert:monster-reward`, `assert:system-window`; Always: `npx tsc -b` |
| P0-SKILL | P0 | 技能装备限制与战斗生效 | Guarded | `p0-skill-eligibility-effects.md` | `SkillWindow.as`, `ActiveSkill.as`, `SkillDataList.as`, `Player.as`, `WeaponType.as` | `SkillWindow.tsx`, `BattleSkillPanel.tsx`, `Skill.ts`, `Player.ts`, `Battle.ts`, `skillData.ts` | 技能可以随意装备且不生效，没有远程武器也能使用远程技能 | Existing: `assert:skill-window`, `assert:growth-skill-protection`, `assert:skill-eligibility-effects`; Next: browser smoke |
| P0-SKILL-DATA | P0 | 技能静态数值与 load 类型 | Guarded | `p0-skill-data-values.md` | `SkillDataList.as`, `SkillData.as`, `PassiveSkillData.as`, `ActiveSkillData.as`, `Skill.as`, `Player.as` | `skillData.ts`, `Skill.ts`, `Player.ts`, `assertSkillDataValuesParity.mjs` | 18 个技能的静态表、`balance` 维度、主动 `setList` 和 `Skill.load()` 类型恢复已由 guard 覆盖；Next: browser smoke | Existing: `assert:skill-data-values`; Adjacent: `assert:skill-eligibility-effects`, `assert:growth-skill-protection`; Always: `npx tsc -b` |

### 后续推进顺序建议

1. **战斗公式修复 2026-06-04**：按优先级 `P0-DMG-FLAT` → `P1-CALCPROT-DUP` → `P2-TAUNT-PROB` 处理，每张卡必须先对照 AS3 确认原版行为再修复。`P1-BALRAND-DIV0` 可在任一步骤中穿插添加 guard。`P0-TITLE-TRUNC` / `P1-EQUIP-MINMAX` / `P2-ATK-DBL-TRUNC` 目前标记为 Needs AS3 verification——需先读 AS3 确认行为是否一致，若一致则降级为 AS3-identical 无需修复，若不一致则升级为 Needs repair。
2. `P1-MON-ATK-GET` 已确认 AS3-identical：Monster/Pet attack getter 每次随机是 AS3 原版设计，无需修复。
3. 浏览器 smoke：逐项确认新近 Guarded 的玩家可见流程，优先 `p0-start-burn-save.md`、`p0-save-persistence.md`、`p0-save-load-runtime-continuity.md`、`p0-game-loop-hook-parity.md`。
4. 静态表可见性抽查：打开地图、技能、怪物信息相关窗口，确认 `p0-map-data-model-parity.md`、`p0-skill-data-values.md`、`p0-monster-data-integrity.md` 的 guard 结果在 UI 中没有被展示层破坏。
5. Battle core formula cards：当前均为 Guarded；仅在出现新漂移或 guard 变红时，按下面表格一次复核一张。
6. Battle review queue：`p0-battle-fix-deepseek260519.md` 当前队列均已有 focused guard；仅在出现新症状时按单行复核。
7. Equipment review queue：`p0-equipment-deepseek.md` 当前队列已 Guarded / intentional divergence；仅在装备新回归出现时按单行复核。
8. 新问题审阅：先写短 audit，再决定是否新增 parity 卡。
9. 重构工作：只做已有 guard 覆盖范围内的小步重构。

### 战斗核心公式复核卡

| Card | Priority | Topic | Current Status | Acceptance |
| --- | --- | --- | --- | --- |
| `p0-battle-numeric-coercion.md` | P0 | AS3 `int` 截断边界与 React 浮点数漂移 | Guarded | Existing: `assert:battle-numeric-coercion`; Adjacent: `assert:growth-skill-protection`, `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-active-skill-single-roll.md` | P1 | 玩家攻击技能每回合只随机尝试一个 | Guarded | Existing: `assert:battle-active-skill-single-roll`; Adjacent: `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-pet-exp-reward.md` | P1 | 玩家升级后宠物经验应按 AS3 再次读取怪物经验，并守住 transition cloning 后的当前宠物所有权 | Guarded | Existing: `assert:battle-pet-exp-reward`, `assert:pet-window`; Adjacent: `assert:monster-reward`, `assert:battle-damage-log-death` |
| `p1-battle-pet-flow-logs.md` | P1 | 宠物战斗日志、插值和随机消耗顺序 | Guarded | Existing: `assert:battle-pet-flow-logs`; Adjacent: `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:text-resources` |

### 战斗公式代码审阅 2026-06-04

2026-06-04 新增：对战斗底层公式的完整代码审阅。核心发现是伤害值固定（无 min-max 波动）的根因——多个环节协同压缩了攻击力 min-max 差距。以下卡片按严重程度分级，每张卡片标记了时间戳 `-20260604` 便于追踪。

| ID | 优先级 | 模块 | 状态 | 规格卡 | 验收 |
| --- | --- | --- | --- | --- | --- |
| P0-DMG-FLAT | P0 | 伤害固定值 — min-max 差距压缩 | Needs repair | `p0-battle-damage-flat-20260604.md` | 根因：`Stat.ATTACK` 等量增加 min/max、`formula_title_stat` 过早截断、`balanceRandom` 0.01 步进 + `Math.trunc` 离散化；Next: 对照 AS3 确认原版 min-max 差距来源，逐项修复 |
| P0-TITLE-TRUNC | P0 | `formula_title_stat` 截断压缩 min-max | Needs AS3 verification | `p0-battle-formula-title-trunc-20260604.md` | `as3Int(value)` 在称号乘法前截断使 `str/3` vs `str/2.5` 差异丢失；Next: 对照 AS3 `Player.as` 确认 `int()` 确切时机，若截断顺序与 AS3 一致则无需改动 |
| P1-MON-ATK-GET | P1 | Monster/Pet attack getter 随机副作用 | AS3-identical | `p1-battle-monster-attack-getter-20260604.md` | AS3 原版 `Monster.attack` / `Pet.attack` 也是 getter 每次重新随机，React 行为与原版一致；无需修改 |
| P1-CALCPROT-DUP | P1 | 护甲公式重复实现且负护甲阈值不一致 | Needs repair | `p1-battle-calcprotection-duplicate-20260604.md` | `Battle.ts` 阈值 -100 vs `skillBehaviors.ts` 阈值 -1000；Next: 对照 AS3 确认正确阈值，统一为单一实现 |
| P1-EQUIP-MINMAX | P1 | 装备生成 min>max 修复过于粗暴 | Needs AS3 verification | `p1-equip-attack-minmax-fix-20260604.md` | `generateBasicStat` 将 min 直接设为 max 值导致 min==max；Next: 对照 AS3 确认原版处理方式，若 AS3 也如此则无需改动 |
| P1-BALRAND-DIV0 | P1 | `balanceRandom(100)` 除零边界 | Needs repair | `p1-math-balancerandom-divzero-20260604.md` | `(100 - _loc2_)` 分母为 0 产生 Infinity；Next: 对照 AS3 确认边界处理，添加显式 guard |
| P2-TAUNT-PROB | P2 | 宠物 Taunt 技能缺少概率判定 | Needs repair | `p2-battle-pet-taunt-probability-20260604.md` | `monsterTurn()` 中有 Taunt 技能时无条件攻击宠物；Next: 对照 AS3 添加概率检查 |
| P2-ATK-DBL-TRUNC | P2 | `getAttack` 双重截断精度损失 | Needs AS3 verification | `p2-battle-getattack-double-trunc-20260604.md` | `getAttMin`/`getAttMax` 已截断 + `getAttack` 再截断；Next: 对照 AS3 确认截断次数和位置，若 AS3 也是双重截断则无需改动 |

### 状态含义

- `Needs repair`: 已发现玩家可见错误，缺少完整行为还原。
- `Needs AS3 verification`: 行为待对照 AS3 确认——可能已是原版行为，无需修复；也可能存在漂移。
- `AS3-identical`: 已确认与原版行为一致，无需修改。
- `Guard needed`: 行为已定位，但还没有可执行 guard。
- `Guarded`: 已有 guard 覆盖核心行为，但仍需浏览器 smoke。
- `Verified`: guard 和玩家可见 smoke 都通过。

### 试玩 Follow-up 队列

| ID | 优先级 | 模块 | 状态 | 规格卡 | 验收 |
| --- | --- | --- | --- | --- | --- |
| PLAYTEST-2026-05-25 | Mixed | 试玩发现 follow-up | Queued | `playtest-followups-2026-05-25.md` | 每次只选择一个卡片 ID；先读 AS3，先补/确认 red guard，再做最小修复；最后跑专属 guard、相邻 guard、`npx tsc -b` 和 UI smoke |
| P1-MONSTER-TITLE-TOOLTIP | P1 | 怪物称号 HTML 浮窗 | Verified | `playtest-followups-2026-05-25.md#p1-monster-title-tooltip` | AS3 `MonsterTitle.description` 只展示 `statMulList` 属性加值/倍率；`assert:monster-title-tooltip`、相邻 monster guards、`npx tsc -b` 和浏览器 smoke 已通过 |
| P2-TEST-SPEED-CONTROL | P2 | 临时测试倍率控件 | Verified | `playtest-followups-2026-05-25.md#p2-test-speed-control` | 临时 feature flag 下提供 `1x/10x/25x/50x` 和紧凑"无敌"主界面控件；倍率只改变 `useGameLoop` effective interval，"无敌"只在开启时通过 `BATTLE_TICK` meta 传入当前战斗，二者都不进入存档；`assert:test-speed-control`、相邻 loop/age guards、`npx tsc -b` 和浏览器 smoke 已通过 |
| PLAYTEST-2026-06-04 | Mixed | 2026-06-04 试玩发现 follow-up | Queued | `playtest-followups-2026-06-04.md` | 每次只选择一个卡片 ID；先读 AS3，先补/确认 red guard，再做最小修复；最后跑专属 guard、相邻 guard、`npx tsc -b` 和 UI smoke |
| P0-BATTLE-INIT-HEAL | P0 | 战斗初始化回血 | Verified | `playtest-followups-2026-06-04.md#p0-battle-init-heal` | AS3 `Battle.init()` 与 React `Battle.init()` 均在击杀后重读最大 HP/MP；已确认是原作行为，无需修复 |
| P1-PLAYER-INFO-DISPLAY | P1 | 角色状态栏显示 | Verified | `playtest-followups-2026-06-04.md#p1-player-info-display` | 状态栏攻击范围、主属性基础值括号/红金着色、暴击倍数百分比已由 `assert:stat-list` 覆盖；`assert:equip-window`、`npx tsc -b` 和浏览器 smoke 已通过 |

### Architecture Review Queue

2026-05-30 新增架构审阅队列：`architecture-review-queue-2026-05-30.md`。这些条目每次只处理一张；`No AS3; React architecture review` 条目不强行寻找 AS3，但必须保持已有 AS3 parity guard 绿色。

| ID | Priority | Module | Status | Card | Acceptance |
| --- | --- | --- | --- | --- | --- |
| A-R1 | P0 | Reducer purity and StrictMode | Guarded | `p0-architecture-reducer-purity-strictmode.md` | Existing: `assert:reducer-purity-strictmode`; Adjacent: `assert:architecture`, `assert:forge-logic`, `assert:start-burn-save`, `assert:save-persistence`, `assert:title-data-save-parity`; Always: `npx tsc -b` |
| A-R2 | P0 | Title state ownership | Guarded | `p0-title-state-ownership.md` | Existing: `assert:title-state-ownership`; Adjacent: `assert:title-data-save-parity`, `assert:title-window`, `assert:save-load-runtime-continuity`, `assert:architecture`; Always: `npx tsc -b` |
| A-R3 | P1 | Battle state immutability | Guarded | `p1-battle-state-immutability.md` | Existing: `assert:battle-state-immutability`; Adjacent: `assert:battle-player-state`, `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:architecture`; Always: `npx tsc -b` |
| A-R4 | P1 | Domain type boundaries | Guarded | `p1-domain-type-boundaries.md` | Existing: `assert:domain-type-boundaries`; Adjacent: `assert:architecture`, `assert:battle-player-state`, `assert:equipment-ownership`, `assert:title-data-save-parity`; Always: `npx tsc -b` |
| A-R5 | P2 | Guard gate reproducibility | Guarded | `p2-guard-gate-reproducibility.md` | Existing: `npm test`, `assert:preflight`, `assert:gate:ci`, `assert:gate:all`; Always: `npx tsc -b` |
| A-R6 | P2 | Build artifact and Vite config hygiene | Guarded | `p2-build-artifact-config-hygiene.md` | Existing: `assert:repo-hygiene`, `assert:source-encoding`, `assert:text-resources`; Build/package checks only if policy changes; Always: `npx tsc -b` |
| A-R7 | P2 | Module boundary decomposition | Guarded | `p2-module-boundary-decomposition.md` | Existing: `assert:module-boundary-decomposition`; Adjacent: `assert:reducer-purity-strictmode`, `assert:architecture`, `assert:gate:changed`; Always: `npx tsc -b` |

## English

### How To Use

This is the repair and review order for AI work. P0 items are currently guarded. For future work, pick one new issue, red guard, or browser-smoke target, read AS3 first, add or confirm the guard, then make the smallest repair.

| ID | Priority | Module | Status | Card | AS3 Sources | React Targets | Current Symptom | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0-START | P0 | Character and age selection | Guarded | `p0-start-character-age.md` | `RaceList.as`, `Player.as`, `MainTimeline.as`, `MainScene.as` | `RaceScene.tsx`, `raceData.ts`, `Player.ts`, `GameContext.tsx` | The in-game character and age selection flow differs from the original | Existing: `assert:growth-skill-protection`, `assert:start-character-age`; Next: browser smoke |
| P0-START-BURN | P0 | Creation startup state and auto-save | Guarded | `p0-start-burn-save.md` | `Player.as`, `RaceScene.as` | `Player.ts`, `GameContext.tsx`, `SaveSystem.ts`, `actions.ts` | New-character starter equipment, 12 starter skills, and immediate save after creation are covered by a guard; rebirth soft reset is routed to `p0-rebirth-soft-reset-player-state.md` | Existing: `assert:start-burn-save`; Adjacent: `assert:growth-skill-protection`, `assert:equipment-ownership`, `assert:save-persistence`; Always: `npx tsc -b` |
| P0-REBIRTH-SOFT | P0 | Rebirth soft-reset state preservation | Guarded | `p0-rebirth-soft-reset-player-state.md` | `Player.as`, `OtherWindow.as`, `RaceScene.as` | `Player.ts`, `GameContext.tsx`, `SaveSystem.ts`, `actions.ts` | `DO_REBIRTH` only recalculates age/race/level/basic and derived state while preserving equipment, inventory, currency, AP, pets, skills, equipped skills, and titles; post-rebirth save is guarded; Next: browser smoke | Existing: `assert:rebirth-soft-reset-player-state`; Adjacent: `assert:start-burn-save`, `assert:title-state-ownership`, `assert:title-data-save-parity`, `assert:growth-skill-protection`, `assert:equipment-ownership`, `assert:save-persistence`; Always: `npx tsc -b` |
| P0-BATTLE | P0 | Battle damage, logs, and death | Guarded | `p0-battle-damage-log-death.md` | `Battle.as`, `Player.as`, `MainScene.as` | `Battle.ts`, `GameContext.tsx`, `MainScene.tsx` | Battle logs do not show player damage, and the player appears to die directly | Existing: `assert:battle-player-state`, `assert:monster-reward`, `assert:battle-damage-log-death`; Next: review queue |
| P0-LOOP | P0 | Game loop and hook heartbeat | Guarded | `p0-game-loop-hook-parity.md` | `Battle.as`, `MainScene.as`, `Player.as` | `GameLoop.ts`, `useGameLoop.ts`, `MainScene.tsx`, `GameContext.tsx`, `Battle.ts` | The hook now compensates missed logical ticks with elapsed time, and the main heartbeat no longer treats `GAME_TICK` as the normal path; Next: browser background smoke | Existing: `assert:game-loop`; Adjacent: `assert:battle-player-state`, `assert:battle-damage-log-death`, `assert:save-persistence`; Always: `npx tsc -b` |
| P0-EQUIP | P0 | Equipment ownership | Guarded | `p0-equipment-ownership.md` | `Player.as`, `Equipment.as`, `EquipWindow.as`, `EquipCell.as` | `Player.ts`, `Equipment.ts`, `EquipWindow.tsx`, `GameContext.tsx` | Switching equipment appears to duplicate the unequipped item into inventory | Existing: `assert:equip-window`, `assert:equipment-data`, `assert:stat-list`, `assert:equipment-ownership`; Next: browser smoke |
| P0-MAP | P0 | Default map and map switching | Guarded | `p0-map-selection.md` | `MapList.as`, `Map.as`, `MapPanel.as`, `Player.as` | `mapData.ts`, `Map.ts`, `MapWindow.tsx`, `GameContext.tsx` | Map selection is not visible or confirmed, and the default map source is unclear | Existing: `assert:map-data`, `assert:map-selection`; Next: browser smoke |
| P0-MAP-DATA | P0 | Static map table and Map model | Guarded | `p0-map-data-model-parity.md` | `MapList.as`, `MapData.as`, `Map.as` | `mapData.ts`, `Map.ts`, `types.ts`, `assertMapDataParity.mjs` | Static map data, Vaith's Chinese name, required `petList`, and Map model behavior are covered by a guard; Next: browser smoke | Existing: `assert:map-data`; Adjacent: `assert:map-selection`, `assert:monster-reward`; Always: `npx tsc -b` |
| P0-MONSTER-DATA | P0 | Monster static table and pet-type integrity | Guarded | `p0-monster-data-integrity.md` | `MonsterList.as`, `MonsterData.as`, `MonsterTitleList.as`, `PetDataList.as`, `MapList.as` | `monsterData.ts`, `petData.ts`, `mapData.ts`, `constants.ts`, `types.ts` | The 119 AS3 monsters, 22 titles, PetTypes, and map monster references are covered by a guard; Next: browser smoke | Existing: `assert:monster-data-integrity`; Adjacent: `assert:monster-data-immutable`, `assert:monster-reward`, `assert:map-data`; Always: `npx tsc -b` |
| P0-SAVE-PERSIST | P0 | Save write lifecycle | Guarded | `p0-save-persistence.md` | `Player.as`, `Battle.as`, `SaveScene.as` | `SaveSystem.ts`, `GameContext.tsx`, `actions.ts`, `SaveScene.tsx` | Creation, naming, missing active-slot save strategy, and manual import action wiring are covered by a guard; Next: browser smoke | Existing: `assert:save-persistence`; Adjacent: `assert:start-burn-save`, `assert:save-load-runtime-continuity`, `assert:architecture`; Always: `npx tsc -b` |
| P0-SAVELOAD | P0 | Save/load runtime continuity | Guarded | `p0-save-load-runtime-continuity.md` | `Player.as`, `SaveScene.as`, `MainScene.as`, `Battle.as`, `RaceList.as`, `Equipment.as`, `Monster.as`, `Boss.as` | `SaveSystem.ts`, `Base64.ts`, `GameContext.tsx`, `SystemConfig.ts`, `Battle.ts`, `Monster.ts`, `SaveScene.tsx` | Race restoration, true/false toggles, post-load Battle rebuild, and current-slot auto-save are covered by a guard; Next: browser smoke | Existing: `assert:save-load-runtime-continuity`; Adjacent: `assert:start-character-age`, `assert:map-selection`, `assert:monster-reward`, `assert:system-window`; Always: `npx tsc -b` |
| P0-SKILL | P0 | Skill eligibility and battle effects | Guarded | `p0-skill-eligibility-effects.md` | `SkillWindow.as`, `ActiveSkill.as`, `SkillDataList.as`, `Player.as`, `WeaponType.as` | `SkillWindow.tsx`, `BattleSkillPanel.tsx`, `Skill.ts`, `Player.ts`, `Battle.ts`, `skillData.ts` | Skills can be equipped freely, do not reliably take effect, and ranged skills work without ranged weapons | Existing: `assert:skill-window`, `assert:growth-skill-protection`, `assert:skill-eligibility-effects`; Next: browser smoke |
| P0-SKILL-DATA | P0 | Static skill values and load types | Guarded | `p0-skill-data-values.md` | `SkillDataList.as`, `SkillData.as`, `PassiveSkillData.as`, `ActiveSkillData.as`, `Skill.as`, `Player.as` | `skillData.ts`, `Skill.ts`, `Player.ts`, `assertSkillDataValuesParity.mjs` | The 18-skill static table, `balance` dimension, active `setList`, and typed `Skill.load()` restoration are covered by a guard; Next: browser smoke | Existing: `assert:skill-data-values`; Adjacent: `assert:skill-eligibility-effects`, `assert:growth-skill-protection`; Always: `npx tsc -b` |

### Recommended Next Order

1. **Battle formula fixes 2026-06-04**: Process in priority order `P0-DMG-FLAT` → `P1-CALCPROT-DUP` → `P2-TAUNT-PROB`. Every card requires cross-checking AS3 sources before any code change. `P1-BALRAND-DIV0` guard can be interleaved at any step. `P0-TITLE-TRUNC` / `P1-EQUIP-MINMAX` / `P2-ATK-DBL-TRUNC` are currently marked Needs AS3 verification — first confirm behavior against AS3; if identical, downgrade to AS3-identical (no fix needed); if divergent, escalate to Needs repair.
2. `P1-MON-ATK-GET` confirmed AS3-identical: Monster/Pet attack getter re-rolling on every access is AS3's original design. No code change needed.
3. Browser smoke: confirm newly Guarded player-visible flows first, especially `p0-start-burn-save.md`, `p0-save-persistence.md`, `p0-save-load-runtime-continuity.md`, and `p0-game-loop-hook-parity.md`.
4. Static-table visibility checks: open the map, skill, and monster-info related surfaces and confirm `p0-map-data-model-parity.md`, `p0-skill-data-values.md`, and `p0-monster-data-integrity.md` are not broken by presentation code.
5. Battle core formula cards: all are currently Guarded; re-open one card only when a new drift appears or a guard turns red.
6. Battle review queue: `p0-battle-fix-deepseek260519.md` rows currently have focused guards; re-open one row only for a new symptom.
7. Equipment review queue: `p0-equipment-deepseek.md` rows are Guarded / intentional divergence; re-open one row only for an equipment regression.
8. New issue review: write a short audit before adding a new parity card.
9. Refactor work: only make small refactors under existing guard coverage.

### Architecture Review Queue

The 2026-05-30 architecture queue is routed through `architecture-review-queue-2026-05-30.md`. Pick one item per session. Cards marked `No AS3; React architecture review` do not require forced AS3 lookup, but existing AS3 parity guards must remain green.

| ID | Priority | Module | Status | Card | Acceptance |
| --- | --- | --- | --- | --- | --- |
| A-R1 | P0 | Reducer purity and StrictMode | Guarded | `p0-architecture-reducer-purity-strictmode.md` | Existing: `assert:reducer-purity-strictmode`; Adjacent: `assert:architecture`, `assert:forge-logic`, `assert:start-burn-save`, `assert:save-persistence`, `assert:title-data-save-parity`; Always: `npx tsc -b` |
| A-R2 | P0 | Title state ownership | Guarded | `p0-title-state-ownership.md` | Existing: `assert:title-state-ownership`; Adjacent: `assert:title-data-save-parity`, `assert:title-window`, `assert:save-load-runtime-continuity`, `assert:architecture`; Always: `npx tsc -b` |
| A-R3 | P1 | Battle state immutability | Guarded | `p1-battle-state-immutability.md` | Existing: `assert:battle-state-immutability`; Adjacent: `assert:battle-player-state`, `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:architecture`; Always: `npx tsc -b` |
| A-R4 | P1 | Domain type boundaries | Guarded | `p1-domain-type-boundaries.md` | Existing: `assert:domain-type-boundaries`; Adjacent: `assert:architecture`, `assert:battle-player-state`, `assert:equipment-ownership`, `assert:title-data-save-parity`; Always: `npx tsc -b` |
| A-R5 | P2 | Guard gate reproducibility | Guarded | `p2-guard-gate-reproducibility.md` | Existing: `npm test`, `assert:preflight`, `assert:gate:ci`, `assert:gate:all`; Always: `npx tsc -b` |
| A-R6 | P2 | Build artifact and Vite config hygiene | Guarded | `p2-build-artifact-config-hygiene.md` | Existing: `assert:repo-hygiene`, `assert:source-encoding`, `assert:text-resources`; build/package checks only if policy changes; Always: `npx tsc -b` |
| A-R7 | P2 | Module boundary decomposition | Guarded | `p2-module-boundary-decomposition.md` | Existing: `assert:module-boundary-decomposition`; Adjacent: `assert:reducer-purity-strictmode`, `assert:architecture`, `assert:gate:changed`; Always: `npx tsc -b` |

### Battle Core Formula Review Cards

| Card | Priority | Topic | Current Status | Acceptance |
| --- | --- | --- | --- | --- |
| `p0-battle-numeric-coercion.md` | P0 | AS3 `int` coercion boundaries versus React floating-point drift | Guarded | Existing: `assert:battle-numeric-coercion`; Adjacent: `assert:growth-skill-protection`, `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-active-skill-single-roll.md` | P1 | Player attack skills should try only one random skill per turn | Guarded | Existing: `assert:battle-active-skill-single-roll`; Adjacent: `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-pet-exp-reward.md` | P1 | Pet exp should re-read monster exp after player reward settlement and preserve current-pet ownership after transition cloning | Guarded | Existing: `assert:battle-pet-exp-reward`, `assert:pet-window`; Adjacent: `assert:monster-reward`, `assert:battle-damage-log-death` |
| `p1-battle-pet-flow-logs.md` | P1 | Pet combat logs, interpolation, and random-consumption order | Guarded | Existing: `assert:battle-pet-flow-logs`; Adjacent: `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:text-resources` |

### Battle Formula Code Review 2026-06-04

Added 2026-06-04: Full code review of the core battle damage formula. The root cause of flat (non-varying) damage is that multiple layers compress the attack min-max gap. Cards are graded by severity and timestamped `-20260604` for traceability.

| ID | Priority | Topic | Status | Card | Acceptance |
| --- | --- | --- | --- | --- | --- |
| P0-DMG-FLAT | P0 | Flat damage — min-max gap compression | Needs repair | `p0-battle-damage-flat-20260604.md` | Root cause: `Stat.ATTACK` adds equally to min/max, `formula_title_stat` pre-truncation, `balanceRandom` 0.01 steps × `Math.trunc` discretization; Next: cross-check AS3 min-max gap sources, fix layer by layer |
| P0-TITLE-TRUNC | P0 | `formula_title_stat` truncation compresses min-max | Needs AS3 verification | `p0-battle-formula-title-trunc-20260604.md` | `as3Int(value)` before title multiplier loses `str/3` vs `str/2.5` difference; Next: cross-check AS3 `Player.as` for exact `int()` timing; if order matches AS3, no fix needed |
| P1-MON-ATK-GET | P1 | Monster/Pet attack getter hidden random side-effect | AS3-identical | `p1-battle-monster-attack-getter-20260604.md` | AS3 `Monster.attack` / `Pet.attack` also re-rolls on every getter access; React matches original behavior — no change needed |
| P1-CALCPROT-DUP | P1 | Duplicate armor formula with inconsistent negative-armor thresholds | Needs repair | `p1-battle-calcprotection-duplicate-20260604.md` | `Battle.ts` uses -100 vs `skillBehaviors.ts` uses -1000; Next: cross-check AS3 for correct threshold, unify into single implementation |
| P1-EQUIP-MINMAX | P1 | Equipment min>max fix too aggressive | Needs AS3 verification | `p1-equip-attack-minmax-fix-20260604.md` | `generateBasicStat` sets min = max when inverted, zeroing out damage spread; Next: cross-check AS3 original handling; if AS3 does the same, no fix needed |
| P1-BALRAND-DIV0 | P1 | `balanceRandom(100)` division-by-zero edge case | Needs repair | `p1-math-balancerandom-divzero-20260604.md` | Denominator `(100 - _loc2_)` → 0 producing Infinity; Next: cross-check AS3 boundary handling, add explicit guard |
| P2-TAUNT-PROB | P2 | Pet Taunt skill missing probability check | Needs repair | `p2-battle-pet-taunt-probability-20260604.md` | `monsterTurn()` always attacks pet when Taunt skill exists; Next: cross-check AS3 for probability parameter |
| P2-ATK-DBL-TRUNC | P2 | `getAttack` double truncation precision loss | Needs AS3 verification | `p2-battle-getattack-double-trunc-20260604.md` | `getAttMin`/`getAttMax` already truncated + `getAttack` truncates again; Next: cross-check AS3 for exact number and placement of `int()` calls; if AS3 also double-truncates, no fix needed |

### Status Meaning

- `Needs repair`: player-visible parity bug exists, code fix needed.
- `Needs AS3 verification`: behavior matches AS3 original design but not yet confirmed — requires cross-referencing AS3 source before deciding whether to fix.
- `AS3-identical`: confirmed to match original AS3 behavior; no code change needed.
- `Guard needed`: behavior is known, but executable coverage is missing.
- `Guarded`: core behavior has a guard, browser smoke still needed.
- `Verified`: guard and player-visible smoke both pass.

### Playtest Follow-up Queue

| ID | Priority | Module | Status | Card | Acceptance |
| --- | --- | --- | --- | --- | --- |
| PLAYTEST-2026-05-25 | Mixed | Playtest follow-up findings | Queued | `playtest-followups-2026-05-25.md` | Pick one card ID per repair; read AS3 first; add or confirm the red guard; make the smallest repair; then run the dedicated guard, nearby guards, `npx tsc -b`, and UI smoke |
| P1-MONSTER-TITLE-TOOLTIP | P1 | Monster title HTML tooltip | Verified | `playtest-followups-2026-05-25.md#p1-monster-title-tooltip` | AS3 `MonsterTitle.description` displays only `statMulList` add/multiplier lines; `assert:monster-title-tooltip`, adjacent monster guards, `npx tsc -b`, and browser smoke passed |
| P2-TEST-SPEED-CONTROL | P2 | Temporary test speed control | Verified | `playtest-followups-2026-05-25.md#p2-test-speed-control` | A temporary feature flag exposes `1x/10x/25x/50x` plus a compact Invincible control on the main scene; speed changes only the `useGameLoop` effective interval, one-hit debug meta enters the current battle only while enabled, and neither is saved; `assert:test-speed-control`, adjacent loop/age guards, `npx tsc -b`, and browser smoke passed |
| PLAYTEST-2026-06-04 | Mixed | 2026-06-04 playtest follow-up findings | Queued | `playtest-followups-2026-06-04.md` | Pick one card ID per repair; read AS3 first; add or confirm the red guard; make the smallest repair; then run the dedicated guard, nearby guards, `npx tsc -b`, and UI smoke |
| P0-BATTLE-INIT-HEAL | P0 | Battle init healing | Verified | `playtest-followups-2026-06-04.md#p0-battle-init-heal` | AS3 `Battle.init()` and React `Battle.init()` both refill from max HP/MP after a kill; confirmed original behavior, no repair needed |
| P1-PLAYER-INFO-DISPLAY | P1 | Player info display | Verified | `playtest-followups-2026-06-04.md#p1-player-info-display` | Status-panel attack range, primary-stat basic-value parentheses/colors, and crit multiplier percent display are covered by `assert:stat-list`; `assert:equip-window`, `npx tsc -b`, and browser smoke passed |
