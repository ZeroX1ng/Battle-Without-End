import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const SAVE_COMPATIBILITY_WARNING = '现在我的修复会对存档造成不可逆的损伤，然后分析如何修复';

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

const packageJson = JSON.parse(read('package.json'));
const common = read('src/components/common/Common.tsx');
const otherPanel = read('src/components/panels/OtherPanel.tsx');
const titleWindow = read('src/components/panels/TitleWindow.tsx');
const otherWindow = read('src/components/windows/OtherWindow.tsx');
const equipWindow = read('src/components/windows/EquipWindow.tsx');
const shopWindow = read('src/components/windows/ShopWindow.tsx');
const specialShopWindow = read('src/components/windows/SpecialShopWindow.tsx');
const monsterInfoPanel = read('src/components/panels/MonsterInfoPanel.tsx');
const saveSystem = read('src/core/systems/SaveSystem.ts');
const saveScene = read('src/components/scenes/SaveScene.tsx');
const saveWindow = read('src/components/windows/SaveWindow.tsx');
const mainSceneCss = read('src/styles/main-scene.css');

assert(
  packageJson.scripts?.['assert:visible-ui-followups'] === 'node scripts/assertVisibleUiFollowups.mjs',
  'package.json must expose assert:visible-ui-followups',
);
assert(
  packageJson.scripts?.['assert:save-compatibility'] === 'node scripts/assertSaveCompatibility.mjs',
  'package.json must expose assert:save-compatibility so save-risk checks fail red instead of warning only',
);

assertIncludes(common, 'width = 40', 'MenuButton must keep the original 40px default width.');
assertIncludes(common, 'height = 40', 'MenuButton must keep the original 40px default height.');
assertIncludes(common, '<ButtonCell', 'MenuButton must continue to render through ButtonCell.');
assertIncludes(common, 'width={width}', 'MenuButton must allow callers to stretch button width.');
assertIncludes(common, 'height={height}', 'MenuButton must allow callers to stretch button height.');

assertIncludes(otherPanel, 'const AS3_VISIBLE_COUNT = 4', 'OtherPanel must keep AS3 four-tab evidence explicit.');
assertIncludes(otherPanel, 'const VISIBLE_COUNT = tabDefs.length', 'OtherPanel must fill the rewritten right rail with all available tabs.');
assertIncludes(otherPanel, 'const OTHER_PANEL_PRODUCT_FILL_TABS = true', 'OtherPanel must document the widened React rail override.');
assertIncludes(otherPanel, 'data-bwe-other-tab-viewport', 'OtherPanel must expose the stretched tab viewport for browser smoke.');
assertIncludes(otherPanel, 'width: \'100%\'', 'OtherPanel tab strip must be able to fill the right sidebar width.');
assertIncludes(otherPanel, 'flex: \'1 1 0\'', 'OtherPanel tabs must flex across the rail instead of staying at AS3 200px.');
assertNotIncludes(otherPanel, 'width: OTHER_PANEL_AS3_RAIL_WIDTH', 'OtherPanel must not keep the visible tab strip locked to the old AS3 width.');

assertIncludes(equipWindow, 'data-bwe-equip-coordinate-plane', 'EquipWindow must render the guide arrows and slot anchors in one AS3 coordinate plane.');
assertIncludes(equipWindow, 'transformOrigin: \'top left\'', 'EquipWindow coordinate plane must scale from the AS3 origin.');
assertIncludes(equipWindow, 'EQUIP_SLOT_SOURCE_SIZE', 'EquipWindow slots must size in AS3 source units before scaling.');
assertIncludes(equipWindow, 'getSlotSourcePositionStyle', 'EquipWindow slot positions must be source-coordinate based.');

assertIncludes(titleWindow, 'data-bwe-title-list', 'TitleWindow must expose the full-height title list for browser smoke.');
assertIncludes(titleWindow, 'data-bwe-title-row', 'TitleWindow rows must expose width smoke hooks.');
assertIncludes(titleWindow, 'maxHeight="100%"', 'TitleWindow title list must use the available panel height.');
assertIncludes(titleWindow, 'width: \'100%\'', 'TitleWindow rows must fill the widened right panel.');
assertNotIncludes(titleWindow, 'maxHeight={360}', 'TitleWindow must not keep the old short list height cap.');
assertNotIncludes(titleWindow, 'width: 200', 'TitleWindow rows must not keep the old narrow AS3 row width.');

assertIncludes(otherWindow, 'data-bwe-other-window-grid', 'OtherWindow must expose the widened command grid for browser smoke.');
assertIncludes(otherWindow, 'data-bwe-other-entry', 'OtherWindow command rows must expose smoke hooks.');
assertIncludes(otherWindow, 'gridTemplateColumns', 'OtherWindow must use the widened panel as a two-column command surface.');
assertIncludes(otherWindow, 'width: \'100%\'', 'OtherWindow rows must fill the right panel width.');

for (const [label, source, metaHook] of [
  ['ShopWindow', shopWindow, 'data-bwe-shop-header-meta'],
  ['SpecialShopWindow', specialShopWindow, 'data-bwe-specialshop-header-meta'],
]) {
  assertIncludes(source, 'data-bwe-overlay-window-header', `${label} must expose a padded overlay header.`);
  assertIncludes(source, metaHook, `${label} must expose header meta for overlap smoke.`);
  assertIncludes(source, 'paddingRight: 92', `${label} header must reserve space for the overlay close button.`);
}

assertIncludes(mainSceneCss, '.battle-log-panel font[size="20"]', 'Battle log must clamp AS3 large critical-hit font tags.');
assertIncludes(mainSceneCss, 'font-size: 1.12em', 'Battle log critical-hit text must scale with the measured log font size.');
assertIncludes(mainSceneCss, 'white-space: nowrap', 'Battle log messages must preserve the single-line sizing contract.');
assertIncludes(mainSceneCss, '.battle-log-panel font[size]', 'Battle log must scope font-tag normalization to the log panel.');

assertIncludes(monsterInfoPanel, 'useEffect', 'MonsterInfoPanel must clean up hover info on monster changes/unmount.');
assertIncludes(monsterInfoPanel, 'tooltipOwnerKey', 'MonsterInfoPanel must tie hover cleanup to the current monster/title owner.');
assertIncludes(monsterInfoPanel, 'getBuffInfoHtml', 'MonsterInfoPanel must provide hover descriptions for buff/debuff icons.');
assertIncludes(monsterInfoPanel, 'handleBuffMouseEnter', 'MonsterInfoPanel buff icons must open the shared info window on hover.');
assertIncludes(monsterInfoPanel, 'data-bwe-monster-buff-icon', 'MonsterInfoPanel buff icons must expose smoke hooks.');
assertIncludes(monsterInfoPanel, 'onMouseLeave={hideItemInfo}', 'MonsterInfoPanel hover affordances must close the shared item info window.');

assertIncludes(saveSystem, `export const SAVE_COMPATIBILITY_WARNING = '${SAVE_COMPATIBILITY_WARNING}'`, 'SaveSystem must export the save-risk reminder text.');
assertIncludes(saveSystem, 'export const SAVE_LOCAL_STORAGE_KEYS', 'SaveSystem must expose the browser localStorage save keys.');
assertIncludes(saveSystem, 'export function getBrowserSaveStorageHint', 'SaveSystem must expose a player-facing save location hint.');
assertIncludes(saveScene, 'data-bwe-save-storage-hint', 'SaveScene must show where historical saves live.');
assertIncludes(saveScene, 'SAVE_LOCAL_STORAGE_KEYS', 'SaveScene must show the exact localStorage keys.');
assertIncludes(saveScene, 'getBrowserSaveStorageHint()', 'SaveScene must reuse the shared save location hint.');
assertIncludes(saveScene, 'accept=".boe"', 'SaveScene must keep direct historical .boe import available.');
assertIncludes(saveWindow, 'data-bwe-save-export', 'In-game SaveWindow must expose a manual export path for future upgrades.');
assertIncludes(saveWindow, "dispatch({ type: 'MANUAL_SAVE', slot })", 'In-game SaveWindow must export .boe files, not only localStorage slots.');
assertIncludes(saveWindow, 'data-bwe-save-window-storage-hint', 'In-game SaveWindow must remind players where local slots are stored.');

console.log('Visible UI follow-up guard passed.');
