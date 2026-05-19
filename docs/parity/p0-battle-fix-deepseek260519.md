# P0 Battle Fix — 2026-05-19 Deepseek 审阅修复清单

## 中文

### 审阅来源

- 审阅报告：`P0-BATTLE` 模块 AS3 ↔ React 逐行对比
- AS3 源：`../BOE-O/scripts/iData/Battle.as`
- React 目标：`src/core/models/Battle.ts`、`src/state/GameContext.tsx`、`src/components/scenes/MainScene.tsx`
- Parity 卡片：`p0-battle-damage-log-death.md`

---

### F7 🔴 致命：怪物攻击力天文数字（挂机后）

**严重程度**：致命

**根因**：[Monster.ts:L29-L32](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Monster.ts#L29-L32) — Monster 构造函数中 `this.data = { ...data }` 是浅拷贝。`data.attack` 嵌套对象 `{ min, max }` 与原数据共享引用。

当 `addTitleStat()` [Monster.ts:L50-L66](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Monster.ts#L50-L66) 修改 `this.data.attack.min = this.data.attack.min * sm.mul + sm.add` 时，由于 `this.data.attack` 就是原始数据的 `attack` 对象，**直接污染了全局怪物数据表**。

**复利效应**：每次生成一个带称号的怪物（20% 概率），会将该怪物类型的 `attack.min/max` 乘以称号倍率（如 "未知的" ×2+20）。下一次生成同类型怪物时，`attack` 已是放大后的值。带称号再乘一次，不带称号则保留当前放大值。挂机成百上千 tick 后，`attack` 呈指数级增长到达天文数字。

**受影响的属性**：`attack.min`、`attack.max`（共享嵌套对象）。`hp`、`defence` 等标量属性不受影响（浅拷贝已复制值）。

**修复方案**：在 Monster 构造函数中对 `data` 做深拷贝，确保嵌套对象 `attack` 独立：

```typescript
// Monster.ts L29-L32
constructor(data: MonsterData) {
  this.data = { ...data, attack: { ...data.attack } };
  this.generateTitle();
}
```

**验证**：连续生成 100 只同类型怪物后，`MonsterList[x].attack.min` 和 `MonsterList[x].attack.max` 不变。

---

### F1 🔴 致命：playerAttack() 没有战斗日志

**严重程度**：致命

**AS3 源**：[Battle.as:L540-L548](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L540-L548) — `MainScene.allInfoPanel.addText("你对" + monster.nameHtml + "造成了...伤害", ...)`

**React 代码**：[Battle.ts:L314-L341](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Battle.ts#L314-L341) — 只有 `this.monsterHp -= finalDamage`，**无日志**

**修复方案**：在 `playerAttack()` 末尾加 `emitLogs`，内容参考 AS3："你对XXX造成了<font color='#ff4040'>N</font>伤害"，暴击时字体加大。

---

### F2 🔴 致命：init() 没有遭遇怪物日志

**严重程度**：致命

**AS3 源**：[Battle.as:L80-L87](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L80-L87) — 怪物生成后输出 "你遇到了XXX!"，boss 带 title

**React 代码**：[Battle.ts:L92-L114](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Battle.ts#L92-L114) — `init()` 无任何日志

**修复方案**：在 `init()` 末尾加 `emitLogs`，输出 "你遇到了XXX!" 或 "你遇到了XXX [title]!"

---

### F3 🔴 致命：giveTrophy() 没有"被击败"日志

**严重程度**：致命

**AS3 源**：[Battle.as:L140](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L140) — `addText(monster.nameHtml + "<font color='#21c4af'>被击败了!</font>")`

**React 代码**：[Battle.ts:L160-L180](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Battle.ts#L160-L180) — 只有 exp/gold 日志，无击败提示

**修复方案**：在 `giveTrophy()` 开头加 `emitLogs([monster.nameHtml + "被击败了!"])`

---

### F4 🟠 重要：playerDie() 违规扣除经验值

**严重程度**：重要

**AS3 源**：[Battle.as:L133-L136](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L133-L136) — `playerDie()` **仅**输出日志 "你被击败了!"，**不扣 XP**

AS3 的 `Player.loseExp()` 存在但不在 `playerDie` 中调用

**React 代码**：[Battle.ts:L153-L158](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Battle.ts#L153-L158) — 调用 `loseExp(this.playerState)` 扣除了 `xp / 100` 经验

**修复方案**：删除 Battle.ts 中 `playerDie()` 的 `loseExp` 调用，仅保留日志

---

### F5 🟠 重要：giveTrophy() 经验/金币参数与 AS3 不一致

**严重程度**：重要，需进一步验证

**AS3 源**：[Battle.as:L141-L142](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L141-L142) — `Player.addExp(this.monster.exp)` 直接取 `monster.exp`（AS3 中 exp/money 是 getter，内部已含 modifier）

**React 代码**：[Battle.ts:L162-L168](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Battle.ts#L162-L168) — `this.monster.getExp(playerState, mapModifier)` 传入 modifier

**分析**：需验证 `Monster.getExp()` 内部公式 `(CP/combatPower + modifier) * CP * (1 + luck/300)` 与 AS3 `Monster.exp` getter 是否一致。如一致则无 bug，否则需修正。

**修复方案**：逐行对比 AS3 Monster.as 的 `get exp()` 与 React Monster.getExp()，确认公式完备后再决定是否修正。

---

### F6 🟡 一般：死亡日志可能重复

**严重程度**：一般

**说明**：[Battle.ts:L157](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Battle.ts#L157) 中 `emitLogs` 已发 "你被击败了！失去了 X 点经验..."，而 [GameContext.tsx:L458-L463](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/state/GameContext.tsx#L458-L463) 又追加了一条 "你在战斗中被击败，失去了部分经验..."

**修复方案**：修复 F4（删除 loseExp 调用）后，Battle 日志改为 "你被击败了!"（无经验文字）。GameContext 中 `playerDied` 分支可选择保留或删除（二选一，避免重复）。

---

### F8 🟡 一般：BATTLE_TICK 中直接 mutate state.battle

**严重程度**：一般（已有 clone 兜底，但违反 React reducer 约定）

**位置**：[GameContext.tsx:L394-L396](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/state/GameContext.tsx#L394-L396) — `b.config = state.config` 直接修改了 `state.battle` 的引用对象属性

**修复方案**：先用 `Object.create` clone 再设 config，或从 run() 返回前完成 config 设置

---

### F9 🟡 一般：result.loot 合并逻辑 mutate 旧对象

**严重程度**：一般

**位置**：[GameContext.tsx:L417-L422](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/state/GameContext.tsx#L417-L422) — `newState.loot[key] += result.loot[key]` 直接改写了展开后的 loot 引用，而该引用可能被其他引用共享

**修复方案**：先深拷贝 loot 再合并

---

### 修复顺序建议

1. **F7**（攻击力天文数字）— 最紧急，影响游戏可玩性
2. **F1-F3**（战斗日志缺失）— 所有 parity 卡片中核心痛点
3. **F4-F5**（死亡惩罚 / 经验公式）— 游戏体验偏差
4. **F6**（重复日志）— 修复 F4 时一并处理
5. **F8-F9**（reducer 规范）— 技术债务

---

### 验收方式

| 任务 | 现有 assert | 需要新增 |
|------|------------|---------|
| F7 | — | `assert:monster-data-immutable`：生成 100 只怪物后原数据 attack 不变 |
| F1-F3 | `assert:battle-player-state` | 扩展 `assert:battle-damage-log-death`：check 日志含 "你遇到了" / "被击败了" / "造成了" |
| F4 | — | `assert:battle-player-death`：死亡后 xp 不变 |
| F5 | `assert:monster-reward` | 需确认 exp/money 公式与 AS3 对标 |
| F6 | — | 无需单独 assert，修复后目视确认 |

---

### Manual Smoke Scenario

1. 新开游戏，挂机 50 个 tick，观察战斗日志是否显示 "你遇到了XXX!" → 玩家攻击伤害 → 怪物攻击伤害 → "被击败了!" → 经验/金币获取
2. 记录前 10 个怪物的攻击力，确认无递增趋势
3. 开新游戏，挂机 500+ tick，确认怪物攻击力不会暴涨
4. 等待玩家死亡一次，确认经验值不变
5. 每 60 tick 自动存档不报错

---

## English

### Review Source

- Review: `P0-BATTLE` module AS3 ↔ React comparison
- AS3 Source: `../BOE-O/scripts/iData/Battle.as`
- React Targets: `src/core/models/Battle.ts`, `src/state/GameContext.tsx`, `src/components/scenes/MainScene.tsx`
- Parity Card: `p0-battle-damage-log-death.md`

---

### F7 🔴 CRITICAL: Monster attack grows astronomically over time

**Root Cause**: [Monster.ts:L29-L32](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Monster.ts#L29-L32) — Monster constructor uses shallow copy `this.data = { ...data }`. The nested `data.attack` object `{ min, max }` shares reference with the original global data.

When `addTitleStat()` [Monster.ts:L50-L66](file:///c:/Users/zero_/Desktop/bwe-r/BWE/src/core/models/Monster.ts#L50-L66) modifies `this.data.attack.min = this.data.attack.min * mul + add`, it **mutates the global monster data table** because `this.data.attack` IS the original's `attack` object.

**Compounding effect**: Each titled monster (20% chance) multiplies that type's `attack.min/max` by the title multiplier (e.g., "Unknown" ×2+20). Next spawn starts with already-inflated values. Over hundreds of ticks, attack grows exponentially to astronomical numbers.

**Fix**: Deep-copy `attack` in Monster constructor:

```typescript
// Monster.ts L29-L32
constructor(data: MonsterData) {
  this.data = { ...data, attack: { ...data.attack } };
  this.generateTitle();
}
```

**Verification**: After generating 100 monsters of the same type, `MonsterList[x].attack.min/max` unchanged.

---

### F1 🔴 CRITICAL: playerAttack() has no battle log

**AS3**: [Battle.as:L540-L548](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L540-L548) — `addText("你对" + monster.nameHtml + "造成了...伤害", ...)`

**Fix**: Add `emitLogs` at end of `playerAttack()` matching AS3 text format.

---

### F2 🔴 CRITICAL: init() has no encounter log

**AS3**: [Battle.as:L80-L87](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L80-L87) — Outputs "你遇到了XXX!" after monster creation.

**Fix**: Add `emitLogs` at end of `init()`.

---

### F3 🔴 CRITICAL: giveTrophy() missing "defeated" log

**AS3**: [Battle.as:L140](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L140) — `addText(monster.nameHtml + "被击败了!")`

**Fix**: Add `emitLogs` at start of `giveTrophy()`.

---

### F4 🟠 IMPORTANT: playerDie() incorrectly deducts XP

**AS3**: [Battle.as:L133-L136](file:///c:/Users/zero_/Desktop/bwe-r/BOE-O/scripts/iData/Battle.as#L133-L136) — `playerDie()` only logs "你被击败了!", does NOT call `loseExp`.

**Fix**: Remove `loseExp()` call from `playerDie()` in Battle.ts, keep only the log.

---

### F5 🟠 IMPORTANT: giveTrophy() exp/gold params differ from AS3

AS3 passes raw `monster.exp` / `monster.money` (getters with internal modifier). React passes `mapModifier` explicitly. Verify formula equivalence.

---

### F6 🟡 MINOR: Duplicate death log

Both Battle.ts and GameContext.tsx emit death messages. After fixing F4, normalize to a single log source.

---

### F8-F9 🟡 MINOR: Reducer hygiene issues

- F8: Direct mutation of `b.config` in reducer
- F9: `newState.loot` reference shared with old state

---

### Fix Order

1. F7 (astronomical attack) — most urgent
2. F1-F3 (battle logs) — core parity pain points
3. F4-F5 (death penalty / exp formula)
4. F6 (duplicate log) — fix together with F4
5. F8-F9 (reducer hygiene) — tech debt
