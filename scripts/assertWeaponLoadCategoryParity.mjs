import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-weapon-load-category-test');

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

try {
  const playerOutRoot = join(outRoot, 'player');
  const playerModule = await importTsModule({
    root,
    outRoot: playerOutRoot,
    entry: join(root, 'src/core/models/Player.ts'),
  });
  const equipmentModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Equipment.js')));
  const weaponModule = await import(pathToFileURL(join(playerOutRoot, 'core/models/Weapon.js')));
  const equipmentDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/equipmentData.js')));
  const constantsModule = await import(pathToFileURL(join(playerOutRoot, 'core/constants.js')));

  const { Equipment } = equipmentModule;
  const { Weapon } = weaponModule;
  const { createInitialPlayerState, updateEquipInfo, getAttMin } = playerModule;
  const { EquipmentList } = equipmentDataModule;
  const { Stat, WeaponCategory } = constantsModule;

  const rangedWeaponData = EquipmentList.find(item => item.category === WeaponCategory.RANGED);
  assert(rangedWeaponData, 'EquipmentList must contain at least one AS3 ranged weapon');

  const originalWeapon = new Weapon(rangedWeaponData, 1);
  originalWeapon.quality = 0;
  originalWeapon.basicStat = originalWeapon.basicStat.filter(stat => stat.name !== Stat.attackMin);

  const loadedWeapon = Equipment.load(originalWeapon.save());
  assertEqual(loadedWeapon.category, WeaponCategory.RANGED, 'Equipment.load() must preserve Weapon.category from WeaponData');

  const initialPlayer = createInitialPlayerState();
  const basePlayer = {
    ...initialPlayer,
    basicStatus: {
      ...initialPlayer.basicStatus,
      str: 30,
      dex: 30,
      intelligence: 0,
      will: 0,
      attack: { min: 0, max: 0 },
    },
    skillStatus: initialPlayer.skillStatus,
    titleStatus: initialPlayer.titleStatus,
    titleMul: initialPlayer.titleMul,
  };

  const meleePlayer = updateEquipInfo({ ...basePlayer, leftHand: null });
  const rangedPlayer = updateEquipInfo({ ...basePlayer, leftHand: loadedWeapon });
  assertEqual(getAttMin(rangedPlayer) - getAttMin(meleePlayer), 10, 'Loaded ranged weapon must keep the AS3 dexterity attack bonus active');

  console.log('Weapon load category parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
