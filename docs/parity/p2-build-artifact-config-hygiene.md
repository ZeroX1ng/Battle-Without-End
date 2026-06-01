# P2 Build Artifact and Vite Config Hygiene Parity

Last updated: 2026-05-30

## 中文

### 当前状态

Guarded. `dist/` 目前被 git 跟踪，约 1349 个文件；`package.json` 的 Electron packaging 也显式打包 `dist/**/*`。这在一般前端工程里是构建产物污染，但本仓库历史上 `dist/` 已作为发布/桌面打包输入存在，不能默认当垃圾删除。`vite.config.mjs` 是唯一有效 Vite 配置，npm scripts 使用 `.mjs --configLoader native`。

### AS3 Source of Truth

- 无 AS3。此卡是 repo hygiene / release workflow review。

### React/Tooling Targets

- `dist/`
- `.gitignore`
- `package.json`
- `vite.config.mjs`
- `vite.config.ts`
- `electron/main.cjs`
- `.github/workflows/release-win.yml`
- packaging docs or README if added later

### Current Symptom

- `dist/` is tracked.
- `.gitignore` ignores `release/` and `output/`, but not `dist/`.
- Both `vite.config.ts` and `vite.config.mjs` exist.
- npm scripts use `vite.config.mjs --configLoader native`.

### Expected Behavior

- Decide explicitly whether `dist/` is a tracked release artifact or generated-only output for this repo.
- If `dist/` stays tracked, document why and add a guard that prevents accidental stale release assumptions.
- If `dist/` becomes ignored, update Electron packaging/release workflow so builds still produce the portable exe reliably.
- Keep one authoritative Vite config or add a clear guard/documentation that `.mjs` is the only active config.

### Repo Hygiene Decision

- Tracked dist policy: `dist/` stays tracked as historical release input for this checkout and must not be deleted as incidental cleanup.
- `pack:exe` must run `npm run build` before Electron packaging so tracked `dist/` is refreshed before producing the portable exe.
- `vite.config.mjs is the only active Vite config`; `vite.config.ts` is removed so tools do not see two active-looking configs.
- `release-win.yml` runs `assert:repo-hygiene` before packaging to keep this policy executable.

### Forbidden Behavior

- Deleting tracked `dist/` as incidental cleanup during a parity fix.
- Adding `dist/` to `.gitignore` without adjusting release packaging expectations.
- Leaving two active-looking Vite configs after the cleanup decision.
- Mixing this repo hygiene card with reducer or battle architecture changes.

### Red Guard Contract

Add or extend a hygiene guard so it fails while:

- package scripts and workflow docs disagree about the active Vite config.
- `dist/` policy is undocumented.
- release packaging cannot prove it builds `dist` before packaging when `dist` is ignored.

### Acceptance Tests

- Existing: `npm run assert:repo-hygiene`
- Existing: `npm run assert:source-encoding`
- Existing: `npm run assert:text-resources`
- If packaging flow changes: `npm run build`
- If package/workflow changes: `npx tsc -b`

## English

### Current Status

Guarded. `dist/` is tracked and `package.json` packages `dist/**/*` for Electron. That is unusual for frontend repos, but in this checkout `dist/` has release history and should not be removed as incidental cleanup. `vite.config.mjs` is the only active Vite config.

### Expected Behavior

- Explicitly decide and document whether `dist/` is tracked release input or generated-only output.
- Keep release packaging reliable under that policy.
- Keep one authoritative Vite config, or guard/document that `.mjs` is active.

### Repo Hygiene Decision

- Tracked dist policy: `dist/` stays tracked as historical release input for this checkout and must not be deleted as incidental cleanup.
- `pack:exe` must run `npm run build` before Electron packaging so tracked `dist/` is refreshed before producing the portable exe.
- `vite.config.mjs is the only active Vite config`; `vite.config.ts` is removed so tools do not see two active-looking configs.
- `release-win.yml` runs `assert:repo-hygiene` before packaging to keep this policy executable.

### Acceptance Tests

- Existing: `npm run assert:repo-hygiene`
- Existing: `npm run assert:source-encoding`
- Existing: `npm run assert:text-resources`
- If packaging flow changes: `npm run build`
- If package/workflow changes: `npx tsc -b`
