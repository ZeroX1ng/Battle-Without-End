# Changelog

## 0.3.6 - 2026-06-21

- 💄 Equipment screen is tidier now — body and left-hand slots have proper spacing so icons no longer overlap.
- 💄 When you don't have a pet, the empty panel is replaced by a single subtle line of text, making the equipment screen much cleaner.
- 💄 Unequipping gear now shows stat changes in a multi-column layout — long stat lists no longer force you to scroll through a single narrow column.
- 💄 The loot tracker (monster/gear/gold counts) now aligns neatly with the battle log, no more drifting around.
- 🎮 Speed and invincibility controls are now hidden behind your character name — click the name to reveal a popup, keeping the main screen clutter-free.

## 0.3.5 - 2026-06-21

- 🆕 Equipment details moved below the character figure instead of crowding the far right of the screen. You can now scroll through all stats comfortably without fighting the tab bar for space.
- 🆕 You can now name your character! Pick an empty save slot → type a name → choose a race, and your name stays with you through saves and reloads.
- 🔧 Shop and gamble equipment generation has been reorganized behind the scenes. The current experience matches the original — future shop refresh tuning will be handled separately.

## 0.3.4 - 2026-06-20

- 💄 The right-side tab bar now lines up properly with the content window below — no more tabs sticking out wider than the panel.
- 🆕 The equipment screen now shows a character figure! Head, body, and hand gear appear right on the little person's body, way more satisfying than the old empty outlines.

## 0.3.3 - 2026-06-20

- 🐞 Fixed text becoming unreadable when the window is shrunk to minimum size (1280x720) — battle logs, stats, and buttons stay crisp and readable at any size.

## 0.3.2 - 2026-06-19

- 🐞 Fixed game graphics stretching and breaking on high-res screens (2K/4K) — the game now scales properly no matter how big or small your window is.
- 🐞 Fixed idle combat pausing when you minimize or cover the window — the game now keeps running in the background, so your character never stops grinding.

## 0.3.1 - 2026-06-18

- 🐞 Fixed residual internal `down` state on button deselection causing visual glitches — button state now resets correctly on deselection.
- 🐞 Fixed the selected equipment compare panel disappearing after switching equipment — the compare panel now remains pinned.
- 🐞 Fixed HelpWindow title text overflowing the container.
- 🛠 Tree-shake sprite assets at build time — unused sprites are now automatically removed, reducing bundle size.
- 🛠 Split map sprites into layered webp format with missing dynamic sprite key protection.

## 0.3.0 - 2026-06-14

- 🆕 Player info panel redesigned with AS3 three-column layout: race/age/LV/HP/MP/EXP/gold in column 0, primary attributes (STR/DEX/INT/WILL/LUCK/AP/CP) in column 1, combat stats (ATK/BAL/CRIT/CRIT-MUL/DEF/PROT/PROT-IGN) in column 2. All stat labels show AS3 tooltip descriptions on hover; HP/MP/EXP rendered as inline progress bars.
- 🆕 Map window redesigned with sprite-based markers (`map_icon`) and animated background (`map_mc`), replacing text-only map cards. Hovering a marker shows map name, difficulty tier, average CP, monster count, and modifier via infoWindow popup. Current map highlighted with orange drop-shadow glow.
- 🆕 Support displaying player title (`titleRealName`) in yellow before the player name in the info panel.
- 🆕 Overlay close button centralized: all windows (Equip, Help, Item, Map, Pet, Save, Shop, Skill, SpecialShop) now share a single `FlickerButton` rendered in the `MainScene` overlay. Each window's independent close button removed.
- 🐞 Equipment slot icons and window sprite icons now render via registered `SpriteImage` components instead of placeholder text or missing graphics.
- 🐞 Electron packaging now limits bundled locales to `zh-CN` and `en-US`, reducing installer size.
- 🛠 Visual polish: tab icons resized from 40×30 to 30×30; equipment slot icons enlarged from 56×56 to 64×64; removed `overflow: hidden` from icon container styles.

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
