# P1 OtherPanel Tab Content Alignment

Last updated: 2026-06-20

Current status: Verified

## Chinese

### 当前状态

本卡来自 2026-06-19 UI 审阅。右上角背包、装备、宠物、技能等 tab 使用了接近 AS3 的 4 个可见 tab 加左右箭头结构，但 React 主界面第三列最小宽度为 `240px`，tab rail 视觉宽度约 `200px`，下方内容窗口则 `flex: 1` 填满整个右列，导致 tab 栏和内容区域左右边界不齐。

本卡只处理 `OtherPanel` 的 tab rail 与下方内容窗口对齐，不处理字体最小可读性、装备骨架、背包/装备业务逻辑或商店成长。

### 玩家可见症状

- 右上角 tab 栏看起来是一条约 200px 的 AS3 风格按钮带，但下方背包/装备/宠物内容区域更宽。
- 背包、装备、宠物等 tab 与其下方显示内容视觉上没有共享同一个左/右边界。
- 在最小窗口或 4K 缩放后的主界面中，这个错位会更明显，像 tab 没有真正挂在窗口上。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/OtherPanel.as` - `cover.graphics.drawRect(0,-20,200,60)`，tab 覆盖区域宽度为 200。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/OtherPanel.as` - `right.x = 160`，4 个 `40px` tab 后接右箭头，整体宽度为 200。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/OtherPanel.as` - `_this.window.y = 40`，下方窗口挂在 tab 下方。
- `reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as` - `otherPanel.x = 590`、`otherPanel.y = 10`。

### React Targets

- `src/components/panels/OtherPanel.tsx` - `TAB_SIZE = 40`、`VISIBLE_COUNT = 4`、`VISIBLE_WIDTH = 160`，左右箭头各 `20px`。
- `src/components/panels/OtherPanel.tsx` - 内容容器当前 `flex: 1`，会填满父列宽度。
- `src/styles/main-scene.css` - 主界面第三列当前是 `minmax(240px, ...)`，比 AS3 tab/window 宽度大。
- `scripts/assertOtherWindowChildrenParity.mjs`、`scripts/assertOtherWindowOverlayParity.mjs` - 现有 guard 保护窗口子项/overlay，但不保护 tab rail 与内容窗口宽度关系。

### Expected Behavior

- tab rail 和下方 active content window 应共享同一个视觉宽度基准。
- 如果继续采用 AS3 宽度，rail 总宽度应为 `20 + 160 + 20 = 200px`，内容窗口也应按同一宽度收敛。
- 如果为了 React 右列信息密度保留更宽窗口，必须把 tab rail、内容窗口和 guard 一起更新为统一宽度，而不是一个 200px、一个 240px+。

### Forbidden Behavior

- 不要只移动 tab 或只移动内容窗口，让二者继续使用不同宽度。
- 不要把主界面第三列整体重写成新的 responsive 系统。
- 不要为了对齐而破坏 AS3 tab 滚动逻辑、左右箭头禁用状态或 `MenuButton` sprite 状态。
- 不要把本卡扩展成 `EquipWindow` 内部骨架/slot 坐标修复。

### Red Guard Contract

新增一个 focused guard，例如 `scripts/assertOtherPanelTabContentAlignment.mjs`，并在 `package.json` 暴露 `assert:otherpanel-tab-alignment`：

- 静态检查 `OtherPanel.tsx` 中 tab rail 和 content window 使用共享常量或共享 CSS hook。
- 浏览器 smoke 或 DOM guard 采集 `[data-bwe-other-tab-rail]` 与 `[data-bwe-other-content]` 的 bounding rect。
- 断言二者 left/right 或 width 差值在 `1px` 以内，且 active tab content 没有溢出主舞台。
- 保留 `assert:other-window-children` 和 `assert:other-window-overlay` 的现有行为。

### Acceptance Tests

- Dedicated: `npm run assert:otherpanel-tab-alignment`
- Existing nearby: `npm run assert:other-window-children`
- Existing nearby: `npm run assert:other-window-overlay`
- Layout nearby: `npm run assert:responsive-layout`
- Always: `npx tsc -b`

Passed 2026-06-20: dedicated guard, nearby window guards, responsive layout guard, TypeScript build, and browser rect smoke at 1280x720, 1920x1080, and 3840x2160.

### Manual Smoke

在 `1280x720`、`1920x1080`、`3840x2160` 下打开主界面，依次点击背包、装备、宠物、技能、称号、设置、其他。确认左右箭头、四个可见 tab 和下方内容窗口共享边界；滚动 tab 后仍对齐；active tab 与窗口内容没有横向偏移。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p1-otherpanel-tab-content-alignment.md 这一张 parity 卡。

要求：
1. 先读 docs/ai/00-working-rules.md、docs/parity/manifest.md 和本卡。
2. 对照 AS3：reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/OtherPanel.as 与 reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as。
3. 对照 React：src/components/panels/OtherPanel.tsx、src/styles/main-scene.css、scripts/assertOtherWindowChildrenParity.mjs、scripts/assertOtherWindowOverlayParity.mjs。
4. 先新增 focused red guard：assert:otherpanel-tab-alignment，证明当前 tab rail 与 content window 宽度/边界不一致。
5. 做最小修复：让 tab rail 和下方 content window 使用同一个宽度/边界基准；保留 AS3 tab sprite、左右箭头、滚动和 active 状态。
6. 不要改 EquipWindow 内部布局、不要改字体可读性全局方案、不要改商店/赌博装备生成。
7. 修复后运行：npm run assert:otherpanel-tab-alignment、npm run assert:other-window-children、npm run assert:other-window-overlay、npm run assert:responsive-layout、npx tsc -b。
8. 做 browser smoke：1280x720、1920x1080、3840x2160 下点击所有 tab 并滚动 tab，报告 rail/content bounding rect 是否对齐。
```

## English

### Current Status

The AS3 `OtherPanel` uses a 200px tab/window width (`20px` left arrow, four `40px` tabs, `20px` right arrow). React keeps the 200px tab rail but lets the content pane fill the wider right column, so the tabs and content no longer share edges.

### Required Fix

Add a focused tab/content alignment guard first. Then make the tab rail and active content pane share one width/bounds contract, preserving AS3 tab sprites, scroll arrows, and active state behavior.

### Acceptance Tests

- `npm run assert:otherpanel-tab-alignment`
- `npm run assert:other-window-children`
- `npm run assert:other-window-overlay`
- `npm run assert:responsive-layout`
- `npx tsc -b`

Passed 2026-06-20 with browser rect smoke across 720p, FHD, and UHD viewports.
