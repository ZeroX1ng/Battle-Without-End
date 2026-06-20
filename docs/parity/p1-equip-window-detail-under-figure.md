# P1 EquipWindow Detail Under Figure Placement

Last updated: 2026-06-20

Current status: Verified

## Chinese

### 当前状态

本卡来自 2026-06-20 实时浏览器标注 Comment 3。装备页右侧额外详情栏把「主手/斧/卸下/卸下后的属性变化」放在装备骨架右边，导致右侧功能区被横向撑大，tab 栏和内容区显得过宽。Dear Master 判断这块即使是前期追加的实用信息，也应该放在装备栏 UI 下方，而不是放到画面最右边。

本卡只处理装备页详情栏的位置与右栏宽度压力，不处理装备数值、装备所有权、背包装备、宠物技能、商店生成或全局响应式缩放。

### 玩家可见症状

- 装备页选中已装备物品时，详情和「卸下后的属性变化」在人物骨架右侧形成一整列。
- 右侧详情列让装备页横向空间紧张，人物骨架、宠物信息和 tab 内容都显得拥挤。
- 这个详情列不像 AS3 `EquipWindow` 的主结构。AS3 装备窗口以人物骨架和宠物信息为主，并没有 React 当前这种远右详情栏。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - `new BasicCell(200,540)` 定义装备窗口主内容宽高。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - `people_use1`/`people_use2` 与七个装备 slot 都在同一个人物骨架窗口里。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - `setPetInfo()` 把宠物信息放在装备窗口下方区域。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iEquip/EquipCell.as` - 装备格点击负责卸下，装备详情主要通过 hover 信息窗表达。

### React Targets

- `src/components/windows/EquipWindow.tsx` - 当前使用 `gridTemplateColumns: 'minmax(190px, 1fr) minmax(150px, 0.78fr)'` 放置右侧详情栏。
- `src/components/panels/OtherPanel.tsx` - tab/content 已由 `P1-OTHERPANEL-TAB-CONTENT-ALIGNMENT` 验证，不应被本卡重新改写。
- `src/styles/main-scene.css` - 只允许在必要时收紧右侧内容的空间契约，不要重做整体 stage 布局。
- `scripts/assertEquipWindowParity.mjs`、`scripts/assertEquipWindowBoundsParity.mjs` - 可扩展 guard，确认装备详情不再作为右侧独立列撑宽内容。

### Expected Behavior

- 装备页的选中装备详情、卸下按钮和卸下属性变化应移动到人物骨架/装备区域下方或同一垂直流中的下部区域。
- 右侧功能区不应因为装备详情栏出现横向扩张；装备 tab 与其它 tab 的内容边界保持一致。
- 装备 slot、hover tooltip、双击卸下、按钮卸下和属性变化仍然可用。
- 如果保留 React 附加的卸下属性变化说明，必须明确记录为 AS3-adjacent product aid，而不是原版 UI。

### Forbidden Behavior

- 不要把详情栏继续放在人物骨架右侧独立列。
- 不要回滚 `people_use1/people_use2` 骨架和 AS3 slot 坐标。
- 不要修改装备公式、卸下逻辑、背包容量、装备生成或装备 hover 比较窗。
- 不要把 `OtherPanel` 的 tab rail/content 对齐卡重新打开。

### Red Guard Contract

新增或扩展一个 focused guard，例如 `scripts/assertEquipWindowDetailPlacement.mjs` 并暴露 `assert:equip-window-detail-placement`：

- 静态断言 `EquipWindow.tsx` 不再使用双列布局承载 `data-bwe-equip-detail-panel`。
- 断言 `data-bwe-equip-detail-panel` 在 DOM 顺序上位于人物骨架/宠物信息之后，并位于同一个内部滚动区域。
- 浏览器 smoke 采集 `data-bwe-other-content`、`data-bwe-equip-scroll-region`、`data-bwe-equip-detail-panel` 的 rect，确认详情面板没有把右侧内容宽度撑到 tab rail 之外。
- 保留 `assert:equip-window` 和 `assert:equip-window-bounds` 的现有行为。

### Acceptance Tests

- Dedicated: `npm run assert:equip-window-detail-placement`
- Nearby: `npm run assert:equip-window`
- Nearby: `npm run assert:equip-window-bounds`
- Nearby: `npm run assert:otherpanel-tab-alignment`
- Layout: `npm run assert:responsive-layout`
- Always: `npx tsc -b`

### Manual Smoke

打开装备 tab，选中主手武器和空 slot。确认人物骨架区域不再被右侧详情列挤压，卸下按钮和属性变化出现在装备栏下方或同一垂直流下部。hover 七个装备位，确认 tooltip 仍然出现；双击或点击卸下仍然工作。分别在 1280x720、1920x1080、3840x2160 检查右侧 tab/content 边界没有被撑宽。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p1-equip-window-detail-under-figure.md 这一张卡。
要求：
1. 先运行 git status --short，确认当前工作区已有改动，不要回滚无关文件。
2. 读取 docs/ai/00-working-rules.md、docs/parity/manifest.md 和本卡。
3. 对照 AS3：reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as 与 iWindow/iEquip/EquipCell.as。
4. 对照 React：src/components/windows/EquipWindow.tsx、src/components/panels/OtherPanel.tsx、src/styles/main-scene.css、scripts/assertEquipWindowParity.mjs、scripts/assertEquipWindowBoundsParity.mjs。
5. 先新增 focused red guard：assert:equip-window-detail-placement，证明当前详情栏作为右侧独立列会撑宽装备 tab 内容。
6. 做最小修复：把选中装备详情、卸下按钮、卸下属性变化移动到人物骨架/宠物信息下方的垂直区域；保留装备 slot、SpriteImage、hover tooltip、双击卸下和按钮卸下。
7. 不要改装备数值、装备所有权、背包/商店逻辑、全局 stage 缩放或 OtherPanel tab 对齐。
8. 修复后运行：npm run assert:equip-window-detail-placement、npm run assert:equip-window、npm run assert:equip-window-bounds、npm run assert:otherpanel-tab-alignment、npm run assert:responsive-layout、npx tsc -b。
9. 做 browser smoke：装备 tab 下选中主手/空 slot，报告 detail panel、equip scroll region、other content 的 rect 和右侧边界是否稳定。
```

## English

### Required Fix

Move the selected-equipment detail, unequip button, and removal stat delta out of the far-right side column and into the lower vertical flow of the equipment window. Preserve skeleton sprites, slot positions, hover tooltips, and unequip behavior.

### Acceptance Tests

- `npm run assert:equip-window-detail-placement`
- `npm run assert:equip-window`
- `npm run assert:equip-window-bounds`
- `npm run assert:otherpanel-tab-alignment`
- `npm run assert:responsive-layout`
- `npx tsc -b`
