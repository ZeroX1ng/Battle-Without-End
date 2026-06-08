# BWE Playtest Follow-up Parity Queue - 2026-06-08

Last updated: 2026-06-08

## 中文

### 使用方式

本文把 2026-06-08 试玩中肉眼可见的四个问题拆成可逐条执行的 parity / 产品边界卡。每次只选择一个 ID；先读卡片列出的 AS3 Source of Truth，再补或确认 focused red guard，最后做最小修复和浏览器可见 smoke。不要把战斗节奏、怪物信息面板、战斗力显示和装备浮窗混在一次代码修复里。

### 队列总览

| ID | 优先级 | Parity 类型 | 问题简述 | 状态 | 建议 guard |
| --- | --- | --- | --- | --- | --- |
| `P0-BATTLE-TEMPO-CADENCE` | P0 | AS3 parity + visible cadence | 正常速度下攻击回合明显快于 AS3 原版 | Needs repair | `assert:battle-tempo-cadence` |
| `P1-MONSTER-INFO-ATTACK-FLICKER` | P1 | AS3 UI parity | 战斗中敌人攻击力数值快速反复变动 | Needs repair | `assert:monster-info-display-parity` |
| `P1-COMBAT-POWER-EQUIPLESS-READOUT` | P1 | Product decision candidate | 显示战斗力不反映装备后真实压制力，300 CP 可轻松打 900+ 地图 | Needs product decision | `assert:combat-power-readout-parity` |
| `P1-EQUIP-TOOLTIP-BOUNDS` | P1 | AS3 UI parity | 背包装备浮窗过大、遮挡严重、可越出游戏边框 | Needs repair | `assert:item-info-window-bounds` |

---

### `P0-BATTLE-TEMPO-CADENCE`

**Scope:** 正常 1x 速度下，战斗日志和 HP 变化看起来比 AS3 原版快，攻击回合缺少原版 500ms Timer 的稳定节奏感。

**Observed Symptom:** 即使测试倍率显示为正常速度，玩家/宠物/怪物行动仍可能以突发方式连续推进，肉眼感知像被加速。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iData/Battle.as` (L44-L49): `Battle()` 创建 `new Timer(500)`，每 500ms 触发一次 `run`。
- `reference/as3/BOE-O/scripts/iData/Battle.as` (L155-L178): 每次 `run()` 只执行一次 `fight()`，然后推进成长、存档和商店 tick。
- `reference/as3/BOE-O/scripts/iData/Battle.as` (L180-L195): 每次 `fight()` 中只执行当前 turn 分支，随后刷新可见面板并 `changeTurn()`。

**React Targets:**

- `src/components/scenes/MainScene.tsx` (L46-L68): `gameLoopIntervalMs` 从 `getTestSpeedIntervalMs(500, testSpeedMultiplier)` 得到，并传给 `useGameLoop`。
- `src/hooks/useGameLoop.ts` (L41-L55): 当 `elapsed >= intervalMs` 时用 `dueTicks = Math.floor(elapsed / intervalMs)` 同步补跑多个 tick。
- `src/core/models/Battle.ts` (L287-L342): 每个 tick 内的 `fight()`/`run()` 分支与 AS3 结构基本一致。
- `src/core/debug/testSpeedControl.ts` (L3-L11): 临时测试倍率为 `1x/10x/25x/50x`，默认 1x。

**Root Cause Analysis:**

当前 React 的基础 tick 仍是 500ms，`Battle.fight()` 的 turn 结构也和 AS3 接近；因此“正常速度仍显快”的高风险点不是公式分支，而是调度层。`useGameLoop` 会把超过一个 interval 的 elapsed 时间一次性补齐为多个 `BATTLE_TICK` dispatch。前台渲染、DevTools、React 重渲染或短暂卡顿让 elapsed 超过 500ms 时，多个攻击回合可能在同一个浏览器任务中连续结算，日志和 HP 视觉上会像快进。测试倍率控件也必须排除误选非 1x 的情况。

**Expected Behavior:** 1x 前台可见战斗应保持 AS3 可感知的 500ms 节奏：单次调度最多产生一个玩家/宠物或怪物 turn 的可见推进；后台补偿如果保留，也要避免回到前台后把多回合日志瞬间刷屏。

**Forbidden Behavior:**

- 不允许 1x 前台因为 elapsed catch-up 在一次 loop 中连续 dispatch 多个可见 `BATTLE_TICK`。
- 不允许把测试倍率状态写入存档或让默认速度不是 1x。
- 不允许用改战斗公式、伤害、技能概率的方式掩盖节奏问题。

**Repair Direction:**

1. 新增调度层 guard，模拟 1x 前台 elapsed 超过 500ms 时的行为，证明是否会同步补跑多 tick。
2. 区分前台可见节奏与后台恢复：前台建议最多消费 1 个 visible tick；后台恢复可按产品体验决定是否分帧补跑或限制补跑上限。
3. 浏览器 smoke 用 1x 录制至少 10 次日志时间戳，确认相邻可见攻击回合不出现同帧/同毫秒突发。

**Acceptance Tests:** `npm run assert:battle-tempo-cadence` (new), `npm run assert:game-loop`, `npm run assert:test-speed-control`, `npm run assert:battle-damage-log-death`, `npx tsc -b`.

**Manual Smoke:** 打开主场景，确认倍率为 `1x` 且无敌关闭；观察 20 秒战斗日志和 HP 变化，记录玩家/宠物 turn 与怪物 turn 是否按约 500ms 间隔推进，且没有回到前台后瞬间刷出多轮攻击。

---

### `P1-MONSTER-INFO-ATTACK-FLICKER`

**Scope:** 战斗中怪物信息面板的“攻击”数值快速变化，造成视觉困扰。

**Observed Symptom:** 敌人攻击力显示在战斗过程中不断跳动，像是怪物属性在反复变化。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/MonsterInfoPanel.as` (L51-L104): AS3 怪物面板只显示怪物名、称号、HP、战斗力和 buff，不显示随机攻击值。
- `reference/as3/BOE-O/scripts/iData/iMonster/Monster.as` (L254-L275): 怪物名颜色由 `CP / Player.combatPower` 决定。
- `reference/as3/BOE-O/scripts/iData/iMonster/Monster.as`: `get attack()` 是用于战斗伤害的随机 getter，已另由 `p1-battle-monster-attack-getter-20260604.md` 记录为 AS3-identical。

**React Targets:**

- `src/components/panels/MonsterInfoPanel.tsx` (L52-L57): React 额外渲染 `攻击/防御/护甲/暴击` 四项，其中攻击读取 `Math.floor(mon.attack)`。
- `src/core/models/Monster.ts` (L203-L209): `get attack()` 每次读取都会执行 `balanceRandom(this.balance)`。
- `docs/parity/p1-battle-monster-attack-getter-20260604.md`: 记录 getter 随机行为本身是 AS3 原作设计。

**Root Cause Analysis:**

这不是“怪物真实属性在快速变化”，而是 React UI 把一个本来只应在战斗伤害结算时消费的随机 getter 暴露到了持续重渲染的信息面板。每次 React 因 battle tick、日志、HP、hover 或其他状态更新重渲染时，`mon.attack` 都重新掷一次，所以显示值会跳动。AS3 怪物信息面板不展示攻击值，因此玩家不会看到这个随机 getter 的副作用。

**Expected Behavior:** 怪物信息面板应匹配 AS3 可见内容，不展示会随机重算的攻击值；如保留扩展信息，也必须展示稳定的攻击范围 `min~max`，而不是读取 `mon.attack`。

**Forbidden Behavior:**

- 不允许在渲染路径直接读取 `mon.attack`。
- 不允许为了稳定 UI 去缓存或改写 `Monster.attack` 的战斗随机语义。
- 不允许让信息面板显示的攻击值与战斗日志中的实际随机攻击混为同一个概念。

**Repair Direction:** 优先按 AS3 UI parity 移除怪物面板里的攻击/防御/护甲/暴击扩展行，只保留 AS3 的 CP、HP、称号和 buff。若 Dear Master 仍希望保留现代化扩展信息，则单独标记 intentional UI extension，并把“攻击”改为稳定范围 `data.attack.min~data.attack.max`。

**Acceptance Tests:** `npm run assert:monster-info-display-parity` (new), `npm run assert:monster-data-integrity`, `npm run assert:monster-title-tooltip`, `npm run assert:battle-damage-log-death`, `npx tsc -b`.

**Manual Smoke:** 进入战斗，观察怪物信息面板 10 秒；怪物 HP 可变化，但不应看到攻击力单值快速闪动。

---

### `P1-COMBAT-POWER-EQUIPLESS-READOUT`

**Scope:** 当前“战斗力”显示无法表达装备后的真实压制力，导致玩家以 300 CP 轻松打 900+ CP 地图时觉得公式失真。

**Observed Symptom:** 玩家显示战斗力较低，但穿装备后实际输出、防御和击杀速度足以越级清地图；地图平均战斗力或怪物 CP 给出的风险感与实战感受脱节。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iGlobal/Player.as` (L170-L180): `Player.combatPower` 只使用 `basicStatus + skillStatus + apCost`，不包含 `equipStatus`。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as` (L118-L119): AS3 tooltip 明确说明“显示了你当前的基础战斗力，不包括装备的加成”。
- `reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as` (L253): 面板显示 `Player.combatPower`。
- `reference/as3/BOE-O/scripts/iData/Battle.as` (L145-L148): 击杀高 CP 怪物的称号逻辑使用 `monster.CP / Player.combatPower > 3`。
- `reference/as3/BOE-O/scripts/iData/iMonster/Monster.as`、`ShopPanel.as`、`GambleCell.as`: 掉落和商店价值也使用该基础战斗力。

**React Targets:**

- `src/core/models/Player.ts` (L90-L107): `getCombatPower()` 与 AS3 一致，只用 `basicStatus + skillStatus + apCost`。
- `src/components/panels/PlayerInfoPanel.tsx` (L101): 状态栏显示 `Math.floor(s.combatPower)`。
- `src/components/windows/HelpWindow.tsx` (L18): 帮助文案同样说明装备不影响战斗力。
- `src/core/models/Battle.ts` (L235): 高 CP 击杀称号逻辑使用 `monster.CP / getCombatPower(playerState) > 3`。

**Root Cause Analysis:**

当前 React 战斗力公式和 AS3 原公式一致；它本来就是“基础战斗力”，不是装备后实战总战力。装备会强烈影响 `attack/defence/protection` 等实战结果，却不会提高显示 CP。因此 300 CP 打 900+ 地图可能是 AS3 设计带来的可见语义问题，也可能是当前装备生成/伤害曲线让装备压制力过强。单独把 `getCombatPower()` 改成含装备会影响怪物名颜色、掉落价值、商店价格、称号触发等多条 AS3 规则，不能作为小修复直接做。

**Expected Behavior:** 先保留 AS3 基础 CP 的内部规则不变；若要改善玩家理解，应在 UI 上清楚区分“基础战力”和“装备后实战评估/推荐地图风险”。任何含装备的新指标必须是 intentional product override，并且不得偷偷替换 AS3 的 `combatPower` 语义。

**Forbidden Behavior:**

- 不允许直接把 `equipStatus` 加进 `getCombatPower()` 后仍称为 AS3 parity。
- 不允许改掉 `monster.CP / combatPower` 的称号、掉落、商店公式而没有专属 guard。
- 不允许只因为越级能打就认定 AS3 公式漂移。

**Decision Options:**

1. **Parity-first:** 继续显示基础 CP，但把标签/tooltip 改得更明确，例如“基础战力”，并在地图/怪物 UI 中说明装备可能让实战能力高于基础 CP。
2. **Product override:** 新增单独的“实战战力”或“装备后评估”显示，公式包含 `attMin/attMax/defence/protection/HP/MP`，但 AS3 `combatPower` 仍只供原规则使用。
3. **Formula audit:** 先复核装备生成和当前越级战斗样本，判断是否存在装备或伤害曲线漂移；若漂移成立，再开单独装备/战斗公式卡。

**Acceptance Tests:** `npm run assert:combat-power-readout-parity` (new), `npm run assert:stat-list`, `npm run assert:monster-reward`, `npm run assert:equipment-data`, `npm run assert:battle-damage-flat-output`, `npx tsc -b`.

**Manual Smoke:** 准备低基础 CP、高装备强度角色，打开角色状态、地图和怪物信息；确认 UI 不把基础 CP 误导成装备后总战力，并记录实际越级击杀样本给后续产品决策。

---

### `P1-EQUIP-TOOLTIP-BOUNDS`

**Scope:** 背包或商店 hover 装备时，装备详情浮窗过宽过大，遮挡大部分游戏区域，且可能超出游戏边框导致显示不完整。

**Observed Symptom:** 新出现的装备浮窗字体大、窗口大、遮挡严重；比较浮窗没有按游戏容器边界收纳，靠近边缘时可能越界。

**AS3 Source of Truth:**

- `reference/as3/BOE-O/scripts/iPanel/iCell/ItemInfoWindow.as` (L19-L24): `ItemInfoWindow` 文本宽度固定 130，并用 `super.draw(130, textHeight + 5)` 画边框。
- `reference/as3/BOE-O/scripts/iPanel/iCell/InfoWindow.as` (L15-L20): 浮窗有 1px 金色线框和 GlowFilter。
- `reference/as3/BOE-O/scripts/iPanel/iCell/EquipmentCell.as` (L145-L180): AS3 比较浮窗在当前装备存在时添加第二个 `ItemInfoWindow`，并按 `Global.stage.stageHeight` 修正纵向越界。
- `reference/as3/BOE-O/scripts/iPanel/iCell/StringInfoCell.as` (L36-L45): 文本提示会按 `Global.stage.stageWidth` 修正右侧越界。

**React Targets:**

- `src/components/common/InfoWindow.tsx` (L175-L229): `ItemInfoWindow` 使用 `panelWidth = 300`，比较模式总宽 `300 * 2 + 10`。
- `src/components/common/InfoWindow.tsx` (L184-L187): 只按 `window.innerWidth` 防右侧越界，未按游戏容器或舞台边界处理。
- `src/components/common/InfoWindow.tsx` (L188-L195): 面板有边框和阴影，但尺寸过大时视觉上会吞掉页面。
- `src/components/common/Common.tsx` (L382-L387): `EquipmentCell` hover 同时传 candidate 和 current equipped HTML，触发双面板。
- `scripts/assertEquipmentCompareTooltipParity.mjs`: 目前只保护双面板数据路径，不保护尺寸和边界。

**Root Cause Analysis:**

React 的共享装备浮窗为了可读性把 AS3 130px 宽度扩到了 300px；比较模式又并排渲染两个 300px 面板，实际占用 610px。它使用 `position: fixed` 并以浏览器窗口为边界，而不是 AS3 的 `Global.stage` / 当前游戏容器边界。因此在背包内部 hover 时，浮窗可能横跨大半页面、遮挡主 UI，靠近游戏边缘时还会被容器或窗口裁掉。

**Expected Behavior:** 装备浮窗应有 AS3 风格的明确边框、紧凑宽度和舞台边界约束；双面板比较可以保留，但必须在游戏容器内选择左/右/上下布局，必要时限制高度并内部滚动，不能遮挡大部分可操作区。

**Forbidden Behavior:**

- 不允许单个 `ItemInfoWindow` 固定 300px 且不受游戏容器约束。
- 不允许双面板比较直接占用 600px+ 宽度并超出舞台边界。
- 不允许只按 `window.innerWidth` 调整，而忽略 `.game-container` / `.main-scene` 边界。
- 不允许移除 AS3 金线边框和发光提示导致浮窗边界不可见。

**Repair Direction:**

1. 新增 `assert:item-info-window-bounds`，检查 AS3 130px baseline、React 受控宽度、边界 clamp、双面板布局和最大高度。
2. 将 `ItemInfoWindow` 的单面板宽度调整为接近 AS3 的紧凑值，或使用 `clamp(130px, ..., 180px)`。
3. 以游戏容器 DOMRect 作为边界，而不是只用 `window.innerWidth`；当右侧空间不足时向左翻转，当双面板空间不足时改为上下堆叠或隐藏比较面板的非关键扩展。
4. 增加 `maxHeight` 和 `overflowY: auto`，避免长装备描述越出游戏边框。

**Acceptance Tests:** `npm run assert:item-info-window-bounds` (new), `npm run assert:equipment-compare-tooltip`, `npm run assert:equip-window`, `npm run assert:common-cell`, `npx tsc -b`.

**Manual Smoke:** 打开背包和商店，分别 hover 普通装备、长描述装备、与当前装备同槽的候选装备；在游戏区域左侧、右侧、底部边缘测试，确认浮窗完整可见、有边界、不遮挡大部分主 UI，且移出鼠标后消失。

---

## English

### How To Use

This file turns the 2026-06-08 playtest findings into focused parity/product-boundary cards. Pick one ID per repair. Read the listed AS3 source first, add or confirm the smallest red guard, then make the minimal React change and run browser-visible smoke. Do not mix battle cadence, monster info display, combat-power wording, and equipment tooltip bounds in one runtime repair.

### Queue Summary

| ID | Priority | Type | Issue | Status | Suggested Guard |
| --- | --- | --- | --- | --- | --- |
| `P0-BATTLE-TEMPO-CADENCE` | P0 | AS3 parity + visible cadence | At normal speed, visible attack turns feel faster than AS3 | Needs repair | `assert:battle-tempo-cadence` |
| `P1-MONSTER-INFO-ATTACK-FLICKER` | P1 | AS3 UI parity | Enemy attack value flickers rapidly during battle | Needs repair | `assert:monster-info-display-parity` |
| `P1-COMBAT-POWER-EQUIPLESS-READOUT` | P1 | Product decision candidate | Displayed CP is base-only and does not reflect equipped combat strength | Needs product decision | `assert:combat-power-readout-parity` |
| `P1-EQUIP-TOOLTIP-BOUNDS` | P1 | AS3 UI parity | Equipment hover tooltip is too large and can escape the game frame | Needs repair | `assert:item-info-window-bounds` |

### Implementation Notes

- `P0-BATTLE-TEMPO-CADENCE`: AS3 uses a `Timer(500)` and one `fight()` per timer event. React still defaults to 500ms, but `useGameLoop` can synchronously catch up multiple due ticks after elapsed time exceeds one interval, which can create bursty visible combat.
- `P1-MONSTER-INFO-ATTACK-FLICKER`: AS3 `MonsterInfoPanel` does not display monster attack. React displays `Math.floor(mon.attack)`, but `Monster.attack` is a random getter, so the UI exposes a combat-only side effect.
- `P1-COMBAT-POWER-EQUIPLESS-READOUT`: AS3 and React both calculate CP without equipment. Treat any equipment-inclusive power display as a separate product override, not a replacement for AS3 `combatPower`.
- `P1-EQUIP-TOOLTIP-BOUNDS`: AS3 `ItemInfoWindow` is 130px wide with a drawn border and stage-edge adjustment. React currently uses 300px panes and browser-window bounds, so dual equipment comparison can occupy 610px and escape the game frame.
