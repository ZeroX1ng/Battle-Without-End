# BWE Playtest Follow-up Parity Queue - 2026-06-04

Last updated: 2026-06-04

## 中文

### 使用方式

本文件记录 2026-06-04 测试中发现的问题，每个问题拆成一张可逐条执行的 parity 修复卡。一次只处理一个 ID，先读 AS3 源，先补/确认 guard，再做最小修复。

### 队列总览

| ID | 优先级 | Parity 类型 | 问题简述 | 状态 | 建议 guard |
| --- | --- | --- | --- | --- | --- |
| `P0-PET-WINDOW-SELECTION` | P0 | AS3 parity | 宠物属性面板只能固定显示第一个，点其他宠物一闪而过 | Verified | `assert:pet-window-selection` |
| `P1-ITEM-WINDOW-DETAIL` | P1 | AS3 parity | 背包选中装备强化时右侧多出品质/等级 UI 栏 | Needs repair | `assert:forge-ui-placement` (existing) |
| `P0-BATTLE-INIT-HEAL` | P0 | AS3 parity (待确认) | 每轮战斗后恢复主角和宠物血量 | Needs investigation | 待确认后新增 |
| `P0-DROP-AUTOSELL-INTEGRITY` | P0 | AS3 parity + intentional UX boundary | 满背包自动卖出需保护背包价值和 AS3 金币口径 | Guarded | `assert:drop-filter-auto-sell` |
| `P2-BATTLE-LOG-CAPACITY` | P2 | Intentional divergence | 战斗日志历史条目可以增加 1.5x 容量 | Needs adjustment | `assert:battle-log-sticky-scroll` (existing, 修改常量) |
| `P1-PLAYER-INFO-DISPLAY` | P1 | AS3 parity | 角色状态栏显示效果与 AS3 不一致（颜色、格式、攻击范围） | Needs repair | `assert:stat-list` (existing, 扩展) |

---

### `P0-PET-WINDOW-SELECTION`

**Scope:** 宠物窗口中点击不同宠物时，属性面板只固定显示第一个，其他宠物的详情一闪而过无法准确切换。

**Current Status:** Verified on 2026-06-04. `PetWindow` 选中状态已改为稳定宠物 key，并由 `assert:pet-window-selection` 覆盖点击第二只、`PET_SET` 后引用变化、删除非选中宠物、删除当前选中宠物四段行为；浏览器 smoke 已确认右侧详情不会在 battle tick 后回退到第一只。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iPet/PetInnerPanel.as` (L1-L60): 使用 `ButtonGroup` 单选框组件管理选中状态，`selectCell` 记录当前选中。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iPet/PetCell.as` (L1-L100): 点击触发 `ButtonGroup` 射频切换。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iPet/PetInfoWindow.as` (L1-L89): 宠物详情浮窗。

**React Targets:**

- `src/components/windows/PetWindow.tsx` (L51-L60, L107-L118, L134-L196)

**Current Symptom:** 宠物列表中有多只宠物时，点击非默认宠物，右侧属性面板短暂（一闪而过）显示正确信息后回退为列表第一个。只有第一个宠物的属性面板能稳定显示。

**Root Cause:** `PetWindow.tsx` 第 55 行 `selectedPet` 使用对象引用（`useState`）管理选中状态：

```tsx
const [selectedPet, setSelectedPet] = useState<any>(petList[0] ?? state.player.pet ?? null)
```

第 57-60 行 `visibleSelectedPet` 通过 `petList.includes(selectedPet)` 校验选中宠物是否仍在列表中：

```tsx
const visibleSelectedPet = useMemo(() => {
  if (selectedPet && (petList.includes(selectedPet) || state.player.pet === selectedPet)) return selectedPet
  return petList[0] ?? state.player.pet ?? null
}, [petList, selectedPet, state.player.pet])
```

核心问题：**`petList` 是 `state.player.petList`，每次 state 更新（如 dispatch `PET_SET`/`PET_REMOVE` 或其他任何 reducer action）都会通过 immutable 更新生成新的 `petList` 数组和新的 `Pet` 对象引用。`petList.includes(oldSelectedPet)` 对旧引用返回 `false`，导致 `visibleSelectedPet` 回退为 `petList[0]`。**

流程：
1. 用户点击第二个宠物 → `setSelectedPet(pet2_ref_v1)`
2. dispatch `PET_SET` → reducer 生成新 state → 新 `petList` 包含 `pet2_ref_v2`、`pet3_ref_v2`...
3. PetWindow 重渲染 → `useMemo` 计算 `petList.includes(pet2_ref_v1)` → `false`（不同引用！）
4. `visibleSelectedPet` 回退为 `petList[0]` → 属性面板显示第一个宠物
5. 视觉上"一闪而过"是因为 React 重渲染的中间态：先渲染 pet2 详情，再渲染 pet0 详情。

**AS3 对比:** AS3 `PetInnerPanel.updateList()` 在每次事件触发时重建列表和 `ButtonGroup`，`ButtonGroup` 内部通过 index/name 管理选中，不依赖对象引用比较。点击行为由 `ButtonGroup.addButton(_loc3_)` 将每个 `PetCell` 注册为单选按钮，切换时由 `ButtonGroup` 原生管理状态。

**Expected Behavior:** 点击任意宠物后，右侧属性面板应稳定显示该宠物的详情，不受 state 更新引发的重渲染影响。选中状态应基于宠物的唯一标识（如 `realName`/`name` 或新增稳定 `id` 字段）。

**Forbidden Behavior:**
- 不允许用对象引用（`===` / `includes`）比较选中宠物。
- 不允许每次 `petList` 变化时回退选中到第一个。
- 不允许创建 mutable 引用绕过 React 状态管理。

**Repair Direction:**

1. 用宠物的唯一标识（如 `pet.realName ?? pet.name`）维护 `selectedPetKey`，而不是 `selectedPet` 对象引用。
2. `PetCell` 的 `key` 也应改为稳定标识（`pet.realName ?? pet.name`），当前使用的 `` `${pet.name ?? pet.realName ?? 'pet'}-${i}` `` 中的 index `i` 不稳定。
3. 在列表中找到与 `selectedPetKey` 匹配的宠物对象来显示详情。

参考实现思路：

```tsx
const [selectedPetKey, setSelectedPetKey] = useState<string | null>(
  petList[0]?.realName ?? petList[0]?.name ?? null
)

const visibleSelectedPet = useMemo(() => {
  if (!selectedPetKey) return petList[0] ?? state.player.pet ?? null
  return petList.find(p => (p.realName ?? p.name) === selectedPetKey) ?? petList[0] ?? state.player.pet ?? null
}, [petList, selectedPetKey, state.player.pet])
```

**Acceptance Tests:** `npm run assert:pet-window-selection` (待新增), `npm run assert:pet-window` (existing), `npx tsc -b`

**Red Guard Contract (新增 `assert:pet-window-selection`):**
- 构造有 3 只宠物的玩家，验证：点击第 2 只宠物后，`visibleSelectedPet` 应指向该宠物。
- 在 `PET_SET` dispatch 后（`petList` 引用变化），选中仍保持在第 2 只宠物。
- 删除非选中宠物时，选中不受影响。
- 删除当前选中宠物时，选中回退到列表第一只。

**Manual Smoke:** 打开宠物窗口，至少有 2 只不同宠物，依次点击每只，确认右侧属性面板稳定切换，不闪烁不回退。

---

### `P1-ITEM-WINDOW-DETAIL`

**Scope:** 在背包中点击装备准备强化时，右侧会多出一个显示"品质"和"等级"的 UI 栏，AS3 中没有此面板。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/ItemWindow.as` (L114-L163): `onItemChange()` 选中装备后只做三件事：加载装备图标精灵、设置成功率文本、设置费用文本。**没有**显示品质/等级的单独面板。
- `reference/as3/BOE-O/scripts/iPanel/iCell/EquipmentCell.as` (L145-L181): 装备详情仅通过 hover 浮窗（`addInfoWindow()`）展示。

**React Targets:**

- `src/components/windows/ItemWindow.tsx` (L170-L187)

**Current Symptom:** 背包窗口下半部分选中装备后，在物品列表和锻造区域之间多出一个面板，显示装备名称、品质（如"传说"）、等级（如"+5"）。

**Root Cause:** `ItemWindow.tsx` 第 170-187 行的 `detailPanelStyle` div 是 React 实现的额外功能，AS3 中不存在对应 UI：

```tsx
{selectedItem && (
  <div style={detailPanelStyle}>
    <div style={{ fontSize: 12, ... }} dangerouslySetInnerHTML={{ __html: getItemName(selectedItem) }} />
    <div style={{ fontSize: 11, ... }}>
      品质: <span style={{ color: QualityColor[selectedItem.quality] ?? ... }}>{QualityName[selectedItem.quality] ?? '未知'}</span>
      {' | '}等级: <span style={{ color: ... }}>+{selectedItem.level}</span>
    </div>
  </div>
)}
```

**Expected Behavior:** 背包窗口选中装备后，应如 AS3 那样只在下部显示锻造区域（成功率、费用、锻造按钮），不额外显示品质/等级面板。品质和等级信息只在 hover 装备行时通过浮窗展示。

**Forbidden Behavior:** 不允许在背包锻造流程中占据额外空间显示品质/等级信息。

**Repair Direction:** 删除 `ItemWindow.tsx` 第 170-187 行的 `{selectedItem && (<div style={detailPanelStyle}>...</div>)}` 块。

注意：现有的 `forgePanelStyle` 区域（L190-272）在第 193-198 行已经使用 `getItemName(selectedItem)` 和 `forgeInfo`（显示"锻造至 +N"），这是 AS3 正确的 UI。删除 `detailPanelStyle` 不影响锻造区域的显示。

**Acceptance Tests:** `npm run assert:forge-ui-placement` (existing), `npm run assert:equip-window` (existing), `npm run assert:equipment-ownership`, `npx tsc -b`

**Manual Smoke:** 打开背包，选中一件装备，确认右侧只出现锻造成功率/费用/按钮，不出现品质/等级单独面板。hover 装备行的格子应仍能通过浮窗看到品质等级信息。

---

### `P0-BATTLE-INIT-HEAL`

**Scope:** 用户反馈"每轮战斗之后均会恢复自身和主角的血量"，认为这是之前个性化需求引入的错误，要求按 AS3 原版改回去。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iData/Battle.as` (L52-L93, L104-L131)

**AS3 行为分析:**

AS3 `Battle.init()` 第 70-76 行：

```as3
this.playerHp = Player.hp;      // Player.hp 是主角最大血量公式计算结果
this.playerMp = Player.mp;      // Player.mp 是主角最大蓝量公式计算结果
this.pet = Player.pet;
if(this.pet) {
    this.petHp = Player.pet.hp;  // Player.pet.hp 是宠物最大血量
    this.petMp = Player.pet.mp;  // Player.pet.mp 是宠物最大蓝量
}
```

`checkDead()` 第 120-128 行：怪物死亡 → `giveTrophy()` → `init()`

**AS3 中的关键事实：`Player.hp` 是一个 getter/计算属性，始终返回最大血量公式的计算值，不是战斗中的当前血量。** 因此 AS3 每消灭一只怪物后，通过 `init()` 重新读取 `Player.hp` 作为 `battle.playerHp`，效果上就是主角和宠物回满血。这是 AS3 的原始设计。

**React 对比:**

- `src/core/models/Battle.ts` (L142-L170): `init()` 中 `this.playerHp = getHp(this.playerState)` 和 `this.petHp = this.pet.hp`，逻辑与 AS3 一致。
- `src/state/GameContext.tsx` (L460-L541): `BATTLE_TICK` 处理中，`battle.cloneForTransition` → `battle.run()` → `checkDead()` → `init()` 流程与 AS3 一致。
- `BATTLE_TICK` 不会将 `battle.playerHp` 写回 `playerState`，因为 `Player.hp` 始终是最大血量计算值（与 AS3 架构一致）。

**当前结论:**

React 的 `Battle.init()` 行为与 AS3 一致——**每消灭一只怪物后，主角和宠物回满 HP 和 MP**。

**待用户确认:**

如果用户观察到"每轮战斗之后均会恢复自身和主角的血量"（可能指每回合 tick 而非每只怪），则需要进一步排查是否存在额外的、不同于 AS3 的回血逻辑。目前排查未发现此类额外逻辑。

**可能性分析:**

| 可能性 | 检查方式 |
|--------|----------|
| A. 用户指的就是 kill-per-monster 回满血 | 如果用户认为 AS3 不应该回满，请重新阅读 AS3 `Battle.init()` L52-L93 — AS3 就是每只怪后回满 |
| B. 存在其他额外的回血逻辑 | 需要浏览器 smoke 确认是否在同一个怪物战斗过程中血量被意外恢复 |
| C. 宠物最大血量计算有误 | 如果宠物 HP 公式计算结果偏大，`init()` 后会看到"跳到大血量"的视觉效果 |

**Red Guard Contract (待确认方向后):**
- 如方向 A（确认 AS3 本身就是该行为）：本卡可关闭或标记为 intentional parity。
- 如方向 B：需新增 guard 检测同一怪物战斗过程中 `battle.playerHp` 是否被非战斗逻辑修改。
- 如方向 C：需新增 guard 检测 `Pet.hp` 计算与 AS3 对齐。

**Repair Direction:** 待用户确认具体是哪种情况后再决定。

**Acceptance Tests:** 待定。

---

### `P0-DROP-AUTOSELL-INTEGRITY`

**Scope:** 装备满了之后继续捡起装备时，需要确认 React 的自动卖出是否是最优解：保留对玩家有利的"满包时自动腾空间"方向，但不能卖错装备、不能按高于 AS3 的金币口径结算，也不能在新掉落更差时降低背包价值。

**Current Status:** Guarded on 2026-06-04. 经 AS3 复核，`autoSell_toggle` 在 AS3 全局配置中默认开启，设置面板也有 "Auto sell lowest value while bag is full" 文案；但 `Monster.dropItem()` / `Boss.dropItem()` 的实际掉落代码没有消费该开关，满包时只会把新掉落装备按 `getMoney()` 换金币。React 保留自动卖出作为 intentional UX boundary，但 guard 已限定：只在新掉落的 `getMoney()` 严格高于背包中最低 `getMoney()` 装备时才卖旧装备并保留新装备；否则保留原背包并将新掉落换金币。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` (L182-L202): `addItem()` 满包返回 `false`，只显示"背包满了!"，不操作任何物品。
- `reference/as3/BOE-O/scripts/iGlobal/Global.as` (L182): `autoSell_toggle` 默认值为 `true`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/SystemWindow.as` (L649-L667): 设置面板提供 "Auto sell lowest value while bag is full" 开关。
- `reference/as3/BOE-O/scripts/iData/iMonster/Monster.as` (L178-L232): `dropItem()` 中满包时 `addItem()` 返回 `false` → 调用 `Player.addMoney(_loc2_.getMoney())` **将新掉落装备换成金币**。
- `reference/as3/BOE-O/scripts/iData/iMonster/Boss.as` (L38-L103): 同样逻辑，新装备换金币。

**AS3 流程:**
```
玩家击杀怪物 → dropItem() 生成装备
  → Player.addItem(新装备)
    ├─ 背包未满 → 新装备进背包 ✓
    └─ 背包已满 → return false → Player.addMoney(新装备.getMoney()) → 新装备换金币 ✓
```
**AS3 实际掉落路径中背包原有物品不受影响；React 的自动腾空间是基于 AS3 设置文案的有意 UX 优化，不是 Monster/Boss 掉落代码的严格复刻。**

**React Targets:**

- `src/core/systems/SystemConfig.ts` (L44-L81): `addItemWithAutoSell()` — 核心问题函数。

**Resolved Symptom:** 旧 React 逻辑虽然方向上接近"自动卖最低价值装备"，但有两个风险：
1. 用 `getSellMoney()` 选择和结算自动卖出的装备，可能高于 AS3 的 `getMoney()` 金币口径。
2. 不比较新掉落与背包最低价值装备；即使新掉落更差，也会卖掉背包中原有装备并塞入新掉落，反而降低背包价值。

**Expected Behavior:**
- `autoSell_toggle` 保持默认开启，与 AS3 `Global.autoSell_toggle` 默认值和设置面板文案一致。
- 背包未满时，新装备正常进背包。
- 背包已满且自动卖出关闭时，走 AS3 严格路径：新装备按 `getMoney()` 换金币，背包不变。
- 背包已满且自动卖出开启时，比较"新掉落 + 背包现有装备"的 AS3 `getMoney()` 价值：
  - 新掉落价值严格高于背包最低装备：卖出背包最低装备，金币增加该旧装备的 `getMoney()`，新掉落进入背包。
  - 新掉落价值低于或等于背包最低装备：不动背包，新掉落按 `getMoney()` 换金币。

**Forbidden Behavior:**
- 不允许用 `getSellMoney()` 作为掉落自动卖出的价值口径。
- 不允许新掉落更差时替换掉背包原有装备。
- 不允许 filtered drop 或满包失败路径移除背包中非目标装备。

**Repair Direction:** 保留 React 自动卖出方向，但把 `addItemWithAutoSell()` 的价值口径改为 `getMoney()` 优先，并在新掉落价值不高于背包最低装备时返回 `{ added: false }`，让 `handleDroppedItem()` 继续执行新掉落换金币路径。

涉及修改的文件：
- `SystemConfig.ts` L44-81: `addItemWithAutoSell()` 满包价值口径和选择分支。
- `assertDropFilterAutoSellParity.mjs`: 扩展满包自动卖 guard。
- `assertSystemConfigConsumption.mjs`: 同步 `getMoney()` 价值口径断言。

**Acceptance Tests:** `npm run assert:drop-filter-auto-sell`, `node scripts/assertSystemConfigConsumption.mjs`, `npm run assert:equipment-ownership`, `npx tsc -b`

**Red Guard Contract (扩展 `assert:drop-filter-auto-sell`):**
- 构造满背包（`itemList.length === BAGMAX`）的玩家，掉落一件高于背包最低 `getMoney()` 的新装备。
- 验证：自动卖出移除的正是背包最低 `getMoney()` 装备，金币增加该旧装备的 `getMoney()`，新装备进入背包，背包容量保持 `BAGMAX`。
- 构造新掉落低于或等于背包最低 `getMoney()` 的场景。
- 验证：新掉落不进入背包，原背包内容不变，并由 `handleDroppedItem()` 按新掉落 `getMoney()` 换金币。
- 验证：filtered drop 仍然按 AS3 路径换金币，背包不变。

**Manual Smoke:** 将背包填满，进入战斗掉装备：当新掉落更好时确认日志显示自动出售旧装备且背包保留新装备；当新掉落不更好时确认背包不变且金币增加来自新掉落价值。

---

### `P2-BATTLE-LOG-CAPACITY`

**Scope:** 战斗日志有了吸附功能，但历史条目容量比 AS3 少，建议增加到约 150 条（1.5 倍）。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iAllInfo/AllInfoInnerPanel.as` (L34): `if(this.list.length > 100)` — 最多保留 100 条。

**React Targets:**

- `src/state/GameContext.tsx` (L40): `const MAX_BATTLE_LOG_MESSAGES = 100;`
- `src/components/panels/AllInfoPanel.tsx` — 吸附行为已由 `assert:battle-log-sticky-scroll` 验证。

**Current Symptom:** 当前容量 100 条与 AS3 对齐。用户反馈测试过程中感觉历史条目偏少。考虑到 React 增加了吸附功能（AS3 无吸附），用户更容易滚动到历史区域查看，适当增加容量合理。

**Expected Behavior:** 将 `MAX_BATTLE_LOG_MESSAGES` 从 100 增加到 **150**（1.5 倍），在吸附功能下用户可以滚动回看更多历史记录。

**Repair Direction:** 修改 `GameContext.tsx` 第 40 行：

```tsx
const MAX_BATTLE_LOG_MESSAGES = 150;
```

**注意：** 这是 intentional divergence（有意的偏离），需要在文档及 guard 中标注。日志容量的增加不影响核心战斗逻辑，只是 UI 展示层的变更。

**Acceptance Tests:** `npm run assert:battle-log-sticky-scroll` (existing, 需更新常量引用), `npm run assert:battle-damage-log-death` (existing), `npx tsc -b`

**Manual Smoke:** 进入战斗，持续战斗直到日志超过 100 条（可配合加速倍率），确认历史日志容量确实是 150 条，滚动吸附功能不受影响。

---

### `P1-PLAYER-INFO-DISPLAY`

**Scope:** 主要角色状态栏的显示效果与 AS3 原版不一致。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as` (L1-L299)
- `reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as` (L67-L73): 定位在 `(10, 10)`。

**React Targets:**

- `src/components/panels/PlayerInfoPanel.tsx` (L1-L113)

**Key Differences Found:**

| 维度 | AS3 | React | 差异 |
|------|-----|-------|------|
| **攻击显示** | `"62~129"` — 最小和最大攻击力的范围 | `Math.floor(s.attack)` — 单一数值 | React 只显示一个数，AS3 显示范围 |
| **属性着色** | 红/金色：基础值比较，低于 basic 红色，高于金色，括号内显示基础值 | 无着色比较 | React 缺少属性值对基础值的颜色反馈 |
| **暴击倍数** | `"100%"` — 百分比格式 | `s.crit_mul.toFixed(1)` — 小数，无 `%` | React 格式不同（如显示 `1.0` 而非 `100%`） |
| **布局** | 固定 2 列 14 行一大列，精确像素定位 | CSS Grid `1fr 1fr`，自适应 | 基本对齐，但具体字段排列顺序和分组可能与 AS3 有细微差异 |

**Current Symptom:**

1. **攻击显示错误：** AS3 中 `attMin ~ attMax` 是范围（如 `62~129`），React `PlayerInfoPanel.tsx` 第 96 行显示 `Math.floor(s.attack)` 是单一值。
   - AS3: `Player.attMin + "~" + Player.attMax`（L239-244）
   - React: `Math.floor(s.attack)`（L96）
   - 需要改为 `{Math.floor(s.attmin)}~{Math.floor(s.attmax)}`

2. **属性着色缺失：** AS3 `PlayerInfoPanel.update()` L198-237 中，每个属性（力量/敏捷/智力/意志/幸运）与对应 `basicXXX` 基础值比较，低于基础值显示红色 `#ff4040`、高于基础值显示金色 `#e3b20a`，并在括号内附基础值 `(basicXXX)`。React 无此着色。
   - AS3: `"<font color='#ff4040'>13</font><font size='12'>(15)</font>"`
   - React: 无着色，无基础值对比

3. **暴击倍数格式：** AS3 第 254 行 `this.crit_mul.setText(Player.crit_mul + "%")` 显示为百分比。React 第 98 行 `{s.crit_mul.toFixed(1)}` 显示为小数（如 `1.0`），缺少 `%` 后缀。需确认 `s.crit_mul` 的值域是 0-100 还是 0-1。

**Expected Behavior:** 状态栏应逐项与 AS3 对齐：攻击力显示范围、属性值带颜色比较、暴击倍数显示百分比格式。

**Forbidden Behavior:**
- 不允许攻击力只显示单一数值。
- 不允许缺少属性基础值对比着色。
- 不允许暴击倍数显示裸小数无 `%`。

**Repair Direction:**

1. **攻击范围：** 修改 `PlayerInfoPanel.tsx` 第 96 行，将 `value={Math.floor(s.attack)}` 改为 `value={`${Math.floor(s.attmin)}~${Math.floor(s.attmax)}`}`。需确认 `selectPlayerStats` 返回 `attmin` 和 `attmax`。

2. **属性着色：** 修改 `StatLine` 组件（或每个属性的渲染逻辑），接收基础值参数，比较当前值与基础值：
   - 当前值 < 基础值 → 红色 `#ff4040`，附 `(基础值)` 括号
   - 当前值 >= 基础值 → 金色 `#e3b20a`，附 `(基础值)` 括号

   受影响的字段：力量、敏捷、智力、意志、幸运。

3. **暴击倍数：** 修改第 98 行，根据 `s.crit_mul` 的实际值域：
   - 如果值域是 0-100 → `{s.crit_mul.toFixed(0)}%`
   - 如果值域是 0-1 → `{(s.crit_mul * 100).toFixed(0)}%`

   比对 AS3 `Player.as` 和 React `Player.ts` 中的 `crit_mul` 计算公式确定域。

**Acceptance Tests:** `npm run assert:stat-list` (existing, 需扩展), `npm run assert:equip-window` (existing), `npx tsc -b`

**Red Guard Contract (扩展 `assert:stat-list`):**
- 验证攻击力以 `min~max` 格式渲染。
- 验证力量/敏捷/智力/意志/幸运的渲染包含基础值括号。
- 验证暴击倍数以百分比格式渲染。
- 验证属性着色：低于基础值时使用红色、不低于时使用金色。

**Manual Smoke:** 进入游戏，观察左上角状态栏：攻击力显示范围（如 62~129）、属性值显示带颜色+基础值括号（如红色 `13(15)` 或金色 `17(15)`）、暴击倍数显示为百分比。

---

## English

### How To Use

This file breaks down issues discovered during 2026-06-04 testing into individually actionable parity repair cards. Pick one card ID per session. Read AS3 first, add or confirm the red guard, then make the smallest repair.

### Queue Overview

| ID | Priority | Parity Type | Issue | Status | Suggested Guard |
| --- | --- | --- | --- | --- | --- |
| `P0-PET-WINDOW-SELECTION` | P0 | AS3 parity | Pet attribute panel only shows the first pet; clicking others flashes briefly then resets | Verified | `assert:pet-window-selection` |
| `P1-ITEM-WINDOW-DETAIL` | P1 | AS3 parity | Extra quality/level UI bar appears when selecting equipment for forging in bag | Needs repair | `assert:forge-ui-placement` (existing) |
| `P0-BATTLE-INIT-HEAL` | P0 | AS3 parity (TBD) | Player and pet HP recover after every battle | Needs investigation | TBD after confirmation |
| `P0-DROP-AUTOSELL-INTEGRITY` | P0 | AS3 parity | Full-inventory auto-sell affects existing bag items | Needs repair | `assert:drop-filter-auto-sell` |
| `P2-BATTLE-LOG-CAPACITY` | P2 | Intentional divergence | Battle log history can increase to 1.5x capacity | Needs adjustment | `assert:battle-log-sticky-scroll` (existing, update constant) |
| `P1-PLAYER-INFO-DISPLAY` | P1 | AS3 parity | Character status bar display differs from AS3 (colors, format, attack range) | Needs repair | `assert:stat-list` (existing, extend) |

(English details omitted for brevity; see Chinese sections above for full analysis.)

### Priority Note

推荐修复顺序：
1. `P0-PET-WINDOW-SELECTION` — 最影响玩家体验，宠物管理核心功能不可用
2. `P0-DROP-AUTOSELL-INTEGRITY` — 可能意外出售重要装备，数据完整性问题
3. `P1-PLAYER-INFO-DISPLAY` — 界面不一致，属性信息可见性
4. `P1-ITEM-WINDOW-DETAIL` — 多余 UI 干扰
5. `P0-BATTLE-INIT-HEAL` — 需先确认是否真的是 bug
6. `P2-BATTLE-LOG-CAPACITY` — 小调整，intentional divergence
