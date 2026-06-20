# P1 LootPanel And Battle Log Alignment

Last updated: 2026-06-20

Current status: Needs repair

## Chinese

### 当前状态

本卡来自 2026-06-20 实时浏览器标注 Comment 1。当前地图统计面板位于中间战斗列下方，未与左侧战斗日志形成清晰的顶部/底部对齐关系，导致日志旁边和地图统计上方出现不合理空白。

本卡只处理 `LootPanel`、战斗技能面板和左侧日志区域的空间利用，不处理装备 tab、右侧功能区、掉落统计数值或战斗奖励公式。

### 玩家可见症状

- 左侧战斗日志占据了下半屏大面积区域，但中间列的当前地图统计在更靠下的位置开始。
- 当前地图统计上方留有空白，视觉上像没有和战斗日志同属一个底部信息带。
- 地图统计数值本身正确，但面板位置让空间利用显得松散。

### AS3 / Product Boundary

- AS3 `MainScene.as` 使用固定舞台坐标，React 当前使用 `1280x720` 固定设计舞台加整舞台缩放，这是已记录的 AS3-adjacent UI 架构。
- `LootPanel` 的统计内容来自当前 React UI 对 AS3 掉落/地图统计的呈现，不应在本卡中改动统计数据含义。
- 本卡是布局修复卡，验收重点是日志区和地图统计区的视觉对齐与空间利用。

### Source Evidence

- `src/components/scenes/MainScene.tsx` - `BattleSkillPanel` 与 `LootPanel` 都在 `main-scene__battle-bottom`。
- `src/components/panels/LootPanel.tsx` - 当前固定 `width: 170`，内部显示金币、经验和六种装备品质统计。
- `src/components/panels/AllInfoPanel.tsx` - 左侧战斗日志承载主要战斗文本。
- `src/styles/main-scene.css` - `main-scene__battle-bottom { align-content: start; }`，`main-scene__log` 单独占据左下区域。

### Expected Behavior

- 当前地图统计应与左侧战斗日志形成稳定的视觉关系，优先考虑顶部对齐到日志区域顶部，或与战斗技能面板一起组成清晰的中部信息列。
- `BattleSkillPanel` 和 `LootPanel` 之间应有稳定间距，不因内容少而在中间列留下大块不可解释空白。
- `LootPanel` 不应改变金币、经验和装备品质统计含义。
- 调整应在 `main-scene__battle-bottom` 与局部面板尺寸内完成，不重写全局 stage 缩放。

### Forbidden Behavior

- 不要改战斗日志滚动策略或日志文本。
- 不要改掉落统计字段、奖励公式或地图数据。
- 不要为了对齐把 `main-scene` 改回自由流响应式布局。
- 不要把装备窗口或右侧 tab 修复混进本卡。

### Red Guard Contract

新增 `assert:loot-panel-log-alignment`：

- 静态断言 `LootPanel` 暴露 `data-bwe-loot-panel`，`AllInfoPanel` 或日志根节点暴露稳定 DOM hook。
- 浏览器 smoke 在 1280x720、1920x1080、3840x2160 采集 `.main-scene__log`、`.battle-log-panel`、`[data-bwe-loot-panel]` 和 `.main-scene__battle-bottom` 的 rect。
- 断言 loot panel 与 log region 顶部差距在设计阈值内，或断言有明确的 battle-bottom grid 布局使统计面板紧随技能面板并占用可用空间。
- 保留 `assert:responsive-layout` 的 stage 对齐结果。

### Acceptance Tests

- Dedicated: `npm run assert:loot-panel-log-alignment`
- Nearby: `npm run assert:responsive-layout`
- Nearby: `npm run assert:battle-log-sticky-scroll`
- Nearby: `npm run assert:monster-reward`
- Always: `npx tsc -b`

### Manual Smoke

运行主场景并等待若干战斗日志产生。确认左侧日志和当前地图统计在底部区域关系清晰，统计面板没有孤立地下沉，日志滚动仍然正常。分别在 1280x720、1920x1080、3840x2160 检查。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p1-loot-panel-log-alignment.md 这一张卡。
要求：
1. 先运行 git status --short，不要回滚无关改动。
2. 读取 docs/ai/00-working-rules.md、docs/parity/manifest.md 和本卡。
3. 对照 React：src/components/scenes/MainScene.tsx、src/components/panels/LootPanel.tsx、src/components/panels/AllInfoPanel.tsx、src/styles/main-scene.css、scripts/assertResponsiveMainLayoutParity.mjs。
4. 先新增 focused red guard：assert:loot-panel-log-alignment，使用 DOM rect 证明当前 LootPanel 与战斗日志区域没有稳定对齐关系。
5. 做最小修复：调整 battle-bottom/LootPanel 局部布局，让当前地图统计与左侧战斗日志形成稳定对齐或明确的信息列关系。
6. 不要改金币/经验/装备统计数据，不要改战斗奖励公式，不要改日志滚动策略，不要改装备窗口或右侧 tab。
7. 修复后运行：npm run assert:loot-panel-log-alignment、npm run assert:responsive-layout、npm run assert:battle-log-sticky-scroll、npm run assert:monster-reward、npx tsc -b。
8. 做 browser smoke：1280x720、1920x1080、3840x2160 下报告 loot panel 与 battle log 的 rect 和顶部差距。
```

## English

### Required Fix

Align the current-map loot statistics panel with the battle log region, or give the battle-bottom column a clear local layout that prevents the loot panel from sinking into unused space.

### Acceptance Tests

- `npm run assert:loot-panel-log-alignment`
- `npm run assert:responsive-layout`
- `npm run assert:battle-log-sticky-scroll`
- `npm run assert:monster-reward`
- `npx tsc -b`
