# P2 EquipWindow People Skeleton Sprite Parity

Last updated: 2026-06-20

Current status: Verified

## Chinese

### 当前状态

本卡来自 2026-06-19 UI 审阅。React `EquipWindow` 已经为装备格子使用真实装备 sprite，但人物骨架区域目前是 CSS 椭圆占位，不是 AS3 原版 `people_use1` / `people_use2` 两层火柴人骨架。项目的 `spriteRegistry` 已注册这两个资源，但打包资产 guard 当前仍把它们当成未使用重型 sprite。

本卡只处理装备窗口人物骨架和 slot 坐标视觉 parity，不处理装备所有权、装备数值、背包锻造、宠物统计或 OtherPanel 外层对齐。

### 玩家可见症状

- 装备 tab 打开后，中间人物轮廓像现代 CSS 占位框，不像 AS3 原版火柴人骨架。
- 装备 slot 虽有装备图标，但围绕占位椭圆摆放，整体视觉和 AS3 原版装备窗口不一致。
- 如果直接启用 `people_use1/people_use2`，当前 packaged asset guard 会因为这两个 key 仍在 unused heavy list 中而失败。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - `SC = 0.4`、`SY = 100`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - 创建 `new people_use1()` 和 `new people_use2()`，两层都设置 `scaleX/scaleY = SC`、`y = SY`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - 装备 slot 坐标：`head.x = 210`、`feet.x = 210`、`body.x = 390`、`necklace.x = 380`、`ring.x = 10`、`leftHand.x = 5`、`rightHand.x = 415`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - 宠物区域 `pet.x = 60`，装备窗口里还承载当前宠物/技能展示。

### React Targets

- `src/components/windows/EquipWindow.tsx` - 当前 `SLOT_POSITIONS` 是 React 重新设计坐标，人物区域是 CSS 椭圆占位。
- `src/components/shared/SpriteImage.tsx` - 用于加载 spriteRegistry 中的 AS3 sprite。
- `src/core/utils/spriteRegistry.ts` - 已注册 `people_use1` 和 `people_use2`。
- `scripts/assertEquipWindowParity.mjs` - 现有装备窗口 guard，可扩展为要求真实人物骨架 sprite。
- `scripts/assertEquipWindowBoundsParity.mjs` - 可辅助保护窗口滚动/边界。
- `scripts/assertPackagedPublicAssets.mjs` - 当前把 `people_use1`、`people_use2` 列为 unused heavy sprite key。

### Expected Behavior

- `EquipWindow` 使用 `SpriteImage name="people_use1"` 和 `SpriteImage name="people_use2"` 分层呈现 AS3 人物骨架。
- 装备 slot 坐标应以 AS3 坐标为来源，经明确缩放/容器映射后定位，不再靠 CSS 椭圆作为视觉主体。
- 如果骨架 sprite 成为运行时可见资源，打包资产计划和 guard 必须同步更新，不再把 `people_use1/people_use2` 视为 unused。
- 装备格子现有 `SpriteImage` 装备图标、hover tooltip、双击卸下和选中详情继续工作。

### Forbidden Behavior

- 不要用新的 SVG、CSS 人形或文字占位替代 AS3 `people_use1/people_use2`。
- 不要顺手重构装备所有权、背包容量、卸下逻辑或装备属性公式。
- 不要只改 UI 代码而忘记更新 packaged asset guard，导致打包产物缺少骨架资源。
- 不要把宠物窗口、技能窗口或 OtherPanel 外层布局混入本卡。

### Red Guard Contract

扩展 `assert:equip-window`，必要时新增浏览器 smoke：

- 静态断言 `EquipWindow.tsx` 引用 `SpriteImage` 的 `people_use1` 和 `people_use2`。
- 静态断言不再依赖旧 CSS 椭圆作为人物主体，或至少给旧占位增加明确禁用/替换 guard。
- 断言 slot 坐标来自 AS3 映射常量，并覆盖七个装备位。
- 扩展 `assert:packaged-assets`：当 `people_use1/people_use2` 被运行时代码使用时，它们必须进入 packaged plan，且从 unused heavy key denylist 中移除。

### Acceptance Tests

- Dedicated: `npm run assert:equip-window`
- Nearby: `npm run assert:equip-window-bounds`
- Asset packaging: `npm run assert:packaged-assets`
- Nearby: `npm run assert:window-sprite-icons`
- Nearby: `npm run assert:common-cell`
- Always: `npx tsc -b`

Passed 2026-06-20: dedicated equip-window guard, packaged asset guard, nearby sprite/common-cell guards, TypeScript build, and browser smoke confirming layered skeleton sprites, AS3-mapped slot positions, hover tooltip, and double-click unequip.

### Manual Smoke

打开装备 tab，确认人物骨架为 AS3 风格的双层 `people_use1/people_use2` 火柴人资源；依次 hover 七个装备位，确认装备图标、tooltip、选中详情和双击卸下仍正常；打包资产 smoke 确认 `public-packaged/sprites` 中包含运行时需要的骨架 sprite。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p2-equip-window-people-skeleton.md 这一张 parity 卡。

要求：
1. 先读 docs/ai/00-working-rules.md、docs/parity/manifest.md 和本卡。
2. 对照 AS3：reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as，重点确认 people_use1/people_use2、SC=0.4、SY=100、七个装备 slot 坐标。
3. 对照 React：src/components/windows/EquipWindow.tsx、src/components/shared/SpriteImage.tsx、src/core/utils/spriteRegistry.ts、scripts/assertEquipWindowParity.mjs、scripts/assertPackagedPublicAssets.mjs。
4. 先扩展 red guard：assert:equip-window 必须要求 people_use1/people_use2 真实 SpriteImage；assert:packaged-assets 必须允许并要求运行时使用的骨架 sprite 被打包。
5. 做最小修复：用 AS3 已注册 sprite 替换 CSS 椭圆人物占位，并按 AS3 坐标映射装备 slot；保留装备图标 hover、选中、双击卸下和详情面板。
6. 不要改装备数值、装备所有权、背包锻造、宠物业务或 OtherPanel 外层宽度。
7. 修复后运行：npm run assert:equip-window、npm run assert:equip-window-bounds、npm run assert:packaged-assets、npm run assert:window-sprite-icons、npm run assert:common-cell、npx tsc -b。
8. 做 browser smoke：装备 tab 中确认双层人物骨架显示、七个 slot 位置合理、hover tooltip 和卸下行为正常。
```

## English

### Current Status

React uses real equipment sprites, but the body silhouette in `EquipWindow` is still a CSS oval placeholder. AS3 uses layered `people_use1` and `people_use2` sprites, both already registered in `spriteRegistry`. The packaged asset guard currently still treats those keys as unused heavy sprites.

### Required Fix

Extend the equip-window and packaged-asset guards first. Then render the layered AS3 people skeleton sprites and map equipment slots from the AS3 coordinate source while preserving existing equip hover/select/unequip behavior.

### Acceptance Tests

- `npm run assert:equip-window`
- `npm run assert:equip-window-bounds`
- `npm run assert:packaged-assets`
- `npm run assert:window-sprite-icons`
- `npm run assert:common-cell`
- `npx tsc -b`

Passed 2026-06-20 with browser smoke for skeleton sprites, slot placement, hover tooltip, and unequip behavior.
