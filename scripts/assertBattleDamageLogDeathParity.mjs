import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-battle-damage-log-death');

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

function createPlayerState({ xp = 0 } = {}) {
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
  const data = {
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
  };
  return {
    mapData: data,
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

const as3Battle = read('../BOE-O/scripts/iData/Battle.as');
const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
const as3PlayerInfoPanel = read('../BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as');
const battleModelSource = read('src/core/models/Battle.ts');
const gameContextSource = read('src/state/GameContext.tsx');
const playerInfoPanelSource = read('src/components/panels/PlayerInfoPanel.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Battle, 'this.monsterAttack();', 'AS3 monsterAttackPlayer must fall back to normal monsterAttack');
assertIncludes(as3Battle, 'this.playerHp -= _loc3_;', 'AS3 monsterAttack reduces Battle.playerHp before death checks');
assertIncludes(as3Battle, 'MainScene.allInfoPanel.addText(this.monster.nameHtml', 'AS3 monsterAttack emits a player-visible damage log');
assertIncludes(as3Battle, "<font color=\\'#ff4040\\'>\" + _loc3_", 'AS3 monsterAttack includes the damage amount in the visible log');
assertIncludes(as3Battle, 'this.changeTurn();', 'AS3 fight performs death checks after turn resolution');
assertIncludes(as3Battle, 'this.playerDie();', 'AS3 checkDead triggers playerDie after playerHp reaches zero');
assertIncludes(as3Player, 'public static function loseExp()', 'AS3 Player.loseExp owns death exp penalty semantics');
assertIncludes(as3PlayerInfoPanel, 'this.hp.Value = MainScene.battle.playerHp;', 'AS3 PlayerInfoPanel displays live Battle.playerHp');
assertIncludes(battleModelSource, 'this.playerHp -= finalDamage;', 'React Battle must reduce live battle playerHp during monsterAttack');
assertIncludes(gameContextSource, 'return withBattlePlayer(newState, playerState);', 'BATTLE_TICK must keep state.player and live battle.playerState synchronized');
assertIncludes(playerInfoPanelSource, 'state.battle?.playerHp', 'React PlayerInfoPanel must display live battle HP while battle is active');

if (packageJson.scripts?.['assert:battle-damage-log-death'] !== 'node scripts/assertBattleDamageLogDeathParity.mjs') {
  throw new Error('package.json must expose assert:battle-damage-log-death');
}

const { Battle } = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});

await withRandom(0.99, async () => {
  const battle = new Battle(createPlayerState(), createMap());
  battle.turn = -1;
  battle.playerHp = 100;
  battle.playerMp = 10;
  battle.monsterHp = 100;
  battle.monster = createMonster({ attack: 12 });

  const result = battle.run();
  const logText = result.logs.map(log => log.text).join('\n');

  assertEqual(battle.playerHp, 90, 'Monster attack should reduce live Battle.playerHp by calculated damage');
  assertEqual(result.playerDied, false, 'Player death must not trigger while HP remains above zero');
  assertMatch(logText, /Test Monster.*你.*10.*伤害/, 'Monster attack should emit same-tick player damage log with attacker, target, and damage');
});

await withRandom(0.99, async () => {
  const battle = new Battle(createPlayerState({ xp: 1000 }), createMap());
  battle.turn = -1;
  battle.playerHp = 10;
  battle.playerMp = 10;
  battle.monsterHp = 100;
  battle.monster = createMonster({ attack: 12 });

  const result = battle.run();
  const logText = result.logs.map(log => log.text).join('\n');
  const damageIndex = logText.indexOf('10');
  const deathIndex = logText.indexOf('击败');

  assertEqual(result.playerDied, true, 'Player death should trigger once live HP reaches zero');
  assert(damageIndex >= 0, 'Death tick should still include the damage amount before death');
  assert(deathIndex >= 0, 'Death tick should include AS3-equivalent defeat log');
  assert(damageIndex < deathIndex, 'Damage log should be emitted before the death log in the same tick');
  assertEqual(battle.playerState.xp, 990, 'Death flow should apply AS3 Player.loseExp one-percent penalty');
});

await cleanupTranspileOutput(outRoot);

console.log('Battle damage log, death flow, and live HP parity checks passed.');
