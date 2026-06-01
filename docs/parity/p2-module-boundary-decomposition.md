# P2 Module Boundary Decomposition Parity

Last updated: 2026-06-01

## 中文

### 当前状态

Guarded. 已先让 `assert:module-boundary-decomposition` 对缺失的 `src/state/reducerEffects.ts` 变红，再将 reducer effect 队列、post-commit effect 处理、StrictMode 随机百分比 helper 拆出 `GameContext.tsx`。`GameContext.tsx` 仍保留 reducer case 和 Provider ownership；后续如继续拆 `Battle.ts` 或 `Player.ts`，仍必须按单一 branch family 重新走 red guard。

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

- `npm run assert:module-boundary-decomposition`
- Nearby: `npm run assert:reducer-purity-strictmode`
- `npm run assert:architecture`
- `npm run assert:gate:changed`
- Always run: `npx tsc -b`
- Browser smoke only when the extracted area affects visible UI.

## English

### Current Status

Guarded. `assert:module-boundary-decomposition` first failed on the missing `src/state/reducerEffects.ts` boundary, then the reducer effect queue, post-commit effect processor, and StrictMode random-percent helper were extracted from `GameContext.tsx`. `GameContext.tsx` still owns reducer cases and Provider wiring; future `Battle.ts` or `Player.ts` decomposition must continue one branch family at a time with a new red guard.

### Expected Behavior

- Extract one coherent branch family at a time.
- Keep public action names and AS3-visible behavior stable.
- Use focused guards before and after each extraction.

### Acceptance Tests

- `npm run assert:module-boundary-decomposition`
- Nearby: `npm run assert:reducer-purity-strictmode`
- `npm run assert:architecture`
- `npm run assert:gate:changed`
- Always run: `npx tsc -b`
