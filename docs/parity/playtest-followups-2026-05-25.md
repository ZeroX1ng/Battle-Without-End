# BWE Playtest Follow-up Parity Queue - 2026-05-25

Last updated: 2026-05-25

## 中文

### 使用方式

本文件把 2026-05-25 试玩发现拆成后续可逐条执行的 parity / 修复卡。每次只选择一个 ID，不要把多个 UI、存档、战斗日志和性能改动混在同一次修复里。

- 执行前先运行 `git status --short`，确认当前工作树中哪些文件不是本卡范围。
- 先重读卡片列出的 AS3 Source of Truth；如果是产品覆盖或临时测试工具，也要在实现说明里明确它不是纯 AS3 parity。
- 先新增或确认最小 red guard，再做最小修复。
- 完成后运行专属 guard、相邻 guard、`npx tsc -b`；玩家可见 UI 卡必须补浏览器 smoke 截图或等价的渲染证据。
- 完成报告固定包含：AS3 evidence、changed files、verification results。

### 队列总览

| ID | 优先级 | Parity 类型 | 覆盖试玩问题 | 状态 | 专属 guard |
| --- | --- | --- | --- | --- | --- |
| `P0-TITLE-SAVE-DATA` | P0 | AS3 parity | 4, 6 | Needs repair card | `assert:title-data-save-parity` |
| `P0-EQUIP-COMPARE-TOOLTIP` | P0 | AS3 parity | 2 | Needs repair card | `assert:equipment-compare-tooltip` |
| `P0-OTHER-STAGE-OVERLAY` | P0 | AS3 parity | 9 | Needs repair card | `assert:other-window-overlay` |
| `P0-DROP-FILTER-SELL` | P0 | AS3 parity | 10 | Guard needed | `assert:drop-filter-auto-sell` |
| `P1-AGE-GROWTH-VISIBLE` | P1 | AS3 parity | 1 | Needs repair card | `assert:age-growth-visible` |
| `P1-BATTLE-LOG-STICKY` | P1 | UI parity | 7 | Needs repair card | `assert:battle-log-sticky-scroll` |
| `P1-EQUIP-WINDOW-BOUNDS` | P1 | UI repair | 3 | Needs repair card | `assert:equip-window-bounds` |
| `P1-FORGE-UI-PLACEMENT` | P1 | AS3 parity | 8 | Needs repair card | `assert:forge-ui-placement` |
| `P1-MONSTER-TITLE-TOOLTIP` | P1 | AS3 parity | 12 | Needs repair card | `assert:monster-title-tooltip` |
| `P1-VISIBLE-AUTOSAVE-SLOT` | P1 | Product override | 5 | Needs repair card | `assert:visible-autosave-slot` |
| `P2-VISUAL-FPS-CAP` | P2 | Performance guard | 11 | Needs repair card | `assert:visual-fps-cap` |
| `P2-TEST-SPEED-CONTROL` | P2 | Temporary test tool | 13 | Needs repair card | `assert:test-speed-control` |

### `P0-TITLE-SAVE-DATA`

**Scope:** 读档后无法装备称号，以及称号数量/显示疑似缺失。

**AS3 Source of Truth:** `TitleList.as`, `Title.as`, `Player.as`, `TitleWindow.as`, `TitleCell.as`.

**React Targets:** `titleData.ts`, `Title.ts`, `Player.ts`, `TitleWindow.tsx`, `SaveSystem.ts`, `GameContext.tsx`, existing `assert:title-window`, existing `assert:save-load-runtime-continuity`.

**Current Symptom:** 读档后称号入口仍可见，但装备称号失败或已获得/当前称号状态没有恢复；试玩感受上像是称号数量也少于原版。

**Red Guard Contract:** 新增 `assert:title-data-save-parity`，先证明 AS3 `TitleList`、React `titleData` 的称号数量和顺序；再构造一个保存前已获得并装备称号的玩家，读取后必须仍能装备/切换称号。若 AS3 和 React 都是 45 个称号，则 guard 把问题定位到保存、读取、显示或可装备状态，而不是盲目补静态表。

**Expected Behavior:** 称号静态表顺序、名称、描述和解锁状态按 AS3 恢复；保存数据中当前装备称号、已获得称号和称号进度读档后继续可用。

**Forbidden Behavior:** 不允许读档后只恢复显示名称但丢失 `Title` 实例能力；不允许用显示名临时匹配导致重复名或本地化变化时失效；不允许把未获得称号标成可装备。

**Acceptance Tests:** `npm run assert:title-data-save-parity`, `npm run assert:title-window`, `npm run assert:save-load-runtime-continuity`, `npx tsc -b`.

**Manual Smoke:** 创建可获得称号的测试存档，装备称号，保存，刷新/读取，再打开称号窗口确认当前称号高亮、可取消、可切换。

### `P0-EQUIP-COMPARE-TOOLTIP`

**Scope:** 背包装备和商店在售装备缺少与当前装备的浮窗对比。

**AS3 Source of Truth:** `EquipmentCell.as`, `ItemWindow.as`, `ShopCell.as`, `ShopPanel.as`, `GambleCell.as`, `InfoWindow.as`.

**React Targets:** `InfoWindow.tsx`, `EquipmentCell.tsx`, `ItemWindow.tsx`, `ShopWindow.tsx`, `SpecialShopWindow.tsx`, `Player.ts`, existing `assert:equip-window`, existing `assert:shop-window`.

**Current Symptom:** hover 背包装备或商店装备时，只能看到新装备信息，玩家无法直观看到当前槽位装备属性。

**Red Guard Contract:** 新增 `assert:equipment-compare-tooltip`，检查装备 hover 数据路径同时提供 candidate equipment 和当前对应槽位 equipment；商店售卖装备也必须复用同一比较能力。

**Expected Behavior:** 背包装备 hover 显示新装备详情，并在旁边显示当前同槽位装备详情；商店装备 hover 同样显示在售装备和当前装备。当前槽为空时只显示候选装备。

**Forbidden Behavior:** 不允许只用文本拼接伪造对比；不允许商店和背包各写一套不一致的浮窗逻辑；不允许 hover 普通物品时出现装备对比框。

**Acceptance Tests:** `npm run assert:equipment-compare-tooltip`, `npm run assert:equip-window`, `npm run assert:shop-window`, `npm run assert:equipment-ownership`, `npx tsc -b`.

**Manual Smoke:** 背包中准备一件可装备武器/防具，当前槽位已有装备，hover 背包格子确认双浮窗；打开商店 hover 在售装备确认同样双浮窗，移动鼠标后浮窗消失。

### `P0-OTHER-STAGE-OVERLAY`

**Scope:** 地图、帮助、商店、特殊商店等功能窗口应叠加在挂机战斗主页面，而不是嵌在当前标签页内部导致错位。

**AS3 Source of Truth:** `OtherWindow.as`, `MapPanel.as`, `HelpPanel.as`, `ShopPanel.as`, `SpecialShopPanel.as`, `MainScene.as`.

**React Targets:** `OtherWindow.tsx`, `OtherPanel.tsx`, `MainScene.tsx`, `MapWindow.tsx`, `ShopWindow.tsx`, `SpecialShopWindow.tsx`, `SaveWindow.tsx`, `GameContext.tsx`, `types.ts`, existing `assert:system-window`.

**Current Symptom:** 其他标签页内直接渲染地图/商店等大窗口，窗口尺寸和右侧标签布局互相挤压，和 AS3 的 stage overlay 行为不同。

**Red Guard Contract:** 新增 `assert:other-window-overlay`，确认 `OtherWindow` 只负责入口按钮，具体窗口由 `MainScene` 根据 `ui.activeWindow` 统一 overlay 渲染；地图、帮助、商店、特殊商店不得继续嵌在 `OtherWindow` 内容区。

**Expected Behavior:** 点击其他页入口按钮后，战斗主页面上方出现可关闭 overlay；overlay 不改变主战斗布局，不挤压右侧标签页；关闭后返回原来的挂机显示。

**Forbidden Behavior:** 不允许在 `OtherWindow` 内直接塞大窗口；不允许 `activeWindow` 只有状态字段却没有主场景渲染；不允许多个 overlay 同时残留。

**Acceptance Tests:** `npm run assert:other-window-overlay`, `npm run assert:system-window`, `npm run assert:map-selection`, `npm run assert:shop-window`, `npx tsc -b`.

**Manual Smoke:** 在主场景进入其他页，点击地图/商店/帮助入口，确认 overlay 叠加在战斗界面、尺寸稳定、关闭后不改变当前战斗和标签选择。

### `P0-DROP-FILTER-SELL`

**Scope:** 装备拾取筛选取消勾选后的掉落处理必须验证为自动出售/转金币，而不是“未拾取后消失”。

**AS3 Source of Truth:** `Monster.as`, `Boss.as`, `Global.as`, `SystemWindow.as`, `Battle.as`, equipment sell/drop money logic.

**React Targets:** `SystemConfig.ts`, `Monster.ts`, `Battle.ts`, `GameContext.tsx`, `scripts/assertSystemConfigConsumption.mjs`, `package.json`, existing `assert:system-window`, existing `assert:monster-reward`.

**Current Symptom:** 当前代码已有 `handleDroppedItem` 路径和未注册的 `assertSystemConfigConsumption.mjs`，但试玩需求要求明确验证取消勾选的装备是自动出售/转金币。

**Red Guard Contract:** 注册或扩展 `assert:drop-filter-auto-sell`。构造一个被质量/类型开关拒绝的掉落，断言 `added === false`、背包不变、金币增加、日志符合 AS3 语义。

**Expected Behavior:** 勾选关闭的掉落不进入背包，但应按 AS3 逻辑给玩家金币；Boss 掉落和普通怪物掉落都走同一筛选消费路径。

**Forbidden Behavior:** 不允许“筛掉就丢弃且无金币”；不允许 Battle 自己绕过 Monster/Boss 掉落所有权；不允许只测 `shouldKeepDroppedItem` 而不测最终金币变化。

**Acceptance Tests:** `npm run assert:drop-filter-auto-sell`, `npm run assert:system-window`, `npm run assert:monster-reward`, `npm run assert:save-load-runtime-continuity`, `npx tsc -b`.

**Manual Smoke:** 关闭某品质或某装备类型拾取，进入会掉落装备的地图，确认背包不增加对应装备但金币增加，相关日志仍可理解。

### `P1-AGE-GROWTH-VISIBLE`

**Scope:** 角色年龄成长缺少可见成长周期、属性浮窗和成长反馈。

**AS3 Source of Truth:** `PlayerInfoPanel.as`, `Player.as`, `Race.as`, `MainScene.as`.

**React Targets:** `PlayerInfoPanel.tsx`, `Player.ts`, `GameContext.tsx`, `useGameLoop.ts`, existing `assert:start-character-age`, existing `assert:game-loop`.

**Current Symptom:** 玩家看到年龄数值，但不知道成长需要多久、下一次成长属性、AP 增量和剩余时间。

**Red Guard Contract:** 新增 `assert:age-growth-visible`，确认玩家年龄文本 hover 使用全局信息浮窗，并包含下一次成长属性、AP 增量、剩余 tick/时间；确认 2400 tick 成长仍产生日志和属性更新。

**Expected Behavior:** 鼠标指向年龄文本时显示成长信息；每 2400 个逻辑 tick 触发成长，年龄、属性、AP 和日志一起更新。

**Forbidden Behavior:** 不允许把浮窗写成静态文案；不允许视觉刷新频率影响 500ms 逻辑 tick；不允许成长信息和实际成长公式分叉。

**Acceptance Tests:** `npm run assert:age-growth-visible`, `npm run assert:start-character-age`, `npm run assert:game-loop`, `npx tsc -b`.

**Manual Smoke:** 进入游戏 hover 年龄文字，确认浮窗展示下一次成长属性和剩余时间；用测试倍率推进到成长点，确认日志和属性变化。

### `P1-BATTLE-LOG-STICKY`

**Scope:** 战斗日志需要底部锁定策略。

**AS3 Source of Truth:** `AllInfoPanel.as`, `AllInfoInnerPanel.as`, `InfoText.as`, battle log append flow.

**React Targets:** `AllInfoPanel.tsx`, `ScrollPanel.tsx` if shared behavior is reused, `GameContext.tsx`, existing `assert:text-resources`, existing `assert:battle-damage-log-death`.

**Current Symptom:** 新日志出现时总是强制滚到底部，玩家查看历史日志会被打断；或者无法在回到底部后重新锁定最新日志。

**Red Guard Contract:** 新增 `assert:battle-log-sticky-scroll`，用组件级或 DOM-level guard 覆盖三段行为：初始在底部时新日志自动滚动；用户向上查看历史时新日志不抢滚动；用户滚回底部后恢复自动跟随。

**Expected Behavior:** 底部锁定只在用户处于底部或接近底部时生效；用户查看历史时保持当前 scrollTop；重新滚到底部后最新日志继续可见。

**Forbidden Behavior:** 不允许每次 `infoMessages.length` 变化都无条件 `scrollTop = scrollHeight`；不允许新日志追加导致布局跳动遮挡底部。

**Acceptance Tests:** `npm run assert:battle-log-sticky-scroll`, `npm run assert:text-resources`, `npm run assert:battle-damage-log-death`, `npx tsc -b`.

**Manual Smoke:** 战斗中先停在底部观察自动跟随，再手动向上滚看历史，等待新日志确认不抢滚；滚回底部后确认再次跟随。

### `P1-EQUIP-WINDOW-BOUNDS`

**Scope:** 装备界面底部属性超过 UI 限制，无法显示完全。

**AS3 Source of Truth:** `EquipWindow.as`, `EquipCell.as`, related scroll/mask panels.

**React Targets:** `EquipWindow.tsx`, shared window CSS/layout helpers, existing `assert:equip-window`, existing `assert:equipment-ownership`.

**Current Symptom:** 小视口或属性较多时，装备详情/属性区底部被裁切，玩家无法完整查看属性和按钮。

**Red Guard Contract:** 新增 `assert:equip-window-bounds`，确认装备属性面板拥有明确高度、最小高度、滚动边界和不会被父级 overflow 裁掉的布局约束。

**Expected Behavior:** 装备槽、属性列表和操作按钮在小视口中都可通过面板内部滚动完整查看；hover 或选中状态不改变面板尺寸。

**Forbidden Behavior:** 不允许只靠外层页面滚动救场；不允许属性文本溢出父容器；不允许按钮被固定底部遮挡。

**Acceptance Tests:** `npm run assert:equip-window-bounds`, `npm run assert:equip-window`, `npm run assert:equipment-ownership`, `npx tsc -b`.

**Manual Smoke:** 用桌面和较小窗口打开装备页，选中属性较多的装备，确认底部属性和按钮可见且滚动边界稳定。

### `P1-FORGE-UI-PLACEMENT`

**Scope:** 原版锻造 UI 应在背包页下方固定小区域显示。

**AS3 Source of Truth:** `ItemWindow.as`, `ForgeButton.as`, `BasicCell.as`, forge cost/success text and sound toggles.

**React Targets:** `ItemWindow.tsx`, forge action/state files, possibly shared checkbox/button controls, existing `assert:equip-window`, existing `assert:equipment-ownership`.

**Current Symptom:** 锻造信息和按钮被放在详情布局里，容易和物品详情互相挤压，不符合 AS3 `setForge()` 的固定下方区域。

**Red Guard Contract:** 新增 `assert:forge-ui-placement`，确认背包页中存在独立 forge panel，位置在物品列表/标签切换下方；自动锻造、音效开关、成功率、消耗、按钮和目标装备都在该区域。

**Expected Behavior:** 选中可锻造装备后，下方小区域展示锻造目标、成功率/费用、锻造按钮、自动锻造和音效开关；选中非装备或无可锻造目标时区域给出 AS3 对应空状态。

**Forbidden Behavior:** 不允许锻造控件撑开详情区导致物品描述被挤掉；不允许锻造状态和选中装备来源分离；不允许自动锻造设置写错存档字段。

**Acceptance Tests:** `npm run assert:forge-ui-placement`, `npm run assert:equip-window`, `npm run assert:equipment-ownership`, `npx tsc -b`.

**Manual Smoke:** 打开背包选择装备，确认下方 forge 区域固定显示；执行一次锻造，确认金币/材料/日志/音效开关行为正常。

### `P1-MONSTER-TITLE-TOOLTIP`

**Scope:** 鼠标指向怪物称号时，需要展示怪物称号加成详情。

**AS3 Source of Truth:** `MonsterInfoPanel.as`, `MonsterTitle.as`, `MonsterTitleList.as`.

**React Targets:** `MonsterInfoPanel.tsx`, `monsterTitleData.ts`, `InfoWindow.tsx`, existing `assert:monster-data-integrity`, existing `assert:monster-reward`.

**Current Symptom:** 怪物称号只使用浏览器原生 `title` 或信息不足，无法像原版一样展示属性倍率/加值详情。

**Red Guard Contract:** 新增 `assert:monster-title-tooltip`，确认怪物称号使用全局 `InfoWindow` HTML 浮窗，内容来自 `MonsterTitle.description` 等价数据，而不是原生 `title` 属性。

**Expected Behavior:** hover 怪物称号时显示包含 HP、攻击、防御、命中、闪避、经验、金币、掉落等加成的 HTML 浮窗；未生成怪物或无称号时不显示错误浮窗。

**Forbidden Behavior:** 不允许只保留原生浏览器 tooltip；不允许用硬编码中文描述替代数据模型；不允许 tooltip 影响战斗 tick。

**Acceptance Tests:** `npm run assert:monster-title-tooltip`, `npm run assert:monster-data-integrity`, `npm run assert:monster-reward`, `npx tsc -b`.

**Manual Smoke:** 进入战斗，hover 怪物称号，确认浮窗位置跟随鼠标并展示完整加成；切换怪物后内容随新称号更新。

### `P1-VISIBLE-AUTOSAVE-SLOT`

**Scope:** 新增独立可见存档槽 `自动保存`。

**Parity Note:** 这是 Dear Master 明确提出的测试期产品覆盖，不是纯 AS3 parity。AS3 保存槽行为仍需在实现说明中说明，避免未来误认为原版就有独立自动槽。

**AS3 Source of Truth:** `SaveScene.as`, `Player.as`, `Battle.as`.

**React Targets:** `SaveSystem.ts`, `SaveScene.tsx`, `SaveWindow.tsx`, `GameContext.tsx`, `actions.ts`, existing `assert:save-persistence`, existing `assert:save-load-runtime-continuity`.

**Current Symptom:** 自动保存跟随当前手动槽，测试期容易覆盖玩家手动推进的存档；用户希望有一个单独显示的自动保存槽。

**Red Guard Contract:** 新增 `assert:visible-autosave-slot`，更新旧 save guard 预期：自动保存写入固定 `AUTO_SAVE_SLOT`，展示名为 `自动保存`；手动保存仍写入玩家选择的手动槽；读取自动槽后不会改变手动槽数据。

**Expected Behavior:** 存档界面可见 `自动保存` 槽；自动保存只写该槽；手动槽仍由玩家手动覆盖；旧存档兼容当前槽读取。

**Forbidden Behavior:** 不允许隐藏 `auto` key 但 UI 不可见；不允许自动保存覆盖手动槽；不允许把 `自动保存` 当成普通可重命名槽。

**Acceptance Tests:** `npm run assert:visible-autosave-slot`, `npm run assert:save-persistence`, `npm run assert:save-load-runtime-continuity`, `npx tsc -b`.

**Manual Smoke:** 创建角色后等待自动保存，打开存档界面确认 `自动保存` 槽有时间/角色信息；手动保存到槽 1，再等待自动保存，确认槽 1 不被覆盖。

### `P2-VISUAL-FPS-CAP`

**Scope:** 文字挂机游戏不需要过高视觉刷新率，先限制视觉 RAF/滚动/粒子刷新。

**Parity Note:** 这是性能策略，不改变 AS3 500ms 逻辑 tick。

**AS3 Source of Truth:** `MainScene.as`, `Battle.as`, visual effect classes only for cadence comparison.

**React Targets:** `useGameLoop.ts`, `effects.tsx`, `ScrollPanel.tsx`, `useWindowSize.ts`, any reusable RAF helper, existing `assert:game-loop`.

**Current Symptom:** 视觉层多个 `requestAnimationFrame` 循环可能以浏览器刷新率持续运行，对文字挂机游戏成本偏高。

**Red Guard Contract:** 新增 `assert:visual-fps-cap`，确认逻辑 tick 仍默认 500ms，不受视觉 cap 影响；视觉 helper 默认 30fps，效果/滚动层通过 helper 或明确节流。

**Expected Behavior:** 战斗、成长、自动保存等逻辑频率不变；视觉效果和滚动动画默认最多 30fps。若浏览器 smoke 明显顿挫，再单独把常量调到 60fps。

**Forbidden Behavior:** 不允许用 FPS cap 改 `BATTLE_TICK` 间隔；不允许让测试倍率和视觉 cap 互相影响；不允许每个组件手写不同节流常量。

**Acceptance Tests:** `npm run assert:visual-fps-cap`, `npm run assert:game-loop`, `npx tsc -b`.

**Manual Smoke:** 开启战斗并观察日志/特效，确认 CPU 使用下降或稳定，战斗节奏仍是 500ms 逻辑 tick。

### `P2-TEST-SPEED-CONTROL`

**Scope:** 测试阶段临时增加游戏倍率按钮，方便快速推进进度。

**Parity Note:** 这是临时测试工具，不进入正式 parity 完成定义。实现必须有单一常量或 feature flag，便于发布前整卡移除。

**AS3 Source of Truth:** `MainScene.as`, `Battle.as`, `Player.as` only to protect normal 500ms baseline.

**React Targets:** `MainScene.tsx`, `useGameLoop.ts`, debug/test control component, `GameContext.tsx` if UI state is needed, existing `assert:game-loop`.

**Current Symptom:** 试玩测试需要快速推进年龄成长、掉落、称号、存档等长周期流程。

**Red Guard Contract:** 新增 `assert:test-speed-control`，确认倍率选项为 `1x/2x/5x/10x`，只影响 `useGameLoop` 的 effective interval，不写入存档；默认仍为 `1x`。

**Expected Behavior:** 测试控件可在主界面切换倍率；倍率越高逻辑 tick 越快；刷新或读档后倍率回到默认；生产移除时只需要删除一个 feature flag 分支和对应控件。

**Forbidden Behavior:** 不允许把倍率序列化进 save；不允许倍率改变视觉 FPS cap 常量；不允许默认打开非 1x。

**Acceptance Tests:** `npm run assert:test-speed-control`, `npm run assert:game-loop`, `npm run assert:age-growth-visible` after that card exists, `npx tsc -b`.

**Manual Smoke:** 在主场景切换 1x/2x/5x/10x，观察战斗日志和年龄成长进度加速；刷新后确认回到 1x。

## English

### How To Use

This document turns the 2026-05-25 playtest findings into executable follow-up cards. Pick one ID per repair. Read the listed AS3 source first, add or confirm the minimal red guard, make the smallest fix, then run the card guard, nearby guards, `npx tsc -b`, and browser-visible smoke for UI cards.

### Queue Summary

| ID | Priority | Type | Playtest Findings | Status | Dedicated Guard | Main Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| `P0-TITLE-SAVE-DATA` | P0 | AS3 parity | 4, 6 | Needs repair card | `assert:title-data-save-parity` | Title table order/count, obtained state, and equipped title survive save/load. |
| `P0-EQUIP-COMPARE-TOOLTIP` | P0 | AS3 parity | 2 | Needs repair card | `assert:equipment-compare-tooltip` | Inventory and shop equipment hover show candidate item plus current equipped item. |
| `P0-OTHER-STAGE-OVERLAY` | P0 | AS3 parity | 9 | Needs repair card | `assert:other-window-overlay` | Map, shop, help, and special shop render as main-scene overlays, not nested right-tab content. |
| `P0-DROP-FILTER-SELL` | P0 | AS3 parity | 10 | Guard needed | `assert:drop-filter-auto-sell` | Filtered equipment drops do not enter the bag and are converted to player gold. |
| `P1-AGE-GROWTH-VISIBLE` | P1 | AS3 parity | 1 | Needs repair card | `assert:age-growth-visible` | Age hover explains next growth stats, AP gain, remaining time, and 2400-tick growth. |
| `P1-BATTLE-LOG-STICKY` | P1 | UI parity | 7 | Needs repair card | `assert:battle-log-sticky-scroll` | Logs follow the bottom only while the user is already at the bottom. |
| `P1-EQUIP-WINDOW-BOUNDS` | P1 | UI repair | 3 | Needs repair card | `assert:equip-window-bounds` | Equipment stats and actions remain visible through a bounded scroll area. |
| `P1-FORGE-UI-PLACEMENT` | P1 | AS3 parity | 8 | Needs repair card | `assert:forge-ui-placement` | Forge controls live in the fixed lower inventory area like AS3 `ItemWindow.setForge()`. |
| `P1-MONSTER-TITLE-TOOLTIP` | P1 | AS3 parity | 12 | Needs repair card | `assert:monster-title-tooltip` | Monster title hover uses the global HTML info window and displays title modifiers. |
| `P1-VISIBLE-AUTOSAVE-SLOT` | P1 | Product override | 5 | Needs repair card | `assert:visible-autosave-slot` | A visible `自动保存` slot receives auto-saves without overwriting manual slots. |
| `P2-VISUAL-FPS-CAP` | P2 | Performance guard | 11 | Needs repair card | `assert:visual-fps-cap` | Visual RAF loops are capped by a shared helper, while 500ms logic ticks remain unchanged. |
| `P2-TEST-SPEED-CONTROL` | P2 | Temporary test tool | 13 | Needs repair card | `assert:test-speed-control` | `1x/2x/5x/10x` debug speed affects loop interval only and is not saved. |

### Implementation Notes

- `P1-VISIBLE-AUTOSAVE-SLOT`, `P2-VISUAL-FPS-CAP`, and `P2-TEST-SPEED-CONTROL` are intentional non-AS3 product/testing decisions and must be labeled as such in implementation reports.
- `P0-TITLE-SAVE-DATA` must first prove whether the reported title gap is static-data loss or save/load/display loss.
- `P0-DROP-FILTER-SELL` should reuse or register the existing system-config consumption coverage before adding new implementation code.
- Browser smoke is required for tooltip, overlay, scrolling, bounds, forge placement, visible autosave, FPS, and speed-control cards.
