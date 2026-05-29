# P0 Monster Data Integrity

Last updated: 2026-05-23

## 中文

### 当前状态

2026-05-23 复核：本卡已由 `npm run assert:monster-data-integrity` 守住。下面的 Original Symptom 和 Red Guard Contract 保留为回归说明；后续不应按原始症状重复修生产代码，除非 AS3 复核或 guard 重新变红。下一步只剩浏览器可见 smoke。

### 卡片范围

这张卡只处理怪物、怪物标题、宠物类型常量等静态数据完整性。不处理怪物奖励公式（见 `assert:monster-reward` 覆盖的卡片）、怪物实例标题生成时的数据不可变性（见 `assert:monster-data-immutable`），也不处理地图选择 UI；但修复后必须确认地图 `monsterList` 仍能解析到 AS3 怪物。

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterList.as` - 119 个怪物静态常量和 `list` 顺序。
- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterData.as` - `name`、`realName`、HP、attack、defence、protection、crit、balance、CP 字段顺序。
- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterTitleList.as` - 22 个怪物标题、`REGION_BOSS`、名称尾随空格和倍率。
- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterTitle.as` - title 数据结构。
- `reference/as3/BOE-O/scripts/iData/iMonster/StatMul.as` - title multiplier 结构。
- `reference/as3/BOE-O/scripts/iData/iPet/PetDataList.as` - 宠物数据及 `mc` 类型集合。
- `reference/as3/BOE-O/scripts/iData/iPet/PetTypeList.as` - AS3 宠物类型定义。
- `reference/as3/BOE-O/scripts/iData/iMap/MapList.as` - 地图 `monsterList` 对怪物常量的引用。

### React Targets

- `src/core/data/monsterData.ts` - `MonsterList`、`MonsterTitleList`、`REGION_BOSS_TITLE`、`getMonsterByName()`。
- `src/core/data/petData.ts` - `PetDataList`、`PetTypeList`、legacy id lookup。
- `src/core/data/mapData.ts` - 地图 `monsterList` 引用解析。
- `src/core/constants.ts` - `PetTypes` 常量。
- `src/core/types.ts` - `MonsterData`、`MonsterTitleData`、`PetData` 类型。
- `package.json` / `scripts/assertMonsterDataIntegrityParity.mjs` - 本卡新增或注册的 guard。

### Original Symptom

`MonsterList` 前 35 个条目是 React 自制怪物数据（如 `town_rat` 到 `desert_dragon_final`），AS3 中不存在。React 怪物总数为 155，而 AS3 只有 119 个。React 当前还把部分 AS3 常量名当作 `MonsterData.name` 使用；例如 AS3 常量是 `Brown_tailed_Mongoose`，但构造函数第一个参数即真实 `name` 是 `"Brown-tailed Mongoose"`。`PetTypes` 含 AS3 不存在的 `slime`。`MonsterTitleList` 中 `"努力的 "` 的尾随空格丢失。

### Red Guard Contract

修复代码前先新增并注册 `npm run assert:monster-data-integrity`。首次运行应至少暴露当前这些错误：

- `MonsterList.length` 应为 AS3 的 119，而不是 155。
- `MonsterList` 前 5 个名称应为 `Young_Raccoon`、`Young_Gray_Raccoon`、`Young_Brown_Fox`、`White_Spiderling`、`White_Spider`。
- AS3 不存在的自制怪物（例如 `town_rat`、`town_slime`、`desert_dragon_final`）不应出现在 `MonsterList`。
- AS3 `MonsterData.name` 必须逐字符保留，例如 `"Brown-tailed Mongoose"`、`"Giant_Sand_Worm"`。
- `MonsterTitleList` 必须保留 `"努力的 "` 的尾随空格。
- `PetTypes` 不应包含 AS3 不存在的 `slime`。
- 所有 `mapData.ts` 的 `monsterList` 引用必须能解析到 AS3 怪物；若需要保留 AS3 常量名作为查找键，应新增明确的 `legacyId` / `sourceKey`，不能继续把常量名塞进 `MonsterData.name`。

### Expected Behavior

- `MonsterList` 仅包含 AS3 `MonsterList.as` 中定义的 119 个静态常量，严格按 AS3 `list` 顺序排列。
- 每个怪物的 `name` 与 AS3 `MonsterData` 构造函数第一个参数逐字符一致，含空格、连字符、大小写和下划线。
- 每个怪物的 `realName` 与 AS3 第二个参数逐字符一致，含尾随空格。
- `MonsterTitleList` 22 个标题的顺序、名称、属性倍率与 AS3 完全一致。
- `REGION_BOSS_TITLE` 与 AS3 `MonsterTitleList.REGION_BOSS` 一致。
- `PetTypes` 严格来自 AS3 宠物数据 `mc` 字段去重集合。
- 删除自制怪物后，地图怪物池仍全部引用 AS3 怪物。

### Forbidden Behavior

- 在 `MonsterList` 中保留 AS3 不存在的怪物。
- 为了匹配 React 当前地图或 UI，重命名 AS3 怪物。
- 改变 AS3 `MonsterList` 中怪物的相对顺序。
- 删除、裁剪或 trim AS3 title / monster `realName` 的尾随空格。
- 在 `PetTypes` 中硬编码 AS3 不存在的宠物类型。
- 只修 guard 示例值而不完整迁移 119 个怪物和 22 个标题。

### State Ownership

- `monsterData.ts` 是怪物静态数据唯一来源；如需兼容 AS3 常量名查找，兼容字段必须显式命名为 `legacyId` / `sourceKey`。
- `monsterData.ts` 中的 `MonsterTitleList` / `REGION_BOSS_TITLE` 是标题数据唯一来源。
- `petData.ts` 是宠物静态数据唯一来源。
- `constants.ts` 的 `PetTypes` 必须反映真实宠物类型集合，不能独立扩展。
- `mapData.ts` 消费 `monsterData.ts` 的怪物引用，不拥有怪物定义。

### Acceptance Tests

- Needed: `npm run assert:monster-data-integrity`
- Adjacent: `npm run assert:monster-data-immutable`
- Adjacent: `npm run assert:monster-reward`
- Adjacent: `npm run assert:map-data`
- Encoding guard: `npm run assert:source-encoding`
- Always run: `npx tsc -b`

`assert:monster-data-integrity` 至少应覆盖：

- `MonsterList.length === 119`。
- `MonsterList` 名称顺序与 AS3 `MonsterList.list` 完全一致。
- 不存在 `town_rat`、`town_slime`、`desert_dragon_final` 等自制怪物。
- `getMonsterByName("Brown-tailed Mongoose")` 与 `getMonsterByName("Giant_Sand_Worm")` 返回非 `undefined`。
- 如新增 `legacyId` / `sourceKey`，`Brown_tailed_Mongoose` 应解析到 `name === "Brown-tailed Mongoose"` 的怪物。
- `MonsterTitleList.length === 22`，且包含名称 `"努力的 "`。
- `REGION_BOSS_TITLE` 与 AS3 REGION_BOSS 字段一致。
- `PetTypes` 不含 `"slime"`，且与 AS3 `PetDataList.mc` 去重集合一致。
- 每个地图 `monsterList` 引用都能解析到 `MonsterList` 中的怪物。

### Manual Smoke Scenario

1. 新开一局，进入任意地图战斗。
2. 确认不会遇到「小镇老鼠」「绿色史莱姆」「火龙」「混沌龙」等自制怪物。
3. 在多个地图间切换，确认怪物池均来自 AS3 原始怪物列表。
4. 查看怪物信息面板，确认 title + 怪物中文名显示没有被 trim 或改名。
5. 反复战斗 50+ 回合，抽查怪物标题随机生成正常，且标题格式保留 AS3 空格。

### 修复完成报告要求

- 列出实际读取的 AS3 静态表文件。
- 列出修改的 React/脚本文件。
- 说明 `assert:monster-data-integrity` 的 red/green 结果。
- 报告相邻 guard、编码 guard 与 `npx tsc -b` 结果。
- 明确是否完成浏览器可见 smoke；未做时说明环境限制。

## English

### Current Status

2026-05-23 review: this card is guarded by `npm run assert:monster-data-integrity`. The Original Symptom and Red Guard Contract below remain as regression context; do not repair production code from the old symptom unless AS3 review or the guard turns red again. The next step is browser-visible smoke only.

### Card Scope

This card only covers static data integrity for monsters, monster titles, and pet-type constants. It does not cover monster reward formulas (`assert:monster-reward`), immutable monster instance title generation (`assert:monster-data-immutable`), or map-selection UI. After repair, however, every map `monsterList` reference must still resolve to an AS3 monster.

### AS3 Source of Truth

- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterList.as` - 119 monster constants and `list` order.
- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterData.as` - `name`, `realName`, HP, attack, defence, protection, crit, balance, and CP field order.
- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterTitleList.as` - 22 monster titles, `REGION_BOSS`, trailing spaces, and multipliers.
- `reference/as3/BOE-O/scripts/iData/iMonster/MonsterTitle.as` - title data structure.
- `reference/as3/BOE-O/scripts/iData/iMonster/StatMul.as` - title multiplier structure.
- `reference/as3/BOE-O/scripts/iData/iPet/PetDataList.as` - pet data and `mc` type set.
- `reference/as3/BOE-O/scripts/iData/iPet/PetTypeList.as` - AS3 pet-type definitions.
- `reference/as3/BOE-O/scripts/iData/iMap/MapList.as` - map `monsterList` references to monster constants.

### React Targets

- `src/core/data/monsterData.ts` - `MonsterList`, `MonsterTitleList`, `REGION_BOSS_TITLE`, and `getMonsterByName()`.
- `src/core/data/petData.ts` - `PetDataList`, `PetTypeList`, and legacy id lookup.
- `src/core/data/mapData.ts` - map `monsterList` reference resolution.
- `src/core/constants.ts` - `PetTypes` constant.
- `src/core/types.ts` - `MonsterData`, `MonsterTitleData`, and `PetData` types.
- `package.json` / `scripts/assertMonsterDataIntegrityParity.mjs` - guard registration for this card.

### Original Symptom

The first 35 entries in `MonsterList` are fabricated React monsters, such as `town_rat` through `desert_dragon_final`, that do not exist in AS3. React has 155 monsters while AS3 has 119. React also currently uses some AS3 constant names as `MonsterData.name`; for example, the AS3 constant is `Brown_tailed_Mongoose`, but the constructor's first argument and real `name` is `"Brown-tailed Mongoose"`. `PetTypes` contains the non-AS3 `slime` type. `MonsterTitleList` loses the trailing space in `"努力的 "`.

### Red Guard Contract

Before production edits, add and register `npm run assert:monster-data-integrity`. Its first run should expose at least these failures:

- `MonsterList.length` should be AS3's 119, not 155.
- The first five `MonsterList` names should be `Young_Raccoon`, `Young_Gray_Raccoon`, `Young_Brown_Fox`, `White_Spiderling`, `White_Spider`.
- Non-AS3 fabricated monsters such as `town_rat`, `town_slime`, and `desert_dragon_final` should not appear.
- AS3 `MonsterData.name` values must be preserved character-for-character, such as `"Brown-tailed Mongoose"` and `"Giant_Sand_Worm"`.
- `MonsterTitleList` must preserve the trailing space in `"努力的 "`.
- `PetTypes` must not contain non-AS3 `slime`.
- Every `mapData.ts` `monsterList` reference must resolve to an AS3 monster. If AS3 constant names are needed as lookup keys, add an explicit `legacyId` / `sourceKey` instead of continuing to store constant names in `MonsterData.name`.

### Expected Behavior

- `MonsterList` contains only the 119 static constants from AS3 `MonsterList.as`, in exact AS3 `list` order.
- Every monster `name` matches AS3 `MonsterData` constructor parameter 1 character-for-character, including spaces, hyphens, casing, and underscores.
- Every monster `realName` matches AS3 parameter 2 character-for-character, including trailing spaces.
- The 22 `MonsterTitleList` entries match AS3 order, names, stat multipliers, and trailing spaces.
- `REGION_BOSS_TITLE` matches AS3 `MonsterTitleList.REGION_BOSS`.
- `PetTypes` derives strictly from the deduplicated `mc` fields in AS3 pet data.
- After fabricated monsters are removed, every map monster pool still references AS3 monsters.

### Forbidden Behavior

- Keeping non-AS3 monsters in `MonsterList`.
- Renaming AS3 monsters to match current React maps or UI expectations.
- Changing relative order in AS3 `MonsterList`.
- Trimming or deleting trailing spaces from AS3 title or monster `realName` strings.
- Hardcoding pet types that do not exist in AS3.
- Fixing only guard sample values instead of fully migrating all 119 monsters and 22 titles.

### State Ownership

- `monsterData.ts` is the single source for monster static data. If AS3 constant-name lookup compatibility is needed, the compatibility field must be explicitly named `legacyId` / `sourceKey`.
- `monsterData.ts` `MonsterTitleList` / `REGION_BOSS_TITLE` are the single source for title data.
- `petData.ts` is the single source for pet static data.
- `constants.ts` `PetTypes` must reflect real pet types and cannot independently add new ones.
- `mapData.ts` consumes monster references from `monsterData.ts` and does not own monster definitions.

### Acceptance Tests

- Needed: `npm run assert:monster-data-integrity`
- Adjacent: `npm run assert:monster-data-immutable`
- Adjacent: `npm run assert:monster-reward`
- Adjacent: `npm run assert:map-data`
- Encoding guard: `npm run assert:source-encoding`
- Always run: `npx tsc -b`

`assert:monster-data-integrity` should cover at least:

- `MonsterList.length === 119`.
- `MonsterList` name order exactly matches AS3 `MonsterList.list`.
- Fabricated monsters such as `town_rat`, `town_slime`, and `desert_dragon_final` are absent.
- `getMonsterByName("Brown-tailed Mongoose")` and `getMonsterByName("Giant_Sand_Worm")` return non-`undefined`.
- If `legacyId` / `sourceKey` is added, `Brown_tailed_Mongoose` resolves to the monster with `name === "Brown-tailed Mongoose"`.
- `MonsterTitleList.length === 22` and contains name `"努力的 "`.
- `REGION_BOSS_TITLE` matches the AS3 REGION_BOSS fields.
- `PetTypes` excludes `"slime"` and matches the deduplicated AS3 `PetDataList.mc` set.
- Every map `monsterList` reference resolves to a monster in `MonsterList`.

### Manual Smoke Scenario

1. Start a new game and enter battle on any map.
2. Confirm fabricated monsters such as Town Rat, Green Slime, Fire Dragon, or Chaos Dragon do not appear.
3. Switch between several maps and confirm each monster pool comes from the AS3 original monster list.
4. Inspect the monster info panel and confirm title plus Chinese monster name display was not trimmed or renamed.
5. Fight 50+ rounds and spot-check random title generation, including AS3 spacing in title format.

### Completion Report Requirements

- List the AS3 static table files actually read.
- List React/script files changed.
- Report the `assert:monster-data-integrity` red/green result.
- Report adjacent guards, encoding guard, and `npx tsc -b`.
- State whether browser-visible smoke was performed; if not, explain the environment limit.
