import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-state-immutability');

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

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertNotSame(actual, expected, message) {
  if (actual === expected) {
    throw new Error(message);
  }
}

function extractFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) {
    throw new Error(`Missing function ${functionName}`);
  }
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) {
      return source.slice(start, i + 1);
    }
  }
  throw new Error(`Could not extract function ${functionName}`);
}

function getCase(source, actionType) {
  const start = source.indexOf(`case '${actionType}':`);
  if (start < 0) {
    throw new Error(`Missing reducer case ${actionType}`);
  }
  const next = source.indexOf('\n    case ', start + 1);
  return source.slice(start, next < 0 ? source.indexOf('\n    default:', start) : next);
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
    attack: { min: 0, max: 0 },
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
    basicStatus: createStatus({ attack: { min: 12, max: 12 } }),
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
    skillStatus: createStatus(),
    equipStatus: createStatus(),
    skillList: [],
    equipSkillList: [],
    itemList: [],
    titleList: [],
    petList: [],
  };
}

function createMonster() {
  return {
    crit: 0,
    crit_mul: 100,
    attack: 1,
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
const as3MainScene = readAs3('scripts/iPanel/iScene/MainScene.as');
const battleModel = read('src/core/models/Battle.ts');
const gameContext = read('src/state/GameContext.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3MainScene, 'battle = new Battle();', 'AS3 MainScene owns a live Battle instance');
assertIncludes(as3Battle, 'this.timer.addEventListener(TimerEvent.TIMER,this.run);', 'AS3 Battle owns its mutable timer-driven run loop');
assertIncludes(as3Battle, '++Player.caculate;', 'AS3 Battle.run mutates the global Player timer');
assertIncludes(as3Battle, 'Player.save();', 'AS3 Battle.run triggers autosave from the mutable global Player');
assertIncludes(as3Player, 'public static var caculate:int', 'AS3 Player exposes mutable global tick state');

if (packageJson.scripts?.['assert:battle-state-immutability'] !== 'node scripts/assertBattleStateImmutabilityParity.mjs') {
  throw new Error('package.json must expose assert:battle-state-immutability');
}

const battleTick = getCase(gameContext, 'BATTLE_TICK');
const withBattlePlayer = extractFunction(gameContext, 'withBattlePlayer');
const switchBattleMap = extractFunction(gameContext, 'switchBattleMap');

assertIncludes(
  battleModel,
  'cloneForTransition(',
  'Battle must expose a transition clone so reducer evaluation does not mutate state.battle directly'
);
assertIncludes(
  battleTick,
  'cloneForTransition(state.player, state.config)',
  'BATTLE_TICK must run on a cloned Battle transition runtime'
);
assertNotIncludes(
  battleTick,
  'const battle = state.battle as Battle;\n      const result = battle.run(state.config);',
  'BATTLE_TICK must not call run() on the state.battle instance directly'
);
assertNotIncludes(
  withBattlePlayer,
  'Object.getOwnPropertyDescriptors(state.battle)',
  'withBattlePlayer must use the Battle transition boundary instead of open-coded shallow cloning'
);
assertNotIncludes(
  switchBattleMap,
  'Object.getOwnPropertyDescriptors(state.battle)',
  'switchBattleMap must not preserve the previous battle runtime through a shallow prototype clone'
);

const { Battle } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});

await withRandom(0.99, async () => {
  const player = createPlayerState();
  const battle = new Battle(player, createMap(), {});
  battle.turn = 1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monsterHp = 100;
  battle.monster = createMonster();

  const previousMonster = battle.monster;
  const transitionBattle = battle.cloneForTransition(player, {});
  const result = transitionBattle.run({});

  assertNotSame(transitionBattle, battle, 'cloneForTransition must return a fresh Battle runtime');
  assertNotSame(transitionBattle.playerState, player, 'transition runtime must not write logs/caculate onto the previous PlayerState object');
  assertNotSame(transitionBattle.monster, previousMonster, 'transition runtime must not share the previous monster object');
  assertEqual(battle.turn, 1, 'previous battle turn must not change after a transition tick');
  assertEqual(battle.monsterHp, 100, 'previous battle monsterHp must not change after a transition tick');
  assertEqual(battle.playerState, player, 'previous battle must keep its previous playerState reference');
  assertEqual(player.caculate, 0, 'previous PlayerState caculate must not change after a transition tick');
  assert(!('_logs' in player), 'previous PlayerState must not receive transient battle logs');
  assertEqual(transitionBattle.turn, -1, 'transition battle should still advance turn like AS3 fight');
  assertEqual(transitionBattle.monsterHp, 88, 'transition battle should still apply player damage');
  assertEqual(result.caculate, 1, 'transition result must report the AS3-equivalent incremented tick counter');
  assert(result.logs.length > 0, 'transition result must still expose battle logs');
});

await cleanupTranspileOutput(outRoot);

console.log('Battle state immutability parity checks passed.');
