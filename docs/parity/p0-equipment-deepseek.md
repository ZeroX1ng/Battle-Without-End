# P0 Equipment Fix — 2026-05-19 Deepseek 审阅修复清单

## 中文

### 审阅来源

- 审阅报告：`P0-EQUIP` 模块 AS3 ↔ React 逐行对比
- AS3 源：`../BOE-O/scripts/iData/iItem/Equipment.as`、`../BOE-O/scripts/iData/iItem/Weapon.as`、`../BOE-O/scripts/iGlobal/Player.as`、`../BOE-O/scripts/iData/iItem/EquipmentList.as`、`../BOE-O/scripts/iData/iItem/StatList.as`、`../BOE-O/scripts/iData/iItem/EquipType.as`、`../BOE-O/scripts/iData/iItem/WeaponType.as`
- React 目标：`src/core/models/Equipment.ts`、`src/core/models/Weapon.ts`、`src/core/models/Player.ts`、`src/core/data/equipmentData.ts`、`src/core/constants.ts`、`src/components/windows/EquipWindow.tsx`
- Parity 卡片：`p0-equipment-ownership.md`

---

### EQ-C1 🔴 致命：Equipment.load() 缺少 Weapon 类型检测，存档加载后武器丢失 category

**严重程度**：致命

**根因**：[Equipment.ts:L57-L93](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Equipment.ts#L57-L93) — `Equipment.load()` 静态方法始终 `new Equipment(...)`，不区分 Weapon 和普通 Equipment。

**AS3 对照**：[Equipment.as:L82-L133](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L82-L133) — 检查 `EquipmentList.list[_loc4_] is WeaponData`，如果是武器则构造 `new Weapon(...)` 以保留 `category` 属性。

```as3
// AS3 Equipment.load()
if(EquipmentList.list[_loc4_] is WeaponData)
{
   _loc3_ = new Weapon(EquipmentList.list[_loc4_] as WeaponData, _loc2_[2]);
}
else
{
   _loc3_ = new Equipment(EquipmentList.list[_loc4_], _loc2_[2]);
}
```

**影响范围**：

- 存档加载后所有武器 `category` 为 `undefined`
- `getAttMin/getAttMax` 中 `leftHand.category` 判断回退到默认 `WeaponCategory.MELEE`
- 远程武器（BOW/CROSSBOW）的 dex 加成丢失：`getAttMin` 和 `getAttMax` 各少加 `getDex()/3` 和 `getDex()/2.5`
- 技能过滤中的武器类别匹配可能失效

**修复方案**：在 `Equipment.load()` 中检测 `EquipmentData` 是否包含 `category` 属性（即 WeaponData），如包含则构造 `Weapon` 实例：

```typescript
// Equipment.ts static load()
static load(data: string): Equipment {
  // ... 查找匹配的 EquipmentData ...
  if (EquipmentList[_loc4_].name === _loc2_[0]) {
    if ('category' in EquipmentList[_loc4_]) {
      _loc3_ = new Weapon(EquipmentList[_loc4_] as WeaponData, Number(_loc2_[2]));
    } else {
      _loc3_ = new Equipment(EquipmentList[_loc4_], Number(_loc2_[2]));
    }
    break;
  }
  // ...
}
```

**验证**：存档后重新加载，远程武器 `leftHand.category` 为 `'ranged'`，`getAttMin/getAttMax` 正确加 dex 加成。

---

### EQ-C2 🔴 致命：generateQualityStat() 中 this.category 检测时机错误，武器品质属性池不完整

**严重程度**：致命

**根因**：[Equipment.ts:L169-L176](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Equipment.ts#L169-L176) — 用 `if (this.category)` 判断是否为武器，但 Weapon 构造器链执行顺序为：

```
new Weapon(data, ratio)
  → super(data, ratio)       // Equipment 构造器
    → generateQuality()      // → generateQualityStat()
      → if (this.category)   // ← 此时 this.category 为 undefined!
  → this.category = data.category  // ← Weapon 构造器最后一行
```

**AS3 对照**：[Equipment.as:L196-L207](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L196-L207) — 使用 `this is Weapon` 运行时类型检测，不受构造顺序影响。

```as3
// AS3 generateQualityStat()
if(this is Weapon)
{
   _loc3_ = StatList.list.length * Math.random();
}
```

**React 当前代码**：
```typescript
// React generateQualityStat()
if (this.category) {       // ← 始终为 falsy，永远不会进入
  _loc3_ = StatList.length * Math.random();
}
```

**影响范围**：

- 武器品质属性生成时，if 分支永远不进，按 `_loc3_ = (StatList.length - 1) * Math.random()`（即 0~15 的随机索引）
- AS3 武器使用 `_loc3_ = StatList.list.length * Math.random()`（即 0~16 的随机索引，多一项 balance）
- 结果：武器无法随出 **平衡值（balance）** 品质属性
- `StatList` 共 17 项，武器应该能随机到全部 17 项

**修复方案**：在 Equipment 基类中添加 `protected` 虚方法或在构造完成后由 Weapon 重新触发。最简单的修复——在 Weapon 构造器中设置 category 后手动重算 qualityStat：

```typescript
// Weapon.ts constructor
constructor(data: WeaponData, ratio: number, isBoss: boolean = false, combatPower: number = 0) {
  super(data, ratio, isBoss, combatPower);
  this.category = data.category;
  // 重新生成 qualityStat，因为 super() 中 this.category 尚未赋值
  // 需要将 generateQuality 中已生成的 qualityStat 清空后重新生成
}
```

或者更好的方案：将 `generateQualityStat()` 中的武器检测改为不依赖实例字段，改用参数或类名检测：

```typescript
// Equipment.ts generateQualityStat() 中
private generateQualityStat(ratio: number): void {
  // ...
  while (_loc2_ < this.quality) {
    const isWeapon = this instanceof Weapon || !!this.category;
    _loc3_ = (StatList.length - 1) * Math.random();
    if (this.type === EquipType.ACCESORY) {
      _loc3_ = (StatList.length - 2) * Math.random();
    }
    if (isWeapon) {
      _loc3_ = StatList.length * Math.random();
    }
    // ...
  }
}
```

**验证**：生成 100 把武器，检查 qualityStat 中是否出现 `balance` 条目。与 AS3 生成的武器对比，品质属性条目类型一致。

---

### EQ-I1 🟡 重要：QualityColor 常量颜色值偏移 1 位

**严重程度**：重要

**根因**：[constants.ts:L187-L194](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/constants.ts#L187-L194) — `QualityColor` 表的颜色索引偏移。

| quality | AS3 颜色 | AS3 名称 | React QualityColor | 偏差 |
|---------|---------|---------|-------------------|------|
| 0 | `GRAY_H` = `#747474` | 普通 | `#c8c8d4` | ❌ 颜色不同 |
| 1 | `#4BB814` | 绿色 | `#4a60d7` (蓝) | ❌ 偏 1 位 |
| 2 | `#4a60d7` | 蓝色 | `#a6a500` (黄) | ❌ 偏 1 位 |
| 3 | `#a6a500` | 黄色 | `#ff7100` (橙) | ❌ 偏 1 位 |
| 4 | `#ff7100` | 橙色 | `#9840be` (紫) | ❌ 偏 1 位 |
| 5 | `#9840be` | 紫色 | `#ff4040` (红) | ❌ 偏 1 位 |

**影响范围**：
- `Equipment.getNameHTML()` 内部使用硬编码颜色（正常）
- `EquipWindow.tsx` 等 UI 组件使用 `QualityColor` 表（颜色错误）
- 同一个装备在 HTML 描述中显示绿色，在装备槽圆圈中显示蓝色 —— 用户可见的颜色不一致

**修复方案**：将 `QualityColor` 对齐 AS3 颜色映射，并补充 `quality=0` 的灰色：

```typescript
export const QualityColor: Record<number, string> = {
  0: '#747474',    // GRAY_H
  1: '#4BB814',    // GREEN
  2: '#4a60d7',    // BLUE
  3: '#a6a500',    // YELLOW
  4: '#ff7100',    // ORANGE
  5: '#9840be',    // PURPLE
};
```

**验证**：品质 1 的装备在装备窗口中显示为绿色，与 getNameHTML() 一致。

---

### EQ-I2 🟡 重要：缺少 getColor() / getColorInHex() / getSellDesciption() 方法

**严重程度**：重要

**AS3 源**：
- [Equipment.as:L488-L536](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L488-L536) — `getColor()` 和 `getColorInHex()`
- [Equipment.as:L407-L454](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L407-L454) — `getSellDesciption()`

**描述**：React `Equipment.ts` 缺少以下方法：

1. **`getColor(): string`** — 返回品质对应的 hex 颜色字符串（`#4BB814` 等）
2. **`getColorInHex(): int`** — 返回品质对应的整数 hex 颜色值（`GREEN_H = 4962324` 等）
3. **`getSellDesciption(): string`** — 返回售出窗口用的 HTML 描述，与 `getDescription()` 类似但显示 "FOR SALE" 标签和使用 `getSellMoney()` 定价

**影响范围**：商店出售功能如果需要显示装备弹窗描述会受影响。`getSellDesciption()` 缺少 `+N(MAX)` 后缀显示。

**修复方案**：在 Equipment.ts 中添加这三个方法。

**验证**：调用 `equip.getColor()` 返回对应品质颜色；`equip.getSellDesciption()` 包含 "FOR SALE" 文本和 `getSellMoney()` 价格。

---

### EQ-I3 🟡 重要：缺少 hex 整数值颜色常量

**严重程度**：重要

**AS3 源**：[Equipment.as:L30-L40](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L30-L40)

**描述**：AS3 定义了六个整数值颜色常量用于 `getColorInHex()`：

```as3
public static const GREEN_H:int = 4962324;     // #4BB814
public static const BLUE_H:int = 4874455;      // #4a60d7
public static const YELLOW_H:int = 10921216;   // #a6a500
public static const ORANGE_H:int = 16740608;   // #ff7100
public static const GRAY_H:int = 7631988;      // #747474
public static const PURPLE_H:int = 9978046;    // #9840be
```

React 版本在 Equipment.ts 中只定义了字符串颜色常量（GREEN/BLUE/YELLOW/ORANGE/PURPLE），缺少对应的整数值版本。

**修复方案**：在 Equipment.ts 中添加 `ColorHex` 整数值常量（或随 EQ-I2 的 `getColorInHex()` 直接用 `parseInt` 转换，但保留常量更符合 AS3 设计）。

**验证**：常量值通过 `Number(color).toString(16)` 验证与对应字符串颜色的 hex 值一致。

---

### EQ-G1 🟢 一般：EquipWindow 混合了宠物面板功能

**严重程度**：一般

**位置**：[EquipWindow.tsx:L196-L242](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/components/windows/EquipWindow.tsx#L196-L242)

**描述**：React 的 EquipWindow 在装备槽位下方嵌入了宠物统计面板（PET_STATS）和宠物技能按钮。这属于 PetInfoPanel 的职责，在 AS3 中是独立面板。虽然不直接影响行为正确性，但违反了单一职责原则，且如果将来需要独立控制宠物面板显示/隐藏会更困难。

**修复方案**：将宠物统计部分抽取为独立组件或移至 PetInfoPanel，EquipWindow 保持纯装备展示。

---

### EQ-G2 🟢 一般：equipItem() 装备前预检查背包容量（非 regression）

**严重程度**：一般

**位置**：[Player.ts:L303-L316](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Player.ts#L303-L316) vs [Player.as:L389-L425](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iGlobal/Player.as#L389-L425)

**描述**：React 在装备前预检查 `base.itemList.length + displaced.length > base.BAGMAX`，放不下则拒绝装备。AS3 不检查，逐一 unequip 旧槽位，背包满时旧装备可能丢失。

React 的实现实际上是修复了 AS3 自身的 bug，从行为正确性角度是改进。但如果追求严格的 AS3 行为一致，需要考虑是否保留。

**建议**：保持当前实现（更安全），仅在 parity 文档中标注此为有意的改进。

---

### EQ-G3 🟢 一般：unequipItem() 背包满时拒绝卸下（非 regression）

**严重程度**：一般

**位置**：[Player.ts:L364-L371](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Player.ts#L364-L371) vs [Player.as:L427-L437](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iGlobal/Player.as#L427-L437)

**描述**：AS3 的 `unequip()` 无论 `addItem()` 返回值如何都清空槽位（可能导致背包满时装备消失）。React 在 `addItem` 失败时正确返回原 state，拒绝卸载。

当前实现是 AS3 bug 的修复。EquipWindow.tsx 中也有对应的 UI 提示"背包已满，无法卸下"。

**建议**：保持当前实现。

---

### EQ-G4 🟢 一般：AS3 unequip() 额外调用 updateSkillInfo() 和 updateBattleSkillWindow()

**严重程度**：一般（信息性）

**AS3 源**：[Player.as:L433-L436](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iGlobal/Player.as#L433-L436)

**描述**：AS3 的 `unequip()` 调用链为 `unequip(槽位) → addItem → Player[槽位]=null → updateEquipInfo() → updateSkillInfo() → updateBattleSkillWindow()`。

React 的 `unequipItem()` 调用 `updateAllInfo()`（内部含 `updateEquipInfo()` + `updateSkillInfo()`），但没有显式的 UI 面板刷新调用（如 `updateBattleSkillWindow()`）。这在 React 响应式架构下由状态变更自动触发 UI 重渲染，无需手动操作。**不构成实际缺陷**。

---

### 验证：无缺陷确认

以下模块经逐行对比确认与 AS3 完全一致：

| 模块 | 文件 | 状态 |
|------|------|------|
| 装备数据表 | [equipmentData.ts](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/data/equipmentData.ts) vs EquipmentList.as | ✅ 20 个模板完全一致 |
| 属性条目池 | equipmentData.ts (StatList) vs StatList.as | ✅ 17 个条目完全一致 |
| 升级加成向量 | [constants.ts:L100-L154](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/constants.ts#L100-L154) vs EquipType.as/WeaponType.as | ✅ EquipTypeBase / WeaponTypeBase 完全一致 |
| 装备操作语义 | Player.ts equipItem/unequipItem vs Player.as equip/unequip | ✅ 槽位管理（ONEHAND/OFFHAND/TWOHAND）100% 匹配 |

---

### 修复顺序建议

1. **EQ-C2**（品质属性池不完整）— 最紧急，影响所有新生成武器的属性随机
2. **EQ-C1**（存档加载丢失 category）— 影响存档读档后武器类别判断
3. **EQ-I1**（QualityColor 颜色偏移）— 用户可见的 UI 不一致
4. **EQ-I2 + EQ-I3**（缺失方法/常量）— 功能补全
5. **EQ-G1**（宠物面板混入）— 代码整洁性改进

---

### 验收方式

| 任务 | 现有 assert | 需要新增 |
|------|------------|---------|
| EQ-C2 | `assert:stat-list` | `assert:weapon-quality-stat`：生成 100 把武器，检查 qualityStat 是否包含 balance |
| EQ-C1 | `assert:equip-window` | `assert:weapon-load-category`：save/load 后武器 category 不丢失 |
| EQ-I1 | — | `assert:quality-color`：验证 QualityColor 表与 getNameHTML() 颜色一致 |
| EQ-I2 | — | 无需单独 assert，代码补齐后编译即通过 |

---

### Manual Smoke Scenario

1. 新开游戏，随机生成一把武器（弓/弩），确认品质属性中有平衡值（balance）
2. 装备弓/弩后检查面板攻击力，确认远程武器加成生效
3. 存档 → 读档，确认武器类型（近战/远程）不变
4. 打开 EquipWindow，确认品质 1 的装备显示为绿色，与 hover 弹出的描述颜色一致
5. 背包满时尝试卸下装备，确认有"背包已满"提示且装备不丢失

---

## English

### Review Source

- Review: `P0-EQUIP` module AS3 ↔ React comparison
- AS3 Source: `../BOE-O/scripts/iData/iItem/Equipment.as`, `../BOE-O/scripts/iData/iItem/Weapon.as`, `../BOE-O/scripts/iGlobal/Player.as`, `../BOE-O/scripts/iData/iItem/EquipmentList.as`, `../BOE-O/scripts/iData/iItem/StatList.as`, `../BOE-O/scripts/iData/iItem/EquipType.as`, `../BOE-O/scripts/iData/iItem/WeaponType.as`
- React Targets: `src/core/models/Equipment.ts`, `src/core/models/Weapon.ts`, `src/core/models/Player.ts`, `src/core/data/equipmentData.ts`, `src/core/constants.ts`, `src/components/windows/EquipWindow.tsx`
- Parity Card: `p0-equipment-ownership.md`

---

### EQ-C1 🔴 CRITICAL: Equipment.load() does not detect Weapon type, weapons lose category after save/load

**Root Cause**: [Equipment.ts:L57-L93](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Equipment.ts#L57-L93) — `Equipment.load()` always creates `new Equipment(...)`, never `new Weapon(...)`.

**AS3**: [Equipment.as:L82-L133](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L82-L133) — Checks `EquipmentList.list[_loc4_] is WeaponData` and creates `new Weapon(...)` when true.

**Impact**: After save/load, all weapons have `category = undefined`. Ranged weapons lose `dex/3` and `dex/2.5` attack bonuses.

**Fix**: Check for `'category' in EquipmentData` in `load()`, construct `Weapon` when present.

---

### EQ-C2 🔴 CRITICAL: generateQualityStat() uses this.category before Weapon constructor assigns it

**Root Cause**: [Equipment.ts:L169-L176](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Equipment.ts#L169-L176) — `if (this.category)` check runs during `super()` but `this.category` is only assigned after `super()` returns in Weapon's constructor.

**AS3**: [Equipment.as:L196-L207](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L196-L207) — Uses `this is Weapon` runtime type check, unaffected by construction order.

**Impact**: Weapon quality stats never roll `balance` (lost 1 out of 17 possible random attributes).

**Fix**: Use `this instanceof Weapon` or pass an `isWeapon` flag parameter.

---

### EQ-I1 🟡 IMPORTANT: QualityColor table offset by 1 index

**Root Cause**: [constants.ts:L187-L194](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/constants.ts#L187-L194)

| quality | AS3 Color | React QualityColor |
|---------|-----------|-------------------|
| 0 | #747474 | #c8c8d4 ❌ |
| 1 | #4BB814 (Green) | #4a60d7 (Blue) ❌ |
| 2 | #4a60d7 (Blue) | #a6a500 (Yellow) ❌ |
| 3 | #a6a500 (Yellow) | #ff7100 (Orange) ❌ |
| 4 | #ff7100 (Orange) | #9840be (Purple) ❌ |
| 5 | #9840be (Purple) | #ff4040 (Red) ❌ |

**Impact**: UI slot colors don't match HTML description colors (getNameHTML uses correct inline colors).

**Fix**: Realign QualityColor to AS3 mapping.

---

### EQ-I2 🟡 IMPORTANT: Missing getColor() / getColorInHex() / getSellDesciption() methods

**AS3**: [Equipment.as:L488-L536](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L488-L536), [Equipment.as:L407-L454](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L407-L454)

**Fix**: Implement the three missing methods in Equipment.ts.

---

### EQ-I3 🟡 IMPORTANT: Missing hex integer color constants

**AS3**: [Equipment.as:L30-L40](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/iItem/Equipment.as#L30-L40) — `GREEN_H`, `BLUE_H`, `YELLOW_H`, `ORANGE_H`, `GRAY_H`, `PURPLE_H`

**Fix**: Add integer hex color constants.

---

### EQ-G1 🟢 MINOR: EquipWindow embeds pet panel

[EquipWindow.tsx:L196-L242](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/components/windows/EquipWindow.tsx#L196-L242) — Pet stats/skills belong to PetInfoPanel in AS3. No behavioral impact.

---

### EQ-G2-G4 🟢 MINOR: Bag-full edge case differences (intentional improvements over AS3 bugs)

- G2: `equipItem()` pre-checks bag capacity (AS3 doesn't, items could be lost)
- G3: `unequipItem()` rejects when bag full (AS3 allows but loses item)
- G4: `updateBattleSkillWindow()` handled by React reactivity

---

### Verified: No Issues Found

| Module | Files | Status |
|--------|-------|--------|
| Equipment data table | [equipmentData.ts](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/data/equipmentData.ts) vs EquipmentList.as | ✅ 20 templates identical |
| Stat entry pool | equipmentData.ts (StatList) vs StatList.as | ✅ All 17 entries match |
| Upgrade base vectors | [constants.ts:L100-L154](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/constants.ts#L100-L154) vs EquipType.as/WeaponType.as | ✅ All identical |
| Equip/unequip semantics | Player.ts vs Player.as | ✅ ONEHAND/OFFHAND/TWOHAND 100% match |

---

### Fix Order

1. **EQ-C2** (quality stat pool incomplete) — most urgent
2. **EQ-C1** (save/load loses category)
3. **EQ-I1** (QualityColor offset)
4. **EQ-I2 + EQ-I3** (missing methods/constants)
5. **EQ-G1** (pet panel mixing)

---

### Acceptance Tests

| Task | Existing assert | New assert needed |
|------|----------------|-------------------|
| EQ-C2 | `assert:stat-list` | `assert:weapon-quality-stat` |
| EQ-C1 | `assert:equip-window` | `assert:weapon-load-category` |
| EQ-I1 | — | `assert:quality-color` |
| EQ-I2 | — | Compile-only check |
