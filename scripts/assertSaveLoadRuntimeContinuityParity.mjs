import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-save-load-runtime-continuity');

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

function createConfig(overrides = {}) {
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
    ...overrides,
  };
}

const persistedToggleKeys = [
  'battle', 'battleIntro', 'money', 'exp', 'item',
  'item0', 'item1', 'item2', 'item3', 'item4',
  'sword', 'axe', 'bow', 'crossbow', 'sceptre', 'staff', 'dagger', 'tome', 'shield',
  'head_light', 'head_medium', 'head_heavy',
  'body_light', 'body_medium', 'body_heavy',
  'feet_light', 'feet_medium', 'feet_heavy',
  'ring', 'necklace', 'sound',
];

const as3Player = readAs3('scripts/iGlobal/Player.as');
const as3SaveScene = readAs3('scripts/iPanel/iScene/SaveScene.as');
const as3MainScene = readAs3('scripts/iPanel/iScene/MainScene.as');
const as3AllInfoInnerPanel = readAs3('scripts/iPanel/iScene/iPanel/iAllInfo/AllInfoInnerPanel.as');
const as3Battle = readAs3('scripts/iData/Battle.as');
const as3RaceList = readAs3('scripts/iData/RaceList.as');
const as3Equipment = readAs3('scripts/iData/iItem/Equipment.as');
const as3Monster = readAs3('scripts/iData/iMonster/Monster.as');
const as3Boss = readAs3('scripts/iData/iMonster/Boss.as');

const saveSystem = read('src/core/systems/SaveSystem.ts');
const base64 = read('src/core/utils/Base64.ts');
const gameContext = read('src/state/GameContext.tsx');
const actions = read('src/state/actions.ts');
const types = read('src/core/types.ts');
const systemConfig = read('src/core/systems/SystemConfig.ts');
const battleModel = read('src/core/models/Battle.ts');
const monsterModel = read('src/core/models/Monster.ts');
const saveScene = read('src/components/scenes/SaveScene.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Player, '_loc4_ = _loc4_ + race.name;', 'AS3 Player.save must persist the current race.name in @RACE');
assertIncludes(as3Player, 'if(_loc6_[1] == "undeath")', 'AS3 Player.load must keep the legacy undeath compatibility branch');
assertIncludes(as3Player, 'if(_loc6_[1] == RaceList.list[_loc16_].name)', 'AS3 Player.load must restore race by RaceList.list name');
assertIncludes(as3Player, '_loc4_ += _loc5_[_loc6_] + "#" + Global[_loc5_[_loc6_] + "_toggle"] + "#";', 'AS3 Player.save must write Global toggles as strings');
assertIncludes(as3Player, 'if(_loc17_[_loc16_ + 1] == "true")', 'AS3 Player.load must restore true/false toggle strings');
assertIncludes(as3SaveScene, 'public static var slot:String = "";', 'AS3 SaveScene owns the active save slot');
assertIncludes(as3SaveScene, 'slot = "slot" + num;', 'AS3 SaveScene must set the active slot before new/load flow');
assertIncludes(as3SaveScene, 'Player.load();', 'AS3 SaveScene load must call Player.load after selecting the slot');
assertIncludes(as3MainScene, 'battle = new Battle();', 'AS3 MainScene rebuilds Battle after load/new scene construction');
assertIncludes(as3MainScene, 'battle.init();', 'AS3 MainScene starts Battle.init after scene construction');
assertIncludes(as3AllInfoInnerPanel, 'public function addText', 'AS3 AllInfoInnerPanel must remain the visible log sink after scene rebuild');
assertIncludes(as3Battle, 'if(Player.caculate % 60 == 0)', 'AS3 Battle.run must trigger auto-save every 60 battle ticks');
assertIncludes(as3Battle, 'Player.save();', 'AS3 Battle.run auto-save target must be Player.save and therefore SaveScene.slot');
assertIncludes(as3Battle, 'this.monster.dropItem();', 'AS3 Battle.giveTrophy delegates item filtering to Monster/Boss drops');
assertIncludes(as3RaceList, 'public static const list:Vector.<Race>', 'AS3 RaceList must be the race source of truth');
assertIncludes(as3Equipment, 'public static function load(param1:String) : Equipment', 'AS3 Equipment.load must support save/load item reconstruction');
assertIncludes(as3Monster, 'Global["item" + _loc2_.quality + "_toggle"]', 'AS3 Monster.dropItem must consume restored quality toggles');
assertIncludes(as3Boss, 'Global["item" + _loc2_.quality + "_toggle"]', 'AS3 Boss.dropItem must consume restored quality toggles');

assertEqual(packageJson.scripts?.['assert:save-load-runtime-continuity'], 'node scripts/assertSaveLoadRuntimeContinuityParity.mjs', 'package.json must expose assert:save-load-runtime-continuity');
assertIncludes(saveSystem, 'deserializeSave', 'SaveSystem must own AS3 save deserialization');
assertIncludes(base64, 'TextEncoder', 'Base64Encode must preserve non-ASCII AS3 race names through UTF-8 bytes');
assertIncludes(base64, 'TextDecoder', 'Base64Decode must restore non-ASCII AS3 race names through UTF-8 bytes');
assertNotIncludes(saveSystem, '?? RaceList[0]', 'SaveSystem must not silently convert unknown or corrupted races to Human');
assertIncludes(saveSystem, "raceName === 'undeath'", 'SaveSystem must keep AS3 undeath compatibility while resolving races');
assertIncludes(saveSystem, "val === 'true' || val === '1'", 'SaveSystem must restore AS3 true/false toggles and legacy numeric toggles');
assertIncludes(types, 'activeSaveSlot: string | null;', 'GameState must remember the AS3 SaveScene.slot equivalent');
assertIncludes(actions, "| { type: 'PLAYER_SET_NAME'; name: string; slot?: string }", 'New-game name selection must be able to bind the active save slot');
assertIncludes(saveScene, "dispatch({ type: 'PLAYER_SET_NAME', name, slot })", 'SaveScene new-game flow must set the active slot before RaceScene');

const battleTickCase = extractCase(gameContext, 'BATTLE_TICK');
const loadGameCase = extractCase(gameContext, 'LOAD_GAME');
const saveGameCase = extractCase(gameContext, 'SAVE_GAME');
assertNotIncludes(battleTickCase, "'auto'", 'BATTLE_TICK must not auto-save to a hidden auto slot');
assertIncludes(battleTickCase, 'const activeSaveSlot = newState.activeSaveSlot;', 'BATTLE_TICK must read the current active save slot');
assertIncludes(battleTickCase, 'localSave(playerState.playerName, activeSaveSlot, saveStr);', 'BATTLE_TICK must auto-save back to the active slot');
assertIncludes(loadGameCase, 'activeSaveSlot: action.slot', 'LOAD_GAME must remember the loaded slot as the active save slot');
assertIncludes(saveGameCase, 'activeSaveSlot: action.slot', 'SAVE_GAME must update the active save slot when the player saves there');
assertIncludes(gameContext, 'new Battle(player, new GameMap(mapData), config)', 'LOAD_GAME must rebuild Battle with restored player/map/config');
assertIncludes(gameContext, 'battle.init();', 'LOAD_GAME must initialize the rebuilt battle after load');
assertIncludes(systemConfig, 'shouldDisplayLog(config:', 'SystemConfig must own restored log-toggle consumption');
assertIncludes(systemConfig, 'shouldKeepDroppedItem(config:', 'SystemConfig must own restored drop-toggle consumption');
assertIncludes(battleModel, 'this.monster.dropItem(this.playerState, this.map.mapData.modifier, this.config)', 'Battle must pass restored config into drop processing');
assertIncludes(monsterModel, 'handleDroppedItem(playerState, drop, config)', 'Monster/Boss drops must consume restored config toggles');

try {
  const saveModule = await importTsModule({
    entry: join(root, 'src/core/systems/SaveSystem.ts'),
    root,
    outRoot,
  });
  const raceModule = await importTsModule({
    entry: join(root, 'src/core/data/raceData.ts'),
    root,
    outRoot: join(root, '.tmp-parity-save-load-runtime-continuity-race'),
  });
  const playerModule = await importTsModule({
    entry: join(root, 'src/core/models/Player.ts'),
    root,
    outRoot: join(root, '.tmp-parity-save-load-runtime-continuity-player'),
  });
  const mapDataModule = await importTsModule({
    entry: join(root, 'src/core/data/mapData.ts'),
    root,
    outRoot: join(root, '.tmp-parity-save-load-runtime-continuity-map'),
  });
  const systemConfigModule = await importTsModule({
    entry: join(root, 'src/core/systems/SystemConfig.ts'),
    root,
    outRoot: join(root, '.tmp-parity-save-load-runtime-continuity-config'),
  });

  const { serializeSave, deserializeSave } = saveModule;
  const { list: RaceList } = raceModule;
  const { createInitialPlayerState } = playerModule;
  const { MapList } = mapDataModule;
  const { shouldDisplayLog, shouldKeepDroppedItem } = systemConfigModule;
  const createSavedPlayer = (race = RaceList[0]) => ({
    ...createInitialPlayerState(),
    playerName: 'RoundTrip',
    race,
  });

  for (const race of RaceList) {
    const player = createSavedPlayer(race);
    const saveString = serializeSave(player, createConfig(), MapList[0].name, 'slot1');
    const loaded = deserializeSave(saveString, 'RoundTrip');
    assertEqual(loaded.player.race.name, race.name, `serializeSave/deserializeSave must preserve race ${race.name}`);
  }

  const mixedConfig = createConfig();
  for (let index = 0; index < persistedToggleKeys.length; index++) {
    const key = `${persistedToggleKeys[index]}_toggle`;
    mixedConfig[key] = index % 2 === 0;
  }
  const savedToggles = serializeSave(createSavedPlayer(), mixedConfig, MapList[0].name, 'slot1');
  const loadedToggles = deserializeSave(savedToggles, 'ToggleUser');
  for (const key of persistedToggleKeys) {
    const configKey = `${key}_toggle`;
    assertEqual(loadedToggles.config[configKey], mixedConfig[configKey], `@GLOBAL ${configKey} must round-trip true/false`);
  }

  const loadedAllTrue = deserializeSave(
    serializeSave(createSavedPlayer(), createConfig(), MapList[0].name, 'slot1'),
    'LogUser'
  );
  assert(shouldDisplayLog(loadedAllTrue.config, 'battle'), 'Loaded battle_toggle=true must allow battle logs');
  assert(shouldDisplayLog(loadedAllTrue.config, 'item'), 'Loaded item_toggle=true must allow item logs');
  assert(
    shouldKeepDroppedItem(loadedAllTrue.config, { quality: 1, category: 'melee', name: 'sword', getMoney: () => 1 }),
    'Loaded item and equipment toggles must allow an enabled equipment drop'
  );
} finally {
  await cleanupTranspileOutput(outRoot);
  await cleanupTranspileOutput(join(root, '.tmp-parity-save-load-runtime-continuity-race'));
  await cleanupTranspileOutput(join(root, '.tmp-parity-save-load-runtime-continuity-player'));
  await cleanupTranspileOutput(join(root, '.tmp-parity-save-load-runtime-continuity-map'));
  await cleanupTranspileOutput(join(root, '.tmp-parity-save-load-runtime-continuity-config'));
}

console.log('Save/load runtime continuity parity checks passed.');
