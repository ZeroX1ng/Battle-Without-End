import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-numeric-coercion');

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

const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
const as3Battle = read('../BOE-O/scripts/iData/Battle.as');
const as3Monster = read('../BOE-O/scripts/iData/iMonster/Monster.as');
const as3Pet = read('../BOE-O/scripts/iData/iPet/Pet.as');
const as3MyMath = read('../BOE-O/scripts/tool/MyMath.as');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Player, 'public static function get attMin() : int', 'AS3 Player.attMin must be an int getter');
assertIncludes(as3Player, 'private static function formula_title_stat(param1:int, param2:String) : int', 'AS3 title stat formula coerces input through an int parameter');
assertIncludes(as3Player, 'public static function get magicBalance() : int', 'AS3 Player.magicBalance must be an int getter');
assertIncludes(as3Battle, 'var _loc3_:int = (Player.attack', 'AS3 player attack damage stores the formula result in an int local');
assertIncludes(as3Monster, 'public function get attack() : int', 'AS3 Monster.attack must be an int getter');
assertIncludes(as3Pet, 'public function get attack() : int', 'AS3 Pet.attack must be an int getter');
assertIncludes(as3MyMath, 'public static function balanceRandom(param1:int) : Number', 'AS3 balanceRandom receives an int parameter');

if (packageJson.scripts?.['assert:battle-numeric-coercion'] !== 'node scripts/assertBattleNumericCoercionParity.mjs') {
  throw new Error('package.json must expose assert:battle-numeric-coercion');
}

const playerModule = await importTsModule({
  entry: join(root, 'src/core/models/Player.ts'),
  root,
  outRoot,
});
const monsterModule = await importTsModule({
  entry: join(root, 'src/core/models/Monster.ts'),
  root,
  outRoot,
});
const petModule = await importTsModule({
  entry: join(root, 'src/core/models/Pet.ts'),
  root,
  outRoot,
});
const mathModule = await importTsModule({
  entry: join(root, 'src/core/math/MyMath.ts'),
  root,
  outRoot,
});
const skillBehaviorModule = await importTsModule({
  entry: join(root, 'src/core/data/skillBehaviors.ts'),
  root,
  outRoot,
});

const {
  createInitialPlayerState,
  getAttMin,
  getAttMax,
  getBalance,
  getMagicBalance,
  getMagicDamage,
} = playerModule;
const { Monster } = monsterModule;
const { Pet } = petModule;
const { encryptInt } = mathModule;
const { behave_bolt } = skillBehaviorModule;

const player = createInitialPlayerState();
player.basicStatus.str = 11;
player.basicStatus.dex = 19;
player.basicStatus.intelligence = 39;
player.basicStatus.attack.min = 0;
player.basicStatus.attack.max = 0;
player.skillStatus.balance = 30.6;
player.equipStatus.magicDamage = 9.99;

assertEqual(getAttMin(player), 3, 'Player.getAttMin must truncate the AS3 int local before attack rolls');
assertEqual(getAttMax(player), 4, 'Player.getAttMax must truncate the AS3 int local before attack rolls');
assertEqual(getBalance(player), 32, 'Player.getBalance must pass an AS3 int value into balanceRandom');
assertEqual(getMagicBalance(player), 37, 'Player.getMagicBalance must truncate its AS3 int local before magic rolls');
assertEqual(getMagicDamage(player), 10, 'Player.getMagicDamage must truncate formula_StatAddUp before later fractional stat intermediates');

const monster = withRandom(0.99, () => new Monster({
  name: 'coercion_monster',
  realName: 'Coercion Monster',
  hp: 100,
  attack: { min: 10.75, max: 10.75 },
  balance: 42.8,
  crit: 0,
  crit_mul: 100,
  defence: 0,
  protection: -6.7,
  CP: 1,
}));
assertEqual(monster.attack, 10, 'Monster.attack must truncate the AS3 int getter result');
assertEqual(monster.balance, 42, 'Monster.balance must truncate before balanceRandom consumes it');
assertEqual(monster.protection, -6, 'Monster.protection must preserve AS3 int getter semantics for negative protection');

const pet = Object.create(Pet.prototype);
pet.currentStat = {
  hp: 0,
  mp: 0,
  attmin: 10.75,
  attmax: 10.75,
  def: 0,
  pro: 0,
  balance: 41.9,
  cri: 0,
  criMul: 100,
  magAtt: 0,
};
pet.skillList = [];
pet._level = encryptInt(1);
pet._exp = encryptInt(0);
assertEqual(pet.attmin, 10, 'Pet.attmin must truncate the AS3 int getter result');
assertEqual(pet.attmax, 10, 'Pet.attmax must truncate the AS3 int getter result');
assertEqual(pet.balance, 41, 'Pet.balance must truncate before balanceRandom consumes it');
assertEqual(pet.attack, 10, 'Pet.attack must truncate the AS3 int getter result');

const magicPlayer = createInitialPlayerState();
magicPlayer.basicStatus.intelligence = 39;
magicPlayer.equipStatus.magicDamage = 9.99;
const battle = {
  playerState: magicPlayer,
  playerMp: 1000,
  monsterHp: 1000,
  monster: {
    protection: 0,
    defence: 0,
    getNameHtml: () => 'Coercion Monster',
  },
};
const boltSkill = {
  level: 0,
  skillData: {
    realName: 'Bolt',
    setList: [[500, 500, 0]],
  },
};

withRandom(0.99, () => {
  const result = behave_bolt(boltSkill, battle);
  assertEqual(result.success, true, 'Magic skill should execute with enough MP');
});

assertEqual(battle.monsterHp, 450, 'Magic skill damage must consume AS3-truncated magicDamage');

await cleanupTranspileOutput(outRoot);

console.log('Battle numeric coercion parity checks passed.');
