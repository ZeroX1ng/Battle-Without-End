# P2 Test Speed Floating Popover

Last updated: 2026-06-20

Current status: Needs repair

## Chinese

### 当前状态

本卡来自 2026-06-20 实时浏览器标注 Comment 4。`P2-TEST-SPEED-CONTROL` 已验证测试倍速功能本身：dev 可见、release 隐藏、不进入存档、只影响 `useGameLoop` interval。但当前 UI 在右上 tab 栏旁边保留了一排倍速按钮的位置，release 隐藏后仍容易留下布局占位或视觉空洞。

Dear Master 期望把调速做成左侧人物名称旁边的悬浮式入口，点击后弹出是否改变速率或选择速率。

### 类型边界

这是临时测试工具 UI 改进，不是 AS3 parity。AS3 的正常战斗节奏仍由 `Battle.as` 的 `Timer(500)` 作为基线；本卡不能改变正式发布版本的玩家可见 UI，也不能把测试状态写入存档。

### 玩家可见症状

- dev 版本右上角 tab 栏旁边挤着 `1x/10x/25x/50x/无敌` 控件。
- release 隐藏测试控件后，同一位置仍可能出现空白占位或让 tab 栏边界看起来不自然。
- 测试倍速属于调试操作，不应常驻占用功能 tab 的横向空间。

### Source Evidence

- `src/core/debug/testSpeedControl.ts` - `TEST_SPEED_CONTROL_ENABLED = !import.meta.env.PROD`。
- `src/components/scenes/MainScene.tsx` - 当前在 `main-scene` 顶层直接渲染 `<TestSpeedControl />`。
- `src/components/debug/TestSpeedControl.tsx` - 当前直接显示所有倍速按钮和无敌按钮。
- `src/styles/main-scene.css` - `.test-speed-control` 绝对定位在 `top: 10px; right: 10px`，靠近右侧 tab 栏。
- `scripts/assertTestSpeedControlParity.mjs` - 已守住功能和保存边界，可扩展布局入口约束。

### Expected Behavior

- dev 版本只在左侧人物名称旁边显示一个紧凑的悬浮调速入口。
- 点击入口后弹出选择面板，展示 `1x/10x/25x/50x` 和无敌开关；关闭后不占用右上 tab 栏空间。
- release 版本完全不渲染入口和弹出层，也不留下占位。
- 倍速仍只影响 `useGameLoop` effective interval；无敌仍只通过 transient battle meta 传入当前 tick。

### Forbidden Behavior

- 不要把倍速或无敌状态写入 save/config/global state。
- 不要改变 AS3 500ms baseline 或默认 1x。
- 不要让 release 构建显示任何调速入口、空白占位或测试按钮。
- 不要把调速控件继续放在右上 tab 栏旁边。

### Red Guard Contract

扩展 `assert:test-speed-control` 或新增 `assert:test-speed-floating-popover`：

- 静态断言 `.test-speed-control` 不再固定在 `right: 10px`。
- 断言 `MainScene` 或 `PlayerInfoPanel` 附近提供 dev-only trigger hook，例如 `data-bwe-test-speed-trigger`。
- 断言弹出层 hook，例如 `data-bwe-test-speed-popover`，只在打开时出现。
- 断言 release gating 仍由 `TEST_SPEED_CONTROL_ENABLED = !import.meta.env.PROD` 控制，save/types 中仍没有 `testSpeed`、`speedMultiplier`、`oneHitKill`。
- 浏览器 smoke 点击 trigger，选择 10x，再关闭弹出层，确认右上 tab rail rect 不被调速 UI 占用。

### Acceptance Tests

- Dedicated: `npm run assert:test-speed-control`
- If added: `npm run assert:test-speed-floating-popover`
- Nearby: `npm run assert:game-loop`
- Nearby: `npm run assert:responsive-layout`
- Always: `npx tsc -b`

### Manual Smoke

dev server 下打开主场景，确认人物名称旁边有小型调速入口，右上 tab 栏旁边没有常驻倍速按钮。点击入口，选择 `10x`，确认战斗日志节奏加快；关闭弹窗，确认入口仍在、弹层消失。构建或模拟 PROD 后确认调速入口和弹层完全不渲染。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p2-test-speed-floating-popover.md 这一张卡。
要求：
1. 先运行 git status --short，不要回滚无关改动。
2. 读取 docs/ai/00-working-rules.md、docs/parity/manifest.md、本卡，以及 docs/parity/playtest-followups-2026-05-25.md#p2-test-speed-control。
3. 对照 AS3：reference/as3/BOE-O/scripts/iData/Battle.as 的 Timer(500)，只用于保护正常节奏基线。
4. 对照 React：src/core/debug/testSpeedControl.ts、src/components/scenes/MainScene.tsx、src/components/debug/TestSpeedControl.tsx、src/components/panels/PlayerInfoPanel.tsx、src/styles/main-scene.css、scripts/assertTestSpeedControlParity.mjs。
5. 先扩展或新增 guard，证明调速控件不应占用右上 tab 栏空间，并守住 release 完全不渲染、状态不入存档。
6. 做最小修复：把常驻按钮改成左侧人物名称旁边的 dev-only 悬浮入口；点击后弹出倍速/无敌选择面板；关闭后不占右侧 tab 空间。
7. 不要改默认 1x、不要保存倍速/无敌、不要改 Battle 500ms baseline、不要改正式 release UI。
8. 修复后运行：npm run assert:test-speed-control；如新增脚本再运行 npm run assert:test-speed-floating-popover；再运行 npm run assert:game-loop、npm run assert:responsive-layout、npx tsc -b。
9. 做 browser smoke：dev 下点击入口/选择 10x/关闭弹层，报告 trigger、popover、right tab rail 的 rect；release gating 用 build 或静态 guard 证明无占位。
```

## English

### Required Fix

Keep test speed controls dev-only, but replace the right-top permanent button row with a compact floating trigger near the player name. The trigger opens a popover for speed and one-hit options, and release builds render neither trigger nor placeholder.

### Acceptance Tests

- `npm run assert:test-speed-control`
- `npm run assert:test-speed-floating-popover` if added
- `npm run assert:game-loop`
- `npm run assert:responsive-layout`
- `npx tsc -b`
