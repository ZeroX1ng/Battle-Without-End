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

const itemWindow = read('src/components/windows/ItemWindow.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(itemWindow, 'const forgePanelStyle', 'ItemWindow must define a dedicated lower forge panel style');
assertIncludes(itemWindow, 'data-bwe-forge-panel="inventory-lower"', 'Forge controls must render in a named lower inventory panel');
assertIncludes(itemWindow, 'style={forgePanelStyle}', 'Forge controls must use the dedicated lower panel, not the item detail panel');
assertIncludes(itemWindow, 'style={forgeItemPreviewStyle}', 'Forge panel must own the selected equipment preview');
assertIncludes(itemWindow, 'style={forgeStatRowStyle}', 'Forge panel must own success-rate and cost rows');
assertIncludes(itemWindow, "showStringInfo(autoForgeLabel)", 'Auto forge toggle must stay in the forge panel with AS3 hover feedback');
assertIncludes(itemWindow, "dispatch({ type: 'CONFIG_TOGGLE', key: 'sound_toggle' })", 'Sound toggle must stay wired to the AS3 sound setting');
assertIncludes(itemWindow, 'onClick={handleForge}', 'Forge panel must own the forge button action');
assertIncludes(itemWindow, 'selectedItem ? (', 'Forge panel must render selected-equipment and empty states from the same selected item source');
assertIncludes(itemWindow, 'const [selectedIndex, setSelectedIndex] = useState<number | null>(null)', 'ItemWindow must track the selected equipment by list index so battle transition cloning does not clear forge selection');
assertIncludes(itemWindow, 'const selectedItem = selectedIndex === null ? null : items[selectedIndex] ?? null', 'ItemWindow selected equipment must be derived from the current item list');
assertNotIncludes(itemWindow, 'const [selectedItem, setSelectedItem] = useState<any | null>(null)', 'ItemWindow must not store selected equipment by object reference because Battle ticks clone itemList entries');
assertNotIncludes(itemWindow, 'QualityName', 'ItemWindow must not render a separate AS3-missing quality label panel for the selected equipment');
assertNotIncludes(itemWindow, 'QualityColor[selectedItem.quality]', 'ItemWindow must not render selected-equipment quality in a separate detail panel');
assertNotIncludes(itemWindow, 'const detailPanelStyle', 'ItemWindow must not keep the extra selected-equipment detail panel between the list and forge panel');
assertNotIncludes(itemWindow, '品质:', 'ItemWindow must not render a separate quality row for selected equipment');

const forgePanelStart = itemWindow.indexOf('const forgePanelStyle');
if (forgePanelStart === -1) {
  throw new Error('Forge panel style must be defined separately for the AS3 lower forge area');
}

const itemBodyStart = itemWindow.indexOf('<div style={itemBodyStyle}>');
const forgePanelRenderStart = itemWindow.indexOf('data-bwe-forge-panel="inventory-lower"');
if (itemBodyStart === -1 || forgePanelRenderStart === -1 || forgePanelRenderStart < itemBodyStart) {
  throw new Error('Forge panel must render after the item list/detail area, matching AS3 ItemWindow.setForge() lower placement');
}

const itemBodyBlock = itemWindow.slice(itemBodyStart, forgePanelRenderStart);
assertNotIncludes(itemBodyBlock, 'autoForgeLabel', 'Item list area must not contain auto-forge controls');
assertNotIncludes(itemBodyBlock, "state.config.sound_toggle", 'Item list area must not contain sound controls');
assertNotIncludes(itemBodyBlock, 'onClick={handleForge}', 'Item list area must not contain the forge button');
assertNotIncludes(itemBodyBlock, 'forgeInfo.rate', 'Item list area must not contain forge success rate');
assertNotIncludes(itemBodyBlock, 'forgeInfo.cost', 'Item list area must not contain forge cost');

if (packageJson.scripts?.['assert:forge-ui-placement'] !== 'node scripts/assertForgeUiPlacementParity.mjs') {
  throw new Error('package.json must expose assert:forge-ui-placement');
}

console.log('Forge UI placement parity checks passed.');
