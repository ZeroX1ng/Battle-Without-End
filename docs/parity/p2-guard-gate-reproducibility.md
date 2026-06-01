# P2 Guard Gate Reproducibility Parity

Last updated: 2026-05-30

## 中文

### 当前状态

Guarded. 审阅中“guard 大部分依赖缺失的 `../BOE-O` 而不可运行”的结论已经过时：本仓库现在有 `reference/as3/BOE-O`，`scripts/lib/as3Source.mjs` 会优先解析 vendored AS3，并保留 `BWE_AS3_ROOT` 和兄弟目录兜底。实际验证中 `npm test`、`assert:preflight`、`assert:battle-player-state`、`assert:gate:ci`、`assert:gate:all` 均通过。

`npm test` 现在作为常规本地入口运行 changed guard gate；CI 的 guard gate 继续保持可发现、可复现、可在新机器上先跑 preflight。`release-win.yml` 仍只运行发布打包前的较小 release guard 子集，不替代完整 parity verification。

### AS3 Source of Truth

- `reference/as3/BOE-O` as a vendored source tree.
- This is tooling/reproducibility work, not game behavior parity.

### React/Tooling Targets

- `package.json`
- `scripts/lib/as3Source.mjs`
- `scripts/assertPreflight.mjs`
- `scripts/runGuardGate.mjs`
- `.github/workflows/guard-gate.yml`
- `.github/workflows/release-win.yml`
- `docs/ai/00-working-rules.md`
- `docs/parity/manifest.md`

### Current Symptom

- `npm test` runs the standard local changed guard gate.
- Release workflow runs a small release guard subset by design.
- Guard gate is present, but future agents may still assume AS3 is external-only unless preflight is used.

### Expected Behavior

- `npm test` runs the standard local changed guard gate.
- `assert:preflight` remains the first proof that AS3 is locally resolvable.
- CI on push/PR runs guard gate and `npx tsc -b`.
- Release workflow may keep a narrower release subset, but docs should distinguish release packaging from full parity verification.
- New guard scripts must use `scripts/lib/as3Source.mjs`, not hard-coded `../BOE-O`.

### Forbidden Behavior

- Reverting scripts to require only `../BOE-O`.
- Removing vendored AS3 preflight.
- Treating `release-win.yml` as the only CI evidence.
- Making `npm test` run a slow browser smoke by default unless explicitly intended.

### Acceptance Tests

- Needed after changes: `npm test`
- Existing: `npm run assert:preflight`
- Existing: `npm run assert:gate:ci`
- Full confidence: `npm run assert:gate:all`
- Always run if package/scripts changed: `npx tsc -b`

## English

### Current Status

Guarded. The review claim that most guards require missing `../BOE-O` is stale. The repo now vendors AS3 under `reference/as3/BOE-O`, and `scripts/lib/as3Source.mjs` resolves that path first. `npm test` now provides a conventional changed-gate entrypoint, while the release workflow remains a narrower packaging guard subset rather than full parity verification.

### Acceptance Tests

- Needed after changes: `npm test`
- Existing: `npm run assert:preflight`
- Existing: `npm run assert:gate:ci`
- Full confidence: `npm run assert:gate:all`
- Always run if package/scripts changed: `npx tsc -b`
