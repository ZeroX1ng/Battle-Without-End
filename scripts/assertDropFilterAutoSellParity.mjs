import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-drop-filter-auto-sell');

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

function createConfig(overrides = {}) {
  return {
    battle_toggle: true,
    battleIntro_toggle: true,
    money_toggle: true,
    exp_toggle: true,
    item_toggle: true,
    other_toggle: true,
    item0_toggle: true,
    item1_toggle: true,
    item2_toggle: true,
    item3_toggle: true,
    item4_toggle: true,
    item5_toggle: true,
    sword_toggle: true,
    axe_toggle: true,
    bow_toggle: true,
    crossbow_toggle: true,
    sceptre_toggle: true,
    staff_toggle: true,
    tome_toggle: true,
    shield_toggle: true,
    dagger_toggle: true,
    body_light_toggle: true,
    body_medium_toggle: true,
    body_heavy_toggle: true,
    head_light_toggle: true,
    head_medium_toggle: true,
    head_heavy_toggle: true,
    feet_light_toggle: true,
    feet_medium_toggle: true,
    feet_heavy_toggle: true,
    necklace_toggle: true,
    ring_toggle: true,
    autoSell_toggle: true,
    sound_toggle: true,
    ...overrides,
  };
}

function createPlayerState() {
  const zeroStatus = {
    hp: 0,
    mp: 0,
    str: 0,
    intelligence: 0,
    dex: 0,
    will: 0,
    luck: 0,
    apCost: 0,
    defence: 0,
    protection: 0,
    balance: 0,
    crit: 0,
    crit_mul: 0,
    spellChance: 0,
    protectionIgnore: 0,
    protectionReduce: 0,
    magicDamage: 0,
    attack: { min: 0, max: 0 },
  };

  return {
    basicStatus: { ...zeroStatus, hp: 100 },
    skillStatus: { ...zeroStatus, attack: { min: 0, max: 0 } },
    equipStatus: { ...zeroStatus, attack: { min: 0, max: 0 } },
    apCost: 0,
    BAGMAX: 10,
    PETMAX: 10,
    itemList: [{ name: 'kept-item' }],
    petList: [],
    gold: 3,
    xp: 0,
    lv: 1,
    title: null,
  };
}

const as3Global = read('../BOE-O/scripts/iGlobal/Global.as');
const as3SystemWindow = read('../BOE-O/scripts/iPanel/iScene/iPanel/iWindow/SystemWindow.as');
const as3Monster = read('../BOE-O/scripts/iData/iMonster/Monster.as');
const as3Boss = read('../BOE-O/scripts/iData/iMonster/Boss.as');
const as3Battle = read('../BOE-O/scripts/iData/Battle.as');
const monsterModel = read('src/core/models/Monster.ts');
const battleModel = read('src/core/models/Battle.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Global, 'public static var item2_toggle:Boolean = true;', 'AS3 Global owns quality filter toggles');
assertIncludes(as3SystemWindow, 'Global.item2_toggle = false;', 'AS3 SystemWindow can disable quality filters');
assertIncludes(as3Monster, 'Global["item" + _loc2_.quality + "_toggle"]', 'AS3 Monster.dropItem consumes quality filters');
assertIncludes(as3Monster, 'Player.addMoney(_loc2_.getMoney());', 'AS3 Monster.dropItem converts filtered/rejected drops to gold');
assertIncludes(as3Boss, 'Global["item" + _loc2_.quality + "_toggle"]', 'AS3 Boss.dropItem consumes the same quality filters');
assertIncludes(as3Boss, 'Player.addMoney(_loc2_.getMoney());', 'AS3 Boss.dropItem converts filtered/rejected drops to gold');
assertIncludes(as3Battle, 'this.monster.dropItem();', 'AS3 Battle delegates drop ownership to Monster/Boss');
assertIncludes(monsterModel, 'handleDroppedItem(playerState, drop, config)', 'React Monster/Boss must consume filters through the shared drop handler');
assertIncludes(monsterModel, 'return this.createDroppedItem(playerState, dropRate, config, true);', 'React Boss must reuse the same filtered-drop path');
assertIncludes(battleModel, 'this.monster.dropItem(this.playerState, this.map.mapData.modifier, this.config)', 'React Battle must delegate drops to Monster/Boss with config');
assertIncludes(battleModel, 'result.convertedToGold > 0', 'React Battle must surface filtered-drop gold conversion');

if (packageJson.scripts?.['assert:drop-filter-auto-sell'] !== 'node scripts/assertDropFilterAutoSellParity.mjs') {
  throw new Error('package.json must expose assert:drop-filter-auto-sell');
}

try {
  const systemConfigModule = await importTsModule({
    entry: join(root, 'src/core/systems/SystemConfig.ts'),
    root,
    outRoot: join(root, '.tmp-parity-drop-filter-system-config'),
  });
  const battleModule = await importTsModule({
    entry: join(root, 'src/core/models/Battle.ts'),
    root,
    outRoot,
  });

  const { handleDroppedItem } = systemConfigModule;
  const { Battle } = battleModule;
  const filteredDrop = {
    name: 'sword',
    position: 'body',
    type: 'light',
    quality: 2,
    category: undefined,
    getMoney: () => 25,
    getSellMoney: () => 250,
    getNameHTML: () => '<font color="#4a60d7">Filtered Sword</font>',
  };
  const config = createConfig({ item2_toggle: false });
  const player = createPlayerState();
  const directResult = handleDroppedItem(player, filteredDrop, config);

  assertEqual(directResult.added, false, 'filtered drop is not added directly');
  assertEqual(directResult.convertedToGold, 25, 'filtered drop converts to AS3 base drop money');
  assertEqual(directResult.state.gold, 28, 'filtered drop direct path awards gold');
  assertEqual(directResult.state.itemList.length, 1, 'filtered drop direct path leaves bag unchanged');

  const battle = new Battle(player, { mapData: { modifier: 1, petList: [] } }, config);
  battle.monster = {
    CP: 1,
    dropItem(playerState, mapModifier, receivedConfig) {
      assertEqual(mapModifier, 1, 'Battle forwards map modifier to Monster/Boss dropItem');
      assert(receivedConfig === config, 'Battle forwards restored config to Monster/Boss dropItem');
      const result = handleDroppedItem(playerState, filteredDrop, receivedConfig);
      return {
        playerState: result.state,
        dropped: true,
        added: result.added,
        soldItem: result.soldItem,
        convertedToGold: result.convertedToGold,
        drop: filteredDrop,
      };
    },
    dropPet() {
      return null;
    },
  };

  battle.processDrop();

  assertEqual(battle.playerState.gold, 28, 'Battle filtered-drop path awards converted gold');
  assertEqual(battle.playerState.itemList.length, 1, 'Battle filtered-drop path leaves bag unchanged');
  assertEqual(battle._loot.money, 25, 'Battle loot panel money includes converted filtered drop');
  const moneyLog = battle.playerState._logs?.find((log) => log.category === 'money' && log.text.includes('$25'));
  assert(moneyLog, 'Battle filtered-drop path emits a readable money log');
} finally {
  await cleanupTranspileOutput(outRoot);
  await cleanupTranspileOutput(join(root, '.tmp-parity-drop-filter-system-config'));
}

console.log('Drop filter auto-sell parity checks passed.');
