# Changelog

## 0.1.1 - 2026-06-02

- 🐞 Fixed `DO_REBIRTH` losing equipment, inventory, gold, AP, pets, skills, equipped skills, and title progress after rebirth. Rebirth now recalculates only age, race, level, base stats, and derived stats, then writes the updated save.
- 🆕 Added the `assert:rebirth-soft-reset-player-state` guard and the `p0-rebirth-soft-reset-player-state.md` parity card to separate new-character initialization from rebirth soft-reset behavior.
- 🛠 Synced the 0.1.1 desktop build artifacts so the packaged entry points at the latest frontend bundle.
