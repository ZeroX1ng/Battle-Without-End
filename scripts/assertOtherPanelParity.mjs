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

const otherPanel = read('src/components/panels/OtherPanel.tsx');
const otherWindow = read('src/components/windows/OtherWindow.tsx');
const mainScene = read('src/components/scenes/MainScene.tsx');
const windowsIndex = read('src/components/windows/index.ts');

for (const tab of ['item', 'equip', 'pet', 'skill', 'title', 'system', 'other']) {
  assertIncludes(otherPanel, `id: '${tab}'`, `OtherPanel must expose the original ${tab} top-level tab`);
}

for (const child of ['map', 'help', 'shop', 'specialshop', 'save', 'rebirth']) {
  assertIncludes(otherWindow, `id: '${child}'`, `OtherWindow must expose the original ${child} entry`);
}

assertIncludes(otherPanel, '<ItemWindow />', 'OtherPanel must own ItemWindow');
assertIncludes(otherPanel, '<EquipWindow />', 'OtherPanel must own EquipWindow');
assertIncludes(otherPanel, '<PetWindow />', 'OtherPanel must own PetWindow');
assertIncludes(otherPanel, '<SkillWindow />', 'OtherPanel must own SkillWindow');
assertIncludes(otherPanel, '<TitleWindow />', 'OtherPanel must own TitleWindow');
assertIncludes(otherPanel, '<SystemWindow />', 'OtherPanel must own SystemWindow');
assertIncludes(otherPanel, '<OtherWindow />', 'OtherPanel must own OtherWindow');
assertIncludes(otherPanel, 'display: activeTab === id ?', 'OtherPanel must keep all original windows mounted and toggle visibility');

assertIncludes(otherWindow, '<MapWindow />', 'OtherWindow must own MapWindow');
assertIncludes(otherWindow, '<HelpWindow />', 'OtherWindow must own HelpWindow');
assertIncludes(otherWindow, '<ShopWindow />', 'OtherWindow must own ShopWindow');
assertIncludes(otherWindow, '<SpecialShopWindow />', 'OtherWindow must own SpecialShopWindow');
assertIncludes(otherWindow, '<SaveWindow />', 'OtherWindow must own SaveWindow');

assertIncludes(mainScene, '<OtherPanel />', 'MainScene must render the OtherPanel hub');
assertIncludes(windowsIndex, "export { OtherWindow } from './OtherWindow'", 'OtherWindow must be exported with other windows');

console.log('OtherPanel/OtherWindow parity checks passed.');
