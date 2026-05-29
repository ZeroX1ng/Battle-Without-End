import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-title-data-save');

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function createConfig() {
  return {
    battle_toggle: true, battleIntro_toggle: true,
    money_toggle: true, exp_toggle: true, item_toggle: true, other_toggle: true,
    item0_toggle: true, item1_toggle: true, item2_toggle: true, item3_toggle: true, item4_toggle: true, item5_toggle: true,
    sword_toggle: true, axe_toggle: true, bow_toggle: true, crossbow_toggle: true,
    sceptre_toggle: true, staff_toggle: true, tome_toggle: true, shield_toggle: true, dagger_toggle: true,
    body_light_toggle: true, body_medium_toggle: true, body_heavy_toggle: true,
    head_light_toggle: true, head_medium_toggle: true, head_heavy_toggle: true,
    feet_light_toggle: true, feet_medium_toggle: true, feet_heavy_toggle: true,
    necklace_toggle: true, ring_toggle: true,
    autoSell_toggle: true, sound_toggle: true,
  };
}

function extractAs3TitleNames(source) {
  const match = source.match(/public static const list:Vector\.<Title> = new <Title>\[([\s\S]*?)\];/);
  assert(match, 'AS3 TitleList.list must be present');
  const names = [...match[1].matchAll(/TitleList\s*\.\s*([A-Za-z0-9_]+)/g)].map(item => item[1]);
  assert(names.length > 0, 'AS3 TitleList.list must contain title entries');
  return names;
}

function decodeSections(base64Decode, saveString) {
  const decoded = base64Decode(saveString);
  const sections = new Map();
  for (const block of decoded.split('@')) {
    const colonIndex = block.indexOf(':');
    if (colonIndex < 0) continue;
    sections.set(block.slice(0, colonIndex), block.slice(colonIndex + 1));
  }
  return sections;
}

const as3TitleList = readAs3('scripts/iData/iPlayer/TitleList.as');
const as3Title = readAs3('scripts/iData/iPlayer/Title.as');
const as3Player = readAs3('scripts/iGlobal/Player.as');
const saveSystemSource = read('src/core/systems/SaveSystem.ts');
const playerSource = read('src/core/models/Player.ts');
const packageJson = JSON.parse(read('package.json'));

const as3TitleKeys = extractAs3TitleNames(as3TitleList);

assertEqual(as3TitleKeys.length, 45, 'AS3 TitleList.list must contain 45 titles');
assertIncludes(as3Title, 'this.max + "#" + this.count + "#"', 'AS3 Title.save must persist max/count/isGot state');
assertIncludes(as3Title, 'this.isGot = true;', 'AS3 Title.load must restore obtained state from save data');
assertIncludes(as3Player, 'while(_loc6_ < TitleList.list.length)', 'AS3 Player.save must iterate the full TitleList order');
assertIncludes(as3Player, 'TitleList.list[_loc6_].save()', 'AS3 Player.save must write each title state by table index');
assertIncludes(as3Player, 'TitleList.list[_loc16_].load(_loc11_[_loc16_])', 'AS3 Player.load must restore title state by table index');
assertIncludes(as3Player, 'if(_loc18_[1] == TitleList.list[_loc19_].name)', 'AS3 Player.load must restore selected title by internal name');
assertEqual(packageJson.scripts?.['assert:title-data-save-parity'], 'node scripts/assertTitleDataSaveParity.mjs', 'package.json must expose assert:title-data-save-parity');
assertIncludes(saveSystemSource, 'TitleList.length', 'SaveSystem must know the full React TitleList length');
assertIncludes(playerSource, 'export function setTitle', 'Player model must own title equip/toggle behavior');

try {
  const saveModule = await importTsModule({
    entry: join(root, 'src/core/systems/SaveSystem.ts'),
    root,
    outRoot,
  });
  const titleModule = await importTsModule({
    entry: join(root, 'src/core/data/titleData.ts'),
    root,
    outRoot: join(root, '.tmp-parity-title-data-save-title'),
  });
  const playerModule = await importTsModule({
    entry: join(root, 'src/core/models/Player.ts'),
    root,
    outRoot: join(root, '.tmp-parity-title-data-save-player'),
  });
  const mapDataModule = await importTsModule({
    entry: join(root, 'src/core/data/mapData.ts'),
    root,
    outRoot: join(root, '.tmp-parity-title-data-save-map'),
  });
  const raceModule = await importTsModule({
    entry: join(root, 'src/core/data/raceData.ts'),
    root,
    outRoot: join(root, '.tmp-parity-title-data-save-race'),
  });
  const base64Module = await importTsModule({
    entry: join(root, 'src/core/utils/Base64.ts'),
    root,
    outRoot: join(root, '.tmp-parity-title-data-save-base64'),
  });

  const { serializeSave, deserializeSave } = saveModule;
  const { TitleList } = titleModule;
  const { createInitialPlayerState, setTitle } = playerModule;
  const { MapList } = mapDataModule;
  const { list: RaceList } = raceModule;
  const { Base64Decode } = base64Module;

  assertEqual(TitleList.length, as3TitleKeys.length, 'React TitleList length must match AS3');

  const chosenIndex = 17;
  const chosenTitle = { ...TitleList[chosenIndex] };
  chosenTitle.load('123#4#1');
  const switchTitle = { ...TitleList[chosenIndex + 1] };
  switchTitle.load('456#7#1');

  const player = {
    ...createInitialPlayerState(),
    playerName: 'TitleRoundTrip',
    race: RaceList[0],
    titleList: [chosenTitle, switchTitle],
    title: chosenTitle,
  };

  const saveString = serializeSave(player, createConfig(), MapList[0].name, 'slot1');
  const sections = decodeSections(Base64Decode, saveString);
  const titleSaves = (sections.get('TITLE') ?? '').split(',').filter(Boolean);

  assertEqual(titleSaves.length, TitleList.length, '@TITLE must serialize one entry per TitleList item in AS3 order');
  assertEqual(titleSaves[chosenIndex], '123#4#1', '@TITLE must keep obtained title progress at its AS3 table index');
  assertEqual(titleSaves[chosenIndex + 1], '456#7#1', '@TITLE must keep adjacent obtained title progress at its AS3 table index');

  const loaded = deserializeSave(saveString, 'slot1').player;
  assertEqual(loaded.titleList.length, TitleList.length, 'Loaded player titleList must remain the full AS3 title table');
  assertEqual(loaded.titleList.map(title => title.name).join('|'), TitleList.map(title => title.name).join('|'), 'Loaded title order must match React/AS3 TitleList order');
  assertEqual(loaded.titleList[chosenIndex].isGot, true, 'Loaded obtained title must stay obtained');
  assertEqual(loaded.titleList[chosenIndex].max, 123, 'Loaded title max progress must round-trip');
  assertEqual(loaded.titleList[chosenIndex].count, 4, 'Loaded title count progress must round-trip');
  assertEqual(loaded.title?.name, chosenTitle.name, 'Loaded current title must resolve by internal title name');
  assertEqual(loaded.title, loaded.titleList[chosenIndex], 'Loaded current title must be the restored Title instance from titleList');

  const afterCancel = setTitle(loaded, { ...loaded.titleList[chosenIndex] });
  assertEqual(afterCancel.title, null, 'Clicking the currently equipped title from the rendered list must cancel it');

  const afterSwitch = setTitle(loaded, { ...loaded.titleList[chosenIndex + 1] });
  assertEqual(afterSwitch.title?.name, switchTitle.name, 'Clicking another obtained title after load must switch by internal title name');
  assertEqual(afterSwitch.title, loaded.titleList[chosenIndex + 1], 'Switched title must use the restored Title instance from titleList');
} finally {
  await cleanupTranspileOutput(outRoot);
  await cleanupTranspileOutput(join(root, '.tmp-parity-title-data-save-title'));
  await cleanupTranspileOutput(join(root, '.tmp-parity-title-data-save-player'));
  await cleanupTranspileOutput(join(root, '.tmp-parity-title-data-save-map'));
  await cleanupTranspileOutput(join(root, '.tmp-parity-title-data-save-race'));
  await cleanupTranspileOutput(join(root, '.tmp-parity-title-data-save-base64'));
}

console.log('Title data/save parity checks passed.');
