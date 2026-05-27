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

const detailPanelStart = itemWindow.indexOf('const detailPanelStyle');
const forgePanelStart = itemWindow.indexOf('const forgePanelStyle');
if (detailPanelStart === -1 || forgePanelStart === -1 || forgePanelStart < detailPanelStart) {
  throw new Error('Forge panel style must be defined separately after the item detail panel style');
}

const selectedDetailStart = itemWindow.indexOf('{selectedItem && (');
const forgePanelRenderStart = itemWindow.indexOf('data-bwe-forge-panel="inventory-lower"');
if (selectedDetailStart === -1 || forgePanelRenderStart === -1 || forgePanelRenderStart < selectedDetailStart) {
  throw new Error('Forge panel must render after the item list/detail area, matching AS3 ItemWindow.setForge() lower placement');
}

const selectedDetailBlock = itemWindow.slice(selectedDetailStart, forgePanelRenderStart);
assertNotIncludes(selectedDetailBlock, 'autoForgeLabel', 'Item detail area must not contain auto-forge controls');
assertNotIncludes(selectedDetailBlock, "state.config.sound_toggle", 'Item detail area must not contain sound controls');
assertNotIncludes(selectedDetailBlock, 'onClick={handleForge}', 'Item detail area must not contain the forge button');
assertNotIncludes(selectedDetailBlock, 'forgeInfo.rate', 'Item detail area must not contain forge success rate');
assertNotIncludes(selectedDetailBlock, 'forgeInfo.cost', 'Item detail area must not contain forge cost');

if (packageJson.scripts?.['assert:forge-ui-placement'] !== 'node scripts/assertForgeUiPlacementParity.mjs') {
  throw new Error('package.json must expose assert:forge-ui-placement');
}

console.log('Forge UI placement parity checks passed.');
