import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const playerOutRoot = join(root, '.tmp-start-character-age-player');
const raceOutRoot = join(root, '.tmp-start-character-age-race');

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

function assertStatus(actual, expected, message) {
  for (const key of ['hp', 'mp', 'str', 'dex', 'intelligence', 'will', 'luck']) {
    assertEqual(actual[key], expected[key], `${message}.${key}`);
  }
}

function parseStatus(source) {
  const values = source.split(',').map(value => Number(value.trim()));
  assertEqual(values.length, 7, `BasicStatus must have 7 values: ${source}`);
  const [hp, mp, str, dex, intelligence, will, luck] = values;
  return { hp, mp, str, dex, intelligence, will, luck };
}

function parseRaceList(as3RaceList) {
  const races = new Map();
  const raceRegex = /public static const (\w+):Race = new Race\("([^"]+)",new BasicStatus\(([^)]*)\),new <BasicStatus>\[([\s\S]*?)\]\);/g;
  for (const match of as3RaceList.matchAll(raceRegex)) {
    const [, id, name, initialSource, ageupSource] = match;
    const ageupList = [...ageupSource.matchAll(/new BasicStatus\(([^)]*)\)/g)].map(item => parseStatus(item[1]));
    races.set(id, {
      id,
      name,
      initial: parseStatus(initialSource),
      ageupList,
    });
  }
  const orderMatch = as3RaceList.match(/public static const list:Vector\.<Race> = new <Race>\[([^\]]+)\]/);
  assert(orderMatch, 'AS3 RaceList.list order must be present');
  const order = orderMatch[1].split(',').map(item => item.trim().replace('RaceList.', ''));
  return order.map(id => {
    const race = races.get(id);
    assert(race, `AS3 race ${id} must be defined`);
    return race;
  });
}

function calculateAs3Stat(race, age) {
  const stat = { ...race.initial };
  let clampedAge = age;
  const overAge = age - 25;
  if (clampedAge > 25) {
    clampedAge = 25;
  }
  for (let currentAge = 10; currentAge < clampedAge; currentAge++) {
    const ageup = race.ageupList[currentAge - 10];
    stat.hp += ageup.hp + 1;
    stat.mp += ageup.mp + 1;
    stat.str += ageup.str;
    stat.dex += ageup.dex;
    stat.will += ageup.will;
    stat.intelligence += ageup.intelligence;
    stat.luck += ageup.luck;
  }
  if (clampedAge === 25) {
    stat.hp += overAge;
    stat.mp += overAge;
  }
  return stat;
}

try {
  const as3RaceList = read('../BOE-O/scripts/iData/RaceList.as');
  const as3Race = read('../BOE-O/scripts/iData/Race.as');
  const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
  const as3MainTimeline = read('../BOE-O/scripts/Main_fla/MainTimeline.as');
  const as3MainScene = read('../BOE-O/scripts/iPanel/iScene/MainScene.as');
  const as3RaceScene = read('../BOE-O/scripts/iPanel/iScene/RaceScene.as');
  const reactRaceScene = read('src/components/scenes/RaceScene.tsx');
  const reactGameContext = read('src/state/GameContext.tsx');
  const reactMainScene = read('src/components/scenes/MainScene.tsx');
  const packageJson = JSON.parse(read('package.json'));

  assert(as3Race.includes('while(_loc4_ < param1)'), 'AS3 Race.caculateStat must accumulate from age 10 to the selected age');
  assert(as3Player.includes('Player.burn(chosenAge,chosenRace)') || as3RaceScene.includes('Player.burn(chosenAge,chosenRace)'), 'AS3 RaceScene must burn the chosen age and race');
  assert(as3Player.includes('equip(new Weapon(EquipmentList.list[1] as WeaponData,1));'), 'AS3 Player.burn must equip starter weapon EquipmentList.list[1]');
  assert(as3MainTimeline.includes('this.addChild(new Main())'), 'AS3 MainTimeline must enter Main');
  assert(as3MainScene.includes('battle = new Battle();'), 'AS3 MainScene must start Battle during scene construction');
  assert(as3RaceScene.includes('while(i < 8)'), 'AS3 RaceScene must expose exactly 8 start ages');
  assert(as3RaceScene.includes('p = new PeopleModel(10 + i);'), 'AS3 RaceScene start ages must run from 10 through 17');

  const ageInputPattern = /type="range"\s+min=\{10\}\s+max=\{17\}/;
  assert(ageInputPattern.test(reactRaceScene), 'RaceScene age selector must use AS3 start-character ages 10-17');
  assert(!reactRaceScene.includes('max={25}'), 'RaceScene must not allow selecting age 25 at character creation');

  if (packageJson.scripts?.['assert:start-character-age'] !== 'node scripts/assertStartCharacterAgeParity.mjs') {
    throw new Error('package.json must expose assert:start-character-age');
  }

  const as3Races = parseRaceList(as3RaceList);
  const raceModule = await importTsModule({
    root,
    outRoot: raceOutRoot,
    entry: join(root, 'src/core/data/raceData.ts'),
  });
  const playerModule = await importTsModule({
    root,
    outRoot: playerOutRoot,
    entry: join(root, 'src/core/models/Player.ts'),
  });
  const equipmentDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/equipmentData.js')));

  const reactRaces = raceModule.list;
  assertEqual(reactRaces.length, as3Races.length, 'RaceList length must match AS3');
  for (let index = 0; index < as3Races.length; index++) {
    const as3RaceData = as3Races[index];
    const reactRace = reactRaces[index];
    assertEqual(reactRace.name, as3RaceData.name, `RaceList order/name at index ${index}`);
    assertStatus(reactRace.initial, as3RaceData.initial, `${as3RaceData.id} initial status`);
    for (let age = 10; age <= 17; age++) {
      assertStatus(reactRace.caculateStat(age), calculateAs3Stat(as3RaceData, age), `${as3RaceData.id} age ${age} preview`);
    }
  }

  const { createInitialPlayerState, playerBurn } = playerModule;
  const { EquipmentList } = equipmentDataModule;
  const chosenRace = reactRaces[3];
  const chosenAge = 17;
  const player = playerBurn(createInitialPlayerState(), chosenAge, chosenRace);
  assertEqual(player.age, chosenAge, 'PLAYER_BURN must keep the selected AS3 start age');
  assertEqual(player.race?.name, chosenRace.name, 'PLAYER_BURN must keep the selected AS3 race');
  assertStatus(player.basicStatus, chosenRace.caculateStat(chosenAge), 'PLAYER_BURN initial basicStatus');
  assert(player.leftHand, 'PLAYER_BURN must equip the AS3 starter weapon');
  assertEqual(player.leftHand.name, EquipmentList[1].name, 'PLAYER_BURN starter weapon must be EquipmentList[1]');
  assertEqual(player.BAGMAX, 50, 'PLAYER_BURN must preserve AS3 starting BAGMAX');
  assertEqual(player.PETMAX, 10, 'PLAYER_BURN must preserve AS3 starting PETMAX');
  assertEqual(player.skillList.length, 12, 'PLAYER_BURN must add AS3 starter skills');

  assert(reactGameContext.includes("case 'PLAYER_BURN'"), 'GameContext must own PLAYER_BURN scene transition');
  assert(reactGameContext.includes("scene: 'main'"), 'PLAYER_BURN must transition to main scene after character creation');
  assert(reactMainScene.includes("dispatch({ type: 'BATTLE_START', map })"), 'MainScene must start the first battle after entering main');
  assert(reactMainScene.includes('new Map(MapList[0])'), 'MainScene first battle must use AS3 default map MapList[0]');

  console.log('Start character and age parity checks passed.');
} finally {
  await cleanupTranspileOutput(playerOutRoot);
  await cleanupTranspileOutput(raceOutRoot);
}
