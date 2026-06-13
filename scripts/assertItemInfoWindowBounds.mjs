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

const as3ItemInfoWindow = read('reference/as3/BOE-O/scripts/iPanel/iCell/ItemInfoWindow.as');
const as3InfoWindow = read('reference/as3/BOE-O/scripts/iPanel/iCell/InfoWindow.as');
const as3EquipmentCell = read('reference/as3/BOE-O/scripts/iPanel/iCell/EquipmentCell.as');
const as3StringInfoCell = read('reference/as3/BOE-O/scripts/iPanel/iCell/StringInfoCell.as');
const infoWindow = read('src/components/common/InfoWindow.tsx');
const common = read('src/components/common/Common.tsx');
const itemWindow = read('src/components/windows/ItemWindow.tsx');
const shopWindow = read('src/components/windows/ShopWindow.tsx');
const packageJson = read('package.json');

assertIncludes(
  as3ItemInfoWindow,
  'this.text.width = 130',
  'AS3 ItemInfoWindow must keep the 130px text baseline for this bounds card.',
);
assertIncludes(
  as3ItemInfoWindow,
  'super.draw(130,this.text.textHeight + 5)',
  'AS3 ItemInfoWindow must draw its border from the 130px text width and content height.',
);
assertIncludes(
  as3InfoWindow,
  'this.graphics.lineStyle(1,13487565,0.8)',
  'AS3 InfoWindow must keep the 1px gold border.',
);
assertIncludes(
  as3InfoWindow,
  'new GlowFilter(5066061,0.66,13,13)',
  'AS3 InfoWindow must keep the glow filter.',
);
assertIncludes(
  as3EquipmentCell,
  'this.equipedInfoWindow = new ItemInfoWindow',
  'AS3 EquipmentCell must create the current-equipped comparison ItemInfoWindow.',
);
assertIncludes(
  as3EquipmentCell,
  'Global.stage.stageHeight - this.equipedInfoWindow.height',
  'AS3 EquipmentCell comparison tooltip must clamp vertically against stage height.',
);
assertIncludes(
  as3StringInfoCell,
  'Global.stage.stageWidth',
  'AS3 StringInfoCell must prove tooltip edge correction is stage-based, not browser-window-based.',
);

assertIncludes(
  packageJson,
  '"assert:item-info-window-bounds": "node scripts/assertItemInfoWindowBounds.mjs"',
  'package.json must expose the focused item info window bounds guard.',
);

assertNotIncludes(
  infoWindow,
  'const panelWidth = 300',
  'React ItemInfoWindow must not keep the old fixed 300px panel width.',
);
assertNotIncludes(
  infoWindow,
  'window.innerWidth - totalWidth',
  'React ItemInfoWindow must not clamp only against the browser window right edge.',
);
assertMatches(
  infoWindow,
  /ITEM_INFO_PANEL_MIN_WIDTH\s*=\s*130/,
  'React ItemInfoWindow must encode the AS3 130px minimum baseline.',
);
assertMatches(
  infoWindow,
  /ITEM_INFO_PANEL_MAX_WIDTH\s*=\s*18[0]?/,
  'React ItemInfoWindow must cap a single item panel at an AS3-adjacent width no wider than 180px.',
);
assertIncludes(
  infoWindow,
  '.game-shell',
  'React ItemInfoWindow must clamp against the game shell when it exists.',
);
assertIncludes(
  infoWindow,
  '.main-scene',
  'React ItemInfoWindow must fall back to the main scene as a stage boundary.',
);
assertIncludes(
  infoWindow,
  'getTooltipStageRect',
  'React ItemInfoWindow must centralize game-container/stage boundary discovery.',
);
assertIncludes(
  infoWindow,
  'clampToStage',
  'React ItemInfoWindow must clamp X/Y positions inside the stage rect.',
);
assertIncludes(
  infoWindow,
  'data-bwe-item-info-window',
  'React ItemInfoWindow must expose a stable DOM hook for browser bounds smoke.',
);
assertMatches(
  infoWindow,
  /function ItemInfoWindow[\s\S]*data-bwe-item-info-window/,
  'The item-info bounds smoke hook must be rendered by ItemInfoWindow itself.',
);
assertIncludes(
  infoWindow,
  'data-bwe-item-info-layout',
  'React ItemInfoWindow must expose whether compare panes are side-by-side or stacked.',
);
assertIncludes(
  infoWindow,
  "overflowY: 'auto'",
  'React ItemInfoWindow panels must scroll internally when long descriptions approach the stage edge.',
);
assertIncludes(
  infoWindow,
  'maxHeight: panelMaxHeight',
  'React ItemInfoWindow panels must cap height against the game container.',
);
assertIncludes(
  infoWindow,
  'ITEM_INFO_PANEL_MAX_STAGE_HEIGHT_RATIO',
  'React ItemInfoWindow must cap tooltip height to a stage-height fraction so it does not cover most of the UI.',
);
assertIncludes(
  infoWindow,
  'ITEM_INFO_PANEL_MAX_HEIGHT',
  'React ItemInfoWindow must keep an absolute tooltip height ceiling for long descriptions.',
);
assertIncludes(
  infoWindow,
  'flexDirection: layout',
  'React ItemInfoWindow compare panes must be able to switch layout when horizontal space is tight.',
);

assertIncludes(
  common,
  'showItemInfo(candidateHtml, compareHtml)',
  'Inventory and shop EquipmentCell hover must continue to feed candidate/current comparison descriptions.',
);
assertIncludes(
  itemWindow,
  'currentEquip={getEquipmentComparisonSlot(item, state.player)}',
  'ItemWindow inventory rows must continue providing same-slot comparison equipment.',
);
assertIncludes(
  shopWindow,
  'currentEquip={getEquipmentComparisonSlot(equip, p)}',
  'ShopWindow sale rows must continue providing same-slot comparison equipment.',
);

console.log('ItemInfoWindow bounds checks passed.');
