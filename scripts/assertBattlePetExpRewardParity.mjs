import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-pet-exp-reward');

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function createStatus(BasicStatus, overrides = {}) {
  const status = new BasicStatus();
  Object.assign(status, {
    hp: 100,
    mp: 10,
    str: 0,
    dex: 0,
    intelligence: 0,
    will: 0,
    luck: 0,
    attack: { min: 1, max: 1 },
    balance: 0,
    crit: 0,
    crit_mul: 0,
    defence: 0,
    protection: 0,
    spellChance: 0,
    manaConsumption: 0,
    protectionIgnore: 0,
    protectionReduce: 0,
    magicDamage: 0,
    ...overrides,
  });
  return status;
}

function createPlayerState(BasicStatus) {
  return {
    lv: 1,
    age: 10,
    race: null,
    basicStatus: createStatus(BasicStatus),
    ap: 0,
    gold: 0,
    xp: 59,
    pet: null,
    title: null,
    apCost: 0,
    storeLv: 0,
    head: null,
    feet: null,
    body: null,
    necklace: null,
    ring: null,
    leftHand: null,
    rightHand: null,
    BAGMAX: 50,
    PETMAX: 10,
    caculate: 0,
    playerName: 'Tester',
    skillStatus: createStatus(BasicStatus, { hp: 0, mp: 0, attack: { min: 0, max: 0 } }),
    equipStatus: createStatus(BasicStatus, { hp: 0, mp: 0, attack: { min: 0, max: 0 } }),
    skillList: [],
    equipSkillList: [],
    itemList: [],
    titleList: [],
    petList: [],
  };
}

function createMap() {
  return {
    mapData: {
      name: 'test-map',
      realName: 'Test Map',
      modifier: 1,
      monsterList: [],
      petList: [],
    },
    getBoss: () => null,
  };
}

const as3Battle = readAs3('scripts/iData/Battle.as');
const as3Monster = readAs3('scripts/iData/iMonster/Monster.as');
const as3Player = readAs3('scripts/iGlobal/Player.as');
const as3Pet = readAs3('scripts/iData/iPet/Pet.as');
const battleModelSource = read('src/core/models/Battle.ts');
const monsterModelSource = read('src/core/models/Monster.ts');
const playerModelSource = read('src/core/models/Player.ts');
const petModelSource = read('src/core/models/Pet.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Battle, 'Player.addExp(this.monster.exp);', 'AS3 Battle.giveTrophy first reads monster.exp for the player');
assertIncludes(as3Battle, 'this.pet.addExp(this.monster.exp);', 'AS3 Battle.giveTrophy reads monster.exp again for the active pet');
assertIncludes(as3Monster, 'public function get exp()', 'AS3 Monster.exp is a getter, not a cached reward field');
assertIncludes(as3Monster, 'this.CP / Player.combatPower + Global.map.mapData.modifier', 'AS3 Monster.exp depends on current Player.combatPower and map modifier');
assertIncludes(as3Player, 'xp += param1;', 'AS3 Player.addExp settles player exp before the pet reward branch');
assertIncludes(as3Player, '++lv;', 'AS3 Player.levelUp changes player level during reward settlement');
assertIncludes(as3Pet, 'if(this.level - Player.lv > 5)', 'AS3 Pet.addExp gates pet leveling with the current Player.lv');
assertIncludes(monsterModelSource, 'getExp(playerState: PlayerState, mapModifier: number)', 'React Monster must own the AS3 exp formula');
assertIncludes(playerModelSource, 'export function addExp', 'React Player.addExp must settle level-up before pet reward');
assertIncludes(petModelSource, 'this.level - playerLevel > 5', 'React Pet.addExp must receive the current player level for AS3 gating');

if (packageJson.scripts?.['assert:battle-pet-exp-reward'] !== 'node scripts/assertBattlePetExpRewardParity.mjs') {
  throw new Error('package.json must expose assert:battle-pet-exp-reward');
}

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
const basicStatusModule = await importTsModule({
  entry: join(root, 'src/core/models/BasicStatus.ts'),
  root,
  outRoot,
});

const { Battle } = battleModule;
const { getCombatPower } = playerModule;
const { BasicStatus } = basicStatusModule;

const player = createPlayerState(BasicStatus);
const battle = new Battle(player, createMap(), {});
const expReads = [];
const pet = {
  level: 7,
  exp: 0,
  playerLevelReceived: null,
  addExp(exp, playerLevel) {
    this.playerLevelReceived = playerLevel;
    if (this.level - playerLevel > 5) return;
    this.exp += exp;
  },
};

battle.monster = {
  CP: 1,
  data: { realName: 'Second Read Monster' },
  title: null,
  getNameHtml: () => 'Second Read Monster',
  getExp(playerState, mapModifier) {
    expReads.push({
      lv: playerState.lv,
      combatPower: getCombatPower(playerState),
      mapModifier,
    });
    return playerState.lv === 1 ? 2 : 7;
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

assertEqual(battle.playerState.lv, 2, 'Fixture must level the player during Player.addExp');
assert(expReads.length >= 2, 'Battle.giveTrophy must read monster exp again after player exp settlement');
assertEqual(expReads[0].lv, 1, 'Player reward should use the pre-level-up monster exp read');
assertEqual(expReads[1].lv, 2, 'Pet reward should use the post-level-up monster exp read');
assert(expReads[0].combatPower !== expReads[1].combatPower, 'Player combatPower must differ before and after the level-up fixture');
assertEqual(pet.exp, 7, 'Pet exp must use the second monster.getExp value after player state changes');
assertEqual(pet.playerLevelReceived, 2, 'Pet exp gate must receive the updated player level');

await cleanupTranspileOutput(outRoot);

console.log('Battle pet exp reward recalculation parity checks passed.');
