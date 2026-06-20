import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { resolveAs3Path } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');
const as3Root = resolveAs3Path('scripts');
const outRoot = join(root, '.tmp-shop-stock-progression-test');

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function readAs3(relativePath) {
  const filePath = join(as3Root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing AS3 source ${relativePath}`);
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

function extractFunction(source, functionName) {
  const startToken = `function ${functionName}`;
  const start = source.indexOf(startToken);
  assert(start >= 0, `Missing function ${functionName}`);
  const bodyStart = source.indexOf('{', start);
  assert(bodyStart >= 0, `Missing body for ${functionName}`);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index++) {
    const char = source[index];
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }
  throw new Error(`Could not parse body for ${functionName}`);
}

function withRandomSequence(values, callback) {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    const value = values[index % values.length];
    index++;
    return value;
  };
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function summarizePower(powerFn, basePowerFn, player) {
  return {
    base: Math.round(basePowerFn(player)),
    stock: Math.round(powerFn.getShopStockPower(player)),
  };
}

function makePlayer({ BasicStatus, createInitialPlayerState, updateEquipInfo, Weapon, EquipmentList, weaponRatio }) {
  const player = createInitialPlayerState();
  player.basicStatus = new BasicStatus(60, 30, 20, 15, 10, 12, 8);
  player.skillStatus = new BasicStatus(0, 0, 0, 0, 0, 0, 0);
  player.apCost = 0;
  player.gold = 1_000_000;
  if (weaponRatio > 0) {
    player.leftHand = new Weapon(EquipmentList[1], weaponRatio, false, 0);
  }
  return updateEquipInfo(player);
}

try {
  const as3ShopPanel = readAs3('iPanel/iScene/iPanel/ShopPanel.as');
  const as3GambleCell = readAs3('iPanel/iScene/iPanel/iShop/GambleCell.as');
  const as3Equipment = readAs3('iData/iItem/Equipment.as');
  const as3Player = readAs3('iGlobal/Player.as');

  assertIncludes(
    as3ShopPanel,
    'Math.random() * 3 * (1 + Player.luck / 400) * (1 + Player.combatPower / 1000)',
    'AS3 sell stock ratio must remain documented as base combatPower driven.'
  );
  assertIncludes(
    as3ShopPanel,
    'Math.random() * 6 * (1 + Player.luck / 200) * (1 + Player.combatPower / 700)',
    'AS3 gamble stock ratio must remain documented as base combatPower driven.'
  );
  assertIncludes(
    as3GambleCell,
    '10000 + Math.random() * 100000 * (1 + Player.combatPower / 700)',
    'AS3 gamble price must remain documented as base combatPower driven.'
  );
  assertIncludes(as3Equipment, 'this.level = 0;', 'AS3 new equipment must still default to level 0.');

  const as3CombatPowerGetter = as3Player.slice(
    as3Player.indexOf('public static function get combatPower'),
    as3Player.indexOf('public static function addItem')
  );
  assertNotIncludes(as3CombatPowerGetter, 'equipStatus', 'AS3 Player.combatPower must not include equipStatus.');

  const playerSource = read('src/core/models/Player.ts');
  const getCombatPowerBody = extractFunction(playerSource, 'getCombatPower');
  assertNotIncludes(getCombatPowerBody, 'equipStatus', 'React getCombatPower must remain AS3 base CP without equipment.');

  const gameContext = read('src/state/GameContext.tsx');
  const generateShopStateBody = extractFunction(gameContext, 'generateShopState');
  assertIncludes(
    generateShopStateBody,
    'getShopStockPower(playerState)',
    'generateShopState must use the shop-only stock power helper.'
  );
  assertIncludes(
    generateShopStateBody,
    'baseCombatPower',
    'generateShopState must keep base combatPower available for AS3 boundary clarity.'
  );

  const helperSource = read('src/core/systems/ShopStockProgression.ts');
  assertIncludes(helperSource, 'getShopStockPower', 'Shop stock progression helper must be explicit and shop-named.');
  assertIncludes(helperSource, 'getCombatPower(playerState)', 'Shop helper must start from AS3 base combatPower.');
  assertIncludes(helperSource, 'getAttMin(playerState)', 'Shop helper must account for equipped offensive strength.');

  const disallowedConsumers = [
    'src/core/models/Battle.ts',
    'src/core/models/Monster.ts',
    'src/core/models/Map.ts',
    'src/core/data/monsterData.ts',
    'src/components/panels/MonsterInfoPanel.tsx',
    'src/components/panels/PlayerInfoPanel.tsx',
    'src/state/selectors.ts',
  ];
  for (const relativePath of disallowedConsumers) {
    assertNotIncludes(read(relativePath), 'getShopStockPower', `${relativePath} must not consume shop stock override power.`);
  }

  const [{ BasicStatus }, playerModel, { EquipmentList }, { Weapon }, shopPower] = await Promise.all([
    importTsModule({
      root,
      outRoot: join(outRoot, 'basic-status'),
      entry: join(root, 'src/core/models/BasicStatus.ts'),
    }),
    importTsModule({
      root,
      outRoot: join(outRoot, 'player'),
      entry: join(root, 'src/core/models/Player.ts'),
    }),
    importTsModule({
      root,
      outRoot: join(outRoot, 'equipment-data'),
      entry: join(root, 'src/core/data/equipmentData.ts'),
    }),
    importTsModule({
      root,
      outRoot: join(outRoot, 'weapon'),
      entry: join(root, 'src/core/models/Weapon.ts'),
    }),
    importTsModule({
      root,
      outRoot: join(outRoot, 'shop-stock'),
      entry: join(root, 'src/core/systems/ShopStockProgression.ts'),
    }),
  ]);

  const lowGrowth = makePlayer({
    BasicStatus,
    createInitialPlayerState: playerModel.createInitialPlayerState,
    updateEquipInfo: playerModel.updateEquipInfo,
    Weapon,
    EquipmentList,
    weaponRatio: 0,
  });
  const highGrowth = withRandomSequence([0.95, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68], () => makePlayer({
    BasicStatus,
    createInitialPlayerState: playerModel.createInitialPlayerState,
    updateEquipInfo: playerModel.updateEquipInfo,
    Weapon,
    EquipmentList,
    weaponRatio: 80,
  }));

  const lowSummary = summarizePower(shopPower, playerModel.getCombatPower, lowGrowth);
  const highSummary = summarizePower(shopPower, playerModel.getCombatPower, highGrowth);

  assert(
    lowSummary.base === highSummary.base,
    `Fixtures should isolate equipment growth from AS3 base CP. low=${lowSummary.base}, high=${highSummary.base}`
  );
  assert(
    highSummary.stock >= lowSummary.stock * 2,
    `High-growth shop stock power should materially exceed low-growth fixture. low=${lowSummary.stock}, high=${highSummary.stock}`
  );

  const lowSellRatio = shopPower.getShopSellRatio({
    random: 0.5,
    luck: playerModel.getLuck(lowGrowth),
    stockPower: lowSummary.stock,
  });
  const highSellRatio = shopPower.getShopSellRatio({
    random: 0.5,
    luck: playerModel.getLuck(highGrowth),
    stockPower: highSummary.stock,
  });
  const lowGambleRatio = shopPower.getShopGambleRatio({
    random: 0.5,
    luck: playerModel.getLuck(lowGrowth),
    stockPower: lowSummary.stock,
  });
  const highGambleRatio = shopPower.getShopGambleRatio({
    random: 0.5,
    luck: playerModel.getLuck(highGrowth),
    stockPower: highSummary.stock,
  });
  const lowGamblePrice = shopPower.getShopGamblePrice({
    random: 0.5,
    stockPower: lowSummary.stock,
  });
  const highGamblePrice = shopPower.getShopGamblePrice({
    random: 0.5,
    stockPower: highSummary.stock,
  });

  assert(highSellRatio > lowSellRatio * 1.5, `Sell stock ratio should grow. low=${lowSellRatio}, high=${highSellRatio}`);
  assert(highGambleRatio > lowGambleRatio * 1.5, `Gamble stock ratio should grow. low=${lowGambleRatio}, high=${highGambleRatio}`);
  assert(highGamblePrice > lowGamblePrice * 1.5, `Gamble price should grow. low=${lowGamblePrice}, high=${highGamblePrice}`);

  console.log('Shop stock progression override checks passed.');
  console.log(`Fixture stock power: low=${lowSummary.stock}, high=${highSummary.stock}`);
  console.log(`Sell ratio @0.5: low=${lowSellRatio.toFixed(2)}, high=${highSellRatio.toFixed(2)}`);
  console.log(`Gamble ratio @0.5: low=${lowGambleRatio.toFixed(2)}, high=${highGambleRatio.toFixed(2)}`);
  console.log(`Gamble price @0.5: low=${lowGamblePrice}, high=${highGamblePrice}`);
} finally {
  await cleanupTranspileOutput(outRoot);
}
