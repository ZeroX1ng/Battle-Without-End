# P2 PetInfoPanel Type Label Consistency

Last updated: 2026-06-07

Current status: Verified on 2026-06-07

## Chinese

### 当前状态

2026-06-07 宠物模块审阅新增。本卡只处理主界面 `PetInfoPanel` 的宠物类型显示一致性，不改宠物属性公式、宠物窗口选择、出战/取消出战行为或战斗宠物快照边界。

React 当前在主界面 `PetInfoPanel.tsx` 额外显示原始 `p.type`，例如 `attack`、`defence`。同一项目内的宠物详情窗口 `PetWindow.tsx` 和宠物说明 `Pet.getDescription()` 使用 `getTypeLabel()`，显示中文类型标签。AS3 主界面 `PetInfoPanel.as` 原本只显示宠物名、等级、Exp 和 HP；AS3 悬浮详情 `PetInfoWindow.as` 才显示中文类型标签。React 既然保留了主界面类型辅助行，就不应暴露原始英文枚举。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/PetInfoPanel.as` - 主界面宠物面板只显示宠物名、Lv、Exp、HP。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iPet/PetInfoWindow.as` - 宠物悬浮详情通过 `getType()` 把 `attack` / `defence` / `balance` / `magic` 映射为中文标签。
- `reference/as3/BOE-O/scripts/iData/iPet/Pet.as` - 宠物 `type` 保存原始类型 key。

### React Targets

- `src/components/panels/PetInfoPanel.tsx` - 当前直接渲染 `{p.type}`。
- `src/components/windows/PetWindow.tsx` - 详情面板已使用 `pet.getTypeLabel ? pet.getTypeLabel() : pet.type`。
- `src/core/models/Pet.ts` - `getTypeLabel()` 是当前 React 的本地化类型标签来源。
- `scripts/assertPetWindowParity.mjs` - 现有 guard 覆盖主面板 Lv/HP/Exp 和详情窗口字段，但没有拒绝主面板原始 `p.type`。

### Reviewed Evidence

- React `PetInfoPanel.tsx` 在宠物名下方直接输出 `{p.type}`。
- React `PetWindow.tsx` 详情面板已经使用 `getTypeLabel()` 兜底到 `pet.type`。
- React `Pet.getDescription()` 使用 `getTypeLabel()` 输出本地化类型。
- AS3 `PetInfoPanel.as` 主面板没有类型行，`PetInfoWindow.as` 悬浮详情会显示本地化类型。
- `npm run assert:pet-window` 当前通过，说明现有 guard 没有覆盖该显示不一致。

### Expected Behavior

- 主界面如果继续显示宠物类型辅助行，必须使用 `p.getTypeLabel ? p.getTypeLabel() : p.type`。
- 主界面不应裸露 `attack`、`defence`、`balance`、`magic` 这些原始类型 key。
- 宠物窗口详情和宠物说明继续使用同一个 `getTypeLabel()` 来源。

### Forbidden Behavior

- 不要修改 `Pet.type` 的保存格式；存档和静态数据仍使用 AS3 原始类型 key。
- 不要修改 `PetDataList`、`PetTypeList` 或宠物属性公式。
- 不要改动 `petWindowSelection.ts` 的稳定选择 key。
- 不要把本卡扩展成宠物窗口布局重做。

### Red Guard Contract

先扩展 `assert:pet-window`，让它在生产代码修复前失败：

- 静态断言 `PetInfoPanel.tsx` 不再直接渲染 `{p.type}`。
- 静态断言 `PetInfoPanel.tsx` 使用 `getTypeLabel` 或删除主面板类型辅助行。
- 保留现有 Lv、HP、Exp、PetWindow 详情和宠物技能悬浮说明断言。

### Acceptance Tests

- [x] Dedicated guard: `npm run assert:pet-window`。
- [x] Adjacent guard: `npm run assert:pet-window-selection`。
- [x] Data guard: `npm run assert:pet-data`。
- [x] Always: `npx tsc -b`。
- [x] Browser smoke: 主界面出战宠物面板不显示原始英文类型 key；宠物窗口详情仍显示中文类型标签。

## English

### Current Status

Added by the 2026-06-07 pet-module review. This card only covers the visible type label in the main `PetInfoPanel`; it must not change pet stat formulas, pet-window selection, equip/cancel behavior, or battle pet snapshot boundaries.

React currently renders raw `p.type` in `PetInfoPanel.tsx`, while `PetWindow.tsx` and `Pet.getDescription()` use `getTypeLabel()`. AS3 keeps the main pet panel minimal and shows the localized pet type in the hover/detail window. If React keeps the helper type line in the main panel, it should use the same localized label source.

### Required Fix

Extend `assert:pet-window` first so it rejects the raw `{p.type}` render. Then update `PetInfoPanel.tsx` to render `p.getTypeLabel ? p.getTypeLabel() : p.type`, or remove the extra type line if the repair chooses strict AS3 main-panel parity.

### Acceptance Tests

- [x] `npm run assert:pet-window`
- [x] `npm run assert:pet-window-selection`
- [x] `npm run assert:pet-data`
- [x] `npx tsc -b`
- [x] Browser smoke for the main pet info panel and pet detail window.
