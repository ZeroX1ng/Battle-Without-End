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

const infoWindow = read('src/components/common/InfoWindow.tsx');
const common = read('src/components/common/Common.tsx');
const itemWindow = read('src/components/windows/ItemWindow.tsx');
const shopWindow = read('src/components/windows/ShopWindow.tsx');
const player = read('src/core/models/Player.ts');

assertIncludes(
  infoWindow,
  'compareHtml',
  'InfoWindow must support AS3-style candidate equipment plus current equipped equipment panes',
);
assertIncludes(
  infoWindow,
  'showItemInfo: (html: string, compareHtml?: string) => void',
  'showItemInfo must accept optional current-slot comparison equipment HTML',
);

assertIncludes(
  common,
  'currentEquip?: any',
  'EquipmentCell must accept the current equipped item for the candidate slot',
);
assertIncludes(
  common,
  'showItemInfo(candidateHtml, compareHtml)',
  'EquipmentCell hover must pass candidate and current-slot equipment descriptions together',
);
assertIncludes(
  common,
  'currentEquip && currentEquip !== equip',
  'EquipmentCell must suppress duplicate comparison when the hovered item is already equipped',
);

assertIncludes(
  player,
  'export function getEquipmentComparisonSlot',
  'Player model must expose the AS3 EquipmentCell/ShopCell slot lookup for hover comparison',
);
assertIncludes(
  itemWindow,
  'getEquipmentComparisonSlot(item, state.player)',
  'ItemWindow must provide the current same-slot equipment to EquipmentCell hover',
);
assertIncludes(
  itemWindow,
  'currentEquip={',
  'Inventory EquipmentCell rows must receive comparison equipment',
);

assertIncludes(
  shopWindow,
  'EquipmentCell',
  'ShopWindow must reuse EquipmentCell for sale equipment hover instead of a separate tooltip path',
);
assertIncludes(
  shopWindow,
  'getEquipmentComparisonSlot(equip, p)',
  'ShopWindow sale equipment hover must provide current same-slot equipment',
);
assertIncludes(
  shopWindow,
  'getSellDesciption()',
  'ShopWindow sale hover must preserve AS3 sell description for candidate equipment',
);
assertNotIncludes(
  shopWindow,
  'title=',
  'ShopWindow equipment hover must not fall back to native browser title tooltips',
);

console.log('Equipment compare tooltip parity checks passed.');
