# P2 Module Boundary Decomposition Parity

Last updated: 2026-05-30

## 中文

### 当前状态

Queued. `GameContext.tsx` 约 709 行，`Battle.ts` 约 614 行，`Player.ts` 约 610 行。文件体积本身不是 bug，但它放大了 reducer purity、battle state ownership、title ownership 和 type boundary 修复的风险。拆分应作为后续受 guard 保护的小步重构，而不是先于 P0/P1 行为边界修复的大规模整理。

### AS3 Source of Truth

- 无强制 AS3。此卡是 React architecture / maintainability review。
- 拆分后的外部行为必须继续受现有 AS3 parity guards 保护。

### React Targets

- `src/state/GameContext.tsx`
- `src/state/actions.ts`
- `src/state/selectors.ts`
- `src/core/models/Battle.ts`
- `src/core/models/Player.ts`
- future extracted modules under `src/state/reducers`, `src/core/systems`, or `src/core/models`
- `scripts/runGuardGate.mjs`

### Current Symptom

- One reducer switch owns scene, player, equipment, forge, shop, battle, title, save/load, config, and UI actions.
- Battle and Player models contain many unrelated helper groups.
- Architecture fixes become harder because unrelated concerns share large files and shared imports.

### Expected Behavior

- Decompose only after the relevant P0/P1 guard is green.
- Extract one coherent branch family at a time, for example forge effects, title ownership, save effects, or battle tick transition.
- Keep public action names and AS3-visible behavior stable.
- Prefer thin modules with clear inputs/outputs over new framework abstractions.

### Forbidden Behavior

- Starting with a broad file split before reducer purity and title ownership are guarded.
- Moving code without a focused guard proving behavior stayed the same.
- Renaming actions or changing save format for aesthetics.
- Combining multiple architecture cards in one decomposition pass.

### Acceptance Tests

- Relevant focused guard for the extracted area.
- `npm run assert:architecture`
- `npm run assert:gate:changed`
- Always run: `npx tsc -b`
- Browser smoke only when the extracted area affects visible UI.

## English

### Current Status

Queued. `GameContext.tsx`, `Battle.ts`, and `Player.ts` are large enough to make architecture fixes riskier. Size alone is not a bug; decomposition should follow guarded P0/P1 boundary repairs.

### Expected Behavior

- Extract one coherent branch family at a time.
- Keep public action names and AS3-visible behavior stable.
- Use focused guards before and after each extraction.

### Acceptance Tests

- Relevant focused guard for the extracted area.
- `npm run assert:architecture`
- `npm run assert:gate:changed`
- Always run: `npx tsc -b`
