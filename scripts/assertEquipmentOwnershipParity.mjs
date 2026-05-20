import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-equipment-ownership-test');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual:   ${actual}`);
  }
}

function assertUniqueOwnership(player, label) {
  const owned = [
    player.head,
    player.feet,
    player.body,
    player.necklace,
    player.ring,
    player.leftHand,
    player.rightHand,
    ...player.itemList,
  ].filter(Boolean);
  assertEqual(new Set(owned).size, owned.length, `${label}: equipment object references must not be duplicated`);

  const saveNames = owned.map(item => item.save());
  assertEqual(new Set(saveNames).size, saveNames.length, `${label}: saved equipment entries must not be duplicated`);
}

try {
  const playerOutRoot = join(outRoot, 'player');
  const playerModule = await importTsModule({
    root,
    outRoot: playerOutRoot,
    entry: join(root, 'src/core/models/Player.ts'),
  });
  const weaponModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Weapon.js')));
  const equipmentDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/equipmentData.js')));

  const { createInitialPlayerState, equipItem, unequipItem } = playerModule;
  const { Weapon } = weaponModule;
  const { EquipmentList } = equipmentDataModule;

  const weaponData = EquipmentList.filter(item => item.category && item.position === Weapon.ONEHAND);
  assert(weaponData.length >= 2, 'EquipmentList must contain at least two one-handed weapons for ownership checks');

  const makeWeapon = (index, level = 0) => {
    const weapon = new Weapon(weaponData[index], 1);
    weapon.quality = index + 1;
    weapon.setLevel(level);
    return weapon;
  };

  const weaponA = makeWeapon(0, 1);
  const weaponB = makeWeapon(1, 2);

  let player = {
    ...createInitialPlayerState(),
    itemList: [weaponA, weaponB],
  };

  player = equipItem(player, weaponA);
  assertEqual(player.itemList.length, 1, 'Equipping an inventory weapon must reduce inventory count by 1');
  assert(player.leftHand === weaponA, 'Equipping an inventory weapon must put the same object reference in the slot');
  assert(!player.itemList.includes(weaponA), 'Equipped weapon must no longer remain in inventory');
  assertUniqueOwnership(player, 'after first equip');

  player = equipItem(player, weaponB);
  assert(player.leftHand === weaponB, 'Replacing same-slot equipment must put the new object in the slot');
  assert(!player.itemList.includes(weaponB), 'Replacement weapon must be removed from inventory');
  assertEqual(player.itemList.filter(item => item === weaponA).length, 1, 'Replaced weapon must return to inventory exactly once');
  assertEqual(player.itemList.length, 1, 'Replacing one occupied slot with one inventory item must keep total item count stable');
  assertUniqueOwnership(player, 'after replacement');

  player = unequipItem(player, 'leftHand');
  assertEqual(player.leftHand, null, 'Unequipping must clear the equipment slot');
  assertEqual(player.itemList.filter(item => item === weaponB).length, 1, 'Unequipped weapon must enter inventory exactly once');
  assertEqual(player.itemList.length, 2, 'Unequipping must increase inventory count by 1');
  assertUniqueOwnership(player, 'after unequip');

  const fullBagWeapon = makeWeapon(0, 3);
  const blockedPlayer = {
    ...createInitialPlayerState(),
    BAGMAX: 1,
    leftHand: fullBagWeapon,
    itemList: [makeWeapon(1, 4)],
  };
  const blockedResult = unequipItem(blockedPlayer, 'leftHand');
  assert(blockedResult.leftHand === fullBagWeapon, 'Full inventory must reject unequip without clearing the slot');
  assertEqual(blockedResult.itemList.length, 1, 'Full inventory rejection must not add or drop inventory items');
  assertUniqueOwnership(blockedResult, 'after blocked unequip');

  const fullBagReplaceOld = makeWeapon(0, 5);
  const fullBagReplaceNew = makeWeapon(1, 6);
  const fullBagReplacePlayer = {
    ...createInitialPlayerState(),
    BAGMAX: 1,
    leftHand: fullBagReplaceOld,
    itemList: [fullBagReplaceNew],
  };
  const fullBagReplaceResult = equipItem(fullBagReplacePlayer, fullBagReplaceNew);
  assert(fullBagReplaceResult.leftHand === fullBagReplaceNew, 'Replacing from a full bag must first move the equipped inventory item out of the bag');
  assertEqual(fullBagReplaceResult.itemList.filter(item => item === fullBagReplaceOld).length, 1, 'Full-bag replacement must return the old item exactly once');
  assert(!fullBagReplaceResult.itemList.includes(fullBagReplaceNew), 'Full-bag replacement must not leave the new item in inventory');
  assertEqual(fullBagReplaceResult.itemList.length, 1, 'Full-bag replacement must keep inventory within BAGMAX');
  assertUniqueOwnership(fullBagReplaceResult, 'after full-bag replacement');

  const externalReplaceOld = makeWeapon(0, 7);
  const externalReplaceNew = makeWeapon(1, 8);
  const externalReplaceFiller = makeWeapon(0, 9);
  const externalReplacePlayer = {
    ...createInitialPlayerState(),
    BAGMAX: 1,
    leftHand: externalReplaceOld,
    itemList: [externalReplaceFiller],
  };
  const externalReplaceResult = equipItem(externalReplacePlayer, externalReplaceNew);
  assert(
    externalReplaceResult.leftHand === externalReplaceOld,
    'Full inventory must reject replacement when the incoming equipment is not already in the bag',
  );
  assert(!externalReplaceResult.itemList.includes(externalReplaceNew), 'Rejected replacement must not add the incoming equipment');
  assertEqual(externalReplaceResult.itemList.length, 1, 'Rejected replacement must leave the full bag unchanged');
  assertUniqueOwnership(externalReplaceResult, 'after blocked external replacement');

  console.log('Equipment ownership parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
