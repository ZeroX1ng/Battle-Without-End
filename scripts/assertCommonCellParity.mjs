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

const common = read('src/components/common/Common.tsx');
const itemWindow = read('src/components/windows/ItemWindow.tsx');
const otherPanel = read('src/components/panels/OtherPanel.tsx');
const otherWindow = read('src/components/windows/OtherWindow.tsx');
const actions = read('src/state/actions.ts');
const gameContext = read('src/state/GameContext.tsx');

for (const name of ['BasicCell', 'ButtonCell', 'MenuButton', 'StringInfoCell', 'EquipmentCell']) {
  assertIncludes(common, `export function ${name}`, `Common cell system must export ${name}`);
}

assertIncludes(common, 'buttonDown', 'ButtonCell must keep the original pressed/toggled state');
assertIncludes(common, 'setBefore', 'ButtonCell must expose the original before state transition');
assertIncludes(common, 'setAfter', 'ButtonCell must expose the original after state transition');
assertIncludes(common, 'setDown', 'ButtonCell must expose the original down-state transition');
assertIncludes(common, 'showStringInfo', 'MenuButton/StringInfoCell must use the global string info window');
assertIncludes(common, 'hideStringInfo', 'MenuButton/StringInfoCell must hide the global string info window on mouse out');
assertIncludes(common, 'showItemInfo', 'EquipmentCell must use the global item info hover window');
assertIncludes(common, 'sell', 'EquipmentCell must include the original money/sell button');
assertIncludes(common, 'equip', 'EquipmentCell must include the original equip button');
assertIncludes(common, 'equip.level >= 7', 'EquipmentCell must preserve the original high-level glow behavior');
assertIncludes(common, 'getNameHTML()', 'EquipmentCell must render original equipment HTML names');
assertIncludes(common, 'getDescription()', 'EquipmentCell must render original item descriptions');

assertIncludes(itemWindow, 'EquipmentCell', 'ItemWindow must render inventory rows through EquipmentCell');
assertIncludes(itemWindow, "dispatch({ type: 'ITEM_SELL'", 'ItemWindow must wire EquipmentCell sell behavior');
assertIncludes(itemWindow, "dispatch({ type: 'EQUIP_ITEM'", 'ItemWindow must wire EquipmentCell equip behavior');
assertIncludes(otherPanel, 'MenuButton', 'OtherPanel tabs must use original MenuButton behavior');
assertIncludes(otherWindow, 'MenuButton', 'OtherWindow entries must use original MenuButton behavior');
assertIncludes(actions, "{ type: 'ITEM_SELL'; item: Equipment }", 'Actions must expose ITEM_SELL for EquipmentCell money button');
assertIncludes(gameContext, "case 'ITEM_SELL'", 'Game reducer must handle EquipmentCell money button');
assertIncludes(gameContext, 'addGold(removed, action.item.getMoney())', 'ITEM_SELL must remove the item and add its value to player gold');

console.log('Common cell parity checks passed.');
