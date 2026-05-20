import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-pet-flow-logs');

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
    crit_mul: 0,
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

function createPlayerState() {
  return {
    lv: 1,
    age: 10,
    race: null,
    basicStatus: createStatus(),
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

function createSkill(name, setArray) {
  return {
    level: 0,
    skillData: { name, setList: [setArray, setArray] },
    getSetArray() {
      return setArray;
    },
  };
}

function createPet(skills = {}) {
  return {
    level: 1,
    hp: 100,
    mp: 10,
    pro: 0,
    defence: 2,
    cri: 0,
    crimul: 100,
    attack: 10,
    getSkill(skillData) {
      return skills[skillData.name] ?? null;
    },
    getAttackSkill() {
      return [];
    },
  };
}

function createMonster({ attack = 12 } = {}) {
  return {
    crit: 0,
    crit_mul: 100,
    attack,
    defence: 2,
    protection: 0,
    hp: 100,
    CP: 1,
    data: { realName: 'Test Monster', protection: 0 },
    title: null,
    buffList: [],
    runBuff: () => [],
    isContainBuff: () => null,
    getNameHtml: () => 'Test Monster',
  };
}

async function withRandomSequence(values, fn) {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[Math.min(index++, values.length - 1)];
  try {
    return await fn();
  } finally {
    Math.random = original;
  }
}

function getLogText(playerState) {
  return (playerState._logs ?? []).map(log => log.text).join('\n');
}

function assertNoTemplateFragments(logText, message) {
  assert(!/\{mon(?:\.|\b)/.test(logText), message);
}

const as3Battle = read('../BOE-O/scripts/iData/Battle.as');
const as3Pet = read('../BOE-O/scripts/iData/iPet/Pet.as');
const as3PetSkillList = read('../BOE-O/scripts/iData/iPet/iPetSkill/PetSkillList.as');
const battleModelSource = read('src/core/models/Battle.ts');
const petModelSource = read('src/core/models/Pet.ts');
const petSkillDataSource = read('src/core/data/petSkillData.ts');
const petSkillBehaviorSource = read('src/core/data/petSkillBehaviors.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Battle, 'private function monsterAttackPet()', 'AS3 Battle owns monster attacks on pets');
assertIncludes(as3Battle, 'if(Math.random() * 100 < _loc1_)', 'AS3 monsterAttackPet consumes crit randomness before Dodge');
assertIncludes(as3Battle, '_loc3_ = (this.monster.attack * _loc2_ - this.pet.defence)', 'AS3 monsterAttackPet computes damage before Dodge');
assertIncludes(as3Battle, 'this.pet.getSkill(PetSkillList.dodge)', 'AS3 monsterAttackPet checks Dodge after damage calculation');
assertIncludes(as3Battle, 'this.petHp -= _loc3_;', 'AS3 monsterAttackPet reduces pet HP after failed Dodge');
assertIncludes(as3Battle, 'this.pet.getSkill(PetSkillList.injury_resile)', 'AS3 monsterAttackPet handles pet reflection');
assertIncludes(as3Battle, 'this.pet.getSkill(PetSkillList.counterattack)', 'AS3 monsterAttackPet handles pet counterattack');
assertIncludes(as3Battle, 'private function petAttack()', 'AS3 Battle owns pet normal attacks');
assertIncludes(as3Battle, 'this.monsterHp -= _loc3_;', 'AS3 petAttack reduces monster HP');
assertIncludes(as3Battle, 'this.pet.getSkill(PetSkillList.life_drain)', 'AS3 petAttack handles Life Drain');
assertIncludes(as3Pet, 'public function get attack()', 'AS3 Pet.attack owns pet physical damage randomness');
assertIncludes(as3PetSkillList, 'public static const dodge', 'AS3 PetSkillList defines Dodge values');
assertIncludes(as3PetSkillList, 'public static const life_drain', 'AS3 PetSkillList defines Life Drain values');
assertIncludes(battleModelSource, 'private monsterAttackPet()', 'React Battle must own monster-on-pet flow');
assertIncludes(battleModelSource, 'private petAttack()', 'React Battle must own pet normal attack flow');
assertIncludes(petModelSource, 'getSkill(skillData: PetSkillData)', 'React Pet must own skill lookup');
assertIncludes(petSkillDataSource, "name: 'Life Drain'", 'React pet skill data must include Life Drain');
assertIncludes(petSkillBehaviorSource, 'petTraceAttackInfo', 'React pet skill behaviors must emit attack-skill logs');

if (packageJson.scripts?.['assert:battle-pet-flow-logs'] !== 'node scripts/assertBattlePetFlowLogsParity.mjs') {
  throw new Error('package.json must expose assert:battle-pet-flow-logs');
}

const { Battle } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});

await withRandomSequence([0.99, 0.99, 0], async () => {
  const player = createPlayerState();
  const battle = new Battle(player, createMap());
  let attackReads = 0;
  battle.monster = {
    ...createMonster(),
    get attack() {
      attackReads++;
      return 12;
    },
  };
  battle.pet = createPet({
    Dodge: createSkill('Dodge', [100]),
  });
  battle.petHp = 50;
  battle.monsterHp = 100;

  battle.monsterAttackPet();
  const logText = getLogText(player);

  assertEqual(attackReads, 1, 'Successful pet Dodge must still consume the AS3 monster attack/damage path first');
  assertEqual(battle.petHp, 50, 'Successful pet Dodge must not reduce pet HP');
  assertMatch(logText, /Test Monster/, 'Dodge log must include the interpolated monster name');
  assertNoTemplateFragments(logText, 'Dodge log must not expose unexpanded monster template fragments');
});

await withRandomSequence([0.99, 0.99, 0.99], async () => {
  const player = createPlayerState();
  const battle = new Battle(player, createMap());
  battle.monster = createMonster({ attack: 12 });
  battle.pet = createPet();
  battle.petHp = 50;
  battle.monsterHp = 100;

  battle.monsterAttackPet();
  const logText = getLogText(player);

  assertEqual(battle.petHp, 40, 'Monster attack should reduce pet HP by calculated damage');
  assertMatch(logText, /Test Monster.*10/, 'Monster-on-pet damage log must include monster name and damage');
  assertNoTemplateFragments(logText, 'Monster-on-pet damage log must not expose template fragments');
});

await withRandomSequence([0.99, 0.99], async () => {
  const player = createPlayerState();
  const battle = new Battle(player, createMap());
  battle.monster = createMonster();
  battle.pet = createPet({
    'Life Drain': createSkill('Life Drain', [50]),
  });
  battle.petHp = 20;
  battle.monsterHp = 100;

  battle.petAttack();
  const logText = getLogText(player);

  assertEqual(battle.monsterHp, 92, 'Pet normal attack should reduce monster HP by calculated damage');
  assertEqual(battle.petHp, 24, 'Life Drain should heal pet HP from the pet damage path');
  assertMatch(logText, /Test Monster.*8/, 'Pet normal attack log must include monster name and damage');
  assertMatch(logText, /hp/i, 'Life Drain must emit a visible pet heal log');
  assertNoTemplateFragments(logText, 'Pet attack and Life Drain logs must not expose template fragments');
});

await withRandomSequence([0.99, 0, 0, 0.99, 0.99], async () => {
  const player = createPlayerState();
  const battle = new Battle(player, createMap());
  battle.monster = createMonster({ attack: 12 });
  battle.pet = createPet({
    'Injury Resile': createSkill('Injury Resile', [100, 50]),
    Counterattack: createSkill('Counterattack', [100, 100]),
  });
  battle.petHp = 50;
  battle.monsterHp = 100;

  battle.monsterAttackPet();
  const logText = getLogText(player);

  assertMatch(logText, /Test Monster/, 'Reflection and counterattack logs must include the monster name');
  assertNoTemplateFragments(logText, 'Reflection and counterattack logs must not expose unexpanded monster template fragments');
});

await cleanupTranspileOutput(outRoot);

console.log('Battle pet flow logs and random-order parity checks passed.');
