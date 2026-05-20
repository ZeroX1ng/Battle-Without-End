import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-quality-color-test');

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

const as3QualityColors = {
  1: '#4BB814',
  2: '#4a60d7',
  3: '#a6a500',
  4: '#ff7100',
  5: '#9840be',
};

try {
  const outDir = join(outRoot, 'equipment');
  const equipmentModule = await importTsModule({
    root,
    outRoot: outDir,
    entry: join(root, 'src/core/models/Equipment.ts'),
  });
  const constantsModule = await import(pathToFileURL(join(outDir, 'core/constants.js')));
  const equipmentDataModule = await import(pathToFileURL(join(outDir, 'core/data/equipmentData.js')));

  const { Equipment } = equipmentModule;
  const { QualityColor } = constantsModule;
  const { EquipmentList } = equipmentDataModule;

  const equipmentData = EquipmentList.find(item => !item.category);
  assert(equipmentData, 'EquipmentList must contain a non-weapon equipment item for color checks');

  for (const [quality, color] of Object.entries(as3QualityColors)) {
    const qualityNumber = Number(quality);
    assertEqual(
      QualityColor[qualityNumber],
      color,
      `QualityColor[${quality}] must match AS3 Equipment.${qualityNumber} color`
    );

    const equipment = new Equipment(equipmentData, 1);
    equipment.quality = qualityNumber;
    assert(
      equipment.getNameHTML().includes(`color='${color}'`),
      `Equipment.getNameHTML() quality ${quality} must use the same AS3 color`
    );
  }

  console.log('Quality color parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
