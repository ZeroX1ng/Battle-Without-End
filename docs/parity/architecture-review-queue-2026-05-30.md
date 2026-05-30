# Architecture Review Queue 2026-05-30

Last updated: 2026-05-30

## 中文

### 使用方式

这是一次代码审阅后整理出的 architecture parity 队列。每次只处理一张卡。`No AS3; React architecture review` 的卡不强行寻找 AS3 真相源，但仍必须保持已有 AS3 parity guard 绿色。

### 修复顺序

| Order | ID | Priority | Card | Status | Why First |
| --- | --- | --- | --- | --- | --- |
| 1 | A-R1 | P0 | `p0-architecture-reducer-purity-strictmode.md` | Guarded | `assert:reducer-purity-strictmode` 覆盖 reducer purity / effect layer 边界；后续仅在 guard 变红或手动 smoke 发现漂移时重开。 |
| 2 | A-R2 | P0 | `p0-title-state-ownership.md` | Needs repair | 称号进度和技能解锁队列是跨存档全局态，修 reducer purity 时会碰到同一边界。 |
| 3 | A-R3 | P1 | `p1-battle-state-immutability.md` | Guard needed | `Battle` 可变实例是 reducer purity 的最大运行时阻抗，需在 P0 边界清楚后再收敛。 |
| 4 | A-R4 | P1 | `p1-domain-type-boundaries.md` | Guard needed | 类型护栏能降低后续状态所有权修复风险，但不应先于真实运行时 bug。 |
| 5 | A-R5 | P2 | `p2-guard-gate-reproducibility.md` | Mostly guarded | 旧审阅误判已被 vendored AS3 和 gate 反证，只剩 `npm test`/文档入口可改善。 |
| 6 | A-R6 | P2 | `p2-build-artifact-config-hygiene.md` | Guard needed | `dist/` 和 Vite config 是 repo hygiene，不要和 P0 行为架构混修。 |
| 7 | A-R7 | P2 | `p2-module-boundary-decomposition.md` | Queued | 等 P0/P1 guard 稳定后，再按一块一块的方式拆大文件。 |

### 后续修复提示词

```text
Dear Master 要我按 BWE 规则只修一个 architecture parity card。

请在 C:\Users\zero_\Desktop\bwe-r\BWE 工作，并先读：
1. docs/ai/00-working-rules.md
2. docs/parity/manifest.md
3. docs/parity/architecture-review-queue-2026-05-30.md
4. 本次指定卡片：docs/parity/<CARD>.md

本次只处理：<CARD_ID> / docs/parity/<CARD>.md。

要求：
- 先运行 git status --short，确认工作树状态。
- 如果卡片写着 No AS3; React architecture review，不要浪费时间硬找 AS3；以卡片列出的 React ownership boundary 为准。
- 如果卡片列了 AS3 Source of Truth，则先读 AS3，再读 React targets。
- 先新增或确认 red guard，不要先改生产代码。
- 只做本卡最小修复，不顺手修其他 architecture 卡。
- 修复后运行卡片列出的 dedicated guard、nearby guards 和 npx tsc -b。
- 如果改动影响玩家可见 UI 或 dev StrictMode 行为，补浏览器 smoke 或等价复现证据。
- 最终报告按：AS3/architecture evidence、changed files、verification results、remaining risks。
```

### 推荐第一次执行

```text
本次只处理 A-R1：
docs/parity/p0-architecture-reducer-purity-strictmode.md

目标：让 GameContext reducer 在 React StrictMode 双调用下不再执行 IO、随机、音效、时间戳、全局称号 mutation 或旧 state class 实例 mutation。先写/确认 assert:reducer-purity-strictmode，再做最小修复。
```

## English

### How To Use

This is an architecture parity queue distilled from the 2026-05-30 review. Pick one card per session. Cards marked `No AS3; React architecture review` should not force AS3 lookup, but all existing AS3 parity guards must remain green.

### Repair Order

| Order | ID | Priority | Card | Status | Why First |
| --- | --- | --- | --- | --- | --- |
| 1 | A-R1 | P0 | `p0-architecture-reducer-purity-strictmode.md` | Guarded | `assert:reducer-purity-strictmode` covers the reducer purity / effect-layer boundary; reopen only if the guard regresses or manual smoke finds drift. |
| 2 | A-R2 | P0 | `p0-title-state-ownership.md` | Needs repair | Title progress and skill unlock queues are cross-save global state. |
| 3 | A-R3 | P1 | `p1-battle-state-immutability.md` | Guard needed | Mutable Battle instances are the largest runtime mismatch with pure reducer boundaries. |
| 4 | A-R4 | P1 | `p1-domain-type-boundaries.md` | Guard needed | Type boundaries reduce future repair risk after runtime bugs are contained. |
| 5 | A-R5 | P2 | `p2-guard-gate-reproducibility.md` | Mostly guarded | Vendored AS3 and guard gate already refute the stale missing-source claim. |
| 6 | A-R6 | P2 | `p2-build-artifact-config-hygiene.md` | Guard needed | Repo hygiene should stay separate from P0 behavior architecture. |
| 7 | A-R7 | P2 | `p2-module-boundary-decomposition.md` | Queued | Large file decomposition should wait until P0/P1 guards stabilize. |
