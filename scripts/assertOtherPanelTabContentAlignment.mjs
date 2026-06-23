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

function assertMatches(source, pattern, message) {
  if (!pattern.test(source)) {
    throw new Error(message);
  }
}

function assertRegionSharesBoundary(source, marker, message) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`OtherPanel must expose ${marker}`);
  }
  const region = source.slice(markerIndex, markerIndex + 700);
  assertIncludes(region, '...OTHER_PANEL_BOUNDARY_STYLE', message);
}

const packageJson = JSON.parse(read('package.json'));
const otherPanel = read('src/components/panels/OtherPanel.tsx');

if (packageJson.scripts?.['assert:otherpanel-tab-alignment'] !== 'node scripts/assertOtherPanelTabContentAlignment.mjs') {
  throw new Error('package.json must expose assert:otherpanel-tab-alignment');
}

assertMatches(otherPanel, /const\s+TAB_SIZE\s*=\s*40/, 'OtherPanel must preserve AS3 40px tab buttons');
assertMatches(otherPanel, /const\s+TAB_FACE_ICON_SIZE\s*=\s*24/, 'OtherPanel tab icons must shrink enough to leave room for the label.');
assertIncludes(otherPanel, 'const TAB_FACE_LABEL_STYLE: React.CSSProperties', 'OtherPanel tab labels must use one stable compact style.');
assertIncludes(otherPanel, "lineHeight: '12px'", 'OtherPanel tab labels must fit inside the 40px face.');
assertIncludes(otherPanel, 'gap: 1', 'OtherPanel tab face must reserve a small controlled gap between icon and label.');
assertMatches(otherPanel, /const\s+AS3_VISIBLE_COUNT\s*=\s*4/, 'OtherPanel must keep the AS3 four visible tabs as explicit evidence');
assertMatches(
  otherPanel,
  /const\s+VISIBLE_COUNT\s*=\s*tabDefs\.length/,
  'OtherPanel must fill the rewritten right rail with all current tabs',
);
assertMatches(otherPanel, /const\s+ARROW_WIDTH\s*=\s*20/, 'OtherPanel must preserve AS3 20px arrow buttons');
assertMatches(
  otherPanel,
  /const\s+AS3_VISIBLE_WIDTH\s*=\s*AS3_VISIBLE_COUNT\s*\*\s*TAB_SIZE/,
  'OtherPanel AS3 visible tab width must stay available as legacy evidence'
);
assertMatches(
  otherPanel,
  /const\s+OTHER_PANEL_AS3_RAIL_WIDTH\s*=\s*ARROW_WIDTH\s*\*\s*2\s*\+\s*AS3_VISIBLE_WIDTH/,
  'OtherPanel must keep the AS3 20+160+20 rail width explicit'
);
assertMatches(
  otherPanel,
  /const\s+OTHER_PANEL_PRODUCT_FILL_TABS\s*=\s*true/,
  'OtherPanel must document the product override that widens the tab strip',
);
assertIncludes(
  otherPanel,
  'const OTHER_PANEL_BOUNDARY_STYLE: React.CSSProperties',
  'OtherPanel must define one shared boundary style for the rail and content window'
);

for (const marker of [
  'data-bwe-other-panel',
  'data-bwe-other-tab-rail',
  'data-bwe-other-tab-strip',
  'data-bwe-other-tab-viewport',
  'data-bwe-other-content',
]) {
  assertIncludes(otherPanel, marker, `OtherPanel must expose ${marker} for browser rect smoke`);
}

assertRegionSharesBoundary(
  otherPanel,
  'data-bwe-other-panel',
  'OtherPanel root must use the shared rail/content boundary style'
);
assertRegionSharesBoundary(
  otherPanel,
  'data-bwe-other-tab-rail',
  'OtherPanel tab rail must use the shared rail/content boundary style'
);
assertRegionSharesBoundary(
  otherPanel,
  'data-bwe-other-content',
  'OtherPanel content window must use the shared rail/content boundary style'
);

assertMatches(
  otherPanel,
  /data-bwe-other-tab-strip[\s\S]{0,700}width:\s*'100%'/,
  'OtherPanel tab strip must fill the widened right rail',
);
assertMatches(
  otherPanel,
  /data-bwe-other-tab-strip[\s\S]{0,700}flex:\s*'1 1 0'/,
  'OtherPanel tab strip must flex with the right rail',
);
assertMatches(
  otherPanel,
  /data-bwe-other-tab-viewport[\s\S]{0,700}flex:\s*'1 1 0'/,
  'OtherPanel tab viewport must stretch between the arrow buttons',
);

console.log('OtherPanel tab/content product-width alignment guard passed.');
