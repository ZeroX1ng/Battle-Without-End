import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-start-burn-save');

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

function extractCase(source, actionType) {
  const marker = `case '${actionType}':`;
  const start = source.indexOf(marker);
  assert(start !== -1, `GameContext must contain ${marker}`);
  const nextCase = source.indexOf("\n    case '", start + marker.length);
  return source.slice(start, nextCase === -1 ? source.length : nextCase);
}

function extractBurnBody(source) {
  const match = source.match(/public static function burn\(param1:int, param2:Race\) : void\s*\{([\s\S]*?)\n      private static function caculateInitStat/);
  assert(match, 'AS3 Player.burn body must be readable');
  return match[1];
}

function parseStarterSkills(burnBody) {
  return [...burnBody.matchAll(/Player\.addSkill\(SkillDataList\.([A-Z_]+)\);/g)].map(match => match[1]);
}

function statValue(status, statName) {
  if (statName === 'attackMin') return status.attack.min;
  if (statName === 'attackMax') return status.attack.max;
  if (statName === 'attack') return status.attack.min + status.attack.max;
  return status[statName];
}

try {
  const as3Player = readAs3('scripts/iGlobal/Player.as');
  const as3RaceScene = readAs3('scripts/iPanel/iScene/RaceScene.as');
  const reactPlayer = read('src/core/models/Player.ts');
  const reactGameContext = read('src/state/GameContext.tsx');
  const reactReducerEffects = read('src/state/reducerEffects.ts');
  const packageJson = JSON.parse(read('package.json'));

  const burnBody = extractBurnBody(as3Player);
  const as3StarterSkills = parseStarterSkills(burnBody);

  assertEqual(as3StarterSkills.length, 12, 'AS3 Player.burn must define 12 starter skills');
  assert(
    burnBody.includes('equip(new Weapon(EquipmentList.list[1] as WeaponData,1));'),
    'AS3 Player.burn must equip starter weapon through equip()',
  );
  assert(burnBody.includes('updateAllInfo();'), 'AS3 Player.burn must refresh derived state');
  assert(burnBody.includes('save();'), 'AS3 Player.burn must save after character creation');
  assert(
    as3RaceScene.includes('Player.burn(chosenAge,chosenRace);'),
    'AS3 RaceScene must call Player.burn after character confirmation',
  );

  assertEqual(
    packageJson.scripts?.['assert:start-burn-save'],
    'node scripts/assertStartBurnSaveParity.mjs',
    'package.json must expose assert:start-burn-save',
  );

  const playerBurnMatch = reactPlayer.match(/export function playerBurn[\s\S]*?\n\}/);
  assert(playerBurnMatch, 'React playerBurn must be readable');
  assert(
    !/\.leftHand\s*=/.test(playerBurnMatch[0]) && !/\.rightHand\s*=/.test(playerBurnMatch[0]),
    'playerBurn must not assign equipment slots directly; use equipItem() so old slots and derived state are refreshed',
  );
  assert(
    playerBurnMatch[0].includes('equipItem('),
    'playerBurn must route starter weapon setup through equipItem()',
  );

  const playerBurnCase = extractCase(reactGameContext, 'PLAYER_BURN');
  assert(playerBurnCase.includes('serializeSave('), 'PLAYER_BURN must serialize the newly created state');
  assert(playerBurnCase.includes('queueLocalSave(ctx, player.playerName, activeSaveSlot, saveStr)'), 'PLAYER_BURN must queue persistence for the newly created state');
  assert(playerBurnCase.includes('state.activeSaveSlot'), 'PLAYER_BURN must save to the active slot');
  assert(reactReducerEffects.includes("case 'localSave':"), 'GameProvider effects must execute queued local-save writes after reducer commit');
  assert(reactReducerEffects.includes('localSave(effect.playerName, effect.slot, effect.saveString)'), 'Queued local-save effects must persist through SaveSystem.localSave');

  const playerOutRoot = join(outRoot, 'player');
  const raceOutRoot = join(outRoot, 'race');
  const playerModule = await importTsModule({
    root,
    outRoot: playerOutRoot,
    entry: join(root, 'src/core/models/Player.ts'),
  });
  const raceModule = await importTsModule({
    root,
    outRoot: raceOutRoot,
    entry: join(root, 'src/core/data/raceData.ts'),
  });
  const equipmentDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/equipmentData.js')));
  const weaponModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Weapon.js')));

  const { createInitialPlayerState, createNewPlayerState, playerBurn } = playerModule;
  const { list: RaceList } = raceModule;
  const { EquipmentList } = equipmentDataModule;
  const { Weapon } = weaponModule;

  const player = createNewPlayerState(10, RaceList[0], createInitialPlayerState().playerName);
  const starterWeapon = EquipmentList[1];

  assert(player.leftHand, 'playerBurn must equip the AS3 starter weapon');
  assertEqual(player.leftHand.name, starterWeapon.name, 'playerBurn starter weapon must be EquipmentList[1]');
  assertEqual(player.rightHand, null, 'new-character playerBurn must start without rightHand equipment');
  assertEqual(player.skillList.length, 12, 'playerBurn must create the 12 AS3 starter skills');
  assertEqual(
    player.skillList.map(skill => skill.skillData.name).join(','),
    as3StarterSkills.join(','),
    'playerBurn starter skill order must match AS3 Player.burn',
  );

  const starterStats = [
    ...player.leftHand.basicStat,
    ...player.leftHand.qualityStat,
    ...player.leftHand.levelStat,
  ];
  for (const stat of starterStats) {
    assert(
      statValue(player.equipStatus, stat.name) >= stat.value,
      `playerBurn equipStatus must include starter weapon ${stat.name} bonus`,
    );
  }

  console.log('Start burn and auto-save parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
