import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-equipment-api-test');

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

const as3QualityColorHex = {
  0: 7631988,
  1: 4962324,
  2: 4874455,
  3: 10921216,
  4: 16740608,
  5: 9978046,
};

try {
  const outDir = join(outRoot, 'equipment-api');
  const equipmentModule = await importTsModule({
    root,
    outRoot: outDir,
    entry: join(root, 'src/core/models/Equipment.ts'),
  });
  const equipmentDataModule = await import(pathToFileURL(join(outDir, 'core/data/equipmentData.js')));

  const { Equipment } = equipmentModule;
  const { EquipmentList } = equipmentDataModule;
  const equipmentData = EquipmentList.find(item => !item.category);
  assert(equipmentData, 'EquipmentList must contain a non-weapon equipment item for API checks');

  for (const [quality, color] of Object.entries(as3QualityColors)) {
    const equipment = new Equipment(equipmentData, 1);
    equipment.quality = Number(quality);
    assertEqual(
      equipment.getColor(),
      color,
      `Equipment.getColor() quality ${quality} must match AS3 Equipment.getColor()`
    );
  }

  for (const [quality, colorHex] of Object.entries(as3QualityColorHex)) {
    const equipment = new Equipment(equipmentData, 1);
    equipment.quality = Number(quality);
    assertEqual(
      equipment.getColorInHex(),
      colorHex,
      `Equipment.getColorInHex() quality ${quality} must match AS3 Equipment.getColorInHex()`
    );
  }

  const saleEquipment = new Equipment(equipmentData, 1);
  saleEquipment.quality = 2;
  saleEquipment.setLevel(3);
  const sellDescription = saleEquipment.getSellDesciption();
  assert(
    sellDescription.includes("<font color='#ff4040'>FOR SALE</font>"),
    'Equipment.getSellDesciption() must include the AS3 FOR SALE banner'
  );
  assert(
    sellDescription.includes(`<p align='right'>$ ${saleEquipment.getSellMoney()}</p>`),
    'Equipment.getSellDesciption() must end with the AS3 sell price instead of base money'
  );
  assert(
    sellDescription.includes(saleEquipment.getNameHTML()) && sellDescription.includes(' +3'),
    'Equipment.getSellDesciption() must preserve AS3 name and level text'
  );

  console.log('Equipment API parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
