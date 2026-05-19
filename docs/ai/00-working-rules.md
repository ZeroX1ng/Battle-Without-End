# BWE AI Working Rules

Last updated: 2026-05-19

## 中文

### 目标

本项目是从反编译 SWF/AS3 源码 `../BOE-O` 迁移到 React/TypeScript 的行为还原项目。AI 的目标不是写一个“风格类似”的新游戏，而是让 `BWE` 在规则、状态、数值、日志、资源和窗口行为上逐项贴近 AS3 原作。

### 硬性规则

- `../BOE-O` 是唯一行为源。任何规则、公式、默认值、列表顺序、掉落池、技能限制和状态流转，都必须先读 AS3，再改 React。
- 视觉相似不等于完成。按钮、窗口和面板存在，只能说明 UI 有入口；必须继续验证它是否消费了真实业务状态。
- 禁止 AI 自创规则。不能用“更合理”“更现代”“React 更方便”的规则替代 AS3 原逻辑。
- 禁止跳过源文件对照。每个改动说明都要列出读过的 AS3 文件和 React 目标文件。
- 一次只修一个 P0 行为。不要把战斗、装备、技能、地图和 UI 外观混在一个大改里。
- 先写或确认可执行验收，再修复。已有 guard 要复用；缺 guard 时先新增最小红色断言。
- 状态所有权优先于界面表现。战斗中的玩家状态、背包物品、装备槽、地图、技能装备列表必须有单一真实来源。
- 复杂公式保留 AS3 命名线索。迁移时尽量保留 `modifier`、`monsterList`、`petList`、`equipSkillList` 等原名，必要时用中文注释说明公式来源。
- 不要用 `npm run build` 单独判断逻辑正确性。当前环境可能存在 Vite/路径权限限制；优先使用目标 parity script 和 `npx tsc -b`。

### 标准工作流

1. 选择一个 parity 卡片，例如 `docs/parity/p0-skill-eligibility-effects.md`。
2. 阅读卡片里的 AS3 Source of Truth 和 React Targets。
3. 用 `rg` 定位源文件里的实际分支、状态字段和日志文本。
4. 运行已有 assert，或新增卡片要求的最小 guard。
5. 让 guard 先暴露当前错误行为。
6. 做最小修复，不顺手重构无关模块。
7. 运行对应 assert、相关邻近 assert 和 `npx tsc -b`。
8. 按卡片的 Manual Smoke Scenario 进入浏览器验证玩家可见流程。
9. 更新 parity manifest 的状态和下一步。

### 给 AI 的任务模板

```text
按 docs/parity/<card>.md 修复一个 P0 parity 问题。

要求：
- 先读卡片列出的 AS3 Source of Truth。
- 不要改无关模块。
- 先补/确认 red guard，再做最小修复。
- 修复后运行卡片 Acceptance Tests。
- 明确报告：读了哪些 AS3 文件、改了哪些 React 文件、哪些验证通过、哪些验证受环境限制。
```

### 完成定义

一个模块只有同时满足以下条件，才能从 `Needs repair` 移到 `Guarded` 或 `Verified`：

- AS3 源文件已读并被引用。
- React 行为没有依赖猜测或临时硬编码。
- 状态所有权明确，战斗 tick 后不会回滚。
- 有可执行 guard 覆盖核心行为。
- 玩家可见 smoke 场景通过。
- 中英文文档同步更新。

## English

### Purpose

This project migrates a decompiled SWF/AS3 game from `../BOE-O` into React/TypeScript. The AI goal is not to create a visually similar new game. The goal is step-by-step parity with the AS3 source in rules, state ownership, numbers, logs, assets, and window behavior.

### Hard Rules

- `../BOE-O` is the only behavior source of truth. Read AS3 before changing rules, formulas, defaults, list order, drop pools, skill restrictions, or state transitions.
- Visual similarity is not completion. A component or button only proves an entry point exists; it must still be verified against real business behavior.
- Do not invent new rules. Do not replace AS3 behavior with something that feels more reasonable, modern, or React-friendly.
- Do not skip source comparison. Every implementation note must list the AS3 files inspected and the React files changed.
- Fix one P0 behavior at a time. Do not mix battle, equipment, skills, map flow, and visual polish in one large pass.
- Confirm executable acceptance before repair. Reuse existing guards; when a guard is missing, add the smallest red assertion first.
- State ownership beats UI appearance. Battle player state, inventory items, equipment slots, map selection, and equipped skills must each have a single source of truth.
- Preserve AS3 naming clues for complex formulas and tables, such as `modifier`, `monsterList`, `petList`, and `equipSkillList`.
- Do not use `npm run build` alone as proof of logic correctness. This environment can hit Vite/path permission limits; prefer targeted parity scripts and `npx tsc -b`.

### Standard Workflow

1. Choose one parity card, for example `docs/parity/p0-skill-eligibility-effects.md`.
2. Read the card's AS3 Source of Truth and React Targets.
3. Use `rg` to locate real AS3 branches, state fields, and log text.
4. Run existing asserts, or add the minimal guard required by the card.
5. Confirm the guard exposes the current bad behavior.
6. Make the smallest focused repair.
7. Run the card's asserts, nearby asserts, and `npx tsc -b`.
8. Execute the Manual Smoke Scenario in the browser.
9. Update the parity manifest status and next step.

### AI Task Template

```text
Fix one P0 parity issue according to docs/parity/<card>.md.

Requirements:
- Read the listed AS3 Source of Truth first.
- Do not edit unrelated modules.
- Add or confirm the red guard before implementation.
- Run the card's Acceptance Tests after the fix.
- Report AS3 files read, React files changed, verification results, and environment-limited checks.
```

### Definition of Done

A module can move from `Needs repair` to `Guarded` or `Verified` only when:

- The AS3 source files were read and cited.
- The React behavior is not based on guessing or temporary hardcoding.
- State ownership is clear and does not revert after battle ticks.
- An executable guard covers the core behavior.
- The player-visible smoke scenario passes.
- Chinese and English docs are kept in sync.
