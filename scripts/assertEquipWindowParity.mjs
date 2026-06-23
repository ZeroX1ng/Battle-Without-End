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

const equipWindow = read('src/components/windows/EquipWindow.tsx');
const as3EquipWindow = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as');
const as3EquipCell = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iEquip/EquipCell.as');
const itemWindow = read('src/components/windows/ItemWindow.tsx');
const common = read('src/components/common/Common.tsx');
const equipment = read('src/core/models/Equipment.ts');
const player = read('src/core/models/Player.ts');
const gameContext = read('src/state/GameContext.tsx');

for (const slot of ['head', 'feet', 'body', 'necklace', 'ring', 'leftHand', 'rightHand']) {
  assertIncludes(equipWindow, `slot: '${slot}'`, `EquipWindow must render the original ${slot} equipment slot`);
}

assertIncludes(as3EquipWindow, 'private const SC:Number = 0.4;', 'AS3 EquipWindow must define people skeleton scale SC = 0.4.');
assertIncludes(as3EquipWindow, 'private const SY:int = 100;', 'AS3 EquipWindow must define people skeleton y offset SY = 100.');
assertIncludes(as3EquipWindow, 'new people_use1()', 'AS3 EquipWindow must render the first people skeleton sprite layer.');
assertIncludes(as3EquipWindow, 'new people_use2()', 'AS3 EquipWindow must render the second people skeleton sprite layer.');
assertIncludes(as3EquipWindow, 'this.head.x = 210;', 'AS3 EquipWindow head slot x must remain the slot-map source.');
assertIncludes(as3EquipWindow, 'this.feet.y = 480;', 'AS3 EquipWindow feet slot y must remain the slot-map source.');
assertIncludes(equipWindow, 'const AS3_SKELETON_SCALE = 0.4', 'EquipWindow must keep the AS3 people skeleton scale as an explicit constant.');
assertIncludes(equipWindow, 'const AS3_SKELETON_Y = 100', 'EquipWindow must keep the AS3 people skeleton y offset as an explicit constant.');
assertIncludes(equipWindow, 'const AS3_SLOT_POSITIONS', 'EquipWindow slot positions must come from an explicit AS3 coordinate map.');
for (const [slot, x, y] of [
  ['head', 210, -50],
  ['feet', 210, 480],
  ['body', 390, 300],
  ['necklace', 380, 100],
  ['ring', 10, 120],
  ['leftHand', 5, 230],
  ['rightHand', 415, 220],
]) {
  assertMatches(
    equipWindow,
    new RegExp(`${slot}:\\s*\\{\\s*x:\\s*${x},\\s*y:\\s*${y}\\s*\\}`),
    `EquipWindow ${slot} slot must use AS3 coordinates (${x}, ${y}).`,
  );
}
assertIncludes(equipWindow, 'name="people_use1"', 'EquipWindow must render people_use1 through SpriteImage.');
assertIncludes(equipWindow, 'name="people_use2"', 'EquipWindow must render people_use2 through SpriteImage.');
assertIncludes(equipWindow, 'data-bwe-equip-skeleton-layer="people_use1"', 'EquipWindow must expose people_use1 for browser smoke.');
assertIncludes(equipWindow, 'data-bwe-equip-skeleton-layer="people_use2"', 'EquipWindow must expose people_use2 for browser smoke.');
assertNotIncludes(equipWindow, 'borderRadius: 38', 'EquipWindow must not keep the CSS oval people placeholder as the visual body.');

assertIncludes(equipWindow, 'useInfoWindow', 'EquipWindow must use the global item info hover window');
assertIncludes(equipWindow, 'showItemInfo', 'EquipWindow must show equipped item details on hover');
assertIncludes(equipWindow, 'hideItemInfo', 'EquipWindow must hide item details when leaving a slot');
assertIncludes(equipWindow, "dispatch({ type: 'UNEQUIP_ITEM'", 'EquipWindow must dispatch UNEQUIP_ITEM when an equipped slot is clicked');
assertNotIncludes(equipWindow, 'getSlotComparison', 'EquipWindow lower detail must not show React-only unequip comparison data.');
assertNotIncludes(equipWindow, 'const delta = -value', 'EquipWindow lower detail must not calculate unequip stat deltas.');
assertNotIncludes(equipWindow, '卸下后的属性变化', 'EquipWindow lower detail must not show the removed unequip-delta heading.');
assertNotIncludes(equipWindow, 'data-bwe-equip-stat-grid', 'EquipWindow lower detail must not keep the removed stat delta grid.');
assertIncludes(as3EquipWindow, 'private function setPetInfo()', 'AS3 EquipWindow must define the pet detail block under the equipment figure.');
assertIncludes(as3EquipWindow, 'this.petSkillSp.x = 10;', 'AS3 EquipWindow must place pet skills inside the equipment window.');
assertIncludes(equipWindow, 'const PET_STATS', 'EquipWindow must render the AS3-style active pet stat block.');
assertIncludes(equipWindow, 'data-bwe-equip-pet-info', 'EquipWindow must expose the active-pet detail block for smoke.');
assertIncludes(equipWindow, 'data-bwe-equip-pet-skill-list', 'EquipWindow must expose the active-pet skill block for smoke.');
assertIncludes(equipWindow, 'handlePetSkillHover', 'EquipWindow must keep pet skill hover wiring in the equipment tab detail area.');
assertIncludes(as3EquipCell, '_loc4_ = new mc_mode();', 'AS3 EquipCell must render mc_mode for empty equipment slots.');
assertIncludes(as3EquipCell, 'getDefinitionByName("mc_" + this.equip.type)', 'AS3 EquipCell must render weapon slot icons from mc_<type>.');
assertIncludes(as3EquipCell, 'getDefinitionByName("mc_" + this.equip.position + "_" + this.equip.type)', 'AS3 EquipCell must render armor/accessory slot icons from mc_<position>_<type>.');
assertIncludes(equipWindow, "import { SpriteImage } from '../shared/SpriteImage'", 'EquipWindow slots must render registered sprites instead of text labels.');
assertIncludes(equipWindow, 'getEquipmentSpriteName', 'EquipWindow slots must reuse the AS3 equipment sprite key resolver.');
assertIncludes(equipWindow, 'getEquipmentSpriteName(equip)', 'Occupied EquipWindow slots must resolve their icon from the equipped item.');
assertIncludes(equipWindow, 'data-bwe-equip-slot-icon={slotSpriteName}', 'EquipWindow slots must expose the resolved slot sprite key for UI smoke.');
assertIncludes(equipWindow, '<SpriteImage', 'EquipWindow slots must render equipment icons through SpriteImage.');
assertNotIncludes(equipWindow, '{shortLabel}', 'EquipWindow slots must not render one-character text placeholders.');
assertNotIncludes(equipWindow, "{equip ? equip.type : '", 'EquipWindow slots must not render equipment type text in the icon cell.');

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
assertMatches(
  common,
  /showItemInfo\(candidateHtml,\s*(?:compareHtml|getCompareHtml\(\))\)/,
  'Inventory equipment rows must keep AS3 hover comparison details'
);
assertIncludes(itemWindow, 'currentEquip={getEquipmentComparisonSlot(item, state.player)}', 'ItemWindow must pass current same-slot equipment into bag rows');
assertIncludes(itemWindow, "dispatch({ type: 'EQUIP_ITEM', item })", 'ItemWindow bag rows must equip through their inline EquipmentCell action');

const forgePanelStart = itemWindow.indexOf('data-bwe-forge-panel="inventory-lower"');
if (forgePanelStart === -1) {
  throw new Error('ItemWindow must render the lower forge panel');
}

assertNotIncludes(
  itemWindow,
  "dispatch({ type: 'EQUIP_ITEM', item: selectedItem })",
  'ItemWindow must not render a second selected-item equip/wear action; AS3 EquipmentCell only equips from the row button',
);
assertNotIncludes(itemWindow, 'const detailPanelStyle', 'ItemWindow must not render the AS3-missing selected-equipment quality/detail panel');
assertNotIncludes(itemWindow, 'QualityName', 'ItemWindow must not render selected equipment quality outside the hover info window');

const forgePanelBlock = itemWindow.slice(forgePanelStart);
assertIncludes(forgePanelBlock, 'selectedItem ? (', 'Lower forge panel must still use selectedItem for forge preview and actions');
assertIncludes(forgePanelBlock, 'onClick={handleForge}', 'Lower forge panel must keep the selectedItem-driven forge action');

console.log('EquipWindow parity checks passed.');
