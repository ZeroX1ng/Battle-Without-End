# BWE AS3 Parity Manifest

Last updated: 2026-05-19

## 中文

### 使用方式

这是 AI 修复顺序的总表。每次只选一个 `Needs repair` 的 P0 条目，打开对应行为规格卡，先读 AS3，再补 guard，再做最小修复。

| ID | 优先级 | 模块 | 状态 | 规格卡 | AS3 源 | React 目标 | 当前症状 | 验收 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0-START | P0 | 角色与年龄选择 | Needs repair | `p0-start-character-age.md` | `RaceList.as`, `Player.as`, `MainTimeline.as`, `MainScene.as` | `RaceScene.tsx`, `raceData.ts`, `Player.ts`, `GameContext.tsx` | 进入游戏后的角色和年龄选择界面/流程与原作不同 | Existing: `assert:growth-skill-protection`; Needed: `assert:start-character-age` |
| P0-BATTLE | P0 | 战斗伤害、日志、死亡 | Needs repair | `p0-battle-damage-log-death.md` | `Battle.as`, `Player.as`, `MainScene.as` | `Battle.ts`, `GameContext.tsx`, `MainScene.tsx` | 战斗日志缺少玩家受到伤害记录，玩家看起来直接死亡 | Existing: `assert:battle-player-state`, `assert:monster-reward`; Needed: `assert:battle-damage-log-death` |
| P0-EQUIP | P0 | 装备所有权 | Guarded | `p0-equipment-ownership.md` | `Player.as`, `Equipment.as`, `EquipWindow.as`, `EquipCell.as` | `Player.ts`, `Equipment.ts`, `EquipWindow.tsx`, `GameContext.tsx` | 切换装备后，脱下装备像是复制了一份进仓库 | Existing: `assert:equip-window`, `assert:equipment-data`, `assert:stat-list`, `assert:equipment-ownership`; Next: browser smoke |
| P0-MAP | P0 | 地图默认值与切换 | Needs repair | `p0-map-selection.md` | `MapList.as`, `Map.as`, `MapPanel.as`, `Player.as` | `mapData.ts`, `Map.ts`, `MapWindow.tsx`, `GameContext.tsx` | 地图选择不可见或不可确认，默认地图来源不清楚 | Existing: `assert:map-data`; Needed: `assert:map-selection` |
| P0-SKILL | P0 | 技能装备限制与战斗生效 | Needs repair | `p0-skill-eligibility-effects.md` | `SkillWindow.as`, `ActiveSkill.as`, `SkillDataList.as`, `Player.as`, `WeaponType.as` | `SkillWindow.tsx`, `BattleSkillPanel.tsx`, `Skill.ts`, `Player.ts`, `Battle.ts`, `skillData.ts` | 技能可以随意装备且不生效，没有远程武器也能使用远程技能 | Existing: `assert:skill-window`, `assert:growth-skill-protection`; Needed: `assert:skill-eligibility-effects` |

### 修复顺序建议

1. `P0-BATTLE`：先让玩家生死、伤害和日志可追踪，否则其他系统难验证。
2. `P0-EQUIP`：修正装备移动/替换，避免背包数据污染。
3. `P0-SKILL`：技能限制和装备生效依赖装备类别，放在装备所有权之后。
4. `P0-MAP`：固定地图来源，保证战斗怪物池和奖励倍率可追溯。
5. `P0-START`：修正开局选择流程和年龄/种族成长展示。

### 状态含义

- `Needs repair`: 已发现玩家可见错误，缺少完整行为还原。
- `Guard needed`: 行为已定位，但还没有可执行 guard。
- `Guarded`: 已有 guard 覆盖核心行为，但仍需浏览器 smoke。
- `Verified`: guard 和玩家可见 smoke 都通过。

## English

### How To Use

This is the repair order for AI work. Pick one P0 item marked `Needs repair`, open its parity card, read AS3 first, add or confirm the guard, then make the smallest repair.

| ID | Priority | Module | Status | Card | AS3 Sources | React Targets | Current Symptom | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0-START | P0 | Character and age selection | Needs repair | `p0-start-character-age.md` | `RaceList.as`, `Player.as`, `MainTimeline.as`, `MainScene.as` | `RaceScene.tsx`, `raceData.ts`, `Player.ts`, `GameContext.tsx` | The in-game character and age selection flow differs from the original | Existing: `assert:growth-skill-protection`; Needed: `assert:start-character-age` |
| P0-BATTLE | P0 | Battle damage, logs, and death | Needs repair | `p0-battle-damage-log-death.md` | `Battle.as`, `Player.as`, `MainScene.as` | `Battle.ts`, `GameContext.tsx`, `MainScene.tsx` | Battle logs do not show player damage, and the player appears to die directly | Existing: `assert:battle-player-state`, `assert:monster-reward`; Needed: `assert:battle-damage-log-death` |
| P0-EQUIP | P0 | Equipment ownership | Guarded | `p0-equipment-ownership.md` | `Player.as`, `Equipment.as`, `EquipWindow.as`, `EquipCell.as` | `Player.ts`, `Equipment.ts`, `EquipWindow.tsx`, `GameContext.tsx` | Switching equipment appears to duplicate the unequipped item into inventory | Existing: `assert:equip-window`, `assert:equipment-data`, `assert:stat-list`, `assert:equipment-ownership`; Next: browser smoke |
| P0-MAP | P0 | Default map and map switching | Needs repair | `p0-map-selection.md` | `MapList.as`, `Map.as`, `MapPanel.as`, `Player.as` | `mapData.ts`, `Map.ts`, `MapWindow.tsx`, `GameContext.tsx` | Map selection is not visible or confirmed, and the default map source is unclear | Existing: `assert:map-data`; Needed: `assert:map-selection` |
| P0-SKILL | P0 | Skill eligibility and battle effects | Needs repair | `p0-skill-eligibility-effects.md` | `SkillWindow.as`, `ActiveSkill.as`, `SkillDataList.as`, `Player.as`, `WeaponType.as` | `SkillWindow.tsx`, `BattleSkillPanel.tsx`, `Skill.ts`, `Player.ts`, `Battle.ts`, `skillData.ts` | Skills can be equipped freely, do not reliably take effect, and ranged skills work without ranged weapons | Existing: `assert:skill-window`, `assert:growth-skill-protection`; Needed: `assert:skill-eligibility-effects` |

### Recommended Repair Order

1. `P0-BATTLE`: make damage, death, and logs traceable first.
2. `P0-EQUIP`: fix item movement/replacement before dependent systems.
3. `P0-SKILL`: skill eligibility depends on equipment category.
4. `P0-MAP`: lock down map source, monster pools, and reward modifiers.
5. `P0-START`: restore start selection and age/race growth display.

### Status Meaning

- `Needs repair`: player-visible parity bug exists.
- `Guard needed`: behavior is known, but executable coverage is missing.
- `Guarded`: core behavior has a guard, browser smoke still needed.
- `Verified`: guard and player-visible smoke both pass.
