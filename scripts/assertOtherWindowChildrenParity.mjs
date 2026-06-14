import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotIncludes(source, needle, message) {
  if (source.includes(needle)) {
    throw new Error(message);
  }
}

function assertMatches(source, pattern, message) {
  if (!pattern.test(source)) {
    throw new Error(message);
  }
}

const packageJson = JSON.parse(read('package.json'));
const otherWindow = read('src/components/windows/OtherWindow.tsx');
const mainScene = read('src/components/scenes/MainScene.tsx');
const mapWindow = read('src/components/windows/MapWindow.tsx');
const helpWindow = read('src/components/windows/HelpWindow.tsx');
const shopWindow = read('src/components/windows/ShopWindow.tsx');
const specialShopWindow = read('src/components/windows/SpecialShopWindow.tsx');
const saveWindow = read('src/components/windows/SaveWindow.tsx');
const gameContext = read('src/state/GameContext.tsx');
const actions = read('src/state/actions.ts');

if (packageJson.scripts?.['assert:other-window-children'] !== 'node scripts/assertOtherWindowChildrenParity.mjs') {
  throw new Error('package.json must expose assert:other-window-children');
}

for (const [id, component] of [
  ['map', 'MapWindow'],
  ['help', 'HelpWindow'],
  ['shop', 'ShopWindow'],
  ['specialshop', 'SpecialShopWindow'],
  ['save', 'SaveWindow'],
]) {
  assertIncludes(otherWindow, `id: '${id}'`, `OtherWindow must expose the AS3 ${id} entry`);
  assertNotIncludes(otherWindow, `<${component} />`, `OtherWindow must not embed ${component}; AS3 opens these panels on the stage`);
  assertIncludes(mainScene, `<${component} />`, `MainScene must mount ${component} as a stage overlay option`);
}

assertIncludes(otherWindow, "id: 'rebirth'", 'OtherWindow must expose the AS3 rebirth entry');
assertIncludes(otherWindow, "state.player.age >= 20", 'rebirth must unlock at age 20 like AS3 OtherWindow.updateBirth');
assertIncludes(otherWindow, "dispatch({ type: 'START_REBIRTH' })", 'rebirth entry must dispatch START_REBIRTH');
assertIncludes(otherWindow, "dispatch({ type: 'UI_OPEN_WINDOW', window: id })", 'non-rebirth entries must request the MainScene overlay');
assertIncludes(otherWindow, 'MenuButton', 'OtherWindow entries must use the shared menu button behavior');
assertIncludes(mainScene, 'main-scene__overlay', 'MainScene must expose the stage overlay surface');
assertIncludes(mainScene, 'UI_CLOSE_WINDOW', 'MainScene must provide an overlay close action');

assertIncludes(mapWindow, "dispatch({ type: 'MAP_SWITCH', map: newMap })", 'MapWindow must switch maps through MAP_SWITCH');
assertIncludes(mapWindow, 'new GameMap(mapData)', 'MapWindow must initialize the runtime map from selected MapData');
assertIncludes(mapWindow, 'MapList.map', 'MapWindow must render every AS3 MapList entry');
assertIncludes(mapWindow, 'position: \'absolute\'', 'MapWindow must render AS3 map cells as visible positioned markers');
assertIncludes(mapWindow, 'left: `${(mapData.x / MAP_WIDTH) * 100}%`', 'MapWindow must scale AS3 x coordinates into the visible map surface');
assertIncludes(mapWindow, 'top: `${(mapData.y / MAP_HEIGHT) * 100}%`', 'MapWindow must scale AS3 y coordinates into the visible map surface');

assertIncludes(helpWindow, 'QualityName', 'HelpWindow must explain equipment quality names');
assertIncludes(helpWindow, 'QualityColor', 'HelpWindow must render quality colors');
assertIncludes(helpWindow, 'dangerouslySetInnerHTML', 'HelpWindow must keep the original rich help text surface');

assertIncludes(shopWindow, "dispatch({ type: 'SHOP_BUY_SELL'", 'ShopWindow must dispatch SHOP_BUY_SELL for normal shop purchases');
assertIncludes(shopWindow, "dispatch({ type: 'SHOP_BUY_GAMBLE'", 'ShopWindow must dispatch SHOP_BUY_GAMBLE for gamble purchases');

assertIncludes(specialShopWindow, 'const BAG_COST_BASE = 1000000', 'SpecialShopWindow bag cost must match AS3 SpecialShopPanel');
assertIncludes(specialShopWindow, 'const PET_COST_BASE = 5000000', 'SpecialShopWindow pet cost must match AS3 SpecialShopPanel');
assertIncludes(specialShopWindow, 'const BAG_MAX = 100', 'SpecialShopWindow bag cap must match AS3 SpecialShopPanel');
assertIncludes(specialShopWindow, 'const PET_MAX = 20', 'SpecialShopWindow pet cap must match AS3 SpecialShopPanel');
assertIncludes(specialShopWindow, "(p.BAGMAX - 49) * BAG_COST_BASE", 'SpecialShopWindow bag cost formula must match AS3');
assertIncludes(specialShopWindow, "(p.PETMAX - 9) * PET_COST_BASE", 'SpecialShopWindow pet cost formula must match AS3');
assertIncludes(specialShopWindow, "dispatch({ type: 'BAG_EXPAND', cost: bagCost })", 'SpecialShopWindow must dispatch BAG_EXPAND');
assertIncludes(specialShopWindow, "dispatch({ type: 'PET_EXPAND', cost: petCost })", 'SpecialShopWindow must dispatch PET_EXPAND');

assertMatches(saveWindow, /const slots = \['slot1', 'slot2', 'slot3'\]/, 'SaveWindow must expose the three local save slots');
assertIncludes(saveWindow, "dispatch({ type: 'SAVE_GAME', slot })", 'SaveWindow must dispatch SAVE_GAME for a selected slot');

for (const action of [
  'MAP_SWITCH',
  'START_REBIRTH',
  'BAG_EXPAND',
  'PET_EXPAND',
  'SAVE_GAME',
  'SHOP_BUY_SELL',
  'SHOP_BUY_GAMBLE',
]) {
  assertIncludes(actions, `type: '${action}'`, `actions.ts must declare ${action}`);
  assertIncludes(gameContext, `case '${action}'`, `GameContext reducer must handle ${action}`);
}

console.log('OtherWindow child window parity checks passed.');
