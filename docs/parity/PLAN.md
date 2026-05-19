# BWE AS3 Parity 文档与修复方案

## Summary

Dear Master，我的判断是：这不是单纯“AI 理解差”，也不一定需要马上全量重写；核心问题是 AI 被允许做了“看起来合理的重构”，但没有被文档和测试限制成“逐项复刻 AS3 行为”。

接下来应改成“AS3 源码驱动 + 模块规格卡 + 可执行验收”的工作流。每次只修一个 P0 行为，不让 AI 泛泛优化整个游戏。

## Key Changes

- 新增项目级 AI 工作规则文档：明确 `BOE-O` 是唯一行为源，视觉相似不算完成，禁止 AI 自创规则、补猜公式、跳过 AS3 对照。
- 新增 parity 总表：按模块记录 AS3 源文件、React 目标文件、当前症状、优先级、验收脚本、状态。
- 为每个 P0 问题写一张“行为规格卡”：
  - 角色/年龄选择：对照 `RaceList.as`、`Player.as`、开始流程。
  - 战斗伤害/日志/死亡：对照 `Battle.as` 和当前 `Battle.ts`、`GameContext.tsx`。
  - 装备切换复制问题：对照 `Equipment.as`、`EquipWindow.as`，验收“移动/替换”而不是“复制”。
  - 地图默认与切换：对照 `MapList.as`、`MapPanel.as`，确认默认地图、地图列表、切换后战斗来源。
  - 技能装备与生效：对照 `SkillWindow.as`、`ActiveSkill.as`、武器类型限制、战斗触发条件。
- 每张规格卡固定格式：
  - `AS3 Source of Truth`
  - `React Targets`
  - `Current Symptom`
  - `Expected Behavior`
  - `Forbidden Behavior`
  - `State Ownership`
  - `Acceptance Tests`
  - `Manual Smoke Scenario`

## Interfaces

- 不需要先改代码 API。
- 文档本身作为 AI 的“输入接口”：以后给 AI 的任务不再是“修复技能系统”，而是“按这张规格卡修复 SkillWindow/Skill/Battle 的某个行为，并先补红色 guard”。

建议文档位置：

- `BWE/docs/ai/00-working-rules.md`
- `BWE/docs/parity/manifest.md`
- `BWE/docs/parity/p0-start-character-age.md`
- `BWE/docs/parity/p0-battle-damage-log-death.md`
- `BWE/docs/parity/p0-equipment-ownership.md`
- `BWE/docs/parity/p0-map-selection.md`
- `BWE/docs/parity/p0-skill-eligibility-effects.md`

## Test Plan

- 先复用现有脚本，例如 `assert:map-data`、`assert:equip-window`、`assert:skill-window`、`assert:battle-player-state`、`assert:monster-reward`、`assert:growth-skill-protection`。
- 对没有 guard 的 P0 行为新增小脚本：角色/年龄选择、玩家受伤日志、装备不复制、技能武器限制、默认地图。
- 每次修复流程固定为：读 AS3 → 写/确认红色验收 → 最小修复 → 跑对应 assert → 跑 `npx tsc -b` → 浏览器手动 smoke。
- 不用 `npm run build` 单独判断逻辑是否坏，因为这个环境里 build 可能受路径/权限影响。

## Assumptions

- 默认不全量重写，先做 P0 行为还原。
- 默认真实工程根目录是 `C:\Users\zero_\Desktop\bwe-r\BWE`。
- 默认优先级是：战斗生死和状态所有权 > 装备/技能规则 > 地图流程 > UI 外观。
- 默认 AI 每次只拿一个模块规格卡工作，不接受“一次性修完整个游戏”的大任务。
