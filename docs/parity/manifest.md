# BWE AS3 Parity Manifest

Last updated: 2026-05-20

## 中文

### 使用方式

这是 AI 修复和审阅顺序的总表。P0 条目当前已有 guard 保护；后续如果继续修复，只选一个 `Needs repair` 或 review queue 条目，先读 AS3，再补 guard，再做最小修复。

| ID | 优先级 | 模块 | 状态 | 规格卡 | AS3 源 | React 目标 | 当前症状 | 验收 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0-START | P0 | 角色与年龄选择 | Guarded | `p0-start-character-age.md` | `RaceList.as`, `Player.as`, `MainTimeline.as`, `MainScene.as` | `RaceScene.tsx`, `raceData.ts`, `Player.ts`, `GameContext.tsx` | 进入游戏后的角色和年龄选择界面/流程与原作不同 | Existing: `assert:growth-skill-protection`, `assert:start-character-age`; Next: browser smoke |
| P0-BATTLE | P0 | 战斗伤害、日志、死亡 | Guarded | `p0-battle-damage-log-death.md` | `Battle.as`, `Player.as`, `MainScene.as` | `Battle.ts`, `GameContext.tsx`, `MainScene.tsx` | 战斗日志缺少玩家受到伤害记录，玩家看起来直接死亡 | Existing: `assert:battle-player-state`, `assert:monster-reward`, `assert:battle-damage-log-death`; Next: review queue |
| P0-EQUIP | P0 | 装备所有权 | Guarded | `p0-equipment-ownership.md` | `Player.as`, `Equipment.as`, `EquipWindow.as`, `EquipCell.as` | `Player.ts`, `Equipment.ts`, `EquipWindow.tsx`, `GameContext.tsx` | 切换装备后，脱下装备像是复制了一份进仓库 | Existing: `assert:equip-window`, `assert:equipment-data`, `assert:stat-list`, `assert:equipment-ownership`; Next: browser smoke |
| P0-MAP | P0 | 地图默认值与切换 | Guarded | `p0-map-selection.md` | `MapList.as`, `Map.as`, `MapPanel.as`, `Player.as` | `mapData.ts`, `Map.ts`, `MapWindow.tsx`, `GameContext.tsx` | 地图选择不可见或不可确认，默认地图来源不清楚 | Existing: `assert:map-data`, `assert:map-selection`; Next: browser smoke |
| P0-SKILL | P0 | 技能装备限制与战斗生效 | Guarded | `p0-skill-eligibility-effects.md` | `SkillWindow.as`, `ActiveSkill.as`, `SkillDataList.as`, `Player.as`, `WeaponType.as` | `SkillWindow.tsx`, `BattleSkillPanel.tsx`, `Skill.ts`, `Player.ts`, `Battle.ts`, `skillData.ts` | 技能可以随意装备且不生效，没有远程武器也能使用远程技能 | Existing: `assert:skill-window`, `assert:growth-skill-protection`, `assert:skill-eligibility-effects`; Next: browser smoke |

### 后续推进顺序建议

1. 浏览器 smoke：逐项确认 P0 玩家可见流程，不改代码，只记录问题。
2. Battle core formula cards：从下面“战斗核心公式复核卡”选择一个条目。
3. Battle review queue：从 `p0-battle-fix-deepseek260519.md` 选择一个 B-R 条目。
4. Equipment review queue：从 `p0-equipment-deepseek.md` 选择一个 E-R 条目。
5. 新问题审阅：先写短 audit，再决定是否新增 parity 卡。
6. 重构工作：只做已有 guard 覆盖范围内的小步重构。

### 战斗核心公式复核卡

| Card | Priority | Topic | Current Status | Acceptance |
| --- | --- | --- | --- | --- |
| `p0-battle-numeric-coercion.md` | P0 | AS3 `int` 截断边界与 React 浮点数漂移 | Guarded | Existing: `assert:battle-numeric-coercion`; Adjacent: `assert:growth-skill-protection`, `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-active-skill-single-roll.md` | P1 | 玩家攻击技能每回合只随机尝试一个 | Guarded | Existing: `assert:battle-active-skill-single-roll`; Adjacent: `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-pet-exp-reward.md` | P1 | 玩家升级后宠物经验应按 AS3 再次读取怪物经验 | Guard needed | Needed: `assert:battle-pet-exp-reward`; Adjacent: `assert:monster-reward`, `assert:battle-damage-log-death` |
| `p1-battle-pet-flow-logs.md` | P1 | 宠物战斗日志、插值和随机消耗顺序 | Guard needed | Needed: `assert:battle-pet-flow-logs`; Adjacent: `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:text-resources` |

### 状态含义

- `Needs repair`: 已发现玩家可见错误，缺少完整行为还原。
- `Guard needed`: 行为已定位，但还没有可执行 guard。
- `Guarded`: 已有 guard 覆盖核心行为，但仍需浏览器 smoke。
- `Verified`: guard 和玩家可见 smoke 都通过。

## English

### How To Use

This is the repair and review order for AI work. P0 items are currently guarded. For future work, pick one `Needs repair` item or one review queue row, read AS3 first, add or confirm the guard, then make the smallest repair.

| ID | Priority | Module | Status | Card | AS3 Sources | React Targets | Current Symptom | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0-START | P0 | Character and age selection | Guarded | `p0-start-character-age.md` | `RaceList.as`, `Player.as`, `MainTimeline.as`, `MainScene.as` | `RaceScene.tsx`, `raceData.ts`, `Player.ts`, `GameContext.tsx` | The in-game character and age selection flow differs from the original | Existing: `assert:growth-skill-protection`, `assert:start-character-age`; Next: browser smoke |
| P0-BATTLE | P0 | Battle damage, logs, and death | Guarded | `p0-battle-damage-log-death.md` | `Battle.as`, `Player.as`, `MainScene.as` | `Battle.ts`, `GameContext.tsx`, `MainScene.tsx` | Battle logs do not show player damage, and the player appears to die directly | Existing: `assert:battle-player-state`, `assert:monster-reward`, `assert:battle-damage-log-death`; Next: review queue |
| P0-EQUIP | P0 | Equipment ownership | Guarded | `p0-equipment-ownership.md` | `Player.as`, `Equipment.as`, `EquipWindow.as`, `EquipCell.as` | `Player.ts`, `Equipment.ts`, `EquipWindow.tsx`, `GameContext.tsx` | Switching equipment appears to duplicate the unequipped item into inventory | Existing: `assert:equip-window`, `assert:equipment-data`, `assert:stat-list`, `assert:equipment-ownership`; Next: browser smoke |
| P0-MAP | P0 | Default map and map switching | Guarded | `p0-map-selection.md` | `MapList.as`, `Map.as`, `MapPanel.as`, `Player.as` | `mapData.ts`, `Map.ts`, `MapWindow.tsx`, `GameContext.tsx` | Map selection is not visible or confirmed, and the default map source is unclear | Existing: `assert:map-data`, `assert:map-selection`; Next: browser smoke |
| P0-SKILL | P0 | Skill eligibility and battle effects | Guarded | `p0-skill-eligibility-effects.md` | `SkillWindow.as`, `ActiveSkill.as`, `SkillDataList.as`, `Player.as`, `WeaponType.as` | `SkillWindow.tsx`, `BattleSkillPanel.tsx`, `Skill.ts`, `Player.ts`, `Battle.ts`, `skillData.ts` | Skills can be equipped freely, do not reliably take effect, and ranged skills work without ranged weapons | Existing: `assert:skill-window`, `assert:growth-skill-protection`, `assert:skill-eligibility-effects`; Next: browser smoke |

### Recommended Next Order

1. Browser smoke: confirm P0 player-visible flows without changing code.
2. Battle core formula cards: pick one item from the "Battle Core Formula Review Cards" table below.
3. Battle review queue: pick one B-R item from `p0-battle-fix-deepseek260519.md`.
4. Equipment review queue: pick one E-R item from `p0-equipment-deepseek.md`.
5. New issue review: write a short audit before adding a new parity card.
6. Refactor work: only make small refactors under existing guard coverage.

### Battle Core Formula Review Cards

| Card | Priority | Topic | Current Status | Acceptance |
| --- | --- | --- | --- | --- |
| `p0-battle-numeric-coercion.md` | P0 | AS3 `int` coercion boundaries versus React floating-point drift | Guarded | Existing: `assert:battle-numeric-coercion`; Adjacent: `assert:growth-skill-protection`, `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-active-skill-single-roll.md` | P1 | Player attack skills should try only one random skill per turn | Guarded | Existing: `assert:battle-active-skill-single-roll`; Adjacent: `assert:skill-eligibility-effects`, `assert:battle-damage-log-death` |
| `p1-battle-pet-exp-reward.md` | P1 | Pet exp should re-read monster exp after player reward settlement | Guard needed | Needed: `assert:battle-pet-exp-reward`; Adjacent: `assert:monster-reward`, `assert:battle-damage-log-death` |
| `p1-battle-pet-flow-logs.md` | P1 | Pet combat logs, interpolation, and random-consumption order | Guard needed | Needed: `assert:battle-pet-flow-logs`; Adjacent: `assert:battle-damage-log-death`, `assert:monster-reward`, `assert:text-resources` |

### Status Meaning

- `Needs repair`: player-visible parity bug exists.
- `Guard needed`: behavior is known, but executable coverage is missing.
- `Guarded`: core behavior has a guard, browser smoke still needed.
- `Verified`: guard and player-visible smoke both pass.
