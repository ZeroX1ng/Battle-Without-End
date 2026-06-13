# Changelog

## 0.2.5 - 2026-06-13

- 🆕 Monster info panel no longer displays the random flickering attack value; instead shows buff icons matching the AS3 original design.
- 🆕 Equipment tooltip panels now use AS3-adjacent 130-180px compact widths, clamp against game-container boundaries, support row/column adaptive compare layout, and scroll long descriptions internally.
- 🐞 Fixed battle tempo cadence — at 1x speed, foreground scheduling now emits at most one visible battle tick per pass.
- 🐞 Fixed pet module review findings — pet normal attack and Life Drain logs are now self-consistent; main-scene pet type label now displays correctly.
- 🐞 Fixed duplicate armor formula between pet skills and main battle; both now share `caculateProtection` from `Battle.ts`.
- 🐞 Fixed Burn/Poison DOT effects not correctly reducing live HP, with added DOT logs and kill settlement.
- 🐞 Fixed `balanceRandom(100)` division-by-zero edge case with explicit 0/100 handling.
- 🐞 Hardened battle runtime type contracts to prevent accidental numeric drift.
- ✅ Added 10 parity guards covering monster panel display, equipment tooltip bounds, DOT effects, battle tempo, numeric coercion, and battle state immutability.
- 🐞 Fixed auto-forge target semantic error: `getAutoForgeTarget` incorrectly treated AS3's absolute target level (e.g., BS 14+ auto-forges to +7 and stops) as a level gain (`currentLevel + 7`), causing +7 equipment with auto-enhance enabled to chain-forge up to +14 with ~92% cumulative destruction rate. After fix, equipment at +7 and above no longer incorrectly triggers auto-forge, fully restoring AS3 forging behavior.
- 🛠 Playtest debug controls (speed multiplier / one-hit-kill) are now only visible in dev (`npm run dev`); removed at compile time in release builds via `import.meta.env.PROD`.
- 📖 Updated parity manifest and playtest follow-up docs, marking multiple items as Verified.

## 0.2.4 - 2026-06-08

- 🐞 Fixed battle tempo cadence — foreground 1x speed limits to at most 1 visible tick per scheduler pass.
- 📖 Added 2026-06-08 playtest follow-up routing docs and parity cards.

## 0.2.3 - 2026-06-07

- 🐞 Fixed pet attack log consistency — normal attack and Life Drain logs now match AS3.
- 🐞 Fixed main-scene pet type label to correctly display pet types in Chinese locale.
- 🐞 Hardened battle runtime type contracts.

## 0.2.2 - 2026-06-06

- 🐞 Fixed Burn/Poison DOT not reducing live HP or generating logs, with correct DOT kill settlement.
- 🐞 Unified pet skill armor formula with the shared battle formula, eliminating duplicate implementation.
- 🐞 Fixed `balanceRandom(100)` division-by-zero edge case.
- ✅ Added battle core formula review guards covering numeric coercion, single-attack-skill random roll, pet EXP recalculation, and pet combat log flow.

## 0.2.1 - 2026-06-04

- 🐞 Fixed pet window selection — clicking a different pet now correctly switches the detail panel instead of flashing and reverting to the first pet.
- 🐞 Fixed player info panel display — attack range, primary stat basic values (parentheses / red-gold coloring), and crit multiplier percentage now match AS3 behavior.
- 🐞 Fixed drop auto-sell behavior when inventory is full — properly preserves bag value and matches AS3 gold amounts.
- 🆕 Added playtest one-hit toggle and speed controls (1x/10x/25x/50x) behind a temporary feature flag for debugging.
- 🐞 Fixed pet forge and battle log regression issues.
- 📖 Added battle formula code review parity cards (8 cards covering damage flatness, armor formula duplication, balanceRandom div-by-zero, taunt probability, and more).
- 📖 Added architecture review queue parity cards and guard gate CI workflow.
- 🛠 Expanded parity guard coverage across pet window, drop filter, player info, battle log, and architecture boundaries.
- 🛠 Released v0.2.1 desktop build artifacts.

## 0.2.0 - 2026-06-04

- 🛠 Released v0.2.0 desktop build artifacts.

## 0.1.1 - 2026-06-02

- 🐞 Fixed `DO_REBIRTH` losing equipment, inventory, gold, AP, pets, skills, equipped skills, and title progress after rebirth. Rebirth now recalculates only age, race, level, base stats, and derived stats, then writes the updated save.
- 🆕 Added the `assert:rebirth-soft-reset-player-state` guard and the `p0-rebirth-soft-reset-player-state.md` parity card to separate new-character initialization from rebirth soft-reset behavior.
- 🛠 Synced the 0.1.1 desktop build artifacts so the packaged entry points at the latest frontend bundle.
