# BWE Agent Instructions

本文件适用于 `BWE` 仓库根目录及其子目录，面向 Codex、DeepSeek Pro v4 和其他本地 coding agent。

## 沟通与范围

- 始终用中文回复用户，并称呼用户为 `Dear Master`。
- 一次只处理一个明确的 parity card、review-queue row、roadmap checkpoint 或工具链任务。
- 如果用户要求只读审阅，不要修改文件。
- 开始修复或发布前运行 `git status --short`，不要回滚、覆盖或整理无关改动。

## 启动必读

开始任何 BWE parity、修复、审阅、发布或路线图任务前，先读：

1. `docs/ai/00-working-rules.md`
2. `docs/parity/manifest.md`
3. 如任务涉及 roadmap/checkpoint，再读 `docs/superpowers/plans/2026-05-25-bwe-parity-verification-roadmap.md`
4. 如任务涉及试玩 follow-up，再读 `docs/parity/playtest-followups-2026-05-25.md`

AS3 真相源默认是 `reference/as3/BOE-O`。如果环境提供 `BWE_AS3_ROOT`，优先使用该变量；保留 `../BOE-O` 仅作为旧本机布局兜底。

## Parity 工作规则

- AS3 是外部行为真相源。先读卡片列出的 AS3 Source of Truth，再读 React Targets。
- 如果卡片、manifest 和 AS3 不一致，以 AS3 为准，并先修正文档路由。
- 先补充或确认 focused red guard，再做最小修复；已有 guard 要复用。
- 不要顺手重构无关模块，不要把战斗、装备、技能、地图、UI 等多个问题混在一次提交里。
- 可以为了 React 结构健康做内部实现调整，但必须保持 AS3 可见行为一致，并用 guard 或文档记录 intentional divergence。
- UI、性能或玩家可见流程相关任务需要浏览器 smoke、截图或等价渲染证据。

## 强制验证入口

完成任何代码或工具链变更前，至少运行并报告：

```powershell
npm run assert:gate:changed
```

处理明确 parity card 时，还要运行卡片或 manifest 列出的 dedicated guard 和 nearby guards；若 `assert:gate:changed` 已覆盖这些命令，也要在最终报告里逐项说明。

常用门禁：

```powershell
npm run assert:gate:baseline
npm run assert:gate:changed
npm run assert:gate:all
```

- `assert:gate:baseline` 跑预检、编码 guard 和 `npx tsc -b`。
- `assert:gate:changed` 根据 git 改动路径选择相关 guard，并总是跑 baseline 与 `npx tsc -b`。
- `assert:gate:all` 跑 `package.json` 中注册的全部 `assert:*`，再跑 `npx tsc -b`。

不要只用 `npm run build` 证明逻辑正确；当前环境可能受 Vite 或路径权限限制。

## 最终报告

Parity 修复的最终报告优先包含：

- AS3 evidence
- changed files
- verification results
- browser smoke evidence（UI、性能或玩家可见流程需要）

提交或推送时只 stage 当前任务范围内的文件，并先检查 `git diff --cached --stat`、`git diff --cached --check`、`git diff --cached --name-only`。
