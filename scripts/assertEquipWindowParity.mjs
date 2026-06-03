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

const equipWindow = read('src/components/windows/EquipWindow.tsx');
const itemWindow = read('src/components/windows/ItemWindow.tsx');
const common = read('src/components/common/Common.tsx');
const equipment = read('src/core/models/Equipment.ts');
const player = read('src/core/models/Player.ts');
const gameContext = read('src/state/GameContext.tsx');

for (const slot of ['head', 'feet', 'body', 'necklace', 'ring', 'leftHand', 'rightHand']) {
  assertIncludes(equipWindow, `slot: '${slot}'`, `EquipWindow must render the original ${slot} equipment slot`);
}

assertIncludes(equipWindow, 'useInfoWindow', 'EquipWindow must use the global item info hover window');
assertIncludes(equipWindow, 'showItemInfo', 'EquipWindow must show equipped item details on hover');
assertIncludes(equipWindow, 'hideItemInfo', 'EquipWindow must hide item details when leaving a slot');
assertIncludes(equipWindow, "dispatch({ type: 'UNEQUIP_ITEM'", 'EquipWindow must dispatch UNEQUIP_ITEM when an equipped slot is clicked');
assertIncludes(equipWindow, 'getSlotComparison', 'EquipWindow must include equipped-item comparison data for each occupied slot');
assertIncludes(equipWindow, 'const delta = -value', 'EquipWindow comparison must show the stat delta after removing the equipped item');
assertIncludes(equipWindow, 'PET_STATS', 'EquipWindow must render the original pet stat block below equipment slots');
assertIncludes(equipWindow, 'player.pet?.skillList', 'EquipWindow must render the equipped pet skill cells');
assertIncludes(equipWindow, 'getPetSkillDescription', 'EquipWindow must show pet skill details on hover');
assertIncludes(equipWindow, 'handlePetSkillHover', 'EquipWindow must wire pet skill hover behavior to the info window');

assertIncludes(equipment, 'getDescription()', 'Equipment must expose the original item detail description HTML');
assertIncludes(equipment, 'getPositionLabel()', 'Equipment descriptions must include a translated equipment position');
assertIncludes(equipment, 'getTypeLabel()', 'Equipment descriptions must include a translated equipment type');

assertIncludes(player, 'export function unequipItem', 'Player model must expose unequipItem for equipment slots');
assertIncludes(gameContext, 'unequipItem(state.player, action.slot)', 'UNEQUIP_ITEM must update player state through unequipItem');
assertIncludes(gameContext, 'withBattlePlayer', 'Equipment changes must keep an active Battle playerState in sync');
assertNotIncludes(gameContext, "case 'UNEQUIP_ITEM':\r\n      return state;", 'UNEQUIP_ITEM must not be a no-op');
assertNotIncludes(gameContext, "case 'UNEQUIP_ITEM':\n      return state;", 'UNEQUIP_ITEM must not be a no-op');

assertIncludes(common, "actionButton('equip', 'E', onEquip)", 'Inventory equipment rows must keep the AS3 inline equip button');
assertIncludes(common, "actionButton('sell', sellLabel, onSell)", 'Inventory equipment rows must keep the AS3 inline sell/money button');
assertIncludes(common, 'showItemInfo(candidateHtml, compareHtml)', 'Inventory equipment rows must keep AS3 hover comparison details');
assertIncludes(itemWindow, 'currentEquip={getEquipmentComparisonSlot(item, state.player)}', 'ItemWindow must pass current same-slot equipment into bag rows');
assertIncludes(itemWindow, "dispatch({ type: 'EQUIP_ITEM', item })", 'ItemWindow bag rows must equip through their inline EquipmentCell action');

const selectedDetailStart = itemWindow.indexOf('{selectedItem && (');
const forgePanelStart = itemWindow.indexOf('data-bwe-forge-panel="inventory-lower"');
if (selectedDetailStart === -1 || forgePanelStart === -1 || forgePanelStart < selectedDetailStart) {
  throw new Error('ItemWindow must render the selected-item area before the lower forge panel');
}

const selectedDetailBlock = itemWindow.slice(selectedDetailStart, forgePanelStart);
assertNotIncludes(
  selectedDetailBlock,
  "dispatch({ type: 'EQUIP_ITEM', item: selectedItem })",
  'Selected item detail panel must not render a second equip/wear action; AS3 EquipmentCell only equips from the row button',
);

const forgePanelBlock = itemWindow.slice(forgePanelStart);
assertIncludes(forgePanelBlock, 'selectedItem ? (', 'Lower forge panel must still use selectedItem for forge preview and actions');
assertIncludes(forgePanelBlock, 'onClick={handleForge}', 'Lower forge panel must keep the selectedItem-driven forge action');

console.log('EquipWindow parity checks passed.');
