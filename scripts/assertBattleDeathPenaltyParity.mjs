import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-death-penalty');

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
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
    defence: 2,
    protection: 0,
    spellChance: 0,
    manaConsumption: 0,
    protectionIgnore: 0,
    protectionReduce: 0,
    magicDamage: 0,
    ...overrides,
  };
}

function createPlayerState({ xp = 1000 } = {}) {
  return {
    lv: 1,
    age: 10,
    race: null,
    basicStatus: createStatus(),
    ap: 0,
    gold: 0,
    xp,
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
    skillStatus: createStatus({ hp: 0, mp: 0, defence: 0, attack: { min: 0, max: 0 } }),
    equipStatus: createStatus({ hp: 0, mp: 0, defence: 0, attack: { min: 0, max: 0 } }),
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
      monsterList: [{
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
      }],
      petList: [],
    },
    getBoss: () => ({ ...createMonster(), hpleft: 100 }),
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

const as3Battle = readAs3('scripts/iData/Battle.as');
const as3Player = readAs3('scripts/iGlobal/Player.as');
const gameContextSource = read('src/state/GameContext.tsx');
const packageJson = JSON.parse(read('package.json'));

assert(as3Battle.includes('private function playerDie()'), 'AS3 Battle.playerDie must be present');
assert(!as3Battle.includes('Player.loseExp'), 'AS3 Battle.playerDie must not call Player.loseExp on death');
assert(as3Player.includes('public static function loseExp()'), 'AS3 Player.loseExp exists as a separate explicit action');
assertEqual((as3Player.match(/loseExp/g) ?? []).length, 1, 'AS3 Player.loseExp should have no call sites in Player.as');
assert(!gameContextSource.includes('你在战斗中被击败，失去了部分经验'), 'React BATTLE_TICK death notice must not claim AS3 death exp loss');

if (packageJson.scripts?.['assert:battle-death-penalty'] !== 'node scripts/assertBattleDeathPenaltyParity.mjs') {
  throw new Error('package.json must expose assert:battle-death-penalty');
}

const { Battle } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});

try {
  await withRandom(0.99, async () => {
    const player = createPlayerState({ xp: 1000 });
    const battle = new Battle(player, createMap());
    battle.turn = -1;
    battle.playerHp = 10;
    battle.playerMp = 10;
    battle.monsterHp = 100;
    battle.monster = createMonster({ attack: 12 });

    const result = battle.run();
    const logText = result.logs.map(log => log.text).join('\n');

    assertEqual(result.playerDied, true, 'Player death should still be reported when live HP reaches zero');
    assertEqual(battle.playerState.xp, 1000, 'AS3 death flow must not deduct experience');
    assert(!/失去了|失去/.test(logText), 'Death tick should not emit an experience-loss log');
  });
} finally {
  await cleanupTranspileOutput(outRoot);
}

console.log('Battle death penalty parity checks passed.');
