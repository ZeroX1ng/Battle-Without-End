import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-calcprotection-duplicate');

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
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
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

function createStatus(overrides = {}) {
  return {
    hp: 100,
    mp: 100,
    str: 0,
    dex: 10,
    intelligence: 0,
    will: 0,
    luck: 0,
    attack: { min: 100, max: 100 },
    balance: 50,
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
    playerName: 'CalcProtection Tester',
    skillStatus: createStatus({ hp: 0, mp: 0, dex: 0, attack: { min: 0, max: 0 }, balance: 0 }),
    equipStatus: createStatus({ hp: 0, mp: 0, dex: 0, attack: { min: 0, max: 0 }, balance: 0 }),
    skillList: [],
    equipSkillList: [],
    itemList: [],
    titleList: [],
    petList: [],
  };
}

const as3Battle = readAs3('scripts/iData/Battle.as');
const as3PetSkillList = readAs3('scripts/iData/iPet/iPetSkill/PetSkillList.as');
const battleModelSource = read('src/core/models/Battle.ts');
const skillBehaviorsSource = read('src/core/data/skillBehaviors.ts');
const petSkillBehaviorsSource = read('src/core/data/petSkillBehaviors.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Battle, 'private function caculateProtection(param1:int) : Number', 'AS3 Battle.caculateProtection is the source of truth');
assertIncludes(as3Battle, 'if(param1 < -100)', 'AS3 Battle.caculateProtection must clamp protection below -100');
assertIncludes(as3Battle, 'return -1;', 'AS3 Battle.caculateProtection must return -1 below the negative protection threshold');
assertIncludes(as3PetSkillList, 'private static function get monsterPro() : Number', 'AS3 PetSkillList monsterPro must be checked for the pet-skill formula decision');
assertIncludes(as3PetSkillList, 'return 1 - caculateProtection(monster.protection);', 'AS3 PetSkillList attack skills consume their local monsterPro helper');
assertIncludes(as3PetSkillList, 'if(param1 < -1000)', 'AS3 PetSkillList keeps a local -1000 branch that this React guard intentionally does not preserve');
assertIncludes(battleModelSource, 'export function caculateProtection', 'Battle.ts must export the shared caculateProtection implementation');

if (packageJson.scripts?.['assert:battle-calcprotection-duplicate'] !== 'node scripts/assertBattleCalcProtectionDuplicateParity.mjs') {
  throw new Error('package.json must expose assert:battle-calcprotection-duplicate');
}

const { caculateProtection } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});
const { behave_smash } = await importTsModule({
  entry: join(root, 'src/core/data/skillBehaviors.ts'),
  root,
  outRoot,
});
const { pet_behave_fireball } = await importTsModule({
  entry: join(root, 'src/core/data/petSkillBehaviors.ts'),
  root,
  outRoot,
});

assertEqual(caculateProtection(-500), -1, 'Battle.ts must match AS3 and clamp p=-500 to -1');
assertEqual(1 - caculateProtection(-500), 2, 'Battle.ts p=-500 damage multiplier must be exactly 2');

const battle = {
  playerState: createPlayerState(),
  playerHp: 100,
  playerMp: 100,
  monsterHp: 1000,
  monster: {
    protection: -500,
    defence: 0,
    getNameHtml: () => 'Negative Armor Monster',
  },
  addTitleEvent: () => {},
};

const smashSkill = {
  level: 0,
  skillData: {
    realName: 'Smash',
    setList: [100],
  },
};

withRandom(0.99, () => {
  const result = behave_smash(smashSkill, battle);
  assertEqual(result.success, true, 'Smash should execute in the negative-protection fixture');
  assertEqual(result.monsterHpDelta, -200, 'Skill damage must reuse Battle.ts p=-500 damage multiplier');
});

assertEqual(battle.monsterHp, 800, 'Skill behavior must deal the same p=-500 damage as Battle.ts');
assert(!/\bfunction\s+calcProtection\s*\(/.test(skillBehaviorsSource), 'skillBehaviors.ts must not keep a local calcProtection implementation');
assertIncludes(skillBehaviorsSource, "import { caculateProtection } from '../models/Battle';", 'skillBehaviors.ts must import Battle.ts caculateProtection');
assertIncludes(skillBehaviorsSource, '1 - caculateProtection(p)', 'monsterPro must reuse the shared Battle.ts caculateProtection implementation');

const petBattle = {
  playerState: createPlayerState(),
  petMp: 100,
  monsterHp: 1000,
  monster: {
    protection: -500,
    defence: 0,
    getNameHtml: () => 'Negative Armor Monster',
    addBuff: () => {},
  },
};

const pet = {
  level: 0,
  magicatt: 100,
  cri: 0,
  crimul: 100,
};

const fireballSkill = {
  level: 0,
  getRealName: () => 'Fireball',
  skillData: {
    setList: [[100, 0, 0, 0]],
  },
};

withRandom(0.99, () => {
  const result = pet_behave_fireball(fireballSkill, petBattle, pet);
  assertEqual(result.success, true, 'Pet Fireball should execute in the negative-protection fixture');
  assertEqual(result.monsterHpDelta, -200, 'Pet Fireball damage must reuse Battle.ts p=-500 damage multiplier');
});

assertEqual(petBattle.monsterHp, 800, 'Pet skill behavior must deal the same p=-500 damage as Battle.ts');
assert(!/\bfunction\s+calcProtection\s*\(/.test(petSkillBehaviorsSource), 'petSkillBehaviors.ts must not keep a local calcProtection implementation');
assertIncludes(petSkillBehaviorsSource, "import { caculateProtection } from '../models/Battle';", 'petSkillBehaviors.ts must import Battle.ts caculateProtection');
assertIncludes(petSkillBehaviorsSource, '1 - caculateProtection(battle.monster.protection)', 'pet monsterPro must reuse the shared Battle.ts caculateProtection implementation');

await cleanupTranspileOutput(outRoot);

console.log('Battle calcProtection duplicate parity checks passed.');
