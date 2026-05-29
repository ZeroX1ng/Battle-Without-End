import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-growth-skill-protection');

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

function assertNotIncludes(source, needle, message) {
  if (source.includes(needle)) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertFiniteStatus(status, message) {
  for (const key of ['hp', 'mp', 'str', 'dex', 'intelligence', 'will', 'luck']) {
    if (!Number.isFinite(status[key])) {
      throw new Error(`${message}.${key} must stay finite, got ${status[key]}`);
    }
  }
}

function clonePlayer(player) {
  return {
    ...player,
    basicStatus: player.basicStatus.clone(),
    skillStatus: player.skillStatus.clone(),
    equipStatus: player.equipStatus.clone(),
    skillList: [...player.skillList],
    equipSkillList: [...player.equipSkillList],
    itemList: [...player.itemList],
    titleList: [...player.titleList],
    petList: [...player.petList],
  };
}

function withRandom(value, fn) {
  const original = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

const as3Player = readAs3('scripts/iGlobal/Player.as');
const as3SkillDataList = readAs3('scripts/iData/iSkill/SkillDataList.as');
const playerModel = read('src/core/models/Player.ts');
const skillBehaviors = read('src/core/data/skillBehaviors.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Player, 'if(_loc1_ < 1 && age <= 25)', 'AS3 only applies the ageup AP floor through age 25');
assertIncludes(as3Player, 'if(_loc1_ > 0)', 'AS3 does not add ageup AP when the post-ageup formula is non-positive');
assertIncludes(as3SkillDataList, 'monster.protection - Player.protectionReduce - Player.protectionIgnore', 'AS3 active skill formulas read live monster.protection');

assertIncludes(playerModel, 'const ageupIndex = s.age - 11;', 'React ageup must calculate the AS3 ageupList index once');
assertIncludes(playerModel, 'const ageGrowth = s.race && ageupIndex >= 0 ? s.race.ageupList[ageupIndex] : undefined;', 'React ageup must guard against negative ageupList indexes');
assertIncludes(playerModel, 'if (s.age <= 25 && s.race && ageGrowth)', 'React ageup must only read race growth when the guarded entry exists');
assertIncludes(playerModel, 'if (apGain > 0) s.ap += apGain;', 'React ageup must keep the AS3 positive-AP gate');
assertNotIncludes(playerModel, 'Math.max(1, 18 - s.age)', 'React ageup must not keep applying the AP floor after age 25');
assertNotIncludes(skillBehaviors, 'mon.data.protection', 'Active skill formulas must read live monster.protection, not static monster data');
assertNotIncludes(skillBehaviors, 'm.data.protection', 'monsterPro must read live monster.protection, not static monster data');

if (packageJson.scripts?.['assert:growth-skill-protection'] !== 'node scripts/assertPlayerGrowthAndSkillProtectionParity.mjs') {
  throw new Error('package.json must expose assert:growth-skill-protection');
}

const playerModule = await importTsModule({
  entry: join(root, 'src/core/models/Player.ts'),
  root,
  outRoot,
});
const raceModule = await importTsModule({
  entry: join(root, 'src/core/data/raceData.ts'),
  root,
  outRoot,
});
const skillBehaviorModule = await importTsModule({
  entry: join(root, 'src/core/data/skillBehaviors.ts'),
  root,
  outRoot,
});

const { createInitialPlayerState, ageup } = playerModule;
const { HUMAN } = raceModule;
const { behave_bolt } = skillBehaviorModule;

const age10Player = clonePlayer(createInitialPlayerState());
age10Player.race = HUMAN;
age10Player.age = 10;
age10Player.basicStatus = HUMAN.caculateStat(10);
const agedTo11 = ageup(age10Player);
assertEqual(agedTo11.age, 11, 'ageup from the AS3 initial age 10 reaches age 11');
assertFiniteStatus(agedTo11.basicStatus, 'first AS3 ageup must not pollute basicStatus with NaN');
assertEqual(agedTo11.basicStatus.hp, HUMAN.initial.hp + HUMAN.ageupList[0].hp + 1, 'first AS3 ageup must use ageupList[0].hp');
assertEqual(agedTo11.basicStatus.mp, HUMAN.initial.mp + HUMAN.ageupList[0].mp + 1, 'first AS3 ageup must use ageupList[0].mp');

const age24Player = clonePlayer(createInitialPlayerState());
age24Player.race = HUMAN;
age24Player.age = 24;
age24Player.ap = 7;
const agedTo25 = ageup(age24Player);
assertEqual(agedTo25.age, 25, 'ageup from 24 reaches age 25');
assertEqual(agedTo25.ap, 8, 'AS3 grants the final 1 AP floor at age 25');

const age25Player = clonePlayer(createInitialPlayerState());
age25Player.race = HUMAN;
age25Player.age = 25;
age25Player.ap = 7;
const agedTo26 = ageup(age25Player);
assertEqual(agedTo26.age, 26, 'ageup from 25 reaches age 26');
assertEqual(agedTo26.ap, 7, 'AS3 stops ageup AP gain after age 25');

const skillPlayer = clonePlayer(createInitialPlayerState());
skillPlayer.basicStatus.intelligence = 10;
skillPlayer.skillStatus.protectionIgnore = 0;
skillPlayer.skillStatus.protectionReduce = 0;
skillPlayer.skillStatus.magicDamage = 0;
skillPlayer.equipStatus.protectionIgnore = 0;
skillPlayer.equipStatus.protectionReduce = 0;
skillPlayer.equipStatus.magicDamage = 0;

const battle = {
  playerState: skillPlayer,
  playerMp: 100,
  monsterHp: 100,
  monster: {
    protection: 0,
    data: { protection: 80 },
    getNameHtml: () => 'Monster',
  },
};
const boltSkill = {
  level: 0,
  skillData: {
    realName: 'Bolt',
    setList: [[10, 10, 0]],
  },
};

withRandom(0.99, () => {
  const result = behave_bolt(boltSkill, battle);
  assertEqual(result.success, true, 'bolt should execute with enough MP');
});

assertEqual(battle.monsterHp, 90, 'bolt damage must use live monster.protection after dynamic protection changes');

await cleanupTranspileOutput(outRoot);

console.log('Player growth AP and active skill monster protection parity checks passed.');
