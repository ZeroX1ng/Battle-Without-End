import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-damage-flat-output');

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

function as3Int(value) {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
}

function createStatus(overrides = {}) {
  return {
    hp: 1000,
    mp: 100,
    str: 0,
    dex: 10,
    intelligence: 0,
    will: 0,
    luck: 0,
    attack: { min: 0, max: 0 },
    balance: 50,
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
    basicStatus: createStatus({
      attack: { min: 743, max: 750 },
      balance: 50,
    }),
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
    playerName: 'Damage Tester',
    skillStatus: createStatus({ hp: 0, mp: 0, dex: 0, balance: 0, attack: { min: 0, max: 0 } }),
    equipStatus: createStatus({ hp: 0, mp: 0, dex: 0, balance: 0, attack: { min: 0, max: 0 } }),
    skillList: [],
    equipSkillList: [],
    itemList: [],
    titleList: [],
    petList: [],
  };
}

function createMonster(overrides = {}) {
  return {
    crit: 0,
    crit_mul: 100,
    attack: 1,
    defence: 200,
    protection: 85,
    hp: 100000,
    CP: 1,
    data: { realName: 'Flat Output Monster', protection: 85 },
    title: null,
    buffList: [],
    runBuff: () => [],
    isContainBuff: () => null,
    getNameHtml: () => 'Flat Output Monster',
    getExp: () => 0,
    getMoney: () => 0,
    dropItem: playerState => ({ playerState, dropped: false, added: false, convertedToGold: 0 }),
    dropPet: () => null,
    ...overrides,
  };
}

function createMap() {
  return {
    mapData: {
      name: 'flat-output-map',
      realName: 'Flat Output Map',
      modifier: 1,
      monsterList: [],
      petList: [],
    },
    getBoss: () => null,
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

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function range(values) {
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function parseLoggedDamage(result) {
  const logText = result.logs.map(log => log.text).join('\n');
  const matches = [...logText.matchAll(/<font[^>]*>(\d+)!?<\/font>/g)];
  assert(matches.length > 0, `Expected a player damage log containing a font-wrapped number:\n${logText}`);
  return Number(matches[matches.length - 1][1]);
}

const as3Player = readAs3('scripts/iGlobal/Player.as');
const as3Battle = readAs3('scripts/iData/Battle.as');
const as3MyMath = readAs3('scripts/tool/MyMath.as');
const as3Equipment = readAs3('scripts/iData/iItem/Equipment.as');
const as3WeaponType = readAs3('scripts/iData/iItem/WeaponType.as');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Player, 'public static function get attack() : int', 'AS3 Player.attack must be the sampled attack source');
assertIncludes(as3Player, 'return formula_title_stat(_loc1_,Stat.ATTACK);', 'AS3 attMin/attMax must pass through formula_title_stat');
assertIncludes(as3Battle, 'var _loc3_:int = (Player.attack', 'AS3 Battle.playerAttack stores final player damage in an int local');
assertIncludes(as3Battle, 'this.monster.defence) * (1 - this.caculateProtection', 'AS3 Battle.playerAttack subtracts defence then applies protection scaling');
assertIncludes(as3MyMath, 'public static function balanceRandom(param1:int) : Number', 'AS3 balanceRandom owns attack sampling distribution');
assertIncludes(as3Equipment, 'private function generateBasicStat', 'AS3 Equipment.generateBasicStat owns attack min/max generation');
assertIncludes(as3WeaponType, 'public static const SWORD_BASE', 'AS3 WeaponType owns weapon level base stats');

if (packageJson.scripts?.['assert:battle-damage-flat-output'] !== 'node scripts/assertBattleDamageFlatOutputParity.mjs') {
  throw new Error('package.json must expose assert:battle-damage-flat-output');
}

const { Battle, caculateProtection } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});

const { getAttack, getAttMin, getAttMax, getBalance } = await importTsModule({
  entry: join(root, 'src/core/models/Player.ts'),
  root,
  outRoot,
});

const randomInputs = Array.from({ length: 100 }, (_, index) => (index + 0.5) / 100);
const fixturePlayer = createPlayerState();
const fixtureMonster = createMonster();
const protection = caculateProtection(fixtureMonster.protection);
const protectionScale = 1 - protection;

const attackSamples = [];
for (const randomInput of randomInputs) {
  attackSamples.push(await withRandomSequence([randomInput], () => getAttack(createPlayerState())));
}

const preRoundSamples = attackSamples.map(attack => (attack - fixtureMonster.defence) * protectionScale);
const as3FinalDamageSamples = preRoundSamples.map(value => {
  const damage = as3Int(value);
  return damage < 1 ? 1 : damage;
});

const reactLoggedDamageSamples = [];
for (const randomInput of randomInputs) {
  const battle = new Battle(createPlayerState(), createMap());
  battle.turn = 1;
  battle.playerHp = 1000;
  battle.playerMp = 100;
  battle.monster = createMonster();
  battle.monsterHp = 100000;

  const result = await withRandomSequence([0.99, randomInput], async () => battle.run());
  reactLoggedDamageSamples.push(parseLoggedDamage(result));
}

const attackSet = uniqueSorted(attackSamples);
const as3FinalDamageSet = uniqueSorted(as3FinalDamageSamples);
const reactLoggedDamageSet = uniqueSorted(reactLoggedDamageSamples);
const diagnostics = {
  fixture: {
    attMin: getAttMin(fixturePlayer),
    attMax: getAttMax(fixturePlayer),
    balance: getBalance(fixturePlayer),
    defence: fixtureMonster.defence,
    protection: fixtureMonster.protection,
    protectionScale,
  },
  attackSampleSet: attackSet,
  as3FinalDamageSet,
  reactLoggedDamageSet,
  preRoundRange: range(preRoundSamples),
};

console.log('Battle damage flat output diagnostics:');
console.log(JSON.stringify(diagnostics, null, 2));

assert(attackSet.length > 1, 'Fixture must produce intermediate Player.attack variance before final damage scaling');
assert(
  as3FinalDamageSet.length === 1 && as3FinalDamageSet[0] !== 1,
  'The AS3-equivalent fixture should document the original final-output collapse to one non-1 value'
);
assert(
  reactLoggedDamageSet.length > 1,
  `P0-DMG-FLAT-OUT: Player.attack varies (${attackSet.join(', ')}) but visible logged damage collapses to ${reactLoggedDamageSet.join(', ')}`
);

await cleanupTranspileOutput(outRoot);

console.log('Battle damage flat output parity/divergence guard passed.');
