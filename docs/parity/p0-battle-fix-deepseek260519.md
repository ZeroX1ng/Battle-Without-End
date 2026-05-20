# Battle Follow-up Review Queue

Last updated: 2026-05-20

## 中文

### 使用方式

这不是新的 P0 parity 卡片。主卡仍是 `p0-battle-damage-log-death.md`。

本文件只保留 DeepSeek 审阅中值得后续复核的短队列。每次最多选一个条目处理；处理前必须先读 AS3，确认 guard 红/绿，再改实现。

### 当前结论

- P0-BATTLE 主问题已由 `assert:battle-damage-log-death` 守住。
- 后续重点应从“修战斗卡片”转为“审阅战斗周边风险”：怪物数据不可变、日志完整度、死亡惩罚、reducer 纯度。
- 本文件中的条目不是已确认事实；每个条目都需要 AS3 证据和可执行 guard。

### Review Queue

| ID | 优先级 | 主题 | 可能影响 | 先读 AS3 | React 目标 | 验收 |
| --- | --- | --- | --- | --- | --- | --- |
| B-R1 | P0 | Monster 构造浅拷贝可能污染全局 `attack` | 长时间挂机后怪物攻击可能指数增长 | `Monster.as`, `MonsterTitle.as`, `Battle.as` | `src/core/models/Monster.ts`, `src/core/data/monsterData.ts` | 新增 `assert:monster-data-immutable` |
| B-R2 | P1 | 玩家攻击、遭遇、怪物击败日志完整度 | 日志不完整会让玩家误判战斗过程 | `Battle.as`, `MainScene.as` | `src/core/models/Battle.ts` | 扩展 `assert:battle-damage-log-death` 或新增 `assert:battle-log-sequence` |
| B-R3 | P1 | 玩家死亡是否应扣经验 | 若与 AS3 不同，会改变失败成本 | `Battle.as`, `Player.as` | `src/core/models/Battle.ts`, `src/state/GameContext.tsx` | 新增 `assert:battle-death-penalty` |
| B-R4 | P2 | `BATTLE_TICK` reducer 里直接修改 battle 对象 | React 状态纯度和未来调试风险 | 无 AS3；属于 React 架构审阅 | `src/state/GameContext.tsx` | `assert:battle-player-state` + `npx tsc -b` |
| B-R5 | P2 | loot 合并对象引用安全 | 战利品累计可能受共享引用影响 | 无 AS3；属于 React 架构审阅 | `src/state/GameContext.tsx` | 现有 loot/奖励 guard + focused unit assertion |

### 推荐对话模板

```text
请按 docs/ai/00-working-rules.md 工作。

本次只审阅并修复：
docs/parity/p0-battle-fix-deepseek260519.md 的 B-R1。

要求：
1. 先读表格列出的 AS3 文件。
2. 判断 DeepSeek 结论是否成立，不成立就只更新文档并说明。
3. 若成立，先新增或扩展 guard，确认能覆盖该问题。
4. 只改最小 React 目标文件。
5. 跑对应 guard、相邻 battle guard、npx tsc -b。
6. 最后报告 AS3 证据、改动文件、验证结果。
```

### 不要这样做

- 不要把 B-R1 到 B-R5 一次性全修。
- 不要照抄 DeepSeek 的修复方案；必须先验证 AS3 和当前 React。
- 不要为了 reducer 纯度顺手重构整个 `GameContext.tsx`。
- 不要把中文日志 exact string 当唯一验收；反编译文本可能有编码噪音，优先用事件结构和关键片段。

## English

### How To Use

This is not a new P0 parity card. The primary card remains `p0-battle-damage-log-death.md`.

This file is a compact follow-up review queue distilled from a DeepSeek review. Pick at most one item per session. Read AS3, confirm a guard, then make the smallest repair.

### Current Conclusion

- The main P0-BATTLE issue is guarded by `assert:battle-damage-log-death`.
- Future work should focus on battle-adjacent review risks: immutable monster data, log completeness, death penalty, and reducer purity.
- Items here are not confirmed facts; each one needs AS3 evidence and executable coverage.

### Review Queue

| ID | Priority | Topic | Potential Impact | Read AS3 First | React Targets | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| B-R1 | P0 | Monster shallow copy may mutate global `attack` | Monster attack may grow exponentially during long idle play | `Monster.as`, `MonsterTitle.as`, `Battle.as` | `src/core/models/Monster.ts`, `src/core/data/monsterData.ts` | Add `assert:monster-data-immutable` |
| B-R2 | P1 | Encounter, player attack, and defeated log completeness | Missing logs obscure battle flow | `Battle.as`, `MainScene.as` | `src/core/models/Battle.ts` | Extend `assert:battle-damage-log-death` or add `assert:battle-log-sequence` |
| B-R3 | P1 | Whether player death should deduct exp | Failure cost may differ from AS3 | `Battle.as`, `Player.as` | `src/core/models/Battle.ts`, `src/state/GameContext.tsx` | Add `assert:battle-death-penalty` |
| B-R4 | P2 | Direct battle object mutation inside `BATTLE_TICK` | React state purity and debugging risk | No AS3; React architecture review | `src/state/GameContext.tsx` | `assert:battle-player-state` + `npx tsc -b` |
| B-R5 | P2 | Loot merge reference safety | Loot counters may be affected by shared references | No AS3; React architecture review | `src/state/GameContext.tsx` | Existing reward guards + focused unit assertion |

### Recommended Prompt

```text
Follow docs/ai/00-working-rules.md.

This session only reviews and fixes:
B-R1 from docs/parity/p0-battle-fix-deepseek260519.md.

Requirements:
1. Read the AS3 files listed in the row first.
2. Verify whether the DeepSeek finding is true; if false, only update docs and explain.
3. If true, add or extend a guard before implementation.
4. Change only the minimal React target files.
5. Run the focused guard, nearby battle guard, and npx tsc -b.
6. Report AS3 evidence, changed files, and verification results.
```

### Do Not

- Do not fix B-R1 through B-R5 in one pass.
- Do not copy DeepSeek's proposed fix without AS3 and current React verification.
- Do not refactor all of `GameContext.tsx` for reducer hygiene.
- Do not rely only on exact localized strings; decompiled text can be noisy, so prefer event structure and stable fragments.
