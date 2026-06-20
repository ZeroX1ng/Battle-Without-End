# P1 EquipWindow Space Utilization

Last updated: 2026-06-20

Current status: Needs repair after detail-placement fix

## Chinese

### 当前状态

本卡来自 2026-06-20 实时浏览器标注 Comment 2。装备 tab 内人物骨架、装备图标和「尚未装备宠物」区域显得拥挤，部分图标视觉上接近重叠，同时装备窗口下方还有大量可利用空间。

本卡依赖 `p1-equip-window-detail-under-figure.md`。先把右侧详情栏移到装备栏下方，再判断人物骨架、slot 和宠物区域是否仍然需要二次收敛。这样可以避免在错误宽度约束下反复调 slot。

### 玩家可见症状

- 装备人物骨架区域内 slot 图标密度高，左手/戒指/项链等图标容易视觉堆在一起。
- 未装备宠物时，宠物信息块只显示一行空状态，却占据了横向布局中的一块区域。
- 装备窗口底部仍有空白，但当前布局没有把这些空间用于详情、宠物信息或 slot 呼吸感。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - slot 坐标来自 `head/feet/body/necklace/ring/leftHand/rightHand` 的显式坐标。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - 宠物图标 `pet.x = 60; pet.y = 620`，宠物信息由 `setPetInfo()` 放在下方区域。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as` - 未装备宠物时 `petSp.visible = false`、`petSkillSp.visible = false`。

### React Targets

- `src/components/windows/EquipWindow.tsx` - `EQUIP_FIGURE_WIDTH`、`EQUIP_FIGURE_HEIGHT`、`AS3_SLOT_POSITIONS`、`PET_STATS` 和未装备宠物空状态。
- `scripts/assertEquipWindowParity.mjs` - 保护 AS3 slot 坐标来源和真实 sprite。
- `scripts/assertEquipWindowBoundsParity.mjs` - 保护内部滚动与按钮可见性。
- 新增 guard 可放在 `scripts/assertEquipWindowSpaceUtilization.mjs`。

### Expected Behavior

- 在详情栏移动到下方后，人物骨架区域应使用稳定宽高，七个装备 slot 不发生明显遮挡或不可点击重叠。
- 未装备宠物时，宠物区域应收缩为轻量空状态，不占用与人物骨架并排的大块空间。
- 装备详情、宠物信息和宠物技能应优先使用下方空间，而不是继续挤压人物骨架。
- 若为了可读性对 AS3 坐标做缩放容器映射，必须保留 AS3 原始坐标常量和映射说明。

### Forbidden Behavior

- 不要直接改掉 AS3 slot 原始坐标来源。
- 不要用新的 CSS 人形或文字占位替代已验证的 `people_use1/people_use2`。
- 不要把未装备宠物空状态渲染成大块不可用区域。
- 不要把本卡扩展成装备数值或宠物业务逻辑修复。

### Red Guard Contract

新增 `assert:equip-window-space-utilization`：

- 静态断言 `AS3_SLOT_POSITIONS` 仍是 slot 原始坐标来源。
- 浏览器 smoke 采集七个 `[data-bwe-equip-slot]` 的 rect，断言每个 slot 有可点击面积，且中心点不会被其它 slot 覆盖。
- 断言未装备宠物时的空状态区域高度有限，并位于下方信息流，不再与人物骨架并排占据大块区域。
- 保留 `assert:equip-window`、`assert:equip-window-bounds` 和 `assert:window-sprite-icons`。

### Acceptance Tests

- Dedicated: `npm run assert:equip-window-space-utilization`
- Dependency: `npm run assert:equip-window-detail-placement`
- Nearby: `npm run assert:equip-window`
- Nearby: `npm run assert:equip-window-bounds`
- Nearby: `npm run assert:window-sprite-icons`
- Always: `npx tsc -b`

### Manual Smoke

打开装备 tab，检查七个装备 slot 的 hover、选中、双击卸下是否都能独立触发。无宠物时确认空状态只是下方轻量提示；装备宠物后确认宠物属性和宠物技能在下方可读。观察 1280x720 和 1920x1080 下是否还有图标重叠、详情挤压和底部空白浪费。

### 修复提示词

```text
工作目录：C:\Users\zero_\Desktop\bwe-r\BWE

请只修复 docs/parity/p1-equip-window-space-utilization.md 这一张卡。注意：先确认 p1-equip-window-detail-under-figure.md 已完成或在同一分支中先完成。
要求：
1. 先运行 git status --short，不要回滚无关改动。
2. 读取 docs/ai/00-working-rules.md、docs/parity/manifest.md、本卡，以及 p1-equip-window-detail-under-figure.md。
3. 对照 AS3 EquipWindow.as 的 slot 坐标、宠物图标位置和 setPetInfo/updatePetInfo 空宠物行为。
4. 对照 React：src/components/windows/EquipWindow.tsx、scripts/assertEquipWindowParity.mjs、scripts/assertEquipWindowBoundsParity.mjs。
5. 先新增 assert:equip-window-space-utilization，至少覆盖 slot rect 不重叠/不互相遮挡、空宠物状态不占用并排大块区域、下方空间可承载宠物/详情信息。
6. 做最小修复：在保留 AS3 坐标常量的基础上调整映射容器、空宠物状态和下方信息流，让图标不挤、下方空间被利用。
7. 不要改装备公式、装备所有权、宠物业务、SpriteImage 注册或 OtherPanel 外层布局。
8. 修复后运行：npm run assert:equip-window-space-utilization、npm run assert:equip-window-detail-placement、npm run assert:equip-window、npm run assert:equip-window-bounds、npm run assert:window-sprite-icons、npx tsc -b。
9. 做 browser smoke：装备 tab 无宠物/有宠物两种状态下，报告七个 slot rect、空宠物区域高度和下方信息区可读性。
```

## English

### Required Fix

After the detail-placement card lands, tighten the equipment figure, slot, empty-pet, and lower-information layout so icons remain individually clickable and lower space is used instead of leaving a cramped upper region with unused bottom space.

### Acceptance Tests

- `npm run assert:equip-window-space-utilization`
- `npm run assert:equip-window-detail-placement`
- `npm run assert:equip-window`
- `npm run assert:equip-window-bounds`
- `npm run assert:window-sprite-icons`
- `npx tsc -b`
