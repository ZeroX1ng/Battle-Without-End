# Changelog

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
