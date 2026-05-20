import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-monster-reward');

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

function createPlayerState({ luck = 0, itemList = [], petList = [] } = {}) {
  const zeroStatus = {
    hp: 0,
    mp: 0,
    str: 0,
    intelligence: 0,
    dex: 0,
    will: 0,
    luck: 0,
    apCost: 0,
    defence: 0,
    protection: 0,
    balance: 0,
    crit: 0,
    crit_mul: 0,
    spellChance: 0,
    protectionIgnore: 0,
    protectionReduce: 0,
    magicDamage: 0,
    attack: { min: 0, max: 0 },
  };
  const basicStatus = {
    ...zeroStatus,
    hp: 100,
    luck,
  };
  return {
    basicStatus,
    skillStatus: { ...zeroStatus, attack: { min: 0, max: 0 } },
    equipStatus: { ...zeroStatus, attack: { min: 0, max: 0 } },
    apCost: 0,
    BAGMAX: 10,
    PETMAX: 10,
    itemList,
    petList,
    gold: 0,
    xp: 0,
    lv: 1,
    title: null,
  };
}

const as3Battle = read('../BOE-O/scripts/iData/Battle.as');
const as3Monster = read('../BOE-O/scripts/iData/iMonster/Monster.as');
const as3Boss = read('../BOE-O/scripts/iData/iMonster/Boss.as');
const battleModel = read('src/core/models/Battle.ts');
const monsterModel = read('src/core/models/Monster.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Battle, 'Player.addExp(this.monster.exp);', 'AS3 Battle delegates exp reward to monster.exp');
assertIncludes(as3Battle, 'Player.addMoney(this.monster.money);', 'AS3 Battle delegates gold reward to monster.money');
assertIncludes(as3Battle, 'this.monster.dropItem();', 'AS3 Battle delegates item drops to Monster/Boss.dropItem');
assertIncludes(as3Battle, 'this.monster.dropPet();', 'AS3 Battle delegates pet drops to Monster/Boss.dropPet');
assertIncludes(as3Battle, 'this.pet.addExp(this.monster.exp);', 'AS3 Battle gives the active pet the defeated monster exp');
assertIncludes(as3Monster, 'public function get exp()', 'AS3 Monster owns exp reward formula');
assertIncludes(as3Monster, 'public function get money()', 'AS3 Monster owns gold reward formula');
assertIncludes(as3Boss, 'this.title = MonsterTitleList.REGION_BOSS;', 'AS3 Boss always uses the fixed region boss title');
assertIncludes(as3Boss, 'new Weapon(_loc1_ as WeaponData,dropRate,true)', 'AS3 Boss marks weapon drops as Boss drops');
assertIncludes(as3Boss, 'override public function dropPet()', 'AS3 Boss owns pet drop logic');

assertIncludes(battleModel, 'this.monster.getExp(', 'React Battle must read exp through Monster');
assertIncludes(battleModel, 'this.monster.getMoney(', 'React Battle must read gold through Monster');
assertIncludes(battleModel, 'this.monster.dropItem(', 'React Battle must delegate item drops to Monster/Boss');
assertIncludes(battleModel, 'this.monster.dropPet(', 'React Battle must delegate pet drops to Monster/Boss');
assertIncludes(battleModel, 'const petExpGain = this.monster.getExp(this.playerState, this.map.mapData.modifier);', 'React Battle.giveTrophy must recalculate defeated-monster exp for the active pet after player exp settlement');
assertIncludes(battleModel, 'this.pet.addExp(petExpGain, this.playerState.lv);', 'React Battle.giveTrophy must feed defeated-monster exp into the active pet');
assertIncludes(battleModel, 'this.monster.CP / getCombatPower(this.playerState) > 3', 'React Battle must keep AS3 kill title trigger based on CP ratio');
assertNotIncludes(battleModel, 'EquipmentList', 'Battle must not pick equipment directly; Monster/Boss owns dropItem');
assertNotIncludes(battleModel, 'handleDroppedItem', 'Battle must not apply drop filtering directly; Monster/Boss owns dropItem');

assertIncludes(monsterModel, 'REGION_BOSS_TITLE', 'Boss must import and use the AS3 fixed region boss title');
assertIncludes(monsterModel, 'protected generateTitle(): void', 'Boss must be able to override Monster.generateTitle');
assertIncludes(monsterModel, 'this.title = REGION_BOSS_TITLE', 'Boss.generateTitle must assign the fixed region boss title');
assertIncludes(monsterModel, 'this.title.xpMul', 'Monster exp must include monster title xp multiplier');
assertIncludes(monsterModel, 'this.title.goldMul', 'Monster money must include monster title gold multiplier');
assertIncludes(monsterModel, 'this.title.dropMul', 'Monster drop rate must include monster title drop multiplier');
assertIncludes(monsterModel, 'return this.createDroppedItem(playerState, dropRate, config, true);', 'Boss item drops must pass the Boss flag');
assertIncludes(monsterModel, 'new Weapon(ed as WeaponData, dropRate, isBoss', 'Dropped weapons must forward the Boss flag');
assertIncludes(monsterModel, 'new Equipment(ed, dropRate, isBoss', 'Dropped equipment must forward the Boss flag');
assertIncludes(monsterModel, 'getCombatPower(playerState)', 'Dropped equipment quality must receive player combat power like AS3 Player.combatPower');

if (packageJson.scripts?.['assert:monster-reward'] !== 'node scripts/assertMonsterRewardParity.mjs') {
  throw new Error('package.json must expose assert:monster-reward');
}

const monsterModule = await importTsModule({
  entry: join(root, 'src/core/models/Monster.ts'),
  root,
  outRoot,
});
const battleModule = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});
const dataModule = await importTsModule({
  entry: join(root, 'src/core/data/monsterData.ts'),
  root,
  outRoot,
});
const petDataModule = await importTsModule({
  entry: join(root, 'src/core/data/petData.ts'),
  root,
  outRoot,
});

const { Monster, Boss } = monsterModule;
const { Battle } = battleModule;
const { MonsterList, REGION_BOSS_TITLE } = dataModule;
const { PetDataList } = petDataModule;
const sampleMonsterData = { ...MonsterList[0], CP: 100 };
const config = {};

await withRandom(0.99, async () => {
  const monster = new Monster(sampleMonsterData);
  const boss = new Boss(sampleMonsterData);
  assertEqual(boss.title.name, REGION_BOSS_TITLE.name, 'Boss uses the fixed region boss title');
  assertEqual(boss.CP, sampleMonsterData.CP * 2, 'Boss CP matches AS3 double-CP override');
  assertEqual(boss.hpleft, boss.hp, 'Boss starts with hpleft equal to boosted hp');

  const player = createPlayerState();
  assertEqual(monster.dropItem(player, 1, config).dropped, false, 'Normal monster drops still use the 20% * dropRate gate');
  assert(boss.dropItem(player, 1, config).dropped, 'Boss dropItem must always produce an item roll without the normal drop gate');
});

await withRandom(0, async () => {
  const monster = new Monster(sampleMonsterData);
  monster.title = {
    name: 'reward-test',
    statMulList: [],
    xpMul: 3,
    goldMul: 2,
    dropMul: 4,
  };
  const player = createPlayerState();
  assertEqual(monster.getExp(player, 1), 600, 'Monster exp uses title xp multiplier');
  assertEqual(monster.getMoney(player, 1), 40, 'Monster money uses title gold multiplier');
  assertEqual(monster.getDropRate(player, 1), 8, 'Monster dropRate uses title drop multiplier');

  const boss = new Boss(sampleMonsterData);
  const pet = boss.dropPet(createPlayerState({ luck: 500 }), 1, [PetDataList[0]]);
  assert(pet, 'Boss dropPet uses AS3 luck-based chance and map pet list');
});

{
  const expGain = 1;
  const player = createPlayerState();
  const map = { mapData: { modifier: 1, petList: [] } };
  const battle = new Battle(player, map, config);
  const pet = {
    expReceived: 0,
    playerLevelReceived: 0,
    addExp(exp, playerLevel) {
      this.expReceived += exp;
      this.playerLevelReceived = playerLevel;
    },
  };
  battle.monster = {
    CP: 1,
    getExp() {
      return expGain;
    },
    getMoney() {
      return 0;
    },
    dropItem(playerState) {
      return { playerState, dropped: false, added: false, convertedToGold: 0 };
    },
    dropPet() {
      return null;
    },
  };
  battle.pet = pet;
  battle.giveTrophy();

  assertEqual(pet.expReceived, expGain, 'Battle.giveTrophy must award defeated-monster exp to the active pet');
  assertEqual(pet.playerLevelReceived, player.lv, 'Pet exp gating must receive the current player level');
}

await cleanupTranspileOutput(outRoot);

console.log('Monster reward, Boss title, and drop parity checks passed.');
