# Equipment Follow-up Review Queue

Last updated: 2026-05-20

## 中文

### 使用方式

这不是新的 P0 parity 卡片。主卡仍是 `p0-equipment-ownership.md`。

本文件只保留 DeepSeek 审阅中值得后续复核的短队列。每次最多选一个条目处理；处理前必须先读 AS3，确认当前 React 是否仍有问题，再补 guard。

### 当前结论

- P0-EQUIP 主问题已由 `assert:equipment-ownership` 守住。
- E-R1 已由 `assert:weapon-load-category` 守住：`Equipment.load()` 读回武器后保留 `category`，远程攻击加成继续生效。
- E-R2 已由 `assert:weapon-quality-stat` 守住：新生成武器的品质属性池可以随机到 AS3 `StatList` 末尾的 `balance`。
- E-R3 已由 `assert:quality-color` 守住：`QualityColor` 的品质 1-5 与 AS3 `Equipment` 静态颜色一致，装备槽颜色不再与 `getNameHTML()` 分叉。
- E-R4 已由 `assert:equipment-api` 守住：`Equipment` 补齐 AS3 `getColor()`、`getColorInHex()`、`getSellDesciption()` API，出售描述使用出售价格。
- E-R5 已由 `assert:equip-window` 复核：AS3 `EquipWindow` 本身包含宠物图标、宠物属性和宠物技能区；当前不拆分，不作为装备所有权 bug 处理。
- E-R6 已由 `assert:equipment-ownership` 守住并记录为 intentional divergence：AS3 `Player.unequip()` 在 `addItem()` 因满包失败后仍会清空装备槽，React 拒绝满包卸下/外部替换以避免静默丢装；背包内替换会先移出新装备再放回旧装备，保持容量不超限。
- 后续工作不应再围绕“装备复制”展开，而应转为装备子系统审阅：存档加载、武器品质属性池、颜色 API、出售描述、窗口职责。
- 部分 DeepSeek 结论可能已经被后续修复覆盖；执行前必须重新检查当前代码。

### Review Queue

| ID | 优先级 | 主题 | 可能影响 | 先读 AS3 | React 目标 | 验收 |
| --- | --- | --- | --- | --- | --- | --- |
| E-R1 | P0 | `Equipment.load()` 是否保留武器 `category` | 读档后远程/近战判断、攻击加成、技能过滤可能错误 | `Equipment.as`, `Weapon.as`, `Player.as` | `src/core/models/Equipment.ts`, `src/core/models/Player.ts` | 已守住：`assert:weapon-load-category` |
| E-R2 | P0 | 武器品质属性池是否能随机到 `balance` | 新生成武器少一种 AS3 属性结果 | `Equipment.as`, `Weapon.as`, `StatList.as` | `src/core/models/Equipment.ts`, `src/core/data/equipmentData.ts` | 已守住：`assert:weapon-quality-stat` |
| E-R3 | P1 | `QualityColor` 是否与 AS3 品质颜色一致 | 装备槽颜色和描述颜色不一致 | `Equipment.as` | `src/core/constants.ts`, `src/core/models/Equipment.ts` | 已守住：`assert:quality-color` |
| E-R4 | P2 | `getColor()` / `getColorInHex()` / `getSellDesciption()` 是否需要补齐 | 商店/出售弹窗描述和 AS3 API 不完整 | `Equipment.as` | `src/core/models/Equipment.ts` | 已守住：`assert:equipment-api` |
| E-R5 | P2 | `EquipWindow` 混入宠物信息是否要拆分 | AS3 原作混入宠物信息；当前不拆分，不是装备所有权 bug | `EquipWindow.as`, Pet 相关窗口 | `src/components/windows/EquipWindow.tsx` | 已复核：`assert:equip-window` |
| E-R6 | Note | 背包满时拒绝卸下/替换装备 | React 有意避免 AS3 满包卸下静默丢装；背包内替换保持容量不超限，外部替换满包时拒绝 | `Player.as` | `src/core/models/Player.ts` | 已守住：`assert:equipment-ownership`；intentional divergence |

### 推荐对话模板

```text
请按 docs/ai/00-working-rules.md 工作。

本次只审阅并修复：
docs/parity/p0-equipment-deepseek.md 的 E-R1。

要求：
1. 先读该行列出的 AS3 文件。
2. 检查当前 React 是否仍有这个问题，不要相信旧报告。
3. 若问题存在，先新增 guard；若已修复，只补/确认 guard 和文档状态。
4. 不要改装备复制、技能、地图或 UI 外观等无关内容。
5. 跑对应 guard、assert:equipment-ownership、npx tsc -b。
6. 最后报告 AS3 证据、改动文件、验证结果。
```

### 不要这样做

- 不要把 E-R1 到 E-R6 一次性全修。
- 不要把“AS3 自身会丢装备”的行为强行复刻；这类差异要先标成 intentional divergence，再由 Dear Master 决定。
- 不要把 `EquipWindow` 拆分当作 P0；它是后续重构候选。
- 不要为了颜色或出售描述重写整个装备模型。

## English

### How To Use

This is not a new P0 parity card. The primary card remains `p0-equipment-ownership.md`.

This file is a compact follow-up review queue distilled from a DeepSeek review. Pick at most one item per session. Read AS3, verify whether current React still has the problem, then add a guard.

### Current Conclusion

- The main P0-EQUIP issue is guarded by `assert:equipment-ownership`.
- E-R1 is guarded by `assert:weapon-load-category`: weapons loaded through `Equipment.load()` preserve `category`, so the ranged attack bonus remains active.
- E-R2 is guarded by `assert:weapon-quality-stat`: newly generated weapons can roll the AS3 `balance` entry at the end of `StatList`.
- E-R3 is guarded by `assert:quality-color`: `QualityColor` entries 1-5 match the AS3 `Equipment` static colors, so slot colors no longer diverge from `getNameHTML()`.
- E-R4 is guarded by `assert:equipment-api`: `Equipment` now carries the AS3 `getColor()`, `getColorInHex()`, and `getSellDesciption()` API, with sell descriptions using the sell price.
- E-R5 is confirmed by `assert:equip-window`: AS3 `EquipWindow` itself contains the pet icon, pet stats, and pet skill area; do not split it by default or treat it as an equipment ownership bug.
- E-R6 is guarded by `assert:equipment-ownership` and documented as an intentional divergence: AS3 `Player.unequip()` clears the slot even when `addItem()` fails because the bag is full, while React rejects full-bag unequip/external replacement to avoid silent item loss; replacement from the bag first removes the incoming item, then returns the old item without exceeding capacity.
- Future work should move from equipment duplication to subsystem review: save/load, weapon quality stat pools, color APIs, sell descriptions, and window responsibilities.
- Some DeepSeek findings may already be fixed; always inspect current code first.

### Review Queue

| ID | Priority | Topic | Potential Impact | Read AS3 First | React Targets | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| E-R1 | P0 | Whether `Equipment.load()` preserves weapon `category` | Ranged/melee checks, attack bonus, and skill filtering may break after load | `Equipment.as`, `Weapon.as`, `Player.as` | `src/core/models/Equipment.ts`, `src/core/models/Player.ts` | Guarded: `assert:weapon-load-category` |
| E-R2 | P0 | Whether weapon quality stat pool can roll `balance` | Newly generated weapons may miss one AS3 stat outcome | `Equipment.as`, `Weapon.as`, `StatList.as` | `src/core/models/Equipment.ts`, `src/core/data/equipmentData.ts` | Guarded: `assert:weapon-quality-stat` |
| E-R3 | P1 | Whether `QualityColor` matches AS3 quality colors | Slot color and description color may diverge | `Equipment.as` | `src/core/constants.ts`, `src/core/models/Equipment.ts` | Guarded: `assert:quality-color` |
| E-R4 | P2 | Whether `getColor()`, `getColorInHex()`, and `getSellDesciption()` are needed | Shop/sell descriptions and AS3 API parity may be incomplete | `Equipment.as` | `src/core/models/Equipment.ts` | Guarded: `assert:equipment-api` |
| E-R5 | P2 | Whether pet info should be split out of `EquipWindow` | AS3 keeps pet info inside `EquipWindow`; do not split by default or treat it as ownership bug | `EquipWindow.as`, pet windows | `src/components/windows/EquipWindow.tsx` | Confirmed: `assert:equip-window` |
| E-R6 | Note | Rejecting unequip/replace when bag is full | React intentionally avoids AS3 silent item loss on full-bag unequip; in-bag replacement stays within capacity, while external replacement is rejected when the bag is full | `Player.as` | `src/core/models/Player.ts` | Guarded: `assert:equipment-ownership`; intentional divergence |

### Recommended Prompt

```text
Follow docs/ai/00-working-rules.md.

This session only reviews and fixes:
E-R1 from docs/parity/p0-equipment-deepseek.md.

Requirements:
1. Read the AS3 files listed in that row first.
2. Check whether current React still has this problem; do not trust the old report blindly.
3. If it exists, add a guard first; if already fixed, only confirm guard/doc status.
4. Do not touch equipment duplication, skills, maps, or visual polish.
5. Run the focused guard, assert:equipment-ownership, and npx tsc -b.
6. Report AS3 evidence, changed files, and verification results.
```

### Do Not

- Do not fix E-R1 through E-R6 in one pass.
- Do not blindly reproduce AS3 item-loss behavior; mark such differences as intentional divergence first, then ask Dear Master.
- Do not treat `EquipWindow` splitting as P0; it is a later refactor candidate.
- Do not rewrite the whole equipment model for colors or sell descriptions.
