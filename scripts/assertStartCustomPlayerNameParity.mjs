import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-start-custom-player-name');

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
    throw new Error(`${message}\nexpected: ${expected}\nactual:   ${actual}`);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function extractCase(source, actionType) {
  const marker = `case '${actionType}':`;
  const start = source.indexOf(marker);
  assert(start !== -1, `GameContext must contain ${marker}`);
  const nextCase = source.indexOf("\n    case '", start + marker.length);
  const defaultCase = source.indexOf('\n    default:', start + marker.length);
  const endCandidates = [nextCase, defaultCase].filter(index => index > start);
  const end = endCandidates.length ? Math.min(...endCandidates) : source.length;
  return source.slice(start, end);
}

function createConfig() {
  return {
    battle_toggle: true,
    battleIntro_toggle: true,
    money_toggle: true,
    exp_toggle: true,
    item_toggle: true,
    other_toggle: true,
    item0_toggle: true,
    item1_toggle: true,
    item2_toggle: true,
    item3_toggle: true,
    item4_toggle: true,
    item5_toggle: true,
    sword_toggle: true,
    axe_toggle: true,
    bow_toggle: true,
    crossbow_toggle: true,
    sceptre_toggle: true,
    staff_toggle: true,
    dagger_toggle: true,
    tome_toggle: true,
    shield_toggle: true,
    head_light_toggle: true,
    head_medium_toggle: true,
    head_heavy_toggle: true,
    body_light_toggle: true,
    body_medium_toggle: true,
    body_heavy_toggle: true,
    feet_light_toggle: true,
    feet_medium_toggle: true,
    feet_heavy_toggle: true,
    ring_toggle: true,
    necklace_toggle: true,
    sound_toggle: true,
    autoSell_toggle: true,
  };
}

function installLocalStorageMock() {
  const storage = new Map();
  globalThis.localStorage = {
    get length() {
      return storage.size;
    },
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
    key(index) {
      return [...storage.keys()][index] ?? null;
    },
  };
}

try {
  const as3SaveScene = readAs3('scripts/iPanel/iScene/SaveScene.as');
  const as3Player = readAs3('scripts/iGlobal/Player.as');
  const as3PlayerInfoPanel = readAs3('scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as');
  const packageJson = JSON.parse(read('package.json'));
  const saveScene = read('src/components/scenes/SaveScene.tsx');
  const raceScene = read('src/components/scenes/RaceScene.tsx');
  const gameContext = read('src/state/GameContext.tsx');
  const playerSource = read('src/core/models/Player.ts');
  const saveSystemSource = read('src/core/systems/SaveSystem.ts');
  const playerInfoPanel = read('src/components/panels/PlayerInfoPanel.tsx');

  assertIncludes(as3SaveScene, 'text.type = TextFieldType.INPUT;', 'AS3 empty save slot must render an input field for the character name');
  assertIncludes(as3SaveScene, 'if(_loc2_.text != "")', 'AS3 new button must appear only after a non-empty name is entered');
  assertIncludes(as3SaveScene, 'start.visible = false;', 'AS3 new button must be hidden for an empty name');
  assertIncludes(as3SaveScene, 'slot = "slot" + num;', 'AS3 new-game flow must bind the active save slot before RaceScene');
  assertIncludes(as3SaveScene, 'Player.playerName = text.text;', 'AS3 new-game flow must copy the typed name to Player.playerName before RaceScene');
  assertIncludes(as3Player, 'public static var playerName:String = "Jason";', 'AS3 Player.playerName default must remain Jason before custom naming');
  assertIncludes(as3Player, '_loc1_.data.userName = playerName;', 'AS3 Player.save must persist Player.playerName as userName');
  assertIncludes(as3Player, 'playerName = _loc1_.data.userName;', 'AS3 Player.load must restore playerName from userName');
  assertIncludes(as3Player, 'playerName = _loc2_[0];', 'AS3 Player.manualLoad must restore playerName from the manual file prefix');
  assertIncludes(as3PlayerInfoPanel, 'Player.title.realName + "" + Player.playerName', 'AS3 PlayerInfoPanel must prefix title.realName before playerName');
  assertIncludes(as3PlayerInfoPanel, 'this._name.setText(Player.playerName);', 'AS3 PlayerInfoPanel must show the plain playerName without a title');

  assertEqual(
    packageJson.scripts?.['assert:start-custom-player-name'],
    'node scripts/assertStartCustomPlayerNameParity.mjs',
    'package.json must expose assert:start-custom-player-name',
  );
  assertIncludes(saveScene, 'const name = names[slot].trim()', 'SaveScene must trim empty-slot input before new-game creation');
  assertIncludes(saveScene, 'if (!name || loading) return', 'SaveScene must reject empty names before entering RaceScene');
  assertIncludes(saveScene, 'disabled={!names[slot].trim() || loading}', 'SaveScene new-game button must be disabled while the slot name is empty');
  assertIncludes(saveScene, "dispatch({ type: 'PLAYER_SET_NAME', name, slot })", 'SaveScene must dispatch PLAYER_SET_NAME with both typed name and active slot');
  assertIncludes(saveScene, "dispatch({ type: 'SET_SCENE', scene: 'race' })", 'SaveScene must enter RaceScene only after setting the custom name');
  assertIncludes(raceScene, "dispatch({ type: 'PLAYER_BURN', age, race: selected })", 'RaceScene must finish creation through PLAYER_BURN');

  const playerSetNameCase = extractCase(gameContext, 'PLAYER_SET_NAME');
  const playerBurnCase = extractCase(gameContext, 'PLAYER_BURN');
  const saveGameCase = extractCase(gameContext, 'SAVE_GAME');
  const manualSaveCase = extractCase(gameContext, 'MANUAL_SAVE');
  const manualLoadCase = extractCase(gameContext, 'MANUAL_LOAD');
  const loadGameCase = extractCase(gameContext, 'LOAD_GAME');

  assertIncludes(playerSetNameCase, 'playerName: action.name', 'PLAYER_SET_NAME must write the custom name into state.player');
  assertIncludes(playerSetNameCase, 'activeSaveSlot = action.slot ?? state.activeSaveSlot', 'PLAYER_SET_NAME must bind the selected slot before RaceScene');
  assertIncludes(playerSetNameCase, 'hasValidPlayerName(nextPlayer)', 'PLAYER_SET_NAME must avoid saving empty player names');
  assertIncludes(playerSetNameCase, 'queueLocalSave(ctx, nextPlayer.playerName, activeSaveSlot, saveStr);', 'PLAYER_SET_NAME must persist slot metadata and payload with the typed name');
  assertIncludes(playerBurnCase, 'createNewPlayerState(action.age, action.race, state.player.playerName)', 'PLAYER_BURN must pass the pre-creation custom name into createNewPlayerState');
  assertIncludes(playerBurnCase, 'queueLocalSave(ctx, player.playerName, activeSaveSlot, saveStr);', 'PLAYER_BURN must save the burned player under the custom name');
  assertIncludes(saveGameCase, 'hasValidPlayerName(state.player)', 'SAVE_GAME must reject empty player names');
  assertIncludes(manualSaveCase, 'hasValidPlayerName(state.player)', 'MANUAL_SAVE must reject empty player names');
  assertIncludes(manualLoadCase, 'deserializeSave(action.saveData.info, action.saveData.playerName)', 'MANUAL_LOAD must deserialize with the imported userName prefix');
  assertIncludes(loadGameCase, 'deserializeSave(saveData.info, saveData.userName)', 'LOAD_GAME must deserialize with local save userName');
  assertIncludes(playerSource, "playerName: 'Jason'", 'Initial player state must keep the AS3 default name before empty-slot naming');
  assertIncludes(playerSource, "export function createNewPlayerState(age: number, race: Race, playerName: string = 'Jason')", 'createNewPlayerState must accept a pre-creation custom name');
  assertIncludes(playerSource, 'playerBurn({ ...createInitialPlayerState(), playerName }, age, race)', 'createNewPlayerState must not drop the custom name during playerBurn');
  assertIncludes(saveSystemSource, 'userName: playerName', 'localSave must write userName from playerName');
  assertIncludes(saveSystemSource, 'const content = playerName + \'<>\' + slot + \'<>\' + saveString;', 'fileExport must put playerName in the manual save prefix');
  assertIncludes(saveSystemSource, 'playerName: parts[0]', 'fileImport must read playerName from the manual save prefix');
  assertIncludes(playerInfoPanel, '{s.titleRealName ? <span', 'PlayerInfoPanel must keep title prefix display separate from the playerName');
  assertIncludes(playerInfoPanel, '}</span> : null}{s.playerName}', 'PlayerInfoPanel must show the custom playerName after any title prefix');

  installLocalStorageMock();

  const playerModule = await importTsModule({
    root,
    outRoot: join(outRoot, 'player'),
    entry: join(root, 'src/core/models/Player.ts'),
  });
  const raceModule = await importTsModule({
    root,
    outRoot: join(outRoot, 'race'),
    entry: join(root, 'src/core/data/raceData.ts'),
  });
  const saveModule = await importTsModule({
    root,
    outRoot: join(outRoot, 'save'),
    entry: join(root, 'src/core/systems/SaveSystem.ts'),
  });
  const titleModule = await import(pathToFileURL(join(outRoot, 'player/core/data/titleData.js')));

  const { createNewPlayerState } = playerModule;
  const { list: RaceList } = raceModule;
  const { serializeSave, deserializeSave, localSave, localLoad } = saveModule;
  const { TitleList } = titleModule;

  const customName = 'DearMaster';
  const activeSlot = 'slot2';
  const player = createNewPlayerState(10, RaceList[0], customName);
  assertEqual(player.playerName, customName, 'PLAYER_BURN/createNewPlayerState must preserve the custom name');

  const saveString = serializeSave(player, createConfig(), 'Meadow', activeSlot);
  localSave(player.playerName, activeSlot, saveString);
  const localData = localLoad(activeSlot);
  assert(localData, 'localSave/localLoad must round-trip a new custom-name save');
  assertEqual(localData.userName, customName, 'local save userName must equal the custom player name');
  const loadedLocal = deserializeSave(localData.info, localData.userName);
  assertEqual(loadedLocal.player.playerName, customName, 'LOAD_GAME deserialize path must restore the custom player name');
  assertEqual(loadedLocal.playerName, customName, 'LOAD_GAME deserialize metadata must report the custom player name');

  const exportedContent = `${customName}<>${activeSlot}<>${saveString}`;
  const [manualName, manualSlot, manualInfo] = exportedContent.split('<>');
  assertEqual(manualName, customName, 'manual export prefix must contain the custom player name');
  assertEqual(manualSlot, activeSlot, 'manual export prefix must contain the active slot');
  const loadedManual = deserializeSave(manualInfo, manualName);
  assertEqual(loadedManual.player.playerName, customName, 'MANUAL_LOAD/import deserialize path must restore the custom player name');

  const title = { ...TitleList[0], isGot: true, realName: 'Brave ' };
  const titledPlayer = { ...player, title, titleList: [title] };
  const displayedName = `${titledPlayer.title.realName}${titledPlayer.playerName}`;
  assertEqual(displayedName, `Brave ${customName}`, 'PlayerInfoPanel title-prefix rule must preserve the custom player name');

  console.log('Start custom player name parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
