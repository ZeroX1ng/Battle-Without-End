import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-buff-dot-effects');

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

function assertMatch(value, pattern, message) {
  if (!pattern.test(value)) {
    throw new Error(`${message}: ${value}`);
  }
}

function createStatus(overrides = {}) {
  return {
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
    crit_mul: 100,
    defence: 0,
    protection: 0,
    spellChance: 0,
    manaConsumption: 0,
    protectionIgnore: 0,
    protectionReduce: 0,
    magicDamage: 0,
    ...overrides,
  };
}

function createPlayerState(overrides = {}) {
  return {
    lv: 1,
    age: 10,
    race: null,
    basicStatus: createStatus({ hp: 100, mp: 10, ...overrides.basicStatus }),
    ap: 0,
    gold: 0,
    xp: 0,
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
    skillStatus: createStatus({ hp: 0, mp: 0, attack: { min: 0, max: 0 } }),
    equipStatus: createStatus({ hp: 0, mp: 0, attack: { min: 0, max: 0 } }),
    skillList: [],
    equipSkillList: [],
    itemList: [],
    titleList: [],
    petList: [],
    ...overrides,
  };
}

function createMap() {
  return {
    mapData: {
      name: 'test-map',
      realName: 'Test Map',
      modifier: 1,
      monsterList: [createMonsterData()],
      petList: [],
    },
    getBoss: () => null,
  };
}

function createMonsterData(overrides = {}) {
  return {
    name: 'test_monster',
    realName: 'Test Monster',
    hp: 100,
    attack: { min: 1, max: 1 },
    balance: 0,
    crit: 0,
    crit_mul: 100,
    defence: 0,
    protection: 0,
    CP: 1,
    ...overrides,
  };
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

function getLogText(result) {
  return result.logs.map(log => log.text).join('\n');
}

const as3Battle = readAs3('scripts/iData/Battle.as');
const as3Burn = readAs3('scripts/iData/iSkill/iBuff/BuffBurn.as');
const as3Poison = readAs3('scripts/iData/iSkill/iBuff/BuffPoison.as');
const as3Frozen = readAs3('scripts/iData/iSkill/iBuff/BuffFrozen.as');
const as3Corrosion = readAs3('scripts/iData/iSkill/iBuff/BuffCorrosion.as');
const as3SkillDataList = readAs3('scripts/iData/iSkill/SkillDataList.as');
const as3PetSkillList = readAs3('scripts/iData/iPet/iPetSkill/PetSkillList.as');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Burn, 'MainScene.battle.monsterHp -= count;', 'AS3 BuffBurn directly reduces battle-owned monsterHp');
assertIncludes(as3Burn, 'MainScene.allInfoPanel.addText', 'AS3 BuffBurn emits a battle log during the tick');
assertIncludes(as3Poison, 'MainScene.battle.monsterHp -= count;', 'AS3 BuffPoison directly reduces battle-owned monsterHp');
assertIncludes(as3Poison, 'MainScene.allInfoPanel.addText', 'AS3 BuffPoison emits a battle log during the tick');
assertIncludes(as3Frozen, '--this.count;', 'AS3 BuffFrozen consumes duration instead of damaging HP');
assertIncludes(as3Corrosion, 'override public function run() : *\r\n      {\r\n      }', 'AS3 BuffCorrosion run is empty and must not become DOT damage');
assertIncludes(as3Battle, 'this.monster.runBuff();', 'AS3 monsterTurn drives monster buffs before monster action');
assertIncludes(as3Battle, 'if(_loc1_ == null && this.monsterHp > 0)', 'AS3 monsterTurn skips action after frozen or lethal DOT');
assertIncludes(as3Battle, 'this.changeTurn();', 'AS3 fight runs death settlement after buff/action resolution');
assertIncludes(as3Battle, 'this.giveTrophy();', 'AS3 checkDead settles monster rewards after any lethal damage source');
assertIncludes(as3SkillDataList, 'monster.addBuff(new BuffBurn', 'AS3 player Fireball applies Burn to the monster');
assertIncludes(as3SkillDataList, 'monster.addBuff(new BuffPoison', 'AS3 player Mirage Missile applies Poison to the monster');
assertIncludes(as3PetSkillList, 'monster.addBuff(new BuffBurn', 'AS3 pet Fireball applies Burn to the monster');

if (packageJson.scripts?.['assert:battle-buff-dot-effects'] !== 'node scripts/assertBattleBuffDotEffectsParity.mjs') {
  throw new Error('package.json must expose assert:battle-buff-dot-effects');
}

const { Battle } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});
const { Monster } = await importTsModule({
  entry: join(root, 'src/core/models/Monster.ts'),
  root,
  outRoot,
});
const { BuffBurn, BuffPoison, BuffFrozen, BuffCorrosion } = await importTsModule({
  entry: join(root, 'src/core/models/Buff.ts'),
  root,
  outRoot,
});

await withRandom(0.99, async () => {
  const battle = new Battle(createPlayerState(), createMap(), {});
  battle.turn = -1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monster = new Monster(createMonsterData());
  battle.monsterHp = 80;
  battle.monster.addBuff(new BuffBurn(15));

  const result = battle.run();
  const logText = getLogText(result);
  const dotLog = result.logs.find(log => log.text.includes('15') && log.text.includes('灼伤'));

  assertEqual(battle.monsterHp, 65, 'Burn tick should reduce live Battle.monsterHp');
  assertMatch(logText, /ff4040.*15/, 'Burn tick should emit a visible battle log with matching damage');
  assert(dotLog, 'Burn tick should emit a dedicated DOT log');
  assertMatch(dotLog.text, /Test Monster/, 'Burn tick should include the AS3 target monster name in the visible log');
});

await withRandom(0.99, async () => {
  const battle = new Battle(createPlayerState(), createMap(), {});
  battle.turn = -1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monster = new Monster(createMonsterData());
  battle.monsterHp = 90;
  battle.monster.addBuff(new BuffPoison(12));

  const result = battle.run();
  const logText = getLogText(result);
  const dotLog = result.logs.find(log => log.text.includes('12') && log.text.includes('毒'));

  assertEqual(battle.monsterHp, 78, 'Poison tick should reduce live Battle.monsterHp');
  assertMatch(logText, /ff4040.*12/, 'Poison tick should emit a visible battle log with matching damage');
  assert(dotLog, 'Poison tick should emit a dedicated DOT log');
  assertMatch(dotLog.text, /Test Monster/, 'Poison tick should include the AS3 target monster name in the visible log');
});

await withRandom(0.99, async () => {
  const battle = new Battle(createPlayerState(), createMap(), {});
  battle.turn = -1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monster = new Monster(createMonsterData());
  battle.monsterHp = 50;
  battle.monster.addBuff(new BuffFrozen(2));
  battle.monster.addBuff(new BuffCorrosion(30));

  const result = battle.run();
  const logText = getLogText(result);

  assertEqual(battle.monsterHp, 50, 'Frozen and Corrosion ticks must not damage live Battle.monsterHp');
  assertMatch(logText, /鍐板喕|冰冻/, 'Frozen should still emit its non-DOT visible log');
});

await withRandom(0.99, async () => {
  const battle = new Battle(createPlayerState(), createMap(), {});
  battle.turn = -1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monster = new Monster(createMonsterData());
  battle.monsterHp = 10;
  battle.monster.addBuff(new BuffBurn(10));

  const result = battle.run();
  const logText = getLogText(result);
  const dotIndex = result.logs.findIndex(log => log.text.includes('10') && log.text.includes('#ff4040'));
  const defeatedIndex = result.logs.findIndex(log => log.category === 'battleIntro' && log.text.includes('#21c4af'));
  const expIndex = result.logs.findIndex(log => log.category === 'exp');

  assert(dotIndex >= 0, 'DOT kill tick should include the DOT damage log');
  assert(defeatedIndex >= 0, 'DOT kill should emit the same defeated log as normal damage kills');
  assert(expIndex >= 0, 'DOT kill should still emit reward logs');
  assert(dotIndex < defeatedIndex, 'DOT damage log should be emitted before defeated log');
  assert(defeatedIndex < expIndex, 'Defeated log should be emitted before reward logs');
  assertEqual(battle.turn, 1, 'DOT kill should reset turn through AS3 checkDead/changeTurn boundary');
});

await cleanupTranspileOutput(outRoot);

console.log('Battle Burn/Poison DOT live HP, logs, and kill settlement parity checks passed.');
