import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

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

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
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

const as3Player = readAs3('scripts/iGlobal/Player.as');
const as3Battle = readAs3('scripts/iData/Battle.as');
const as3SaveScene = readAs3('scripts/iPanel/iScene/SaveScene.as');

const packageJson = JSON.parse(read('package.json'));
const saveSystem = read('src/core/systems/SaveSystem.ts');
const gameContext = read('src/state/GameContext.tsx');
const reducerEffects = read('src/state/reducerEffects.ts');
const actions = read('src/state/actions.ts');
const saveScene = read('src/components/scenes/SaveScene.tsx');

assertIncludes(as3Player, 'save();', 'AS3 Player.burn must finish by saving the new character');
assertIncludes(as3Player, 'var _loc1_:SharedObject = SharedObject.getLocal(SaveScene.slot);', 'AS3 Player.save must write to SaveScene.slot');
assertIncludes(as3Player, '_loc1_.data.userName = playerName;', 'AS3 Player.save must synchronize slot userName from Player.playerName');
assertIncludes(as3Battle, 'if(Player.caculate % 60 == 0)', 'AS3 Battle.run must trigger save every 60 ticks');
assertIncludes(as3Battle, 'Player.save();', 'AS3 Battle.run must call Player.save for auto-save');
assertIncludes(as3SaveScene, 'public static var slot:String = "";', 'AS3 SaveScene must own the active save slot');
assertIncludes(as3SaveScene, 'slot = "slot" + num;', 'AS3 SaveScene must set slot before new/load flow');
assertIncludes(as3SaveScene, 'Player.playerName = text.text;', 'AS3 SaveScene must set Player.playerName before RaceScene');
assertIncludes(as3SaveScene, 'Player.manualLoad(e.target.data);', 'AS3 manual file import must route loaded file data into Player.manualLoad');

assertEqual(
  packageJson.scripts?.['assert:save-persistence'],
  'node scripts/assertSavePersistenceParity.mjs',
  'package.json must expose assert:save-persistence',
);
assertIncludes(saveSystem, 'export function localSave(', 'SaveSystem must own local SharedObject-equivalent writes');
assertIncludes(saveSystem, 'export function fileImport(', 'SaveSystem must own AS3 FileReference.load equivalent import parsing');
assertIncludes(saveScene, "dispatch({ type: 'PLAYER_SET_NAME', name, slot })", 'SaveScene new-game flow must bind player name and active slot');
assertIncludes(saveScene, "dispatch({ type: 'MANUAL_LOAD', saveData: data })", 'SaveScene import flow must dispatch MANUAL_LOAD with fileImport data');
assertIncludes(actions, "| { type: 'MANUAL_LOAD'; saveData: { playerName: string; slot: string; info: string } }", 'actions.ts must declare MANUAL_LOAD import action');

const playerBurnCase = extractCase(gameContext, 'PLAYER_BURN');
const playerSetNameCase = extractCase(gameContext, 'PLAYER_SET_NAME');
const battleTickCase = extractCase(gameContext, 'BATTLE_TICK');
const saveGameCase = extractCase(gameContext, 'SAVE_GAME');
const manualSaveCase = extractCase(gameContext, 'MANUAL_SAVE');
const manualLoadCase = extractCase(gameContext, 'MANUAL_LOAD');

assertIncludes(playerBurnCase, 'serializeSave(', 'PLAYER_BURN must serialize the newly created player');
assertIncludes(playerBurnCase, 'queueLocalSave(ctx, player.playerName, activeSaveSlot, saveStr);', 'PLAYER_BURN must queue an immediate save after character creation');
assertIncludes(playerBurnCase, "state.activeSaveSlot ?? 'slot1'", 'PLAYER_BURN must fall back to slot1 only when no active slot exists');

assertIncludes(playerSetNameCase, 'queueLocalSave(ctx, nextPlayer.playerName, activeSaveSlot, saveStr);', 'PLAYER_SET_NAME must immediately queue slot metadata synchronization');
assertIncludes(playerSetNameCase, 'serializeSave(', 'PLAYER_SET_NAME must write a valid save payload, not just metadata');

assertNotIncludes(battleTickCase, 'if (!activeSaveSlot) {\n          return withBattlePlayer(newState, playerState);\n        }', 'BATTLE_TICK must not silently skip auto-save when activeSaveSlot is missing');
assertIncludes(battleTickCase, "activeSaveSlot: 'slot1'", 'BATTLE_TICK must use a diagnosable default slot when activeSaveSlot is missing');
assertIncludes(battleTickCase, 'queueLocalSave(ctx, playerState.playerName, activeSaveSlot, saveStr);', 'BATTLE_TICK shouldSave must queue persistence through SaveSystem.localSave');

assertIncludes(saveGameCase, 'hasValidPlayerName(', 'SAVE_GAME must reject empty player.playerName before writing');
assertIncludes(saveGameCase, 'queueLocalSave(ctx, state.player.playerName, action.slot, saveStr);', 'SAVE_GAME must queue persistence through SaveSystem.localSave');
assertIncludes(manualSaveCase, 'hasValidPlayerName(', 'MANUAL_SAVE must reject empty player.playerName before exporting');
assertIncludes(manualSaveCase, 'queueManualSave(ctx, state.player, state.config, mapName, action.slot);', 'MANUAL_SAVE must keep using SaveSystem.manuallySave through the effect layer');
assertIncludes(reducerEffects, "case 'localSave':", 'Game effects must execute queued local save writes');
assertIncludes(reducerEffects, 'localSave(effect.playerName, effect.slot, effect.saveString);', 'Queued local-save effects must call SaveSystem.localSave');
assertIncludes(reducerEffects, "case 'manualSave':", 'Game effects must execute queued manual save exports');
assertIncludes(reducerEffects, 'manuallySave(effect.player, effect.config, effect.mapName, effect.slot);', 'Queued manual-save effects must call SaveSystem.manuallySave');

assertIncludes(manualLoadCase, 'deserializeSave(action.saveData.info, action.saveData.playerName)', 'MANUAL_LOAD must deserialize the imported .boe payload');
assertIncludes(manualLoadCase, 'activeSaveSlot: action.saveData.slot', 'MANUAL_LOAD must restore the imported SaveScene.slot equivalent');
assertIncludes(manualLoadCase, "scene: 'main'", 'MANUAL_LOAD must move imported saves into the playable main scene');

console.log('Save persistence parity checks passed.');
