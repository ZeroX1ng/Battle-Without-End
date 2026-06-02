import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-rebirth-soft-reset');

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

function extractCase(source, actionType) {
  const marker = `case '${actionType}':`;
  const start = source.indexOf(marker);
  assert(start !== -1, `GameContext must contain ${marker}`);
  const nextCase = source.indexOf("\n    case '", start + marker.length);
  const nextDefault = source.indexOf('\n    default:', start + marker.length);
  const candidates = [nextCase, nextDefault].filter(index => index >= 0);
  const end = candidates.length ? Math.min(...candidates) : source.length;
  return source.slice(start, end);
}

function extractBurnBody(source) {
  const match = source.match(/public static function burn\(param1:int, param2:Race\) : void\s*\{([\s\S]*?)\n      private static function caculateInitStat/);
  assert(match, 'AS3 Player.burn body must be readable');
  return match[1];
}

function parseStarterSkills(burnBody) {
  return [...burnBody.matchAll(/Player\.addSkill\(SkillDataList\.([A-Z_]+)\);/g)].map(match => match[1]);
}

function statusSnapshot(status) {
  return {
    hp: status.hp,
    mp: status.mp,
    str: status.str,
    dex: status.dex,
    intelligence: status.intelligence,
    will: status.will,
    luck: status.luck,
  };
}

function sameStatus(actual, expected) {
  const a = statusSnapshot(actual);
  const e = statusSnapshot(expected);
  return Object.keys(e).every(key => a[key] === e[key]);
}

function statValue(status, statName) {
  if (statName === 'attackMin') return status.attack.min;
  if (statName === 'attackMax') return status.attack.max;
  if (statName === 'attack') return status.attack.min + status.attack.max;
  return status[statName];
}

try {
  const as3Player = readAs3('scripts/iGlobal/Player.as');
  const as3OtherWindow = readAs3('scripts/iPanel/iScene/iPanel/iWindow/OtherWindow.as');
  const as3RaceScene = readAs3('scripts/iPanel/iScene/RaceScene.as');
  const reactGameContext = read('src/state/GameContext.tsx');
  const packageJson = JSON.parse(read('package.json'));

  const burnBody = extractBurnBody(as3Player);
  const as3StarterSkills = parseStarterSkills(burnBody);
  assert(
    burnBody.includes('if(!leftHand)') &&
      burnBody.includes('equip(new Weapon(EquipmentList.list[1] as WeaponData,1));'),
    'AS3 Player.burn must equip the starter weapon only when leftHand is empty',
  );
  assert(as3StarterSkills.length === 12, 'AS3 Player.burn must define 12 starter skills');
  assert(burnBody.includes('updateAllInfo();'), 'AS3 Player.burn must recalculate derived state');
  assert(burnBody.includes('save();'), 'AS3 Player.burn must save after burn/rebirth');
  assert(
    as3OtherWindow.includes('TitleList.updateTitleInfo("reborn");') &&
      as3OtherWindow.includes('Player.caculate = 0;'),
    'AS3 rebirth button must grant reborn progress and reset Player.caculate before RaceScene',
  );
  assert(
    as3RaceScene.includes('Player.burn(chosenAge,chosenRace);'),
    'AS3 RaceScene must call Player.burn after age/race confirmation',
  );
  assert(
    packageJson.scripts?.['assert:rebirth-soft-reset-player-state'] === 'node scripts/assertRebirthSoftResetPlayerStateParity.mjs',
    'package.json must expose assert:rebirth-soft-reset-player-state',
  );

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

  const playerOutRoot = join(outRoot, 'player');
  const equipmentDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/equipmentData.js')));
  const skillDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/skillData.js')));
  const weaponModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Weapon.js')));
  const equipmentModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Equipment.js')));
  const skillModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Skill.js')));
  const petModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Pet.js')));
  const petDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/petData.js')));
  const titleDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/titleData.js')));

  const { createInitialPlayerState, playerBurn } = playerModule;
  const { list: RaceList } = raceModule;
  const { EquipmentList } = equipmentDataModule;
  const { SkillDataList } = skillDataModule;
  const { Weapon } = weaponModule;
  const { Equipment } = equipmentModule;
  const { Skill } = skillModule;
  const { Pet } = petModule;
  const { PetDataList } = petDataModule;
  const { createTitleListState } = titleDataModule;

  function equipmentData(name) {
    const data = EquipmentList.find(item => item.name === name);
    assert(data, `Missing equipment data ${name}`);
    return data;
  }

  function skillData(name) {
    const data = SkillDataList.find(item => item.name === name);
    assert(data, `Missing skill data ${name}`);
    return data;
  }

  const leftHand = new Weapon(equipmentData('sword'), 1);
  const rightHand = new Weapon(equipmentData('tome'), 1);
  const head = new Equipment(equipmentData('helm'), 1);
  const feet = new Equipment(equipmentData('Boots'), 1);
  const body = new Equipment(equipmentData('suit'), 1);
  const necklace = new Equipment(equipmentData('necklace'), 1);
  const ring = new Equipment(equipmentData('ring'), 1);
  const bagItem = new Equipment(equipmentData('breastplate'), 1);
  const pet = new Pet(PetDataList[0], 1);
  const storedPet = new Pet(PetDataList[1], 1);
  const starterSkillWithProgress = new Skill(skillData('SMASH'));
  starterSkillWithProgress.level = 8;
  const nonStarterSkill = new Skill(skillData('LIFE_DRAIN'));
  nonStarterSkill.level = 4;
  const titleList = createTitleListState();
  const selectedTitle = titleList.find(title => title.name === 'the Breaker');
  assert(selectedTitle, 'Fixture title must exist');
  selectedTitle.max = 800;
  selectedTitle.count = 1;
  selectedTitle.isGot = true;

  const before = {
    ...createInitialPlayerState(),
    playerName: 'SoftResetHero',
    age: 23,
    race: RaceList[0],
    lv: 42,
    basicStatus: RaceList[0].caculateStat(23),
    gold: 98765,
    xp: 4321,
    ap: 77,
    apCost: 33,
    storeLv: 5,
    BAGMAX: 88,
    PETMAX: 12,
    caculate: 2399,
    leftHand,
    rightHand,
    head,
    feet,
    body,
    necklace,
    ring,
    itemList: [bagItem],
    skillList: [starterSkillWithProgress, nonStarterSkill],
    equipSkillList: [starterSkillWithProgress],
    pet,
    petList: [storedPet],
    title: selectedTitle,
    titleList,
  };

  const nextRace = RaceList[1] ?? RaceList[0];
  const after = playerBurn(before, 10, nextRace);
  const expectedBasic = nextRace.caculateStat(10);
  const failures = [];
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const checkSame = (actual, expected, message) => check(actual === expected, message);
  const checkEqual = (actual, expected, message) => check(actual === expected, `${message} (expected ${expected}, actual ${actual})`);

  checkEqual(after.age, 10, 'playerBurn must apply selected rebirth age');
  checkSame(after.race, nextRace, 'playerBurn must apply selected rebirth race');
  checkEqual(after.lv, 1, 'playerBurn must reset level to 1');
  checkEqual(after.caculate, 0, 'playerBurn must reset caculate to 0 after rebirth');
  check(sameStatus(after.basicStatus, expectedBasic), 'playerBurn must recalculate basicStatus from selected race and age');

  checkEqual(after.playerName, before.playerName, 'playerBurn must preserve playerName');
  checkEqual(after.gold, before.gold, 'playerBurn must preserve gold');
  checkEqual(after.xp, before.xp, 'playerBurn must preserve xp');
  checkEqual(after.ap, before.ap, 'playerBurn must preserve ap');
  checkEqual(after.apCost, before.apCost, 'playerBurn must preserve apCost');
  checkEqual(after.storeLv, before.storeLv, 'playerBurn must preserve storeLv');
  checkEqual(after.BAGMAX, before.BAGMAX, 'playerBurn must preserve BAGMAX');
  checkEqual(after.PETMAX, before.PETMAX, 'playerBurn must preserve PETMAX');

  checkSame(after.leftHand, leftHand, 'playerBurn must preserve existing leftHand instead of overwriting it with the AS3 starter weapon');
  checkSame(after.rightHand, rightHand, 'playerBurn must preserve existing rightHand');
  checkSame(after.head, head, 'playerBurn must preserve head equipment');
  checkSame(after.feet, feet, 'playerBurn must preserve feet equipment');
  checkSame(after.body, body, 'playerBurn must preserve body equipment');
  checkSame(after.necklace, necklace, 'playerBurn must preserve necklace equipment');
  checkSame(after.ring, ring, 'playerBurn must preserve ring equipment');
  check(after.itemList.includes(bagItem), 'playerBurn must preserve inventory itemList');

  const afterStarterSkill = after.skillList.find(skill => skill.skillData.name === 'SMASH');
  const afterNonStarterSkill = after.skillList.find(skill => skill.skillData.name === 'LIFE_DRAIN');
  checkSame(afterStarterSkill, starterSkillWithProgress, 'playerBurn must preserve existing starter skill object');
  checkEqual(afterStarterSkill?.level, 8, 'playerBurn must not reset existing starter skill level');
  checkSame(afterNonStarterSkill, nonStarterSkill, 'playerBurn must preserve non-starter skill progress');
  check(after.equipSkillList.includes(starterSkillWithProgress), 'playerBurn must preserve equipSkillList');
  for (const skillName of as3StarterSkills) {
    check(after.skillList.some(skill => skill.skillData.name === skillName), `playerBurn must add missing AS3 starter skill ${skillName}`);
  }

  checkSame(after.pet, pet, 'playerBurn must preserve equipped pet');
  check(after.petList.includes(storedPet), 'playerBurn must preserve petList');
  const afterSelectedTitle = after.titleList.find(title => title.name === selectedTitle.name);
  check(afterSelectedTitle?.isGot === true, 'playerBurn must preserve titleList progress');
  check(after.title?.name === selectedTitle.name, 'playerBurn must preserve the selected title name');
  checkSame(after.title, afterSelectedTitle, 'playerBurn must repoint title to the matching player-owned title object');

  const starterStats = [
    ...(after.leftHand?.basicStat ?? []),
    ...(after.leftHand?.qualityStat ?? []),
    ...(after.leftHand?.levelStat ?? []),
  ];
  for (const stat of starterStats) {
    check(
      statValue(after.equipStatus, stat.name) >= stat.value,
      `playerBurn must recalculate equipStatus from preserved equipment stat ${stat.name}`,
    );
  }
  check(
    statValue(after.skillStatus, 'hp') > 0 || statValue(after.skillStatus, 'str') > 0,
    'playerBurn must recalculate skillStatus from preserved and starter skills',
  );

  const blankBefore = createInitialPlayerState();
  const blankAfter = playerBurn(blankBefore, 10, RaceList[0]);
  check(blankAfter.leftHand?.name === EquipmentList[1].name, 'playerBurn must add the AS3 starter weapon when leftHand is empty');

  const doRebirthCase = extractCase(reactGameContext, 'DO_REBIRTH');
  check(
    doRebirthCase.includes('serializeSave('),
    'DO_REBIRTH must serialize the reborn player after applying rebirth state',
  );
  check(
    doRebirthCase.includes('queueLocalSave(ctx,') && doRebirthCase.includes('activeSaveSlot'),
    'DO_REBIRTH must queue a local save to the active or fallback slot',
  );
  check(
    !doRebirthCase.includes('title: rebornTitle'),
    'DO_REBIRTH must not overwrite the selected title with the Reborn title; AS3 grants progress but preserves Player.title',
  );

  if (failures.length) {
    throw new Error(`Rebirth soft-reset parity checks failed:\n- ${failures.join('\n- ')}`);
  }

  console.log('Rebirth soft-reset player-state parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
