import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-parity-monster-title-tooltip');

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

function sliceAfter(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing slice start: ${startNeedle}`);
  const end = source.indexOf(endNeedle, start);
  assert(end > start, `Missing slice end after: ${startNeedle}`);
  return source.slice(start, end);
}

try {
  const as3MonsterInfoPanel = read('../BOE-O/scripts/iPanel/iScene/iPanel/MonsterInfoPanel.as');
  const as3MonsterTitle = read('../BOE-O/scripts/iData/iMonster/MonsterTitle.as');
  const reactMonsterInfoPanel = read('src/components/panels/MonsterInfoPanel.tsx');
  const reactMonsterData = read('src/core/data/monsterData.ts');
  const reactInfoWindow = read('src/components/common/InfoWindow.tsx');
  const packageJson = JSON.parse(read('package.json'));

  assertIncludes(as3MonsterInfoPanel, 'this.title = new StringInfoCell', 'AS3 MonsterInfoPanel must render monster titles through StringInfoCell.');
  assertIncludes(as3MonsterInfoPanel, 'this.title.setInfo(MainScene.battle.monster.title.description);', 'AS3 MonsterInfoPanel must attach MonsterTitle.description to the title hover info.');
  assertIncludes(as3MonsterTitle, 'public function get description() : String', 'AS3 MonsterTitle.description getter must exist.');
  assertIncludes(as3MonsterTitle, 'this.statMulList[_loc3_].add > 0', 'AS3 MonsterTitle.description must include positive additive stat lines.');
  assertIncludes(as3MonsterTitle, 'this.statMulList[_loc3_].add < 0', 'AS3 MonsterTitle.description must include negative additive stat lines.');
  assertIncludes(as3MonsterTitle, 'this.statMulList[_loc3_].mul > 1', 'AS3 MonsterTitle.description must include positive multiplier stat lines.');
  assertIncludes(as3MonsterTitle, 'this.statMulList[_loc3_].mul < 1', 'AS3 MonsterTitle.description must include negative multiplier stat lines.');
  assertIncludes(as3MonsterTitle, '_loc1_ = "???";', 'AS3 MonsterTitle.description must fall back to ??? for empty stat lists.');
  assertIncludes(as3MonsterTitle, 'public var xpMul:Number;', 'AS3 MonsterTitle must keep xp multiplier as reward data.');
  assertIncludes(as3MonsterTitle, 'public var goldMul:Number;', 'AS3 MonsterTitle must keep gold multiplier as reward data.');
  assertIncludes(as3MonsterTitle, 'public var dropMul:Number;', 'AS3 MonsterTitle must keep drop multiplier as reward data.');

  const as3DescriptionGetter = sliceAfter(as3MonsterTitle, 'public function get description() : String', 'return _loc1_;');
  assertNotIncludes(as3DescriptionGetter, 'xpMul', 'AS3 MonsterTitle.description must not display xpMul.');
  assertNotIncludes(as3DescriptionGetter, 'goldMul', 'AS3 MonsterTitle.description must not display goldMul.');
  assertNotIncludes(as3DescriptionGetter, 'dropMul', 'AS3 MonsterTitle.description must not display dropMul.');

  if (packageJson.scripts?.['assert:monster-title-tooltip'] !== 'node scripts/assertMonsterTitleTooltipParity.mjs') {
    throw new Error('package.json must expose assert:monster-title-tooltip');
  }

  assertIncludes(reactInfoWindow, 'showItemInfo: (html: string, compareHtml?: string) => void', 'InfoWindow must expose the shared HTML hover window.');
  assertIncludes(reactInfoWindow, 'dangerouslySetInnerHTML={{ __html: html }}', 'InfoWindow item pane must render AS3-style HTML descriptions.');
  assertIncludes(reactMonsterInfoPanel, 'useInfoWindow', 'MonsterInfoPanel title hover must use the global InfoWindow context.');
  assertIncludes(reactMonsterInfoPanel, 'showItemInfo(getMonsterTitleDescription(mon.title))', 'MonsterInfoPanel title hover must show AS3 MonsterTitle.description HTML.');
  assertIncludes(reactMonsterInfoPanel, 'hideItemInfo', 'MonsterInfoPanel title hover must hide the global tooltip on mouse leave.');
  assertIncludes(reactMonsterInfoPanel, 'onMouseEnter={handleTitleMouseEnter}', 'MonsterInfoPanel title text must open the tooltip on hover.');
  assertIncludes(reactMonsterInfoPanel, 'onMouseMove={handleTitleMouseMove}', 'MonsterInfoPanel title text must keep the tooltip following the mouse.');
  assertIncludes(reactMonsterInfoPanel, 'onMouseLeave={hideItemInfo}', 'MonsterInfoPanel title text must close the tooltip on leave.');
  assertNotIncludes(reactMonsterInfoPanel, 'title={getMonsterTitleDescription', 'MonsterInfoPanel must not rely on native browser title tooltips.');
  assertNotIncludes(reactMonsterInfoPanel, 'getMonsterTitleDescription(mon.title, true)', 'MonsterInfoPanel must not down-convert the AS3 HTML description to plain text for title hover.');

  const reactDescriptionHelper = sliceAfter(reactMonsterData, 'export function getMonsterTitleDescription', '\n\n// ═');
  assertIncludes(reactDescriptionHelper, "plain = false", 'Monster title description helper must default to AS3 HTML output.');
  assertIncludes(reactDescriptionHelper, "<font size='20'", 'Monster title description helper must preserve AS3 font HTML lines.');
  assertIncludes(reactDescriptionHelper, '<br/>', 'Monster title description helper must preserve AS3 line breaks.');
  assertIncludes(reactDescriptionHelper, "desc = '???';", 'Monster title description helper must keep AS3 empty-stat fallback.');
  assertNotIncludes(reactDescriptionHelper, 'xpMul', 'React MonsterTitle description must not display xpMul.');
  assertNotIncludes(reactDescriptionHelper, 'goldMul', 'React MonsterTitle description must not display goldMul.');
  assertNotIncludes(reactDescriptionHelper, 'dropMul', 'React MonsterTitle description must not display dropMul.');

  const monsterDataModule = await importTsModule({
    entry: join(root, 'src/core/data/monsterData.ts'),
    root,
    outRoot,
  });
  const { MonsterTitleList, getMonsterTitleDescription } = monsterDataModule;
  const richTitle = MonsterTitleList.find(title => title.statMulList.some(stat => stat.add > 0 && stat.mul > 1));
  assert(richTitle, 'MonsterTitleList must contain a title with additive and multiplier stat modifiers.');

  const html = getMonsterTitleDescription(richTitle);
  assertIncludes(html, '<font size=', 'Runtime monster title description must be HTML.');
  assertIncludes(html, '<br/>', 'Runtime monster title description must include AS3 line breaks.');
  assertNotIncludes(html, 'xpMul', 'Runtime monster title description must not expose xpMul.');
  assertNotIncludes(html, 'goldMul', 'Runtime monster title description must not expose goldMul.');
  assertNotIncludes(html, 'dropMul', 'Runtime monster title description must not expose dropMul.');

  console.log('Monster title tooltip parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
