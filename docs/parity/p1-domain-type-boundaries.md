# P1 Domain Type Boundaries Parity

Last updated: 2026-05-30

## 中文

### 当前状态

Guard needed. `tsconfig.json` 开启了 `strict: true`，但核心领域类型仍大量使用 `any`。`PlayerState` 的 race、status、pet、title、装备槽、技能列表、物品列表、称号列表、宠物列表等字段几乎都绕过类型系统。审阅时 `src` 中约有 198 处 `as any` / `: any`，这让后续 parity 修复缺少编译器护栏。

### AS3 Source of Truth

- 无强制 AS3 源。此卡是 React/TypeScript architecture review。
- 对领域类型命名和字段语义，必要时参考对应 AS3 文件，不改变 AS3 外部行为。

### React Targets

- `src/core/types.ts`
- `src/core/models/Player.ts`
- `src/core/models/Battle.ts`
- `src/core/models/Equipment.ts`
- `src/core/models/Skill.ts`
- `src/core/models/Pet.ts`
- `src/core/models/Monster.ts`
- `src/state/actions.ts`
- `src/state/GameContext.tsx`
- high-churn UI consumers under `src/components`
- New guard: `scripts/assertDomainTypeBoundaries.mjs`

### Current Symptom

- `PlayerState` core fields are `any`.
- `GameAction` uses `any` for pet and title actions.
- Battle, skill behavior, pet behavior, item windows, and common cells frequently cast domain objects to `any`.
- TypeScript strictness does not protect the most important player/battle state transitions.

### Expected Behavior

- High-value domain fields are typed with imported model/data interfaces.
- Reducer actions use real payload types where those types already exist.
- `any` remains only at deliberately documented dynamic AS3 boundaries.
- A guard prevents new broad `any` regressions in `PlayerState`, `GameAction`, and battle/player ownership paths.
- Work is incremental: one domain cluster per follow-up, not one giant type rewrite.

### Forbidden Behavior

- Replacing `any` with unsafe casts that merely hide the same issue.
- Typing everything at once and changing runtime behavior by accident.
- Introducing new abstractions unrelated to AS3 parity or state ownership.
- Breaking transpile helpers or parity scripts that import TS modules.

### Red Guard Contract

Add `assert:domain-type-boundaries` so it fails while:

- `PlayerState` still uses `any` for fields whose concrete model/data type is already available.
- `GameAction` pet/title/equipment payloads remain untyped when the project has a matching type.
- total broad `any` count increases.
- new reducer edits introduce `as any` around player, battle, title, or equipment ownership paths.

### Acceptance Tests

- Needed: `npm run assert:domain-type-boundaries`
- Existing adjacent: `npm run assert:architecture`
- Existing adjacent: `npm run assert:battle-player-state`
- Existing adjacent: `npm run assert:equipment-ownership`
- Existing adjacent: `npm run assert:title-data-save-parity`
- Always run: `npx tsc -b`

## English

### Current Status

Guard needed. `strict: true` is enabled, but core domain state relies heavily on `any`. `PlayerState`, action payloads, battle helpers, and UI consumers can bypass the compiler on the highest-risk paths.

### Expected Behavior

- High-value domain fields use existing model/data types.
- Actions use real payload types where available.
- `any` remains only at documented dynamic AS3 boundaries.
- A guard prevents broad `any` growth around player, battle, title, and equipment ownership.
- Work stays incremental by domain cluster.

### Acceptance Tests

- Needed: `npm run assert:domain-type-boundaries`
- Existing adjacent: `npm run assert:architecture`
- Existing adjacent: `npm run assert:battle-player-state`
- Existing adjacent: `npm run assert:equipment-ownership`
- Existing adjacent: `npm run assert:title-data-save-parity`
- Always run: `npx tsc -b`
