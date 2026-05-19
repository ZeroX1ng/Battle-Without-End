import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-map-selection');

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function extractCase(source, caseName) {
  const start = source.indexOf(`case '${caseName}':`);
  if (start < 0) {
    throw new Error(`Missing ${caseName} reducer case`);
  }
  const nextCase = source.indexOf("\n    case '", start + 1);
  const defaultCase = source.indexOf('\n    default:', start + 1);
  const endCandidates = [nextCase, defaultCase].filter(index => index > start);
  const end = endCandidates.length ? Math.min(...endCandidates) : source.length;
  return source.slice(start, end);
}

async function withRandom(value, fn) {
  const original = Math.random;
  Math.random = () => value;
  try {
    return await fn();
  } finally {
    Math.random = original;
  }
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

const as3MapList = read('../BOE-O/scripts/iData/iMap/MapList.as');
const as3Map = read('../BOE-O/scripts/iData/iMap/Map.as');
const as3MapCell = read('../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSystem/iMap/MapCell.as');
const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
const as3Global = read('../BOE-O/scripts/iGlobal/Global.as');
const gameContext = read('src/state/GameContext.tsx');
const mapWindow = read('src/components/windows/MapWindow.tsx');
const saveSystem = read('src/core/systems/SaveSystem.ts');
const packageJson = JSON.parse(read('package.json'));
const mapSwitchCase = extractCase(gameContext, 'MAP_SWITCH');

assertIncludes(as3MapList, 'public static const list:Vector.<MapData>', 'AS3 MapList must be the static map table source');
assertIncludes(as3Map, 'this.mapData.monsterList', 'AS3 Map average CP must use mapData.monsterList');
assertIncludes(as3MapCell, 'Global.map = this.map;', 'AS3 MapCell.down switches Global.map directly');
assertIncludes(as3MapCell, 'MainScene.battle.init();', 'AS3 map switch reinitializes battle');
assertIncludes(as3Global, 'public static var map:Map = new Map(MapList.list[0]);', 'AS3 default map must be MapList.list[0]');
assertIncludes(as3Player, '_loc4_ = _loc4_ + ("map," + Global.map.mapData.name + "#");', 'AS3 save must write the current map AS3 name');
assertIncludes(as3Player, 'Global.map = new Map(MapList.list[_loc19_]);', 'AS3 load must restore Global.map by AS3 map name');

assertEqual(packageJson.scripts?.['assert:map-selection'], 'node scripts/assertMapSelectionParity.mjs', 'package.json must expose assert:map-selection');
assertIncludes(mapWindow, 'currentMapName', 'MapWindow must derive and display the current map');
assertIncludes(mapWindow, "dispatch({ type: 'MAP_SWITCH', map: newMap })", 'MapWindow must switch maps through MAP_SWITCH');
assertNotIncludes(mapWindow, 'gridTemplateColumns', 'MapWindow must not treat AS3 pixel coordinates as CSS grid columns');
assertIncludes(mapWindow, 'position: \'absolute\'', 'MapWindow must render AS3 map cells as visible positioned markers');
assertIncludes(mapWindow, 'left: `${(mapData.x / MAP_WIDTH) * 100}%`', 'MapWindow must scale AS3 x coordinates into the visible map surface');
assertIncludes(mapWindow, 'top: `${(mapData.y / MAP_HEIGHT) * 100}%`', 'MapWindow must scale AS3 y coordinates into the visible map surface');
assertIncludes(gameContext, "case 'MAP_SWITCH':", 'GameContext must handle MAP_SWITCH');
assertNotIncludes(mapSwitchCase, "if (!state.battle) return state;", 'MAP_SWITCH must not silently ignore selection when battle is not present');
assertIncludes(gameContext, 'getCurrentMapName(state)', 'Save paths must resolve a real AS3 map name from current state');
assertNotIncludes(gameContext, "?? 'unknown'", 'Save paths must not write unknown as the map name fallback');
assertIncludes(gameContext, 'getMapByName(mapName)', 'LOAD_GAME must restore the saved AS3 map name');
assertIncludes(gameContext, 'new Battle(player, new GameMap', 'LOAD_GAME must rebuild battle state with the restored map');
assertIncludes(saveSystem, 'parseSelection', 'SaveSystem must parse AS3 SELECTION map data');

const mapDataModule = await importTsModule({
  entry: join(root, 'src/core/data/mapData.ts'),
  root,
  outRoot,
});
const mapModule = await importTsModule({
  entry: join(root, 'src/core/models/Map.ts'),
  root,
  outRoot,
});
const battleModule = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});
const playerModule = await importTsModule({
  entry: join(root, 'src/core/models/Player.ts'),
  root,
  outRoot,
});
const saveModule = await importTsModule({
  entry: join(root, 'src/core/systems/SaveSystem.ts'),
  root,
  outRoot,
});

const { MapList } = mapDataModule;
const { Map } = mapModule;
const { Battle } = battleModule;
const { createInitialPlayerState } = playerModule;
const { serializeSave, deserializeSave } = saveModule;

assertEqual(MapList[0].name, 'Town of Beginner', 'Initial default map must match AS3 MapList.list[0]');

const targetMapData = MapList[1];
const targetMap = new Map(targetMapData);
assertEqual(targetMap.mapData.name, 'Gairech Hill', 'Runtime map must preserve the selected AS3 map name');

await withRandom(0.5, async () => {
  const battle = new Battle(createInitialPlayerState(), targetMap, createConfig());
  battle.init();
  const monsterName = battle.monster?.data?.name;
  assert(
    targetMapData.monsterList.some(monster => monster.name === monsterName),
    `Battle.init must generate monsters from selected map monsterList, got ${monsterName}`
  );
});

const saveString = serializeSave(createInitialPlayerState(), createConfig(), targetMapData.name, 'slot1');
const loaded = deserializeSave(saveString, 'Jason');
assertEqual(loaded.mapName, targetMapData.name, 'Save/load must preserve the AS3 map name in @SELECTION');

await cleanupTranspileOutput(outRoot);
console.log('Map selection parity guard passed.');
