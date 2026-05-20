import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-active-skill-single-roll');

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
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message}\nexpected: ${e}\nactual:   ${a}`);
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
    attack: { min: 10, max: 10 },
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

function createMonster({ attack = 12 } = {}) {
  return {
    crit: 0,
    crit_mul: 100,
    attack,
    defence: 0,
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

function makeSkill(name, type, category, behaveFunction) {
  return {
    level: 0,
    skillData: {
      name,
      realName: name,
      type,
      category,
      statList: [[]],
      lvupCostList: [0],
      behaveFunction,
    },
    getSetArray: () => [],
  };
}

async function withRandomSequence(values, fn) {
  const original = Math.random;
  let index = 0;
  Math.random = () => {
    if (index < values.length) {
      return values[index++];
    }
    return values[values.length - 1] ?? 0.99;
  };
  try {
    return await fn();
  } finally {
    Math.random = original;
  }
}

const as3Battle = read('../BOE-O/scripts/iData/Battle.as');
const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
const as3SkillDataList = read('../BOE-O/scripts/iData/iSkill/SkillDataList.as');
const as3ActiveSkillData = read('../BOE-O/scripts/iData/iSkill/ActiveSkillData.as');
const battleModelSource = read('src/core/models/Battle.ts');
const playerModelSource = read('src/core/models/Player.ts');
const skillBehaviorsSource = read('src/core/data/skillBehaviors.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Battle, '_loc3_ = Player.spellChance + 20 + _loc2_ * 5;', 'AS3 playerTurn must use attack-skill spell chance formula');
assertIncludes(as3Battle, '_loc4_ = Player.attackSkillList[Math.random() * _loc2_ >> 0];', 'AS3 playerTurn must pick exactly one random attack skill');
assertIncludes(as3Battle, 'if((_loc4_.skillData as ActiveSkillData).behaveFunction(_loc4_))', 'AS3 playerTurn must call only the selected attack skill behaveFunction');
assertIncludes(as3Battle, '_loc4_ = Player.defenceSkillList[Math.random() * _loc2_ >> 0];', 'AS3 monsterAttackPlayer must pick exactly one random defence skill');
assertIncludes(as3Player, 'public static function get attackSkillList()', 'AS3 Player.attackSkillList owns attack skill eligibility');
assertIncludes(as3SkillDataList, 'return false;', 'AS3 active skill behaveFunction can fail without consuming the turn as a skill');
assertIncludes(as3ActiveSkillData, 'public var behaveFunction:Function;', 'AS3 ActiveSkillData stores the behavior function called by Battle');
assertIncludes(playerModelSource, 'getAttackSkillList', 'React Player.ts must retain AS3-derived attackSkillList ownership');
assertIncludes(skillBehaviorsSource, 'success: false', 'React skillBehaviors must report failed active-skill attempts');

if (packageJson.scripts?.['assert:battle-active-skill-single-roll'] !== 'node scripts/assertBattleActiveSkillSingleRollParity.mjs') {
  throw new Error('package.json must expose assert:battle-active-skill-single-roll');
}

const { Battle } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});

const { SkillType, SkillCategory } = await importTsModule({
  entry: join(root, 'src/core/constants.ts'),
  root,
  outRoot,
});

await withRandomSequence([0.1, 0, 0.99, 0.5], async () => {
  const tried = [];
  const failingSkill = makeSkill('FAIL_ATTACK', SkillType.ATTACK, SkillCategory.ALL, () => {
    tried.push('FAIL_ATTACK');
    return { success: false, logs: ['FAIL_ATTACK_LOG'] };
  });
  const succeedingSkill = makeSkill('SUCCESS_ATTACK', SkillType.ATTACK, SkillCategory.ALL, () => {
    tried.push('SUCCESS_ATTACK');
    return { success: true, logs: ['SUCCESS_ATTACK_LOG'] };
  });

  const player = createPlayerState();
  player.equipSkillList = [failingSkill, succeedingSkill];

  const battle = new Battle(player, createMap());
  battle.turn = 1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monster = createMonster({ attack: 1 });
  battle.monsterHp = 100;

  const result = battle.run();
  const logText = result.logs.map(log => log.text).join('\n');

  assertEqual(tried, ['FAIL_ATTACK'], 'Player turn must try only the single AS3-selected attack skill');
  assertEqual(battle.monsterHp, 90, 'Failed selected attack skill must fall back to the normal player attack');
  assert(!logText.includes('SUCCESS_ATTACK_LOG'), 'Player turn must not retry another attack skill after the selected skill fails');
});

await withRandomSequence([0.1, 0, 0.99, 0.5], async () => {
  const tried = [];
  const failingSkill = makeSkill('FAIL_DEFENCE', SkillType.DEFENCE, SkillCategory.ALL, () => {
    tried.push('FAIL_DEFENCE');
    return { success: false, logs: ['FAIL_DEFENCE_LOG'] };
  });
  const succeedingSkill = makeSkill('SUCCESS_DEFENCE', SkillType.DEFENCE, SkillCategory.ALL, () => {
    tried.push('SUCCESS_DEFENCE');
    return { success: true, logs: ['SUCCESS_DEFENCE_LOG'] };
  });

  const player = createPlayerState();
  player.equipSkillList = [failingSkill, succeedingSkill];

  const battle = new Battle(player, createMap());
  battle.turn = -1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monster = createMonster({ attack: 12 });
  battle.monsterHp = 100;

  const result = battle.run();
  const logText = result.logs.map(log => log.text).join('\n');

  assertEqual(tried, ['FAIL_DEFENCE'], 'Monster turn must try only the single AS3-selected defence skill');
  assertEqual(battle.playerHp, 88, 'Failed selected defence skill must fall back to the normal monster attack');
  assert(!logText.includes('SUCCESS_DEFENCE_LOG'), 'Monster turn must not retry another defence skill after the selected skill fails');
});

assert(!/sort\(\(\) => Math\.random\(\) - 0\.5\)/.test(battleModelSource), 'Battle.playerTurn must not shuffle and retry attack skills');

await cleanupTranspileOutput(outRoot);

console.log('Battle active skill single-roll parity checks passed.');
