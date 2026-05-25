# BWE Parity Verification Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current guarded AS3-to-React reconstruction into a repeatable verification and repair workflow that moves player-visible flows from `Guarded` to `Verified`.

**Architecture:** Use browser smoke and structured play sessions to discover parity gaps, then convert each confirmed gap into one AS3-first repair card. Repairs stay narrow: read the listed AS3 source, add or confirm a focused guard, apply the smallest React fix, run nearby acceptance checks, capture visible evidence, and update the manifest.

**Tech Stack:** React 18, TypeScript 5.6, Vite 6, Node parity scripts under `scripts/*.mjs`, AS3 source under `C:\Users\zero_\Desktop\bwe-r\BOE-O`, React target under `C:\Users\zero_\Desktop\bwe-r\BWE`.

---

## 中文执行说明

Dear Master 后续可以直接用这些编号派活：

```text
按 docs/superpowers/plans/2026-05-25-bwe-parity-verification-roadmap.md 执行 V1-START-BURN。
要求：先读计划列出的 AS3 和 parity card，只处理这一项，完成后报告 guard、tsc、浏览器 smoke 证据。
```

每次只执行一个编号。执行完成后，把该编号的结论更新到 `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`，如果发现新问题，先记录为 `V2-*` 或新 parity card，不顺手扩大修复范围。

## Plan Table / 计划总表

| ID | Phase | Purpose | Primary Source | Verification Gate | Done State |
| --- | --- | --- | --- | --- | --- |
| V0-BASELINE | Baseline | Confirm repo health before visible verification | `package.json`, `docs/ai/00-working-rules.md`, `docs/parity/manifest.md` | `npm run assert:source-encoding`, `npm run assert:text-resources`, `npx tsc -b` | Baseline commands are green or blockers are recorded |
| V1-START-BURN | Browser smoke | Verify creation, race, age, rebirth startup, starter skills, and initial save | `p0-start-character-age.md`, `p0-start-burn-save.md` | start/race guards, growth guard, equipment guard, browser screenshot | Manifest entry can move from `Guarded` toward `Verified` |
| V1-SAVE-LOAD | Browser smoke | Verify save write lifecycle, manual import, reload continuity, and active-slot autosave | `p0-save-persistence.md`, `p0-save-load-runtime-continuity.md` | save guards, map/monster adjacent guards, browser screenshot | Save/load flow survives real navigation and battle resume |
| V1-GAME-LOOP | Browser smoke | Verify 500ms heartbeat, elapsed catch-up, background recovery, and battle state continuity | `p0-game-loop-hook-parity.md`, `p0-battle-damage-log-death.md` | loop guard, battle state guards, browser background smoke | No tick rollback or missed visible battle progress |
| V1-MAP-DATA | Browser smoke | Verify map table, map selection UI, map model, monster pools, and pet pools | `p0-map-selection.md`, `p0-map-data-model-parity.md` | map guards, monster reward guard, browser screenshot | Map UI displays source-backed data and switches correctly |
| V1-SKILL | Browser smoke | Verify skill data, eligibility, equipment restrictions, battle effects, and skill window wiring | `p0-skill-data-values.md`, `p0-skill-eligibility-effects.md` | skill guards, growth guard, battle adjacent guards, browser screenshot | Skill UI and battle use the same AS3-backed rules |
| V1-EQUIPMENT | Browser smoke | Verify inventory/equipment ownership, EquipWindow behavior, item cells, sell action, and compare flow | `p0-equipment-ownership.md`, `p0-equipment-deepseek.md` | equipment guards, common-cell guard, browser screenshot | Equipment operations do not duplicate, lose, or desync items |
| V1-BATTLE | Browser smoke | Verify damage logs, death penalty, reward ownership, pet flow, numeric coercion, and active skill roll order | `p0-battle-damage-log-death.md`, battle formula cards | battle guards, text guard, browser screenshot | Player-visible battle flow matches guarded AS3 behavior |
| V1-SYSTEM-SHOP-PET | Browser smoke | Verify system toggles, shop stock lifecycle, pet window, title/other panels, scroll/effects/responsive layout | system/shop/pet/window parity cards and scripts | system/shop/pet/window guards, responsive smoke, browser screenshot | Secondary windows consume real state instead of rendering shells |
| V2-FREE-PLAY-CAPTURE | Discovery | Play freely and collect structured symptoms without immediate repair | Current app runtime | screenshot, reproduction path, console state, suspected card | Each symptom becomes one triaged audit note |
| V3-CARD-AUTHORING | Planning | Convert confirmed symptoms into executable repair cards | AS3 source and React target files for each symptom | new or updated `docs/parity/*.md` entry plus manifest row | Each new issue has AS3 truth, React targets, guard plan, smoke scenario |
| V4-FOCUSED-REPAIR | Repair | Execute one parity card at a time with red guard first | One named parity card | card assert, adjacent asserts, `npx tsc -b`, browser smoke | One focused commit-ready change per repaired behavior |
| V5-WEEKLY-REVIEW | Review | Recalculate status and choose next batch | `docs/parity/manifest.md`, git history, smoke evidence | manifest status audit and remaining risk list | Next week starts from a ranked, evidence-backed queue |

---

## Task V0-BASELINE: Baseline Health Check

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\ai\00-working-rules.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\package.json`
- Modify only if needed: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Confirm the active queue**

Run:

```powershell
Get-Content -LiteralPath 'C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md'
```

Expected: the manifest contains P0 rows with current `Guarded` or `Verified` states and the recommended next order.

- [ ] **Step 2: Run encoding and text guards**

Run:

```powershell
npm run assert:source-encoding
npm run assert:text-resources
```

Expected: both commands exit with code `0`.

- [ ] **Step 3: Run TypeScript verification**

Run:

```powershell
npx tsc -b
```

Expected: command exits with code `0`.

- [ ] **Step 4: Record baseline result**

If all commands pass, keep this plan unchanged and execute `V1-START-BURN` next. If a command fails, record the failing command, exact error, and affected file in the final report before choosing any repair task.

---

## Task V1-START-BURN: Creation, Age, Rebirth, Starter State

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-start-character-age.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-start-burn-save.md`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\RaceList.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iGlobal\Player.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\Main_fla\MainTimeline.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\MainScene.as`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\scenes\RaceScene.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\data\raceData.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Player.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\state\GameContext.tsx`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run focused guards**

Run:

```powershell
npm run assert:start-character-age
npm run assert:start-burn-save
npm run assert:growth-skill-protection
npm run assert:equipment-ownership
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Start the local app**

Run:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Expected: Vite serves the app at `http://127.0.0.1:5173/`.

- [ ] **Step 3: Browser smoke the visible flow**

Open `http://127.0.0.1:5173/`. Create a new character, choose race and age, enter the game, confirm starter equipment and starter skills are visible, then trigger the rebirth/startup path if the UI exposes it in the current build.

Expected evidence: screenshot of the selected character state after entry, visible starter skill/equipment state, and no console error that blocks gameplay.

- [ ] **Step 4: Update manifest status**

If guard and browser smoke pass, update `P0-START` and `P0-START-BURN` next step text in `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md` to reflect verified smoke evidence. If smoke fails, keep status `Guarded`, record the failing operation path, and create or request one focused repair card.

---

## Task V1-SAVE-LOAD: Save Persistence And Runtime Continuity

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-save-persistence.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-save-load-runtime-continuity.md`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iGlobal\Player.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\SaveScene.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\MainScene.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\Battle.as`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\systems\SaveSystem.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\state\GameContext.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\scenes\SaveScene.tsx`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run focused and adjacent guards**

Run:

```powershell
npm run assert:save-persistence
npm run assert:save-load-runtime-continuity
npm run assert:start-character-age
npm run assert:map-selection
npm run assert:monster-reward
npm run assert:system-window
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Browser smoke save and load**

Open `http://127.0.0.1:5173/`. Create or load a character, change a visible state such as map, equipment, or system option, save through the available UI, reload the page, load the same slot, and confirm battle resumes with the same visible player state.

Expected evidence: screenshot before reload, screenshot after reload, visible same slot/player/map state, and no console error that blocks loading.

- [ ] **Step 3: Decide outcome**

If state survives reload and battle resumes, update `P0-SAVE-PERSIST` and `P0-SAVELOAD` manifest rows. If any field resets or battle uses stale state, create one new card for that exact field or lifecycle edge.

---

## Task V1-GAME-LOOP: Heartbeat, Background Recovery, Battle Sync

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-game-loop-hook-parity.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-battle-damage-log-death.md`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\Battle.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\MainScene.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iGlobal\Player.as`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\systems\GameLoop.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\hooks\useGameLoop.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\scenes\MainScene.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\state\GameContext.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Battle.ts`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run heartbeat and battle guards**

Run:

```powershell
npm run assert:game-loop
npm run assert:battle-player-state
npm run assert:battle-damage-log-death
npm run assert:save-persistence
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Browser smoke foreground and background ticks**

Open `http://127.0.0.1:5173/`, enter battle, observe at least five visible log or HP changes, background the tab for at least ten seconds, foreground it, and confirm battle state advances without resetting player state.

Expected evidence: screenshot before backgrounding, screenshot after foregrounding, battle log still coherent, HP or reward state not rolled back.

- [ ] **Step 3: Decide outcome**

If background recovery and battle sync pass, update `P0-LOOP` and related `P0-BATTLE` next-step notes. If a state change reverts after tick, open one repair card around `GameContext.tsx`, `Battle.ts`, and `withBattlePlayer(...)`.

---

## Task V1-MAP-DATA: Map, Monster Pool, Pet Pool Visibility

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-map-selection.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-map-data-model-parity.md`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iMap\MapList.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iMap\MapData.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iMap\Map.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\iPanel\iWindow\iSystem\iMap\MapPanel.as`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\data\mapData.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Map.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\windows\MapWindow.tsx`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run map and monster guards**

Run:

```powershell
npm run assert:map-data
npm run assert:map-selection
npm run assert:monster-data-integrity
npm run assert:monster-reward
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Browser smoke map UI**

Open the map window, inspect the default selected map, switch to at least two other maps, confirm visible Chinese names, coordinates or descriptive fields, monster availability, and battle target change after selecting a new map.

Expected evidence: screenshot of default map, screenshot after map switch, battle or target area reflecting the selected map.

- [ ] **Step 3: Decide outcome**

If data and UI agree, update `P0-MAP` and `P0-MAP-DATA`. If presentation code hides or rewrites source-backed data, create one card for the display-layer mismatch.

---

## Task V1-SKILL: Skill Data, Eligibility, Equipment Restrictions, Battle Effects

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-skill-data-values.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-skill-eligibility-effects.md`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\iPanel\iWindow\SkillWindow.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iSkill\ActiveSkill.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iSkill\SkillDataList.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iGlobal\Player.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iItem\WeaponType.as`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\windows\SkillWindow.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\panels\BattleSkillPanel.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Skill.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Player.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Battle.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\data\skillData.ts`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run skill guards**

Run:

```powershell
npm run assert:skill-data-values
npm run assert:skill-window
npm run assert:skill-eligibility-effects
npm run assert:growth-skill-protection
npm run assert:battle-active-skill-single-roll
npm run assert:battle-damage-log-death
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Browser smoke skill window and battle effect**

Open the skill window, inspect active and passive skill lists, try equipping a skill that should be allowed, try a restriction-sensitive skill with an incompatible weapon, then observe battle logs or damage changes after an allowed active skill can trigger.

Expected evidence: screenshot of skill list, screenshot of allowed or rejected equip state, battle evidence that the equipped skill affects runtime behavior.

- [ ] **Step 3: Decide outcome**

If the UI and battle both consume the guarded skill rules, update `P0-SKILL` and `P0-SKILL-DATA`. If the UI allows invalid configuration or battle ignores equipped skills, create one repair card for the broken chain.

---

## Task V1-EQUIPMENT: Equipment Ownership, EquipWindow, Item Cells, Sell Flow

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-equipment-ownership.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-equipment-deepseek.md`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iGlobal\Player.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iItem\Equipment.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\iPanel\iWindow\EquipWindow.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\iPanel\iWindow\iEquip\EquipCell.as`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Player.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Equipment.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\windows\EquipWindow.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\common\Common.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\state\GameContext.tsx`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run equipment guards**

Run:

```powershell
npm run assert:equip-window
npm run assert:equipment-data
npm run assert:stat-list
npm run assert:equipment-ownership
npm run assert:equipment-api
npm run assert:weapon-load-category
npm run assert:weapon-quality-stat
npm run assert:common-cell
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Browser smoke inventory and equipment actions**

Open inventory and equipment windows, equip one item, unequip it, switch to another item in the same slot, inspect hover or info content, sell an inventory item when the UI exposes selling, and confirm item counts and money change without duplication.

Expected evidence: screenshot before equip, screenshot after switch or unequip, visible inventory count or equipment slot state, no duplicate item after the operation.

- [ ] **Step 3: Decide outcome**

If ownership and visible actions hold, update `P0-EQUIP`. If an action duplicates, loses, or desyncs an item, create one repair card using `Player.as`, `Equipment.as`, `Player.ts`, and `Equipment.ts` as the source boundary.

---

## Task V1-BATTLE: Battle Logs, Reward, Death, Pet Flow, Formula Drift

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-battle-damage-log-death.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-battle-numeric-coercion.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p1-battle-active-skill-single-roll.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p1-battle-pet-exp-reward.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p1-battle-pet-flow-logs.md`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\Battle.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iGlobal\Player.as`
- Read AS3: `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel\iScene\MainScene.as`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\core\models\Battle.ts`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\state\GameContext.tsx`
- Read React: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\scenes\MainScene.tsx`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run battle guard set**

Run:

```powershell
npm run assert:battle-player-state
npm run assert:monster-reward
npm run assert:battle-damage-log-death
npm run assert:battle-death-penalty
npm run assert:battle-numeric-coercion
npm run assert:battle-active-skill-single-roll
npm run assert:battle-pet-exp-reward
npm run assert:battle-pet-flow-logs
npm run assert:text-resources
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Browser smoke battle loop**

Enter battle, observe player damage logs, monster damage logs, skill or pet actions when available, reward settlement, and death penalty behavior if a safe reproducible scenario exists.

Expected evidence: screenshot of battle logs showing player damage and monster damage, screenshot after reward or death settlement, no missing interpolation placeholders such as `${...}` in visible text.

- [ ] **Step 3: Decide outcome**

If player-visible battle flow matches the guard expectations, update `P0-BATTLE` and battle formula card next-step notes. If a new drift appears, convert the smallest reproducible behavior into one card before editing battle code.

---

## Task V1-SYSTEM-SHOP-PET: Secondary Windows And Presentation Integrity

**Files:**
- Read relevant current cards under `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity`
- Read AS3 window sources under `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iPanel`
- Read React windows under `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\windows`
- Read React common UI: `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\common\Common.tsx`
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Run secondary-window guards**

Run:

```powershell
npm run assert:system-window
npm run assert:shop-window
npm run assert:pet-window
npm run assert:title-window
npm run assert:other-panel
npm run assert:other-window-children
npm run assert:item-window
npm run assert:scroll-panel
npm run assert:effects
npm run assert:responsive-layout
npm run smoke:responsive-layout
npx tsc -b
```

Expected: each command exits with code `0`.

- [ ] **Step 2: Browser smoke shell-risk windows**

Open System, Shop, Pet, Title, Other, Item, and related panels. Toggle options, inspect pet stats, inspect shop stock, scroll lists, and resize the browser once to a narrow viewport.

Expected evidence: screenshots of at least three high-risk windows, visible state changes after toggles or actions, no overlapping text in the narrow viewport.

- [ ] **Step 3: Decide outcome**

If windows consume real business state, record the smoke evidence in the final report and update matching manifest notes. If a window only renders static markup, create one card for that window and list the missing behavior chain.

---

## Task V2-FREE-PLAY-CAPTURE: Structured Free Play Discovery

**Files:**
- Read during triage: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`
- Create if symptoms are confirmed: one new file under `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity`
- Modify if new card is created: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Play without repairing**

Run the app through normal play for 30 to 60 minutes. Cover creation, battle, map changes, inventory, equipment, skills, save/load, shop, pet, and system toggles.

Expected evidence per symptom: reproduction path, actual result, expected AS3-shaped result if known, screenshot, console error if present, and whether it blocks progress.

- [ ] **Step 2: Classify each symptom**

Use these labels:

```text
Needs repair: player-visible parity bug exists.
Guard needed: behavior is known but executable coverage is missing.
Smoke failed: guard passes but browser-visible flow fails.
Question: AS3 behavior must be read before deciding.
Intentional divergence candidate: React differs from AS3 for player-safety reasons and needs explicit approval.
```

Expected: each captured symptom has exactly one label and one suspected module.

- [ ] **Step 3: Choose repair candidates**

Rank symptoms by this order: state loss, save/load breakage, battle blocker, equipment ownership bug, skill invalidity, map progression bug, text/log corruption, visual-only issue.

Expected: the next repair queue contains no more than five items and each item can become one focused card.

---

## Task V3-CARD-AUTHORING: Turn Symptoms Into Executable Repair Cards

**Files:**
- Create: one focused `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-*.md` or `p1-*.md` file per confirmed issue
- Modify: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`
- Read AS3: exact source files identified from `C:\Users\zero_\Desktop\bwe-r\BOE-O`
- Read React: exact target files identified from `C:\Users\zero_\Desktop\bwe-r\BWE\src`

- [ ] **Step 1: Read source before writing the card**

Use `rg` to locate the AS3 behavior and React target. The command must be generated from the concrete symptom being converted. For example, if the captured symptom is map selection, start with:

```powershell
rg "MapPanel|map|modifier|monsterList|petList" 'C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts'
rg "MapWindow|map|modifier|monsterList|petList" 'C:\Users\zero_\Desktop\bwe-r\BWE\src'
```

Expected: the final card lists real AS3 and React files that were inspected.

- [ ] **Step 2: Write the card with this structure**

Use this structure in the new card:

```markdown
# P0 Map Selection Display Drift

## Status

Needs repair

## Player-Visible Symptom

- Operation path:
- Actual result:
- Expected AS3 behavior:

## AS3 Source of Truth

- `C:\Users\zero_\Desktop\bwe-r\BOE-O\scripts\iData\iMap\MapList.as`

## React Targets

- `C:\Users\zero_\Desktop\bwe-r\BWE\src\components\windows\MapWindow.tsx`

## Guard Plan

- New or existing script:
- Red condition:
- Green condition:

## Acceptance Tests

```powershell
npm run assert:map-selection
npx tsc -b
```

## Manual Smoke Scenario

1. Open `http://127.0.0.1:5173/`.
2. Reproduce the operation path.
3. Capture screenshot evidence of the corrected visible behavior.
```

Expected: the card can be executed by another agent without reading chat history.

- [ ] **Step 3: Add the manifest row**

Update `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md` with one new row containing ID, priority, module, status, card, AS3 sources, React targets, symptom, and acceptance command.

Expected: the manifest row points to the new card and does not combine unrelated symptoms.

---

## Task V4-FOCUSED-REPAIR: Execute One Card With Guard First

**Files:**
- Read: one named card under `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity`
- Read AS3: files listed in that card
- Modify React: files listed in that card
- Modify scripts: one focused guard under `C:\Users\zero_\Desktop\bwe-r\BWE\scripts` only when the card lacks a reusable guard
- Modify after verification: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Re-read the card and AS3 source**

Run the exact card named by the user. For example, when the user asks to execute `p0-map-selection.md`, run:

```powershell
Get-Content -LiteralPath 'C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\p0-map-selection.md'
```

Expected: the task scope is exactly one card.

- [ ] **Step 2: Confirm or create the red guard**

Run the card's listed assert. If it already fails for the expected current behavior, keep the guard. If no guard exists, create one minimal script under `C:\Users\zero_\Desktop\bwe-r\BWE\scripts` and register it in `C:\Users\zero_\Desktop\bwe-r\BWE\package.json`.

Expected: the guard exposes the current parity bug before production code changes.

- [ ] **Step 3: Apply the smallest React fix**

Change only the React files listed by the card. Preserve AS3 constants, formula boundaries, ordering, and naming clues. Do not refactor unrelated modules.

Expected: the focused guard moves from failing to passing.

- [ ] **Step 4: Run the full card gate**

Run:

For example, when the active card is `p0-map-selection.md`, run:

```powershell
npm run assert:map-selection
npx tsc -b
```

Then run the adjacent asserts listed in that card.

Expected: all commands exit with code `0`.

- [ ] **Step 5: Browser smoke the corrected behavior**

Start the app with:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/`, execute the card's manual smoke scenario, and capture screenshot evidence.

Expected: the player-visible behavior matches the AS3-backed expectation.

- [ ] **Step 6: Update docs and prepare commit**

Update the manifest status and next-step text. Run:

```powershell
git diff --check
git status --short
```

Expected: `git diff --check` exits with code `0`, and `git status --short` shows only intentional files.

---

## Task V5-WEEKLY-REVIEW: Weekly Queue Reset

**Files:**
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`
- Read: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\superpowers\plans\2026-05-25-bwe-parity-verification-roadmap.md`
- Modify: `C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md`

- [ ] **Step 1: Count statuses**

Run:

```powershell
Select-String -LiteralPath 'C:\Users\zero_\Desktop\bwe-r\BWE\docs\parity\manifest.md' -Pattern 'Needs repair|Guard needed|Guarded|Verified'
```

Expected: the output shows every remaining manifest status line.

- [ ] **Step 2: Build next-week queue**

Choose up to five next actions in this order: failed smoke on a P0 flow, red guard, confirmed save/load or state ownership bug, confirmed battle blocker, shell-risk UI with missing business behavior.

Expected: next-week queue contains concrete card IDs or plan IDs such as `V1-SAVE-LOAD` or `p0-...md`.

- [ ] **Step 3: Confirm publish readiness if code changed**

Run:

```powershell
git diff --check
npx tsc -b
git status --short
```

Expected: formatting check and TypeScript pass, and git status is understandable before any commit or push request.

---

## English Usage Notes

Use this plan as the project steering document. Ask the agent to execute one ID at a time, for example:

```text
Execute V1-SKILL from docs/superpowers/plans/2026-05-25-bwe-parity-verification-roadmap.md.
Read AS3 first, keep the scope to that task, and report guard, TypeScript, and browser-smoke evidence.
```

The intended flow is:

1. Run `V0-BASELINE`.
2. Execute `V1-*` browser-smoke tasks until high-risk guarded rows become verified or produce new symptoms.
3. Use `V2-FREE-PLAY-CAPTURE` to discover player-visible issues without repairing immediately.
4. Use `V3-CARD-AUTHORING` to convert confirmed symptoms into executable parity cards.
5. Use `V4-FOCUSED-REPAIR` for one card at a time.
6. Use `V5-WEEKLY-REVIEW` to reset the queue and choose the next batch.

Self-review completed: the plan covers baseline verification, guarded P0 smoke, structured free play, card authoring, focused repair, and weekly review. The repair steps keep AS3 source reading, guard-first checks, browser evidence, and manifest updates explicit.
