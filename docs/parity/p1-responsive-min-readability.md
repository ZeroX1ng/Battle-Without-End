# P1 Responsive Minimum Readability

Last updated: 2026-06-20

Current status: Verified

## Chinese

### 当前状态

本卡来自 2026-06-19 UI 审阅。React 已经使用固定 `1280x720` 设计舞台和整舞台缩放处理高分辨率显示器，但在最小固定窗口（约 720p）下，舞台缩放为 1，主界面内大量 `9px`、`10px`、`11px` 文本没有被同比放大，肉眼观感反而偏小。4K 屏幕上把游戏窗口缩到最小尺寸时，这个问题更明显。

本卡只处理最小窗口可读性和响应式 guard，不处理单个窗口的业务逻辑、素材替换、商店公式或装备骨架。

### 玩家可见症状

- 4K 显示器上以最小固定窗口运行时，主界面文字偏小，尤其是右上角 tab 标签、装备/宠物/技能小面板、战斗技能、角色属性括号值和商店价格等。
- 1080p、2K、4K 放大后文字确实会跟随舞台变大，但 720p 基线本身缺少最低可读字号约束。
- 现有 `smokeResponsiveLayout.mjs` 主要证明 12px 战斗日志会随 `stageScale` 放大，没有覆盖 720p 下 9px/10px UI 文本的最低有效字号。

### AS3 / Product Boundary

- AS3 舞台是 `800x600`，React 当前是 intentional UI architecture：固定 `1280x720` 设计舞台再整舞台缩放。
- 因此本卡不是严格 AS3 坐标复刻卡，而是 AS3-adjacent 的现代容器可读性卡。
- 不要为了解决最小窗口字体小而取消整舞台缩放，也不要把每个局部面板各自做一套 viewport breakpoint；应先建立统一的最小可读字号和 smoke guard。

### Source Evidence

AS3 / layout truth:

- `reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as` - AS3 原始主舞台按 `800x600` 绘制。

React targets:

- `src/components/layout/GameLayout.tsx` - 声明 `DESIGN_STAGE_WIDTH = 1280`、`DESIGN_STAGE_HEIGHT = 720`，并计算 `--bwe-stage-scale`。
- `src/styles/layout.css` - `.game-stage-frame` 按 `stage * scale` 占位，`.game-shell` 使用 `transform: scale(var(--bwe-stage-scale))`。
- `src/styles/main-scene.css` - 主界面区域和战斗日志文字目前以固定设计像素布局。
- `src/components/panels/OtherPanel.tsx` - tab 标签为 `9px`。
- `src/components/panels/BattleSkillPanel.tsx`、`src/components/panels/PlayerInfoPanel.tsx`、`src/components/panels/PetInfoPanel.tsx`、`src/components/windows/EquipWindow.tsx`、`src/components/windows/ShopWindow.tsx` - 存在多处 `10px`、`11px` 文本。
- `scripts/smokeResponsiveLayout.mjs` - 当前 smoke 只检查 12px battle-log effective font size，未检查主界面最小可读字号矩阵。

### Expected Behavior

- 在 `1280x720` 设计舞台、`stageScale = 1` 时，主要可交互文字和标签不能低于明确的最小可读阈值。
- 在 1080p、2K、4K 下，整舞台放大仍保持现有比例，不引入主界面区域错位。
- 若保留个别 AS3 风格小字，必须只用于非关键信息，并在 guard 中白名单化，不能让 tab、按钮、价格、属性值等核心内容低于阈值。

### Forbidden Behavior

- 不要把 `GameLayout` 的固定设计舞台改回自由流式布局。
- 不要只改浏览器 zoom、系统 DPI 或全局 `body` 字号来掩盖问题。
- 不要用 CSS `transform: scale()` 局部放大文字导致点击热区和视觉位置分离。
- 不要把本卡扩展成 OtherPanel 对齐、装备骨架或商店成长修复。

### Red Guard Contract

新增或扩展 guard，让它在修复前能暴露当前 720p 可读性不足：

- 扩展 `scripts/smokeResponsiveLayout.mjs` 或新增 `scripts/assertResponsiveMinimumReadability.mjs`。
- 检查 `1280x720`、`1366x768`、`1920x1080`、`2560x1440`、`3840x2160`。
- 在 `stageScale = 1` 的视口中采集主界面核心选择器的 computed font size，例如 other tab label、battle skill label、player stat value、shop row、equip detail。
- 断言核心可交互/信息文本最低有效字号不低于约 `11px` 或项目最终决定的阈值；任何低于阈值的 AS3-style 小字必须有注释白名单。
- 继续保留现有 stage frame、shell、InfoWindow scale 和 battle-log effective font size 断言。

### Acceptance Tests

- Dedicated: `npm run assert:responsive-layout`
- If added: `node scripts/assertResponsiveMinimumReadability.mjs`
- Nearby: `npm run assert:other-window-children`
- Nearby: `npm run assert:equip-window`
- Nearby: `npm run assert:shop-window`
- Always: `npx tsc -b`

### 2026-06-20 验证记录

- `scripts/assertResponsiveMinimumReadability.mjs` 已覆盖 1280x720、1366x768、1920x1080、2560x1440、3840x2160。
- 最小有效字号：1280x720 为 11px；1366x768 为 11.73px；1080p/2K/4K 分别为 16.5px、22px、33px。
- 覆盖样本：OtherPanel tab/content、PlayerInfoPanel 属性、Pet/Monster 信息、BattleSkillPanel、EquipWindow、ShopWindow。
- 5 个视口均未发现主区域重叠。

### Manual Smoke

以 4K 显示器或浏览器模拟分别打开 `1280x720`、`1366x768`、`1920x1080`、`2560x1440`、`3840x2160`。确认主界面不需要缩放浏览器也能读清 tab、角色状态、战斗技能、背包/装备/宠物/商店文本；同时确认整舞台仍完整居中，没有面板重叠或浮窗缩放错位。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p1-responsive-min-readability.md 这一张 parity 卡。

要求：
1. 先读 docs/ai/00-working-rules.md、docs/parity/manifest.md 和本卡。
2. 对照以下文件确认现状：src/components/layout/GameLayout.tsx、src/styles/layout.css、src/styles/main-scene.css、scripts/smokeResponsiveLayout.mjs，以及主界面中 9px/10px/11px 文本所在组件。
3. 先新增或扩展 focused red guard，覆盖 1280x720 最小窗口下核心 UI 文本的最低有效字号；不要先直接改 CSS。
4. 做最小修复：保留 1280x720 固定设计舞台和整舞台缩放，只统一提升关键交互/信息文本的 720p 基线可读性。
5. 不要改 OtherPanel tab/content 对齐、EquipWindow 骨架、商店/赌博装备生成公式。
6. 修复后运行：npm run assert:responsive-layout；如新增脚本则运行 node scripts/assertResponsiveMinimumReadability.mjs；再运行 npm run assert:other-window-children、npm run assert:equip-window、npm run assert:shop-window、npx tsc -b。
7. 做 browser-visible smoke：1280x720、1366x768、1920x1080、2560x1440、3840x2160，报告 stageScale、核心文本字号、是否有重叠。
```

## English

### Current Status

This card covers the 2026-06-19 minimum-window readability issue. React already uses a fixed `1280x720` design stage and whole-stage scaling, but at the minimum 720p window the scale is `1`, so many `9px`, `10px`, and `11px` UI labels remain too small.

### Required Fix

Keep the fixed stage and whole-stage scale. Add a focused readability guard for 720p baseline text, then raise or normalize only core interactive/readout text that falls below the chosen threshold.

### Acceptance Tests

- `npm run assert:responsive-layout`
- `node scripts/assertResponsiveMinimumReadability.mjs` if a new script is added
- `npm run assert:other-window-children`
- `npm run assert:equip-window`
- `npm run assert:shop-window`
- `npx tsc -b`

### 2026-06-20 Verification

- `scripts/assertResponsiveMinimumReadability.mjs` covers 1280x720, 1366x768, 1920x1080, 2560x1440, and 3840x2160.
- Minimum effective font sizes are 11px at 1280x720, 11.73px at 1366x768, and 16.5px / 22px / 33px at 1080p / 2K / 4K.
- Samples cover OtherPanel tabs/content, PlayerInfoPanel stats, Pet/Monster info, BattleSkillPanel, EquipWindow, and ShopWindow.
- No main-region overlap was detected in the five smoke viewports.
