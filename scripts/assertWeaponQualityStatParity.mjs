import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-weapon-quality-stat-test');

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

function withMockedRandom(values, action) {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    if (index >= values.length) {
      throw new Error(`Unexpected Math.random() call after ${values.length} mocked values`);
    }
    return values[index++];
  };
  try {
    return action();
  } finally {
    Math.random = originalRandom;
  }
}

try {
  const outDir = join(outRoot, 'equipment');
  const weaponModule = await importTsModule({
    root,
    outRoot: outDir,
    entry: join(root, 'src/core/models/Weapon.ts'),
  });
  const equipmentDataModule = await import(pathToFileURL(join(outDir, 'core/data/equipmentData.js')));
  const constantsModule = await import(pathToFileURL(join(outDir, 'core/constants.js')));

  const { Weapon } = weaponModule;
  const { EquipmentList, StatList } = equipmentDataModule;
  const { Stat } = constantsModule;

  assertEqual(StatList[StatList.length - 1].name, Stat.balance, 'AS3 StatList final entry must be balance');

  const weaponData = EquipmentList.find(item => item.category);
  assert(weaponData, 'EquipmentList must contain at least one AS3 weapon');

  const weapon = new Weapon(weaponData, 1);
  weapon.quality = 1;

  const balanceIndexRoll = (StatList.length - 0.25) / StatList.length;
  withMockedRandom([0, balanceIndexRoll, 0, 0], () => {
    weapon.generateQualityStat(1);
  });

  assertEqual(weapon.qualityStat.length, 1, 'Forced one-quality weapon roll must create one quality stat');
  assertEqual(
    weapon.qualityStat[0].name,
    Stat.balance,
    'Weapon quality stat pool must include the AS3 balance entry'
  );

  console.log('Weapon quality stat parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
