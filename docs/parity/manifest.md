# BWE AS3 Parity Manifest

Last updated: 2026-06-20 (live screenshot UI routing added; shop-stock progression remains a product decision)

## 中文

### 使用方式

这是 AI 修复和审阅顺序的总表。P0 条目当前已有 guard 保护；后续如果出现新问题、guard 变红或需要浏览器 smoke，只选一个条目，先读 AS3，再补/确认 guard，再做最小修复。

**2026-06-19 重要提示：** 新增 4 张来自 UI/商店审阅的路由卡：`P1-RESPONSIVE-MIN-READABILITY` 处理 720p 最小窗口下核心文本可读性；`P1-OTHERPANEL-TAB-CONTENT-ALIGNMENT` 处理右上角 tab 栏与下方内容窗口边界不齐；`P2-EQUIP-WINDOW-PEOPLE-SKELETON` 处理装备窗口未使用 AS3 `people_use1/people_use2` 火柴人骨架；`P1-SHOP-STOCK-PROGRESSION-OVERRIDE` 确认为 product override 候选，AS3/React 商店和赌博公式基本一致，不能直接替换 `combatPower` 语义。

**2026-06-20 实时截图审阅提示：** 新增 5 张来自浏览器标注的路由卡：`P1-EQUIP-WINDOW-DETAIL-UNDER-FIGURE` 先处理装备详情栏被放到画面最右侧导致右栏过宽的问题；`P1-EQUIP-WINDOW-SPACE-UTILIZATION` 在详情栏下移后复核装备图标拥挤、空宠物状态和下方空间利用；`P1-LOOT-PANEL-LOG-ALIGNMENT` 处理当前地图统计未与左侧战斗日志形成稳定对齐；`P2-TEST-SPEED-FLOATING-POPOVER` 将 dev-only 调速改为人物名称旁边的浮动入口且 release 不留占位；`P1-START-CUSTOM-PLAYER-NAME` 先用 guard 证明 AS3 空存档槽命名流程，若当前代码已符合则只补 smoke/状态，不强行改代码。

**2026-06-13 重要提示：** `P0-BATTLE-TEMPO-CADENCE` 已由 `assert:battle-tempo-cadence` 守住 1x 前台单调度最多 1 个可见战斗 tick 的节奏边界，并完成 browser cadence smoke；`P1-MONSTER-INFO-ATTACK-FLICKER` 已由 `assert:monster-info-display-parity` 守住 AS3 怪物面板不显示随机攻击 getter 的 UI 边界，并完成 10 秒 browser flicker smoke；`P1-EQUIP-TOOLTIP-BOUNDS` 已由 `assert:item-info-window-bounds` 守住 AS3-adjacent 紧凑宽度、游戏容器边界收敛与 compare 双面板布局，并完成 inventory/shop browser bounds smoke；`P1-COMBAT-POWER-EQUIPLESS-READOUT` 已确认 AS3/React 都是不含装备的基础 CP，后续若要改善真实强度表达，应作为 product override 单独决策，不能直接替换 AS3 `combatPower` 语义。

**2026-06-07 重要提示：** 严格战斗系统审计新增 5 张路由卡：`P0-BUFF-DOT`、`P0-DMG-FLAT-OUT`、`P1-PET-SKILL-PROT`、`P2-BALRAND-STATUS`、`P2-BATTLE-TYPE-CONTRACTS`。`P0-BUFF-DOT` 已通过 DOT HP/log/kill guard；`P0-DMG-FLAT-OUT` 已通过输出层 guard，并记录为 intentional divergence；`P1-PET-SKILL-PROT` 已通过 shared-formula guard；`P2-BATTLE-TYPE-CONTRACTS` 已通过运行时类型契约 guard；`P1-BALRAND-DIV0` 已复核为 Guarded，不再排入 active repair queue。`P2-BALRAND-STATUS` 是文档路由修正卡，代码无需修复。宠物模块复核中 `P1-PET-ATTACK-LOG-CONSISTENCY` 和 `P2-PET-INFO-TYPE-LABEL` 均已 Verified；其余审阅项已有 AS3/guard 证据，不纳入本轮新修复。

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

1. **战斗系统审计修复 2026-06-06/07**：`P0-BUFF-DOT` 当前为 Guarded；`P0-DMG-FLAT-OUT` 当前为 Guarded intentional divergence；`P1-PET-SKILL-PROT` 当前为 Guarded shared formula；`P2-BATTLE-TYPE-CONTRACTS` 当前为 Guarded；`P2-BALRAND-STATUS` 已完成文档路由修正；`P1-BALRAND-DIV0` 当前为 Guarded。每张运行时代码卡必须先读 AS3/卡片 Source of Truth，再补红灯 guard，再做最小修复。
2. **宠物模块审阅 2026-06-07**：`P1-PET-ATTACK-LOG-CONSISTENCY` 和 `P2-PET-INFO-TYPE-LABEL` 均已 Verified；后续若出现新宠物模块回归，仍要先扩展红灯 guard，再做单点修复，且不要把已排除的 pet data / `Protective` / `mc_name` / 战斗宠物快照项带入修复。
3. **试玩 follow-up 2026-06-08**：`P0-BATTLE-TEMPO-CADENCE`、`P1-MONSTER-INFO-ATTACK-FLICKER` 和 `P1-EQUIP-TOOLTIP-BOUNDS` 已 Verified；`P1-COMBAT-POWER-EQUIPLESS-READOUT` 仍先做产品决策，不要直接改 AS3 `combatPower` 公式。
4. **UI/商店审阅 2026-06-19/20 与实时截图 2026-06-20**：`P1-RESPONSIVE-MIN-READABILITY`、`P1-OTHERPANEL-TAB-CONTENT-ALIGNMENT` 和 `P2-EQUIP-WINDOW-PEOPLE-SKELETON` 已 Verified；新截图布局修复顺序建议为 `P1-EQUIP-WINDOW-DETAIL-UNDER-FIGURE` -> `P1-EQUIP-WINDOW-SPACE-UTILIZATION` -> `P1-LOOT-PANEL-LOG-ALIGNMENT` -> `P2-TEST-SPEED-FLOATING-POPOVER`；`P1-START-CUSTOM-PLAYER-NAME` 可独立执行，先跑 guard 判断是否只缺 smoke；`P1-SHOP-STOCK-PROGRESSION-OVERRIDE` 仍先做 product decision，不要直接改 AS3 `combatPower` 或装备 `level` 默认值。
5. `P1-MON-ATK-GET` 已确认 AS3-identical：Monster/Pet attack getter 每次随机是 AS3 原版设计，无需修复；但不要把该随机 getter 暴露在持续重渲染的怪物信息面板中。
6. 浏览器 smoke：逐项确认新近 Guarded 的玩家可见流程，优先 `p0-start-burn-save.md`、`p0-save-persistence.md`、`p0-save-load-runtime-continuity.md`、`p0-game-loop-hook-parity.md`。
7. 静态表可见性抽查：打开地图、技能、怪物信息相关窗口，确认 `p0-map-data-model-parity.md`、`p0-skill-data-values.md`、`p0-monster-data-integrity.md` 的 guard 结果在 UI 中没有被展示层破坏。
8. Battle core formula cards：当前均为 Guarded；仅在出现新漂移或 guard 变红时，按下面表格一次复核一张。
9. Battle review queue：`p0-battle-fix-deepseek260519.md` 当前队列均已有 focused guard；仅在出现新症状时按单行复核。
10. Equipment review queue：`p0-equipment-deepseek.md` 当前队列已 Guarded / intentional divergence；仅在装备新回归出现时按单行复核。
11. 新问题审阅：先写短 audit，再决定是否新增 parity 卡。
12. 重构工作：只做已有 guard 覆盖范围内的小步重构。

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
| P0-DMG-FLAT | P0 | 伤害固定值 — 最终伤害波动不可见 | Guarded | `p0-battle-damage-flat-20260604.md` | `assert:battle-damage-flat-output` 证明 AS3 同夹具最终也压成 89；React 记录 intentional divergence，并用玩家普通攻击最终 nearest rounding 让日志伤害恢复可见波动 |
| P0-TITLE-TRUNC | P0 | `formula_title_stat` 截断时机 | AS3-identical | `p0-battle-formula-title-trunc-20260604.md` | AS3 `Player.as` 的 `formula_title_stat(param1:int, ...)` 入口与称号后返回均执行 `int` 截断；React 匹配原作，无需修复 |
| P1-MON-ATK-GET | P1 | Monster/Pet attack getter 随机副作用 | AS3-identical | `p1-battle-monster-attack-getter-20260604.md` | AS3 原版 `Monster.attack` / `Pet.attack` 也是 getter 每次重新随机，React 行为与原版一致；无需修改 |
| P1-CALCPROT-DUP | P1 | 护甲公式重复实现且负护甲阈值不一致 | Guarded | `p1-battle-calcprotection-duplicate-20260604.md` | AS3 `Battle.as` 确认阈值为 -100；`skillBehaviors.ts` 已复用 `Battle.ts` 的 `caculateProtection`；Guard: `assert:battle-calcprotection-duplicate` |
| P1-EQUIP-MINMAX | P1 | 装备生成 min>max 处理 | AS3-identical | `p1-equip-attack-minmax-fix-20260604.md` | 孤立装备生成逻辑与 AS3 一致；最终伤害固定仍归 `P0-DMG-FLAT`，不要用本状态关闭输出波动问题 |
| P1-BALRAND-DIV0 | P1 | `balanceRandom(100)` 除零边界 | Guarded | `p1-math-balancerandom-divzero-20260604.md` | React 已显式处理 0/100 边界并由 `assert:battle-numeric-coercion` 覆盖；路由修正记录见 `p2-math-balancerandom-manifest-status-20260606.md` |
| P2-TAUNT-PROB | P2 | 宠物 Taunt 目标选择 | AS3-identical | `p2-battle-pet-taunt-probability-20260604.md` | AS3 `Battle.monsterTurn()` 同样在宠物拥有 Taunt 时无条件攻击宠物；React 匹配原作，无需增加概率判定 |
| P2-ATK-DBL-TRUNC | P2 | `getAttack` 双重截断 | AS3-identical | `p2-battle-getattack-double-trunc-20260604.md` | 孤立截断链路与 AS3 一致；最终伤害固定仍归 `P0-DMG-FLAT`，必要时作为 intentional divergence 处理 |

### 战斗系统审计卡 2026-06-06

2026-06-06 新增：对战斗公式、数值、buff tick、宠物技能公式和类型边界的严格审计路由。以下卡片按修复顺序排列；每次只处理一张。

| ID | 优先级 | 模块 | 状态 | 规格卡 | 验收 |
| --- | --- | --- | --- | --- | --- |
| P0-BUFF-DOT | P0 | 灼伤/中毒 DOT 没有扣减实时 `monsterHp` | Guarded | `p0-battle-buff-dot-effects-20260606.md` | Existing: `assert:battle-buff-dot-effects` 覆盖 Burn/Poison tick 扣 HP、产生日志和 DOT 击杀结算；Next: browser smoke |
| P0-DMG-FLAT-OUT | P0 | 最终日志伤害波动被防御/护甲/取整压平 | Guarded | `p0-battle-damage-flat-output-guard-20260606.md` | Existing: `assert:battle-damage-flat-output` 输出攻击集合、AS3 最终集合、React 日志集合、防御/护甲和取整前范围；结论为 intentional divergence |
| P1-PET-SKILL-PROT | P1 | 宠物技能仍保留本地护甲公式 | Guarded | `p1-battle-pet-skill-protection-formula-20260606.md` | Existing: `assert:battle-calcprotection-duplicate` 覆盖 AS3 `Battle.as`/`PetSkillList.as` 证据、shared-formula 决策、静态公式所有权和 `p=-500` 宠物 Fireball 夹具 |
| P2-BALRAND-STATUS | P2 | `balanceRandom(0/100)` 已 Guarded 但 manifest 状态过期 | Guarded | `p2-math-balancerandom-manifest-status-20260606.md` | Existing: `assert:battle-numeric-coercion`; 本卡为文档路由修正，不要求运行时代码改动 |
| P2-BATTLE-TYPE-CONTRACTS | P2 | 战斗运行时类型契约过宽 | Guarded | `p2-battle-runtime-type-contracts-20260606.md` | Existing: `assert:battle-runtime-type-contracts`; Adjacent: `assert:domain-type-boundaries`, `assert:battle-state-immutability`, `assert:battle-player-state`; Always: `npx tsc -b` |

### 宠物模块审阅卡 2026-06-07

2026-06-07 新增：对宠物战斗日志、宠物面板显示、宠物数据查找、宠物技能映射、战斗中宠物快照和 sprite key 的专项审阅。确认需要路由的修复只有两张：一张处理宠物普通攻击日志自洽，一张处理主界面宠物类型标签。`getPetDataByLegacyId`、`Protective` 映射、`mc_name` 前缀和战斗宠物快照均已有 AS3/guard 证据，不作为本轮新修复卡。

| ID | 优先级 | 模块 | 状态 | 规格卡 | 验收 |
| --- | --- | --- | --- | --- | --- |
| P1-PET-ATTACK-LOG-CONSISTENCY | P1 | 宠物普攻与 Life Drain 日志自洽 | Verified | `p1-battle-pet-attack-log-consistency-20260607.md` | Existing: `assert:battle-pet-flow-logs`; Adjacent: `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:text-resources`; Always: `npx tsc -b`; Browser smoke passed 2026-06-07 |
| P2-PET-INFO-TYPE-LABEL | P2 | 主界面宠物类型标签显示 | Verified | `p2-pet-info-panel-type-label-consistency-20260607.md` | Existing: `assert:pet-window`; Adjacent: `assert:pet-window-selection`, `assert:pet-data`; Always: `npx tsc -b`; Browser smoke passed 2026-06-07 |

### 状态含义

- `Needs repair`: 已发现玩家可见错误，缺少完整行为还原。
- `Needs AS3 verification`: 行为待对照 AS3 确认——可能已是原版行为，无需修复；也可能存在漂移。
- `Needs product decision`: 已确认或高度怀疑 AS3 parity 本身成立，但当前试玩体验需要决定是否做 intentional product override。
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
| PLAYTEST-2026-06-08 | Mixed | 2026-06-08 试玩发现 follow-up | Queued | `playtest-followups-2026-06-08.md` | 每次只选择一个卡片 ID；先读 AS3，先补/确认 red guard，再做最小修复；最后跑专属 guard、相邻 guard、`npx tsc -b` 和 UI smoke |
| P0-BATTLE-TEMPO-CADENCE | P0 | 战斗节奏可见 cadence | Verified | `playtest-followups-2026-06-08.md#p0-battle-tempo-cadence` | AS3 `Timer(500)` 每次只推进一个 `fight()`；React 1x 前台单调度最多消费 1 个可见 tick，并由 `assert:battle-tempo-cadence`、`assert:game-loop`、`assert:test-speed-control` 守住；Browser cadence smoke passed 2026-06-08 |
| P1-MONSTER-INFO-ATTACK-FLICKER | P1 | 怪物信息面板攻击力跳变 | Verified | `playtest-followups-2026-06-08.md#p1-monster-info-attack-flicker` | AS3 怪物面板不显示随机攻击值；React 不在渲染路径读取 `mon.attack`，并保留名称、称号、HP、CP 和 buff；`assert:monster-info-display-parity`、相邻 monster guards、`assert:battle-damage-log-death`、`npx tsc -b` 和 browser flicker smoke passed 2026-06-13 |
| P1-COMBAT-POWER-EQUIPLESS-READOUT | P1 | 战斗力读数与装备实战力脱钩 | Needs product decision | `playtest-followups-2026-06-08.md#p1-combat-power-equipless-readout` | AS3/React `combatPower` 均不含装备；后续若要表达装备后实战力，应新增 product override 显示，不要替换 AS3 内部 CP；Suggested: `assert:combat-power-readout-parity`, adjacent `assert:stat-list`, `assert:monster-reward`, `npx tsc -b` |
| P1-EQUIP-TOOLTIP-BOUNDS | P1 | 装备浮窗尺寸与边界 | Verified | `playtest-followups-2026-06-08.md#p1-equip-tooltip-bounds` | AS3 `ItemInfoWindow` 固定 130px 并按 stage 边界修正；React 已限制为 130-180px 紧凑面板并按游戏容器收敛 compare 浮窗；Passed 2026-06-13: `assert:item-info-window-bounds`, adjacent `assert:equipment-compare-tooltip`, `assert:equip-window`, `assert:common-cell`, `npx tsc -b`, inventory/shop browser bounds smoke |
| P1-RESPONSIVE-MIN-READABILITY | P1 | 720p 最小窗口核心文字可读性 | Verified | `p1-responsive-min-readability.md` | Passed 2026-06-20: `assert:responsive-layout`; `assertResponsiveMinimumReadability` 1280x720/1366x768/1080p/2K/4K effective font sizes with no main-region overlap; nearby `assert:other-window-children`, `assert:equip-window`, `assert:shop-window`; `npx tsc -b` |
| P1-OTHERPANEL-TAB-CONTENT-ALIGNMENT | P1 | OtherPanel tab 栏与内容窗口边界对齐 | Verified | `p1-otherpanel-tab-content-alignment.md` | Passed 2026-06-20: `assert:otherpanel-tab-alignment`, `assert:other-window-children`, `assert:other-window-overlay`, `assert:responsive-layout`, `npx tsc -b`, browser rect smoke at 720p/FHD/UHD |
| P2-EQUIP-WINDOW-PEOPLE-SKELETON | P2 | 装备窗口 AS3 火柴人骨架 | Verified | `p2-equip-window-people-skeleton.md` | Passed 2026-06-20: `assert:equip-window`, `assert:equip-window-bounds`, `assert:packaged-assets`, `assert:window-sprite-icons`, `assert:common-cell`, `npx tsc -b`, browser smoke for skeleton/slot/tooltip/unequip |
| P1-SHOP-STOCK-PROGRESSION-OVERRIDE | P1 | 商店/赌博库存成长 product override | Needs product decision | `p1-shop-stock-progression-override.md` | AS3/React shop ratios use base `combatPower` and new equipment `level = 0`; Suggested: `assert:shop-stock-progression-override`, `assert:shop-window`, optional `assert:combat-power-readout-parity`, `assert:stat-list`, `assert:equipment-data`, `npx tsc -b` |
| P1-EQUIP-WINDOW-DETAIL-UNDER-FIGURE | P1 | 装备详情栏位置与右栏宽度压力 | Verified | `p1-equip-window-detail-under-figure.md` | Passed 2026-06-20: `assert:equip-window-detail-placement`, `assert:equip-window`, `assert:equip-window-bounds`, `assert:otherpanel-tab-alignment`, `assert:responsive-layout`, `npx tsc -b`; browser rect smoke |
| P1-EQUIP-WINDOW-SPACE-UTILIZATION | P1 | 装备图标拥挤与下方空间利用 | Needs repair after detail-placement fix | `p1-equip-window-space-utilization.md` | Depends on `p1-equip-window-detail-under-figure.md`; Suggested: `assert:equip-window-space-utilization`, `assert:equip-window-detail-placement`, `assert:equip-window`, `assert:equip-window-bounds`, `assert:window-sprite-icons`, `npx tsc -b`; browser slot rect smoke |
| P1-LOOT-PANEL-LOG-ALIGNMENT | P1 | 当前地图统计与战斗日志对齐 | Needs repair | `p1-loot-panel-log-alignment.md` | Suggested: `assert:loot-panel-log-alignment`, `assert:responsive-layout`, `assert:battle-log-sticky-scroll`, `assert:monster-reward`, `npx tsc -b`; browser rect smoke |
| P2-TEST-SPEED-FLOATING-POPOVER | P2 | dev-only 调速浮动入口 | Needs repair | `p2-test-speed-floating-popover.md` | Product/testing tool UI; Suggested: `assert:test-speed-control`, optional `assert:test-speed-floating-popover`, `assert:game-loop`, `assert:responsive-layout`, `npx tsc -b`; release gating check |
| P1-START-CUSTOM-PLAYER-NAME | P1 | 创建角色时自定义玩家名 | Verified | `p1-start-custom-player-name.md` | Passed 2026-06-20: `assert:start-custom-player-name`; browser creation smoke confirmed empty-slot custom name -> RaceScene -> main panel -> refresh/load preserved the name; no production code change needed |

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

**2026-06-19 note:** Four UI/shop audit cards have been added: `P1-RESPONSIVE-MIN-READABILITY` for minimum-window text readability, `P1-OTHERPANEL-TAB-CONTENT-ALIGNMENT` for the right-column tab/content bounds mismatch, `P2-EQUIP-WINDOW-PEOPLE-SKELETON` for restoring the AS3 `people_use1`/`people_use2` equipment skeleton, and `P1-SHOP-STOCK-PROGRESSION-OVERRIDE` as a product-override candidate. Shop/gamble generation currently matches the AS3 base-`combatPower` formulas closely, so do not silently replace `combatPower`.

**2026-06-20 live screenshot note:** Five routed cards have been added from browser annotations: `P1-EQUIP-WINDOW-DETAIL-UNDER-FIGURE` moves selected equipment detail out of the far-right column; `P1-EQUIP-WINDOW-SPACE-UTILIZATION` follows after that to review slot crowding, empty pet state, and lower-space usage; `P1-LOOT-PANEL-LOG-ALIGNMENT` aligns current-map statistics with the battle log area; `P2-TEST-SPEED-FLOATING-POPOVER` moves dev-only speed controls into a player-name-side floating trigger with no release placeholder; `P1-START-CUSTOM-PLAYER-NAME` guards the AS3 empty-slot naming flow before deciding whether code repair is needed.

**2026-06-13 note:** `P0-BATTLE-TEMPO-CADENCE` is guarded by `assert:battle-tempo-cadence`, which protects the 1x foreground rule that one scheduler pass emits at most one visible battle tick, and browser cadence smoke has passed. `P1-MONSTER-INFO-ATTACK-FLICKER` is now guarded by `assert:monster-info-display-parity`, which protects the AS3 UI boundary that monster info does not display the random attack getter, and a 10-second browser flicker smoke has passed. `P1-EQUIP-TOOLTIP-BOUNDS` is now guarded by `assert:item-info-window-bounds`, which protects AS3-adjacent compact width, game-container clamping, and compare-pane bounds, and inventory/shop browser bounds smoke has passed. `P1-COMBAT-POWER-EQUIPLESS-READOUT` has AS3/React evidence showing that `combatPower` is base-only and excludes equipment; any stronger equipment-inclusive readout must be a product override and must not silently replace the AS3 `combatPower` semantics.

**2026-06-07 note:** The strict battle-system audit added five routed cards: `P0-BUFF-DOT`, `P0-DMG-FLAT-OUT`, `P1-PET-SKILL-PROT`, `P2-BALRAND-STATUS`, and `P2-BATTLE-TYPE-CONTRACTS`. `P0-BUFF-DOT` is now guarded for DOT HP/log/kill behavior, `P0-DMG-FLAT-OUT` is now a Guarded intentional divergence, `P1-PET-SKILL-PROT` is now Guarded as a shared-formula decision, `P2-BATTLE-TYPE-CONTRACTS` is now Guarded for runtime type contracts, and `P1-BALRAND-DIV0` is now Guarded; none of those should remain in the active repair queue. In the pet-module review, `P1-PET-ATTACK-LOG-CONSISTENCY` and `P2-PET-INFO-TYPE-LABEL` are now Verified; the other reviewed pet findings already have AS3/guard evidence and should not be pulled into these fixes.

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

1. **Battle-system audit fixes 2026-06-06/07**: `P0-BUFF-DOT` is now Guarded, `P0-DMG-FLAT-OUT` is now a Guarded intentional divergence, `P1-PET-SKILL-PROT` is now Guarded as a shared-formula decision, and `P2-BATTLE-TYPE-CONTRACTS` is now Guarded. `P2-BALRAND-STATUS` is already a docs-routing correction, and `P1-BALRAND-DIV0` is Guarded. For future runtime cards, read AS3/source-of-truth first, add the red guard, then make the smallest repair.
2. **Pet-module review 2026-06-07**: `P1-PET-ATTACK-LOG-CONSISTENCY` and `P2-PET-INFO-TYPE-LABEL` are now Verified. For future pet-module regressions, add the red guard first, keep fixes separate, and do not pull the excluded pet data / `Protective` / `mc_name` / battle-pet snapshot findings into the repair.
3. **Playtest follow-up 2026-06-08**: `P0-BATTLE-TEMPO-CADENCE`, `P1-MONSTER-INFO-ATTACK-FLICKER`, and `P1-EQUIP-TOOLTIP-BOUNDS` are Verified; keep `P1-COMBAT-POWER-EQUIPLESS-READOUT` in product-decision mode before changing any AS3 `combatPower` formula.
4. **UI/shop audit 2026-06-19/20 and live screenshot review 2026-06-20**: `P1-RESPONSIVE-MIN-READABILITY`, `P1-OTHERPANEL-TAB-CONTENT-ALIGNMENT`, and `P2-EQUIP-WINDOW-PEOPLE-SKELETON` are Verified. New screenshot layout repairs should run in this order: `P1-EQUIP-WINDOW-DETAIL-UNDER-FIGURE` -> `P1-EQUIP-WINDOW-SPACE-UTILIZATION` -> `P1-LOOT-PANEL-LOG-ALIGNMENT` -> `P2-TEST-SPEED-FLOATING-POPOVER`. `P1-START-CUSTOM-PLAYER-NAME` can run independently and should first determine whether only smoke/status is missing. Keep `P1-SHOP-STOCK-PROGRESSION-OVERRIDE` in product-decision mode before changing shop stock progression.
5. `P1-MON-ATK-GET` confirmed AS3-identical: Monster/Pet attack getter re-rolling on every access is AS3's original design. Do not expose that random getter in continuously re-rendered monster info UI.
6. Browser smoke: confirm newly Guarded player-visible flows first, especially `p0-start-burn-save.md`, `p0-save-persistence.md`, `p0-save-load-runtime-continuity.md`, and `p0-game-loop-hook-parity.md`.
7. Static-table visibility checks: open the map, skill, and monster-info related surfaces and confirm `p0-map-data-model-parity.md`, `p0-skill-data-values.md`, and `p0-monster-data-integrity.md` are not broken by presentation code.
8. Battle core formula cards: all are currently Guarded; re-open one card only when a new drift appears or a guard turns red.
9. Battle review queue: `p0-battle-fix-deepseek260519.md` rows currently have focused guards; re-open one row only for a new symptom.
10. Equipment review queue: `p0-equipment-deepseek.md` rows are Guarded / intentional divergence; re-open one row only for an equipment regression.
11. New issue review: write a short audit before adding a new parity card.
12. Refactor work: only make small refactors under existing guard coverage.

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
| P0-DMG-FLAT | P0 | Flat damage — invisible final-damage variance | Guarded | `p0-battle-damage-flat-20260604.md` | `assert:battle-damage-flat-output` proves the same AS3 fixture also collapses to 89; React records an intentional divergence and uses nearest rounding for player normal-attack final visible damage |
| P0-TITLE-TRUNC | P0 | `formula_title_stat` truncation timing | AS3-identical | `p0-battle-formula-title-trunc-20260604.md` | AS3 `Player.as` truncates at the `formula_title_stat(param1:int, ...)` boundary and again after title add/mul; React matches original behavior — no change needed |
| P1-MON-ATK-GET | P1 | Monster/Pet attack getter hidden random side-effect | AS3-identical | `p1-battle-monster-attack-getter-20260604.md` | AS3 `Monster.attack` / `Pet.attack` also re-rolls on every getter access; React matches original behavior — no change needed |
| P1-CALCPROT-DUP | P1 | Duplicate armor formula with inconsistent negative-armor thresholds | Guarded | `p1-battle-calcprotection-duplicate-20260604.md` | AS3 `Battle.as` confirms the -100 threshold; `skillBehaviors.ts` now reuses `Battle.ts` `caculateProtection`; Guard: `assert:battle-calcprotection-duplicate` |
| P1-EQUIP-MINMAX | P1 | Equipment min>max handling | AS3-identical | `p1-equip-attack-minmax-fix-20260604.md` | The isolated equipment-generation behavior matches AS3; fixed final damage still belongs to `P0-DMG-FLAT` |
| P1-BALRAND-DIV0 | P1 | `balanceRandom(100)` division-by-zero edge case | Guarded | `p1-math-balancerandom-divzero-20260604.md` | React explicitly handles the 0/100 edge and `assert:battle-numeric-coercion` covers it; routing correction recorded in `p2-math-balancerandom-manifest-status-20260606.md` |
| P2-TAUNT-PROB | P2 | Pet Taunt target selection | AS3-identical | `p2-battle-pet-taunt-probability-20260604.md` | AS3 `Battle.monsterTurn()` also always attacks the pet when Taunt exists; React matches original behavior — no probability check should be added |
| P2-ATK-DBL-TRUNC | P2 | `getAttack` double truncation | AS3-identical | `p2-battle-getattack-double-trunc-20260604.md` | The isolated truncation chain matches AS3; fixed final damage still belongs to `P0-DMG-FLAT` and may become an intentional divergence |

### Battle System Audit 2026-06-06

Added 2026-06-06: strict audit routing for combat formulas, numeric behavior, buff ticks, pet-skill formulas, and runtime type boundaries. Cards are listed in recommended repair order.

| ID | Priority | Topic | Status | Card | Acceptance |
| --- | --- | --- | --- | --- | --- |
| P0-BUFF-DOT | P0 | Burn/poison DOT does not reduce live `monsterHp` | Guarded | `p0-battle-buff-dot-effects-20260606.md` | Existing: `assert:battle-buff-dot-effects` covers Burn/Poison HP deltas, logs, and DOT kill settlement; Next: browser smoke |
| P0-DMG-FLAT-OUT | P0 | Final logged damage variance collapses after defence/protection/rounding | Guarded | `p0-battle-damage-flat-output-guard-20260606.md` | Existing: `assert:battle-damage-flat-output` captures attack samples, AS3 final damage, React logged damage, defence/protection, and pre-round range; conclusion is intentional divergence |
| P1-PET-SKILL-PROT | P1 | Pet skills still keep a local protection formula | Guarded | `p1-battle-pet-skill-protection-formula-20260606.md` | Existing: `assert:battle-calcprotection-duplicate` covers AS3 `Battle.as`/`PetSkillList.as` evidence, the shared-formula decision, static formula ownership, and the `p=-500` pet Fireball fixture |
| P2-BALRAND-STATUS | P2 | `balanceRandom(0/100)` is Guarded but manifest routing was stale | Guarded | `p2-math-balancerandom-manifest-status-20260606.md` | Existing: `assert:battle-numeric-coercion`; docs-routing correction only |
| P2-BATTLE-TYPE-CONTRACTS | P2 | Battle runtime type contracts are too broad | Guarded | `p2-battle-runtime-type-contracts-20260606.md` | Existing: `assert:battle-runtime-type-contracts`; Adjacent: `assert:domain-type-boundaries`, `assert:battle-state-immutability`, `assert:battle-player-state`; Always: `npx tsc -b` |

### Pet Module Review Cards 2026-06-07

Added 2026-06-07: a focused review of pet battle logs, pet panel display, pet data lookup, pet skill mapping, battle pet snapshots, and sprite keys. Only two findings are routed for repair: pet normal-attack log self-consistency and the main pet info panel type label. `getPetDataByLegacyId`, `Protective` map assignment, `mc_name` prefixing, and battle pet snapshot behavior already have AS3/guard evidence and are not new repair cards from this pass.

| ID | Priority | Module | Status | Card | Acceptance |
| --- | --- | --- | --- | --- | --- |
| P1-PET-ATTACK-LOG-CONSISTENCY | P1 | Pet normal attack and Life Drain log consistency | Verified | `p1-battle-pet-attack-log-consistency-20260607.md` | Existing: `assert:battle-pet-flow-logs`; Adjacent: `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:text-resources`; Always: `npx tsc -b`; Browser smoke passed 2026-06-07 |
| P2-PET-INFO-TYPE-LABEL | P2 | Main pet info panel type label | Verified | `p2-pet-info-panel-type-label-consistency-20260607.md` | Existing: `assert:pet-window`; Adjacent: `assert:pet-window-selection`, `assert:pet-data`; Always: `npx tsc -b`; Browser smoke passed 2026-06-07 |

### Status Meaning

- `Needs repair`: player-visible parity bug exists, code fix needed.
- `Needs AS3 verification`: behavior matches AS3 original design but not yet confirmed — requires cross-referencing AS3 source before deciding whether to fix.
- `Needs product decision`: AS3 parity is confirmed or strongly suspected, but the current playtest experience needs an intentional product-override decision.
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
| PLAYTEST-2026-06-08 | Mixed | 2026-06-08 playtest follow-up findings | Queued | `playtest-followups-2026-06-08.md` | Pick one card ID per repair; read AS3 first; add or confirm the red guard; make the smallest repair; then run the dedicated guard, nearby guards, `npx tsc -b`, and UI smoke |
| P0-BATTLE-TEMPO-CADENCE | P0 | Visible battle cadence | Verified | `playtest-followups-2026-06-08.md#p0-battle-tempo-cadence` | AS3 `Timer(500)` advances one `fight()` per event; React 1x foreground scheduling emits at most one visible tick per pass and is guarded by `assert:battle-tempo-cadence`, `assert:game-loop`, and `assert:test-speed-control`; Browser cadence smoke passed 2026-06-08 |
| P1-MONSTER-INFO-ATTACK-FLICKER | P1 | Monster info attack flicker | Verified | `playtest-followups-2026-06-08.md#p1-monster-info-attack-flicker` | AS3 monster info does not display the random attack getter; React does not read `mon.attack` during render and keeps name, title, HP, CP, and buffs; `assert:monster-info-display-parity`, adjacent monster guards, `assert:battle-damage-log-death`, `npx tsc -b`, and browser flicker smoke passed 2026-06-13 |
| P1-COMBAT-POWER-EQUIPLESS-READOUT | P1 | Combat power readout excludes equipment | Needs product decision | `playtest-followups-2026-06-08.md#p1-combat-power-equipless-readout` | AS3/React `combatPower` both exclude equipment; any equipment-inclusive strength display should be a product override and not replace internal AS3 CP; Suggested: `assert:combat-power-readout-parity`, adjacent `assert:stat-list`, `assert:monster-reward`, `npx tsc -b` |
| P1-EQUIP-TOOLTIP-BOUNDS | P1 | Equipment tooltip size and bounds | Verified | `playtest-followups-2026-06-08.md#p1-equip-tooltip-bounds` | AS3 `ItemInfoWindow` is 130px wide and stage-clamped; React now uses compact 130-180px panes and constrains compare tooltips inside the game container; Passed 2026-06-13: `assert:item-info-window-bounds`, adjacent `assert:equipment-compare-tooltip`, `assert:equip-window`, `assert:common-cell`, `npx tsc -b`, inventory/shop browser bounds smoke |
| P1-RESPONSIVE-MIN-READABILITY | P1 | Minimum-window core text readability | Verified | `p1-responsive-min-readability.md` | Passed 2026-06-20: `assert:responsive-layout`; `assertResponsiveMinimumReadability` 1280x720/1366x768/1080p/2K/4K effective font sizes with no main-region overlap; nearby `assert:other-window-children`, `assert:equip-window`, `assert:shop-window`; `npx tsc -b` |
| P1-OTHERPANEL-TAB-CONTENT-ALIGNMENT | P1 | OtherPanel tab rail and content bounds | Verified | `p1-otherpanel-tab-content-alignment.md` | Passed 2026-06-20: `assert:otherpanel-tab-alignment`, `assert:other-window-children`, `assert:other-window-overlay`, `assert:responsive-layout`, `npx tsc -b`, browser rect smoke at 720p/FHD/UHD |
| P2-EQUIP-WINDOW-PEOPLE-SKELETON | P2 | EquipWindow AS3 people skeleton | Verified | `p2-equip-window-people-skeleton.md` | Passed 2026-06-20: `assert:equip-window`, `assert:equip-window-bounds`, `assert:packaged-assets`, `assert:window-sprite-icons`, `assert:common-cell`, `npx tsc -b`, browser smoke for skeleton/slot/tooltip/unequip |
| P1-SHOP-STOCK-PROGRESSION-OVERRIDE | P1 | Shop/gamble stock progression product override | Needs product decision | `p1-shop-stock-progression-override.md` | AS3/React shop ratios use base `combatPower` and new equipment `level = 0`; Suggested: `assert:shop-stock-progression-override`, `assert:shop-window`, optional `assert:combat-power-readout-parity`, `assert:stat-list`, `assert:equipment-data`, `npx tsc -b` |
| P1-EQUIP-WINDOW-DETAIL-UNDER-FIGURE | P1 | Equipment detail placement and right-column pressure | Verified | `p1-equip-window-detail-under-figure.md` | Passed 2026-06-20: `assert:equip-window-detail-placement`, `assert:equip-window`, `assert:equip-window-bounds`, `assert:otherpanel-tab-alignment`, `assert:responsive-layout`, `npx tsc -b`; browser rect smoke |
| P1-EQUIP-WINDOW-SPACE-UTILIZATION | P1 | Equipment slot crowding and lower-space usage | Needs repair after detail-placement fix | `p1-equip-window-space-utilization.md` | Depends on `p1-equip-window-detail-under-figure.md`; Suggested: `assert:equip-window-space-utilization`, `assert:equip-window-detail-placement`, `assert:equip-window`, `assert:equip-window-bounds`, `assert:window-sprite-icons`, `npx tsc -b`; browser slot rect smoke |
| P1-LOOT-PANEL-LOG-ALIGNMENT | P1 | Current-map statistics alignment with battle log | Needs repair | `p1-loot-panel-log-alignment.md` | Suggested: `assert:loot-panel-log-alignment`, `assert:responsive-layout`, `assert:battle-log-sticky-scroll`, `assert:monster-reward`, `npx tsc -b`; browser rect smoke |
| P2-TEST-SPEED-FLOATING-POPOVER | P2 | Dev-only floating speed-control trigger | Needs repair | `p2-test-speed-floating-popover.md` | Product/testing tool UI; Suggested: `assert:test-speed-control`, optional `assert:test-speed-floating-popover`, `assert:game-loop`, `assert:responsive-layout`, `npx tsc -b`; release gating check |
| P1-START-CUSTOM-PLAYER-NAME | P1 | Custom player name during character creation | Verified | `p1-start-custom-player-name.md` | Passed 2026-06-20: `assert:start-custom-player-name`; browser creation smoke confirmed empty-slot custom name -> RaceScene -> main panel -> refresh/load preserved the name; no production code change needed |
